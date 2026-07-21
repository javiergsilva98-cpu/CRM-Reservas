import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useRestaurant } from '../../lib/useRestaurant'
import { CrmLayout } from '../../components/CrmLayout'
import type { Customer } from '../../types'
import './CustomersPage.css'

export function CustomersPage() {
  const { slug } = useParams<{ slug: string }>()
  const { restaurant, loading: loadingRestaurant, error: restaurantError } =
    useRestaurant(slug ?? '')

  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (restaurant) loadCustomers(restaurant.id)
  }, [restaurant])

  async function loadCustomers(restaurantId: string) {
    setLoading(true)
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setCustomers(data ?? [])
    setLoading(false)
  }

  if (restaurantError) return <p>Error al conectar con Supabase: {restaurantError}</p>
  if (loadingRestaurant || !restaurant) return <p>Cargando...</p>

  const term = search.trim().toLowerCase()
  const filtered = term
    ? customers.filter((c) =>
        [c.first_name, c.last_name, c.phone, c.email, ...c.tags]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(term)),
      )
    : customers

  return (
    <CrmLayout slug={slug ?? ''}>
      <main className="customers-page">
        <h1>Clientes — {restaurant.name}</h1>

        {error && <p className="dashboard-error">{error}</p>}

        <input
          type="search"
          placeholder="Buscar por nombre, teléfono, email o tag..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="customers-search"
        />

        {loading && <p>Cargando...</p>}
        {!loading && filtered.length === 0 && <p>No hay clientes todavía.</p>}

        {!loading && filtered.length > 0 && (
          <table className="customers-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Contacto</th>
                <th>Visitas</th>
                <th>No-shows</th>
                <th>Tags</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link to={`/${slug}/crm/clientes/${c.id}`}>
                      {c.first_name} {c.last_name}
                    </Link>
                  </td>
                  <td>
                    {c.phone && <div>{c.phone}</div>}
                    {c.email && <div>{c.email}</div>}
                  </td>
                  <td>{c.visits_count}</td>
                  <td>{c.no_show_count}</td>
                  <td>{c.tags.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </CrmLayout>
  )
}
