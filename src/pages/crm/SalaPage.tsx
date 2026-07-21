import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useRestaurant } from '../../lib/useRestaurant'
import { CrmLayout } from '../../components/CrmLayout'
import type { ReservationWithCustomer, RestaurantTable } from '../../types'
import './SalaPage.css'

function today() {
  return new Date().toISOString().slice(0, 10)
}

function customerName(r: ReservationWithCustomer) {
  if (!r.customers) return 'Cliente'
  return [r.customers.first_name, r.customers.last_name].filter(Boolean).join(' ')
}

interface Position {
  x: number
  y: number
  zone: string
}

function defaultPosition(index: number): Position {
  const columns = 4
  return {
    x: 12 + (index % columns) * 24,
    y: 15 + Math.floor(index / columns) * 32,
    zone: '',
  }
}

type TableStatus = 'free' | 'reserved' | 'occupied'

export function SalaPage() {
  const { slug } = useParams<{ slug: string }>()
  const { restaurant, loading: loadingRestaurant, error: restaurantError } =
    useRestaurant(slug ?? '')

  const [tables, setTables] = useState<RestaurantTable[]>([])
  const [reservations, setReservations] = useState<ReservationWithCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedDate, setSelectedDate] = useState(today())
  const [positions, setPositions] = useState<Record<string, Position>>({})
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTableId, setActiveTableId] = useState<string | null>(null)
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null)

  const canvasRef = useRef<HTMLDivElement>(null)
  const draggingTableId = useRef<string | null>(null)

  useEffect(() => {
    if (restaurant) load(restaurant.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurant, selectedDate])

  async function load(restaurantId: string) {
    setLoading(true)
    setError(null)

    const [tablesResult, reservationsResult] = await Promise.all([
      supabase
        .from('restaurant_tables')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: true }),
      supabase
        .from('reservations')
        .select('*, customers(id, first_name, last_name, phone, email)')
        .eq('restaurant_id', restaurantId)
        .eq('reservation_date', selectedDate)
        .order('reservation_time', { ascending: true }),
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

    const loadedTables = tablesResult.data ?? []
    setTables(loadedTables)
    setReservations(reservationsResult.data ?? [])

    const nextPositions: Record<string, Position> = {}
    loadedTables.forEach((t, index) => {
      nextPositions[t.id] =
        t.position_x != null && t.position_y != null
          ? { x: t.position_x, y: t.position_y, zone: t.zone ?? '' }
          : defaultPosition(index)
    })
    setPositions(nextPositions)
    setLoading(false)
  }

  const reservationsByTable = useMemo(() => {
    const map: Record<string, ReservationWithCustomer[]> = {}
    for (const r of reservations) {
      if (!r.table_id) continue
      if (r.status === 'cancelled' || r.status === 'no_show') continue
      if (!map[r.table_id]) map[r.table_id] = []
      map[r.table_id].push(r)
    }
    return map
  }, [reservations])

  const unassignedReservations = useMemo(
    () =>
      reservations.filter(
        (r) => !r.table_id && r.status !== 'cancelled' && r.status !== 'no_show',
      ),
    [reservations],
  )

  function statusOf(tableId: string): TableStatus {
    const list = reservationsByTable[tableId] ?? []
    if (list.some((r) => r.status === 'seated')) return 'occupied'
    if (list.length > 0) return 'reserved'
    return 'free'
  }

  async function assignTable(tableId: string) {
    if (!selectedReservationId) {
      setActiveTableId(tableId)
      return
    }

    const { error } = await supabase
      .from('reservations')
      .update({ table_id: tableId })
      .eq('id', selectedReservationId)

    if (error) {
      setError(error.message)
      return
    }

    setSelectedReservationId(null)
    setActiveTableId(tableId)
    if (restaurant) load(restaurant.id)
  }

  async function unassignReservation(reservationId: string) {
    const { error } = await supabase
      .from('reservations')
      .update({ table_id: null })
      .eq('id', reservationId)

    if (error) {
      setError(error.message)
      return
    }
    if (restaurant) load(restaurant.id)
  }

  function handlePointerDown(tableId: string) {
    if (!editMode) return
    draggingTableId.current = tableId
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const tableId = draggingTableId.current
    if (!tableId || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100

    setPositions((prev) => ({
      ...prev,
      [tableId]: {
        ...prev[tableId],
        x: Math.min(96, Math.max(0, x)),
        y: Math.min(92, Math.max(0, y)),
      },
    }))
  }

  function handlePointerUp() {
    draggingTableId.current = null
  }

  function handleZoneChange(tableId: string, zone: string) {
    setPositions((prev) => ({ ...prev, [tableId]: { ...prev[tableId], zone } }))
  }

  async function savePlan() {
    setSaving(true)
    setError(null)

    const updates = tables.map((t) => {
      const p = positions[t.id]
      return supabase
        .from('restaurant_tables')
        .update({ position_x: p.x, position_y: p.y, zone: p.zone || null })
        .eq('id', t.id)
    })

    const results = await Promise.all(updates)
    const failed = results.find((r) => r.error)

    setSaving(false)
    if (failed?.error) {
      setError(failed.error.message)
      return
    }
    setEditMode(false)
    if (restaurant) load(restaurant.id)
  }

  if (restaurantError) return <p>Error al conectar con Supabase: {restaurantError}</p>
  if (loadingRestaurant || !restaurant) return <p>Cargando...</p>

  const activeTable = tables.find((t) => t.id === activeTableId) ?? null
  const activeTableReservations = activeTableId
    ? reservations.filter((r) => r.table_id === activeTableId)
    : []

  return (
    <CrmLayout slug={slug ?? ''}>
      <main className="sala-page">
        <h1>Sala — {restaurant.name}</h1>

        <div className="sala-controls">
          <label>
            Fecha
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value)
                setActiveTableId(null)
                setSelectedReservationId(null)
              }}
            />
          </label>

          {!editMode && (
            <button onClick={() => setEditMode(true)}>Editar plano</button>
          )}
          {editMode && (
            <button onClick={savePlan} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar plano'}
            </button>
          )}
        </div>

        {error && <p className="dashboard-error">{error}</p>}
        {loading && <p>Cargando...</p>}

        {!loading && tables.length === 0 && (
          <p>
            Todavía no tienes mesas configuradas — ve a la pestaña "Mesas"
            para darlas de alta.
          </p>
        )}

        {!loading && tables.length > 0 && (
          <div className="sala-body">
            <div
              ref={canvasRef}
              className={`sala-canvas${editMode ? ' sala-canvas-editing' : ''}`}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              {tables.map((t) => {
                const pos = positions[t.id]
                if (!pos) return null
                const status = statusOf(t.id)
                const tableReservations = reservationsByTable[t.id] ?? []
                return (
                  <div
                    key={t.id}
                    className={`sala-table sala-table-${status}${
                      activeTableId === t.id ? ' sala-table-active' : ''
                    }${!t.active ? ' sala-table-inactive' : ''}`}
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                    onPointerDown={() => handlePointerDown(t.id)}
                    onClick={() => !editMode && assignTable(t.id)}
                  >
                    <span className="sala-table-name">{t.name}</span>
                    <span className="sala-table-capacity">{t.capacity}p</span>
                    {status !== 'free' && tableReservations[0] && (
                      <span className="sala-table-time">
                        {tableReservations[0].reservation_time.slice(0, 5)}
                      </span>
                    )}
                    {editMode && (
                      <input
                        className="sala-table-zone-input"
                        type="text"
                        placeholder="Zona"
                        value={pos.zone}
                        onPointerDown={(e) => e.stopPropagation()}
                        onChange={(e) => handleZoneChange(t.id, e.target.value)}
                      />
                    )}
                  </div>
                )
              })}
            </div>

            {!editMode && (
              <aside className="sala-side">
                <section>
                  <h2>Sin mesa asignada</h2>
                  {unassignedReservations.length === 0 && (
                    <p className="sala-empty">Todas las reservas de hoy tienen mesa.</p>
                  )}
                  <ul className="sala-reservation-list">
                    {unassignedReservations.map((r) => (
                      <li
                        key={r.id}
                        className={
                          selectedReservationId === r.id ? 'sala-reservation-selected' : ''
                        }
                        onClick={() =>
                          setSelectedReservationId(
                            selectedReservationId === r.id ? null : r.id,
                          )
                        }
                      >
                        <strong>{r.reservation_time.slice(0, 5)}</strong>{' '}
                        {customerName(r)} · {r.party_size}p
                      </li>
                    ))}
                  </ul>
                  {selectedReservationId && (
                    <p className="sala-hint">
                      Reserva seleccionada — pulsa una mesa para asignarla.
                    </p>
                  )}
                </section>

                {activeTable && (
                  <section>
                    <h2>{activeTable.name}</h2>
                    <p className="sala-empty">
                      Capacidad: {activeTable.capacity}p
                      {positions[activeTable.id]?.zone
                        ? ` · ${positions[activeTable.id]?.zone}`
                        : ''}
                    </p>
                    {activeTableReservations.length === 0 && (
                      <p className="sala-empty">Sin reservas hoy.</p>
                    )}
                    <ul className="sala-reservation-list">
                      {activeTableReservations.map((r) => (
                        <li key={r.id}>
                          <strong>{r.reservation_time.slice(0, 5)}</strong>{' '}
                          {customerName(r)} · {r.party_size}p
                          <button
                            className="sala-unassign"
                            onClick={() => unassignReservation(r.id)}
                          >
                            Quitar
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </aside>
            )}
          </div>
        )}
      </main>
    </CrmLayout>
  )
}
