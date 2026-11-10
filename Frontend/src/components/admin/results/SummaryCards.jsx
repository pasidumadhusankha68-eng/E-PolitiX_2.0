import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../../utils/api'

const ICON_BG = 'bg-[#c2410c]/10'

export default function SummaryCards({ filters }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchSummary = useCallback(async () => {
    if (!filters.examYear) {
      setData(null)
      setLoading(false)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({ exam_year: String(filters.examYear) })
    if (filters.view === 'single' && filters.examNumber) {
      params.set('exam_number', String(filters.examNumber))
    }
    if (filters.instituteId) {
      params.set('institute_id', String(filters.instituteId))
    }
    try {
      const res = await api(`/admin/results/summary?${params.toString()}`)
      setData(res)
    } catch (err) {
      setError(err.message || 'Failed to load summary')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [filters.examYear, filters.examNumber, filters.instituteId, filters.view])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  const fmt = (v) => (v == null ? '-' : String(v))
  const fmtMark = (v) => (v == null ? '-' : Number(v).toFixed(1))
  const signed = (v) => (v == null ? null : (v > 0 ? '+' : '') + Number(v).toFixed(1))

  const studentsMarked = loading ? '-' : data ? data.students_marked : '-'
  const studentsTotal = loading ? '-' : data ? data.students_total : '-'
  const missing = loading ? 0 : data ? data.students_total - data.students_marked : 0

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Students marked */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm relative">
        <div className="absolute top-6 right-6">
          <div className={`${ICON_BG} p-2 rounded-xl`}>
            <svg className="w-5 h-5 text-[#c2410c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Students marked</p>
        <p className="text-3xl font-bold text-slate-900">{fmt(studentsMarked)}</p>
        <p className="text-sm text-slate-500">{`/ ${fmt(studentsTotal)}`}</p>
        {missing > 0 && data && !loading && (
          <Link
            to="/admin/exams"
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {missing} marks missing · Enter marks
          </Link>
        )}
      </div>

      {/* Class average */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm relative">
        <div className="absolute top-6 right-6">
          <div className={`${ICON_BG} p-2 rounded-xl`}>
            <svg className="w-5 h-5 text-[#c2410c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Class average</p>
        <p className="text-3xl font-bold text-slate-900">
          {loading ? '-' : data ? fmtMark(data.class_average) : '-'}
        </p>
        {data &&
          !loading &&
          filters.view === 'single' &&
          data.average_vs_previous != null && (
            <span
              className={`mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                data.average_vs_previous > 0
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={data.average_vs_previous > 0 ? 'M5 15l7-7 7 7' : 'M5 9l7 7 7-7'}
                />
              </svg>
              {signed(data.average_vs_previous)}
            </span>
          )}
      </div>

      {/* Highest mark */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm relative">
        <div className="absolute top-6 right-6">
          <div className={`${ICON_BG} p-2 rounded-xl`}>
            <svg className="w-5 h-5 text-[#c2410c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12l7-7 7 7" />
            </svg>
          </div>
        </div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Highest mark</p>
        <p className="text-3xl font-bold text-slate-900">
          {loading ? '-' : data ? fmtMark(data.highest?.mark) : '-'}
        </p>
        <p className="text-sm text-slate-500 mt-1">
          {loading ? '-' : data && data.highest ? data.highest.student_code : '-'}
        </p>
      </div>

      {/* Lowest mark */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm relative">
        <div className="absolute top-6 right-6">
          <div className={`${ICON_BG} p-2 rounded-xl`}>
            <svg className="w-5 h-5 text-[#c2410c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 12l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Lowest mark</p>
        <p className="text-3xl font-bold text-slate-900">
          {loading ? '-' : data ? fmtMark(data.lowest?.mark) : '-'}
        </p>
        <p className="text-sm text-slate-500 mt-1">
          {loading ? '-' : data && data.lowest ? data.lowest.student_code : '-'}
        </p>
      </div>

      {error && (
        <div className="lg:col-span-4 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
