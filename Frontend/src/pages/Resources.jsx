import { useCallback, useEffect, useState } from 'react'
import { api } from '../utils/api'
import Navbar from '../components/Navbar'
import ResourceViewer from '../components/ResourceViewer'

const GOLD = 'btn-gold-fill px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

export default function Resources() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [locked, setLocked] = useState(false)
  const [error, setError] = useState(null)

  // Viewer state (embed_url only lives while the viewer is open)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewTitle, setViewTitle] = useState(null)
  const [viewEmbedUrl, setViewEmbedUrl] = useState(null)
  const [viewWatermark, setViewWatermark] = useState(null)

  // Per-row "Opening..." state and row-level error messages
  const [openingId, setOpeningId] = useState(null)
  const [rowErrors, setRowErrors] = useState({})

  const fetchResources = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api('/resources')
      setItems(data.items || [])
    } catch (err) {
      if (err.status === 402) {
        setLocked(true)
      } else {
        setError(err.message || 'Failed to load resources')
        setItems([])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchResources()
  }, [fetchResources])

  const handleViewerClose = useCallback(() => {
    setViewerOpen(false)
    setViewEmbedUrl(null)
    setViewTitle(null)
    setViewWatermark(null)
  }, [])

  const handleView = useCallback(async (r) => {
    setOpeningId(r.id)
    setRowErrors((prev) => ({ ...prev, [r.id]: null }))
    try {
      const data = await api(`/resources/${r.id}/view`)
      setViewTitle(data.title)
      setViewEmbedUrl(data.embed_url)
      setViewWatermark(data.watermark)
      setViewerOpen(true)
    } catch (err) {
      if (err.status === 402) {
        setLocked(true)
      } else {
        setRowErrors((prev) => ({
          ...prev,
          [r.id]: err.message || 'This file cannot be shown here',
        }))
      }
    } finally {
      setOpeningId(null)
    }
  }, [])

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

  if (locked) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-red-700 shadow-sm">
            <h2 className="font-semibold text-red-800 mb-1">Payment required</h2>
            <p className="text-sm text-red-600">
              Your monthly payment is due. Pay your class fee to view resources.
            </p>
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Resources</h1>
            <p className="text-slate-500 text-sm">Study materials shared by your institute</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 shadow-sm text-center">
            <p className="text-sm text-slate-500">No resources available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((r) => {
              const isOpening = openingId === r.id
              return (
                <div
                  key={r.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {r.title}
                      </h3>
                      {r.is_new && (
                        <span className="text-[10px] font-semibold text-[#c2410c] uppercase tracking-wider px-2 py-0.5 border border-[#c2410c]/20 bg-[#c2410c]/10 rounded-full">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mb-1">{r.category}</p>
                    {r.description && (
                      <p className="text-sm text-slate-600 mb-1 line-clamp-2">{r.description}</p>
                    )}
                    <p className="text-xs text-slate-400">
                      {r.resource_date}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isOpening}
                    onClick={() => handleView(r)}
                    className={`${GOLD} w-full sm:w-auto`}
                  >
                    {isOpening ? 'Opening...' : 'View'}
                  </button>
                  {rowErrors[r.id] && (
                    <p className="text-xs text-red-600 font-medium">
                      {rowErrors[r.id]}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {viewerOpen && viewEmbedUrl && (
          <ResourceViewer
            title={viewTitle}
            embedUrl={viewEmbedUrl}
            watermark={viewWatermark}
            onClose={handleViewerClose}
          />
        )}
      </main>
    </div>
  )
}
