import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'

const AdminLogo = () => (
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-200/30">
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    </div>
    <span className="font-bold text-xl tracking-tight text-slate-900">E-PolitiX</span>
    <span className="text-xs font-medium text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md">Admin</span>
  </div>
)

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-sky-200">
      {/* Mobile topbar */}
      <header className="lg:hidden bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="flex items-center justify-between h-14 px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-600 hover:text-slate-900"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <AdminLogo />
          <div className="w-8" />
        </div>
      </header>

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="flex h-screen overflow-hidden lg:h-auto lg:flex-col">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 bg-white/80 backdrop-blur-md border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-100">
              <AdminLogo />
            </div>
            <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
              <AdminSidebarItem to="/admin" label="Dashboard" icon="layout-dashboard" />
              <AdminSidebarItem to="/admin/users" label="Users" icon="users" />
              <AdminSidebarItem to="/admin/resources" label="Resources" icon="file-text" />
              <AdminSidebarItem to="/admin/exams" label="Exams" icon="clipboard-list" />
              <AdminSidebarItem to="/admin/results" label="Results" icon="bar-chart-3" />
              <AdminSidebarItem to="/admin/classes" label="Classes" icon="school" />
            </nav>
            <div className="p-6 border-t border-slate-100">
              <button
                onClick={() => {
                  localStorage.removeItem('user')
                  navigate('/login')
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
                </svg>
                Sign out
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-white">
          <div className="p-6 sm:p-8 lg:p-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

function AdminSidebarItem({ to, label, icon }) {
  return (
    <div className="group">
      {/* Icons rendered inline via simple SVG map */}
      {renderIcon(icon)}
    </div>
  )
}

// Inline icon map for lightweight, dependency-free icons
function renderIcon(name) {
  const icons = {
    'layout-dashboard': (
      <svg className="w-5 h-5 text-slate-400 group-hover:text-sky-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    users: (
      <svg className="w-5 h-5 text-slate-400 group-hover:text-sky-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    'file-text': (
      <svg className="w-5 h-5 text-slate-400 group-hover:text-sky-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    'clipboard-list': (
      <svg className="w-5 h-5 text-slate-400 group-hover:text-sky-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2m-6 9l2 2 4-4" />
      </svg>
    ),
    'bar-chart-3': (
      <svg className="w-5 h-5 text-slate-400 group-hover:text-sky-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    school: (
      <svg className="w-5 h-5 text-slate-400 group-hover:text-sky-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  }
  return icons[name] || <span className="w-5 h-5" />
}
