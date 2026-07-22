-- Autoservicio del cliente: consultar, modificar o cancelar su propia
-- reserva desde una página pública, identificándose con teléfono + fecha
-- de la reserva (sin enlace exclusivo ni email/SMS). Igual que
-- find_or_create_customer, son funciones security definer que no exponen
-- el resto de las tablas: solo devuelven/tocan la reserva que coincide con
-- el teléfono indicado.

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
begin
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

create or replace function cancel_own_reservation(
  p_reservation_id uuid,
  p_phone text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  update reservations r
  set status = 'cancelled'
  from customers c
  where r.id = p_reservation_id
    and r.customer_id = c.id
    and c.phone = p_phone
    and r.status not in ('cancelled', 'seated', 'no_show')
    and r.reservation_date >= current_date;

  get diagnostics v_count = row_count;
  if v_count = 0 then
    raise exception 'No hemos encontrado esa reserva con ese teléfono, o ya no se puede cancelar.';
  end if;
end;
$$;

grant execute on function cancel_own_reservation(uuid, text) to anon, authenticated;

create or replace function modify_own_reservation(
  p_reservation_id uuid,
  p_phone text,
  p_reservation_date date,
  p_reservation_time time,
  p_party_size int
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  update reservations r
  set
    reservation_date = p_reservation_date,
    reservation_time = p_reservation_time,
    party_size = p_party_size,
    table_id = null
  from customers c
  where r.id = p_reservation_id
    and r.customer_id = c.id
    and c.phone = p_phone
    and r.status not in ('cancelled', 'seated', 'no_show')
    and r.reservation_date >= current_date
    and p_reservation_date >= current_date;

  get diagnostics v_count = row_count;
  if v_count = 0 then
    raise exception 'No hemos encontrado esa reserva con ese teléfono, o ya no se puede modificar.';
  end if;
end;
$$;

grant execute on function modify_own_reservation(uuid, text, date, time, int) to anon, authenticated;
