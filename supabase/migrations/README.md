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
| `0007_tables.sql` | Funciones `is_platform_admin`/`is_staff_of` + tabla `restaurant_tables` (mesas) | ⏳ pendiente |
| `0008_hours.sql` | Tabla `restaurant_hours` (horario de apertura por día) | ⏳ pendiente |
