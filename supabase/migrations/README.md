## Migraciones SQL

Cada cambio de base de datos vive aquí como un archivo numerado (`0001_...`, `0002_...`, en orden). Se ejecutan a mano en el **SQL Editor** de Supabase (Dashboard del proyecto → SQL Editor → New query → pegar → Run).

No hay ejecución automática todavía: cuando aparezca un archivo nuevo aquí, hay que copiarlo y lanzarlo manualmente en Supabase, y marcarlo como aplicado en la tabla de abajo.

### Estado

| Archivo | Descripción | Aplicado |
|---|---|---|
| `0001_initial_schema.sql` | Tablas `restaurants`, `restaurant_users`, `reservations` + RLS | ✅ 2026-07-20 |
| `0002_seed_restaurant.sql` | Alta de Asador Gonsastrez | ✅ 2026-07-20 |
| `0003_link_owner.sql` | Vincula el usuario owner a Asador Gonsastrez | ⏳ pendiente (crear el usuario en Auth antes de ejecutar) |
