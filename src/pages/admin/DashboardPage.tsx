import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import type { Reservation, ReservationStatus } from '../../types'
import './DashboardPage.css'

const STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  seated: 'Sentados',
  no_show: 'No-show',
}

export function DashboardPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadReservations()
  }, [])

  async function loadReservations() {
    setLoading(true)
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
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

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <h1>Reservas</h1>
        <button onClick={handleSignOut}>Cerrar sesión</button>
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
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
