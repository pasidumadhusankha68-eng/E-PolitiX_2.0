import { motion } from 'framer-motion'

const results = [
  { id: 1, student: 'Kamal Perera', exam: 'Midterm Mathematics', score: '85 / 100', grade: 'A', status: 'Published' },
  { id: 2, student: 'Nimali Silva', exam: 'Final Science', score: '78 / 100', grade: 'B+', status: 'Published' },
  { id: 3, student: 'Sunil Rao', exam: 'English Unit Test', score: '92 / 100', grade: 'A+', status: 'Published' },
  { id: 4, student: 'Ayesha Devi', exam: 'History Final', score: '64 / 100', grade: 'C', status: 'Draft' },
  { id: 5, student: 'Rohan Fernando', exam: 'Physics Midterm', score: '71 / 100', grade: 'B', status: 'Pending' },
]

const statusColors = {
  Published: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Draft: 'bg-amber-50 text-amber-700 border-amber-100',
  Pending: 'bg-sky-50 text-sky-700 border-sky-100',
}

const gradeColors = {
  'A+': 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  A: 'bg-emerald-100 text-emerald-700 border-emerald-100',
  'B+': 'bg-amber-100 text-amber-700 border-amber-100',
  B: 'bg-amber-100 text-amber-700 border-amber-100',
  C: 'bg-slate-100 text-slate-600 border-slate-200',
}

export default function AdminResults() {
  const [search, setSearch] = useState('')

  const filtered = results.filter((r) =>
    r.student.toLowerCase().includes(search.toLowerCase()) || r.exam.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Results</h1>
          <p className="text-slate-600 mt-1">Publish and manage student examination results.</p>
        </div>
        <button className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-slate-900/10 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Upload results
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-md">
        <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search results by student or exam..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
        />
      </div>

      {/* Results table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Exam</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Score</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Grade</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((result) => (
              <motion.tr key={result.id} className="transition-colors hover:bg-slate-50/50">
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-slate-900">{result.student}</p>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{result.exam}</td>
                <td className="px-6 py-4 text-sm text-slate-600 font-mono">{result.score}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${gradeColors[result.grade]}`}>
                    {result.grade}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${statusColors[result.status]}`}>
                    {result.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="text-sky-600 hover:text-sky-700 hover:bg-sky-50 px-2.5 py-1.5 rounded-lg transition-colors text-sm">
                      Edit
                    </button>
                    <button className="text-slate-400 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors text-sm">
                      Delete
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-sm text-slate-500">No results found matching your search.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
