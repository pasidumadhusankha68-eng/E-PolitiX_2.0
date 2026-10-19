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

const resultFiles = import.meta.glob('../img/results/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', { eager: true, import: 'default' })

const resultImage = (id) => {
  const key = Object.keys(resultFiles).find(
    (k) => k.split('/').pop()?.replace(/\.[^/.]+$/, '').toLowerCase() === id.toLowerCase()
  )
  return key ? resultFiles[key] : null
}

const MAIN_BANNERS = [{ id: 'main-1', alt: 'Result banner 1' }, { id: 'main-2', alt: 'Result banner 2' }]
const SUB_BANNERS = [{ id: 'sub-1', alt: 'Result banner 3' }, { id: 'sub-2', alt: 'Result banner 4' }, { id: 'sub-3', alt: 'Result banner 5' }]

const PROGRAMME_INTRO = ''
const SINHALA_FONT = '"Noto Sans Sinhala", "Iskoola Pota", sans-serif'
const LABEL_GRADIENT = 'linear-gradient(90deg, #c2410c, #ff6000)'
const PROGRAMME_STEPS = [
  { id: 'theory', label: 'Theory', description: '' },
  { id: 'skill-up', label: 'Skill Up', description: 'උසස්පෙළ විභාගයේ බහුවරණ ප්‍රශ්න පත්‍රය ඉලක්ක කරගත් මූලික අවධියේ සිට යන වැඩසටහනකි.' },
  { id: 'confidence', label: 'Confidence', description: 'උසස්පෙළ විභාගයේ ලියන ප්‍රශ්න පත්‍රය ඉලක්ක කරගත් මූලික අවධියේ සිට යන වැඩසටහනකි.' },
  { id: 'lessonmax', label: 'LessonMax', description: 'අප විභාගය සඳහා තෝරාගත් අනිවාර්ය පාඩම්වල උපරිමයට ගෙන ඒමේ වැඩසටහනකි.' },
  { id: 'revision', label: 'Revision', description: '' },
  { id: 'ranking-papers', label: 'Ranking Papers', description: 'දිස්ත්‍රික් කුසලතා ඉලක්ක කර ගනිමින් සකස් වූ විධිමත් වැඩසටහනකි.' },
  { id: 'weddilla', label: 'වෙඩිල්ල', sinhalaLabel: true, description: 'අපගේ ප්‍රශ්න පත්‍ර මාලාව තුල සම්පූර්ණ උසස්පෙළ ප්‍රශ්න පත්‍ර අනුමාන කරමින් මාස 6ක් තිස්සේ ක්‍රියාත්මක වන වැඩසටහනකි.' },
]

