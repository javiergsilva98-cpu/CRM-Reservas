import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useRestaurant } from '../../lib/useRestaurant'
import { CrmLayout } from '../../components/CrmLayout'
import './HoursPage.css'

const DAY_NAMES = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
]

interface DayHours {
  day_of_week: number
  open_time: string
  close_time: string
  closed: boolean
}

function defaultDay(day_of_week: number): DayHours {
  return { day_of_week, open_time: '13:00', close_time: '23:00', closed: false }
}

const DURATION_OPTIONS = [60, 90, 120, 150, 180, 210, 240]

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}min`
}

export function HoursPage() {
  const { slug } = useParams<{ slug: string }>()
  const { restaurant, loading: loadingRestaurant, error: restaurantError } =
    useRestaurant(slug ?? '')

  const [days, setDays] = useState<DayHours[]>(
    Array.from({ length: 7 }, (_, i) => defaultDay(i)),
  )
  const [durationMinutes, setDurationMinutes] = useState(120)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (restaurant) loadHours(restaurant.id)
  }, [restaurant])

  useEffect(() => {
    if (restaurant) setDurationMinutes(restaurant.reservation_duration_minutes)
  }, [restaurant])

  async function loadHours(restaurantId: string) {
    setLoading(true)
    const { data, error } = await supabase
      .from('restaurant_hours')
      .select('*')
      .eq('restaurant_id', restaurantId)

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setDays(
      Array.from({ length: 7 }, (_, i) => {
        const existing = data?.find((d) => d.day_of_week === i)
        return existing
          ? {
              day_of_week: i,
              open_time: existing.open_time?.slice(0, 5) ?? '13:00',
              close_time: existing.close_time?.slice(0, 5) ?? '23:00',
              closed: existing.closed,
            }
          : defaultDay(i)
      }),
    )
    setLoading(false)
  }

  function updateDay(index: number, patch: Partial<DayHours>) {
    setDays((prev) =>
      prev.map((d, i) => (i === index ? { ...d, ...patch } : d)),
    )
    setSaved(false)
  }

  async function handleSave() {
    if (!restaurant) return
    setSaving(true)
    setError(null)

    const [hoursResult, durationResult] = await Promise.all([
      supabase.from('restaurant_hours').upsert(
        days.map((d) => ({
          restaurant_id: restaurant.id,
          day_of_week: d.day_of_week,
          open_time: d.closed ? null : d.open_time,
          close_time: d.closed ? null : d.close_time,
          closed: d.closed,
        })),
        { onConflict: 'restaurant_id,day_of_week' },
      ),
      supabase
        .from('restaurants')
        .update({ reservation_duration_minutes: durationMinutes })
        .eq('id', restaurant.id),
    ])

    setSaving(false)
    if (hoursResult.error) setError(hoursResult.error.message)
    else if (durationResult.error) setError(durationResult.error.message)
    else setSaved(true)
  }

  if (restaurantError) return <p>Error al conectar con Supabase: {restaurantError}</p>
  if (loadingRestaurant || !restaurant) return <p>Cargando...</p>

  return (
    <CrmLayout slug={slug ?? ''}>
      <main className="hours-page">
        <h1>Horarios — {restaurant.name}</h1>

        {error && <p className="dashboard-error">{error}</p>}
        {loading && <p>Cargando...</p>}

        {!loading && (
          <>
            <label className="duration-field">
              Duración media de una reserva
              <select
                value={durationMinutes}
                onChange={(e) => {
                  setDurationMinutes(Number(e.target.value))
                  setSaved(false)
                }}
              >
                {DURATION_OPTIONS.map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {formatDuration(minutes)}
                  </option>
                ))}
              </select>
              <span className="duration-field-hint">
                Se usa para calcular el último hueco reservable online antes del cierre.
              </span>
            </label>

            <table className="hours-table">
              <thead>
                <tr>
                  <th>Día</th>
                  <th>Cerrado</th>
                  <th>Apertura</th>
                  <th>Cierre</th>
                </tr>
              </thead>
              <tbody>
                {days.map((d, i) => (
                  <tr key={d.day_of_week}>
                    <td>{DAY_NAMES[d.day_of_week]}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={d.closed}
                        onChange={(e) =>
                          updateDay(i, { closed: e.target.checked })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="time"
                        disabled={d.closed}
                        value={d.open_time}
                        onChange={(e) =>
                          updateDay(i, { open_time: e.target.value })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="time"
                        disabled={d.closed}
                        value={d.close_time}
                        onChange={(e) =>
                          updateDay(i, { close_time: e.target.value })
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button onClick={handleSave} disabled={saving} className="save-button">
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            {saved && <span className="hours-saved">Guardado ✓</span>}
          </>
        )}
      </main>
    </CrmLayout>
  )
}
