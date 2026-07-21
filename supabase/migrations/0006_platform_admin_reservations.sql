-- Los superadmins (tabla platform_admins) pueden ver y gestionar las
-- reservas de CUALQUIER restaurante, no solo del que tengan vinculado
-- como owner/staff en restaurant_users. Útil para soporte y para que tu
-- cuenta de superadmin siempre tenga acceso al CRM de cualquier restaurante.
create policy "platform admins can view all reservations"
  on reservations for select
  using (
    exists (
      select 1 from platform_admins
      where platform_admins.user_id = auth.uid()
    )
  );

create policy "platform admins can update all reservations"
  on reservations for update
  using (
    exists (
      select 1 from platform_admins
      where platform_admins.user_id = auth.uid()
    )
  );