// PASTE YOUR 6 STUDENT MESSAGES HERE (replace text, name, batch)
const REVIEWS = [
  { text: "ඇත්ත සර් .වෙඩිල්ල මුල ඉදන් ලියපු අපිට නම් ගෙමක් නෑ ඉතින් ඒ වගේම සර්ගේ short note system එක නිසා සුපිරියට ලියාගත්තා. පොලිටිකල් නම් ඉතින් සර් තමා", name: "Student Name", batch: "2025 A/L Theory" },
  { text: "අනෙ ඔවු සර් පාඩන් කරන්න ,වැඩ කරන්න ඕනෙ කියන එක හොදටම දැනුනෙ සර්ගෙ මෝර්ටිවේශන් වලින් සර් උගන්න හැම දෙයක්ම සුපිරියටම කියලා දුන්නා ... හොද රිසාඩ් එකක් දාන්න ගොඩක් ආසයි මහන්සි වෙනවා උපරිම අවුලක් 2ක් පුරාවටම අපි වෙනුවෙන් කරපු හැම කැපකිරීමකටම ගොඩක් thanks සර්", name: "Student Name", batch: "2025 A/L Theory" },
  { text: "සර් අනෙ මට අන්තිම දවසේ එන්න බැරි වුනා.. ඒත් සර් අවුරුදු 2ක් පුරාවට සර් අපි වෙනුවෙන් කරපු කියපු හැමදේටම ගොඩක් Thankyou sir...මම මේක අනිවාරෙන් කියන්න ඕනි...සර්ගෙ මෝටිවේශන් නම් ඇත්තටම මරු සර්... සර් හැමලමයෙක් ගැනම හොදට හොයලා බලලා බැරි පාඩම් කියලා දීලා හොද රිසාල්ට් එකක් දාන්න උපරිම මට්ටමට සර්ට පුලුවන් දේ සර් කරනවා...මම ඒක හොදට බලපු දෙයක් සර්ගෙ.. ඇත්තටම හරිම දුකයි සර් ආයෙ පන්ති එන්න වෙන්නෙ නෑ කියලා හිතට දැනෙද්දී... සර් කියන කරන හැමවැඩක්ම සාර්ථක වෙන්න කියලා මම මගේ මුලු හවවතින්ම ප්‍රාර්ථනා කරනවා... ඇත්තටම සර් හරිම දුකයි ආයෙ එන්න වෙන්නෙ නෑ කියලා හිතෙද්දී...සර් ආයෙ හම්බෙන්න එන්නම් හොද රිසාල්ට් එකක් එක්කම සර්...එතකම් සර්ට ජය වේවා...", name: "Student Name", batch: "2025 A/L Theory" },
  { text: "Ah sir thank you අපි වෙනුවෙන් අවුරුදු 2කටත් වඩා කාලයක් කැපකරාට හදවතට වැදුනු ගුරුවරු අතරේ සරැත් ඉන්නවා විටෙක සහෝදරයෙක් වගේ තවත් වෙලාවකට යාලුවෙක් වගේ සර්ට ගොඩක්ම පිං පාඩමේ නොතේරෙන තැන් සියපාරක් හරි උගන්නලා ගොඩ දන්න try karapu ekata සමහර දවසට සර්ට මොන වැඩේ තිබුනත් ඒක කල් දලා අපේ පන්තිය කරා අපි වෙනුවෙන් සර් මහන්සි වෙච්ච තරමට හොද ප්‍රතිපල එන්නම ඕනී අනිත් ගුරුවරු වගේ කිසිම ගුරුමුෂ්ටියක් නැතිව දන්න සියලුම දේ අපිට කියලා දුන්නා සර්ට වරදින්න එපා කවදාවත්ම තව තව හරියන්න ඕනී උාරුබොක්කෙන් අපි ඉන්නෝ ඕන දේකට", name: "Student Name", batch: "2025 A/L Theory" },
  { text: "මෙච්චර කාලයක් හරිම ආසාවෙන් ආපු පන්තිය අදින් ඉවර වෙනවා කියද්දි මාරම දුකක් දැනෙනවා . මෙච්චර කාලයක් තිස්සෙ අපිට පොලිටිකල් විෂය ලස්සනට ,තේරෙන විදිහට ඉගැන්නුවා . ඒ වගේම ජීවිතයට වැදගත් පාඩම් ගොඩකුත් කියලා දුන්නට සර්ට ගොඩක් ස්තූතියි.සර්ගෙ කැපවීම සහ මගපෙන්වීම අපිට ලොකු ශක්තියක් වුනා . සර් කරපු හැමදේටම ගොඩක් පින් , සර්ගෙ ඉදිරි සියලු වැඩ කටයුතු සාර්ථක වේවා! කියලා ප්‍රාර්ථනා කරනවා", name: "Student Name", batch: "2025 A/L Theory" },
  { text: "සර්ගෙ වෙඩිල්ල එක්ක බලුවා ම නම් පේපර් එක මොකක් ද කියලා හිතුනා Mcq එක නම් සර් ගෙ වෙඩිල්ල පේපර් ළගින් තියන්නවත් බෑ සර් එච්චර වෙඩිල්ල කොලිටියි ..", name: "Student Name", batch: "2025 A/L Theory" },
]

