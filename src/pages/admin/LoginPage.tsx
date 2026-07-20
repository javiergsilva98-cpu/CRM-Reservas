import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useSession } from '../../lib/useSession'
import './LoginPage.css'

export function LoginPage() {
  const { session, loading } = useSession()
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (loading) return null
  if (session) return <Navigate to="/admin" replace />

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSending(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/admin`,
      },
    })

    setSending(false)
    if (error) setError(error.message)
    else setSent(true)
  }

  return (
    <main className="login-page">
      <h1>Acceso panel privado</h1>

      {sent ? (
        <p>
          Te hemos enviado un enlace de acceso a <strong>{email}</strong>.
          Revisa tu correo y haz clic en el enlace para entrar.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" disabled={sending}>
            {sending ? 'Enviando...' : 'Enviarme el enlace de acceso'}
          </button>
        </form>
      )}
    </main>
  )
}
