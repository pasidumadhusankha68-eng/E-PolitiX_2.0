import { useRef, useEffect, useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import Lightbox from '../components/Lightbox'

const CENTER_SCALE = 1.18
const MAX_TILT = 2
const TILT_GAIN = 0.12
const STEP_INTERVAL = 2500
const STEP_DURATION = 1300
const DRAG_THRESHOLD = 6
const RESUME_DELAY = 3000

const DESKTOP_HEIGHTS = [260, 200, 300, 220]

const galleryModules = import.meta.glob('../img/Gallery/*.jpg', { eager: true })
const photos = Object.values(galleryModules)
  .map(m => m.default)
  .slice(0, 12)

export default function GalleryStrip() {
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const wrapperRef = useRef(null)
  const trackRef = useRef(null)
  const imgRefs = useRef(new Array(24).fill(null))
  const s = useRef({
    pos: 0,
    target: 0,
    prev: 0,
    setWidth: 0,
    offsets: new Array(24).fill(0),
    widths: new Array(24).fill(0),
    scales: Array(24).fill(1),
    initialized: false,
    stepping: false,
    stepStart: 0,
    stepFrom: 0,
    stepTo: 0,
    restElapsed: 0,
    lightboxOpen: false,
    dragging: false,
    moved: false,
    startX: 0,
    startPos: 0,
    snapping: false,
    raf: null,
    resizeRaf: null,
    lastTime: 0,
    observer: null,
  })

  const [lightboxIndex, setLightboxIndex] = useState(null)

  const centreOf = (i) => s.current.offsets[i] + s.current.widths[i] / 2

  const posForIndex = (i) => centreOf(i) - wrapperRef.current.clientWidth / 2

  const nearestIndex = () => {
    const wrapper = wrapperRef.current
    const centre = s.current.pos + wrapper.clientWidth / 2
    let best = 0
    let bestDist = Infinity
    for (let i = 0; i < 24; i++) {
      const d = Math.abs(centreOf(i) - centre)
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    }
    return best
  }

  const clamp = (v, min, max) => Math.min(Math.max(v, min), max)

  const openAt = (index) => {
    setLightboxIndex(index)
    s.current.lightboxOpen = true
  }

  const onClose = () => {
    setLightboxIndex(null)
    s.current.lightboxOpen = false
  }

  const measure = useCallback(() => {
    const wrapper = wrapperRef.current
    const imgs = imgRefs.current
    if (!wrapper || imgs.some((img) => !img)) return

    for (let i = 0; i < 24; i++) {
      const img = imgs[i]
      s.current.offsets[i] = img.offsetLeft
      s.current.widths[i] = img.offsetWidth
    }
    s.current.setWidth = s.current.offsets[12] - s.current.offsets[0]

    if (s.current.setWidth > 0 && !s.current.initialized) {
      const startPos = posForIndex(12)
      s.current.pos = startPos
      s.current.target = startPos
      s.current.prev = startPos
      s.current.initialized = true
    }
  }, [])

  const onImgLoad = useCallback(() => {
    measure()
  }, [measure])

  const onResize = useCallback(() => {
    if (s.current.resizeRaf) cancelAnimationFrame(s.current.resizeRaf)
    s.current.resizeRaf = requestAnimationFrame(() => {
      measure()
      s.current.resizeRaf = null
    })
  }, [measure])

  const loop = useCallback((now) => {
    const wrapper = wrapperRef.current
    if (!wrapper) {
      s.current.raf = requestAnimationFrame(loop)
      return
    }

    const dt = Math.max(8, Math.min(50, now - s.current.lastTime))
    s.current.lastTime = now

    const paused = s.current.dragging || s.current.lightboxOpen || document.hidden

    if (paused) {
      s.current.restElapsed = 0
    } else if (!s.current.stepping) {
      s.current.restElapsed += dt
      if (s.current.restElapsed >= STEP_INTERVAL - STEP_DURATION) {
        s.current.stepping = true
        s.current.stepStart = now
        s.current.stepFrom = s.current.pos
        s.current.stepTo = posForIndex(nearestIndex() + 1)
        s.current.restElapsed = 0
      }
    }

    if (s.current.stepping) {
      const t = clamp((now - s.current.stepStart) / STEP_DURATION, 0, 1)
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      s.current.pos = s.current.stepFrom + (s.current.stepTo - s.current.stepFrom) * e
      s.current.target = s.current.pos
      if (t === 1) s.current.stepping = false
    }

    if (s.current.dragging && !s.current.stepping) {
      s.current.pos += (s.current.target - s.current.pos) * 0.35
    }
    if (s.current.snapping) {
      s.current.pos += (s.current.target - s.current.pos) * 0.07
      if (Math.abs(s.current.target - s.current.pos) < 0.5) {
        s.current.pos = s.current.target
        s.current.snapping = false
      }
    }

    const velocity = ((s.current.pos - s.current.prev) / dt) * 16.67
    s.current.prev = s.current.pos

    if (s.current.setWidth > 0) {
      if (s.current.pos >= s.current.setWidth) {
        s.current.pos -= s.current.setWidth
        s.current.target -= s.current.setWidth
        s.current.prev -= s.current.setWidth
        s.current.stepFrom -= s.current.setWidth
        s.current.stepTo -= s.current.setWidth
      }
      if (s.current.pos < 0) {
        s.current.pos += s.current.setWidth
        s.current.target += s.current.setWidth
        s.current.prev += s.current.setWidth
        s.current.stepFrom += s.current.setWidth
        s.current.stepTo += s.current.setWidth
      }
    }

    trackRef.current.style.transform = `translate3d(${-s.current.pos}px,0,0)`

    const n = nearestIndex()
    for (let i = 0; i < 24; i++) {
      const img = imgRefs.current[i]
      if (!img) continue
      s.current.scales[i] += (((i === n ? CENTER_SCALE : 1) - s.current.scales[i]) * 0.15)
      const rot = Math.abs(velocity) < 0.05 ? 0 : clamp(velocity * TILT_GAIN, -MAX_TILT, MAX_TILT)
      img.style.transform = `scale(${s.current.scales[i]}) rotate(${rot}deg)`
    }

    s.current.raf = requestAnimationFrame(loop)
  }, [])

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    if (prefersReduced) {
      measure()
      return
    }

    const onVisibilityChange = () => { s.current.lightboxOpen = document.hidden }
    window.addEventListener('visibilitychange', onVisibilityChange)

    window.addEventListener('resize', onResize)

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        if (entry.isIntersecting) {
          measure()
          s.current.lastTime = performance.now()
          s.current.raf = requestAnimationFrame(loop)
        } else {
          if (s.current.raf) {
            cancelAnimationFrame(s.current.raf)
            s.current.raf = null
          }
        }
      },
      { threshold: 0.1, rootMargin: '0px' }
    )
    observer.observe(wrapper)
    s.current.observer = observer

    return () => {
      if (s.current.raf) {
        cancelAnimationFrame(s.current.raf)
        s.current.raf = null
      }
      if (s.current.resizeRaf) {
        cancelAnimationFrame(s.current.resizeRaf)
        s.current.resizeRaf = null
      }
      window.removeEventListener('resize', onResize)
      window.removeEventListener('visibilitychange', onVisibilityChange)
      if (observer) observer.disconnect()
    }
  }, [measure, onResize, loop])

  const wrapperProps = prefersReduced
    ? {
        style: {
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          position: 'relative',
          cursor: 'default',
          WebkitOverflowScrolling: 'touch',
        },
      }
    : {
        onPointerDown: (e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          s.current.dragging = true
          s.current.moved = false
          s.current.stepping = false
          s.current.snapping = false
          s.current.startX = e.clientX
          s.current.startPos = s.current.pos
          e.currentTarget.style.cursor = 'grabbing'
        },
        onPointerMove: (e) => {
          if (!s.current.dragging) return
          const dx = e.clientX - s.current.startX
          if (Math.abs(dx) > DRAG_THRESHOLD) s.current.moved = true
          s.current.target = s.current.startPos - dx
        },
        onPointerUp: (e) => {
          s.current.dragging = false
          s.current.target = posForIndex(nearestIndex())
          s.current.snapping = true
          s.current.restElapsed = -(RESUME_DELAY - (STEP_INTERVAL - STEP_DURATION))
          e.currentTarget.style.cursor = 'grab'
        },
        onPointerCancel: (e) => {
          s.current.dragging = false
          s.current.target = posForIndex(nearestIndex())
          s.current.snapping = true
          s.current.restElapsed = -(RESUME_DELAY - (STEP_INTERVAL - STEP_DURATION))
          e.currentTarget.style.cursor = 'grab'
        },
        style: {
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          touchAction: 'pan-y',
          cursor: 'grab',
          maskImage: 'linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)',
        },
      }

  const stripContent = prefersReduced ? (
    <>
      {photos.map((src, i) => (
        <img
          key={`img-${i}`}
          ref={el => { imgRefs.current[i] = el }}
          className="gallery-photo"
          src={src}
          alt={`Gallery photo ${i + 1}`}
          loading="eager"
          draggable={false}
          data-h={i % 4}
          onLoad={onImgLoad}
          onClick={(e) => {
            if (s.current.moved) {
              s.current.moved = false
              return
            }
            openAt(i % 12)
          }}
          style={{
            width: 'auto',
            flexShrink: 0,
            cursor: 'pointer',
            borderRadius: 6,
            height: DESKTOP_HEIGHTS[i % 4],
            scrollSnapAlign: 'center',
          }}
        />
      ))}
    </>
  ) : (
    <>
      <div
        ref={trackRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 40,
          width: 'max-content',
          position: 'relative',
          zIndex: 1,
          willChange: 'transform',
        }}
      >
        {photos.map((src, i) => (
          <img
            key={`img-${i}`}
            ref={el => { imgRefs.current[i] = el }}
            className="gallery-photo"
            src={src}
            alt={`Gallery photo ${i + 1}`}
            loading="eager"
            draggable={false}
            data-h={i % 4}
            onLoad={onImgLoad}
            onClick={(e) => {
              if (s.current.moved) {
                s.current.moved = false
                return
              }
              openAt(i % 12)
            }}
            style={{
              width: 'auto',
              cursor: 'pointer',
              flexShrink: 0,
              borderRadius: 6,
            }}
          />
        ))}
        {photos.map((src, i) => (
          <img
            key={`img-${i}-b`}
            ref={el => { imgRefs.current[12 + i] = el }}
            className="gallery-photo"
            src={src}
            alt={`Gallery photo ${i + 1} (copy)`}
            loading="eager"
            draggable={false}
            aria-hidden="true"
            tabIndex={-1}
            data-h={i % 4}
            onLoad={onImgLoad}
            onClick={(e) => {
              if (s.current.moved) {
                s.current.moved = false
                return
              }
              openAt(i % 12)
            }}
            style={{
              width: 'auto',
              cursor: 'pointer',
              flexShrink: 0,
              borderRadius: 6,
            }}
          />
        ))}
      </div>
    </>
  )

  return (
    <section ref={wrapperRef} className="gallery-strip -mx-6" {...wrapperProps}>
      {stripContent}

      {lightboxIndex !== null && (
        <Lightbox
          images={photos}
          index={lightboxIndex}
          onClose={onClose}
          onIndexChange={setLightboxIndex}
        />
      )}
    </section>
  )
}
