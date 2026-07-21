import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { CrmLayout } from '../../components/CrmLayout'
import {
  RESERVATION_STATUS_LABELS,
  type Customer,
  type Reservation,
} from '../../types'
import './CustomerDetailPage.css'

function toCsv(values: string[]) {
  return values.join(', ')
}

function fromCsv(value: string): string[] {
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
}

export function CustomerDetailPage() {
  const { slug, customerId } = useParams<{
    slug: string
    customerId: string
  }>()

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [birthday, setBirthday] = useState('')
  const [company, setCompany] = useState('')
  const [allergies, setAllergies] = useState('')
  const [diet, setDiet] = useState('')
  const [tags, setTags] = useState('')
  const [notes, setNotes] = useState('')
  const [gdprMarketing, setGdprMarketing] = useState(false)

  useEffect(() => {
    if (customerId) load(customerId)
  }, [customerId])

  async function load(id: string) {
    setLoading(true)
    const [customerResult, reservationsResult] = await Promise.all([
      supabase.from('customers').select('*').eq('id', id).single(),
      supabase
        .from('reservations')
        .select('*')
        .eq('customer_id', id)
        .order('reservation_date', { ascending: false }),
    ])

    if (customerResult.error) {
      setError(customerResult.error.message)
      setLoading(false)
      return
    }

    const c = customerResult.data as Customer
    setCustomer(c)
    setFirstName(c.first_name)
    setLastName(c.last_name ?? '')
    setPhone(c.phone ?? '')
    setEmail(c.email ?? '')
    setBirthday(c.birthday ?? '')
    setCompany(c.company ?? '')
    setAllergies(toCsv(c.allergies))
    setDiet(toCsv(c.diet))
    setTags(toCsv(c.tags))
    setNotes(c.notes ?? '')
    setGdprMarketing(c.gdpr_marketing)

    setReservations(reservationsResult.data ?? [])
    setLoading(false)
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault()
    if (!customer) return

    setSaving(true)
    setError(null)
    setSaved(false)

    const { error } = await supabase
      .from('customers')
      .update({
        first_name: firstName,
        last_name: lastName || null,
        phone: phone || null,
        email: email || null,
        birthday: birthday || null,
        company: company || null,
        allergies: fromCsv(allergies),
        diet: fromCsv(diet),
        tags: fromCsv(tags),
        notes: notes || null,
        gdpr_marketing: gdprMarketing,
        gdpr_consent_at: gdprMarketing ? new Date().toISOString() : null,
      })
      .eq('id', customer.id)

    setSaving(false)
    if (error) setError(error.message)
    else setSaved(true)
  }

  if (loading) return <p>Cargando...</p>
  if (error) return <p className="dashboard-error">{error}</p>
  if (!customer) return <p>Cliente no encontrado.</p>

  return (
    <CrmLayout slug={slug ?? ''}>
      <main className="customer-detail-page">
        <h1>
          {customer.first_name} {customer.last_name}
        </h1>

        <form onSubmit={handleSave} className="customer-form">
          <div className="customer-form-grid">
            <label>
              Nombre *
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </label>
            <label>
              Apellidos
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </label>
            <label>
              Teléfono
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label>
              Cumpleaños
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
              />
            </label>
            <label>
              Empresa
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </label>
          </div>

          <label>
            Alergias (separadas por coma)
            <input
              type="text"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
            />
          </label>

          <label>
            Dieta (separadas por coma)
            <input
              type="text"
              value={diet}
              onChange={(e) => setDiet(e.target.value)}
            />
          </label>

          <label>
            Tags (separadas por coma)
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </label>

          <label>
            Notas del maître (privadas)
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </label>

          <label className="customer-checkbox">
            <input
              type="checkbox"
              checked={gdprMarketing}
              onChange={(e) => setGdprMarketing(e.target.checked)}
            />
            Acepta recibir comunicaciones de marketing
          </label>

          <div className="customer-metrics">
            Visitas: {customer.visits_count} · No-shows:{' '}
            {customer.no_show_count} · Cancelaciones: {customer.cancel_count}
          </div>

          <button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
          {saved && <span className="customer-saved">Guardado ✓</span>}
        </form>

        <h2>Historial de reservas</h2>
        {reservations.length === 0 && <p>Sin reservas todavía.</p>}
        {reservations.length > 0 && (
          <table className="customer-reservations-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Personas</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id}>
                  <td>{r.reservation_date}</td>
                  <td>{r.reservation_time}</td>
                  <td>{r.party_size}</td>
                  <td>{RESERVATION_STATUS_LABELS[r.status]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </CrmLayout>
  )
}
