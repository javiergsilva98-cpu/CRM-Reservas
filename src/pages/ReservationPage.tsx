import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useRestaurant } from '../lib/useRestaurant'
import './ReservationPage.css'

const today = new Date().toISOString().slice(0, 10)

export function ReservationPage() {
  const { slug } = useParams<{ slug: string }>()
  const { restaurant, loading, error } = useRestaurant(slug ?? '')

  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [partySize, setPartySize] = useState(2)
  const [reservationDate, setReservationDate] = useState('')
  const [reservationTime, setReservationTime] = useState('')
  const [notes, setNotes] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!restaurant) return

    setSubmitting(true)
    setSubmitError(null)

    const { data: customerId, error: customerError } = await supabase.rpc(
      'find_or_create_customer',
      {
        p_restaurant_id: restaurant.id,
        p_first_name: customerName,
        p_phone: customerPhone || null,
        p_email: customerEmail || null,
      },
    )

    if (customerError) {
      console.error(customerError)
      setSubmitError(
        'No hemos podido enviar tu reserva. Inténtalo de nuevo en unos minutos.',
      )
      setSubmitting(false)
      return
    }

    const { error } = await supabase.from('reservations').insert({
      restaurant_id: restaurant.id,
      customer_id: customerId,
      party_size: partySize,
      reservation_date: reservationDate,
      reservation_time: reservationTime,
      customer_notes: notes || null,
    })

    setSubmitting(false)

    if (error) {
      console.error(error)
      setSubmitError(
        'No hemos podido enviar tu reserva. Inténtalo de nuevo en unos minutos.',
      )
    } else {
      setSubmitted(true)
    }
  }

  if (error) {
    console.error(error)
    return <p>No hemos encontrado este restaurante.</p>
  }
  if (loading || !restaurant) return <p>Cargando...</p>

  if (submitted) {
    return (
      <main className="reservation-page">
        <h1>¡Reserva enviada!</h1>
        <p>
          Hemos recibido tu solicitud para {restaurant.name}. Te confirmaremos
          la reserva lo antes posible.
        </p>
        <Link to={`/${slug}`}>Volver al inicio</Link>
      </main>
    )
  }

  return (
    <main className="reservation-page">
      <h1>Reservar mesa en {restaurant.name}</h1>

      <form onSubmit={handleSubmit} className="reservation-form">
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
          Email
          <input
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
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
          Notas
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </label>

        {submitError && <p className="reservation-error">{submitError}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Enviando...' : 'Reservar'}
        </button>
      </form>
    </main>
  )
}
