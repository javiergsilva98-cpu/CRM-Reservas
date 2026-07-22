# Pendiente de hacer

## Ya hecho

- ✅ Claves de Supabase copiadas y conectadas (`.env.local` local + variables en Vercel).
- ✅ Deploy en Vercel: https://crm-reservas.vercel.app/
- ✅ Migraciones `0001` a `0008` (esquema base, superadmin, registro de dueños, mesas, horarios).
- ✅ Tu cuenta (`javiergsilva98@gmail.com`) creada, vinculada como owner de Asador Gonsastrez y como superadmin.
- ✅ CRM con Reservas, Nueva reserva, Disponibilidad, Mesas, Horarios y Analítica.
- ✅ Migraciones `0009` y `0010`: `customers` como entidad propia del CRM (alergias, dieta, tags, GDPR, historial de reservas), separada de `reservations`.
- ✅ Migración `0011` y pestaña **Sala**: plano visual de mesas (arrastrar para colocar, zonas, estado libre/reservada/ocupada) y asignación de reservas a mesa concreta.
- ✅ Migración `0012`: Mesas fusionado en Sala, hasta 3 salas nombrables, hasta 3 plantillas de disposición asignables por día de la semana o rango de fechas.
- ✅ Migración `0013`: dirección y teléfono de ejemplo (placeholder) para Asador Gonsastrez.
- ✅ Rediseño del formulario público de reserva como acordeón (comensales, fecha/hora, datos) y del carrusel "Recomendados" con parallax en la landing.
- ✅ Migración `0014`: duración media de una reserva + huecos de 30 min en el formulario público calculados con el horario real.
- ✅ Auditoría de rendimiento: code-splitting por ruta (CRM y landing ya no comparten un único bundle de 500kB+), fotos de platos a WebP (~60% menos peso), `lang="es"`, meta description/Open Graph, preconnect a Supabase, `tel:`/Google Maps en el contacto, pantallas de carga/error con estilo, ErrorBoundary global, limpieza de assets sin usar.
- ✅ Meta tags por restaurante: función edge de Vercel (`api/meta.ts`) que sirve title/description/Open Graph específicos de cada restaurante (según su slug), en vez de los valores fijos de Asador Gonsastrez para todo el sitio. Migración `0015` ejecutada.
- ✅ Paginación de clientes en el CRM: selector de 25/50/100 por página + navegación anterior/siguiente.
- ✅ Sala: al añadir una mesa en modo edición aparece al instante en el plano (antes había que salir y reentrar en modo edición para verla y poder colocarla).
- ✅ Sala: no se puede asignar una mesa a una reserva si ya tiene otra reserva activa en un horario que se solapa (según la duración media de una comida); antes no había ningún aviso ni bloqueo.
- ✅ Sala: aviso "⚠ ninguna mesa individual llega a Np" en la lista de reservas sin mesa, cuando el grupo es más grande que cualquier mesa activa configurada (para unir mesas o llamar al cliente).
- ✅ Sala: botón "Confirmar llegada" en el panel de la mesa activa, para que el metre marque la asistencia sin pasar por el desplegable de estado del Dashboard.
- ✅ Dashboard: aviso ⚠ en "Personas" cuando una reserva pendiente/confirmada supera el aforo de cualquier mesa activa (se acepta igualmente, para que el restaurante llame y decida cómo acomodarla).
- ✅ Página pública `/:slug/reservar/gestionar`: el cliente busca su reserva con teléfono + fecha (sin enlace exclusivo ni email/SMS) y puede cancelarla o cambiar fecha/hora/personas. Enlazada desde la pantalla de "reserva enviada" y desde el propio formulario.

## Pendiente ahora

### Ejecutar `0014_reservation_duration.sql`

Añade `restaurants.reservation_duration_minutes` (por defecto 120). Se usa para calcular, junto con el horario de cada día (pestaña **Horarios** del CRM), el último hueco reservable online antes del cierre, y para generar los huecos de media hora del formulario público de reserva. Después de ejecutarla, entra en **Horarios** y confirma/ajusta la "Duración media de una reserva" para Asador Gonsastrez (por defecto queda en 2h).

### Ejecutar `0016_manage_own_reservation.sql`

Añade las funciones que usa la página `/:slug/reservar/gestionar` para buscar, cancelar y modificar una reserva por teléfono + fecha. Sin esto, esa página dará error al buscar.

## Decisiones tomadas sobre la especificación grande (2026-07-21)

1. **Next.js**: nos quedamos en Vite por ahora. No compromete ninguna función actual; se revisa en v2 cuando toque hacer adquisición/marketing real (con opciones más baratas que migrar entero, como una función ligera de meta-tags para bots/redes sociales).
2. **Stripe**: aparcado.
3. **WhatsApp/SMS**: más adelante.
4. **Resend (email transaccional)**: más adelante.
5. **Google Places API**: v2.
6. **Plano de sala en tiempo real / PWA control-sala**: pendiente de arrancar, sujeto a lo que se decida sobre el punto 1.

---

**Aviso plan gratuito (recordatorio):** Vercel Hobby es para uso no comercial (vale para desarrollo/demo); Supabase Free pausa el proyecto tras ~7 días sin actividad. Nada urgente, solo que quede anotado antes de vender esto de verdad.
