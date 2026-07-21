import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useRestaurant } from '../../lib/useRestaurant'
import { CrmLayout } from '../../components/CrmLayout'
import { ReservationsBarChart } from '../../components/ReservationsBarChart'
import './AnalyticsPage.css'

const DAYS_BACK = 29

function addDays(base: Date, days: number) {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function AnalyticsPage() {
  const { slug } = useParams<{ slug: string }>()
  const { restaurant, loading: loadingRestaurant, error: restaurantError } =
    useRestaurant(slug ?? '')

  const [countsByDate, setCountsByDate] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (restaurant) loadCounts(restaurant.id)
  }, [restaurant])

  async function loadCounts(restaurantId: string) {
    setLoading(true)
    const today = new Date()
    const startDate = addDays(today, -DAYS_BACK)
    const endDate = addDays(today, 0)

    const { data, error } = await supabase
      .from('reservations')
      .select('reservation_date')
      .eq('restaurant_id', restaurantId)
      .gte('reservation_date', startDate)
      .lte('reservation_date', endDate)
      .not('status', 'in', '(cancelled,no_show)')

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const grouped: Record<string, number> = {}
    for (const r of data ?? []) {
      grouped[r.reservation_date] = (grouped[r.reservation_date] ?? 0) + 1
    }
    setCountsByDate(grouped)
    setLoading(false)
  }

  if (restaurantError) return <p>Error al conectar con Supabase: {restaurantError}</p>
  if (loadingRestaurant || !restaurant) return <p>Cargando...</p>

  const today = new Date()
  const series = Array.from({ length: DAYS_BACK + 1 }, (_, i) => {
    const date = addDays(today, -DAYS_BACK + i)
    return { date, count: countsByDate[date] ?? 0 }
  })

  const total = series.reduce((sum, d) => sum + d.count, 0)

  return (
    <CrmLayout slug={slug ?? ''}>
      <main className="analytics-page">
        <h1>Reservas por día — {restaurant.name}</h1>
        <p className="analytics-hint">
          Últimos 30 días · {total} reservas (no canceladas / no-show)
        </p>

        {error && <p className="dashboard-error">{error}</p>}
        {loading && <p>Cargando...</p>}

        {!loading && <ReservationsBarChart data={series} />}
      </main>
    </CrmLayout>
  )
}
