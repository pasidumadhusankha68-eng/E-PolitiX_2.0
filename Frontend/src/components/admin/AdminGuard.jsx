import { useEffect } from 'react'
import { useNavigate, Outlet } from 'react-router-dom'
import { DISABLE_ADMIN_AUTH } from '../../config/devFlags'

// TEMP: admin auth disabled (set to false to re-enable)
export default function AdminGuard() {
  const navigate = useNavigate()

  if (DISABLE_ADMIN_AUTH) return <Outlet />

  useEffect(() => {
    let user = {}
    try {
      user = JSON.parse(localStorage.getItem('user') || '{}')
    } catch {
      user = {}
    }
    if (!user.email || user.role !== 'admin') {
      navigate('/login', { replace: true })
    }
  }, [navigate])

  return <Outlet />
}
