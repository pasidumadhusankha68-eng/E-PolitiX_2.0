import { useRef, useEffect, useState } from 'react'
import landingBg from '../img/landing_page_bg.png'
import NavbarLanding from '../components/NavbarLanding'
import { Link } from 'react-router-dom'
import AL from '../img/AL.png'
import Name from '../img/Name.png'
import landingSlang from '../img/landing_page_slang.png'
import LevelCard from '../components/LevelCard'
import BranchCard from '../components/BranchCard'
import useScrollReveal from '../hooks/useScrollReveal'
import about_bg from '../img/about_bg.png'
import mainElement from '../img/about/main_element.png'
import description from '../img/about/description.png'
import ScrollToTop from '../components/ScrollToTop'

import '@fontsource/bodoni-moda/700.css'

const EXTRA_SPEED = 0.5
const FADE_AT = 0.6
const gradientBg = 'linear-gradient(180deg, #0B0A0A 0%, #0E0D0D 50%, #0B0A0A 100%)'

export default function Landing() {
  const heroRef = useRef(null)
  const textRef = useRef(null)
  const branchesGridRef = useRef(null)
  const aboutTextRef = useRef(null)
  const [classesLoading, setClassesLoading] = useState(true)

  useScrollReveal(branchesGridRef)
  useScrollReveal(aboutTextRef)

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search)
    }
    const timer = setTimeout(() => setClassesLoading(false), 800)
    return () => clearTimeout(timer)
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
      <section id="hero" ref={heroRef} className="min-h-screen relative overflow-hidden flex items-center justify-start px-6 pt-16 bg-reveal" style={{ backgroundImage: `url(${landingBg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', '--delay': '0.2s' }}>
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
        <div className="branches-grid" ref={branchesGridRef}>
          <div className="reveal-card">
            <BranchCard
              name="Sapala - Deniyaya"
              al2027={{ date: '', time: '' }}
              al2028={{ date: '', time: '' }}
              href="/branches/sapala-deniyaya"
              loading={classesLoading}
            />
          </div>
          <div className="reveal-card">
            <BranchCard
              name="Sasipro - Neluwa"
              al2027={{ date: '', time: '' }}
              al2028={{ date: '', time: '' }}
              href="/branches/sasipro-neluwa"
              loading={classesLoading}
            />
          </div>
          <div className="reveal-card">
            <BranchCard
              name="Wimasuma - Morawaka"
              al2027={{ date: '', time: '' }}
              al2028={{ date: '', time: '' }}
              href="/branches/wimasuma-morawaka"
              loading={classesLoading}
            />
          </div>
          <div className="reveal-card">
            <BranchCard
              name="New Excellent - Urubokka"
              al2027={{ date: '', time: '' }}
              al2028={{ date: '', time: '' }}
              href="/branches/new-excellent-urubokka"
              loading={classesLoading}
            />
          </div>
          <div className="reveal-card">
            <BranchCard
              name="Online - Islandwide"
              al2027={{ date: '', time: '' }}
              al2028={{ date: '', time: '' }}
              href="/branches/online"
              loading={classesLoading}
            />
          </div>
        </div>
      </section>

      <section ref={heroRef} className="min-h-screen relative overflow-hidden px-6 pt-16 bg-reveal" style={{ backgroundImage: `url(${about_bg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', '--delay': '0.2s' }}>

        <h2 id="about-title" className="about-title text-center w-full">Meet your teacher</h2>

        <p className="about-subtitle">
            From the first scholarship paper to the final A/L exam, one institute that knows every step.
        </p>

        <div className="flex justify-center items-center gap-8 mt-12">
          <div className='w-1/2 ml-28'>
            <img src={mainElement} alt="Main Element" className=" h-auto" />
          </div>
          <div className='w-1/2 ml-16'>
            <h2 className='text-4xl text-yellow-500'>ගුරුවරයා පිළිබඳව,</h2>
            <p className=''>
              ගා/දෙල්ලව විද්‍යාලයෙන් මූලික අධ්‍යාපනය ලබා, අ.පො.ස. උසස් පෙළට මාතර රාහුල විද්‍යාලයේ සිසුවෙකු ලෙස පෙනීහිඳ ලංකාවේ විශ්ව විදද්‍යාල ශ්‍රේණිගතකිරීම් අතර ඉහළම විශ්ව විද්‍යාලයක් වන පේරාදෙණිය විශ්ව විද්‍යාලය තුළින් තම විශේෂවේදී උපාධිය හදාර ඇත. එමෙන්ම රුහුණු විශ්ව විදද්‍යාලයේ ඵොලිටිස්ස් පිළිබඳ උපාධියක් හදාරා තිබේ.
              ළමයින් 6 දෙනෙකුගෙන් ආරම්භ වූ අපගේ දේශපාලන විද්‍යා පන්තිය මේ වන විට නෙළුව, මොරවක, දෙනියාය, ඌරු බොක්ක යන ප්‍රදේශ වල වැඩිම සිසුන් පිරිසක් සම්බන්ධවන පන්තිය බවට පත්වී ඇත. 
            </p>
          </div>
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
      <ScrollToTop triggerSectionId="hero" />
    </div>
  )
}