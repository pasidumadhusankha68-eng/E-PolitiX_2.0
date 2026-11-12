import { useEffect, useRef, useState } from 'react'

export default function RegistrationSuccessModal({ studentCode, onContinue }) {
  const [copied, setCopied] = useState(false)
  const titleRef = useRef(null)
  const continueBtnRef = useRef(null)
  const bodyScrollRef = useRef(null)

  useEffect(() => {
    // Lock body scroll
    bodyScrollRef.current = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Announce to screen readers
    if (titleRef.current) titleRef.current.focus()

    // Focus the Continue button on open
    const btn = continueBtnRef.current
    if (btn) btn.focus()

    return () => {
      document.body.style.overflow = bodyScrollRef.current || ''
    }
  }, [])

  const handleCopy = async () => {
    const text = studentCode
    let success = false

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text)
        success = true
      } else {
        success = fallbackCopy(text)
      }
    } catch {
      success = fallbackCopy(text)
    }

    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const fallbackCopy = (text) => {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.setAttribute('readonly', '')
      ta.style.position = 'absolute'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.select()
      ta.setSelectionRange(0, 9999)
      const result = document.execCommand('copy')
      document.body.removeChild(ta)
      return result
    } catch {
      return false
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="registration-success-title"
      onClick={() => { /* do not close on backdrop click */ }}
    >
      <div className="w-full mx-4 max-w-md sm:p-5 p-5">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative">
          {/* Gold gradient strip at top */}
          <div className="h-1 w-full bg-gradient-to-r from-[#d4a017] to-[#ff6000]" />

          <div className="p-6 sm:p-8 text-center">
            {/* Check icon */}
            <div className="flex items-center justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-gold flex items-center justify-center text-white shadow-lg relative overflow-hidden">
                <svg
                  className="w-8 h-8 animate-check"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            <h2
              ref={titleRef}
              id="registration-success-title"
              className="text-2xl font-bold text-slate-900 mb-3"
            >
              Registration Successful
            </h2>

            <p className="text-sm text-slate-600 mb-6 font-sinhala">
              ඔබගේ ශිෂ්‍ය හැඳුනුම්පත් අංකය (Student ID):
            </p>

            {/* Student ID box */}
            <div className="relative mb-6">
              <div
                className="flex flex-col sm:flex-row sm:items-center gap-3 border-2 border-dashed border-gold bg-amber-50 rounded-lg p-4 min-h-[64px]"
              >
                <span
                  className={
                    'font-mono font-bold tracking-widest text-slate-900 ' +
                    (copied ? 'text-emerald-700' : '')
                  }
                  style={
                    copied ? { color: '#15803d' } : {}
                  }
                >
                  {studentCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={copied}
                  className={`mt-3 sm:mt-0 sm:self-start px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    copied
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              {copied && (
                <p className="text-[10px] text-emerald-600 font-medium mt-1.5 flex items-center gap-1">
                  <span aria-hidden="true">✓</span> Copied to clipboard
                </p>
              )}
            </div>

            {/* Note box */}
            <div className="bg-amber-50 rounded-lg p-4 mb-8 border border-amber-200">
              <div className="flex items-start gap-3">
                <span className="text-amber-600 mt-0.5" aria-hidden="true">
                  ⚠
                </span>
                <p className="text-sm text-amber-800 font-sinhala leading-relaxed">
                  කරුණාකර{' '}
                  <span className="font-bold">
                    සුරැකිව සටහන් කර තබා ගන්න.
                  </span>{' '}
                  ඉදිරියේදී පද්ධතියට පිවිසීම (Login) සඳහා ඔබට මෙම අංකය අනිවාර්යයෙන්ම අවශ්‍ය වේ.
                </p>
              </div>
            </div>

            <button
              ref={continueBtnRef}
              type="button"
              onClick={onContinue}
              className="w-full bg-gold text-white rounded-xl py-3 font-semibold shadow hover:opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
            >
              Continue to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
