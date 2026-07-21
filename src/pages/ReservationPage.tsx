import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useRestaurant } from '../lib/useRestaurant'
import { AccordionStep } from '../components/AccordionStep'
import {
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  MailIcon,
  NoteIcon,
  PartyIcon,
  PersonIcon,
  PhoneIcon,
} from '../components/icons'
import './ReservationPage.css'

const today = new Date().toISOString().slice(0, 10)
const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
const PARTY_SIZES = [1, 2, 3, 4, 5, 6, 7, 8]

function formatDateSummary(date: string) {
  if (!date) return ''
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function ReservationPage() {
  const { slug } = useParams<{ slug: string }>()
  const { restaurant, loading, error } = useRestaurant(slug ?? '')

  const [activeStep, setActiveStep] = useState(0)

  const [partySize, setPartySize] = useState(2)
  const [customPartySize, setCustomPartySize] = useState(false)

  const [reservationDate, setReservationDate] = useState('')
  const [reservationTime, setReservationTime] = useState('')

  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [notes, setNotes] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const dateTimeValid = Boolean(reservationDate && reservationTime)
  const contactValid = Boolean(customerName.trim() && customerPhone.trim())

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!restaurant || !dateTimeValid || !contactValid) return

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
        <div className="reservation-success">
          <span className="reservation-success-icon">
            <CheckIcon />
          </span>
          <h1>¡Reserva enviada!</h1>
          <p>
            Hemos recibido tu solicitud para {partySize} {partySize === 1 ? 'persona' : 'personas'} en{' '}
            {restaurant.name} el {formatDateSummary(reservationDate)} a las {reservationTime}. Te
            confirmaremos la reserva lo antes posible.
          </p>
          <Link to={`/${slug}`} className="reservation-success-link">
            Volver al inicio
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="reservation-page">
      <h1>Reservar mesa en {restaurant.name}</h1>

      <form onSubmit={handleSubmit} className="reservation-accordion">
        <AccordionStep
          index={0}
          title="¿Cuántos sois?"
          icon={<PartyIcon />}
          summary={`${partySize} ${partySize === 1 ? 'persona' : 'personas'}`}
          isOpen={activeStep === 0}
          isDone={activeStep > 0}
          onReopen={() => setActiveStep(0)}
        >
          <div className="party-size-grid">
            {PARTY_SIZES.map((n) => (
              <button
                key={n}
                type="button"
                className={`party-chip ${!customPartySize && partySize === n ? 'party-chip--selected' : ''}`}
                onClick={() => {
                  setCustomPartySize(false)
                  setPartySize(n)
                }}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              className={`party-chip party-chip--more ${customPartySize ? 'party-chip--selected' : ''}`}
              onClick={() => {
                setCustomPartySize(true)
                setPartySize(9)
              }}
            >
              9+
            </button>
          </div>

          {customPartySize && (
            <label className="reservation-field">
              <span className="reservation-field-label">Número exacto</span>
              <span className="reservation-input-wrap">
                <input
                  type="number"
                  min={9}
                  required
                  value={partySize}
                  onChange={(e) => setPartySize(Number(e.target.value))}
                />
              </span>
            </label>
          )}

          <button type="button" className="accordion-step-next" onClick={() => setActiveStep(1)}>
            Continuar
          </button>
        </AccordionStep>

        <AccordionStep
          index={1}
          title="¿Cuándo?"
          icon={<CalendarIcon />}
          summary={dateTimeValid ? `${formatDateSummary(reservationDate)} · ${reservationTime}` : ''}
          isOpen={activeStep === 1}
          isDone={activeStep > 1}
          onReopen={() => setActiveStep(1)}
          onBack={() => setActiveStep(0)}
        >
          <div className="quick-date-row">
            <button
              type="button"
              className={`quick-date-chip ${reservationDate === today ? 'quick-date-chip--selected' : ''}`}
              onClick={() => setReservationDate(today)}
            >
              Hoy
            </button>
            <button
              type="button"
              className={`quick-date-chip ${reservationDate === tomorrow ? 'quick-date-chip--selected' : ''}`}
              onClick={() => setReservationDate(tomorrow)}
            >
              Mañana
            </button>
          </div>

          <label className="reservation-field">
            <span className="reservation-field-label">Fecha *</span>
            <span className="reservation-input-wrap">
              <CalendarIcon className="reservation-field-icon" />
              <input
                type="date"
                required
                min={today}
                value={reservationDate}
                onChange={(e) => setReservationDate(e.target.value)}
              />
            </span>
          </label>

          <label className="reservation-field">
            <span className="reservation-field-label">Hora *</span>
            <span className="reservation-input-wrap">
              <ClockIcon className="reservation-field-icon" />
              <input
                type="time"
                required
                value={reservationTime}
                onChange={(e) => setReservationTime(e.target.value)}
              />
            </span>
          </label>

          <button
            type="button"
            className="accordion-step-next"
            disabled={!dateTimeValid}
            onClick={() => setActiveStep(2)}
          >
            Continuar
          </button>
        </AccordionStep>

        <AccordionStep
          index={2}
          title="Tus datos"
          icon={<PersonIcon />}
          isOpen={activeStep === 2}
          isDone={false}
          onBack={() => setActiveStep(1)}
        >
          <label className="reservation-field">
            <span className="reservation-field-label">Nombre *</span>
            <span className="reservation-input-wrap">
              <PersonIcon className="reservation-field-icon" />
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </span>
          </label>

          <label className="reservation-field">
            <span className="reservation-field-label">Teléfono *</span>
            <span className="reservation-input-wrap">
              <PhoneIcon className="reservation-field-icon" />
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </span>
          </label>

          <label className="reservation-field">
            <span className="reservation-field-label">Email</span>
            <span className="reservation-input-wrap">
              <MailIcon className="reservation-field-icon" />
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </span>
          </label>

          <label className="reservation-field">
            <span className="reservation-field-label">Notas</span>
            <span className="reservation-input-wrap">
              <NoteIcon className="reservation-field-icon reservation-field-icon--top" />
              <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </span>
          </label>

          {submitError && <p className="reservation-error">{submitError}</p>}

          <button type="submit" className="accordion-step-next" disabled={submitting || !contactValid}>
            {submitting ? 'Enviando...' : 'Reservar mesa'}
          </button>
        </AccordionStep>
      </form>
    </main>
  )
}
