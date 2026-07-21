import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useRestaurant } from '../../lib/useRestaurant'
import { CrmLayout } from '../../components/CrmLayout'
import { RESERVATION_STATUS_LABELS, type ReservationStatus } from '../../types'
import './NewReservationPage.css'

const today = new Date().toISOString().slice(0, 10)

export function NewReservationPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { restaurant, loading: loadingRestaurant, error: restaurantError } =
    useRestaurant(slug ?? '')

  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [partySize, setPartySize] = useState(2)
  const [reservationDate, setReservationDate] = useState(today)
  const [reservationTime, setReservationTime] = useState('')
  const [status, setStatus] = useState<ReservationStatus>('confirmed')
  const [notes, setNotes] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!restaurant) return

    setSubmitting(true)
    setError(null)

    const { error } = await supabase.from('reservations').insert({
      restaurant_id: restaurant.id,
      customer_name: customerName,
      customer_phone: customerPhone || null,
      party_size: partySize,
      reservation_date: reservationDate,
      reservation_time: reservationTime,
      status,
      notes: notes || null,
    })

    setSubmitting(false)

    if (error) setError(error.message)
    else navigate(`/${slug}/crm`)
  }

  if (restaurantError) return <p>Error al conectar con Supabase: {restaurantError}</p>
  if (loadingRestaurant || !restaurant) return <p>Cargando...</p>

  return (
    <CrmLayout slug={slug ?? ''}>
      <main className="new-reservation-page">
        <h1>Nueva reserva manual</h1>
        <p className="new-reservation-hint">
          Para reservas recibidas por teléfono, en persona u otras vías.
        </p>

        <form onSubmit={handleSubmit} className="new-reservation-form">
          <label>
            Nombre *
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </label>

          <label>
            Teléfono
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </label>

          <label>
            Nº de comensales *
            <input
              type="number"
              min={1}
              required
              value={partySize}
              onChange={(e) => setPartySize(Number(e.target.value))}
            />
          </label>

          <label>
            Fecha *
            <input
              type="date"
              required
              min={today}
              value={reservationDate}
              onChange={(e) => setReservationDate(e.target.value)}
            />
          </label>

          <label>
            Hora *
            <input
              type="time"
              required
              value={reservationTime}
              onChange={(e) => setReservationTime(e.target.value)}
            />
          </label>

          <label>
            Estado
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ReservationStatus)}
            >
              {Object.entries(RESERVATION_STATUS_LABELS).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ),
              )}
            </select>
          </label>

          <label>
            Notas
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </label>

          {error && <p className="new-reservation-error">{error}</p>}

          <button type="submit" disabled={submitting}>
            {submitting ? 'Guardando...' : 'Guardar reserva'}
          </button>
        </form>
      </main>
    </CrmLayout>
  )
}
