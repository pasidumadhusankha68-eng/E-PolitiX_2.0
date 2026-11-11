import { useCallback, useEffect, useState } from 'react'
import { api } from '../utils/api'
import Navbar from '../components/Navbar'
import OnlineClassCard from '../components/OnlineClassCard'

const ORANGE = '#c2410c'

const STATUS_STYLES = {
  Scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  Live: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Done: 'bg-slate-100 text-slate-600 border-slate-200',
  Cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
}

function formatColombo(iso) {
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
  return { weekday, month, day, time, date: d }
}

function getColomboDate(iso) {
  const d = new Date(iso)
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Colombo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d)
  const y = parts.find((p) => p.type === 'year').value
  const m = parts.find((p) => p.type === 'month').value
  const day = parts.find((p) => p.type === 'day').value
  return new Date(`${y}-${m}-${day}T00:00:00`)
}

function pillClasses(active) {
  return `px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
    active
      ? 'btn-gold-fill border-transparent'
      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
  }`
}

export default function Classes() {
  const [tab, setTab] = useState('upcoming')
  const [upcoming, setUpcoming] = useState([])
  const [past, setPast] = useState([])
  const [pastPage, setPastPage] = useState(1)
  const [pastPageSize, setPastPageSize] = useState(10)
  const [pastTotal, setPastTotal] = useState(0)
  const [loading, setLoading] = useState({ upcoming: true, past: false })
  const [error, setError] = useState(null)

  const fetchUpcoming = useCallback(async () => {
    setLoading((prev) => ({ ...prev, upcoming: true }))
    setError(null)
    try {
      const res = await api('/online-classes/upcoming')
      setUpcoming(res.items || [])
    } catch (err) {
      setError(err.message || 'Failed to load upcoming classes')
      setUpcoming([])
    } finally {
      setLoading((prev) => ({ ...prev, upcoming: false }))
    }
  }, [])

  const fetchPast = useCallback(async () => {
    setLoading((prev) => ({ ...prev, past: true }))
    try {
      const res = await api(
        `/online-classes/past?page=${pastPage}&page_size=${pastPageSize}`
      )
      setPast(res.items || [])
      setPastTotal(res.total || 0)
    } catch (err) {
      setError(err.message || 'Failed to load past classes')
      setPast([])
    } finally {
      setLoading((prev) => ({ ...prev, past: false }))
    }
  }, [pastPage, pastPageSize])

  useEffect(() => {
    fetchUpcoming()
  }, [fetchUpcoming])

  useEffect(() => {
    if (tab === 'past') fetchPast()
  }, [tab, fetchPast])

  // Reload upcoming list every minute
  useEffect(() => {
    const interval = setInterval(fetchUpcoming, 60000)
    return () => clearInterval(interval)
  }, [fetchUpcoming])

  // Group upcoming by Today / Tomorrow / weekday
  const today = getColomboDate(new Date())
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const groups = []
  let currentGroup = null

  for (const c of upcoming) {
    const classDate = getColomboDate(c.starts_at)
    let label
    if (classDate.getTime() === today.getTime()) {
      label = 'Today'
    } else if (classDate.getTime() === tomorrow.getTime()) {
      label = 'Tomorrow'
    } else {
      const f = formatColombo(c.starts_at)
      label = `${f.weekday} ${f.month} ${f.day}`
    }

    if (!currentGroup || currentGroup.label !== label) {
      if (currentGroup) groups.push(currentGroup)
      currentGroup = { label, items: [] }
    }
    currentGroup.items.push(c)
  }
  if (currentGroup) groups.push(currentGroup)

  const pastStart = (pastPage - 1) * pastPageSize + 1
  const pastEnd = Math.min(pastPage * pastPageSize, pastTotal)

  if (loading.upcoming || loading.past) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-red-700">
            <p className="font-medium">{error}</p>
            <button
              onClick={() => {
                if (tab === 'past') fetchPast()
                else fetchUpcoming()
              }}
              className="mt-3 inline-flex items-center gap-1 text-sm text-red-600 hover:underline"
            >
              Try again
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Classes
            </h1>
            <p className="text-slate-500 text-sm">Your online classes</p>
          </div>
        </div>

        {/* Top card: OnlineClassCard */}
        <div className="mb-6">
          <OnlineClassCard />
        </div>

        {/* Pills */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setTab('upcoming')}
            className={pillClasses(tab === 'upcoming')}
          >
            Upcoming {upcoming.length}
          </button>
          <button
            type="button"
            onClick={() => setTab('past')}
            className={pillClasses(tab === 'past')}
          >
            Past {pastTotal}
          </button>
        </div>

        {tab === 'upcoming' ? (
          <>
            {groups.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-12 shadow-sm text-center">
                <p className="text-sm text-slate-500">No upcoming classes</p>
              </div>
            ) : (
              groups.map((group) => (
                <div key={group.label} className="mb-6">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 pl-2">
                    {group.label}
                  </h3>
                  {group.items.map((c) => {
                    const f = formatColombo(c.starts_at)
                    return (
                      <div
                        key={c.id}
                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm mb-3 flex items-start gap-4"
                      >
                        <div className="flex-shrink-0 w-12 text-center">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            {f.month}
                          </span>
                          <span className="text-xl font-bold text-slate-900">{f.day}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 mb-1">
                            <h3 className="text-sm font-bold text-slate-900 truncate">
                              {c.title}
                            </h3>
                            <span className={`text-xs font-medium border rounded-md px-2 py-0.5 ${STATUS_STYLES[c.status] || STATUS_STYLES.Scheduled}`}>
                              {c.status}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-1">
                            {c.class_name} · {f.time} · {c.duration_min} min
                          </p>
                          {c.notes && (
                            <p className="text-xs text-slate-500">{c.notes}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))
            )}
          </>
        ) : (
          <>
            {past.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-12 shadow-sm text-center">
                <p className="text-sm text-slate-500">No past classes yet</p>
              </div>
            ) : (
              <>
                {past.map((c) => {
                  const f = formatColombo(c.starts_at)
                  return (
                    <div
                      key={c.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm mb-3 flex items-start gap-4"
                    >
                      <div className="flex-shrink-0 w-12 text-center">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          {f.month}
                        </span>
                        <span className="text-xl font-bold text-slate-900">{f.day}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-1">
                          <h3 className="text-sm font-bold text-slate-900 truncate">
                            {c.title}
                          </h3>
                          <span className={`text-xs font-medium border rounded-md px-2 py-0.5 ${c.status === 'Cancelled' ? STATUS_STYLES.Cancelled : STATUS_STYLES.Done}`}>
                            {c.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-1">
                          {c.class_name} · {f.time} · {c.duration_min} min
                        </p>
                        {c.notes && (
                          <p className="text-xs text-slate-500">{c.notes}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    Showing {pastStart}-{pastEnd} of {pastTotal}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPastPage((p) => Math.max(1, p - 1))}
                      disabled={pastPage === 1 || loading.past}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => setPastPage((p) => p + 1)}
                      disabled={pastEnd >= pastTotal || loading.past}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}
