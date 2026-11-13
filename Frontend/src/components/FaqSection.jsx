import { useState } from 'react'
import 'font-awesome/css/font-awesome.min.css'

const WHATSAPP_NUMBER = '94778808610'
const SINHALA_FONT = '"Noto Sans Sinhala", "Iskoola Pota", sans-serif'
const LABEL_GRADIENT = 'linear-gradient(90deg,#c2410c,#ff6000)'

const FAQS = [
  { id: 'q1', question: 'E-Politix සමඟ සම්බන්ධ වන්නේ කෙසේද?', answer: 'වෙබ් අඩවියේ ඇති Login (හෝ Register) පහසුකම භාවිතා කර ඔබටම ගිණුමක් සාදා ගැනීමෙන් පසුව, ඔබට E-Politix සමඟ නිල වශයෙන් සම්බන්ධ විය හැක. ඔබේ ගිණුමට අදාළ සියලුම විස්තර Dashboard හි Profile කොටස තුළින් පරීක්ෂා කළ හැක.' },
  { id: 'q2', question: 'පන්ති පැවැත්වෙන්නේ කෙසේද? (Physical / Online)', answer: 'දැනට පන්ති සඳහා සහභාගී වීමට ඔබ අදාළ භෞතික ආයතනයට පැමිණිය යුතුය. නමුත් ඉදිරියේදී නිවසේ සිටම Zoom තාක්ෂණය ඔස්සේ සජීවී Online පන්ති සඳහා සහභාගී වීමේ පහසුකම epolitix.lk හරහා හිමිවනු ඇත. Online පන්ති ආරම්භ වන දිනයන් සහ වැඩිදුර තොරතුරු දැනගැනීම සඳහා E-Politix Hotline අංකය අමතන්න.' },
  { id: 'q3', question: 'පන්ති ගාස්තු ගෙවීම් සිදු කළ හැක්කේ කෙසේද?', answer: 'දැනට පන්ති ගාස්තු ගෙවීම සිදු කළ හැක්කේ භෞතික ආයතන හරහා පමණි. ඉදිරියේදී Online පන්ති ආරම්භ වීමත් සමඟම, ඔබට බැංකු තැන්පතු ඔස්සේ පහසුවෙන් ගෙවීම් සිදු කිරීමේ හැකියාව ලැබෙනු ඇත.' },
  { id: 'q4', question: 'මට පන්තියක් මග හැරුණහොත් එහි වීඩියෝව (Recording) නැරඹිය හැකිද?', answer: 'ඔව්. සෑම පන්තියකම වීඩියෝව (Recording) පන්තිය අවසන් වූ පසු වෙබ් අඩවියට ඇතුළත් කෙරේ. ඔබට පන්තිය පැවැත්වූ දින සිට සතියක (දින 7ක) කාලයක් ඇතුළත එම වීඩියෝව නැරඹිය හැක. සතියක කාලය අවසන් වූ පසු එම වීඩියෝව වෙබ් අඩවියෙන් ස්වයංක්‍රීයව ඉවත් කෙරෙන බැවින්, නියමිත කාලය තුළ එය නැරඹීමට වගබලා ගන්න.' },
  { id: 'q5', question: 'මගේ විභාග ලකුණු සහ Rank එක බලාගන්නේ කෙසේද?', answer: 'ඔබේ සතිපතා ප්‍රශ්න පත්‍ර ලකුණු සහ සමස්ත ශ්‍රේණිගත කිරීම (Rank) ඔබේ ගිණුමට පිවිසීමෙන් පසු epolitix.lk හරහා ඕනෑම වේලාවක පහසුවෙන් බලාගත හැක.' },
  { id: 'q6', question: 'වෙබ් අඩවිය භාවිතයේදී තාක්ෂණික ගැටලුවක් ඇති වුවහොත් කුමක් කළ යුතුද?', answer: 'ගිණුමට පිවිසීමේදී, වීඩියෝ නැරඹීමේදී හෝ වෙනත් ඕනෑම තාක්ෂණික ගැටලුවක් ඇති වුවහොත්, වහාම E-Politix Hotline අංකය වෙත පණිවිඩයක් (Message/WhatsApp) යොමු කර අපගේ තාක්ෂණික සහය කණ්ඩායම සම්බන්ධ කරගන්න.' },
]

const phoneDisplay = `+94 ${WHATSAPP_NUMBER.slice(2, 4)} ${WHATSAPP_NUMBER.slice(4, 7)} ${WHATSAPP_NUMBER.slice(7)}`

const phoneIcon = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
)

