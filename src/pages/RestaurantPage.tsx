import { Link, useParams } from 'react-router-dom'
import { useRestaurant } from '../lib/useRestaurant'
import { ScrollVideoHero } from '../components/ScrollVideoHero'
import { MenuSection } from '../components/MenuSection'
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
      <ScrollVideoHero
        title={restaurant.name}
        tagline="Cocina de brasa y tradición, en el corazón de la ciudad"
        videoSrc="/video/hero-asador-gonsastrez.mp4"
        posterSrc="/video/hero-asador-gonsastrez-poster.jpg"
      />

      <MenuSection />

      <section className="landing-cta">
        <h2>¿Te apetece venir?</h2>
        <p>Resérvate una mesa en un minuto.</p>
        <Link className="landing-cta-button" to={`/${slug}/reservar`}>
          Reservar mesa
        </Link>

        <div className="landing-contact">
          {restaurant.address && <p>{restaurant.address}</p>}
          {restaurant.phone && <p>Tel: {restaurant.phone}</p>}
        </div>
      </section>
    </main>
  )
}
