import { useEffect, useState } from 'react'
import { supabase, RESTAURANT_SLUG } from '../lib/supabaseClient'
import type { Restaurant } from '../types'

export function LandingPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('restaurants')
      .select('*')
      .eq('slug', RESTAURANT_SLUG)
      .single()
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setRestaurant(data)
      })
  }, [])

  if (error) return <p>Error al conectar con Supabase: {error}</p>
  if (!restaurant) return <p>Cargando...</p>

  return (
    <main>
      <h1>{restaurant.name}</h1>
      {restaurant.address && <p>{restaurant.address}</p>}
      {restaurant.phone && <p>Tel: {restaurant.phone}</p>}
    </main>
  )
}
