import { motion } from 'framer-motion'

const classes = [
  { id: 1, name: 'Grade 9', teacher: 'Ms. Perera', students: 35, subject: 'General', status: 'Active' },
  { id: 2, name: 'Grade 10', teacher: 'Mr. Silva', students: 40, subject: 'General', status: 'Active' },
  { id: 3, name: 'Grade 11', teacher: 'Ms. Rao', students: 38, subject: 'Science', status: 'Active' },
  { id: 4, name: 'Grade 12', teacher: 'Mr. Fernando', students: 32, subject: 'Arts', status: 'Inactive' },
  { id: 5, name: 'Grade 8', teacher: 'Ms. Devi', students: 28, subject: 'General', status: 'Active' },
]

const statusColors = {
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Inactive: 'bg-slate-100 text-slate-600 border-slate-200',
}

export default function AdminClasses() {
  const [search, setSearch] = useState('')

  const filtered = classes.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.teacher.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Classes</h1>
          <p className="text-slate-600 mt-1">Manage class groups, teachers, and student rosters.</p>
        </div>
        <button className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-slate-900/10 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add class
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-md">
        <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search classes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
        />
      </div>

      {/* Classes grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((cls) => (
          <motion.div
            key={cls.id}
            whileHover={{ y: -4 }}
            className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 flex flex-col"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">{cls.name}</h3>
              <span className={`text-xs font-medium border rounded-md px-2.5 py-0.5 ${statusColors[cls.status]}`}>
                {cls.status}
              </span>
            </div>
            <div className="space-y-3 text-sm text-slate-600 mb-6 flex-1">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M23 21v-2a4 4 0 00-3-3.87M7 19l2 2 4-4" />
                </svg>
                <span>{cls.teacher}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>{cls.students} students</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H7z" />
                </svg>
                <span>{cls.subject}</span>
              </div>
            </div>
            <div className="mt-auto flex gap-2">
              <button className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                View roster
              </button>
              <button className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-sky-600 hover:bg-sky-50 hover:text-sky-700 transition-colors">
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
            <p className="text-sm text-slate-500">No classes found matching your search.</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
