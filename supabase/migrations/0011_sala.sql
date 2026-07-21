-- Plano de sala: posición visual de cada mesa y asignación de mesa a reserva.

alter table restaurant_tables add column zone text;
alter table restaurant_tables add column position_x numeric;
alter table restaurant_tables add column position_y numeric;

alter table reservations
  add column table_id uuid references restaurant_tables(id) on delete set null;

create index reservations_table_id_idx on reservations (table_id);
