import landingpglogo from '../img/landingpg_logo.png'
import { Link } from 'react-router-dom'

const splitText = (text, startIndex) => {
  return text.split('').map((char, i) => (
    <span
      key={`${text}-${i}`}
      className="nav-letter inline-block"
      style={{ '--i': startIndex + i }}
      aria-hidden="true"
    >
      {char === ' ' ? '\u00A0' : char}
    </span>
  ))
}

export default function NavbarLanding() {
  let letterIndex = 0

  const navItems = [
    { href: '#classes', label: 'Classes' },
    { href: '#about', label: 'About'},
    { href: '#programme', label: 'Our Programme' },
    { href: '#results', label: 'Result' },
    { href: '#reviews', label: 'Reviews' },
    { href: '#gallery', label: 'Gallery' },
    { href: '#contact', label: 'Contact' }
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/05 backdrop-blur-sm border-b border-none shadow-[0_10px_32px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <span className="nav-pop inline-flex" style={{ '--delay': '1.3s' }}>
            <Link
              to="/"
              className="flex items-center gap-2"
              aria-label="E-PolitiX Home"
            >
              <img src={landingpglogo} alt="E-PolitiX" className="h-10 w-auto" />
            </Link>
          </span>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 tracking-wide whitespace-nowrap">
            {navItems.map((item) => {
              const letters = splitText(item.label, letterIndex)
              letterIndex += item.label.length
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-white hover:text-orange-400 font-medium transition-colors whitespace-nowrap text-sm"
                  aria-label={item.label}
                >
                  {letters}
                </a>
              )
            })}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <span className="nav-pop inline-flex" style={{ '--delay': '1.45s' }}>
              <Link
                to="/login"
                className="rounded-lg text-white hover:text-white hover:bg-white/10 font-light transition-colors px-6 py-2 tracking-widest border-1 "
                aria-label="Login"
              >
                Login
              </Link>
            </span>
            <span className="nav-pop inline-flex" style={{ '--delay': '1.6s' }}>
              <Link
                to="/register"
                className="bg-orange-500 hover:bg-orange-700 text-white font-light px-5 py-2 rounded-lg transition-all tracking-widest shadow-[0_8px_16px_-5px_rgba(249,115,22,0.6)] hover:shadow-[0_12px_24px_-6px_rgba(249,115,22,0.4)]"
                aria-label="Register"
              >
                Register
              </Link>
            </span>
          </div>
        </div>
      </div>
    </nav>
  )
}