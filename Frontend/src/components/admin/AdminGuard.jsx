import { Navigate, Outlet } from 'react-router-dom'

export default function AdminGuard() {
  const token = localStorage.getItem('token')
  let user = null
  try {
    user = JSON.parse(localStorage.getItem('user'))
  } catch {
    user = null
  }

  if (!token || !user) return <Navigate to="/login" replace />

  if (user.role !== 'admin' && user.role !== 'superadmin') {
    return <Navigate to="/home" replace />
  }

  return <Outlet />
}