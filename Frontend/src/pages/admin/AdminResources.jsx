import { useCallback, useEffect, useState } from 'react'
import { api } from '../../utils/api'
import Navbar from '../../components/Navbar'
import ResourceViewer from '../../components/ResourceViewer'
import ResourceModal from '../../components/admin/ResourceModal'

const TYPE_BADGE = {
  note: 'bg-sky-50 text-sky-700 border-sky-200',
  paper: 'bg-amber-50 text-amber-700 border-amber-200',
  past_paper: 'bg-purple-50 text-purple-700 border-purple-200',
}

const TYPE_LABEL = {
  note: 'Weekly note',
  paper: 'Paper',
  past_paper: 'Past paper',
}

const STATUS_BADGE = {
  true: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  false: 'bg-slate-100 text-slate-600 border-slate-200',
}

export default function AdminResources() {
  const [search, setSearch] = useState('')
  const [classId, setClassId] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [items, setItems] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [serverError, setServerError] = useState(null)

  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewTitle, setViewTitle] = useState(null)
  const [viewEmbedUrl, setViewEmbedUrl] = useState(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingResource, setEditingResource] = useState(null)

  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchClasses = useCallback(async () => {
    try {
      const data = await api('/admin/exams/classes')
      setClasses(Array.isArray(data) ? data : [])
    } catch {
      setClasses([])
    }
  }, [])

  const fetchResources = useCallback(async () => {
    setLoading(true)
    setError(null)
    setServerError(null)
    try {
      const params = new URLSearchParams()
      if (classId) params.set('class_id', classId)
      if (categoryFilter !== 'all') params.set('category', categoryFilter)
      if (search) params.set('search', search)
      const data = await api(`/admin/resources?${params.toString()}`)
      setItems(data.items || [])
    } catch (err) {
      setError(err.message || 'Failed to load resources')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [search, classId, categoryFilter])

  useEffect(() => {
    fetchClasses()
    fetchResources()
  }, [fetchClasses, fetchResources])

  const filtered = items.filter(
    (r) =>
      (r.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.category || '').toLowerCase().includes(search.toLowerCase())
  )

  const counts = {
    all: items.length,
    note: items.filter((r) => r.category === 'note').length,
    paper: items.filter((r) => r.category === 'paper').length,
    past_paper: items.filter((r) => r.category === 'past_paper').length,
  }

  const handlePreview = (r) => {
    setViewTitle(r.title)
    setViewEmbedUrl(r.embed_url || r.url)
    setViewerOpen(true)
  }

  const handleViewerClose = () => {
    setViewerOpen(false)
    setViewEmbedUrl(null)
    setViewTitle(null)
  }

  const handleOpenAdd = () => {
    setEditingResource(null)
    setServerError(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (r) => {
    setEditingResource(r)
    setServerError(null)
    setModalOpen(true)
  }

  const handleSave = () => {
    setModalOpen(false)
    setEditingResource(null)
    fetchResources()
  }

  const handlePublish = async (r) => {
    const next = !r.is_published
    setItems((prev) =>
      prev.map((item) => (item.id === r.id ? { ...item, is_published: next } : item))
    )
    try {
      await api(`/admin/resources/${r.id}/publish`, {
        method: 'PATCH',
        body: { is_published: next },
      })
    } catch (err) {
      setItems((prev) =>
        prev.map((item) => (item.id === r.id ? { ...item, is_published: r.is_published } : item))
      )
      setServerError(err.message || 'Failed to update publish status')
    }
  }

  const handleDeleteClick = (r) => {
    setDeleteTarget({ id: r.id, title: r.title })
  }

  const handleDeleteCancel = () => {
    setDeleteTarget(null)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleteTarget(null)
    try {
      await api(`/admin/resources/${deleteTarget.id}`, { method: 'DELETE' })
      setItems((prev) => prev.filter((item) => item.id !== deleteTarget.id))
      fetchResources()
    } catch (err) {
      setServerError(err.message || 'Failed to delete resource')
    }
  }

  const resourceStatus = (r) => r.is_published ? 'Published' : 'Hidden'

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-[#c2410c] rounded-full animate-spin" />
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
          <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-red-700">
            <p className="font-medium">{error}</p>
            <button
              onClick={fetchResources}
              className="mt-3 inline-flex items-center gap-1 text-sm text-red-600 hover:underline"
            >
              Try again
            </button>
          </div>
        </main>
      </div>
    )
  }

  const visibleFrom = (filtered.length > 0 ? 1 : 0)
  const visibleTo = Math.min(visibleFrom + filtered.length - 1, filtered.length)

  return (
    <div className="min-h-screen bg-[#f3f4f6]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Resources</h1>
            <p className="text-slate-600 mt-1">
              Weekly notes, papers and past papers for paid students
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="bg-[#c2410c] hover:bg-[#a33a0e] text-white px-5 py-2.5 rounded-2xl font-medium transition-colors shadow-lg shadow-[#c2410c]/20 flex items-center gap-2"
          >
            <span>+</span> Add resource
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Class
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-[#c2410c] focus:border-transparent outline-none transition-colors"
              >
                <option value="">All classes</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.exam_year ? ` (${c.exam_year})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by title"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-[#c2410c] focus:border-transparent outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
                categoryFilter === 'all'
                  ? 'bg-[#c2410c] text-white border-[#c2410c]'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              All {counts.all}
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('note')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
                categoryFilter === 'note'
                  ? 'bg-[#c2410c] text-white border-[#c2410c]'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              Weekly notes {counts.note}
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('paper')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
                categoryFilter === 'paper'
                  ? 'bg-[#c2410c] text-white border-[#c2410c]'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              Papers {counts.paper}
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('past_paper')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
                categoryFilter === 'past_paper'
                  ? 'bg-[#c2410c] text-white border-[#c2410c]'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              Past papers {counts.past_paper}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">TITLE</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">TYPE</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">DATE</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">STATUS</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((resource) => (
                <tr
                  key={resource.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-900">{resource.title}</div>
                    <div className="text-xs text-slate-500">
                      Drive link · {resource.url ? new URL(resource.url).hostname : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${TYPE_BADGE[resource.category] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                      {TYPE_LABEL[resource.category] || resource.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {resource.resource_date || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_BADGE[resource.is_published]}`}>
                      {resource.is_published ? 'Published' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-xs">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handlePreview(resource)}
                        className="text-[#c2410c] hover:underline font-medium"
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(resource)}
                        className="ml-2 text-[#c2410c] hover:underline font-medium"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePublish(resource)}
                        className="ml-2 text-[#c2410c] hover:underline font-medium"
                      >
                        {resource.is_published ? 'Hide' : 'Show'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(resource)}
                        className="ml-2 text-[#c2410c] hover:underline font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-slate-500">No resources found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-600">
            <p>
              Showing {visibleFrom}-{visibleTo} of {filtered.length}
            </p>
            <p>
              Only paid students see published resources (the first week of each month is free).
            </p>
          </div>
        </div>

        {serverError && (
          <div className="max-w-md mt-4 rounded-xl border border-red-100 bg-red-50 p-4 text-red-700 text-sm">
            {serverError}
          </div>
        )}

        {viewerOpen && viewEmbedUrl && (
          <ResourceViewer
            isAdmin
            title={viewTitle}
            embedUrl={viewEmbedUrl}
            onClose={handleViewerClose}
          />
        )}

        <ResourceModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false)
            setEditingResource(null)
          }}
          resource={editingResource}
          onSave={handleSave}
        />

        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={handleDeleteCancel} />
            <div className="relative w-full max-w-md mx-4 p-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 text-center">
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Delete resource?
                </h3>
                <p className="text-slate-600 text-sm mb-6">
                  Delete &ldquo;{deleteTarget.title}&rdquo;? Students will no longer see it. To keep it, use Hide instead.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleDeleteCancel}
                    className="px-5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Keep
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteConfirm}
                    className="px-5 py-2.5 rounded-lg bg-[#c2410c] text-white text-sm font-medium hover:bg-[#a33a0e] transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
