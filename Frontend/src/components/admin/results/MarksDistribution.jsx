import { useCallback, useEffect, useState } from 'react'
import { api } from '../../../utils/api'

const BUCKET_ORDER = ['80-100', '60-79', '40-59', '20-39', '0-19']

export default function MarksDistribution({ filters, testLabel }) {
  const [buckets, setBuckets] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [institutes, setInstitutes] = useState([])
  const [instituteName, setInstituteName] = useState(null)

  useEffect(() => {
    if (!filters.instituteId) {
      setInstituteName(null)
      return
    }
    const known = institutes.find((i) => String(i.id) === String(filters.instituteId))
    if (known) {
      setInstituteName(known.name)
      return
    }
    api('/institutes')
      .then((list) => {
        setInstitutes(list || [])
        const inst = (list || []).find((i) => String(i.id) === String(filters.instituteId))
        setInstituteName(inst ? inst.name : String(filters.instituteId))
      })
      .catch(() => setInstituteName(String(filters.instituteId)))
  }, [filters.instituteId, institutes])

  const fetchDistribution = useCallback(async () => {
    if (!filters.examYear) {
      setBuckets([])
      setTotal(0)
      setLoading(false)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({
      exam_year: String(filters.examYear),
      view: filters.view,
    })
    if (filters.view === 'single' && filters.examNumber) {
      params.set('exam_number', String(filters.examNumber))
    }
    if (filters.instituteId) {
      params.set('institute_id', String(filters.instituteId))
    }
    try {
      const res = await api(`/admin/results/distribution?${params.toString()}`)
      setBuckets(res.buckets || [])
      setTotal(res.total || 0)
    } catch (err) {
      setError(err.message || 'Failed to load distribution')
      setBuckets([])
    } finally {
      setLoading(false)
    }
  }, [filters.examYear, filters.view, filters.examNumber, filters.instituteId])

  useEffect(() => {
    fetchDistribution()
  }, [fetchDistribution])

  const maxCount = Math.max(1, ...buckets.map((b) => b.count))

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-2">Marks distribution</h2>
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <div className="w-3 h-3 rounded-full bg-slate-200 animate-pulse" />
          <span>Loading distribution…</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-2">Marks distribution</h2>
        <p className="text-sm text-red-700">{error}</p>
      </div>
    )
  }

  if (total === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 shadow-sm text-center">
        <h2 className="text-lg font-bold text-slate-900 mb-2">Marks distribution</h2>
        <p className="text-sm text-slate-500">No data yet</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Marks distribution</h2>
        <p className="text-sm text-slate-500">
          {testLabel || 'All tests'} · final mark,{' '}
          {instituteName ? instituteName : 'all institutes'}
        </p>
      </div>
      <div className="px-6 py-4">
        {BUCKET_ORDER.map((label) => {
          const bucket = buckets.find((b) => b.label === label)
          const count = bucket ? bucket.count : 0
          const width = total === 0 ? 0 : Math.round((count / maxCount) * 100)
          return (
            <div key={label} className="flex items-center gap-3 py-2.5">
              <span className="w-16 text-xs font-medium text-slate-700">{label}</span>
              <div className="flex-1 h-2 bg-orange-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-[#c2410c] rounded-full transition-all duration-500"
                  style={{ width: `${width}%` }}
                />
              </div>
              <span className="w-10 text-sm font-bold text-slate-900 text-right">{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
