import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from './Logo'

export default function Navbar() {
  const navigate = useNavigate()
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [menuAnimation, setMenuAnimation] = useState('idle')

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const initials = user.fullName
    ? user.fullName.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'UD'

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/login')
  }

  const openMobileMenu = () => {
    setMenuAnimation('enter')
    setShowMobileMenu(true)
  }

  const closeMobileMenu = () => {
    setMenuAnimation('exit')
    setTimeout(() => {
      setShowMobileMenu(false)
      setMenuAnimation('idle')
    }, 200)
  }

  useEffect(() => {
    if (showMobileMenu && menuAnimation === 'idle') {
      setMenuAnimation('enter')
    }
  }, [showMobileMenu, menuAnimation])

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="relative flex items-center h-16">
          <div className="flex-shrink-0 hidden md:block">
            <Link to="/home" className="flex-shrink-0" aria-label="E-PolitiX Home">
              <Logo size="l" />
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4 ml-auto flex-shrink-0 min-w-[200px]">
            <nav className="flex items-center gap-6 relative -left-[10%]">
              <Link to="/home" className="text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg px-3 py-2 transition-colors">Dashboard</Link>
              <Link to="/progress" className="text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg px-3 py-2 transition-colors">Progress</Link>
              <Link to="/resources" className="text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg px-3 py-2 transition-colors">Resources</Link>
              <Link to="/gallery" className="text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg px-3 py-2 transition-colors">Gallery</Link>
            </nav>

            <button className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors" aria-label="Notifications">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0018 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.035-.586 1.421L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="relative" onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
              <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-semibold text-sm cursor-pointer hover:bg-sky-200 transition-colors">
                {user.profilePhoto ? (
                  <img src={user.profilePhoto} alt={user.fullName} className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  initials
                )}
              </div>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg border border-slate-200 py-1 animate-fade-in">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-900">{user.fullName || 'User'}</p>
                    <p className="text-xs text-slate-500">{user.mobile || ''}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    onClick={() => setShowProfileDropdown(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            className="p-2 ml-4 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors md:hidden"
            onClick={openMobileMenu}
            aria-label="Open menu"
            aria-expanded={showMobileMenu}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50 animate-fade-in" onClick={closeMobileMenu} aria-hidden="true">
          <div className={`absolute left-0 top-0 h-full w-64 bg-white shadow-xl ${menuAnimation === 'exit' ? 'animate-slide-out-right' : 'animate-slide-in-right'}`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <Link to="/home" className="flex-shrink-0" aria-label="E-PolitiX Home">
                <Logo size="sm" />
              </Link>
              <button
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                onClick={closeMobileMenu}
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="p-4 space-y-2">
              <Link
                to="/home"
                className="block px-4 py-3 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                onClick={closeMobileMenu}
              >
                Dashboard
              </Link>
              <Link
                to="/progress"
                className="block px-4 py-3 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                onClick={closeMobileMenu}
              >
                Progress
              </Link>
              <Link
                to="/resources"
                className="block px-4 py-3 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                onClick={closeMobileMenu}
              >
                Resources
              </Link>
              <Link
                to="/gallery"
                className="block px-4 py-3 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                onClick={closeMobileMenu}
              >
                Gallery
              </Link>
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-semibold">
                  {user.profilePhoto ? (
                    <img src={user.profilePhoto} alt={user.fullName} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{user.fullName || 'User'}</p>
                  <p className="text-xs text-slate-500">{user.mobile || ''}</p>
                </div>
              </div>
              <Link
                to="/profile"
                className="block px-4 py-3 text-sm text-slate-700 hover:bg-slate-100 rounded-lg mt-2 transition-colors"
                onClick={closeMobileMenu}
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-slate-100 rounded-lg mt-2 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}