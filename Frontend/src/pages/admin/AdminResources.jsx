import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '../../utils/api'
import Navbar from '../../components/Navbar'
import ResourceViewer from '../../components/ResourceViewer'
import ResourceModal from '../../components/admin/ResourceModal'

const statusColors = {
  Published: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Draft: 'bg-amber-50 text-amber-700 border-amber-100',
  Archived: 'bg-slate-100 text-slate-600 border-slate-200',
}

export default function AdminResources() {
  const [search, setSearch] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [serverError, setServerError] = useState(null)

  // Preview viewer state (admins: no watermark)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewTitle, setViewTitle] = useState(null)
  const [viewEmbedUrl, setViewEmbedUrl] = useState(null)

  // Add/edit modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingResource, setEditingResource] = useState(null)

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchResources = useCallback(async () => {
    setLoading(true)
    setError(null)
    setServerError(null)
    try {
      const data = await api('/admin/resources')
      setItems(data.items || [])
    } catch (err) {
      setError(err.message || 'Failed to load resources')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchResources()
  }, [fetchResources])

  const filtered = items.filter(
    (r) =>
      (r.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.category || '').toLowerCase().includes(search.toLowerCase())
  )

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
    // Optimistic update
    setItems((prev) =>
      prev.map((item) => (item.id === r.id ? { ...item, is_published: next } : item))
    )
    try {
      await api(`/admin/resources/${r.id}/publish`, {
        method: 'PATCH',
        body: { is_published: next },
      })
    } catch (err) {
      // Revert on failure
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
    } catch (err) {
      setServerError(err.message || 'Failed to delete resource')
    }
  }

  const resourceStatus = (r) => (r.is_published ? 'Published' : 'Draft')

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

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Resources</h1>
            <p className="text-slate-600 mt-1">Manage learning materials and documents.</p>
          </div>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-slate-900/10 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add resource
          </button>
        </div>

        {serverError && (
          <div className="max-w-md mb-4 rounded-xl border border-red-100 bg-red-50 p-4 text-red-700 text-sm">
            {serverError}
          </div>
        )}

        {/* Search */}
        <div className="relative w-full max-w-md mb-6">
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Resources grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((resource) => (
            <motion.div
              key={resource.id}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeColor(resource.category)}`}>
                  {typeIcon(resource.category)}
                </div>
                <span className={`text-xs font-medium border rounded-md px-2 py-0.5 ${statusColors[resourceStatus(resource)]}`}>
                  {resourceStatus(resource)}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">{resource.title}</h3>
              <p className="text-xs text-slate-500 mb-3 flex-1">{resource.category}</p>
              <div className="flex items-center justify-between text-xs text-slate-500 mt-auto">
                <span>{resource.resource_date || '-'}</span>
                <span>{resource.created_at ? new Date(resource.created_at).toLocaleDateString() : '-'}</span>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => handlePreview(resource)}
                  className="flex-1 py-2 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors"
                >
                  Preview
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(resource)}
                  className="flex-1 py-2 rounded-lg border border-slate-200 text-xs font-medium text-sky-600 hover:bg-sky-50 hover:text-sky-700 transition-colors"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePublish(resource)
                  }}
                  className="flex-1 py-2 rounded-lg border border-slate-200 text-xs font-medium ${
                    resource.is_published
                      ? 'text-emerald-700 hover:bg-emerald-50 border-emerald-100'
                      : 'text-amber-700 hover:bg-amber-50 border-amber-100'
                  } transition-colors"
                >
                  {resource.is_published ? 'Hide' : 'Show'}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteClick(resource)
                  }}
                  className="flex-1 py-2 rounded-lg border border-slate-200 text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="lg:col-span-3 rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16 text-center flex flex-col items-center justify-center">
              <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm text-slate-500">No resources found.</p>
            </div>
          )}
        </div>

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
                    className="px-5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
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

function typeColor(category) {
  const map = {
    note: 'bg-sky-50 text-sky-600',
    paper: 'bg-indigo-50 text-indigo-600',
    past_paper: 'bg-rose-50 text-rose-600',
  }
  return map[category] || 'bg-slate-100 text-slate-600'
}

function typeIcon(category) {
  const map = {
    note: '📝',
    paper: '📄',
    past_paper: '📑',
  }
  return map[category] || '📎'
}
