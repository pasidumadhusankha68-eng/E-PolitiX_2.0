import { useCallback, useEffect, useState } from 'react'
import { api } from '../utils/api'

const ORANGE = '#c2410c'

const STATUS_STYLES = {
  Scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  Live: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Done: 'bg-slate-100 text-slate-600 border-slate-200',
  Cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
}

function formatColomboTime(iso) {
  const d = new Date(iso)
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Colombo',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(d)
  return parts.map((p) => p.value).join('')
}

function formatColomboDate(iso) {
  const d = new Date(iso)
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Colombo',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).formatToParts(d)
  const weekday = parts.find((p) => p.type === 'weekday').value
  const month = parts.find((p) => p.type === 'month').value
  const day = parts.find((p) => p.type === 'day').value
  return `${weekday} ${month} ${day}`
}

export default function TodayClasses() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [joinError, setJoinError] = useState(null)

  const fetchToday = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api('/online-classes/today')
      setClasses(res.items || [])
    } catch (err) {
      setError(err.message || 'Failed to load today’s classes')
      setClasses([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchToday()
  }, [fetchToday])

  // Reload every minute so button states update when the window opens
  useEffect(() => {
    const interval = setInterval(fetchToday, 60000)
    return () => clearInterval(interval)
  }, [fetchToday])

  const handleJoin = async (id) => {
    setJoinError(null)
    try {
      const res = await api(`/online-classes/${id}/join`)
      if (res.zoom_url) {
        window.open(res.zoom_url, '_blank', 'noopener,noreferrer')
      }
      if (res.passcode) {
        setJoinError(`Passcode: ${res.passcode}`)
      }
    } catch (err) {
      setJoinError(err.message || 'Failed to join class')
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-[#c2410c] rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-500 mt-2">Loading…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    )
  }

  const dateLabel = classes.length > 0 ? formatColomboDate(classes[0].starts_at) : ''

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Today’s classes</h2>
        {dateLabel && <span className="text-sm text-slate-500">{dateLabel}</span>}
      </div>

      {classes.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-slate-500">No classes today</p>
          <a
            href="/classes"
            className="mt-2 inline-block text-xs text-[#c2410c] hover:underline"
          >
            View all classes
          </a>
        </div>
      ) : (
        <>
          {classes.map((c) => {
            const time = formatColomboTime(c.starts_at)
            const isCancelled = c.status === 'Cancelled'
            const isDone = c.status === 'Done'
            return (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 mb-3 p-3 rounded-lg border border-slate-100 bg-slate-50"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-slate-500">{time}</p>
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">
                    {c.title}
                  </h4>
                  <p className="text-xs text-slate-600">{c.class_name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-medium border rounded-md px-2 py-0.5 ${
                      STATUS_STYLES[c.status] || STATUS_STYLES.Scheduled
                    }`}
                  >
                    {c.status}
                  </span>
                  {c.state === 'open' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleJoin(c.id)}
                        className="px-3 py-1.5 rounded-lg btn-gold-fill text-xs font-medium transition-colors"
                      >
                        Join class
                      </button>
                      {joinError && (
                        <span className="text-xs text-red-600">{joinError}</span>
                      )}
                    </>
                  )}
                  {c.state === 'waiting' && (
                    <button
                      disabled
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 text-xs cursor-not-allowed"
                    >
                      Opens 15 min before
                    </button>
                  )}
                  {c.state === 'locked' && (
                    <>
                      <p className="text-xs text-red-600">Payment pending</p>
                      <button
                        disabled
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 text-xs cursor-not-allowed"
                      >
                        Join
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <a
              href="/classes"
              className="text-sm text-[#c2410c] hover:underline"
            >
              View all classes
            </a>
          </div>
        </>
      )}
    </div>
  )
}
