import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, PointerEvent as ReactPointerEvent } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useRestaurant } from '../../lib/useRestaurant'
import { CrmLayout } from '../../components/CrmLayout'
import {
  WEEKDAY_LABELS,
  type LayoutPreset,
  type LayoutPresetTable,
  type LayoutScheduleEntry,
  type ReservationWithCustomer,
  type RestaurantRoom,
  type RestaurantTable,
} from '../../types'
import './SalaPage.css'

const ALL_ROOMS = '__all__'
const UNASSIGNED = '__unassigned__'

function today() {
  return new Date().toISOString().slice(0, 10)
}

function customerName(r: ReservationWithCustomer) {
  if (!r.customers) return 'Cliente'
  return [r.customers.first_name, r.customers.last_name].filter(Boolean).join(' ')
}

function defaultPosition(index: number) {
  const columns = 4
  return {
    x: 12 + (index % columns) * 24,
    y: 15 + Math.floor(index / columns) * 32,
  }
}

function weekdayOf(date: string) {
  return new Date(`${date}T00:00:00`).getDay()
}

function resolvePresetId(schedule: LayoutScheduleEntry[], date: string): string | null {
  const dateMatches = schedule.filter(
    (s) => s.date_start && s.date_end && date >= s.date_start && date <= s.date_end,
  )
  if (dateMatches.length > 0) {
    return [...dateMatches].sort((a, b) => b.created_at.localeCompare(a.created_at))[0].preset_id
  }
  const dow = weekdayOf(date)
  const dowMatch = schedule.find((s) => s.day_of_week === dow)
  return dowMatch ? dowMatch.preset_id : null
}

type TableStatus = 'free' | 'reserved' | 'occupied'

interface EditState {
  x: number
  y: number
  active: boolean
  room_id: string | null
}

type SaveMode = 'habitual' | 'dias' | 'plantilla'

