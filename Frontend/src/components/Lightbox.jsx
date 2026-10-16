import { useEffect, useRef, useCallback, useState } from 'react'

export default function Lightbox({ images, index, onClose, onIndexChange }) {
  const containerRef = useRef(null)
  const closeBtnRef = useRef(null)
  const prevActive = useRef(null)
  const imgRef = useRef(null)
  const [zoomed, setZoomed] = useState(false)

  const isReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const last = images.length - 1

  useEffect(() => {
    prevActive.current = document.activeElement
    document.body.style.overflow = 'hidden'
    const cb = closeBtnRef.current
    if (cb) cb.focus()
    return () => {
      document.body.style.overflow = ''
      if (prevActive.current) prevActive.current.focus()
    }
  }, [])

  const go = useCallback((dir) => {
    onIndexChange((index + dir + images.length) % images.length)
  }, [index, images.length, onIndexChange])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') { onClose(); return }
    if (e.key === 'ArrowRight') { go(1); return }
    if (e.key === 'ArrowLeft') { go(-1); return }
  }, [go, onClose])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleBackdropClick = (e) => {
    if (e.target === containerRef.current) onClose()
  }

  const stop = (e) => e.stopPropagation()
  const close = (e) => { e.stopPropagation(); onClose() }

  const handleImgClick = (e) => {
    e.stopPropagation()
    setZoomed(!zoomed)
  }

  const handleDownload = (e) => {
    e.stopPropagation()
    const link = document.createElement('a')
    link.href = images[index].src
    link.download = `gallery-photo-${index + 1}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Swipe support
  const touchStartX = useRef(null)
  const touchStartY = useRef(null)

  const handleTouchStart = (e) => {
    const t = e.touches[0] || e
    touchStartX.current = t.clientX
    touchStartY.current = t.clientY
  }

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const t = e.changedTouches[0] || e
    const dx = t.clientX - touchStartX.current
    const dy = t.clientY - touchStartY.current
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx > 0) go(-1)
      else go(1)
    }
    touchStartX.current = null
    touchStartY.current = null
  }

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Image ${index + 1} of ${images.length}`}
      className="lightbox"
      onClick={handleBackdropClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        ref={closeBtnRef}
        type="button"
        className="lightbox-close"
        onClick={close}
        aria-label="Close"
      >
        <svg className="lightbox-close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      {images.length > 1 && (
        <>
          <button
            type="button"
            className="lightbox-arrow lightbox-prev"
            onClick={(e) => { e.stopPropagation(); go(-1) }}
            aria-label="Previous"
          >
            <svg className="lightbox-arrow-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            className="lightbox-arrow lightbox-next"
            onClick={(e) => { e.stopPropagation(); go(1) }}
            aria-label="Next"
          >
            <svg className="lightbox-arrow-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            type="button"
            className="lightbox-download"
            onClick={handleDownload}
            aria-label="Download"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
        </>
      )}
      <div className="lightbox-stage" onClick={stop} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <img
          ref={imgRef}
          className={`lightbox-img ${zoomed ? 'lightbox-img-zoom' : ''}`}
          src={images[index].src}
          alt={`Gallery photo ${index + 1}`}
          loading="lazy"
          decoding="async"
          onClick={handleImgClick}
          style={{ cursor: zoomed ? 'zoom-out' : 'zoom-in' }}
        />
      </div>
      <div className="lightbox-counter">{index + 1} / {images.length}</div>
    </div>
  )
}
