import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useRestaurant } from '../../lib/useRestaurant'
import { CrmLayout } from '../../components/CrmLayout'
import './AvailabilityPage.css'

const DAYS_AHEAD = 14

function addDays(base: Date, days: number) {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function AvailabilityPage() {
  const { slug } = useParams<{ slug: string }>()
  const { restaurant, loading: loadingRestaurant, error: restaurantError } =
    useRestaurant(slug ?? '')

  const [totalCapacity, setTotalCapacity] = useState(0)
  const [reservedByDate, setReservedByDate] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (restaurant) loadAvailability(restaurant.id)
  }, [restaurant])

  async function loadAvailability(restaurantId: string) {
    setLoading(true)

    const today = new Date()
    const startDate = addDays(today, 0)
    const endDate = addDays(today, DAYS_AHEAD - 1)

    const [tablesResult, reservationsResult] = await Promise.all([
      supabase
        .from('restaurant_tables')
        .select('capacity')
        .eq('restaurant_id', restaurantId)
        .eq('active', true),
      supabase
        .from('reservations')
        .select('reservation_date, party_size')
        .eq('restaurant_id', restaurantId)
        .gte('reservation_date', startDate)
        .lte('reservation_date', endDate)
        .not('status', 'in', '(cancelled,no_show)'),
    ])

    if (tablesResult.error) {
      setError(tablesResult.error.message)
      setLoading(false)
      return
    }
    if (reservationsResult.error) {
      setError(reservationsResult.error.message)
      setLoading(false)
      return
    }

    setTotalCapacity(
      (tablesResult.data ?? []).reduce((sum, t) => sum + t.capacity, 0),
    )

    const grouped: Record<string, number> = {}
    for (const r of reservationsResult.data ?? []) {
      grouped[r.reservation_date] = (grouped[r.reservation_date] ?? 0) + r.party_size
    }
    setReservedByDate(grouped)
    setLoading(false)
  }

  if (restaurantError) return <p>Error al conectar con Supabase: {restaurantError}</p>
  if (loadingRestaurant || !restaurant) return <p>Cargando...</p>

  const today = new Date()
  const dates = Array.from({ length: DAYS_AHEAD }, (_, i) => addDays(today, i))

  return (
    <CrmLayout slug={slug ?? ''}>
      <main className="availability-page">
        <h1>Disponibilidad — {restaurant.name}</h1>

        {error && <p className="dashboard-error">{error}</p>}
        {loading && <p>Cargando...</p>}

        {!loading && totalCapacity === 0 && (
          <p>
            Todavía no tienes mesas configuradas — ve a la pestaña "Mesas"
            para poder calcular el aforo disponible.
          </p>
        )}

        {!loading && totalCapacity > 0 && (
          <table className="availability-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Aforo total</th>
                <th>Reservado</th>
                <th>Libre</th>
              </tr>
            </thead>
            <tbody>
              {dates.map((date) => {
                const reserved = reservedByDate[date] ?? 0
                const free = totalCapacity - reserved
                return (
                  <tr key={date}>
                    <td>{date}</td>
                    <td>{totalCapacity}</td>
                    <td>{reserved}</td>
                    <td className={free < 0 ? 'availability-overbooked' : ''}>
                      {free}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </main>
    </CrmLayout>
  )
}
