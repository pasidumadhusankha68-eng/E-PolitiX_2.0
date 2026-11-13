import { Link } from 'react-router-dom'
import landingpgLogo from '../img/landingpg_logo.png'
import signatureImg from '../img/signature.png'
import landingPageSlang from '../img/landing_page_slang.png'
import lumoriaImg from '../img/lumoria.svg'

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-[#0b0a0a]">
      <div className="max-w-[1160px] mx-auto px-6 pt-20 md:pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-14 lg:gap-16">
          {/* LEFT */}
          <div>
            <img src={landingpgLogo} alt="E-PolitiX" className="w-[200px] h-auto mb-5 -ml-2" />
            <img src={signatureImg} alt="Signature" className="w-[150px] h-auto mb-2" />
            <p className="text-white/55 mt-2 text-xs">B.A. special in University of Peradeniya </p>
            <img src={landingPageSlang} alt="Slang" className="mt-2 -ml-2 max-w-[30ch] h-auto" />
            <a href="tel:+94778808610" className="block mt-10 text-3xl font-semibold tracking-wide text-white hover:text-yellow-500 transition-colors">071 894 2559</a>
            <div className="mt-14 flex flex-wrap gap-x-8 gap-y-4">
              <a
                href="https://youtube.com/@indunilsgamage?si=FAjeXsbUp3BttpXv"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 text-sm font-semibold uppercase tracking-wider text-white hover:text-yellow-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                YOUTUBE
              </a>
              <a
                href="https://www.facebook.com/share/18apYRAecC/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 text-sm font-semibold uppercase tracking-wider text-white hover:text-yellow-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
                FACEBOOK
              </a>
              <a
                href="https://wa.me/94778808610"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 text-sm font-semibold uppercase tracking-wider text-white hover:text-yellow-500 transition-colors"
              >
                <i className="fa fa-whatsapp text-xl " aria-hidden="true" />
                WHATSAPP
              </a>
            </div>
          </div>

          {/* RIGHT */}
          <nav aria-label="Footer" className="grid grid-cols-2 sm:grid-cols-3 gap-8 content-start">
            {[
              {
                title: 'Classes',
                links: [
                  { label: '2027 A/L', href: '/#classes' },
                  { label: '2028 A/L', href: '/#classes' },
                  { label: 'Centres', href: '/#classes' }
                ]
              },
              {
                title: 'Results',
                links: [
                  { label: 'Results', href: '/#results' },
                  { label: 'Reviews', href: '/#reviews' },
                  { label: 'Photos', to: '/gallery' }
                ]
              },
              {
                title: 'More',
                links: [
                  { label: 'About', href: '/#about' },
                  { label: 'Our Programme', href: '/#programme' },
                  { label: 'FAQ', href: '/#faq' }
                ]
              }
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-[0.95rem] font-medium text-white/55 mb-9">{col.title}</h4>
                <ul className="space-y-7">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.to ? (
                        <Link
                          to={link.to}
                          className="text-lg text-white hover:text-yellow-500 transition-colors"
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          className="text-lg text-white hover:text-yellow-500 transition-colors"
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* BOTTOM BAR */}
        <div className="mt-16 md:mt-20 py-8 border-t border-white/10 flex flex-col md:flex-row md:justify-between gap-3 text-sm text-white/55">
          <span>© {new Date().getFullYear()} E-PolitiX</span>
          <div>
            <span className="text-white">
              Designed by
            </span>
            <img src={lumoriaImg} alt="Lumoria" className="inline-block h-5 mb-0.5 ml-2" />
          </div>
          <div>
            <span className="text-white">
              Developed by <span>Pasidu Madhusankha</span></span>
          </div>
        </div>
      </div>
    </footer>
  )
}
