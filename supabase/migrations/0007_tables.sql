-- Funciones de ayuda para no repetir el mismo EXISTS en cada política
create or replace function is_platform_admin()
returns boolean language sql stable as $$
  select exists (
    select 1 from platform_admins where user_id = auth.uid()
  )
$$;

create or replace function is_staff_of(rid uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from restaurant_users
    where restaurant_id = rid and user_id = auth.uid()
  )
$$;

-- Mesas del restaurante
create table restaurant_tables (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name          text not null,
  capacity      int not null check (capacity > 0),
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

alter table restaurant_tables enable row level security;

create policy "staff and platform admins can view tables"
  on restaurant_tables for select
  using (is_staff_of(restaurant_id) or is_platform_admin());

create policy "staff and platform admins can insert tables"
  on restaurant_tables for insert
  with check (is_staff_of(restaurant_id) or is_platform_admin());

create policy "staff and platform admins can update tables"
  on restaurant_tables for update
  using (is_staff_of(restaurant_id) or is_platform_admin());

create policy "staff and platform admins can delete tables"
  on restaurant_tables for delete
  using (is_staff_of(restaurant_id) or is_platform_admin());
