import { useCallback, useEffect, useState } from 'react'
import AdminSideBar from '../../components/admin/AdminSideBar'
import { api } from '../../utils/api'

const ORANGE = '#c2410c'

const STATUS_STYLES = {
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  unpaid: 'bg-slate-100 text-slate-600 border-slate-200',
}

function formatMonthDay(iso) {
  const d = new Date(iso)
  const parts = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).formatToParts(d)
  const month = parts.find((p) => p.type === 'month').value
  const day = parts.find((p) => p.type === 'day').value
  const year = parts.find((p) => p.type === 'year').value
  return `${month} ${day}, ${year}`
}

export default function AdminPayments() {
  const [status, setStatus] = useState('all')
  const [instituteId, setInstituteId] = useState('')
  const [month, setMonth] = useState('')
  const [search, setSearch] = useState('')
  const [items, setItems] = useState([])
  const [institutes, setInstitutes] = useState([])
  const [months, setMonths] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
        status,
      })
      if (instituteId) params.set('institute_id', instituteId)
      if (month) params.set('month', month)
      if (search.trim()) params.set('search', search.trim())

      const [paymentsRes, filtersRes] = await Promise.all([
        api(`/admin/payments?${params.toString()}`),
        api('/admin/payments/filters'),
      ])

      setItems(paymentsRes.items || [])
      setTotal(paymentsRes.total || 0)
      setInstitutes(filtersRes.institutes || [])
      setMonths(filtersRes.months || [])
    } catch (err) {
      setError(err.message || 'Failed to load payments')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, status, instituteId, month, search])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const handleFilterChange = useCallback(() => {
    setPage(1)
    fetchPayments()
  }, [fetchPayments])

  const statusPillClasses = (s) => {
    return STATUS_STYLES[s] || STATUS_STYLES.unpaid
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const startIndex = total === 0 ? 0 : (page - 1) * pageSize + 1
  const endIndex = Math.min(page * pageSize, total)

  const pillClasses = (active) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
      active
        ? `bg-[#c2410c] border-[#c2410c] text-white`
        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
    }`

  if (loading) {
    return (
      <section className="w-full bg-white/95 h-screen flex">
        <AdminSideBar />
        <main className="flex-1 overflow-y-auto min-h-0 bg-slate-50 ">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="rounded-2xl border border-slate-200 bg-white p-12 shadow-sm text-center">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-[#c2410c] rounded-full animate-spin mx-auto" />
              <p className="text-sm text-slate-500 mt-2">Loading payments…</p>
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
        <main className="flex-1 overflow-y-auto min-h-0 bg-slate-50 ">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-2">Payments</h2>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </main>
      </section>
    )
  }

  return (
    <section className="w-full bg-white/95 h-screen flex">
      <AdminSideBar />
      <main className="flex-1 overflow-y-auto min-h-0 bg-slate-50 ">
        <div className="space-y-6 p-6 sm:p-8 lg:p-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Payments
              </h1>
              <p className="text-slate-600 mt-1">
                Manage and view student monthly payments
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => { setStatus(e.target.value); handleFilterChange() }}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-[#c2410c] focus:border-transparent outline-none transition-colors"
                >
                  <option value="all">All</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Institute
                </label>
                <select
                  value={instituteId}
                  onChange={(e) => { setInstituteId(e.target.value); handleFilterChange() }}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-[#c2410c] focus:border-transparent outline-none transition-colors"
                >
                  <option value="">All institutes</option>
                  {institutes.map((inst) => (
                    <option key={inst.id} value={inst.id}>{inst.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Month
                </label>
                <select
                  value={month}
                  onChange={(e) => { setMonth(e.target.value); handleFilterChange() }}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-[#c2410c] focus:border-transparent outline-none transition-colors"
                >
                  <option value="">All months</option>
                  {months.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Name, student ID or email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-[#c2410c] focus:border-transparent outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={handleFilterChange}
                  className="mt-2 w-full px-3 py-2 rounded-lg bg-[#c2410c] text-white text-sm font-medium hover:bg-orange-700 transition-colors"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Payments table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-900">Payment Records</h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={endIndex >= total || loading}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-sm text-slate-500">No payment records found</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse divide-y divide-slate-100">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student ID</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Institute</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Month</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-600 font-mono">{row.student_code}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{row.full_name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{row.email}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{row.institute_name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{formatMonthDay(row.month)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusPillClasses(row.status)}`}>
                          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{formatMonthDay(row.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing {startIndex}-{endIndex} of {total}
              </p>
            </div>
          </div>
        </div>
      </main>
    </section>
  )
}
