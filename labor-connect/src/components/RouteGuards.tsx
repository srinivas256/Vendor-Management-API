import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export function RequireAuth() {
  const { token, user, isLoading } = useAuth()
  if (isLoading) return <div className="page-loading">Loading your workspace…</div>
  if (!token || !user) return <Navigate to="/login" replace />
  return <Outlet />
}

export function GuestOnly() {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div className="page-loading">Loading your workspace…</div>
  if (user) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
