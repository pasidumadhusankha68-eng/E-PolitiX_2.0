import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import landingBg from '../img/landing_page_bg.png'
import NavbarLanding from '../components/NavbarLanding'
import FlipText from '../components/FlipText'
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
import TypingText from '../components/TypingText'
import GalleryStrip from '../components/GalleryStrip'


import '@fontsource/bodoni-moda/700.css'

const WHATSAPP_NUMBER = '94778808610'
const gradientBg = 'linear-gradient(180deg, #0B0A0A 0%, #0E0D0D 50%, #0B0A0A 100%)'

export default function Landing() {
  const heroRef = useRef(null)
  const branchesGridRef = useRef(null)
  const aboutTextRef = useRef(null)
  const aboutSectionRef = useRef(null)
  const classesSectionRef = useRef(null)
  const contactSectionRef = useRef(null)
  const [classesLoading, setClassesLoading] = useState(true)
  const [isAboutVisible, setIsAboutVisible] = useState(false)
  const [isClassesVisible, setIsClassesVisible] = useState(false)
  const [isContactVisible, setIsContactVisible] = useState(false)

  useScrollReveal(branchesGridRef)
  useScrollReveal(aboutTextRef)

  const [form, setForm] = useState({ name: '', phone: '', message: '' })

  const  handleChange = (e) => 
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handlePhoneChange = (e) => {
  const digits = e.target.value
    .replace(/\D/g, '')   
    .replace(/^0+/, '')   
    .slice(0, 9)          
  setForm((f) => ({ ...f, phone: digits }))
}

  const handleSubmit = (e) => {
    e.preventDefault()

    const text =
    `Hello E-Politix,\n\n` +
    `Name: ${form.name}\n` +
    (form.phone ? `Phone: +94${form.phone}\n` : '') +
    `\nMessage: ${form.message}`
    
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
  window.open(url, '_blank', 'noopener,noreferrer')
  }

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    const timer = setTimeout(() => setClassesLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const section = aboutSectionRef.current
    if (!section) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      setIsAboutVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsAboutVisible(true)
            observer.unobserve(section)
          }
        })
      },
      { threshold: 0.3, rootMargin: '0px' }
    )

    observer.observe(section)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const section = classesSectionRef.current
    if (!section) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      setIsClassesVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsClassesVisible(true)
            observer.unobserve(section)
          }
        })
      },
      { threshold: 0.3, rootMargin: '0px' }
    )

    observer.observe(section)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const section = contactSectionRef.current
    if (!section) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      setIsContactVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsContactVisible(true)
            observer.unobserve(section)
          }
        })
      },
      { threshold: 0.3, rootMargin: '0px' }
    )

    observer.observe(section)

    return () => observer.disconnect()
  }, [])

  return (
    <div className="w-full relative min-h-screen" style={{ background: gradientBg }}>
      <NavbarLanding />
      
      {/* Hero Section - landing_page_bg.png */}
      <section id="hero" ref={heroRef} className="min-h-screen relative overflow-hidden flex items-center justify-start px-6 pt-16 bg-reveal" style={{ backgroundImage: `url(${landingBg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', '--delay': '0.2s' }}>
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white max-w-3xl">
        </div>
        <div className='w-1/3 h-72 ml-32 flex flex-col items-start justify-center'>
          <img className='banner-reveal w-52 ml-3' style={{ '--delay': '0.2s' }} src={AL} alt="AL" />
          <img className='banner-reveal' style={{ '--delay': '0.4s' }} src={Name} alt="Name" />
          <img className='banner-reveal' style={{ '--delay': '0.7s' }} src={landingSlang} alt="Landing Slang" />
        </div>
      </section>
      
      

  {/* Classes Section */}
      <section
        id="classes"
        ref={classesSectionRef}
        className="classes-section min-h-screen relative px-6 py-20 overflow-hidden"
        aria-labelledby="classes-title"
        style={{ background: 'linear-gradient(180deg, #0B0A0A 0%, #141211 50%, #0B0A0A 100%)' }}
      >
       <header className="classes-header">
           <h2 id="classes-title" className={`classes-title ${isClassesVisible ? 'animate-slide-in-right' : 'opacity-0'}`}><span className='text-yellow-500'>Classes</span> for every stage</h2>
           <p className={`classes-subtitle ${isClassesVisible ? 'animate-slide-in-right-delay' : 'opacity-0'}`}>
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

      <section
        ref={aboutSectionRef}
        id="about"
        className="min-h-screen relative overflow-hidden px-6 pt-16 bg-reveal"
        style={{ backgroundImage: `url(${about_bg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', '--delay': '0.2s' }}
      >

        <h2
          id="about-title"
          className={`about-title text-center w-full ${isAboutVisible ? 'animate-slide-in-right' : 'opacity-0'}`}
        >
          Meet your <span className='text-yellow-500'>Teacher</span>
        </h2>

        <p
          className={`about-subtitle ${isAboutVisible ? 'animate-slide-in-right-delay' : 'opacity-0'}`}
        >
            From the first scholarship paper to the final A/L exam, one institute that knows every step.
        </p>

        <div className="flex justify-center items-center gap-8 mt-12">
          <div className='w-1/3 ml-28'>
            <img
              src={mainElement}
              alt="Main Element"
              className={`h-auto ${isAboutVisible ? 'animate-image-appear' : 'opacity-0'}`}
            />
          </div>
          <div className='w-1/2 ml-16 -mt-44'>
            <TypingText
              text="ගුරුවරයා පිළිබඳව, "
              as="h2"
              className="text-4xl text-yellow-500"
              typeSpeed={80}
              startDelay={800}
              trigger={isAboutVisible}
              cursorBlinkDuration={2000}
            />
            <p
              className={`text-2xl ${isAboutVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
              style={{ animationDelay: '2.1s' }}
            >
              <br></br>ගා/දෙල්ලව විද්‍යාලයෙන් මූලික අධ්‍යාපනය ලබා, <br></br>අ.පො.ස. උසස් පෙළට මාතර රාහුල විද්‍යාලයේ <br></br>සිසුවෙකු ලෙස පෙනීහිඳ ලංකාවේ විශ්ව විදද්‍යාල <br></br>ශ්‍රේණිගතකිරීම් අතර ඉහළම විශ්ව විද්‍යාලයක් වන <br></br>පේරාදෙණිය විශ්ව විද්‍යාලය තුළින් තම විශේෂවේදී<br></br> උපාධිය හදාර ඇත. එමෙන්ම රුහුණු විශ්ව විදද්‍යාලයේ <br></br>Politics පිළිබඳ උපාධියක් හදාරා තිබේ.<br></br><br></br>
              ළමයින් 6 දෙනෙකුගෙන් ආරම්භ වූ අපගේ දේශපාලන <br></br>විද්‍යා පන්තිය මේ වන විට නෙළුව, මොරවක, දෙනියාය, <br></br>ඌරු බොක්ක යන ප්‍රදේශ වල වැඩිම සිසුන් පිරිසක් <br></br>සම්බන්ධවන පන්තිය බවට පත්වී ඇත. 
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

      
      <section id="gallery" className="gallery-bg min-h-screen scroll-mt-20">
        <header className="flex flex-col items-center text-center mb-12">
          <h2 className="classes-title animate-slide-in-right mt-14"><span className='text-yellow-500'>E-PolitiX </span>Life</h2>
          <div className="classes-subtitle animate-slide-in-right-delay mt-4 ">
            <FlipText items={['Prize Giving', 'New year celebration', 'Batch end party']} />
          </div>
         
        </header>
        <div className="flex justify-end max-w-6xl mx-auto mb-6">
          <Link
            to="/gallery"
            className="absolute top-24 right-20 inline-flex r gap-3 border-b-2 border-white pb-1 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors hover:text-[#e65600] hover:border-[#e65600] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6000]"
            aria-label="View all gallery photos"
          >
            All Photos
            <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>
        <GalleryStrip />
        
      </section>

      <section
        id="contact"
        ref={contactSectionRef}
        className="min-h-screen relative px-6 py-20 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #0B0A0A 0%, #141211 50%, #0B0A0A 100%)' }}
      >
        
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--gold)_0%,_transparent_70%)] opacity-10" />
        <div className="relative z-10 max-w-6xl mx-auto w-full">
          <header className="text-center mb-16">
            <h2 className={`classes-title ${isContactVisible ? 'animate-slide-in-right' : 'opacity-0'}`}>
              Get in <span className='text-yellow-500'>Touch</span>
            </h2>
            <p className={`classes-subtitle mt-4 ${isContactVisible ? 'animate-slide-in-right-delay' : 'opacity-0'}`}>
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </header>

          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className={`card-reveal ${isContactVisible ? 'is-visible' : ''}`} style={{ '--delay': '0ms' }}>
                <h3 className="level-title mb-6">Contact Information</h3>
                <div className="space-y-6">


                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="level-title text-xl mb-1">Call Us</h4>
                      <p className="text-text-muted leading-relaxed">
                        +94 41 222 3344<br />
                        +94 77 123 4567
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="level-title text-xl mb-1">Email Us</h4>
                      <p className="text-text-muted leading-relaxed">
                        info@epolitix.lk<br />
                        admissions@epolitix.lk
                      </p>
                    </div>
                  </div>

                  
                </div>
              </div>

              <div className={`card-reveal ${isContactVisible ? 'is-visible' : ''}`} style={{ '--delay': '200ms' }}>
                <h3 className="level-title mb-6">Follow Us</h3>
                <div className="flex flex-wrap gap-4">
                  <a href="https://www.facebook.com/share/18apYRAecC/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-card-bg border border-card-border flex items-center justify-center hover:border-gold hover:bg-gold/10 transition-all duration-300 hover:text-yellow-500 hover:border-yellow-500" aria-label="Facebook">
                    <svg className="w-6 h-6 text-gold" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </a>
                  <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-card-bg border border-card-border flex items-center justify-center hover:border-gold hover:bg-gold/10 transition-all duration-300 hover:text-yellow-500 hover:border-yellow-500" aria-label="WhatsApp">
                    <svg className="w-6 h-6 text-gold" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.672m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378 3.44 3.44 0 01-1.141-1.006 12.43 12.43 0 00-.062-.678 11.4 11.4 0 00-.4-.974 10.18 10.18 0 00-.928-.928 11.38 11.38 0 00-.976-.4 12.6 12.6 0 00-.678-.062A3.44 3.44 0 012.38 12.88 9.86 9.86 0 01.999 7.846a9.874 9.874 0 014.577-5.175A9.865 9.865 0 0112 0c2.904 0 5.565 1.205 7.445 3.082a9.865 9.865 0 013.081 7.442c0 2.905-1.205 5.566-3.082 7.443a9.874 9.874 0 01-5.176 4.577 3.416 3.416 0 01-1.182-.06zM12 6.5a5.5 5.5 0 110 11 5.5 5.5 0 010-11zm0 2a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" />
                    </svg>
                  </a>

                  <a href="https://youtube.com/@indunilsgamage?si=FAjeXsbUp3BttpXv" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-card-bg border border-card-border flex items-center justify-center hover:border-gold hover:bg-gold/10 transition-all duration-300 hover:text-yellow-500 hover:border-yellow-500" aria-label="YouTube">
                    <svg className="w-6 h-6 text-gold" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            <div className={`card-reveal ${isContactVisible ? 'is-visible' : ''}`} style={{ '--delay': '100ms' }}>
              <div className="rounded-2xl p-8 bg-white/7 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50 ">
                <h3 className="level-title mb-6">Send a <span className='text-yellow-500'>Message</span></h3>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-text mb-1 ">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-none rounded-lg text-text placeholder-text-muted  transition-all focus:outline-none focus:ring-0 focus:bg-white/6"
                        placeholder="Your name"
                      />
                    </div>
                    {/* <div>
                      <label htmlFor="email" className="block text-sm font-medium text-text mb-1">
                        Email <span className="text-gold">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-gold focus:border-white/20 transition-all"
                        placeholder="your@email.com"
                      />
                    </div> */}

                    <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-text mb-1">
                      Whatsapp Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={form.phone}
                      onChange={handlePhoneChange}
                      className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-gold focus:border-white/20 transition-all"
                      placeholder="+94 77 123 4567"
                    />
                  </div>
                  </div>
                  
                  {/* <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-text mb-1">
                      Subject <span className="text-gold">*</span>
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-gold focus:border-white/20 transition-all"
                    >
                      <option value="">Select a subject</option>
                      <option value="admissions">Admissions Inquiry</option>
                      <option value="courses">Course Information</option>
                      <option value="fees">Fee Structure</option>
                      <option value="branches">Branch Locations</option>
                      <option value="technical">Technical Support</option>
                      <option value="other">Other</option>
                    </select>
                  </div> */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-text mb-1">
                      Message 
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows="5"
                      value={form.message}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-gold focus:border-white/20 transition-all resize-none"
                      placeholder="Tell us how we can help you..."
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full md:w-auto px-8 py-3 bg-gold text-black font-semibold rounded-lg hover:bg-gold/90 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-bg transition-all duration-300 bg-yellow-500 hover:bg-yellow-600"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-card-border">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className={`reveal-text ${isContactVisible ? 'is-visible' : ''}`} style={{ '--delay': '0ms' }}>
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gold/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="level-title mb-2">Quick Response</h4>
                <p className="text-text-muted">We typically respond within 24 hours</p>
              </div>
              <div className={`reveal-text ${isContactVisible ? 'is-visible' : ''}`} style={{ '--delay': '100ms' }}>
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gold/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h4 className="level-title mb-2">Free Consultation</h4>
                <p className="text-text-muted">Schedule a free advisory session</p>
              </div>
              <div className={`reveal-text ${isContactVisible ? 'is-visible' : ''}`} style={{ '--delay': '200ms' }}>
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gold/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="level-title mb-2">Secure & Private</h4>
                <p className="text-text-muted">Your data is protected and confidential</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ScrollToTop triggerSectionId="hero" />
    </div>
  )
}