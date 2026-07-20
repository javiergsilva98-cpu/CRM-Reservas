import { Link } from 'react-router-dom'
import { useRestaurant } from '../lib/useRestaurant'
import { ScrollDoorHero } from '../components/ScrollDoorHero'
import { MenuSection } from '../components/MenuSection'
import './LandingPage.css'

export function LandingPage() {
  const { restaurant, loading, error } = useRestaurant()

  if (error) return <p>Error al conectar con Supabase: {error}</p>
  if (loading || !restaurant) return <p>Cargando...</p>

  return (
    <main>
      <ScrollDoorHero
        title={restaurant.name}
        tagline="Cocina de brasa y tradición, en el corazón de la ciudad"
      />

      <MenuSection />

      <section className="landing-cta">
        <h2>¿Te apetece venir?</h2>
        <p>Resérvate una mesa en un minuto.</p>
        <Link className="landing-cta-button" to="/reservar">
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
