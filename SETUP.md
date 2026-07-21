# Pendiente de hacer

## Ya hecho

- ✅ Claves de Supabase copiadas y conectadas (`.env.local` local + variables en Vercel).
- ✅ Deploy en Vercel: https://crm-reservas.vercel.app/
- ✅ Migraciones `0001` a `0008` (esquema base, superadmin, registro de dueños, mesas, horarios).
- ✅ Tu cuenta (`javiergsilva98@gmail.com`) creada, vinculada como owner de Asador Gonsastrez y como superadmin.
- ✅ CRM con Reservas, Nueva reserva, Disponibilidad, Mesas, Horarios y Analítica.

## Pendiente ahora — importante, cambia el modelo de datos

### Ejecutar `0009` y `0010`, en ese orden exacto

1. `supabase/migrations/0009_customers.sql` — crea la tabla `customers` (el CRM de clientes de verdad: alergias, dieta, tags, GDPR...) y la función que usa el formulario público para dar de alta/deduplicar clientes sin exponer la tabla entera.
2. `supabase/migrations/0010_reservations_customer_link.sql` — vincula las reservas a `customers`, separa "notas del cliente" de "notas internas", y **migra automáticamente los datos de contacto que ya tenías sueltos en `reservations`** hacia la nueva tabla `customers` (sin perder nada).

**Ejecuta primero `0009` y espera a que termine antes de lanzar `0010`** — el segundo depende de que exista la función del primero.

Después de esto, en el CRM aparece una pestaña nueva **Clientes** con el listado y la ficha de cada uno (editable: alergias, dieta, tags, notas privadas, GDPR marketing) y el historial de reservas de cada cliente.

---

**Aviso plan gratuito (recordatorio):** Vercel Hobby es para uso no comercial (vale para desarrollo/demo); Supabase Free pausa el proyecto tras ~7 días sin actividad. Nada urgente, solo que quede anotado antes de vender esto de verdad.
