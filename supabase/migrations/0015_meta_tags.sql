-- Campos para generar meta tags (title/description/og:image) por
-- restaurante desde la función edge de /api/meta.ts.
alter table restaurants
  add column meta_description text,
  add column og_image_url text;

update restaurants
set
  meta_description = 'Reserva mesa online en Asador Gonsastrez: cocina de brasa y tradición en el corazón de la ciudad.',
  og_image_url = 'https://crm-reservas.vercel.app/video/hero-asador-gonsastrez-poster-v3.jpg'
where slug = 'asador-gonsastrez';
