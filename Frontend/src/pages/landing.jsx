import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import NavbarLanding from '../components/NavbarLanding'
import FlipText from '../components/FlipText'
import heroBg from '../img/landing_page/background.png'
import headerImg from '../img/header.png'
import headerMobileImg from '../img/header_mobile.png'
import pgcovImg from '../img/pgcov.png'
import userImg from '../img/landing_page/container_two/user.png'
import ALImg from '../img/landing_page/container_one/AL.png'
import NameImg from '../img/landing_page/container_one/Name.png'
import landingSlangImg from '../img/landing_page/container_one/landing_page_slang.png'
import LevelCard from '../components/LevelCard'
import BranchCard from '../components/BranchCard'
import FaqSection from '../components/FaqSection'
import useScrollReveal from '../hooks/useScrollReveal'
import about_bg from '../img/about_bg.png'
import description from '../img/about/description.png'
import mainElementImg from '../img/about/main_element.png'
import TypingText from '../components/TypingText'
import GalleryMobile from '../components/GalleryMobile'
import ReviewsMobile from '../components/ReviewsMobile'
import Footer from '../components/Footer'


import '@fontsource/bodoni-moda/700.css'
// Noto Serif Sinhala (install first: npm i @fontsource/noto-serif-sinhala)
import '@fontsource/noto-serif-sinhala/400.css'
import '@fontsource/noto-serif-sinhala/700.css'

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
// Font for the closing letter paragraph
const SERIF_SINHALA = '"Noto Serif Sinhala", "Iskoola Pota", serif'
const LABEL_GRADIENT = 'linear-gradient(90deg, #c2410c, #ff6000)'

// Shared section-title styles (same look as the FAQ title)
const TITLE_CLASS = 'classes-title uppercase text-4xl sm:text-6xl lg:text-7xl leading-none tracking-tight'
const EYEBROW_CLASS = 'block mb-3 text-xs font-bold uppercase tracking-[0.2em] text-yellow-500'