const facebookIcon = (
  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

const youtubeIcon = (
  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
)

/**
 * Plus / X toggle icon.
 * Closed: a "+" in an outlined circle.
 * Open:   the same "+" turns 45 degrees into an "X" and the circle fills orange.
 * The two lines are drawn in one SVG, so they are always perfectly centred.
 */
function ToggleIcon({ isOpen }) {
  return (
    <span
      aria-hidden="true"
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300 motion-reduce:transition-none ${
        isOpen ? 'rotate-45 border-[#ff6000] bg-[#ff6000]' : 'border-white/20'
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke={isOpen ? '#1a0d02' : '#eab308'}
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
    </span>
  )
}

export default function FaqSection({ isVisible }) {
  // id of the one open question (null = all closed)
  const [openId, setOpenId] = useState(null)

  // clicking an open question closes it, clicking a closed one opens it
  const toggle = (id) => {
    setOpenId((prev) => (prev === id ? null : id))
  }

  return (
    <section
      id="faq"
      className={`min-h-screen relative px-6 py-20 overflow-hidden ${!isVisible ? 'opacity-0' : ''}`}
      style={{
        background: 'linear-gradient(180deg, #0B0A0A 0%, #141211 50%, #0B0A0A 100%)',
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--gold)_0%,_transparent_70%)] opacity-10" />
      <div className="relative z-10 max-w-6xl mx-auto w-full">

        {/* Header row */}
        <header className="flex items-end justify-between mb-12 lg:mb-16">
          <div className="text-center w-full">
            <span className="uppercase tracking-[0.2em] text-xs text-yellow-500 block mb-2">FAQ</span>
            <h2
              className={`classes-title ${isVisible ? 'animate-slide-in-right' : 'opacity-0'} text-4xl sm:text-6xl lg:text-8xl leading-none tracking-tight`}
            >
              PROBLEMS ? ,  <span className="text-yellow-500"> SOLVED.</span>
            </h2>
          </div>
        </header>

        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-12 lg:gap-20">

          {/* LEFT column */}
          <div
            className={`order-2 lg:order-1 lg:sticky lg:top-28 self-start border-t border-white/10 pt-6 ${isVisible ? 'animate-slide-in-right-delay' : 'opacity-0'}`}
          >
            <h3 className="text-2xl md:text-3xl font-semibold text-white mb-0">Have a different <span className='text-[#d4a017]'> Question ?</span> </h3>
            <p className="text-white/60 mt-3">If it's not here, ask us.</p>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full px-7 py-4 text-white font-bold uppercase tracking-widest text-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(255,96,0,0.6)] flex items-center gap-2"
                style={{ background: LABEL_GRADIENT }}
                aria-label="Chat on WhatsApp"
              >
                <i className="fa fa-whatsapp text-xl " aria-hidden="true" />
                WhatsApp Us
              </a>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                {phoneIcon}
                <span>{phoneDisplay}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="https://www.facebook.com/share/18apYRAecC/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center hover:border-yellow-500 hover:bg-yellow-500/10 transition-all duration-300 hover:text-yellow-500"
                aria-label="Facebook"
              >
                {facebookIcon}
              </a>
              <a
                href="https://youtube.com/@indunilsgamage?si=FAjeXsbUp3BttpXv"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center hover:border-yellow-500 hover:bg-yellow-500/10 transition-all duration-300 hover:text-yellow-500"
                aria-label="YouTube"
              >
                {youtubeIcon}
              </a>
            </div>
          </div>

          {/* RIGHT column - Accordion */}
          <div id="faq-list" className="order-1 lg:order-2">
            {FAQS.map((faq, index) => {
              const isOpen = openId === faq.id
              const delay = index * 80
              return (
                <div
                  key={faq.id}
                  className={`border-b border-white/10 ${index === 0 ? 'border-t border-white/10' : ''}`}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${faq.id}`}
                    id={`faq-question-${faq.id}`}
                    onClick={() => toggle(faq.id)}
                    className={`card-reveal ${isVisible ? 'is-visible' : ''} w-full flex justify-between items-center gap-6 py-6 md:py-7 text-left text-lg md:text-xl hover:text-yellow-500 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6000] focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                      isOpen ? 'text-yellow-500' : 'text-white'
                    }`}
                    style={{ '--delay': `${delay}ms`, fontFamily: SINHALA_FONT }}
                  >
                    <span>{faq.question}</span>
                    <ToggleIcon isOpen={isOpen} />
                  </button>

                  {/*
                    Answer panel.
                    The wrapper is a CSS grid that animates its row from 0fr (closed) to 1fr (open),
                    so the answer slides open and rolls back smoothly. The inner div must have
                    overflow-hidden for the closed row to collapse to zero height.
                  */}
                  <div
                    role="region"
                    id={`faq-answer-${faq.id}`}
                    aria-labelledby={`faq-question-${faq.id}`}
                    className="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
                    style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                  >
                    <div
                      className="overflow-hidden"
                      style={{
                        // keep hidden answers out of the tab order and away from screen readers
                        visibility: isOpen ? 'visible' : 'hidden',
                        transition: `visibility 0s linear ${isOpen ? '0s' : '300ms'}`,
                      }}
                    >
                      <div className="pb-6 pr-14 text-white/70 leading-relaxed" style={{ fontFamily: SINHALA_FONT }}>
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

    </section>
  )
}
