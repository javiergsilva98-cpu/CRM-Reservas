## Migraciones SQL

Cada cambio de base de datos vive aquí como un archivo numerado (`0001_...`, `0002_...`, en orden). Se ejecutan a mano en el **SQL Editor** de Supabase (Dashboard del proyecto → SQL Editor → New query → pegar → Run).

No hay ejecución automática todavía: cuando aparezca un archivo nuevo aquí, hay que copiarlo y lanzarlo manualmente en Supabase, y marcarlo como aplicado en la tabla de abajo.

### Estado

| Archivo | Descripción | Aplicado |
|---|---|---|
| `0001_initial_schema.sql` | Tablas `restaurants`, `restaurant_users`, `reservations` + RLS | ✅ 2026-07-20 |
| `0002_seed_restaurant.sql` | Alta de Asador Gonsastrez | ✅ 2026-07-20 |
| `0003_link_owner.sql` | Vincula el usuario owner a Asador Gonsastrez | ⚠️ obsoleta, ver `0005` |
| `0004_platform_admins.sql` | Tabla de superadmins de la plataforma + acceso total a `restaurants` | ✅ 2026-07-21 (tabla creada; pendiente confirmar que el insert vinculó al usuario) |
| `0005_owner_signup.sql` | Columna `owner_email` + auto-registro de dueños (email+contraseña) | ✅ 2026-07-21 |
| `0006_platform_admin_reservations.sql` | Los superadmins ven/gestionan reservas de cualquier restaurante | ✅ 2026-07-21 |
| `0007_tables.sql` | Funciones `is_platform_admin`/`is_staff_of` + tabla `restaurant_tables` (mesas) | ✅ 2026-07-21 |
| `0008_hours.sql` | Tabla `restaurant_hours` (horario de apertura por día) | ✅ 2026-07-21 |
| `0009_customers.sql` | Tabla `customers` (CRM) + función `find_or_create_customer` | ✅ 2026-07-21 |
| `0010_reservations_customer_link.sql` | Vincula `reservations.customer_id`, separa notas cliente/internas, migra datos de contacto existentes a `customers` | ✅ 2026-07-21 |
| `0011_sala.sql` | Añade `zone`/`position_x`/`position_y` a `restaurant_tables` y `table_id` a `reservations`, para el plano visual de sala | ✅ 2026-07-21 |
| `0012_rooms_and_layout_presets.sql` | `restaurant_rooms` (hasta 3 salas, sustituye `zone`), `restaurant_layout_presets`/`_preset_tables` (hasta 3 plantillas) y `restaurant_layout_schedule` (asignación por día de la semana o rango de fechas) | ✅ 2026-07-21 |
| `0013_seed_contact_info.sql` | Dirección y teléfono de ejemplo (placeholder) para Asador Gonsastrez, para que aparezcan al final de la landing | ✅ 2026-07-21 |
| `0014_reservation_duration.sql` | Columna `restaurants.reservation_duration_minutes` (duración media de una reserva), usada para calcular el último hueco reservable online | ⏳ pendiente |
