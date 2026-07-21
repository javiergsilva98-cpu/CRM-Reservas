import { Link, useParams } from 'react-router-dom'
import { useRestaurant } from '../lib/useRestaurant'
import { ScrollScrubVideo } from '../components/ScrollScrubVideo'
import { MenuSection } from '../components/MenuSection'
import { RecommendedCarousel } from '../components/RecommendedCarousel'
import { platosRecomendados } from '../data/recomendados'
import './RestaurantPage.css'

export function RestaurantPage() {
  const { slug } = useParams<{ slug: string }>()
  const { restaurant, loading, error } = useRestaurant(slug ?? '')

  if (error) {
    console.error(error)
    return <p>No hemos encontrado este restaurante.</p>
  }
  if (loading || !restaurant) return <p>Cargando...</p>

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
        revealStart={0.4}
        revealEnd={0.55}
        startFraction={0.25}
        footer={
          (restaurant.address || restaurant.phone) && (
            <div className="scrub-cta-contact">
              {restaurant.address && <p>{restaurant.address}</p>}
              {restaurant.phone && <p>Tel: {restaurant.phone}</p>}
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
