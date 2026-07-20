import { useEffect, useState } from 'react'
import { supabase, RESTAURANT_SLUG } from './supabaseClient'
import type { Restaurant } from '../types'

export function useRestaurant() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
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
        setLoading(false)
      })
  }, [])

  return { restaurant, loading, error }
}
