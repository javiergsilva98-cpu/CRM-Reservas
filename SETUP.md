# Pendiente de hacer

## Ya hecho

- ✅ Claves de Supabase copiadas y conectadas (`.env.local` local + variables en Vercel).
- ✅ Deploy en Vercel: https://crm-reservas.vercel.app/
- ✅ Migraciones `0001` a `0008` (esquema base, superadmin, registro de dueños, mesas, horarios).
- ✅ Tu cuenta (`javiergsilva98@gmail.com`) creada, vinculada como owner de Asador Gonsastrez y como superadmin.
- ✅ CRM con Reservas, Nueva reserva, Disponibilidad, Mesas, Horarios y Analítica.
- ✅ Migraciones `0009` y `0010`: `customers` como entidad propia del CRM (alergias, dieta, tags, GDPR, historial de reservas), separada de `reservations`.
- ✅ Migración `0011` y pestaña **Sala**: plano visual de mesas (arrastrar para colocar, zonas, estado libre/reservada/ocupada) y asignación de reservas a mesa concreta.

## Pendiente ahora — cambia el modelo de mesas, ejecutar antes de usar Sala

### Ejecutar `0012_rooms_and_layout_presets.sql`

- Fusiona la pestaña **Mesas** dentro de **Sala** (ya no existe pestaña Mesas aparte; las mesas se crean desde Sala).
- Añade **salas** (hasta 3, nombrables — ej. "Comedor", "Terraza") sustituyendo a la "zona" de texto libre.
- Añade **plantillas** (hasta 3, con nombre) que guardan una disposición completa de mesas y se pueden asignar a días de la semana (ej. entre semana vs. fin de semana) o a un rango de fechas (ej. terraza solo en verano).
- Cualquier "zona" de texto que ya hubieras escrito en el editor de Sala se convierte automáticamente en una sala real con ese nombre — no se pierde nada.

## Decisiones tomadas sobre la especificación grande (2026-07-21)

1. **Next.js**: nos quedamos en Vite por ahora. No compromete ninguna función actual; se revisa en v2 cuando toque hacer adquisición/marketing real (con opciones más baratas que migrar entero, como una función ligera de meta-tags para bots/redes sociales).
2. **Stripe**: aparcado.
3. **WhatsApp/SMS**: más adelante.
4. **Resend (email transaccional)**: más adelante.
5. **Google Places API**: v2.
6. **Plano de sala en tiempo real / PWA control-sala**: pendiente de arrancar, sujeto a lo que se decida sobre el punto 1.

---

**Aviso plan gratuito (recordatorio):** Vercel Hobby es para uso no comercial (vale para desarrollo/demo); Supabase Free pausa el proyecto tras ~7 días sin actividad. Nada urgente, solo que quede anotado antes de vender esto de verdad.
