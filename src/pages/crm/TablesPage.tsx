import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useRestaurant } from '../../lib/useRestaurant'
import { CrmLayout } from '../../components/CrmLayout'
import type { RestaurantTable } from '../../types'
import './TablesPage.css'

export function TablesPage() {
  const { slug } = useParams<{ slug: string }>()
  const { restaurant, loading: loadingRestaurant, error: restaurantError } =
    useRestaurant(slug ?? '')

  const [tables, setTables] = useState<RestaurantTable[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [capacity, setCapacity] = useState(2)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (restaurant) loadTables(restaurant.id)
  }, [restaurant])

  async function loadTables(restaurantId: string) {
    setLoading(true)
    const { data, error } = await supabase
      .from('restaurant_tables')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: true })

    if (error) setError(error.message)
    else setTables(data ?? [])
    setLoading(false)
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    if (!restaurant) return
    setCreating(true)
    setError(null)

    const { error } = await supabase.from('restaurant_tables').insert({
      restaurant_id: restaurant.id,
      name,
      capacity,
    })

    setCreating(false)
    if (error) {
      setError(error.message)
      return
    }

    setName('')
    setCapacity(2)
    loadTables(restaurant.id)
  }

  async function toggleActive(id: string, active: boolean) {
    const { error } = await supabase
      .from('restaurant_tables')
      .update({ active: !active })
      .eq('id', id)

    if (error) {
      setError(error.message)
      return
    }

    setTables((prev) =>
      prev.map((t) => (t.id === id ? { ...t, active: !active } : t)),
    )
  }

  if (restaurantError) return <p>Error al conectar con Supabase: {restaurantError}</p>
  if (loadingRestaurant || !restaurant) return <p>Cargando...</p>

  const totalCapacity = tables
    .filter((t) => t.active)
    .reduce((sum, t) => sum + t.capacity, 0)

  return (
    <CrmLayout slug={slug ?? ''}>
      <main className="tables-page">
        <h1>Mesas — {restaurant.name}</h1>
        <p className="tables-total">
          Aforo total activo: <strong>{totalCapacity}</strong> comensales
        </p>

        {error && <p className="dashboard-error">{error}</p>}

        <form onSubmit={handleCreate} className="new-table-form">
          <input
            type="text"
            placeholder="Nombre (ej. Mesa 4, Terraza 1)"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="number"
            min={1}
            required
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
          />
          <button type="submit" disabled={creating}>
            {creating ? 'Añadiendo...' : 'Añadir mesa'}
          </button>
        </form>

        {loading && <p>Cargando...</p>}

        {!loading && tables.length === 0 && <p>No hay mesas configuradas.</p>}

        {!loading && tables.length > 0 && (
          <table className="tables-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Capacidad</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {tables.map((t) => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td>{t.capacity}</td>
                  <td>
                    <button onClick={() => toggleActive(t.id, t.active)}>
                      {t.active ? 'Activa' : 'Inactiva'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </CrmLayout>
  )
}
