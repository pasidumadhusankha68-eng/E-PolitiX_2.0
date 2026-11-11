import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import mainLogo from '../../img/main_logo.svg'
import { useUser } from '../../context/UserContext'

const GROUPS = [
  { label: 'OVERVIEW', links: [{ to: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' }] },
  {
    label: 'STUDENTS',
    links: [
      { to: '/admin/users', label: 'Users', icon: 'users' },
      { to: '/admin/classes', label: 'Classes', icon: 'classes' },
      { to: '/admin/payments', label: 'Payments', icon: 'payments' },
    ],
  },
  {
    label: 'ACADEMICS',
    links: [
      { to: '/admin/exams', label: 'Exams', icon: 'exams' },
      { to: '/admin/results', label: 'Results', icon: 'results' },
      { to: '/admin/resources', label: 'Resources', icon: 'resources' },
    ],
  },
]

function SidebarIcon({ name, active }) {
  const children = iconChildren(name)
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`transition-colors duration-200 ${active ? 'text-[#c2410c]' : ''}`}
    >
      {children}
    </svg>
  )
}

function iconChildren(name) {
  switch (name) {
    case 'dashboard':
      return (
        <>
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </>
      )
    case 'users':
      return (
        <>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </>
      )
    case 'classes':
      return (
        <>
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" />
        </>
      )
    case 'payments':
      return (
        <>
          <rect x="1" y="4" width="22" height="16" rx="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </>
      )
    case 'exams':
      return (
        <>
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <path d="M9 12h6M9 16h6" />
        </>
      )
    case 'results':
      return (
        <>
          <line x1="12" y1="20" x2="12" y2="10" />
          <line x1="18" y1="20" x2="18" y2="4" />
          <line x1="6" y1="20" x2="6" y2="16" />
        </>
      )
    case 'resources':
      return (
        <>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </>
      )
    case 'logout':
      return (
        <>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </>
      )
    case 'chevron':
      return <polyline points="15 18 9 12 15 6" />
    default:
      return null
  }
}

export default function AdminSideBar({ badges = {} }) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('adminSidebarCollapsed') === '1'
    } catch {
      return false
    }
  })

  const navigate = useNavigate()
  const { user } = useUser()

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem('adminSidebarCollapsed', next ? '1' : '0')
      } catch {}
      return next
    })
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/login')
  }

  const name = user?.full_name || 'Admin'
  const roleLabel = user?.role === 'superadmin' ? 'Super admin' : 'Admin'
  const initials = ((user?.full_name || 'AD')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)) || 'AD'

  const linkClasses = ({ isActive }, collapsed) => {
    const active = isActive
    const base = `relative group flex h-14 items-center ${collapsed ? 'justify-center px-0' : 'gap-5 px-3'} rounded-[10px] text-[15px] transition-all duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff6000]`
    if (active) {
      return `${base} text-[#9a3412] font-semibold bg-[#fff7ed] before:content-[''] before:absolute before:-left-${collapsed ? 3 : 4} before:top-2.5 before:bottom-2.5 before:w-1 before:rounded-r `
    }
    return `${base} text-slate-700 hover:bg-slate-50`
  }

  const tooltip = (label, collapsed) => (
    <span
      className={`absolute left-14 bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap z-50 transition-opacity duration-200 motion-reduce:transition-none ${collapsed ? 'group-hover:block group-focus-visible:block' : 'hidden'}`}
    >
      {label}
    </span>
  )

  return (
    <div
      className={`w-[${collapsed ? 72 : 280}px] shrink-0 h-screen sticky top-0 border-r border-slate-200 bg-white flex flex-col px-4 py-5 transition-[width] duration-300 ease-in-out will-change-[width] motion-reduce:transition-none`}
    >
      <div className="flex items-center justify-between transition-all duration-200 ease-in-out motion-reduce:transition-none">
        {!collapsed && (
          <img src={mainLogo} alt="E-PolitiX Logo" className="h-12 w-auto mb-5 transition-opacity duration-200 motion-reduce:transition-none" />
        )}
        <button
          onClick={toggle}
          className="h-8 w-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={`transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>
      <div className=" border-slate-200 transition-all duration-200 ease-in-out motion-reduce:transition-none" />
      <nav className="overflow-y-auto flex-1">
        {GROUPS.map((group) => {
          const hasBadges = group.links.some((l) => badges[l.label] > 0)
          return (
            <div key={group.label}>
              {collapsed ? (
                <div className="border-t border-slate-200 mt-7 pt-3 transition-opacity duration-200 motion-reduce:transition-none" />
              ) : (
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 px-3 pb-1.5 mt-4 transition-opacity duration-200 motion-reduce:transition-none">
                  {group.label}
                </div>
              )}
              {group.links.map((link) => {
                const badge = badges[link.label] > 0 ? badges[link.label] : null
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) => linkClasses({ isActive }, collapsed)}
                    aria-label={link.label}
                  >
                    <SidebarIcon name={link.icon} />
                    {!collapsed && <span className="flex-1 transition-opacity duration-200 motion-reduce:transition-none">{link.label}</span>}
                    {badge && !collapsed ? (
                      <span className="text-xs font-semibold bg-amber-100 text-amber-800 rounded-full px-2 py-px transition-opacity duration-200 motion-reduce:transition-none">
                        {badge}
                      </span>
                    ) : null}
                    {badge && collapsed ? (
                      <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white transition-opacity duration-200 motion-reduce:transition-none" />
                    ) : null}
                    {collapsed && tooltip(link.label, true)}
                  </NavLink>
                )
              })}
            </div>
          )
        })}
      </nav>
      <div className="mt-auto border-t border-slate-200 pt-3 flex flex-col gap-1.5 transition-all duration-200 ease-in-out motion-reduce:transition-none">
        <div className={`flex items-center gap-5 transition-all duration-200 ease-in-out motion-reduce:transition-none ${collapsed ? 'justify-center' : ''}`}>
          <div className="h-9 w-9 rounded-full bg-[#1e3a8a] text-white text-[13px] font-semibold flex items-center justify-center shrink-0 transition-all duration-200 motion-reduce:transition-none">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex flex-col transition-opacity duration-200 motion-reduce:transition-none">
              <p className="font-medium text-sm">{name}</p>
              <p className="text-xs text-slate-600">{roleLabel}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="relative group flex h-11 w-full items-center gap-3 rounded-[10px] px-3 text-[15px] text-red-700 hover:bg-red-50 transition-all duration-200 ease-in-out motion-reduce:transition-none"
          aria-label="Logout"
        >
          <SidebarIcon name="logout" />
          {!collapsed && <span className="transition-opacity duration-200 motion-reduce:transition-none">Logout</span>}
          {collapsed && tooltip('Logout', true)}
        </button>
      </div>
    </div>
  )
}
