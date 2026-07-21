import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import type { Restaurant } from '../types'

export function useRestaurant(slug: string) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    supabase
      .from('restaurants')
      .select('*')
      .eq('slug', slug)
      .single()
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setRestaurant(data)
        setLoading(false)
      })
  }, [slug])

  return { restaurant, loading, error }
}
