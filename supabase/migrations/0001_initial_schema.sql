-- Extensión para generar UUIDs
create extension if not exists "pgcrypto";

-- Tabla de restaurantes (tenants)
create table restaurants (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  timezone    text not null default 'Europe/Madrid',
  phone       text,
  email       text,
  address     text,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Vincula usuarios de Supabase Auth con "su" restaurante
create table restaurant_users (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  role          text not null default 'owner' check (role in ('owner', 'staff')),
  created_at    timestamptz not null default now(),
  unique (restaurant_id, user_id)
);

-- Reservas
create table reservations (
  id                uuid primary key default gen_random_uuid(),
  restaurant_id     uuid not null references restaurants(id) on delete cascade,
  customer_name     text not null,
  customer_email    text,
  customer_phone    text,
  party_size        int not null check (party_size > 0),
  reservation_date  date not null,
  reservation_time  time not null,
  status            text not null default 'pending'
                       check (status in ('pending','confirmed','cancelled','seated','no_show')),
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index reservations_restaurant_date_idx
  on reservations (restaurant_id, reservation_date);

-- Mantener updated_at al día
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger reservations_set_updated_at
  before update on reservations
  for each row execute function set_updated_at();

-- === Row Level Security ===

alter table restaurants enable row level security;
alter table restaurant_users enable row level security;
alter table reservations enable row level security;

-- restaurants: cualquiera puede ver restaurantes activos (para la landing pública)
create policy "public can view active restaurants"
  on restaurants for select
  using (active = true);

-- restaurants: el owner puede actualizar su propio restaurante
create policy "owner can update own restaurant"
  on restaurants for update
  using (
    exists (
      select 1 from restaurant_users
      where restaurant_users.restaurant_id = restaurants.id
        and restaurant_users.user_id = auth.uid()
        and restaurant_users.role = 'owner'
    )
  );

-- restaurant_users: cada usuario solo ve su propia fila
create policy "user can view own membership"
  on restaurant_users for select
  using (user_id = auth.uid());

-- reservations: cualquiera (incluso anónimo) puede crear una reserva
-- para un restaurante que exista y esté activo (formulario público)
create policy "public can create reservations"
  on reservations for insert
  with check (
    exists (
      select 1 from restaurants
      where restaurants.id = reservations.restaurant_id
        and restaurants.active = true
    )
  );

-- reservations: solo el personal del restaurante puede leerlas
create policy "staff can view own restaurant reservations"
  on reservations for select
  using (
    exists (
      select 1 from restaurant_users
      where restaurant_users.restaurant_id = reservations.restaurant_id
        and restaurant_users.user_id = auth.uid()
    )
  );

-- reservations: solo el personal del restaurante puede actualizarlas (cambiar estado, notas, etc.)
create policy "staff can update own restaurant reservations"
  on reservations for update
  using (
    exists (
      select 1 from restaurant_users
      where restaurant_users.restaurant_id = reservations.restaurant_id
        and restaurant_users.user_id = auth.uid()
    )
  );
