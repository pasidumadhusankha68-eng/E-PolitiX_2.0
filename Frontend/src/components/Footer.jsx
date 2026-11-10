import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-[#0b0b0b]">
      <div className="max-w-7xl mx-auto px-6 py-12 md:px-[10vw] md:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 lg:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl font-bold text-white tracking-tight">E-PolitiX</span>
            </div>
            <p className="text-text-muted text-sm leading-relaxed max-w-xs">
              Empowering A/L students with expert Political Science guidance,
              structured notes, and results-driven teaching since 2020.
            </p>
            <div className="flex gap-3 mt-6">
              <a
                href="https://www.facebook.com/share/18apYRAecC/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all hover:border-gold hover:bg-gold/10 hover:text-yellow-500"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href="https://whatsapp.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all hover:border-gold hover:bg-gold/10 hover:text-yellow-500"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.672m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378 3.44 3.44 0 01-1.141-1.006 12.43 12.43 0 00-.062-.678 11.4 11.4 0 00-.4-.974 10.18 10.18 0 00-.928-.928 11.38 11.38 0 00-.976-.4 12.6 12.6 0 00-.678-.062A3.44 3.44 0 012.38 12.88 9.86 9.86 0 01.999 7.846a9.874 9.874 0 014.577-5.175A9.865 9.865 0 0112 0c2.904 0 5.565 1.205 7.445 3.082a9.865 9.865 0 013.081 7.442c0 2.905-1.205 5.566-3.082 7.443a9.874 9.874 0 01-5.176 4.577 3.416 3.416 0 01-1.182-.06zM12 6.5a5.5 5.5 0 110 11 5.5 5.5 0 010-11zm0 2a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" />
                </svg>
              </a>
              <a
                href="https://youtube.com/@indunilsgamage?si=FAjeXsbUp3BttpXv"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all hover:border-gold hover:bg-gold/10 hover:text-yellow-500"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { label: 'Classes', href: '#classes' },
                { label: 'Programme', href: '#programme' },
                { label: 'Results', href: '#results' },
                { label: 'Reviews', href: '#reviews' },
                { label: 'Gallery', href: '#gallery' },
                { label: 'Contact', href: '#contact' }
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="text-text-muted text-sm hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-6">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-white/80 mt-0.5">📞</span>
                <div>
                  <p className="text-sm text-white">+94 41 222 3344</p>
                  <p className="text-sm text-text-muted">+94 77 123 4567</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-white/80 mt-0.5">✉️</span>
                <div>
                  <p className="text-sm text-white">info@epolitix.lk</p>
                  <p className="text-sm text-text-muted">admissions@epolitix.lk</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold mb-6">Stay Updated</h3>
            <p className="text-text-muted text-sm mb-4">
              Subscribe for class schedules, results updates, and new paper
              discussions.
            </p>
            <form className="flex flex-col sm:flex-row gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-gold"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-gold text-black font-semibold rounded-lg hover:bg-gold/90 transition-colors text-sm"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-text-muted text-sm">
            © {new Date().getFullYear()} E-PolitiX. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              to="/privacy"
              className="text-text-muted text-sm hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="text-text-muted text-sm hover:text-white transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
