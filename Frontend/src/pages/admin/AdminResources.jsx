import { motion } from 'framer-motion'

const resources = [
  { id: 1, title: 'Mathematics Guide', type: 'PDF', category: 'Science', size: '2.4 MB', updated: '2 hours ago', status: 'Published' },
  { id: 2, title: 'History Notes', type: 'Document', category: 'Arts', size: '1.1 MB', updated: '1 day ago', status: 'Published' },
  { id: 3, title: 'English Practice', type: 'Video', category: 'Languages', size: '45 MB', updated: '3 days ago', status: 'Draft' },
  { id: 4, title: 'Chemistry Lab Manual', type: 'PDF', category: 'Science', size: '3.2 MB', updated: '1 week ago', status: 'Published' },
  { id: 5, title: 'Physics Formulas', type: 'Document', category: 'Science', size: '800 KB', updated: '2 weeks ago', status: 'Archived' },
]

const statusColors = {
  Published: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Draft: 'bg-amber-50 text-amber-700 border-amber-100',
  Archived: 'bg-slate-100 text-slate-600 border-slate-200',
}

export default function AdminResources() {
  const [search, setSearch] = useState('')

  const filtered = resources.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()) || r.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Resources</h1>
          <p className="text-slate-600 mt-1">Manage learning materials and documents.</p>
        </div>
        <button className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-slate-900/10 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Upload resource
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-md">
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
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeColor(resource.type)}`}>
                {typeIcon(resource.type)}
              </div>
              <span className={`text-xs font-medium border rounded-md px-2 py-0.5 ${statusColors[resource.status]}`}>
                {resource.status}
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">{resource.title}</h3>
            <p className="text-xs text-slate-500 mb-3 flex-1">{resource.category}</p>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-auto">
              <span>{resource.size}</span>
              <span>{resource.updated}</span>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                View
              </button>
              <button className="flex-1 py-2 rounded-lg border border-slate-200 text-xs font-medium text-sky-600 hover:bg-sky-50 hover:text-sky-700 transition-colors">
                Edit
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
    </motion.div>
  )
}

function typeColor(type) {
  const map = {
    PDF: 'bg-sky-50 text-sky-600',
    Document: 'bg-indigo-50 text-indigo-600',
    Video: 'bg-rose-50 text-rose-600',
  }
  return map[type] || 'bg-slate-100 text-slate-600'
}

function typeIcon(type) {
  const map = {
    PDF: '📄',
    Document: '📃',
    Video: '🎥',
  }
  return map[type] || '📎'
}
