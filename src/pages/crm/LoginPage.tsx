import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useSession } from '../../lib/useSession'
import './LoginPage.css'

export function LoginPage() {
  const { slug } = useParams<{ slug: string }>()
  const { session, loading } = useSession()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmationSent, setConfirmationSent] = useState(false)

  if (loading) return null
  if (session) return <Navigate to={`/${slug}/crm`} replace />

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/${slug}/crm` },
      })
      setSubmitting(false)
      if (error) setError(error.message)
      else if (!data.session) setConfirmationSent(true)
      // si hay sesión, el useSession del componente redirige solo
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      setSubmitting(false)
      if (error) setError(error.message)
    }
  }

  if (confirmationSent) {
    return (
      <main className="login-page">
        <h1>Confirma tu cuenta</h1>
        <p>
          Te hemos enviado un correo a <strong>{email}</strong>. Haz clic en
          el enlace para confirmar tu cuenta y poder entrar.
        </p>
      </main>
    )
  }

  return (
    <main className="login-page">
      <h1>{mode === 'login' ? 'Acceso al CRM' : 'Crear cuenta'}</h1>

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

        <label>
          Contraseña
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && <p className="login-error">{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting
            ? 'Enviando...'
            : mode === 'login'
              ? 'Entrar'
              : 'Crear cuenta'}
        </button>
      </form>

      <p className="login-toggle">
        {mode === 'login' ? (
          <>
            ¿Aún no tienes cuenta?{' '}
            <button type="button" onClick={() => setMode('signup')}>
              Créala aquí
            </button>
          </>
        ) : (
          <>
            ¿Ya tienes cuenta?{' '}
            <button type="button" onClick={() => setMode('login')}>
              Inicia sesión
            </button>
          </>
        )}
      </p>
    </main>
  )
}
