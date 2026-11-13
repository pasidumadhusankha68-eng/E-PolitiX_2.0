import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-[#0b0a0a]">
      <div className="max-w-[1160px] mx-auto px-6 pt-20 md:pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-14 lg:gap-16">
          {/* LEFT */}
          <div>
            <p className="text-5xl md:text-6xl font-bold text-white mb-9" style={{ fontFamily: '"Bodoni Moda", Georgia, serif' }}>E-Politi<span className="text-yellow-500">X</span></p>
            <p className="text-xl font-semibold text-white">Teacher Name</p>
            <p className="text-white/55 mt-2">Qualification, University</p>
            <p className="text-lg text-white mt-5 max-w-[36ch] leading-relaxed">Expert Political Science guidance for A/L students, since 2020.</p>
            <a href="tel:+94778808610" className="block mt-10 text-3xl font-semibold tracking-wide text-white hover:text-yellow-500 transition-colors">077 880 8610</a>
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
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.672m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378 3.44 3.44 0 01-1.141-1.006 12.43 12.43 0 00-.062-.678 11.4 11.4 0 00-.4-.974 10.18 10.18 0 00-.928-.928 11.38 11.38 0 00-.976-.4 12.6 12.6 0 00-.678-.062A3.44 3.44 0 012.38 12.88 9.86 9.86 0 01.999 7.846a9.874 9.874 0 014.577-5.175A9.865 9.865 0 0112 0c2.904 0 5.565 1.205 7.445 3.082a9.865 9.865 0 013.081 7.442c0 2.905-1.205 5.566-3.082 7.443a9.874 9.874 0 01-5.176 4.577 3.416 3.416 0 01-1.182-.06zM12 6.5a5.5 5.5 0 110 11 5.5 5.5 0 010-11zm0 2a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" />
                </svg>
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
                  { label: 'Contact', href: '/#contact' }
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
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link
              to="/privacy"
              className="hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <span className="text-white/55 mx-1">and</span>
            <Link
              to="/terms"
              className="hover:text-white transition-colors"
            >
              Terms
            </Link>
            <span className="text-white">
              Designed &amp; built by Lumoria and{' '}
              <a
                href="https://oryn.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ff6000] border-b border-[#ff6000] hover:text-yellow-500 hover:border-yellow-500"
              >
                Oryn.dev
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
