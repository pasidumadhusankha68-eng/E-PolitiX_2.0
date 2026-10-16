import { useState, useEffect } from 'react'

const galleryModules = import.meta.glob('../img/gallery/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', { eager: true, import: 'default' })

export const galleryImages = Object.entries(galleryModules)
  .map(([path, src]) => {
    const fileName = path.split('/').pop() || ''
    const name = fileName.replace(/\.[^/.]+$/, '')
    return { id: name, src, name }
  })
  .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))

export function useImageRatios(images) {
  const [ratios, setRatios] = useState({})
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    const total = images.length
    let loaded = 0
    const next = {}

    if (total === 0) {
      setRatios({})
      setReady(true)
      return
    }

    const onDone = (id, ratio) => {
      if (cancelled) return
      next[id] = ratio
      loaded += 1
      if (loaded >= total) {
        setRatios(next)
        setReady(true)
      }
    }

    images.forEach((image) => {
      const img = new Image()
      img.src = image.src
      img.onload = () => onDone(image.id, img.naturalWidth / img.naturalHeight || 1.5)
      img.onerror = () => onDone(image.id, 1.5)
    })

    return () => { cancelled = true }
  }, [images])

  return { ratios, ready }
}
