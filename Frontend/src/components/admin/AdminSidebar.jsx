import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function AdminSidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/login')
  }

  const links = [
    { to: '/admin', label: 'Dashboard', icon: 'layout-dashboard' },
    { to: '/admin/users', label: 'Users', icon: 'users' },
    { to: '/admin/resources', label: 'Resources', icon: 'file-text' },
    { to: '/admin/exams', label: 'Exams', icon: 'clipboard-list' },
    { to: '/admin/results', label: 'Results', icon: 'bar-chart-3' },
    { to: '/admin/classes', label: 'Classes', icon: 'school' },
  ]

  return (
    <aside className="hidden lg:flex lg:w-72 flex-col border-r border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-200/30">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <span className="text-sm font-bold text-slate-900 tracking-tight">E-PolitiX</span>
            <p className="text-[10px] font-medium text-sky-600 uppercase tracking-wider">Admin Panel</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto">
        {links.map((link) => {
          const isActive = location.pathname === link.to || (link.to !== '/admin' && location.pathname.startsWith(link.to))
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-sky-50 text-sky-700 shadow-sm shadow-sky-100/50 border border-sky-100'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
              }`}
              onClick={() => {}}
            >
              {renderIcon(link.icon)}
              <span>{link.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 bg-sky-600 rounded-full" />
              )}
            </Link>
          )
        })}
      </nav>
      <div className="p-6 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-red-600 bg-red-50 rounded-xl border border-red-100 hover:bg-red-100 hover:text-red-700 transition-all duration-200"
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  )
}

function renderIcon(name) {
  const icons = {
    'layout-dashboard': (
      <svg className="w-5 h-5 flex-shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    users: (
      <svg className="w-5 h-5 flex-shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    'file-text': (
      <svg className="w-5 h-5 flex-shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    'clipboard-list': (
      <svg className="w-5 h-5 flex-shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2m-6 9l2 2 4-4" />
      </svg>
    ),
    'bar-chart-3': (
      <svg className="w-5 h-5 flex-shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    school: (
      <svg className="w-5 h-5 flex-shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  }
  return icons[name] || <span className="w-5 h-5" />
}