export function SalaPage() {
  const { slug } = useParams<{ slug: string }>()
  const { restaurant, loading: loadingRestaurant, error: restaurantError } =
    useRestaurant(slug ?? '')

  const [tables, setTables] = useState<RestaurantTable[]>([])
  const [rooms, setRooms] = useState<RestaurantRoom[]>([])
  const [presets, setPresets] = useState<LayoutPreset[]>([])
  const [presetTables, setPresetTables] = useState<LayoutPresetTable[]>([])
  const [scheduleEntries, setScheduleEntries] = useState<LayoutScheduleEntry[]>([])
  const [reservations, setReservations] = useState<ReservationWithCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedDate, setSelectedDate] = useState(today())
  const [currentRoomTab, setCurrentRoomTab] = useState<string>(ALL_ROOMS)
  const [editMode, setEditMode] = useState(false)
  const [positions, setPositions] = useState<Record<string, EditState>>({})
  const [saving, setSaving] = useState(false)
  const [activeTableId, setActiveTableId] = useState<string | null>(null)
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null)

  const [addingRoom, setAddingRoom] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [newTableName, setNewTableName] = useState('')
  const [newTableCapacity, setNewTableCapacity] = useState(2)

  const [showSavePanel, setShowSavePanel] = useState(false)
  const [saveMode, setSaveMode] = useState<SaveMode>('habitual')
  const [saveWeekdays, setSaveWeekdays] = useState<number[]>([])
  const [saveDateStart, setSaveDateStart] = useState('')
  const [saveDateEnd, setSaveDateEnd] = useState('')
  const [presetTarget, setPresetTarget] = useState<string>('new')
  const [newPresetName, setNewPresetName] = useState('')

  const canvasRef = useRef<HTMLDivElement>(null)
  const draggingTableId = useRef<string | null>(null)

  useEffect(() => {
    if (restaurant) load(restaurant.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurant, selectedDate])

  useEffect(() => {
    if (currentRoomTab === ALL_ROOMS) {
      if (rooms.length > 0) setCurrentRoomTab(rooms[0].id)
      return
    }
    if (currentRoomTab === UNASSIGNED) return
    if (!rooms.some((r) => r.id === currentRoomTab)) {
      setCurrentRoomTab(rooms[0]?.id ?? ALL_ROOMS)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms])

  async function load(restaurantId: string) {
    setLoading(true)
    setError(null)

    const [tablesResult, roomsResult, presetsResult, scheduleResult, reservationsResult] =
      await Promise.all([
        supabase
          .from('restaurant_tables')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .order('created_at', { ascending: true }),
        supabase
          .from('restaurant_rooms')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .order('created_at', { ascending: true }),
        supabase
          .from('restaurant_layout_presets')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .order('created_at', { ascending: true }),
        supabase.from('restaurant_layout_schedule').select('*').eq('restaurant_id', restaurantId),
        supabase
          .from('reservations')
          .select('*, customers(id, first_name, last_name, phone, email)')
          .eq('restaurant_id', restaurantId)
          .eq('reservation_date', selectedDate)
          .order('reservation_time', { ascending: true }),
      ])

    for (const result of [tablesResult, roomsResult, presetsResult, scheduleResult, reservationsResult]) {
      if (result.error) {
        setError(result.error.message)
        setLoading(false)
        return
      }
    }

    const loadedPresets = presetsResult.data ?? []
    const presetIds = loadedPresets.map((p) => p.id)
    let loadedPresetTables: LayoutPresetTable[] = []
    if (presetIds.length > 0) {
      const { data, error: presetTablesError } = await supabase
        .from('restaurant_layout_preset_tables')
        .select('*')
        .in('preset_id', presetIds)
      if (presetTablesError) {
        setError(presetTablesError.message)
        setLoading(false)
        return
      }
      loadedPresetTables = data ?? []
    }

    setTables(tablesResult.data ?? [])
    setRooms(roomsResult.data ?? [])
    setPresets(loadedPresets)
    setScheduleEntries(scheduleResult.data ?? [])
    setPresetTables(loadedPresetTables)
    setReservations(reservationsResult.data ?? [])
    setLoading(false)
  }

  const resolvedPresetId = useMemo(
    () => resolvePresetId(scheduleEntries, selectedDate),
    [scheduleEntries, selectedDate],
  )

  const effectiveTables = useMemo(() => {
    const overrides = new Map(
      presetTables.filter((pt) => pt.preset_id === resolvedPresetId).map((pt) => [pt.table_id, pt]),
    )
    return tables.map((t) => {
      const o = overrides.get(t.id)
      if (!o) return t
      return {
        ...t,
        active: o.active,
        position_x: o.position_x,
        position_y: o.position_y,
        room_id: o.room_id ?? t.room_id,
      }
    })
  }, [tables, presetTables, resolvedPresetId])

  useEffect(() => {
    if (editMode) return
    const next: Record<string, EditState> = {}
    effectiveTables.forEach((t, index) => {
      const fallback = defaultPosition(index)
      next[t.id] = {
        x: t.position_x ?? fallback.x,
        y: t.position_y ?? fallback.y,
        active: t.active,
        room_id: t.room_id,
      }
    })
    setPositions(next)
  }, [effectiveTables, editMode])

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

  const visibleTables = tables.filter((t) => {
    const roomId = positions[t.id]?.room_id ?? t.room_id
    if (currentRoomTab === ALL_ROOMS) return true
    if (currentRoomTab === UNASSIGNED) return roomId === null
    return roomId === currentRoomTab
  })

  const hasUnassignedTable = tables.some((t) => (positions[t.id]?.room_id ?? t.room_id) === null)

  async function assignTable(tableId: string) {
    if (!selectedReservationId) {
      setActiveTableId(tableId)
      return
    }

    const { error: assignError } = await supabase
      .from('reservations')
      .update({ table_id: tableId })
      .eq('id', selectedReservationId)

    if (assignError) {
      setError(assignError.message)
      return
    }

    setSelectedReservationId(null)
    setActiveTableId(tableId)
    if (restaurant) load(restaurant.id)
  }

  async function unassignReservation(reservationId: string) {
    const { error: unassignError } = await supabase
      .from('reservations')
      .update({ table_id: null })
      .eq('id', reservationId)

    if (unassignError) {
      setError(unassignError.message)
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

  function toggleTableActive(tableId: string) {
    setPositions((prev) => ({ ...prev, [tableId]: { ...prev[tableId], active: !prev[tableId].active } }))
  }

  function changeTableRoom(tableId: string, roomId: string) {
    setPositions((prev) => ({
      ...prev,
      [tableId]: { ...prev[tableId], room_id: roomId === UNASSIGNED ? null : roomId },
    }))
  }

  async function addRoom() {
    if (!restaurant || !newRoomName.trim()) return
    setError(null)
    const { data, error: addError } = await supabase
      .from('restaurant_rooms')
      .insert({ restaurant_id: restaurant.id, name: newRoomName.trim() })
      .select('id')
      .single()

    if (addError) {
      setError(addError.message)
      return
    }
    setNewRoomName('')
    setAddingRoom(false)
    await load(restaurant.id)
    if (data) setCurrentRoomTab(data.id)
  }

  async function deleteRoom(roomId: string) {
    if (!restaurant) return
    const { error: deleteError } = await supabase.from('restaurant_rooms').delete().eq('id', roomId)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    await load(restaurant.id)
  }

  async function addTable(event: FormEvent) {
    event.preventDefault()
    if (!restaurant) return
    setError(null)

    const roomId = currentRoomTab === ALL_ROOMS || currentRoomTab === UNASSIGNED ? null : currentRoomTab
    const index = tables.filter((t) => (t.room_id ?? null) === roomId).length
    const pos = defaultPosition(index)

    const { error: addError } = await supabase.from('restaurant_tables').insert({
      restaurant_id: restaurant.id,
      name: newTableName,
      capacity: newTableCapacity,
      room_id: roomId,
      position_x: pos.x,
      position_y: pos.y,
    })

    if (addError) {
      setError(addError.message)
      return
    }
    setNewTableName('')
    setNewTableCapacity(2)
    await load(restaurant.id)
  }

  function openSavePanel() {
    const preset = presets.find((p) => p.id === resolvedPresetId)
    setSaveWeekdays([])
    if (preset?.name) {
      setSaveMode('plantilla')
      setPresetTarget(preset.id)
      setSaveDateStart('')
      setSaveDateEnd('')
    } else if (preset) {
      setSaveMode('dias')
      setSaveDateStart(selectedDate)
      setSaveDateEnd(selectedDate)
    } else {
      setSaveMode('habitual')
      setSaveDateStart('')
      setSaveDateEnd('')
      setPresetTarget(namedPresets[0]?.id ?? 'new')
    }
    setShowSavePanel(true)
  }

  function toggleSaveWeekday(dow: number) {
    setSaveWeekdays((prev) => (prev.includes(dow) ? prev.filter((d) => d !== dow) : [...prev, dow].sort()))
  }

  const namedPresets = presets.filter((p) => p.name)

  async function confirmSave() {
    if (!restaurant) return
    setSaving(true)
    setError(null)

    try {
      const tableIds = tables.map((t) => t.id)

      if (saveMode === 'habitual') {
        await Promise.all(
          tableIds.map((id) => {
            const p = positions[id]
            return supabase
              .from('restaurant_tables')
              .update({ position_x: p.x, position_y: p.y, active: p.active, room_id: p.room_id })
              .eq('id', id)
              .throwOnError()
          }),
        )
      } else {
        let targetPresetId: string

        if (saveMode === 'plantilla') {
          if (presetTarget === 'new') {
            const { data, error: insertError } = await supabase
              .from('restaurant_layout_presets')
              .insert({ restaurant_id: restaurant.id, name: newPresetName.trim() })
              .select('id')
              .single()
            if (insertError) throw insertError
            targetPresetId = data.id
          } else {
            targetPresetId = presetTarget
            await supabase
              .from('restaurant_layout_presets')
              .update({ updated_at: new Date().toISOString() })
              .eq('id', targetPresetId)
              .throwOnError()
          }
        } else {
          const reuseUnnamed = presets.find((p) => p.id === resolvedPresetId && !p.name)
          if (reuseUnnamed) {
            targetPresetId = reuseUnnamed.id
          } else {
            const { data, error: insertError } = await supabase
              .from('restaurant_layout_presets')
              .insert({ restaurant_id: restaurant.id, name: null })
              .select('id')
              .single()
            if (insertError) throw insertError
            targetPresetId = data.id
          }
        }

        await supabase
          .from('restaurant_layout_preset_tables')
          .delete()
          .eq('preset_id', targetPresetId)
          .throwOnError()

        const rows = tableIds.map((id) => ({
          preset_id: targetPresetId,
          table_id: id,
          active: positions[id].active,
          position_x: positions[id].x,
          position_y: positions[id].y,
          room_id: positions[id].room_id,
        }))
        if (rows.length > 0) {
          await supabase.from('restaurant_layout_preset_tables').insert(rows).throwOnError()
        }

        for (const dow of saveWeekdays) {
          await supabase
            .from('restaurant_layout_schedule')
            .upsert(
              { restaurant_id: restaurant.id, preset_id: targetPresetId, day_of_week: dow },
              { onConflict: 'restaurant_id,day_of_week' },
            )
            .throwOnError()
        }
        if (saveDateStart && saveDateEnd) {
          await supabase
            .from('restaurant_layout_schedule')
            .insert({
              restaurant_id: restaurant.id,
              preset_id: targetPresetId,
              date_start: saveDateStart,
              date_end: saveDateEnd,
            })
            .throwOnError()
        }
      }

      setShowSavePanel(false)
      setEditMode(false)
      await load(restaurant.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar la configuración')
    } finally {
      setSaving(false)
    }
  }

  async function deletePreset(presetId: string) {
    const { error: deleteError } = await supabase
      .from('restaurant_layout_presets')
      .delete()
      .eq('id', presetId)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    if (restaurant) load(restaurant.id)
  }

  function scheduleSummary(presetId: string) {
    const entries = scheduleEntries.filter((s) => s.preset_id === presetId)
    const weekdays = entries
      .filter((s) => s.day_of_week !== null)
      .map((s) => WEEKDAY_LABELS[s.day_of_week as number])
    const ranges = entries
      .filter((s) => s.date_start && s.date_end)
      .map((s) => `${s.date_start} → ${s.date_end}`)
    const parts = [...weekdays.length ? [weekdays.join(', ')] : [], ...ranges]
    return parts.length > 0 ? parts.join(' · ') : 'Sin días asignados'
  }

  if (restaurantError) return <p>Error al conectar con Supabase: {restaurantError}</p>
  if (loadingRestaurant || !restaurant) return <p>Cargando...</p>

  const activeTable = tables.find((t) => t.id === activeTableId) ?? null
  const activeTableReservations = activeTableId
    ? reservations.filter((r) => r.table_id === activeTableId)
    : []

  const tabs = rooms.length > 0 ? rooms.map((r) => ({ id: r.id, name: r.name })) : []
  if (rooms.length > 0 && hasUnassignedTable) tabs.push({ id: UNASSIGNED, name: 'Sin sala' })

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

          {!editMode && <button onClick={() => setEditMode(true)}>Editar plano</button>}
          {editMode && (
            <>
              <button onClick={openSavePanel} disabled={saving}>
                Guardar cambios
              </button>
              <button className="sala-cancel" onClick={() => setEditMode(false)}>
                Cancelar
              </button>
            </>
          )}
        </div>

        {presets.some((p) => p.id === resolvedPresetId && p.name) && (
          <p className="sala-preset-banner">
            Este día usa la plantilla "{presets.find((p) => p.id === resolvedPresetId)?.name}".
          </p>
        )}

        {rooms.length > 0 && (
          <div className="sala-tabs">
            {tabs.map((tab) => (
              <div key={tab.id} className={`sala-tab${currentRoomTab === tab.id ? ' sala-tab-active' : ''}`}>
                <button onClick={() => setCurrentRoomTab(tab.id)}>{tab.name}</button>
                {tab.id !== UNASSIGNED && editMode && (
                  <button className="sala-tab-delete" onClick={() => deleteRoom(tab.id)} title="Eliminar sala">
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {editMode && rooms.length < 3 && !addingRoom && (
          <button className="sala-add-room-button" onClick={() => setAddingRoom(true)}>
            + Añadir sala
          </button>
        )}
        {editMode && addingRoom && (
          <div className="sala-add-room-form">
            <input
              type="text"
              placeholder="Nombre de la sala (ej. Terraza)"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
            />
            <button onClick={addRoom}>Añadir</button>
            <button className="sala-cancel" onClick={() => setAddingRoom(false)}>
              Cancelar
            </button>
          </div>
        )}

        {editMode && (
          <form onSubmit={addTable} className="sala-add-table-form">
            <input
              type="text"
              placeholder="Nombre (ej. Mesa 4)"
              required
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
            />
            <input
              type="number"
              min={1}
              required
              value={newTableCapacity}
              onChange={(e) => setNewTableCapacity(Number(e.target.value))}
            />
            <button type="submit">+ Añadir mesa</button>
          </form>
        )}

        {error && <p className="dashboard-error">{error}</p>}
        {loading && <p>Cargando...</p>}

        {!loading && tables.length === 0 && !editMode && (
          <p>Todavía no tienes mesas configuradas — pulsa "Editar plano" para añadirlas.</p>
        )}

        {!loading && (
          <div className="sala-body">
            <div
              ref={canvasRef}
              className={`sala-canvas${editMode ? ' sala-canvas-editing' : ''}`}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              {visibleTables.map((t) => {
                const pos = positions[t.id]
                if (!pos) return null
                const status = statusOf(t.id)
                const tableReservations = reservationsByTable[t.id] ?? []
                return (
                  <div
                    key={t.id}
                    className={`sala-table sala-table-${status}${
                      activeTableId === t.id ? ' sala-table-active' : ''
                    }${!pos.active ? ' sala-table-inactive' : ''}`}
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                    onPointerDown={() => handlePointerDown(t.id)}
                    onClick={() => !editMode && assignTable(t.id)}
                  >
                    <span className="sala-table-name">{t.name}</span>
                    <span className="sala-table-capacity">{t.capacity}p</span>
                    {!editMode && status !== 'free' && tableReservations[0] && (
                      <span className="sala-table-time">
                        {tableReservations[0].reservation_time.slice(0, 5)}
                      </span>
                    )}
                    {editMode && (
                      <div className="sala-table-edit-controls" onPointerDown={(e) => e.stopPropagation()}>
                        <button type="button" onClick={() => toggleTableActive(t.id)}>
                          {pos.active ? 'Activa' : 'Inactiva'}
                        </button>
                        {rooms.length > 0 && (
                          <select
                            value={pos.room_id ?? UNASSIGNED}
                            onChange={(e) => changeTableRoom(t.id, e.target.value)}
                          >
                            <option value={UNASSIGNED}>Sin sala</option>
                            {rooms.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
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
                    <p className="sala-empty">Capacidad: {activeTable.capacity}p</p>
                    {activeTableReservations.length === 0 && (
                      <p className="sala-empty">Sin reservas hoy.</p>
                    )}
                    <ul className="sala-reservation-list">
                      {activeTableReservations.map((r) => (
                        <li key={r.id}>
                          <span>
                            <strong>{r.reservation_time.slice(0, 5)}</strong>{' '}
                            {customerName(r)} · {r.party_size}p
                          </span>
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

                {namedPresets.length > 0 && (
                  <section>
                    <h2>Plantillas</h2>
                    <ul className="sala-preset-list">
                      {namedPresets.map((p) => (
                        <li key={p.id}>
                          <div>
                            <strong>{p.name}</strong>
                            <p className="sala-empty">{scheduleSummary(p.id)}</p>
                          </div>
                          <button className="sala-unassign" onClick={() => deletePreset(p.id)}>
                            Eliminar
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

        {showSavePanel && (
          <div className="sala-save-panel">
            <h2>¿Cómo quieres guardar estos cambios?</h2>

            <label className="sala-radio">
              <input
                type="radio"
                checked={saveMode === 'habitual'}
                onChange={() => setSaveMode('habitual')}
              />
              De forma habitual (todos los días sin otra configuración asignada)
            </label>
            <label className="sala-radio">
              <input
                type="radio"
                checked={saveMode === 'dias'}
                onChange={() => setSaveMode('dias')}
              />
              Solo para día(s) concretos
            </label>
            <label className="sala-radio">
              <input
                type="radio"
                checked={saveMode === 'plantilla'}
                onChange={() => setSaveMode('plantilla')}
              />
              Como plantilla reutilizable
            </label>

            {(saveMode === 'dias' || saveMode === 'plantilla') && (
              <div className="sala-save-days">
                <p>Días de la semana</p>
                <div className="sala-weekdays">
                  {WEEKDAY_LABELS.map((label, dow) => (
                    <button
                      key={dow}
                      type="button"
                      className={saveWeekdays.includes(dow) ? 'sala-weekday-selected' : ''}
                      onClick={() => toggleSaveWeekday(dow)}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <p>O un rango de fechas (opcional, ej. temporada de verano)</p>
                <div className="sala-date-range">
                  <input
                    type="date"
                    value={saveDateStart}
                    onChange={(e) => setSaveDateStart(e.target.value)}
                  />
                  <span>→</span>
                  <input
                    type="date"
                    value={saveDateEnd}
                    onChange={(e) => setSaveDateEnd(e.target.value)}
                  />
                </div>
              </div>
            )}

            {saveMode === 'plantilla' && (
              <div className="sala-preset-target">
                <label>
                  Plantilla
                  <select value={presetTarget} onChange={(e) => setPresetTarget(e.target.value)}>
                    {namedPresets.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                    {namedPresets.length < 3 && <option value="new">+ Nueva plantilla</option>}
                  </select>
                </label>
                {presetTarget === 'new' && (
                  <input
                    type="text"
                    placeholder="Nombre de la plantilla (ej. Fin de semana)"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                  />
                )}
              </div>
            )}

            <div className="sala-save-actions">
              <button onClick={confirmSave} disabled={saving}>
                {saving ? 'Guardando...' : 'Confirmar'}
              </button>
              <button className="sala-cancel" onClick={() => setShowSavePanel(false)}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </main>
    </CrmLayout>
  )
}
