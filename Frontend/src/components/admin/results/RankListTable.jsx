import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../../../utils/api'

const RANK_BADGE = {
  1: { color: 'text-[#c2410c]', bg: 'bg-[#c2410c]/10', border: 'border-[#c2410c]/20' },
  2: { color: 'text-slate-500', bg: 'bg-slate-100', border: 'border-slate-200' },
  3: { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100' },
}

export default function RankListTable({ filters, testLabel }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  const fetchRankList = useCallback(async () => {
    if (!filters.examYear) {
      setData(null)
      setLoading(false)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({
      exam_year: String(filters.examYear),
      view: filters.view,
      page: String(page),
      page_size: String(PAGE_SIZE),
    })
    if (filters.view === 'single' && filters.examNumber) {
      params.set('exam_number', String(filters.examNumber))
    }
    if (filters.instituteId) {
      params.set('institute_id', String(filters.instituteId))
    }
    if (filters.search && filters.search.trim()) {
      params.set('search', filters.search.trim())
    }
    try {
      const res = await api(`/admin/results/rank-list?${params.toString()}`)
      setData(res)
    } catch (err) {
      setError(err.message || 'Failed to load rank list')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [filters.examYear, filters.view, filters.examNumber, filters.instituteId, filters.search, page])

  // Reset page whenever any filter changes
  useEffect(() => {
    setPage(1)
  }, [filters.examYear, filters.view, filters.examNumber, filters.instituteId, filters.search])

  useEffect(() => {
    fetchRankList()
  }, [fetchRankList])

  const rows = loading ? [] : data ? data.items : []
  const total = loading ? 0 : data ? data.total : 0
  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const end = total === 0 ? 0 : Math.min(page * PAGE_SIZE, total)

  const mark = (v) => (v == null ? '-' : Number(v).toFixed(1))

  const rankCell = (rank) => {
    const style = RANK_BADGE[rank]
    if (style) {
      return (
        <span
          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${style.color} ${style.bg} ${style.border}`}
        >
          {rank}
        </span>
      )
    }
    return <span className="text-xs font-bold text-slate-900">{rank}</span>
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4">{testLabel || 'Rank list'}</h2>
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <div className="w-3 h-3 rounded-full bg-slate-200 animate-pulse" />
          <span>Loading rank list…</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-2">{testLabel || 'Rank list'}</h2>
        <p className="text-sm text-red-700">{error}</p>
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 shadow-sm text-center">
        <h2 className="text-lg font-bold text-slate-900 mb-2">{testLabel || 'Rank list'}</h2>
        <p className="text-sm text-slate-500">No results yet</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">{testLabel || 'Rank list'}</h2>
        <p className="text-xs text-slate-500">Sorted by final mark</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Overall
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Institute
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Student ID
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Institute name
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                MCQ
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                Essay
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                Final
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr
                key={r.student_id}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="px-6 py-4">{rankCell(r.overall_rank)}</td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900">
                  {r.institute_rank}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                  {r.student_code}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{r.name}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{r.institute_name}</td>
                <td className="px-6 py-4 text-sm text-right text-slate-600">
                  {mark(r.mcq_marks)}
                </td>
                <td className="px-6 py-4 text-sm text-right text-slate-600">
                  {mark(r.essay_marks)}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-right text-slate-900">
                  {mark(r.final_marks)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-slate-600">
          Showing {start}-{end} of {total}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page === 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={end >= total || loading}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
