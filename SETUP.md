# Pendiente de hacer (desde el ordenador)

Checklist de las 3 cosas que hay que hacer fuera del código. Ve de arriba a abajo, en orden — cada una depende un poco de la anterior.

## 1. Copiar claves de Supabase

1. Entra en https://supabase.com/dashboard → abre tu proyecto.
2. Menú lateral → **Project Settings** (engranaje, abajo) → **Data API**.
3. Copia:
   - **Project URL** (tipo `https://xxxxx.supabase.co`)
   - **anon public key** (empieza por `eyJ...`)
4. Pégamelos en el chat (la `anon key` es pública, no pasa nada por pegarla aquí). La `service_role key` NUNCA la copies ni me la pases.

## 2. Crear tu usuario owner + vincularlo

1. Dashboard → **Authentication** → pestaña **Users** → botón **Add user** → **Create new user**.
2. Email: `javiergsilva98@gmail.com` (dime si quieres otro antes de crearlo).
3. Marca **Auto Confirm User**. Sin contraseña (usamos magic link). **Create user**.
4. Ve a **SQL Editor** → **New query**.
5. Pega el contenido de `supabase/migrations/0003_link_owner.sql` (ya está en el repo) y **Run**.
6. Debe decir 1 fila insertada. Si sale 0, revisa que el email coincide exactamente con el del paso 2.

## 3. Deploy en Vercel

1. Entra en https://vercel.com y crea cuenta / login (mejor con GitHub, así conecta directo).
2. **Add New...** → **Project**.
3. **Import Git Repository** → selecciona `javiergsilva98-cpu/crm-reservas` (si Vercel pide permiso para acceder al repo, acéptalo).
4. Vercel debería detectar el framework automáticamente (Vite) con build command `npm run build` y output directory `dist`. No hace falta tocar nada ahí.
5. Antes de darle a **Deploy**, en la sección **Environment Variables** añade estas 3 (los mismos valores que uses en `.env.local`):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_RESTAURANT_SLUG` = `asador-gonsastrez`
6. **Deploy**. Te dará una URL tipo `crm-reservas.vercel.app` para probar en real.

**Aviso plan gratuito:** el plan Hobby de Vercel es para uso no comercial. Para desarrollo/demo está bien, pero antes de cobrar a un restaurante real por esto habrá que pasar a plan Pro (~20$/mes). No hace falta decidirlo ahora, solo que quede anotado.

---

Cuando hagas el paso 1, pégame la URL y la anon key en el chat y seguimos desde ahí (yo dejo el `.env.local` configurado). Los pasos 2 y 3 los puedes hacer tú directamente siguiendo esta guía, o pedirme que te acompañe paso a paso otra vez cuando llegues.
