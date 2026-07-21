# Pendiente de hacer

## Ya hecho

- ✅ Claves de Supabase copiadas y conectadas (`.env.local` local + variables en Vercel).
- ✅ Deploy en Vercel: https://crm-reservas.vercel.app/
- ✅ Migraciones `0001` a `0006` (esquema base, superadmin, registro de dueños con contraseña).
- ✅ Tu cuenta (`javiergsilva98@gmail.com`) creada, vinculada como owner de Asador Gonsastrez y como superadmin.

## Pendiente ahora

### Ejecutar las migraciones `0007` y `0008`

En el SQL Editor de Supabase, pega y ejecuta (en este orden):

1. `supabase/migrations/0007_tables.sql` — añade la tabla de mesas (`restaurant_tables`) y unas funciones de ayuda para las políticas de seguridad.
2. `supabase/migrations/0008_hours.sql` — añade la tabla de horarios de apertura (`restaurant_hours`).

Después de eso, ya deberías poder usar dentro del CRM (`https://crm-reservas.vercel.app/asador-gonsastrez/crm`):

- **Mesas**: dar de alta las mesas del restaurante y su capacidad.
- **Horarios**: configurar qué días abre y en qué horario.
- **+ Nueva reserva**: añadir a mano una reserva recibida por teléfono u otra vía.
- **Disponibilidad**: ver aforo total vs reservado para los próximos 14 días.
- **Analítica**: gráfico de reservas por día (últimos 30 días).

---

**Aviso plan gratuito (recordatorio):** Vercel Hobby es para uso no comercial (vale para desarrollo/demo); Supabase Free pausa el proyecto tras ~7 días sin actividad. Nada urgente, solo que quede anotado antes de vender esto de verdad.
