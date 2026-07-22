import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useRestaurant } from '../lib/useRestaurant'
import { generateTimeSlots } from '../lib/timeSlots'
import { PageFallback } from '../components/PageFallback'
import { CalendarIcon, CheckIcon, ClockIcon, PartyIcon, PhoneIcon } from '../components/icons'
import type { RestaurantHours } from '../types'
import './ReservationPage.css'
import './ManageReservationPage.css'

const today = new Date().toISOString().slice(0, 10)

interface OwnReservation {
  id: string
  party_size: number
  reservation_date: string
  reservation_time: string
  status: string
  customer_notes: string | null
}

function dayOfWeekFor(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day).getDay()
}

function formatDateSummary(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function ManageReservationPage() {
  const { slug } = useParams<{ slug: string }>()
  const { restaurant, loading, error } = useRestaurant(slug ?? '')

  const [hoursByDay, setHoursByDay] = useState<Record<number, RestaurantHours> | null>(null)

  const [phone, setPhone] = useState('')
  const [lookupDate, setLookupDate] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [results, setResults] = useState<OwnReservation[] | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDate, setEditDate] = useState('')
  const [editTime, setEditTime] = useState('')
  const [editPartySize, setEditPartySize] = useState(2)
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

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

  const editDayHours = editDate ? hoursByDay?.[dayOfWeekFor(editDate)] : undefined
  const editTimeSlots =
    editDate && editDayHours && !editDayHours.closed && restaurant
      ? generateTimeSlots(editDayHours.open_time, editDayHours.close_time, restaurant.reservation_duration_minutes)
      : []

  async function handleSearch(event: FormEvent) {
    event.preventDefault()
    if (!restaurant || !phone.trim() || !lookupDate) return

    setSearching(true)
    setSearchError(null)
    setResults(null)
    setMessage(null)
    setEditingId(null)

    const { data, error: searchErr } = await supabase.rpc('find_own_reservations', {
      p_restaurant_id: restaurant.id,
      p_phone: phone.trim(),
      p_reservation_date: lookupDate,
    })

    setSearching(false)

    if (searchErr) {
      console.error(searchErr)
      setSearchError('No hemos podido buscar tu reserva. Inténtalo de nuevo en unos minutos.')
      return
    }

    setResults(data ?? [])
    if (!data || data.length === 0) {
      setSearchError('No hemos encontrado ninguna reserva con ese teléfono en esa fecha.')
    }
  }

  function startEdit(r: OwnReservation) {
    setEditingId(r.id)
    setEditDate(r.reservation_date)
    setEditTime(r.reservation_time.slice(0, 5))
    setEditPartySize(r.party_size)
    setActionError(null)
  }

  async function handleCancel(id: string) {
    setActionError(null)
    setMessage(null)

    const { error: cancelErr } = await supabase.rpc('cancel_own_reservation', {
      p_reservation_id: id,
      p_phone: phone.trim(),
    })

    if (cancelErr) {
      setActionError(cancelErr.message)
      return
    }

    setResults((prev) => prev?.filter((r) => r.id !== id) ?? null)
    setMessage('Tu reserva se ha cancelado.')
  }

  async function handleSaveEdit(event: FormEvent) {
    event.preventDefault()
    if (!editingId) return

    setSaving(true)
    setActionError(null)

    const { error: modifyErr } = await supabase.rpc('modify_own_reservation', {
      p_reservation_id: editingId,
      p_phone: phone.trim(),
      p_reservation_date: editDate,
      p_reservation_time: editTime,
      p_party_size: editPartySize,
    })

    setSaving(false)

    if (modifyErr) {
      setActionError(modifyErr.message)
      return
    }

    setResults(
      (prev) =>
        prev?.map((r) =>
          r.id === editingId
            ? { ...r, reservation_date: editDate, reservation_time: editTime, party_size: editPartySize }
            : r,
        ) ?? null,
    )
    setEditingId(null)
    setMessage('Tu reserva se ha actualizado.')
  }

  if (error) {
    console.error(error)
    return (
      <main className="reservation-page-message">
        <h1>No hemos encontrado este restaurante</h1>
        <p>Comprueba el enlace o vuelve a intentarlo en unos minutos.</p>
      </main>
    )
  }
  if (loading || !restaurant) return <PageFallback />

  return (
    <main className="reservation-page manage-reservation-page">
      <h1>Gestionar tu reserva</h1>
      <p className="manage-subtitle">{restaurant.name}</p>

      <form onSubmit={handleSearch} className="manage-lookup-form">
        <label className="reservation-field">
          <span className="reservation-field-label">Teléfono *</span>
          <span className="reservation-input-wrap">
            <PhoneIcon className="reservation-field-icon" />
            <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} />
          </span>
        </label>

        <label className="reservation-field">
          <span className="reservation-field-label">Fecha de la reserva *</span>
          <span className="reservation-input-wrap">
            <CalendarIcon className="reservation-field-icon" />
            <input
              type="date"
              required
              value={lookupDate}
              onChange={(e) => setLookupDate(e.target.value)}
            />
          </span>
        </label>

        <button type="submit" className="accordion-step-next" disabled={searching}>
          {searching ? 'Buscando...' : 'Buscar mi reserva'}
        </button>
      </form>

      {searchError && <p className="reservation-error">{searchError}</p>}
      {message && (
        <p className="manage-message">
          <CheckIcon /> {message}
        </p>
      )}

      {results && results.length > 0 && (
        <ul className="manage-results-list">
          {results.map((r) => (
            <li key={r.id} className="manage-result-item">
              {editingId === r.id ? (
                <form onSubmit={handleSaveEdit} className="manage-edit-form">
                  <label className="reservation-field">
                    <span className="reservation-field-label">
                      <PartyIcon className="reservation-field-label-icon" /> Personas
                    </span>
                    <span className="reservation-input-wrap">
                      <input
                        type="number"
                        min={1}
                        required
                        value={editPartySize}
                        onChange={(e) => setEditPartySize(Number(e.target.value))}
                      />
                    </span>
                  </label>

                  <label className="reservation-field">
                    <span className="reservation-field-label">Fecha</span>
                    <span className="reservation-input-wrap">
                      <CalendarIcon className="reservation-field-icon" />
                      <input
                        type="date"
                        required
                        min={today}
                        value={editDate}
                        onChange={(e) => {
                          setEditDate(e.target.value)
                          setEditTime('')
                        }}
                      />
                    </span>
                  </label>

                  <div className="reservation-field">
                    <span className="reservation-field-label">
                      <ClockIcon className="reservation-field-label-icon" /> Hora
                    </span>

                    {hoursByDay !== null && editTimeSlots.length === 0 && (
                      <p className="time-slots-hint">
                        Ese día no tenemos huecos online. Llámanos para cambiarla.
                      </p>
                    )}

                    {editTimeSlots.length > 0 && (
                      <div className="time-slot-grid">
                        {editTimeSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            className={`time-slot-chip ${editTime === slot ? 'time-slot-chip--selected' : ''}`}
                            onClick={() => setEditTime(slot)}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {actionError && <p className="reservation-error">{actionError}</p>}

                  <div className="manage-edit-actions">
                    <button type="submit" className="accordion-step-next" disabled={saving || !editTime}>
                      {saving ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                    <button
                      type="button"
                      className="manage-cancel-edit"
                      onClick={() => setEditingId(null)}
                    >
                      Cancelar edición
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="manage-result-summary">
                    <strong>
                      {formatDateSummary(r.reservation_date)} · {r.reservation_time.slice(0, 5)}
                    </strong>
                    <span>
                      {r.party_size} {r.party_size === 1 ? 'persona' : 'personas'}
                    </span>
                  </div>
                  <div className="manage-result-actions">
                    <button type="button" onClick={() => startEdit(r)}>
                      Modificar
                    </button>
                    <button
                      type="button"
                      className="manage-cancel-button"
                      onClick={() => handleCancel(r.id)}
                    >
                      Cancelar reserva
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {actionError && !editingId && <p className="reservation-error">{actionError}</p>}
    </main>
  )
}
