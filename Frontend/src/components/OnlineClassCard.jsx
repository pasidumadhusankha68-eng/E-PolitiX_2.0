import { useCallback, useEffect, useState } from 'react'
import { api } from '../utils/api'

const ORANGE = '#c2410c'

function formatColomboDateTime(iso) {
  const d = new Date(iso)
  const dateParts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Colombo',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).formatToParts(d)
  const weekday = dateParts.find((p) => p.type === 'weekday').value
  const month = dateParts.find((p) => p.type === 'month').value
  const day = dateParts.find((p) => p.type === 'day').value
  const timeParts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Colombo',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(d)
  const time = timeParts.map((p) => p.value).join('')
  return { weekday, month, day, time }
}

function countdownText(startsAt) {
  const start = new Date(startsAt).getTime()
  const now = new Date().getTime()
  const diffMs = start - now
  if (diffMs <= 0) return 'Started'
  const diffSec = Math.floor(diffMs / 1000)
  const days = Math.floor(diffSec / 86400)
  const hours = Math.floor((diffSec % 86400) / 3600)
  const minutes = Math.floor((diffSec % 3600) / 60)
  const parts = []
  if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`)
  if (hours > 0) parts.push(`${hours} h`)
  if (minutes > 0) parts.push(`${minutes} min`)
  if (parts.length === 0) parts.push('< 1 min')
  return parts.join(' ')
}

export default function OnlineClassCard() {
  const [next, setNext] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [countdown, setCountdown] = useState('')

  const fetchNext = useCallback(async () => {
    try {
      const res = await api('/online-classes/next')
      setNext(res.next || null)
      setError(null)
    } catch {
      setNext(null)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNext()
  }, [fetchNext])

  // Reload every minute so button state updates when the window opens
  useEffect(() => {
    const interval = setInterval(fetchNext, 60000)
    return () => clearInterval(interval)
  }, [fetchNext])

  // Update countdown every 30 seconds
  useEffect(() => {
    if (!next || !next.starts_at) {
      setCountdown('')
      return
    }
    setCountdown(countdownText(next.starts_at))
    const interval = setInterval(() => {
      setCountdown(countdownText(next.starts_at))
    }, 30000)
    return () => clearInterval(interval)
  }, [next])

  if (error || loading) return null

  if (!next) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">No online class scheduled</p>
      </div>
    )
  }

  const { weekday, month, day, time } = formatColomboDateTime(next.starts_at)
  const { state, can_join, zoom_url, passcode } = next

  return (
    <div
      className={`rounded-xl border p-5 shadow-sm ${
        state === 'open' ? `border-[#c2410c]` : 'border-slate-200'
      } bg-white`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Online class
        </span>
        {state === 'open' && (
          <span className="text-xs font-bold text-[#c2410c]">LIVE</span>
        )}
      </div>
      <h3 className="text-sm font-bold text-slate-900 mb-1">{next.title}</h3>
      <p className="text-sm text-slate-600 mb-3">
        {weekday} {month} {day} · {time}
      </p>
      <p className="text-xs text-slate-500 mb-3">
        Starts in {countdown}
      </p>

      {state === 'locked' && (
        <div className="rounded-lg border border-red-100 bg-red-50 p-3 mb-3">
          <p className="text-xs text-red-700">
            Your payment for this month is pending. Pay your class fee to join online classes.
          </p>
        </div>
      )}
      {state === 'locked' && (
        <button
          disabled
          className="w-full py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 text-sm font-medium cursor-not-allowed"
        >
          Join unavailable
        </button>
      )}

      {state === 'waiting' && (
        <button
          disabled
          className="w-full py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 text-sm font-medium cursor-not-allowed"
        >
          The link opens 15 minutes before class
        </button>
      )}

      {state === 'open' && (
        <>
          <button
            onClick={() => {
              if (zoom_url) {
                window.open(zoom_url, '_blank', 'noopener,noreferrer')
              }
            }}
            className={`w-full py-2 rounded-lg btn-gold-fill text-sm font-medium transition-colors`}
          >
            Join class
          </button>
          {passcode && (
            <p className="text-xs text-slate-500 mt-2">
              Passcode: {passcode}
            </p>
          )}
        </>
      )}
    </div>
  )
}
