import { useCallback, useEffect, useState } from 'react'
import { api } from '../../utils/api'

const CATEGORIES = [
  { value: 'note', label: 'Weekly note' },
  { value: 'paper', label: 'Paper' },
  { value: 'past_paper', label: 'Past paper' },
]

const ORANGE = '#c2410c'

export default function ResourceModal({ open, onClose, resource = null, onSave }) {
  const [classes, setClasses] = useState([])
  const [classesLoading, setClassesLoading] = useState(false)
  const [classId, setClassId] = useState('')
  const [category, setCategory] = useState('note')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [resourceDate, setResourceDate] = useState('')
  const [isPublished, setIsPublished] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [linkError, setLinkError] = useState(null)

  const todayISO = () => new Date().toISOString().slice(0, 10)

  useEffect(() => {
    if (!open) return
    setError(null)
    setLinkError(null)

    if (resource) {
      setClassId(String(resource.class_id ?? ''))
      setCategory(resource.category || 'note')
      setTitle(resource.title || '')
      setDescription(resource.description || '')
      setUrl(resource.url || '')
      setResourceDate(
        resource.resource_date ? String(resource.resource_date).slice(0, 10) : todayISO()
      )
      setIsPublished(resource.is_published ?? true)
    } else {
      setClassId('')
      setCategory('note')
      setTitle('')
      setDescription('')
      setUrl('')
      setResourceDate(todayISO())
      setIsPublished(true)
    }

    setClassesLoading(true)
    api('/admin/exams/classes')
      .then((data) => setClasses(Array.isArray(data) ? data : []))
      .catch(() => setClasses([]))
      .finally(() => setClassesLoading(false))
  }, [open, resource])

  const validateLink = useCallback((link) => {
    if (!link || !link.trim()) return 'Link is required'
    let parsed
    try {
      parsed = new URL(link.trim())
    } catch {
      return 'Enter a valid URL'
    }
    if (parsed.protocol !== 'https:') return 'Link must use https://'
    if (parsed.hostname !== 'drive.google.com' && parsed.hostname !== 'docs.google.com') {
      return 'Link must be a Google Drive or Google Docs file link'
    }
    return null
  }, [])

  const handleSave = useCallback(async () => {
    setError(null)
    setLinkError(null)

    if (!title.trim()) {
      setError('Title is required')
      return
    }
    if (!classId) {
      setError('Class is required')
      return
    }

    const linkErr = validateLink(url)
    if (linkErr) {
      setLinkError(linkErr)
      return
    }

    setSaving(true)
    try {
      const payload = {
        class_id: Number(classId),
        category,
        title: title.trim(),
        description: description.trim() || null,
        url: url.trim(),
        resource_date: resourceDate || todayISO(),
        is_published: isPublished,
      }
      if (resource) {
        await api(`/admin/resources/${resource.id}`, {
          method: 'PUT',
          body: payload,
        })
      } else {
        await api('/admin/resources', { method: 'POST', body: payload })
      }
      onClose()
      if (onSave) onSave()
    } catch (err) {
      setError(err.message || 'Failed to save resource')
    } finally {
      setSaving(false)
    }
  }, [
    title,
    classId,
    url,
    category,
    description,
    resourceDate,
    isPublished,
    resource,
    validateLink,
    onClose,
    onSave,
  ])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-hidden={!open || undefined}
      aria-label={resource ? 'Edit resource' : 'Add resource'}
    >
      {!open && <span aria-hidden="true" />}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 p-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              {resource ? 'Edit resource' : 'Add resource'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSave()
            }}
            className="px-6 py-4 space-y-4"
          >
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Class
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                disabled={classesLoading}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-[#c2410c] focus:border-transparent outline-none transition-colors disabled:opacity-50"
              >
                <option value="">Select a class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.exam_year ? ` (${c.exam_year})` : ''}
                  </option>
                ))}
              </select>
              {!classId && (
                <p className="text-xs text-red-600 mt-1">Class is required</p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Type
              </label>
              <div className="flex gap-2">
                {CATEGORIES.map((c) => {
                  const active = category === c.value
                  return (
                    <button
                      type="button"
                      key={c.value}
                      onClick={() => setCategory(c.value)}
                      className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors border ${
                        active
                          ? `bg-[#c2410c] text-white border-[#c2410c]`
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {c.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Title
              </label>
              <input
                type="text"
                placeholder="Resource title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  setError(null)
                }}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-[#c2410c] focus:border-transparent outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Description
              </label>
              <textarea
                placeholder="Optional description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-[#c2410c] focus:border-transparent outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Google Drive link
              </label>
              <input
                type="text"
                placeholder="https://drive.google.com/file/d/.../view"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  setLinkError(null)
                  setError(null)
                }}
                className={`w-full px-3 py-2.5 rounded-lg border focus:ring-2 focus:border-transparent outline-none transition-colors ${
                  linkError
                    ? 'border-red-500 bg-red-50 focus:ring-red-500'
                    : 'border-slate-200 bg-slate-50 focus:ring-[#c2410c]'
                }`}
              />
              <p className="text-xs text-slate-500 mt-1">
                Paste a Google Drive or Google Docs file link (not a folder). In Drive: Share, then General access: Anyone with the link, Viewer.
              </p>
              {linkError && <p className="text-xs text-red-600 font-medium mt-1">{linkError}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={resourceDate}
                  onChange={(e) => setResourceDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-[#c2410c] focus:border-transparent outline-none transition-colors"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="rounded border-slate-300 text-[#c2410c] focus:ring-[#c2410c] bg-slate-50"
                  />
                  <span className="text-sm text-slate-700">Published</span>
                </label>
              </div>
            </div>

            {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 disabled:opacity-60 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !classId}
                className="px-5 py-2.5 rounded-lg bg-[#c2410c] text-white text-sm font-medium disabled:opacity-70 hover:opacity-90 transition-colors"
              >
                {saving ? 'Saving…' : resource ? 'Save changes' : 'Add resource'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
