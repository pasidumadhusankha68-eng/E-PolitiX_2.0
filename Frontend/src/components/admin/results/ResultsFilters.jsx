import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../../../utils/api'

export default function ResultsFilters({ filters, setFilters }) {
  const [institutes, setInstitutes] = useState([])
  const [years, setYears] = useState([])
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [localSearch, setLocalSearch] = useState(filters.search || '')
  const searchTimer = useRef(null)

  const formatTestDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
  }

  const loadFilters = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api('/admin/results/filters')
      setInstitutes(res.institutes || [])
      setYears(res.exam_years || [])
    } catch (err) {
      setError(err.message || 'Failed to load filters')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadTests = useCallback(async (year) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api(`/admin/results/tests?exam_year=${year}`)
      setTests(res || [])
    } catch (err) {
      setError(err.message || 'Failed to load tests')
      setTests([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFilters()
  }, [loadFilters])

  useEffect(() => {
    if (years.length > 0 && !filters.examYear) {
      const newestYear = years.reduce((a, b) => Math.max(a, b))
      setFilters((prev) => ({ ...prev, examYear: String(newestYear) }))
    }
  }, [years, filters.examYear, setFilters])

  useEffect(() => {
    if (filters.examYear) {
      setFilters((prev) => ({ ...prev, examNumber: '' }))
      loadTests(filters.examYear)
    } else {
      setTests([])
    }
  }, [filters.examYear, loadTests, setFilters])

  useEffect(() => {
    if (tests.length > 0 && !filters.examNumber) {
      setFilters((prev) => ({ ...prev, examNumber: String(tests[0].exam_number) }))
    }
  }, [tests, filters.examNumber, setFilters])

  useEffect(() => {
    setLocalSearch(filters.search || '')
  }, [filters.search])

  const handleSearchChange = (e) => {
    const value = e.target.value
    setLocalSearch(value)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: value }))
    }, 400)
  }

  useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current)
    }
  }, [])

  const selectClasses =
    'w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

  const pillClasses = (active) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
      active
        ? 'bg-gold border-gold text-white hover:bg-gold/90 transition-colors'
        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
    }`

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Institute
          </label>
          <select
            value={filters.instituteId || ''}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, instituteId: e.target.value || '' }))
            }
            className={selectClasses}
            disabled={loading}
          >
            <option value="">All institutes</option>
            {institutes.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Exam year
          </label>
          <select
            value={filters.examYear || ''}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, examYear: e.target.value || '' }))
            }
            className={selectClasses}
            disabled={loading}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            View
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                setFilters((prev) => ({ ...prev, view: 'single' }))
              }
              className={pillClasses(filters.view === 'single')}
            >
              Single test
            </button>
            <button
              type="button"
              onClick={() =>
                setFilters((prev) => ({ ...prev, view: 'average' }))
              }
              className={pillClasses(filters.view === 'average')}
            >
              Average of all tests
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Test
        </label>
        <select
          value={filters.examNumber || ''}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, examNumber: e.target.value || '' }))
          }
          className={selectClasses}
          disabled={filters.view === 'average' || loading || tests.length === 0}
        >
          <option value="">Select test</option>
          {tests.map((t) => (
            <option key={t.exam_number} value={t.exam_number}>
              {`Test ${t.exam_number} · ${formatTestDate(t.test_date)}`}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end">
        <div className="flex flex-col gap-1 w-full max-w-sm">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Search
          </label>
          <input
            type="text"
            placeholder="Name or student ID"
            value={localSearch}
            onChange={handleSearchChange}
            className="w-full pl-4 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-colors"
          />
        </div>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  )
}
