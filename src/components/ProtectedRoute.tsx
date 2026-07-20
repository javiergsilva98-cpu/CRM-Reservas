import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useSession } from '../lib/useSession'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useSession()

  if (loading) return null
  if (!session) return <Navigate to="/admin/login" replace />

  return children
}
