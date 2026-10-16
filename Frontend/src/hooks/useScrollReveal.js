import { useEffect } from 'react'

export default function useScrollReveal(containerRef) {
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const elements = container.querySelectorAll('.reveal-card, .reveal-text, .gallery-photo-item')

    if (prefersReduced || !window.IntersectionObserver) {
      elements.forEach((el) => el.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const intersectingEntries = entries.filter((e) => e.isIntersecting)
        intersectingEntries.forEach((entry, index) => {
          const el = entry.target
          const dataDelay = el.getAttribute('data-delay')
          if (dataDelay) {
            el.style.setProperty('--delay', `${dataDelay}ms`)
          } else {
            el.style.setProperty('--delay', `${index * 110}ms`)
          }
          el.classList.add('is-visible')
          observer.unobserve(el)
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    )

    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [containerRef])
}