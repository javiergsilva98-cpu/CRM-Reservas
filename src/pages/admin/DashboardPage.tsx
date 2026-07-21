import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import type { Restaurant } from '../../types'
import './DashboardPage.css'

export function DashboardPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadRestaurants()
  }, [])

  async function loadRestaurants() {
    setLoading(true)
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) setError(error.message)
    else setRestaurants(data ?? [])
    setLoading(false)
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    setCreating(true)
    setError(null)

    const { error } = await supabase.from('restaurants').insert({
      name,
      slug,
      owner_email: ownerEmail,
    })

    setCreating(false)
    if (error) {
      setError(error.message)
      return
    }

    setName('')
    setSlug('')
    setOwnerEmail('')
    loadRestaurants()
  }

  async function toggleActive(id: string, active: boolean) {
    const { error } = await supabase
      .from('restaurants')
      .update({ active: !active })
      .eq('id', id)

    if (error) {
      setError(error.message)
      return
    }

    setRestaurants((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !active } : r)),
    )
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <h1>Restaurantes</h1>
        <button onClick={handleSignOut}>Cerrar sesión</button>
      </header>

      {error && <p className="dashboard-error">{error}</p>}

      <form onSubmit={handleCreate} className="new-restaurant-form">
        <input
          type="text"
          placeholder="Nombre"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="slug (ej. casa-paco)"
          required
          pattern="[a-z0-9-]+"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email del dueño"
          required
          value={ownerEmail}
          onChange={(e) => setOwnerEmail(e.target.value)}
        />
        <button type="submit" disabled={creating}>
          {creating ? 'Creando...' : 'Añadir restaurante'}
        </button>
      </form>

      {loading && <p>Cargando...</p>}

      {!loading && restaurants.length === 0 && (
        <p>
          No hay restaurantes todavía (o tu usuario no tiene acceso de
          superadmin — revisa la tabla <code>platform_admins</code>).
        </p>
      )}

      {!loading && restaurants.length > 0 && (
        <div className="dashboard-table-wrapper">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Slug</th>
                <th>Email dueño</th>
                <th>Estado</th>
                <th>Enlaces</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.slug}</td>
                  <td>{r.owner_email}</td>
                  <td>
                    <button onClick={() => toggleActive(r.id, r.active)}>
                      {r.active ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td>
                    <Link to={`/${r.slug}`}>Landing</Link>
                    {' · '}
                    <Link to={`/${r.slug}/crm`}>CRM</Link>
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
