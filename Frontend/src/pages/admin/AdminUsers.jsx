import { motion } from 'framer-motion'

const users = [
  { id: 1, name: 'Kamal Perera', email: 'kamal@example.com', role: 'Student', status: 'Active', avatar: 'KP', class: 'Grade 10' },
  { id: 2, name: 'Nimali Silva', email: 'nimali@example.com', role: 'Student', status: 'Active', avatar: 'NS', class: 'Grade 11' },
  { id: 3, name: 'Sunil Rao', email: 'sunil@example.com', role: 'Student', status: 'Inactive', avatar: 'SR', class: 'Grade 9' },
  { id: 4, name: 'Ayesha Devi', email: 'ayesha@example.com', role: 'Student', status: 'Active', avatar: 'AD', class: 'Grade 10' },
  { id: 5, name: 'Rohan Fernando', email: 'rohan@example.com', role: 'Student', status: 'Pending', avatar: 'RF', class: 'Grade 11' },
  { id: 6, name: 'Lakshmi Raj', email: 'lakshmi@example.com', role: 'Student', status: 'Active', avatar: 'LR', class: 'Grade 9' },
]

const statusColors = {
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Inactive: 'bg-slate-100 text-slate-600 border-slate-200',
  Pending: 'bg-amber-50 text-amber-700 border-amber-100',
}

export default function AdminUsers() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || u.status.toLowerCase() === statusFilter
    return matchesSearch && matchesStatus
  })

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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Users</h1>
          <p className="text-slate-600 mt-1">Manage student accounts and access.</p>
        </div>
        <button className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-slate-900/10 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add user
        </button>
      </div>

      {/* Toolbar: search + filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'Active', 'Inactive', 'Pending'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === status
                  ? 'bg-sky-600 text-white shadow-sm shadow-sky-200/30'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Users table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Avatar</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Class</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((user) => (
              <motion.tr
                key={user.id}
                whileHover={{ backgroundColor: 'slope-50' }}
                className="transition-colors hover:bg-slate-50/50"
              >
                <td className="px-6 py-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-700 shadow-sm">
                    {user.avatar}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.class}</p>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{user.class}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{user.role}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${statusColors[user.status]}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="text-sky-600 hover:text-sky-700 hover:bg-sky-50 px-2.5 py-1.5 rounded-lg transition-colors text-sm" aria-label="Edit">
                      Edit
                    </button>
                    <button className="text-slate-400 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors text-sm" aria-label="Delete">
                      Delete
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 20h4v-6H7z" />
                  </svg>
                  <p className="text-sm text-slate-500">No users found matching your filters.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination placeholder */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{filtered.length} of {users.length} users</p>
        <div className="flex gap-2">
          {[1, 2, 3].map((page) => (
            <button key={page} className="w-9 h-9 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
              {page}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
