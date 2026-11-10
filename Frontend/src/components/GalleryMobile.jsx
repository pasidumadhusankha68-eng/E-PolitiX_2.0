import { useEffect, useState } from 'react'
import Lightbox from './Lightbox'

const galleryModules = import.meta.glob('../img/Gallery/*.jpg', { eager: true })
const photos = Object.values(galleryModules).map(m => m.default)

export default function GalleryMobile() {
  const [ratios, setRatios] = useState([])
  const [lightboxIndex, setLightboxIndex] = useState(null)

  useEffect(() => {
    let cancelled = false
    const loaded = []

    const loadAll = () => {
      let pending = photos.length
      if (pending === 0) {
        if (!cancelled) setRatios([])
        return
      }
      photos.forEach((src, i) => {
        const img = new Image()
        img.onload = () => {
          loaded[i] = img.naturalWidth / img.naturalHeight
          pending -= 1
          if (pending === 0 && !cancelled) {
            setRatios(loaded)
          }
        }
        img.onerror = () => {
          loaded[i] = 1.5
          pending -= 1
          if (pending === 0 && !cancelled) {
            setRatios(loaded)
          }
        }
        img.src = src
      })
    }

    loadAll()
    return () => { cancelled = true }
  }, [photos])

  return (
    <div className="gallery-mobile-only">
      <div className={`gm-viewport${lightboxIndex !== null ? ' gm-paused' : ''}`}>
        <div className="gm-track">
          {[0, 1].map((setIndex) => (
            <div key={setIndex} className="gm-set"
                 aria-hidden={setIndex === 1 ? 'true' : undefined}>
              {photos.map((src, i) => {
                const r = ratios[i] || 1.5
                return (
                  <figure key={i} className="gm-item"
                    style={{ flexGrow: r * 100, flexBasis: `calc(var(--gm-row-h) * ${r})`, aspectRatio: r }}>
                    <img src={src} alt={`Gallery photo ${i + 1}`} loading="lazy"
                         draggable={false} className="gm-img"
                         tabIndex={setIndex === 1 ? -1 : 0}
                         onClick={() => setLightboxIndex(i)}
                         onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLightboxIndex(i) } }} />
                  </figure>
                )
              })}
            </div>
          ))}
        </div>
        <div className="gm-overlay" aria-hidden="true" />
      </div>
      {lightboxIndex !== null && (
        <Lightbox images={photos} index={lightboxIndex}
                  onClose={() => setLightboxIndex(null)}
                  onIndexChange={setLightboxIndex} />
      )}
    </div>
  )
}
