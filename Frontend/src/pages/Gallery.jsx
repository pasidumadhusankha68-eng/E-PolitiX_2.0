import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import NavbarLanding from '../components/NavbarLanding'
import { galleryImages } from '../utils/galleryImages'
import Lightbox from '../components/Lightbox'

export default function Gallery() {
  const headerRef = useRef(null)
  const gridRef = useRef(null)
  const [ratios, setRatios] = useState([])
  const [lightboxIndex, setLightboxIndex] = useState(null)

  useEffect(() => {
    const header = headerRef.current
    if (!header) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const elements = header.querySelectorAll('.gallery-reveal')

    if (prefersReduced || !window.IntersectionObserver) {
      elements.forEach((el) => el.classList.add('is-visible'))
      return
    }

    elements.forEach((el, index) => {
      el.style.setProperty('--delay', `${index * 150}ms`)
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              el.classList.add('is-visible')
              observer.unobserve(el)
            }
          })
        },
        { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
      )
      observer.observe(el)
    })

    return () => {
      // observers are disconnected individually via unobserve
    }
  }, [])

  useEffect(() => {
    const total = galleryImages.length
    const computed = galleryImages.map(() => 1.5)

    if (total === 0) {
      setRatios(computed)
      return
    }

    let loaded = 0
    galleryImages.forEach((image, i) => {
      const img = new Image()
      img.src = image.src
      img.onload = () => {
        computed[i] = img.naturalWidth / img.naturalHeight || 1.5
        loaded += 1
        if (loaded >= total) {
          setRatios(computed)
        }
      }
      img.onerror = () => {
        loaded += 1
        if (loaded >= total) {
          setRatios(computed)
        }
      }
    })
    }, [])

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const elements = grid.querySelectorAll('.gallery-collage-item')

    if (prefersReduced || !window.IntersectionObserver) {
      elements.forEach((el) => el.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target
            el.classList.add('is-visible')
            observer.unobserve(el)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    )

    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [ratios.length])

  const openLightbox = (i) => {
    setLightboxIndex(i)
  }

  const closeLightbox = () => {
    setLightboxIndex(null)
  }

  const ratioFor = (i) => ratios[i] || 1.5

  return (
    <div className="min-h-screen scroll-m-0">
      <header ref={headerRef} className="text-center mt-20 mb-12">
        <Link
          to="/"
          className="inline-block text-white hover:text-[#e65600] transition-colors mb-4 border-b-2 pb-2 hover:border-[#e65600]"
          aria-label="Back to Home"
        >
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-x-1">← </span>
           Back to Home
        </Link>
        <h1 className="classes-title gallery-reveal" aria-label="E-PolitiX Life">
          E-PolitiX <span className="text-yellow-500">Life</span>
        </h1>
        <p className="classes-subtitle mt-4 gallery-reveal">
          The best lessons are the ones that keep us connected to where we came from
        </p>
        <hr
          className="gallery-line mx-auto mt-8 border-0 h-px w-full max-w-5xl gallery-reveal"
          aria-hidden="true"
        />
      </header>

      <div
        className="gallery-collage max-w-7xl mx-auto"
        ref={gridRef}
        role="list"
        aria-label="Gallery images"
      >
        {galleryImages.map((image, i) => {
          const ratio = ratioFor(i)
          return (
            <figure
              key={image.id}
              className="gallery-collage-item"
              role="listitem"
              tabIndex={0}
              style={{
                '--delay': `${(i % 6) * 80}ms`,
                flexGrow: ratio * 100,
                flexBasis: `calc(var(--row-h) * ${ratio})`,
              }}
              onClick={() => openLightbox(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  openLightbox(i)
                }
              }}
            >
              <img
                src={image.src}
                alt={`Gallery photo ${i + 1}`}
                loading="lazy"
                className="gallery-collage-img"
                style={{ aspectRatio: ratio }}
              />
            </figure>
          )
        })}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={galleryImages}
          index={lightboxIndex}
          onClose={closeLightbox}
          onIndexChange={setLightboxIndex}
        />
      )}
    </div>
  )
}
