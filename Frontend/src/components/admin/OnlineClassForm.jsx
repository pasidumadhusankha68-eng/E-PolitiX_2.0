import { forwardRef, useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../../utils/api'

const ORANGE = '#c2410c'

export default forwardRef(function OnlineClassForm({ editing, dupForm, onSaveComplete }, ref) {
  const [classes, setClasses] = useState([])
  const [classesLoading, setClassesLoading] = useState(false)
  const [classesError, setClassesError] = useState(null)

  const [form, setForm] = useState({
    class_id: '',
    title: '',
    date: '',
    time: '',
    duration_min: 90,
    zoom_url: '',
    passcode: '',
    notes: '',
  })

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [clash, setClash] = useState(null) // {title, time}
  const [successMsg, setSuccessMsg] = useState(null)
  const [forceRetry, setForceRetry] = useState(false)

  const formRef = useRef(null)

  // Load classes for dropdown
  const loadClasses = useCallback(async () => {
    setClassesLoading(true)
    setClassesError(null)
    try {
      const res = await api('/admin/exams/classes')
      setClasses(Array.isArray(res) ? res : [])
    } catch (err) {
      setClassesError(err.message || 'Failed to load classes')
      setClasses([])
    } finally {
      setClassesLoading(false)
    }
  }, [])

  useEffect(() => {
    loadClasses()
  }, [loadClasses])

  // Initialize form when editing or duplicating
  useEffect(() => {
    if (editing) {
      // Convert stored UTC to Colombo time (+5:30) for display
      const d = new Date(editing.starts_at)
      const colomboMs =
        d.getTime() + 5 * 60 * 60 * 1000 + 30 * 60 * 1000
      const colomboDate = new Date(colomboMs)
      const dateStr = colomboDate.toISOString().slice(0, 10)
      const hh = String(colomboDate.getUTCHours()).padStart(2, '0')
      const mm = String(colomboDate.getUTCMinutes()).padStart(2, '0')
      setForm({
        class_id: String(editing.class_id),
        title: editing.title || '',
        date: dateStr,
        time: `${hh}:${mm}`,
        duration_min: editing.duration_min ?? 90,
        zoom_url: editing.zoom_url || '',
        passcode: editing.passcode || '',
        notes: editing.notes || '',
      })
      setSaveError(null)
      setClash(null)
      setSuccessMsg(null)
    } else if (dupForm) {
      // Duplicate: fill create-mode form with copied values, empty date/time/link/passcode
      setForm({
        class_id: String(dupForm.class_id),
        title: dupForm.title || '',
        date: '',
        time: '',
        duration_min: dupForm.duration_min ?? 90,
        zoom_url: '',
        passcode: '',
        notes: dupForm.notes || '',
      })
      setSaveError(null)
      setClash(null)
      setSuccessMsg(null)
    } else {
      setForm({
        class_id: '',
        title: '',
        date: '',
        time: '',
        duration_min: 90,
        zoom_url: '',
        passcode: '',
        notes: '',
      })
      setSaveError(null)
      setClash(null)
      setSuccessMsg(null)
    }
  }, [editing, dupForm])

  const clearForm = () => {
    setForm({
      class_id: '',
      title: '',
      date: '',
      time: '',
      duration_min: 90,
      zoom_url: '',
      passcode: '',
      notes: '',
    })
    setSaveError(null)
    setClash(null)
    setSuccessMsg(null)
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    // Clear clash/errors when user edits
    if (clash) setClash(null)
    if (saveError) setSaveError(null)
  }

  const validate = () => {
    const errors = []
    if (!form.title || !form.title.trim()) errors.push('Title is required')
    if (!form.zoom_url || !form.zoom_url.trim()) {
      errors.push('Zoom link is required')
    } else {
      const u = form.zoom_url.trim()
      if (!u.startsWith('https://')) {
        errors.push('Zoom link must start with https://')
      }
      if (!u.includes('zoom.us')) {
        errors.push('Zoom link must contain zoom.us')
      }
    }
    if (!form.date) errors.push('Date is required')
    if (!form.time) errors.push('Start time is required')
    if (!form.class_id) errors.push('Class is required')
    const duration = Number(form.duration_min)
    if (!Number.isFinite(duration) || duration < 15 || duration > 480) {
      errors.push('Duration must be between 15 and 480 minutes')
    }
    if (form.date && form.time) {
      const dt = new Date(`${form.date}T${form.time}:00+05:30`)
      if (isNaN(dt.getTime()) || dt <= new Date()) {
        errors.push('Date and time must be in the future')
      }
    }
    return errors
  }

  const buildPayload = (force) => ({
    class_id: Number(form.class_id),
    title: form.title.trim(),
    starts_at: `${form.date}T${form.time}:00+05:30`,
    duration_min: Number(form.duration_min),
    zoom_url: form.zoom_url.trim() || undefined,
    passcode: form.passcode.trim() || undefined,
    notes: form.notes.trim() || undefined,
    force: !!force,
  })

  const doSave = async (force) => {
    setSaveError(null)
    setClash(null)
    setSuccessMsg(null)

    const errors = validate()
    if (errors.length) {
      setSaveError(errors.join(' '))
      return
    }

    const payload = buildPayload(force)
    setSaving(true)
    try {
      if (editing) {
        await api(`/admin/online-classes/${editing.id}`, {
          method: 'PATCH',
          body: payload,
        })
      } else {
        await api('/admin/online-classes', {
          method: 'POST',
          body: payload,
        })
      }
      setSuccessMsg('Class scheduled')
      clearForm()
      setForceRetry(false)
      if (onSaveComplete) onSaveComplete()
    } catch (err) {
      if (err.status === 409 && err.data && err.data.clashes) {
        const c = err.data.clashes[0]
        const clashTime = c.starts_at
          ? new Date(c.starts_at).toLocaleTimeString('en-US', {
              timeZone: 'Asia/Colombo',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })
          : ''
        setClash({ title: c.title || 'another class', time: clashTime })
      } else {
        setSaveError(err.message || 'Failed to save class')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await doSave(forceRetry)
  }

  const handleSaveAnyway = async () => {
    setForceRetry(true)
    await doSave(true)
  }

  const isEdit = !!editing

  return (
    <div
      ref={ref}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-slate-900">
          {isEdit ? 'Edit class' : 'Schedule class'}
        </h2>
        {isEdit && (
          <button
            type="button"
            onClick={() => {
              clearForm()
              if (onSaveComplete) onSaveComplete()
            }}
            className="text-xs text-slate-500 hover:text-[#c2410c] underline"
          >
            Cancel
          </button>
        )}
      </div>

      {successMsg && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {successMsg}
        </div>
      )}

      {clash && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          This overlaps &ldquo;{clash.title}&rdquo; ({clash.time}). Change the time or save anyway.
          <div className="mt-3">
            <button
              type="button"
              onClick={handleSaveAnyway}
              className="text-xs font-medium text-[#c2410c] underline hover:text-orange-700"
            >
              Save anyway
            </button>
          </div>
        </div>
      )}

      {saveError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {saveError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Class
          </label>
          <select
            value={form.class_id}
            onChange={(e) => handleChange('class_id', e.target.value)}
            disabled={classesLoading || isEdit}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-[#c2410c] focus:border-transparent outline-none transition-colors disabled:opacity-50"
          >
            <option value="">Select a class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {classesLoading && (
            <p className="text-xs text-slate-400">Loading classes…</p>
          )}
          {classesError && <p className="text-xs text-red-600">{classesError}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Title
          </label>
          <input
            type="text"
            placeholder="e.g. Grade 10 Mathematics"
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-[#c2410c] focus:border-transparent outline-none transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Date
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => handleChange('date', e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-[#c2410c] focus:border-transparent outline-none transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Start time (Sri Lanka)
            </label>
            <input
              type="time"
              value={form.time}
              onChange={(e) => handleChange('time', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-[#c2410c] focus:border-transparent outline-none transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Duration in minutes
          </label>
          <input
            type="number"
            min={15}
            max={480}
            value={form.duration_min}
            onChange={(e) => handleChange('duration_min', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-[#c2410c] focus:border-transparent outline-none transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Zoom link
          </label>
          <input
            type="text"
            placeholder="https://us02web.zoom.us/j/..."
            value={form.zoom_url}
            onChange={(e) => handleChange('zoom_url', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-[#c2410c] focus:border-transparent outline-none transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Passcode (optional)
          </label>
          <input
            type="text"
            placeholder="Meeting passcode"
            value={form.passcode}
            onChange={(e) => handleChange('passcode', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-[#c2410c] focus:border-transparent outline-none transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Notes (optional)
          </label>
          <textarea
            rows={3}
            placeholder="Any additional notes"
            value={form.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-[#c2410c] focus:border-transparent outline-none transition-colors"
          />
        </div>

        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={clearForm}
            disabled={saving}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`flex-1 px-4 py-2 rounded-lg ${ORANGE} text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-700 transition-colors`}
          >
            {saving ? 'Saving…' : 'Save class'}
          </button>
        </div>
      </form>
    </div>
  )
})
