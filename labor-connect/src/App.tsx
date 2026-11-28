import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/useAuth'
import { RequireAuth, GuestOnly } from './components/RouteGuards'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import './App.css'

function HomeRedirect() {
  const { token, user, isLoading } = useAuth()
  if (isLoading) return <div className="page-loading">Loading your workspace…</div>
  return <Navigate to={token && user ? '/dashboard' : '/login'} replace />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
      </Route>
      <Route element={<RequireAuth />}>
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  )
}

export default App
