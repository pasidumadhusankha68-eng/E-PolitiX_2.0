import { Link, useLocation } from 'react-router-dom'
import mainLogo from '../../img/main_logo.svg'
import { useUser } from '../../context/UserContext'

const LINKS = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/exams', label: 'Exams' },
  { to: '/admin/resources', label: 'Resources' },
  { to: '/admin/results', label: 'Results' },
  { to: '/admin/classes', label: 'Classes' },
  { to: '/admin/payments', label: 'Payments' },
]

export default function AdminSideBar() {
  const location = useLocation()
  const { user } = useUser()

  return (
    <div className="w-1/5 h-screen border-r bg-white shadow-md p-8">
      <div className="border-b ">
        <img src={mainLogo} alt="E-PolitiX Logo" className="h-12 w-auto" />
      </div>
      <nav className="text-black flex flex-col gap-3 pt-10">
        {LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`p-4 border-b rounded-sm hover:bg-slate-50 ${
              location.pathname === link.to ? 'bg-slate-50 font-semibold border-b-0' : ''
            }`}
          >
            {link.label}
          </Link>
        ))}
        {user?.role === 'superadmin' && (
          <Link
            to="/home"
            className="p-4 border-b rounded-sm hover:bg-slate-50 flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Student view
          </Link>
        )}
        <Link
          to="/login"
          className="border border-black/10 hover:bg-red-200 text-black font-light px-5 py-2  rounded-lg transition-all tracking-widest shadow-[0_5px_6px_-5px_rgba(249,115,22,0.6)] hover:shadow-[0_7px_8px_-6px_rgba(249,115,22,0.4)] flex align-middle justify-center mt-10"
          aria-label="Register"
        >
          Logout
        </Link>
      </nav>
    </div>
  )
}
