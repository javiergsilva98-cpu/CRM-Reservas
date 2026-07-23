import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useRestaurant } from '../lib/useRestaurant'
import { generateTimeSlots } from '../lib/timeSlots'
import { AccordionStep } from '../components/AccordionStep'
import { PageFallback } from '../components/PageFallback'
import { LegalFooter } from '../components/LegalFooter'
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
import type { RestaurantHours } from '../types'
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

function dayOfWeekFor(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day).getDay()
}

const MIN_SUBMIT_MS = 3000

export function ReservationPage() {
  const { slug } = useParams<{ slug: string }>()
  const { restaurant, loading, error } = useRestaurant(slug ?? '')

  const formLoadedAt = useRef(Date.now())
  const [website, setWebsite] = useState('')

  const [activeStep, setActiveStep] = useState(0)

  const [partySize, setPartySize] = useState(2)
  const [customPartySize, setCustomPartySize] = useState(false)

  const [reservationDate, setReservationDate] = useState('')
  const [reservationTime, setReservationTime] = useState('')

  const [hoursByDay, setHoursByDay] = useState<Record<number, RestaurantHours> | null>(null)

  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [marketingConsent, setMarketingConsent] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!restaurant) return
    supabase
      .from('restaurant_hours')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .then(({ data }) => {
        const byDay: Record<number, RestaurantHours> = {}
        for (const row of data ?? []) byDay[row.day_of_week] = row
        setHoursByDay(byDay)
      })
  }, [restaurant])

  useEffect(() => {
    setReservationTime('')
  }, [reservationDate])

  const dayHours = reservationDate ? hoursByDay?.[dayOfWeekFor(reservationDate)] : undefined
  const timeSlots =
    reservationDate && dayHours && !dayHours.closed && restaurant
      ? generateTimeSlots(dayHours.open_time, dayHours.close_time, restaurant.reservation_duration_minutes)
      : []

  const dateTimeValid = Boolean(reservationDate && reservationTime)
  const contactValid = Boolean(customerName.trim() && customerPhone.trim() && privacyAccepted)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!restaurant || !dateTimeValid || !contactValid) return

    // Protección anti-bot silenciosa: un campo señuelo relleno o un envío
    // sospechosamente rápido no delatan el motivo, para no enseñar al bot
    // a evitarlo.
    if (website.trim() || Date.now() - formLoadedAt.current < MIN_SUBMIT_MS) {
      setSubmitError('No hemos podido enviar tu reserva. Inténtalo de nuevo en unos minutos.')
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    const { data: customerId, error: customerError } = await supabase.rpc(
      'find_or_create_customer',
      {
        p_restaurant_id: restaurant.id,
        p_first_name: customerName,
        p_phone: customerPhone || null,
        p_email: customerEmail || null,
        p_gdpr_marketing: marketingConsent,
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
    return (
      <>
        <main className="reservation-page-message">
          <h1>No hemos encontrado este restaurante</h1>
          <p>Comprueba el enlace o vuelve a intentarlo en unos minutos.</p>
        </main>
        <LegalFooter />
      </>
    )
  }
  if (loading || !restaurant) return <PageFallback />

  if (submitted) {
    return (
      <>
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
            <Link to={`/${slug}/reservar/gestionar`} className="reservation-success-link">
              ¿Necesitas cambiarla o cancelarla? Gestiónala aquí
            </Link>
            <Link to={`/${slug}`} className="reservation-success-link">
              Volver al inicio
            </Link>
          </div>
        </main>
        <LegalFooter />
      </>
    )
  }

  return (
    <>
    <main className="reservation-page">
      <h1>Reservar mesa en {restaurant.name}</h1>
      <Link to={`/${slug}/reservar/gestionar`} className="reservation-manage-link">
        ¿Ya tienes una reserva? Gestiónala aquí
      </Link>

      <form onSubmit={handleSubmit} className="reservation-accordion">
        <input
          type="text"
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="reservation-honeypot"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />
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

          <div className="reservation-field">
            <span className="reservation-field-label">
              <ClockIcon className="reservation-field-label-icon" /> Hora *
            </span>

            {!reservationDate && (
              <p className="time-slots-hint">Elige antes una fecha.</p>
            )}

            {reservationDate && hoursByDay === null && (
              <p className="time-slots-hint">Cargando horario...</p>
            )}

            {reservationDate && hoursByDay !== null && timeSlots.length === 0 && (
              <p className="time-slots-hint">
                Ese día no tenemos huecos online. Elige otra fecha o llámanos.
              </p>
            )}

            {timeSlots.length > 0 && (
              <div className="time-slot-grid">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={`time-slot-chip ${reservationTime === slot ? 'time-slot-chip--selected' : ''}`}
                    onClick={() => setReservationTime(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>

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

          <label className="reservation-consent">
            <input
              type="checkbox"
              required
              checked={privacyAccepted}
              onChange={(e) => setPrivacyAccepted(e.target.checked)}
            />
            <span>
              He leído y acepto la{' '}
              <Link to="/legal/privacidad" target="_blank" rel="noopener noreferrer">
                Política de Privacidad
              </Link>{' '}
              *
            </span>
          </label>

          <label className="reservation-consent">
            <input
              type="checkbox"
              checked={marketingConsent}
              onChange={(e) => setMarketingConsent(e.target.checked)}
            />
            <span>Quiero recibir ofertas y novedades de {restaurant.name} por email o teléfono</span>
          </label>

          {submitError && <p className="reservation-error">{submitError}</p>}

          <button type="submit" className="accordion-step-next" disabled={submitting || !contactValid}>
            {submitting ? 'Enviando...' : 'Reservar mesa'}
          </button>
        </AccordionStep>
      </form>
      </main>
      <LegalFooter />
    </>
  )
}
