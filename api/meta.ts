export const config = { runtime: 'edge' }

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function replaceMetaContent(
  html: string,
  attr: 'name' | 'property',
  attrValue: string,
  newContent: string,
): string {
  const pattern = new RegExp(
    `(<meta\\s+${attr}=["']${attrValue}["']\\s+content=["'])[^"']*(["'])`,
    'i',
  )
  return html.replace(pattern, (_match, pre: string, post: string) => `${pre}${newContent}${post}`)
}

interface RestaurantMeta {
  name: string
  meta_description: string | null
  og_image_url: string | null
}

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const segments = url.pathname.split('/').filter(Boolean)
  const slug = segments[0]
  const isReservar = segments[1] === 'reservar'

  const shellResponse = await fetch(new URL('/index.html', url.origin))
  let html = await shellResponse.text()

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

  if (slug && supabaseUrl && supabaseAnonKey) {
    try {
      const restRes = await fetch(
        `${supabaseUrl}/rest/v1/restaurants?slug=eq.${encodeURIComponent(slug)}&active=eq.true&select=name,meta_description,og_image_url`,
        { headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` } },
      )
      const rows: RestaurantMeta[] = restRes.ok ? await restRes.json() : []
      const restaurant = rows[0]

      if (restaurant) {
        const title = escapeHtml(isReservar ? `Reservar mesa — ${restaurant.name}` : restaurant.name)
        const description = escapeHtml(
          restaurant.meta_description ?? `Reserva mesa online en ${restaurant.name}.`,
        )
        const pageUrl = escapeHtml(url.toString())

        html = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
        html = replaceMetaContent(html, 'name', 'description', description)
        html = replaceMetaContent(html, 'property', 'og:title', title)
        html = replaceMetaContent(html, 'property', 'og:description', description)
        html = replaceMetaContent(html, 'property', 'og:url', pageUrl)
        if (restaurant.og_image_url) {
          html = replaceMetaContent(html, 'property', 'og:image', escapeHtml(restaurant.og_image_url))
        }
      }
    } catch {
      // Supabase no disponible: servimos el shell con los meta tags por defecto.
    }
  }

  return new Response(html, {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  })
}
