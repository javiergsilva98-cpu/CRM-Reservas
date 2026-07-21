-- Vincula reservations a customers y separa notas de cliente vs internas.
-- Migra los datos de contacto que hoy viven sueltos en reservations hacia
-- customers (deduplicando por teléfono, luego por email).

alter table reservations add column customer_id uuid references customers(id);
alter table reservations add column internal_notes text;
alter table reservations rename column notes to customer_notes;

-- Columna temporal solo para poder correlacionar el alta masiva de clientes
-- con las reservas que la originaron; se elimina al final de este archivo.
alter table customers add column _migration_key text;

with keyed as (
  select
    id as reservation_id,
    restaurant_id,
    customer_name,
    customer_phone,
    customer_email,
    created_at,
    coalesce(customer_phone, customer_email, 'resid:' || id::text) as dedup_key
  from reservations
),
first_per_key as (
  select distinct on (restaurant_id, dedup_key)
    restaurant_id, dedup_key, customer_name, customer_phone, customer_email
  from keyed
  order by restaurant_id, dedup_key, created_at asc
)
insert into customers (restaurant_id, first_name, phone, email, _migration_key)
select restaurant_id, customer_name, customer_phone, customer_email, dedup_key
from first_per_key;

update reservations r
set customer_id = c.id
from customers c
where c._migration_key = coalesce(r.customer_phone, r.customer_email, 'resid:' || r.id::text)
  and c.restaurant_id = r.restaurant_id;

alter table customers drop column _migration_key;

alter table reservations alter column customer_id set not null;
alter table reservations drop column customer_name;
alter table reservations drop column customer_phone;
alter table reservations drop column customer_email;
