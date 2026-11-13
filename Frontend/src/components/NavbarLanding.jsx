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

const ICONS = {
  '#classes': <><path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z"/></>,
  '#about': <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M6.2 19a6 6 0 0 1 11.6 0"/></>,
  '#programme': <><path d="M12 2 2 7l10 5 10-5z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></>,
  '#results': <><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/></>,
  '#reviews': <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>,
  '#gallery': <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></>,
  '#faq': <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></>,
}

const Icon = ({ name }) => (
  <svg viewBox="0 0 24 24" className="nav-slide-in h-[18px] w-[18px] flex-none fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS[name]}</svg>
)

export default function NavbarLanding() {
  let letterIndex = 0
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')

  const navItems = [
    { href: '#classes', label: ' Classes' },
    { href: '#about', label: ' About'},
    { href: '#programme', label: ' Our Programme' },
    { href: '#results', label: ' Result' },
    { href: '#reviews', label: ' Reviews' },
    { href: '#gallery', label: ' Gallery' },
    { href: '#faq', label: ' FAQ' }
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
    const els = navItems.map((n) => document.getElementById(n.href.slice(1))).filter(Boolean)
    if (!els.length) return
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive('#' + e.target.id) }),
      { rootMargin: '-45% 0px -50% 0px' }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
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
    <nav className={`fixed inset-x-0 top-0 z-50 transition duration-200 ease-out max-lg:shadow-[0_10px_32px_rgba(0,0,0,0.5)] nav-slide-in ${open ? 'max-lg:bg-transparent max-lg:border-none' : scrolled ? 'max-lg:bg-[#0c0b0b]/90 max-lg:backdrop-blur-md max-lg:border-b max-lg:border-white/10' : 'max-lg:bg-white/05 max-lg:backdrop-blur-sm max-lg:border-b max-lg:border-none'} lg:top-3 lg:px-4 lg:pointer-events-none`} aria-label="Main">
      <div className="max-w-7xl mx-auto px-[10vw] lg:px-0 lg:max-w-[1360px] lg:pointer-events-auto lg:rounded-[22px] lg:border lg:border-white/10 lg:bg-[#181513]/80 lg:shadow-[0_18px_50px_rgba(0,0,0,0.55)] lg:backdrop-blur-xl lg:pl-5 lg:pr-2.5 nav-slide-in">
        <div className="flex items-center justify-between h-16 lg:h-[px]">
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
          <div className="hidden lg:flex gap-0.5 rounded-2xl bg-white/[0.07] p-[3px] whitespace-nowrap">
            {navItems.map((item) => {
              const letters = splitText(item.label, letterIndex)
              letterIndex += item.label.length
              const isAnchor = item.href.startsWith('#')
              const base = 'flex items-center gap-[2px] whitespace-nowrap rounded-xl px-3.5 py-[9px] text-[0.9rem] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d4a017]'
              const activeCls = active === item.href ? 'bg-[#d4a017]/40 text-white shadow-[0_4px_14px_rgba(0,0,0,0.18)] [&_svg]:stroke-slate-300' : 'text-white/70 hover:text-white'
              const cls = base + ' ' + activeCls
              return isAnchor ? (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setActive(item.href)}
                  className={cls}
                  aria-label={item.label}
                >
                  <Icon name={item.href} />
                  {letters}
                </a>
              ) : (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setActive(item.href)}
                  className={cls}
                  aria-label={item.label}
                >
                  <Icon name={item.href} />
                  {letters}
                </Link>
              )
            })}
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-2">
            <span className="nav-pop inline-flex" style={{ '--delay': '1.6s' }}>
              <Link
                to="/login"
                className="inline-flex h-11 items-center rounded-[14px] bg-orange-500 px-[22px] text-[0.92rem] font-semibold text-slate-900 tracking-widest shadow-[0_8px_18px_-8px_rgba(255,96,0,0.8)] transition hover:-translate-y-px hover:bg-orange-600"
                aria-label="Register"
              >
                LOGIN
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