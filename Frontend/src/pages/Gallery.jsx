import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'

const galleryModules = import.meta.glob('../img/Gallery/*.jpg', { eager: true })
const galleryImages = Object.values(galleryModules).map(m => m.default)

export default function Gallery() {
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [zoom, setZoom] = useState(false)
  const [touchStartX, setTouchStartX] = useState(null)
  const gridRef = useRef(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [])

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const items = grid.querySelectorAll('.gallery-masonry-item')

    if (prefersReduced || !window.IntersectionObserver) {
      items.forEach((el) => el.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    items.forEach((item) => observer.observe(item))

    return () => observer.disconnect()
  }, [])

  const openLightbox = useCallback((index) => {
    setSelectedIndex(index)
    setIsLightboxOpen(true)
    setZoom(false)
    document.body.style.overflow = 'hidden'
  }, [])

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false)
    setZoom(false)
    document.body.style.overflow = ''
  }, [])

  const nextImage = useCallback(() => {
    setSelectedIndex((i) => (i + 1) % galleryImages.length)
    setZoom(false)
  }, [])

  const prevImage = useCallback(() => {
    setSelectedIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length)
    setZoom(false)
  }, [])

  useEffect(() => {
    const handleKey = (e) => {
      if (!isLightboxOpen) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') nextImage()
      if (e.key === 'ArrowLeft') prevImage()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isLightboxOpen, closeLightbox, nextImage, prevImage])

  useEffect(() => {
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX)
  }

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchStartX - touchEndX
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextImage()
      else prevImage()
    }
    setTouchStartX(null)
  }

  return (
    <div className="gallery-page-enter min-h-screen px-6 py-20" style={{ background: 'linear-gradient(180deg, #0B0A0A 0%, #141211 50%, #0B0A0A 100%)' }}>
      <header className="header-enter max-w-7xl mx-auto mb-12 text-center">
        <Link to="/" className="inline-flex items-center gap-2 text-text-muted hover:text-gold transition-colors mb-8" style={{ color: 'var(--text-muted)' }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Home
        </Link>
        <h1 className="classes-title">Photo <span className="text-yellow-500">Gallery</span></h1>
        <p className="classes-subtitle mt-4">{galleryImages.length} images • Click to enlarge</p>
      </header>

      <div className="grid-enter max-w-7xl mx-auto masonry-grid" role="list" aria-label="Gallery images" ref={gridRef}>
        {galleryImages.map((src, i) => (
          <figure key={i} className="gallery-masonry-item group cursor-pointer" role="listitem" style={{ '--i': i, '--delay': `${i * 80}ms` }}>
            <img 
              src={src} 
              alt={`Gallery image ${i + 1}`}
              loading="lazy"
              className="w-full h-auto rounded-xl border border-card-border transition-all duration-300 hover:scale-[1.02] hover:border-gold/50 hover:shadow-[0_0_40px_rgba(212,160,23,0.15)]"
              onClick={() => openLightbox(i)}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            />
            <figcaption className="sr-only">Image {i + 1} of {galleryImages.length}</figcaption>
          </figure>
        ))}
      </div>

      {isLightboxOpen && selectedIndex !== null && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={`Image ${selectedIndex + 1} of ${galleryImages.length}`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button 
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <button 
            className="absolute left-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10 hidden md:block" 
            onClick={(e) => { e.stopPropagation(); prevImage(); }} 
            aria-label="Previous"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          
          <button 
            className="absolute right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10 hidden md:block" 
            onClick={(e) => { e.stopPropagation(); nextImage(); }} 
            aria-label="Next"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>

          <div className="relative max-w-[90vw] max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={galleryImages[selectedIndex]}
              alt={`Gallery image ${selectedIndex + 1}`}
              className={`max-w-full max-h-[85vh] rounded-lg shadow-2xl transition-transform duration-300 ${zoom ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
              style={{ transform: zoom ? 'scale(1.5)' : 'scale(1)', transformOrigin: 'center center' }}
              onClick={() => setZoom(!zoom)}
            />
            
            <a
              href={galleryImages[selectedIndex]}
              download={`epolitix-gallery-${selectedIndex + 1}.jpg`}
              className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-gold text-black flex items-center justify-center hover:bg-gold/90 transition-colors shadow-lg"
              aria-label="Download image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </a>

            <div className="absolute bottom-4 left-4 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm">
              {selectedIndex + 1} / {galleryImages.length}
            </div>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 md:hidden">
            <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors" aria-label="Previous">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors" aria-label="Next">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-sm hidden md:block">Use ← → keys or swipe to navigate</p>
        </div>
      )}
    </div>
  )
}