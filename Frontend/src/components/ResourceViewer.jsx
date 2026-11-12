import { useEffect, useRef, useCallback, useState } from 'react'

export default function ResourceViewer({
  title,
  embedUrl,
  watermark,
  onClose,
  isAdmin = false,
}) {
  const overlayRef = useRef(null)
  const panelRef = useRef(null)
  const closeBtnRef = useRef(null)
  const iframeRef = useRef(null)
  const prevActiveRef = useRef(null)

  const [loaded, setLoaded] = useState(false)
  const [timedOut, setTimedOut] = useState(false)

  const loadingTimeout = useRef(null)

  const timeoutMessage = timedOut && !loaded
    ? isAdmin
      ? 'If the file stays blank, check Drive sharing: General access must be Anyone with the link (Viewer).'
      : 'The file is taking a long time to open. If it stays blank, tell your institute.'
    : null

  useEffect(() => {
    prevActiveRef.current = document.activeElement
    document.body.style.overflow = 'hidden'
    if (closeBtnRef.current) closeBtnRef.current.focus()

    loadingTimeout.current = setTimeout(() => {
      setTimedOut(true)
    }, 12000)

    return () => {
      if (loadingTimeout.current) clearTimeout(loadingTimeout.current)
      document.body.style.overflow = ''
      if (prevActiveRef.current) prevActiveRef.current.focus()
    }
  }, [])

  const handleLoad = useCallback(() => {
    setLoaded(true)
    setTimedOut(false)
    if (loadingTimeout.current) clearTimeout(loadingTimeout.current)
  }, [])

  const handleKeydown = useCallback((e) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onClose()
      return
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      const panel = panelRef.current
      if (!panel) return
      const focusable = panel.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const items = Array.from(focusable).filter((el) => el.offsetParent !== null)
      if (items.length === 0) return
      const index = items.indexOf(document.activeElement)
      let next
      if (e.shiftKey) {
        next = index <= 0 ? items[items.length - 1] : items[index - 1]
      } else {
        next = index >= items.length - 1 ? items[0] : items[index + 1]
      }
      next.focus()
    }
  }, [onClose])

  useEffect(() => {
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [handleKeydown])

  const handleBackdropClick = (e) => {
    if (e.target !== overlayRef.current) return
    onClose()
  }

  const stop = (e) => e.stopPropagation()
  const handleClose = (e) => {
    if (e) e.stopPropagation()
    onClose()
  }

  const watermarkSpans = []
  if (watermark) {
    const spacing = 200
    const size = 1400
    for (let y = -spacing; y < size; y += spacing) {
      for (let x = -spacing; x < size; x += spacing) {
        watermarkSpans.push(
          <span
            key={`${x}-${y}`}
            className="absolute text-slate-900/10 text-lg font-semibold select-none rotate-[-30deg] whitespace-nowrap"
            style={{ left: x, top: y }}
          >
            {watermark}
          </span>
        )
      }
    }
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-slate-900/70"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={panelRef}
        className="absolute inset-0 md:inset-4 z-10 w-full h-full bg-white rounded-2xl flex flex-col overflow-hidden shadow-2xl outline-none"
        tabIndex={-1}
        aria-modal="true"
        aria-label={title}
        onClick={stop}
      >
        <header className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 shrink-0">
          <span className="flex-1 font-semibold text-slate-900 truncate">{title}</span>
          <button
            ref={closeBtnRef}
            type="button"
            aria-label="Close viewer"
            onClick={handleClose}
            className="min-w-[44px] min-h-[44px] w-12 h-12 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        {timeoutMessage && (
          <div className="px-4 py-2 text-sm border-b border-slate-200 shrink-0">
            <p className={`text-center ${isAdmin ? 'text-slate-800' : 'text-red-700'}`}>
              {timeoutMessage}
            </p>
          </div>
        )}

        <div className="relative flex-1 min-h-0 overflow-hidden">
          {!loaded && !timedOut && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
              <span className="text-slate-500 text-sm">Loading...</span>
            </div>
          )}
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0"
            src={embedUrl}
            title={title}
            sandbox="allow-scripts allow-same-origin"
            referrerPolicy="no-referrer"
            allow=""
            onLoad={handleLoad}
          />
          {watermark && (
            <div
              className="absolute inset-0 z-20 pointer-events-none select-none overflow-hidden"
              style={{ pointerEvents: 'none' }}
            >
              {watermarkSpans}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
