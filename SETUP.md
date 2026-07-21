# Pendiente de hacer

## Ya hecho

- ✅ Claves de Supabase copiadas y conectadas (`.env.local` local + variables en Vercel).
- ✅ Deploy en Vercel: https://crm-reservas.vercel.app/
- ✅ Migraciones `0001` y `0002` (tablas + carta de Asador Gonsastrez).

## Pendiente ahora — en este orden

### 1. Ejecutar la migración `0005_owner_signup.sql`

SQL Editor de Supabase → pega el contenido de `supabase/migrations/0005_owner_signup.sql` → **Run**.

Esto añade la columna `owner_email` a `restaurants` (ya la deja puesta a tu email para Asador Gonsastrez) y permite que la primera persona con ese email cree su cuenta y quede vinculada como dueña.

### 2. Crear tu cuenta desde el CRM (esto crea tu usuario de Auth)

1. Abre `https://crm-reservas.vercel.app/asador-gonsastrez/crm/login`
2. Haz clic en **"Créala aquí"** (modo registro).
3. Email: `javiergsilva98@gmail.com`, y la contraseña que quieras (mínimo 6 caracteres).
4. Según la configuración de tu proyecto, puede pedirte confirmar el correo (revisa tu bandeja). Si no pide nada, entrarás directo.

### 3. Ejecutar la migración `0004_platform_admins.sql`

Ahora que ya existe tu usuario (paso 2), en el SQL Editor pega el contenido de `supabase/migrations/0004_platform_admins.sql` → **Run**. Esto te da acceso de **superadmin** (ver/gestionar todos los restaurantes en `/admin`).

**Importante el orden**: este paso tiene que ir *después* del paso 2 — la migración busca tu usuario por email, y hasta que no te registras, ese usuario no existe.

### 4. Comprobar accesos

- `https://crm-reservas.vercel.app/asador-gonsastrez/crm` → deberías ver el panel de reservas de Asador Gonsastrez (te vinculas como owner automáticamente al entrar).
- `https://crm-reservas.vercel.app/admin/login` → pide el enlace mágico a tu email y entra al panel de superadmin (listado de restaurantes).

Nota: `0003_link_owner.sql` ha quedado obsoleta con este nuevo flujo — no hace falta ejecutarla, la vinculación ahora pasa por el registro con contraseña + `0005`.

---

**Aviso plan gratuito (recordatorio):** Vercel Hobby es para uso no comercial (vale para desarrollo/demo); Supabase Free pausa el proyecto tras ~7 días sin actividad. Nada urgente, solo que quede anotado antes de vender esto de verdad.
