import { useCallback, useEffect, useRef, useState } from 'react'
import AdminSideBar from '../../components/admin/AdminSideBar'
import OnlineClassForm from '../../components/admin/OnlineClassForm'
import { api } from '../../utils/api'

const ORANGE = '#c2410c'

const STATUS_STYLES = {
  Scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  Live: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Done: 'bg-slate-100 text-slate-600 border-slate-200',
  Cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
}

function formatColomboDateTime(iso) {
  const d = new Date(iso)
  const dateParts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Colombo',
    month: 'short',
    day: 'numeric',
  }).formatToParts(d)
  const month = dateParts.find((p) => p.type === 'month').value
  const day = dateParts.find((p) => p.type === 'day').value
  const timeParts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Colombo',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(d)
  const time = timeParts.map((p) => p.value).join('')
  return { month, day, time }
}

export default function AdminClasses() {
  const [when, setWhen] = useState('upcoming')
  const [items, setItems] = useState([])
  const [counts, setCounts] = useState({ upcoming: 0, past: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null)
  const [copied, setCopied] = useState({})
  const [confirmCancel, setConfirmCancel] = useState(null)
  const [cancelError, setCancelError] = useState(null)
  const formRef = useRef(null)

  const fetchClasses = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api(`/admin/online-classes?when=${when}`)
      setItems(res.items || [])
      setCounts(res.counts || { upcoming: 0, past: 0 })
    } catch (err) {
      setError(err.message || 'Failed to load classes')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [when])

  useEffect(() => {
    fetchClasses()
  }, [fetchClasses])

  const pillClasses = (active) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
      active
        ? `bg-[#c2410c] border-[#c2410c] text-white`
        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
    }`

  const handleCopyLink = async (zoom_url, label) => {
    if (!zoom_url) return
    try {
      await navigator.clipboard.writeText(zoom_url)
      setCopied((prev) => ({ ...prev, [label]: true }))
      setTimeout(() => {
        setCopied((prev) => ({ ...prev, [label]: false }))
      }, 2000)
    } catch {
      // clipboard blocked; ignore
    }
  }

  const handleDuplicate = (r) => {
    setDupForm({
      class_id: r.class_id,
      title: r.title,
      date: '',
      time: '',
      duration_min: r.duration_min,
      zoom_url: '',
      passcode: '',
      notes: r.notes || '',
    })
    setEditing(null)
    setSuccessMsg(null)
    setCancelError(null)
    setConfirmCancel(null)
    // Scroll form into view after a tick so the DOM updates
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 50)
  }

  const [dupForm, setDupForm] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  const handleEdit = (r) => {
    if (r.status === 'Cancelled' || r.status === 'Done') return
    setEditing(r)
    setDupForm(null)
    setSuccessMsg(null)
    setCancelError(null)
    setConfirmCancel(null)
  }

  const handleCancelConfirm = (r) => {
    setConfirmCancel({ id: r.id, title: r.title })
    setCancelError(null)
  }

  const handleCancelKeep = () => {
    setConfirmCancel(null)
    setCancelError(null)
  }

  const handleCancelClass = async () => {
    if (!confirmCancel) return
    setCancelError(null)
    try {
      await api(`/admin/online-classes/${confirmCancel.id}/cancel`, {
        method: 'POST',
      })
      setConfirmCancel(null)
      setSuccessMsg('Class cancelled')
      setEditing(null)
      setDupForm(null)
      fetchClasses()
    } catch (err) {
      setCancelError(err.message || 'Failed to cancel class')
    }
  }

  const handleSaveCompleteWithDuplicate = () => {
    fetchClasses()
    setEditing(null)
    setDupForm(null)
  }

  if (loading) {
    return (
      <section className="w-full bg-white/95 h-screen flex">
        <AdminSideBar />
        <main className="flex-1 overflow-y-auto min-h-0 bg-slate-50 scroll-sky">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="rounded-2xl border border-slate-200 bg-white p-12 shadow-sm text-center">
              <div className="w-3 h-3 rounded-full bg-slate-200 animate-pulse mx-auto mb-2" />
              <p className="text-sm text-slate-400">Loading classes…</p>
            </div>
          </div>
        </main>
      </section>
    )
  }

  if (error) {
    return (
      <section className="w-full bg-white/95 h-screen flex">
        <AdminSideBar />
        <main className="flex-1 overflow-y-auto min-h-0 bg-slate-50 scroll-sky">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-2">Classes</h2>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </main>
      </section>
    )
  }

  const rows = items
  const hasRows = rows.length > 0

  return (
    <section className="w-full bg-white/95 h-screen flex">
      <AdminSideBar />
      <main className="flex-1 overflow-y-auto min-h-0 bg-slate-50 scroll-sky">
        <div className="space-y-6 p-6 sm:p-8 lg:p-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Classes
              </h1>
              <p className="text-slate-600 mt-1">
                Schedule online classes and share the Zoom link with students
              </p>
            </div>
            <button
              type="button"
              className={`bg-[#c2410c] hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2`}
              aria-label="Schedule class"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              + Schedule class
            </button>
          </div>

          {/* Two columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Form card */}
            <div className="lg:col-span-3 lg:max-w-[380px]">
              <OnlineClassForm
                ref={formRef}
                editing={editing ? editing : null}
                dupForm={dupForm}
                onSaveComplete={handleSaveCompleteWithDuplicate}
              />
            </div>

            {/* Right: List card */}
            <div className="lg:col-span-9">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex gap-3 items-center">
                  <button
                    type="button"
                    onClick={() => setWhen('upcoming')}
                    className={pillClasses(when === 'upcoming')}
                  >
                    Upcoming {counts.upcoming}
                  </button>
                  <button
                    type="button"
                    onClick={() => setWhen('past')}
                    className={pillClasses(when === 'past')}
                  >
                    Past {counts.past}
                  </button>
                </div>

                {hasRows ? (
                  <div className="divide-y divide-slate-100">
                    {rows.map((r) => {
                      const { month, day, time } = formatColomboDateTime(r.starts_at)
                      const isCancelled = r.status === 'Cancelled'
                      const isDone = r.status === 'Done'
                      return (
                        <div
                          key={r.id}
                          className="px-6 py-4 flex items-start gap-4"
                        >
                          <div className="flex-shrink-0 w-12 text-center">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                              {month}
                            </span>
                            <span className="text-xl font-bold text-slate-900">{day}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2 mb-1">
                              <h3 className="text-sm font-bold text-slate-900 truncate">
                                {r.title}
                              </h3>
                              <span className={`text-xs font-medium border rounded-md px-2 py-0.5 ${STATUS_STYLES[r.status] || STATUS_STYLES.Scheduled}`}>
                                {r.status}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 mb-3">
                              {r.class_name} · {time} · {r.duration_min} min
                            </p>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                                aria-label="Copy link"
                                onClick={() => handleCopyLink(r.zoom_url, `copy-${r.id}`)}
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                {copied[`copy-${r.id}`] ? 'Copied' : 'Copy link'}
                              </button>
                              {!isCancelled && !isDone && (
                                <button
                                  type="button"
                                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                                  aria-label="Edit"
                                  onClick={() => handleEdit(r)}
                                >
                                  Edit
                                </button>
                              )}
                              <button
                                type="button"
                                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                                aria-label="Duplicate"
                                onClick={() => handleDuplicate(r)}
                              >
                                Duplicate
                              </button>
                              {!isCancelled && (
                                <button
                                  type="button"
                                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-red-600 bg-white hover:bg-red-50 transition-colors"
                                  aria-label="Cancel"
                                  onClick={() => handleCancelConfirm(r)}
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm text-slate-500">No classes yet</p>
                  </div>
                )}

                {confirmCancel && (
                  <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
                    <p className="text-sm text-slate-900 mb-3">
                      Cancel &ldquo;{confirmCancel.title}&rdquo;? Students will
                      see it as cancelled and will not get the link.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleCancelKeep}
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                      >
                        Keep class
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelClass}
                        className="flex-1 px-3 py-2 rounded-lg border border-red-200 bg-white text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Cancel class
                      </button>
                    </div>
                    {cancelError && (
                      <p className="mt-2 text-xs text-red-600">{cancelError}</p>
                    )}
                  </div>
                )}

                <div className="px-6 py-4 border-t border-slate-200">
                  <p className="text-xs text-slate-500">
                    Live and Done are worked out from the time. Students get the
                    Join button 15 minutes before the start.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </section>
  )
}
