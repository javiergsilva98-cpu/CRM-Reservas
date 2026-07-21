-- Superadmins de la plataforma (distinto de restaurant_users, que son
-- dueños/staff de UN restaurante concreto)
create table platform_admins (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);

alter table platform_admins enable row level security;

create policy "platform admin can view own record"
  on platform_admins for select
  using (user_id = auth.uid());

-- Los superadmins ven todos los restaurantes (activos e inactivos),
-- no solo los activos que ya ve el público
create policy "platform admins can view all restaurants"
  on restaurants for select
  using (
    exists (
      select 1 from platform_admins
      where platform_admins.user_id = auth.uid()
    )
  );

create policy "platform admins can create restaurants"
  on restaurants for insert
  with check (
    exists (
      select 1 from platform_admins
      where platform_admins.user_id = auth.uid()
    )
  );

create policy "platform admins can update any restaurant"
  on restaurants for update
  using (
    exists (
      select 1 from platform_admins
      where platform_admins.user_id = auth.uid()
    )
  );

-- Requiere que el usuario ya exista en Authentication > Users
insert into platform_admins (user_id)
select id from auth.users where email = 'javiergsilva98@gmail.com';
