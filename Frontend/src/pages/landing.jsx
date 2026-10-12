import { useRef, useEffect } from 'react'
import landingBg from '../img/landing_page_bg.png'
import NavbarLanding from '../components/NavbarLanding'
import { Link } from 'react-router-dom'
import AL from '../img/AL.png'
import Name from '../img/Name.png'
import landingSlang from '../img/landing_page_slang.png'
import LevelCard from '../components/LevelCard'
import BranchCard from '../components/BranchCard'

import '@fontsource/bodoni-moda/700.css'

const EXTRA_SPEED = 0.5
const FADE_AT = 0.6
const gradientBg = 'linear-gradient(180deg, #0B0A0A 0%, #0E0D0D 50%, #0B0A0A 100%)'

export default function Landing() {
  const heroRef = useRef(null)
  const textRef = useRef(null)

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }, [])

  useEffect(() => {
    const hero = heroRef.current
    const wrapper = textRef.current
    if (!hero || !wrapper) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    let rafId = 0

    const update = () => {
      const rect = hero.getBoundingClientRect()
      const heroHeight = rect.height
      const scrollY = Math.max(0, -rect.top)
      const clampedY = Math.min(scrollY, heroHeight)

      const isMobile = window.innerWidth < 768
      const speed = isMobile ? EXTRA_SPEED * 0.5 : EXTRA_SPEED

      const translateY = clampedY * speed
      const opacity = Math.max(0, Math.min(1, 1 - clampedY / (heroHeight * FADE_AT)))

      wrapper.style.transform = `translate3d(0, ${-translateY}px, 0)`
      wrapper.style.opacity = opacity
      rafId = 0
    }

    const onScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(update)
    }
    const onResize = () => {
      if (!rafId) rafId = requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    update()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div className="w-full relative min-h-screen" style={{ background: gradientBg }}>
      <NavbarLanding />
      
      {/* Hero Section - landing_page_bg.png */}
      <section ref={heroRef} className="min-h-screen relative overflow-hidden flex items-center justify-start px-6 pt-16 bg-reveal" style={{ backgroundImage: `url(${landingBg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', '--delay': '0.2s' }}>
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white max-w-3xl">
        </div>
        <div ref={textRef} className='w-1/3 h-72 ml-32 flex flex-col items-start justify-center' style={{ willChange: 'transform, opacity' }}>
          <img className='banner-reveal w-52 ml-3' style={{ '--delay': '0.2s' }} src={AL} alt="AL" />
          <img className='banner-reveal' style={{ '--delay': '0.4s' }} src={Name} alt="Name" />
          <img className='banner-reveal' style={{ '--delay': '0.7s' }} src={landingSlang} alt="Landing Slang" />
        </div>
      </section>
      
      

      {/* Classes Section */}
      <section id="classes" className="classes-section" aria-labelledby="classes-title">
       <header className="classes-header">
          <h2 id="classes-title" className="classes-title">Classes for every stage</h2>
          <p className="classes-subtitle">
            From the first scholarship paper to the final A/L exam, one institute that knows every step.
          </p>
        </header>
        <div className="branches-grid">
          <BranchCard
            name="Sapala - Deniyaya"
            al2027={{ date: '', time: '' }}
            al2028={{ date: '', time: '' }}
            href="/branches/sapala-deniyaya"
          />
          <BranchCard
            name="Sasipro - Neluwa"
            al2027={{ date: '', time: '' }}
            al2028={{ date: '', time: '' }}
            href="/branches/sasipro-neluwa"
          />
          <BranchCard
            name="Wimasuma - Morawaka"
            al2027={{ date: '', time: '' }}
            al2028={{ date: '', time: '' }}
            href="/branches/wimasuma-morawaka"
          />
          <BranchCard
            name="New Excellent - Urubokka"
            al2027={{ date: '', time: '' }}
            al2028={{ date: '', time: '' }}
            href="/branches/new-excellent-urubokka"
          />
          <BranchCard
            name="Online - Islandwide"
            al2027={{ date: '', time: '' }}
            al2028={{ date: '', time: '' }}
            href="/branches/online"
          />
        </div>
      </section>

      <section id="programme" className="min-h-screen px-6 flex items-center justify-center">
        <div className="text-center text-white">Our Programme Section</div>
      </section>
      <section id="results" className="min-h-screen px-6 flex items-center justify-center">
        <div className="text-center text-white">Result Section</div>
      </section>
      <section id="reviews" className="min-h-screen px-6 flex items-center justify-center">
        <div className="text-center text-white">Reviews Section</div>
      </section>
      <section id="gallery" className="min-h-screen px-6 flex items-center justify-center">
        <div className="text-center text-white">Gallery Section</div>
      </section>
      <section id="contact" className="min-h-screen px-6 flex items-center justify-center">
        <div className="text-center text-white">Contact Section</div>
      </section>
    </div>
  )
}