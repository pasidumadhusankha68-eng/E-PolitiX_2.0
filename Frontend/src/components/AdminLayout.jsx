import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const links = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/exams', label: 'Exams' },
  { to: '/admin/resources', label: 'Resources' },
  { to: '/admin/results', label: 'Results' },
  { to: '/admin/classes', label: 'Classes' },
]

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/login')
  }

  const isActive = (to) =>
    typeof window !== 'undefined' && window.location.pathname === to

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200 shrink-0">
          <span className="text-xl font-bold tracking-tight text-[#1a2332]">E-Politix</span>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-3 overflow-y-auto">
          {links.map((link) => {
            const active = isActive(link.to)
            return (
              <a
                key={link.to}
                href={link.to}
                onClick={(e) => {
                  e.preventDefault()
                  navigate(link.to)
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-orange-100 text-[#c2410c] border-l-4 border-[#c2410c] pl-3.5'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {link.label}
              </a>
            )
          })}
        </nav>
        <div className="p-6 border-t border-slate-200 shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-700">
              A
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Admin</p>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
            </svg>
            Logout
          </button>
        </div>
      </aside>
      <main className="ml-72 p-8 bg-slate-50 min-h-screen">
        {children}
      </main>
    </div>
  )
}
