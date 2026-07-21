import { Link, useParams } from 'react-router-dom'
import { useRestaurant } from '../lib/useRestaurant'
import { ScrollScrubVideo } from '../components/ScrollScrubVideo'
import { MenuSection } from '../components/MenuSection'
import { RecommendedCarousel } from '../components/RecommendedCarousel'
import { PageFallback } from '../components/PageFallback'
import { platosRecomendados } from '../data/recomendados'
import './RestaurantPage.css'

export function RestaurantPage() {
  const { slug } = useParams<{ slug: string }>()
  const { restaurant, loading, error } = useRestaurant(slug ?? '')

  if (error) {
    console.error(error)
    return (
      <main className="restaurant-page-message">
        <h1>No hemos encontrado este restaurante</h1>
        <p>Comprueba el enlace o vuelve a intentarlo en unos minutos.</p>
      </main>
    )
  }
  if (loading || !restaurant) return <PageFallback />

  return (
    <main>
      <ScrollScrubVideo
        videoSrc="/video/hero-asador-gonsastrez-v3.mp4"
        posterSrc="/video/hero-asador-gonsastrez-poster-v3.jpg"
        revealStart={0.48}
        revealEnd={0.6}
        hint="Desplázate para descubrir el restaurante ↓"
      >
        <p className="hero-eyebrow">Bienvenido a</p>
        <h1 className="hero-title">{restaurant.name}</h1>
        <p className="hero-tagline">
          Cocina de brasa y tradición, en el corazón de la ciudad
        </p>
      </ScrollScrubVideo>

      <RecommendedCarousel platos={platosRecomendados} />

      <MenuSection />

      <ScrollScrubVideo
        videoSrc="/video/cta-scrub-asador-gonsastrez-v2.mp4"
        posterSrc="/video/cta-scrub-asador-gonsastrez-poster-v2.jpg"
        heightVh={150}
        preload="metadata"
        revealStart={0.4}
        revealEnd={0.55}
        startFraction={0.25}
        footer={
          (restaurant.address || restaurant.phone) && (
            <div className="scrub-cta-contact">
              {restaurant.address && (
                <p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {restaurant.address}
                  </a>
                </p>
              )}
              {restaurant.phone && (
                <p>
                  <a href={`tel:${restaurant.phone.replace(/\s+/g, '')}`}>Tel: {restaurant.phone}</a>
                </p>
              )}
            </div>
          )
        }
      >
        <h2 className="scrub-cta-heading">Reserva en un minuto</h2>
        <Link className="landing-cta-button" to={`/${slug}/reservar`}>
          Reservar mesa
        </Link>
      </ScrollScrubVideo>
    </main>
  )
}
