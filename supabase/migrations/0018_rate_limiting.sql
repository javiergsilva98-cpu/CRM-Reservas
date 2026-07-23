-- Protección básica contra abuso en los flujos públicos, aplicada en base
-- de datos para que no se pueda saltar llamando directamente a la API REST
-- (el honeypot/tiempo del formulario solo protege el frontend).

-- 1) Límite de reservas seguidas del mismo cliente en el mismo restaurante:
-- evita que un script rellene el dashboard de reservas falsas.
create or replace function limit_reservation_rate()
returns trigger
language plpgsql
as $$
declare
  v_count int;
begin
  select count(*) into v_count
    from reservations
    where customer_id = new.customer_id
      and restaurant_id = new.restaurant_id
      and created_at > now() - interval '15 minutes';

  if v_count >= 3 then
    raise exception 'Demasiadas reservas seguidas. Espera unos minutos o llama al restaurante.';
  end if;

  return new;
end;
$$;

create trigger reservations_rate_limit
  before insert on reservations
  for each row execute function limit_reservation_rate();

-- 2) Límite de intentos de búsqueda en la autogestión de reservas: evita
-- probar teléfonos/fechas al azar para curiosear reservas ajenas.
create table reservation_lookup_attempts (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  phone         text not null,
  created_at    timestamptz not null default now()
);

create index reservation_lookup_attempts_idx
  on reservation_lookup_attempts (restaurant_id, phone, created_at);

alter table reservation_lookup_attempts enable row level security;
-- Sin políticas: nadie puede leer/escribir esta tabla directamente, solo la
-- función security definer de abajo (igual que find_or_create_customer).

create or replace function find_own_reservations(
  p_restaurant_id uuid,
  p_phone text,
  p_reservation_date date
)
returns table (
  id uuid,
  party_size int,
  reservation_date date,
  reservation_time time,
  status text,
  customer_notes text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_recent_attempts int;
begin
  select count(*) into v_recent_attempts
    from reservation_lookup_attempts
    where restaurant_id = p_restaurant_id
      and phone = p_phone
      and created_at > now() - interval '15 minutes';

  if v_recent_attempts >= 10 then
    raise exception 'Demasiados intentos. Espera unos minutos y vuelve a intentarlo.';
  end if;

  insert into reservation_lookup_attempts (restaurant_id, phone)
  values (p_restaurant_id, p_phone);

  return query
    select r.id, r.party_size, r.reservation_date, r.reservation_time, r.status, r.customer_notes
    from reservations r
    join customers c on c.id = r.customer_id
    where r.restaurant_id = p_restaurant_id
      and c.phone = p_phone
      and r.reservation_date = p_reservation_date
      and r.reservation_date >= current_date
      and r.status <> 'cancelled'
    order by r.reservation_time;
end;
$$;

grant execute on function find_own_reservations(uuid, text, date) to anon, authenticated;
