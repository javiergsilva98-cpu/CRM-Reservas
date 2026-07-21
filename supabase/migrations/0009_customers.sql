-- Clientes del restaurante (CRM), separados de las reservas
create table customers (
  id                  uuid primary key default gen_random_uuid(),
  restaurant_id       uuid not null references restaurants(id) on delete cascade,
  first_name          text not null,
  last_name           text,
  phone               text,
  email               text,
  language            text not null default 'es',
  gdpr_marketing      boolean not null default false,
  gdpr_consent_at     timestamptz,
  birthday            date,
  allergies           text[] not null default '{}',
  diet                text[] not null default '{}',
  preferences         jsonb,
  notes               text,
  tags                text[] not null default '{}',
  company             text,
  acquisition_channel text,
  no_show_count       int not null default 0,
  cancel_count        int not null default 0,
  visits_count        int not null default 0,
  total_spent         numeric not null default 0,
  last_visit_at       timestamptz,
  created_at          timestamptz not null default now()
);

create unique index customers_restaurant_phone
  on customers (restaurant_id, phone) where phone is not null;
create unique index customers_restaurant_email
  on customers (restaurant_id, email) where email is not null;

alter table customers enable row level security;

-- Nadie público puede leer/escribir esta tabla directamente: solo staff del
-- restaurante o superadmins. El alta desde el flujo público de reserva pasa
-- por la función find_or_create_customer (security definer) de abajo.
create policy "staff and platform admins can view customers"
  on customers for select
  using (is_staff_of(restaurant_id) or is_platform_admin());

create policy "staff and platform admins can update customers"
  on customers for update
  using (is_staff_of(restaurant_id) or is_platform_admin());

create policy "staff and platform admins can insert customers"
  on customers for insert
  with check (is_staff_of(restaurant_id) or is_platform_admin());

-- Alta/deduplicación desde el flujo público (anónimo o staff): busca por
-- teléfono, si no por email, y si no existe lo crea. No expone el resto de
-- la tabla — solo devuelve el id.
create or replace function find_or_create_customer(
  p_restaurant_id uuid,
  p_first_name text,
  p_phone text,
  p_email text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_phone is not null then
    select id into v_id from customers
      where restaurant_id = p_restaurant_id and phone = p_phone;
  end if;

  if v_id is null and p_email is not null then
    select id into v_id from customers
      where restaurant_id = p_restaurant_id and email = p_email;
  end if;

  if v_id is null then
    insert into customers (restaurant_id, first_name, phone, email)
    values (p_restaurant_id, p_first_name, p_phone, p_email)
    returning id into v_id;
  end if;

  return v_id;
end;
$$;

grant execute on function find_or_create_customer(uuid, text, text, text)
  to anon, authenticated;
