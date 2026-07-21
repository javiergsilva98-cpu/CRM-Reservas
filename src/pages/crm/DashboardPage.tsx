import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useRestaurant } from '../../lib/useRestaurant'
import { CrmLayout } from '../../components/CrmLayout'
import {
  RESERVATION_STATUS_LABELS,
  type Reservation,
  type ReservationStatus,
} from '../../types'
import './DashboardPage.css'

export function DashboardPage() {
  const { slug } = useParams<{ slug: string }>()
  const { restaurant, loading: loadingRestaurant, error: restaurantError } =
    useRestaurant(slug ?? '')

  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (restaurant) ensureMembership(restaurant.id).then(() => loadReservations(restaurant.id))
  }, [restaurant])

  async function ensureMembership(restaurantId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data: existing } = await supabase
      .from('restaurant_users')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!existing) {
      // Falla en silencio si no está autorizado (email no coincide con
      // owner_email o el restaurante ya tiene owner) — es el comportamiento
      // esperado, no un error a mostrar.
      await supabase
        .from('restaurant_users')
        .insert({ restaurant_id: restaurantId, user_id: user.id, role: 'owner' })
    }
  }

  async function loadReservations(restaurantId: string) {
    setLoading(true)
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('reservation_date', { ascending: true })
      .order('reservation_time', { ascending: true })

    if (error) setError(error.message)
    else setReservations(data ?? [])
    setLoading(false)
  }

  async function updateStatus(id: string, status: ReservationStatus) {
    const { error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', id)

    if (error) {
      setError(error.message)
      return
    }

    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r)),
    )
  }

  if (restaurantError) return <p>Error al conectar con Supabase: {restaurantError}</p>
  if (loadingRestaurant || !restaurant) return <p>Cargando...</p>

  return (
    <CrmLayout slug={slug ?? ''}>
      <main className="dashboard-page">
        <header className="dashboard-header">
          <h1>Reservas — {restaurant.name}</h1>
        </header>

        {error && <p className="dashboard-error">{error}</p>}
        {loading && <p>Cargando...</p>}

        {!loading && reservations.length === 0 && (
          <p>No hay reservas todavía.</p>
        )}

        {!loading && reservations.length > 0 && (
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Cliente</th>
                  <th>Personas</th>
                  <th>Contacto</th>
                  <th>Notas</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r.id}>
                    <td>{r.reservation_date}</td>
                    <td>{r.reservation_time}</td>
                    <td>{r.customer_name}</td>
                    <td>{r.party_size}</td>
                    <td>
                      {r.customer_phone && <div>{r.customer_phone}</div>}
                      {r.customer_email && <div>{r.customer_email}</div>}
                    </td>
                    <td>{r.notes}</td>
                    <td>
                      <select
                        value={r.status}
                        onChange={(e) =>
                          updateStatus(
                            r.id,
                            e.target.value as ReservationStatus,
                          )
                        }
                        className={`status-select status-${r.status}`}
                      >
                        {Object.entries(RESERVATION_STATUS_LABELS).map(
                          ([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ),
                        )}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </CrmLayout>
  )
}
