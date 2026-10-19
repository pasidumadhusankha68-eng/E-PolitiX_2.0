import landingpglogo from '../img/landingpg_logo.png'
import { Link } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { useState, useEffect } from 'react'

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
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const navItems = [
    { href: '#classes', label: 'Classes' },
    { href: '#about', label: 'About'},
    { href: '#programme', label: 'Our Programme' },
    { href: '#results', label: 'Result' },
    { href: '#reviews', label: 'Reviews' },
    { href: '#gallery', label: 'Gallery' },
    { href: '#contact', label: 'Contact' }
  ]

  useEffect(() => {
    const onKeydown = (e) => { if (e.key === 'Escape') setOpen(false) }
    const onResize = () => { if (window.innerWidth > 1023) setOpen(false) }
    window.addEventListener('resize', onResize)
    if (open) document.addEventListener('keydown', onKeydown)
    return () => {
      window.removeEventListener('resize', onResize)
      if (open) document.removeEventListener('keydown', onKeydown)
    }
  }, [open])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY >= 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll, { passive: true })
  }, [])

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [open])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition duration-200 ease-out shadow-[0_10px_32px_rgba(0,0,0,0.5)] ${open ? 'bg-transparent border-none' : scrolled ? 'bg-[#0c0b0b]/90 backdrop-blur-md border-b border-white/10 lg:bg-white/05 lg:backdrop-blur-sm lg:border-b lg:border-none' : 'bg-white/05 backdrop-blur-sm border-b border-none'}`}>
      <div className="max-w-7xl mx-auto px-[10vw] lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <span className="nav-pop inline-flex" style={{ '--delay': '1.3s' }}>
            <Link
              to="/"
              className="flex items-center gap-2"
              aria-label="E-PolitiX Home"
            >
              <img src={landingpglogo} alt="E-PolitiX" className="w-[29vw] min-w-[112px] max-w-[170px] lg:h-10 lg:w-auto" />
            </Link>
          </span>

          {/* Mobile hamburger */}
          <span className="nav-pop inline-block lg:hidden" style={{ '--delay': '0.4s' }}>
            <button
              className="lg:hidden w-[44px] h-[44px] rounded-lg cursor-pointer active:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ffc901] flex flex-col items-center justify-center gap-[5px]"
              onClick={() => setOpen((prev) => !prev)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="mobile-menu"
              type="button"
            >
            <span className={`w-[24px] h-[2px] bg-white transition duration-250 ease-out ${open ? 'translate-y-[7px] rotate-[45deg]' : ''}`} />
            <span className={`w-[24px] h-[2px] bg-white transition duration-250 ease-out ${open ? 'opacity-0' : ''}`} />
            <span className={`w-[24px] h-[2px] bg-white transition duration-250 ease-out ${open ? '-translate-y-[7px] -rotate-[45deg]' : ''}`} />
          </button>
          </span>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8 tracking-wide whitespace-nowrap">
            {navItems.map((item) => {
              const letters = splitText(item.label, letterIndex)
              letterIndex += item.label.length
              const isAnchor = item.href.startsWith('#')
              return isAnchor ? (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-white hover:text-orange-400 font-medium transition-colors whitespace-nowrap text-sm"
                  aria-label={item.label}
                >
                  {letters}
                </a>
              ) : (
                <Link
                  key={item.href}
                  to={item.href}
                  className="text-white hover:text-orange-400 font-medium transition-colors whitespace-nowrap text-sm"
                  aria-label={item.label}
                >
                  {letters}
                </Link>
              )
            })}
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
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

          {/* Mobile menu panel */}
          {createPortal(
            <div
              id="mobile-menu"
              className={`fixed inset-0 z-40 lg:hidden transition-[opacity,visibility] duration-300 ease-out ${open ? 'menu-open opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
              style={{ minHeight: '100dvh', background: 'radial-gradient(60% 40% at 50% 100%, rgba(74,36,11,0.55), rgba(74,36,11,0) 70%), #0c0b0b' }}
            >
              <div className="flex min-h-[100dvh] flex-col items-center justify-center px-[10vw] pt-24 pb-10">
                <div className="flex w-full max-w-[280px] flex-col items-center">
                  {navItems.map((item, i) => {
                    const anchor = item.href.startsWith('#')
                    return anchor ? (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="mm-item block w-full py-3.5 text-center text-lg font-semibold text-white border-b border-white/10"
                        style={{ '--i': i }}
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setOpen(false)}
                        className="mm-item block w-full py-3.5 text-center text-lg font-semibold text-white border-b border-white/10"
                        style={{ '--i': i }}
                      >
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
                <div className="mt-8 flex w-full max-w-[280px] flex-col gap-3">
                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="w-full rounded-full bg-[#ff6000] py-3 text-center font-semibold text-white hover:bg-[#e65600]"
                  >
                    Register
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="w-full rounded-full border border-white/70 py-3 text-center text-white"
                  >
                    Login
                  </Link>
                </div>
              </div>
            </div>,
            document.body
          )}
        </div>
      </div>
    </nav>
  )
}