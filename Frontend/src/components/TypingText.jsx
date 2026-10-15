import { useEffect, useMemo, useRef, useState } from 'react'

export default function TypingText({
  text,
  as: Tag = 'h2',
  className = '',
  typeSpeed = 80,
  cursorBlinkDuration = 2000,
  startDelay = 0,
  trigger = true,
  onComplete,
}) {
  // Grapheme-safe split (keeps Sinhala vowel signs attached)
  const graphemes = useMemo(() => {
    const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    return Array.from(seg.segment(text), s => s.segment)
  }, [text])

  const prefersReduced = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )

  const [count, setCount] = useState(0)
  const [showCursor, setShowCursor] = useState(false)

  // Keep latest onComplete without re-running the typing effect
  const onCompleteRef = useRef(onComplete)
  useEffect(() => {
    onCompleteRef.current = onComplete
  })

  useEffect(() => {
    if (prefersReduced) {
      setCount(graphemes.length)
      onCompleteRef.current?.()
      return
    }
    if (!trigger) return

    let i = 0
    let timer
    setCount(0)

    const step = () => {
      i += 1
      setCount(i)
      if (i < graphemes.length) {
        timer = setTimeout(step, typeSpeed)
      } else {
        onCompleteRef.current?.()
        //timer = setTimeout(() => setShowCursor(false), cursorBlinkDuration)
      }
    }

    timer = setTimeout(() => {
      setShowCursor(true)
      step()
    }, startDelay)

    return () => clearTimeout(timer)
  }, [trigger, graphemes, typeSpeed, startDelay, cursorBlinkDuration, prefersReduced])

  const visible = graphemes.slice(0, count).join('')

  return (
    <Tag className={className} aria-label={text}>
      {/* Both layers share one grid cell, so the full text reserves the final size */}
      <span style={{ display: 'grid' }}>
        <span aria-hidden="true" style={{ gridArea: '1 / 1', visibility: 'hidden' }}>
          {text}
        </span>
        <span aria-hidden="true" style={{ gridArea: '1 / 1' }}>
          {visible}
          {showCursor && <span className="typing-cursor">|</span>}
        </span>
      </span>
    </Tag>
  )
}