export default function Landing() {
  const heroRef = useRef(null)
  const branchesGridRef = useRef(null)
  const aboutTextRef = useRef(null)
  const aboutSectionRef = useRef(null)
  const classesSectionRef = useRef(null)
  const contactSectionRef = useRef(null)
  const reviewsSectionRef = useRef(null)
  const resultSectionRef = useRef(null)
  const programmeSectionRef = useRef(null)
  const [classesLoading, setClassesLoading] = useState(true)
  const [isAboutVisible, setIsAboutVisible] = useState(false)
  const [isClassesVisible, setIsClassesVisible] = useState(false)
  const [isContactVisible, setIsContactVisible] = useState(false)
  const [isReviewsVisible, setIsReviewsVisible] = useState(false)

  useScrollReveal(branchesGridRef)
  useScrollReveal(aboutTextRef)
  useScrollReveal(resultSectionRef)
  useScrollReveal(programmeSectionRef)

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

  useEffect(() => {
    const section = reviewsSectionRef.current
    if (!section) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      setIsReviewsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsReviewsVisible(true)
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
    <div className="w-full relative min-h-screen cursor-default" style={{ background: gradientBg }}>
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
        {/* <div className='flex'>
          <div className="w-1/2 h-40 m-10 mt-24"><h1 className="text-4xl font-gemunu">අපේ වැඩපිළිවෙල</h1>

<p className="text-md mt-4">වසර දෙකක අධ්යන කාලයක් තුළ අධයනය කිරීමට ඇති විෂය නිර්දේශය අප විභාගයට මාස 3කට පෙර අවසන් කර උසස් පෙළ විභාගය ඉලක්ක කොට ළමයකුගේ තාර්කිකත්වය සහ ප්‍රශ්නවලට සාර්ථකව මුහුණදීමට ඇති හැකියාව ඔප්නම් වන විධිමත් වැඩ පිළිවෙලක් සහිතව අප පාඨමාලව සකස්කොට ඇත.</p>

 </div>
          <div className="w-1/2 bg-white h-40 m-10"></div>
        </div> */}
      </section>

      <section
        id="programme"
        ref={programmeSectionRef}
        className="programme-bg relative px-6 py-20 scroll-mt-20 cursor-default"
      >
        <div className="relative mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="classes-title reveal-text">
              Our <span className="text-yellow-500">Blueprint</span>
            </h2>
            <p className="classes-subtitle reveal-text" data-delay="150">
        From the first lesson to the final paper, one clear path
      </p>
          </div>

          <div className="relative">
            <div
              className="absolute bottom-0 top-0 left-5 w-px -translate-x-1/2 md:left-1/2"
              style={{
                background:
                  'linear-gradient(to bottom, transparent, rgba(255,201,1,0.6) 6%, rgba(255,96,0,0.6) 94%, transparent)',
                boxShadow: '0 0 12px rgba(255,96,0,0.45)',
              }}
            />
            {PROGRAMME_STEPS.map((step, index) => {
              const isLast = index === PROGRAMME_STEPS.length - 1
              return (
                <div
                  key={step.id}
                  className={`relative ${isLast ? '' : 'mb-10'} md:grid md:grid-cols-2 cursor-pointer`}
                >
                  <div
                    className="absolute left-5 top-6 z-10 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-[#ffc901] bg-[#0c0b0b] text-sm font-bold text-[#ffc901] md:left-1/2"
                    style={{ boxShadow: '0 0 18px rgba(255,96,0,0.45)' }}
                  >
                    {(index + 1).toString().padStart(2, '0')}
                  </div>
                  <div
                    className={`absolute left-5 top-[43px] h-px w-9 bg-[rgba(255,201,1,0.5)] md:w-14 ${
                      index % 2 === 0 ? 'md:left-auto md:right-1/2' : 'md:left-1/2'
                    }`}
                  />
                  <div
                    className={`reveal-card pl-14 ${
                      index % 2 === 0 ? 'md:col-start-1 md:pl-0 md:pr-14' : 'md:col-start-2 md:pl-14'
                    }`}
                  >
                    <div
                      className="rounded-2xl border border-white/10 bg-[#141211] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#ffc901]/70 hover:shadow-[0_0_40px_-12px_rgba(255,201,1,0.45)]"
                    >
                      <span
                        className="inline-block rounded-md px-4 py-1.5 text-lg font-bold text-white"
                        style={{
                          background: LABEL_GRADIENT,
                          ...(step.sinhalaLabel ? { fontFamily: SINHALA_FONT } : {}),
                        }}
                      >
                        {step.label}
                      </span>
                      {step.description ? (
                        <p
                          className="mt-4 text-[0.95rem] leading-relaxed text-white/75"
                          style={{ fontFamily: SINHALA_FONT }}
                        >
                          {step.description}
                        </p>
                      ) : (
                        <p className="mt-4 text-sm italic text-white/40">
                          Description coming soon
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

<section
  id="results"
  ref={resultSectionRef}
  className="result-bg relative px-6 py-20 scroll-mt-20"
>
  <div className="mx-auto max-w-7xl">
    <div className="text-center mb-12">
      <h2 className="classes-title reveal-text"><span className="text-yellow-500">Proof</span>, not Promises</h2>
      <p className="classes-subtitle reveal-text" data-delay="150">
        Real students, real A/L results
      </p>
    </div>

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {MAIN_BANNERS.map((banner) => {
        const src = resultImage(banner.id)
        return (
          <div key={banner.id} className="reveal-card">
            <div
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#141211] aspect-[16/9] transition duration-300 hover:-translate-y-1 hover:border-[#ffc901]/70 hover:shadow-[0_0_40px_-12px_rgba(255,201,1,0.45)]"
            >
              {src ? (
                <img src={src} alt={banner.alt} className="block h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center border border-dashed border-[#ffc901]/35">
                  <p className="text-sm text-white/60 text-center">
                    Add {banner.id} to src/img/results
                  </p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>

    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
      {SUB_BANNERS.map((banner) => {
        const src = resultImage(banner.id)
        return (
          <div key={banner.id} className="reveal-card">
            <div
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#141211] aspect-[3/2] transition duration-300 hover:-translate-y-1 hover:border-[#ffc901]/70 hover:shadow-[0_0_40px_-12px_rgba(255,201,1,0.45)]"
            >
              {src ? (
                <img src={src} alt={banner.alt} className="block h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center border border-dashed border-[#ffc901]/35">
                  <p className="text-sm text-white/60 text-center">
                    Add {banner.id} to src/img/results
                  </p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  </div>
</section>

      <section id="reviews" ref={reviewsSectionRef} className="reviews-bg relative overflow-hidden px-6 py-24">
        <header className="text-center mb-16 relative z-10">
          <h2 className={`classes-title ${isReviewsVisible ? 'animate-slide-in-right' : 'opacity-0'}`}>
            Student <span className="text-yellow-500">Reviews</span></h2>
          <p className={`classes-subtitle mt-4 ${isReviewsVisible ? 'animate-slide-in-right-delay' : 'opacity-0'}`}>
            Hear what our students say about learning with us</p>
        </header>
        <div className="reviews-marquee relative z-10">
          <div className="reviews-track">
            {[0, 1].map((setIndex) => (
              <div key={setIndex} className="reviews-set" aria-hidden={setIndex === 1 ? 'true' : undefined}>
                {REVIEWS.map((r, i) => (
                  <article key={i} className="review-card" tabIndex={setIndex === 1 ? -1 : undefined}>
                    <span className="review-quote" aria-hidden="true">“</span>
                    <p className="review-text">{r.text}</p>
                    
                  </article>
                ))}
              </div>
            ))}
          </div>
        </div>
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