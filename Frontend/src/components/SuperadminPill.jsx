import { Link } from 'react-router-dom'
import { useUser } from '../context/UserContext'

export default function SuperadminPill() {
  const { user } = useUser()

  if (user?.role !== 'superadmin') {
    return null
  }

  return (
    <>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 rounded-full bg-slate-900 text-white text-sm px-4 py-2 shadow-lg">
        Student view
        <Link
          to="/admin/dashboard"
          className="font-semibold text-orange-300 underline ml-2"
        >
          Back to admin
        </Link>
      </div>
    </>
  )
}