const PROGRAMME_STEPS = [
  { id: 'theory', label: 'Theory', description: 'විෂය කරුණු සරලව හා පැහැදිලිව අවබෝධ කරගැනීමට අවශ්‍ය මූලික දැනුම මෙහිදී ලබාගත හැකිය.' },
  { id: 'skill-up', label: 'Skill Up', description: 'උසස්පෙළ විභාගයේ බහුවරණ ප්‍රශ්න පත්‍රය ඉලක්ක කරගත් මූලික අවධියේ සිට යන වැඩසටහනකි.' },
  { id: 'confidence', label: 'Confidence', description: 'උසස්පෙළ විභාගයේ ලියන ප්‍රශ්න පත්‍රය ඉලක්ක කරගත් මූලික අවධියේ සිට යන වැඩසටහනකි.' },
  { id: 'lessonmax', label: 'LessonMax', description: 'අප විභාගය සඳහා තෝරාගත් අනිවාර්ය පාඩම්වල උපරිමයට ගෙන ඒමේ වැඩසටහනකි.' },
  { id: 'revision', label: 'Revision', description: 'ඉගෙනගත් පාඩම් නැවත මතක් කරගෙන දැනුම තහවුරු කරගැනීමට මෙය උපකාරී වේ.' },
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

const teacherBio = `ගා/දෙල්ලව විද්‍යාලයෙන් මූලික අධ්‍යාපනය ලබා,
අ.පො.ස. උසස් පෙළට මාතර රාහුල විද්‍යාලයේ
සිසුවෙකු ලෙස පෙනීහිඳ ලංකාවේ විශ්ව විදද්‍යාල
ශ්‍රේණිගතකිරීම් අතර ඉහළම විශ්ව විද්‍යාලයක් වන
පේරාදෙණිය විශ්ව විද්‍යාලය තුළින් තම විශේෂවේදී
 උපාධිය හදාර ඇත. එමෙන්ම රුහුණු විශ්ව විදද්‍යාලයේ
Politics පිළිබඳ උපාධියක් හදාරා තිබේ.


ළමයින් 6 දෙනෙකුගෙන් ආරම්භ වූ අපගේ දේශපාලන
විද්‍යා පන්තිය මේ වන විට නෙළුව, මොරවක, දෙනියාය,
ඌරු බොක්ක යන ප්‍රදේශ වල වැඩිම සිසුන් පිරිසක්
සම්බන්ධවන පන්තිය බවට පත්වී ඇත.`

// Info card: mobile = 2 boxes on top + Centers row below. Desktop (md+) = all three in ONE line.
function InfoCard({ className = '' }) {
  return (
    <div className={`card-reveal is-visible overflow-hidden mt-10 border-t border-slate-100/0 md:border-slate-100/20 backdrop-blur-sm font-mono ${className}`}>
      <div className="md:grid md:grid-cols-3">
        {/* Batches + Medium: 2 columns on mobile, become direct grid cells on desktop (md:contents) */}
        <div className="grid grid-cols-2 md:contents">
          <div className="p-5 text-center md:py-8">
            <p
              className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#ffc901] animate-bounce"
              style={{ animationDuration: '3s', animationDelay: '0ms' }}
            >
              Batches
            </p>
            <p
              className="mt-2 text-sm text-white whitespace-nowrap animate-zoom"
              style={{ animationDuration: '3s', animationDelay: '0ms' }}
            >
              2027 | 2028
            </p>
          </div>

          <div className=" p-5 text-center md:py-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#ffc901]">Medium</p>
            <p className="mt-2 text-sm text-white">SINHALA</p>
          </div>
        </div>

        {/* Centers: own row on mobile, third column on desktop */}
        <div className=" px-3 py-5 text-center sm:p-5 md:border-t-0  md:py-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#ffc901]">Centers</p>
          <div className="mt-3 flex flex-nowrap justify-between gap-1.5 sm:flex-wrap sm:justify-center sm:gap-2">
            {['Morawaka', 'Deniyaya', 'Urubokka', 'Neluwa'].map((c) => (
              <span
                key={c}
                className="whitespace-nowrap rounded-full border border-[#ffc901]/40 bg-white/5 px-2 py-1 text-[9px] uppercase tracking-wider text-white/85 sm:px-3 sm:text-[11px] sm:tracking-widest"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Landing() {
  const heroRef = useRef(null)
  const branchesGridRef = useRef(null)
  const aboutTextRef = useRef(null)
  const aboutSectionRef = useRef(null)
  const classesSectionRef = useRef(null)
  const faqSectionRef = useRef(null)
  const reviewsSectionRef = useRef(null)
  const resultSectionRef = useRef(null)
  const programmeSectionRef = useRef(null)
  const [classesLoading, setClassesLoading] = useState(true)
  const [isAboutVisible, setIsAboutVisible] = useState(false)
  const [isClassesVisible, setIsClassesVisible] = useState(false)
  const [isFaqVisible, setIsFaqVisible] = useState(false)
  const [isReviewsVisible, setIsReviewsVisible] = useState(false)

  useScrollReveal(branchesGridRef)
  useScrollReveal(aboutTextRef)
  useScrollReveal(resultSectionRef)
  useScrollReveal(programmeSectionRef)

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
      { threshold: 0.1, rootMargin: '0px 0px -15% 0px' }
    )

    observer.observe(section)

    return () => observer.disconnect()
  }, [])

  // FAQ reveal. The ref is attached to the wrapper <div> around <FaqSection />
  // (it was never attached before, which kept the section invisible).
  useEffect(() => {
    const section = faqSectionRef.current
    if (!section) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      setIsFaqVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsFaqVisible(true)
            observer.unobserve(section)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px' }
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
      <section id="hero" ref={heroRef} className="min-h-screen relative overflow-hidden flex items-center justify-start px-6 pt-24 bg-reveal" style={{ backgroundImage: `url(${heroBg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', '--delay': '0.2s' }}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 w-full max-w-6xl mx-auto rounded-xl shadow-sm">
          <div className="flex flex-col md:flex-row min-h-0 md:min-h-[70vh] gap-0 md:gap-10">
          <div className="flex-1 p-2 md:p-8 text-center flex flex-col items-start justify-center -gap-2 " >
            <img src={ALImg} alt="AL" className="max-w-[120px] ml-2 md:max-w-[200px] md:ml-3 h-auto max-h-[200px] object-contain " />
            <img src={NameImg} alt="Name" className="max-w-[300px] md:max-w-full h-auto max-h-[200px] object-contain" />
            <img src={landingSlangImg} alt="Landing Slang" className="max-w-full h-auto max-h-[200px] object-contain" />
            <div className="flex flex-col md:flex-row gap-4 mt-8 md:mt-10 justify-start items-start">
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 text-xs px-5 py-2 md:px-5 md:py-3.5 rounded-lg md:rounded-[14px] bg-gradient-to-r from-[#ffc901] via-[#fff3b0] to-[#ff9a00] shadow-[0_8px_30px_-8px_rgba(255,160,0,0.6)] text-[#1a1204] font-extrabold uppercase tracking-wider md:text-sm animate-float hover:-translate-y-px hover:shadow-[0_0_20px_rgba(212,160,23,0.6)] transition-all duration-300 ml-2 md:ml-4"
                aria-label="Student Portal"
              >
                Student Portal
                <span className="ml-2 inline-block text-lg text-[#1a1204] transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">&#8594;</span>
              </Link>
            </div>
          </div>

          {/* Teacher image: on mobile it now sits directly under the button (no empty gap) */}
          <div className="flex-1 text-center -mt-2 md:mt-0">
            <img src={userImg} alt="User" className="mx-auto max-w-full h-auto max-h-[800px] object-contain" />
          </div>
          </div>

          {/* Info card: mobile only, now BELOW the teacher image (full device width) */}
          <InfoCard className="md:hidden w-screen relative -ml-5" />

          {/* Info card: desktop only, one full-width line (Batches | Medium | Centers) */}
          <InfoCard className="hidden md:block mt-8" />
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
          <span className={EYEBROW_CLASS}>01 · Classes</span>
          <h2
            id="classes-title"
            className={`${TITLE_CLASS} ${isClassesVisible ? 'animate-slide-in-right' : 'opacity-0'}`}
          >
            YOUR CITY . <span className="text-yellow-500">YOUR CLASS .</span>
          </h2>
          <p className={`classes-subtitle text-md ${isClassesVisible ? 'animate-slide-in-right-delay' : 'opacity-0'}`}>
            From the first scholarship paper to the final A/L exam, one institute that knows every step.
          </p>
        </header>
        <div className="branches-grid" ref={branchesGridRef}>
          <div className="reveal-card">
            <BranchCard
              name="Sapala - Deniyaya"
              al2027={{ date: 'සෙනසුරාදා', time: '12:30 - 14:30' }}
              alrev2027={{ date: 'බ්‍රහස්පතින්දා', time: '08:30 - 14:30' }}
              al2028={{ date: 'සෙනසුරාදා', time: '14:30 - 16:30' }}
              href="/branches/sapala-deniyaya"
              loading={classesLoading}
            />
          </div>
          <div className="reveal-card">
            <BranchCard
              name="Sasipro - Neluwa"
              al2027={{ date: 'සඳුදා', time: '08:30 - 12:00' }}
              alrev2027={{ date: 'සිකුරාදා', time: '08:30 - 14:00' }}
              al2028={{ date: 'සෙනසුරාදා', time: '08:30 - 11:30' }}
              href="/branches/sasipro-neluwa"
              loading={classesLoading}
            />
          </div>
          <div className="reveal-card">
            <BranchCard
              name="Wimasuma - Morawaka"
              al2027={{ date: 'ඉරිදා', time: '10:30 - 12:30' }}
              alrev2027={{ date: 'අඟහරුවාදා', time: '12:30 - 14:30' }}
              al2028={{ date: 'ඉරිදා', time: '08:30 - 10:30' }}
              href="/branches/wimasuma-morawaka"
              loading={classesLoading}
            />
          </div>
          <div className="reveal-card">
            <BranchCard
              name="New Excellent - Urubokka"
              al2027={{ date: 'බදාදා', time: '08:30 - 14:00' }}
              alrev2027={{ date: 'බදාදා', time: '08:30 - 14:00' }}
              al2028={{ date: 'ඉරිදා', time: '12:30 - ' }}
              href="/branches/new-excellent-urubokka"
              loading={classesLoading}
            />
          </div>
          <div className="reveal-card">
            <BranchCard
              name="Online - Islandwide"
              al2027={{ date: '', time: '' }}
              alrev2027={{ date: '', time: '' }}
              al2028={{ date: '', time: '' }}
              href="/branches/online"
              loading={classesLoading}
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        ref={aboutSectionRef}
        id="about"
        className="min-h-screen relative overflow-hidden px-6 pt-16 bg-reveal"
        style={{ backgroundImage: `url(${about_bg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', '--delay': '0.2s' }}
      >
        <div className="text-center w-full">
          <span className={EYEBROW_CLASS}>02 · The Teacher</span>
          <h2
            id="about-title"
            className={`${TITLE_CLASS} text-center w-full ${isAboutVisible ? 'animate-slide-in-right' : 'opacity-0'}`}
          >
            THE MIND BEHIND <span className="text-yellow-500"><br></br>THE MOVES.</span>
          </h2>
        </div>

        <div className="flex flex-col md:flex-row gap-10 md:gap-20 p-4 mt-10 w-full max-w-6xl mx-auto">
          <div className="p-6 flex flex-col items-center justify-center h-[63vh] md:h-[70vh] text-center text-2xl font-bold text-slate-900 teacher-arch w-[95%] mx-auto self-center md:flex-1 md:w-auto md:mx-0 md:self-stretch">
            <img src={mainElementImg} alt="Main Element" className="max-w-full h-auto max-h-full object-contain mb-4 scale-[135%] md:scale-150" />
          </div>
          <div className="flex-1 p-6 rounded-xl text-center font-bold text-slate-300">
            <TypingText
              text={teacherBio}
              as="p"
              className={`text-lg md:text-2xl font-bold leading-relaxed whitespace-pre-line ${isAboutVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
              typeSpeed={30}
              startDelay={100}
              trigger={isAboutVisible}
            />
          </div>
        </div>
      </section>

      {/* Blueprint / Programme Section */}
      <section
        id="programme"
        ref={programmeSectionRef}
        className="programme-bg relative px-6 py-20 scroll-mt-20 cursor-default"
      >
        <div className="relative mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <span className={EYEBROW_CLASS}>03 · The Blueprint</span>
            <h2 className={`${TITLE_CLASS} reveal-text`}>
              7 STEPS TO | <span className="text-yellow-500">CHECKMATE.</span>
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

      {/* Results Section */}
      <section
        id="results"
        ref={resultSectionRef}
        className="result-bg relative px-6 py-20 scroll-mt-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <span className={EYEBROW_CLASS}>04 · Results</span>
            <h2 className={`${TITLE_CLASS} reveal-text`}>
              NUMBERS DON'T <span className="text-yellow-500">LIE.</span>
            </h2>
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

      {/* Reviews Section */}
      <section id="reviews" ref={reviewsSectionRef} className="reviews-bg relative overflow-hidden px-6 py-24">
        <header className="text-center mb-16 relative z-10">
          <span className={EYEBROW_CLASS}>05 · Reviews</span>
          <h2 className={`${TITLE_CLASS} ${isReviewsVisible ? 'animate-slide-in-right' : 'opacity-0'}`}>
            THEY SAID IT, <span className="text-yellow-500">NOT US.</span>
          </h2>
          <p className={`classes-subtitle mt-4 ${isReviewsVisible ? 'animate-slide-in-right-delay' : 'opacity-0'}`}>
            Hear what our students say about learning with us
          </p>
        </header>
        <div className="reviews-marquee reviews-desktop-only relative z-10">
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
        <ReviewsMobile reviews={REVIEWS} />
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="gallery-bg min-h-screen scroll-mt-20">
        <header className="flex flex-col items-center text-center mb-12 px-6">
          <span className={`${EYEBROW_CLASS} mt-14`}>06 · Gallery</span>
          <h2 className={`${TITLE_CLASS} animate-slide-in-right`}>
            BEYOND THE <span className="text-yellow-500">CLASSROOM.</span>
          </h2>
          <div className="classes-subtitle animate-slide-in-right-delay mt-4">
            <FlipText items={['Prize Giving', 'New year celebration', 'Batch end party']} />
          </div>
        </header>
        <div className="flex justify-center max-w-6xl mx-auto mb-6">
          <Link
            to="/gallery"
            className="group inline-flex gap-3 border-b-2 border-white pb-1 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors hover:text-[#e65600] hover:border-[#e65600] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6000]"
            aria-label="View all gallery photos"
          >
            View All Albums
            <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>
        <GalleryMobile />
      </section>

      {/* FAQ Section: the ref lives on this wrapper so the observer can fire */}
      <div ref={faqSectionRef}>
        <FaqSection isVisible={isFaqVisible} />
      </div>

      {/* Closing letter section */}
      <section
        className={`min-h-screen relative px-6 py-20 overflow-hidden`}
        style={{
          background: 'linear-gradient(180deg, #0B0A0A 0%, #141211 50%, #0B0A0A 100%)',
        }}
      >
        <img src={headerMobileImg} alt="Header Mobile" className="mx-auto mb-4 block lg:hidden" style={{ maxWidth: '600px', width: '100%' }} />
        <img src={headerImg} alt="Header" className="mx-auto -ml-1 hidden lg:block" style={{ maxWidth: '900px', width: '100%' }} />
        <div className='relative z-10 flex flex-col md:flex-row min-h-[80vh] w-full max-w-8xl gap-5 rounded-xl shadow-sm '>
          <div className="flex-1 md:p-8 text-left flex flex-col items-start -gap-2  p-10">
            {/* Letter paragraphs in Noto Serif Sinhala */}
            <div
              className="pt-50 space-y-6 text-white text-xl md:text-2xl leading-[1.9]"
              style={{ fontFamily: SERIF_SINHALA }}
            >
              <p>
                දේශපාලන විද්‍යාව කියන්නේ කටපාඩම් කරන කරුණු ගොන්නක් නෙවෙයි. අපි ජීවත් වෙන සමාජය, අපේ ජීවිතයට බලපාන තීන්දු, ඒ තීන්දු ගන්නේ කවුද කියලා පැහැදිලිව දකින්න ඇති ශක්තිමත්ම ඇස.
              </p>
              <p>
                ඉතිහාසයේ මහා වෙනස්කම් ඇති වුණේ ප්‍රශ්න කරන්න, තර්ක කරන්න, තනිවම හිතන්න දැනගත් මිනිසුන් නිසයි. ඒ මිනිසා ඔබ වෙන්න පුළුවන්.
              </p>
              <p>
                වසර දෙකක ගමනේ මහන්සි හිතෙන දවස් එනවා. එත් මතක තියාගන්න, ඔබ ඉගෙනීමට යොදන සෑම පැයක්ම ඔබේ අනාගතයට කරන ආයෝජනයක්. විභාගයත් ජීවිතයත් දිනන්නේ පොඩි පොඩි පියවරවලින්.
              </p>
              <p>
                ප්‍රශ්න පත්‍රයෙන් ඔබ්බට, රටක් ගැනත් අයිතිවාසිකම් සහ වගකීම් ගැනත් විශ්වාසයෙන් කතා කරන්න අපි ඔබව සූදානම් කරනවා. ඒ නිසා පෙළපොත විතරක් නෙවෙයි, ලෝකයත් කියවන්න.
              </p>
              <p className="font-bold text-yellow-500 border-l-4 border-[#ff6000] pl-4">
                හොඳ පුරවැසියෙක් වීමේ පළමු පියවර, හොඳින් දැනුවත් වීමයි.
              </p>
            </div>
          </div>
          <div className="flex-1 p-2 md:p-8 text-center flex flex-col items-start justify-center -gap-2 ">
            <img src={pgcovImg} alt="PGCov" className="mx-auto mb-4 block" style={{ maxWidth: '600px', width: '100%' }} />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
