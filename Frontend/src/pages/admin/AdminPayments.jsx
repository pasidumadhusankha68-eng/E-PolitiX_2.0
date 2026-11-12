import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminSideBar from '../../components/admin/AdminSidebar'
import { api } from '../../utils/api'
import PaymentModal from '../../components/admin/PaymentModal'

const STATUS_PILL = {
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  unpaid: 'bg-red-50 text-red-700 border-red-200',
}

// "2026-11" for the current month in Sri Lanka time
function currentMonthColombo() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Colombo',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(new Date())
  const y = parts.find((p) => p.type === 'year').value
  const m = parts.find((p) => p.type === 'month').value
  return `${y}-${m}`
}

function shiftMonth(ym, delta) {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1 + delta, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

function monthName(ym) {
  const [y, m] = ym.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function formatPaidOn(iso) {
  if (!iso) return '-'
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

const inputClass =
  'w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-[#c2410c] focus:border-transparent outline-none transition-colors'

export default function AdminPayments() {
  const [month, setMonth] = useState(currentMonthColombo())
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [instituteId, setInstituteId] = useState('')
  const [examYear, setExamYear] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [summary, setSummary] = useState({ paid: 0, unpaid: 0 })
  const [institutes, setInstitutes] = useState([])
  const [years, setYears] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [modalStudent, setModalStudent] = useState(null)

  const isCurrentMonth = useMemo(() => month >= currentMonthColombo(), [month])

  // Debounce the search box (400 ms)
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 400)
    return () => clearTimeout(t)
  }, [search])

  // Dropdown lists load once
  useEffect(() => {
    api('/admin/payments/filters')
      .then((r) => {
        setInstitutes(r.institutes || [])
        setYears(r.exam_years || [])
      })
      .catch(() => {})
  }, [])

  const fetchPayments = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
        month,
        status,
      })
      if (debouncedSearch) params.set('search', debouncedSearch)
      if (instituteId) params.set('institute_id', instituteId)
      if (examYear) params.set('exam_year', examYear)

      const res = await api(`/admin/payments?${params.toString()}`)
      setItems(res.items || [])
      setTotal(res.total || 0)
      setSummary(res.summary || { paid: 0, unpaid: 0 })
    } catch (err) {
      setError(err.message || 'Failed to load payments')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [page, month, status, debouncedSearch, instituteId, examYear])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const openModal = (row) => {
    setModalStudent({
      id: row.student_id,
      code: row.student_code,
      name: row.name,
      institute: row.institute_name,
      status: row.status,
      referenceNo: row.reference_no || '',
      paidDate: row.paid_date || '',
      note: row.note || '',
    })
  }

  const closeModal = () => setModalStudent(null)

  const handleModalSaved = () => {
    setModalStudent(null)
    fetchPayments()
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const startIndex = total === 0 ? 0 : (page - 1) * pageSize + 1
  const endIndex = Math.min(page * pageSize, total)

  return (
    <section className="w-full bg-white h-screen flex">
      <AdminSideBar />
      <main
        className="flex-1 overflow-y-auto min-h-0 bg-white"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <div className="space-y-6 p-6 sm:p-8 lg:p-10 hide-scrollbar">
          {/* Header + month picker */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Payments
              </h1>
              <p className="text-slate-600 mt-1">
                Record who has paid the class fee for each month
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => {
                  setMonth((m) => shiftMonth(m, -1))
                  setPage(1)
                }}
                className="btn-gold-slide w-10 h-10"
              >
                &lt;
              </button>
              <span className="text-sm font-semibold text-slate-900 min-w-[130px] text-center">
                {monthName(month)}
              </span>
              <button
                type="button"
                aria-label="Next month"
                disabled={isCurrentMonth}
                onClick={() => {
                  setMonth((m) => shiftMonth(m, 1))
                  setPage(1)
                }}
                className="btn-gold-slide w-10 h-10"
              >
                &gt;
              </button>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-4 max-w-lg">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Paid
              </p>
              <p className="text-3xl font-bold text-emerald-700 mt-1">
                {summary.paid}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Unpaid
              </p>
              <p className="text-3xl font-bold text-red-700 mt-1">
                {summary.unpaid}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <input
                type="text"
                placeholder="Name, student ID or mobile"
                aria-label="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={inputClass}
              />
              <select
                aria-label="Institute"
                value={instituteId}
                onChange={(e) => {
                  setInstituteId(e.target.value)
                  setPage(1)
                }}
                className={inputClass}
              >
                <option value="">All institutes</option>
                {institutes.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name}
                  </option>
                ))}
              </select>
              <select
                aria-label="Exam year"
                value={examYear}
                onChange={(e) => {
                  setExamYear(e.target.value)
                  setPage(1)
                }}
                className={inputClass}
              >
                <option value="">All years</option>
                {years.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
              <select
                aria-label="Status"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value)
                  setPage(1)
                }}
                className={inputClass}
              >
                <option value="all">All</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
          </div>

          {/* Error banner (the page stays visible) */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center justify-between gap-4">
              <p className="text-sm text-red-700">{error}</p>
              <button
                type="button"
                onClick={fetchPayments}
                className="px-4 py-2 rounded-lg bg-[#c2410c] text-white text-sm font-medium hover:bg-orange-700 transition-colors"
              >
                Try again
              </button>
            </div>
          )}

          {/* Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                      Student ID
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                      Institute
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                      Reference <span className="normal-case font-normal text-slate-400">(optional)</span>
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                      Paid on
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right">
                      Edit
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">
                        Loading payments…
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">
                        No students found
                      </td>
                    </tr>
                  ) : (
                    items.map((row) => (
                      <tr key={row.student_id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                          {row.student_code}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-slate-900">
                            {row.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {row.mobile_number || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {row.institute_name}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                              STATUS_PILL[row.status] || STATUS_PILL.unpaid
                            }`}
                          >
                            {row.status === 'paid' ? 'Paid' : 'Unpaid'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {row.reference_no || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {row.status === 'paid' ? formatPaidOn(row.paid_date) : '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => openModal(row)}
                            className="flex items-center gap-1 text-slate-600 hover:text-[#c2410c] text-sm cursor-pointer"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing {startIndex}-{endIndex} of {total}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-full border border-slate-200 bg-white text-sm font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-4 py-2 rounded-full border border-slate-200 bg-white text-sm font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {modalStudent && (
            <PaymentModal
              key={modalStudent.id + month}
              studentId={modalStudent.id}
              studentCode={modalStudent.code}
              name={modalStudent.name}
              institute={modalStudent.institute}
              month={month}
              status={modalStudent.status}
              initialReference={modalStudent.referenceNo}
              initialPaidDate={modalStudent.paidDate}
              initialNote={modalStudent.note}
              onSave={handleModalSaved}
              onClose={closeModal}
            />
          )}
        </div>
      </main>
    </section>
  )
}
