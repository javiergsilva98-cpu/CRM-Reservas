-- Email autorizado a "reclamar" (auto-vincularse como owner) un restaurante.
-- Lo fija el superadmin al crear el restaurante.
alter table restaurants add column owner_email text;

update restaurants
set owner_email = 'javiergsilva98@gmail.com'
where slug = 'asador-gonsastrez';

-- Permite que un usuario recién registrado (email + contraseña) se vincule
-- a sí mismo como owner de un restaurante, solo si:
--   1) su email coincide con el owner_email fijado por el superadmin, y
--   2) ese restaurante todavía no tiene ningún owner/staff (nadie lo reclamó ya)
create policy "invited owner can self-register"
  on restaurant_users for insert
  with check (
    user_id = auth.uid()
    and role = 'owner'
    and not exists (
      select 1 from restaurant_users ru2
      where ru2.restaurant_id = restaurant_users.restaurant_id
    )
    and exists (
      select 1 from restaurants r
      where r.id = restaurant_users.restaurant_id
        and r.owner_email = auth.email()
    )
  );
