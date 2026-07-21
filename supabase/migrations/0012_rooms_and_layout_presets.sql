-- Salas (hasta 3 por restaurante) y plantillas de configuración de mesas,
-- asignables por día de la semana o por rango de fechas.

create table restaurant_rooms (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name          text not null,
  created_at    timestamptz not null default now()
);

alter table restaurant_rooms enable row level security;

create policy "staff and platform admins can view rooms"
  on restaurant_rooms for select
  using (is_staff_of(restaurant_id) or is_platform_admin());
create policy "staff and platform admins can insert rooms"
  on restaurant_rooms for insert
  with check (is_staff_of(restaurant_id) or is_platform_admin());
create policy "staff and platform admins can update rooms"
  on restaurant_rooms for update
  using (is_staff_of(restaurant_id) or is_platform_admin());
create policy "staff and platform admins can delete rooms"
  on restaurant_rooms for delete
  using (is_staff_of(restaurant_id) or is_platform_admin());

create function enforce_max_rooms()
returns trigger language plpgsql as $$
begin
  if (select count(*) from restaurant_rooms where restaurant_id = new.restaurant_id) >= 3 then
    raise exception 'Un restaurante no puede tener más de 3 salas';
  end if;
  return new;
end;
$$;

create trigger restaurant_rooms_max_3
  before insert on restaurant_rooms
  for each row execute function enforce_max_rooms();

-- La "zona" de texto libre pasa a ser una sala real.
alter table restaurant_tables add column room_id uuid references restaurant_rooms(id) on delete set null;

do $$
declare
  z record;
  new_room_id uuid;
begin
  for z in select distinct restaurant_id, zone from restaurant_tables where zone is not null and zone <> ''
  loop
    insert into restaurant_rooms (restaurant_id, name)
    values (z.restaurant_id, z.zone)
    returning id into new_room_id;

    update restaurant_tables
      set room_id = new_room_id
      where restaurant_id = z.restaurant_id and zone = z.zone;
  end loop;
end $$;

alter table restaurant_tables drop column zone;

-- Plantillas de configuración de sala. name is null para las que se crean
-- como excepción "solo para estos días" (no cuentan en el límite de 3).
create table restaurant_layout_presets (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name          text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table restaurant_layout_presets enable row level security;

create policy "staff and platform admins can view presets"
  on restaurant_layout_presets for select
  using (is_staff_of(restaurant_id) or is_platform_admin());
create policy "staff and platform admins can insert presets"
  on restaurant_layout_presets for insert
  with check (is_staff_of(restaurant_id) or is_platform_admin());
create policy "staff and platform admins can update presets"
  on restaurant_layout_presets for update
  using (is_staff_of(restaurant_id) or is_platform_admin());
create policy "staff and platform admins can delete presets"
  on restaurant_layout_presets for delete
  using (is_staff_of(restaurant_id) or is_platform_admin());

create function enforce_max_named_presets()
returns trigger language plpgsql as $$
begin
  if new.name is not null and (
    select count(*) from restaurant_layout_presets
    where restaurant_id = new.restaurant_id and name is not null
  ) >= 3 then
    raise exception 'Un restaurante no puede tener más de 3 plantillas';
  end if;
  return new;
end;
$$;

create trigger restaurant_layout_presets_max_3
  before insert on restaurant_layout_presets
  for each row execute function enforce_max_named_presets();

-- Snapshot por mesa de cada plantilla: qué mesas están activas, dónde están
-- y en qué sala, para ese conjunto concreto de días.
create table restaurant_layout_preset_tables (
  id          uuid primary key default gen_random_uuid(),
  preset_id   uuid not null references restaurant_layout_presets(id) on delete cascade,
  table_id    uuid not null references restaurant_tables(id) on delete cascade,
  active      boolean not null default true,
  position_x  numeric,
  position_y  numeric,
  room_id     uuid references restaurant_rooms(id) on delete set null,
  unique (preset_id, table_id)
);

alter table restaurant_layout_preset_tables enable row level security;

create policy "staff and platform admins can view preset tables"
  on restaurant_layout_preset_tables for select
  using (exists (
    select 1 from restaurant_layout_presets p
    where p.id = preset_id and (is_staff_of(p.restaurant_id) or is_platform_admin())
  ));
create policy "staff and platform admins can insert preset tables"
  on restaurant_layout_preset_tables for insert
  with check (exists (
    select 1 from restaurant_layout_presets p
    where p.id = preset_id and (is_staff_of(p.restaurant_id) or is_platform_admin())
  ));
create policy "staff and platform admins can update preset tables"
  on restaurant_layout_preset_tables for update
  using (exists (
    select 1 from restaurant_layout_presets p
    where p.id = preset_id and (is_staff_of(p.restaurant_id) or is_platform_admin())
  ));
create policy "staff and platform admins can delete preset tables"
  on restaurant_layout_preset_tables for delete
  using (exists (
    select 1 from restaurant_layout_presets p
    where p.id = preset_id and (is_staff_of(p.restaurant_id) or is_platform_admin())
  ));

-- Calendario: qué plantilla aplica cada día de la semana (recurrente) o en
-- un rango de fechas concreto (para excepciones puntuales o temporadas).
create table restaurant_layout_schedule (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  preset_id     uuid not null references restaurant_layout_presets(id) on delete cascade,
  day_of_week   int check (day_of_week between 0 and 6),
  date_start    date,
  date_end      date,
  created_at    timestamptz not null default now(),
  check (
    (day_of_week is not null and date_start is null and date_end is null)
    or (day_of_week is null and date_start is not null and date_end is not null)
  )
);

create unique index restaurant_layout_schedule_dow_unique
  on restaurant_layout_schedule (restaurant_id, day_of_week)
  where day_of_week is not null;

alter table restaurant_layout_schedule enable row level security;

create policy "staff and platform admins can view schedule"
  on restaurant_layout_schedule for select
  using (is_staff_of(restaurant_id) or is_platform_admin());
create policy "staff and platform admins can insert schedule"
  on restaurant_layout_schedule for insert
  with check (is_staff_of(restaurant_id) or is_platform_admin());
create policy "staff and platform admins can update schedule"
  on restaurant_layout_schedule for update
  using (is_staff_of(restaurant_id) or is_platform_admin());
create policy "staff and platform admins can delete schedule"
  on restaurant_layout_schedule for delete
  using (is_staff_of(restaurant_id) or is_platform_admin());
