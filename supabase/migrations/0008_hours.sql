-- Horario de apertura por día de la semana (0 = domingo ... 6 = sábado)
create table restaurant_hours (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  day_of_week   int not null check (day_of_week between 0 and 6),
  open_time     time,
  close_time    time,
  closed        boolean not null default false,
  unique (restaurant_id, day_of_week)
);

alter table restaurant_hours enable row level security;

-- Público: útil para mostrar el horario en la landing más adelante
create policy "public can view hours"
  on restaurant_hours for select
  using (true);

create policy "staff and platform admins can insert hours"
  on restaurant_hours for insert
  with check (is_staff_of(restaurant_id) or is_platform_admin());

create policy "staff and platform admins can update hours"
  on restaurant_hours for update
  using (is_staff_of(restaurant_id) or is_platform_admin());

create policy "staff and platform admins can delete hours"
  on restaurant_hours for delete
  using (is_staff_of(restaurant_id) or is_platform_admin());
