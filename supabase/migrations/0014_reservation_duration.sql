-- Duración media de una reserva (usada para calcular el último turno
-- reservable online antes del cierre y los huecos de media hora del
-- formulario público).
alter table restaurants
  add column reservation_duration_minutes int not null default 120
    check (reservation_duration_minutes > 0);
