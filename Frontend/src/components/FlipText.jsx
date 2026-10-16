import { useState, useEffect } from 'react'

export default function FlipText({ items, interval = 8000, duration = 600 }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const [maxWidth, setMaxWidth] = useState(0)
  const [maxHeight, setMaxHeight] = useState(0)

  useEffect(() => {
    if (document.hidden) return
    const timer = setInterval(() => {
      setHasStarted(true)
      setCurrentIndex((prev) => (prev + 1) % items.length)
    }, interval)
    return () => clearInterval(timer)
  }, [items, interval])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handle = () => {
      const rect = document.querySelector('.flip-text-sizer')?.getBoundingClientRect()
      if (rect) {
        setMaxWidth(rect.width)
        setMaxHeight(rect.height)
      }
    }
    handle()
    const ro = new ResizeObserver(handle)
    const sizer = document.querySelector('.flip-text-sizer')
    if (sizer) ro.observe(sizer)
    return () => { ro.disconnect(); mq.removeEventListener('change', handle) }
  }, [items])

  const isReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const currentItem = items[currentIndex]
  const nextItem = items[(currentIndex + 1) % items.length]
  const skip = !hasStarted
  const flipStyle = { color: '#ffc901', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '0.02em' }

  const wrapperStyle = { perspective: '800px' }
  if (maxWidth) wrapperStyle.width = maxWidth
  if (maxHeight) wrapperStyle.height = maxHeight

  return (
    <div className="flip-text-wrapper w-full mx-auto text-center -my-8" style={wrapperStyle}>
      <span className="flip-text-sizer" aria-hidden="true" style={{ ...flipStyle, whiteSpace: 'nowrap', position: 'absolute',textAlign: 'center', visibility: 'hidden', pointerEvents: 'none' }}>
        {items.map((item) => <span key={item} style={{ display: 'inline-block' }}>{item}</span>)}
      </span>
      <span
        className={`flip-text-span flip-out ${skip ? 'skip-anim' : ''} ${isReduced ? 'reduced' : ''}`}
        style={{ ...flipStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute', left: 0, right: 0, textAlign: 'center' }}
        aria-live="off"
      >
        {currentItem}
      </span>
      <span
        className={`flip-text-span flip-in ${skip ? 'skip-anim' : ''} ${isReduced ? 'reduced' : ''}`}
        style={{ ...flipStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute', left: 0, right: 0, textAlign: 'center' }}
        aria-live="off"
      >
        {nextItem}
      </span>
    </div>
  )
}
