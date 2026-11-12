import { useCallback, useEffect, useState } from 'react'
import { api, downloadFile } from '../../utils/api'
import AdminSideBar from '../../components/admin/AdminSidebar'
import ResultsFilters from '../../components/admin/results/ResultsFilters'
import SummaryCards from '../../components/admin/results/SummaryCards'
import RankListTable from '../../components/admin/results/RankListTable'
import MarksDistribution from '../../components/admin/results/MarksDistribution'

export default function AdminResults() {
  const [filters, setFilters] = useState({
    instituteId: '',
    examYear: '',
    examNumber: '',
    view: 'single',
    search: '',
  })
  const [tests, setTests] = useState([])
  const [testLabel, setTestLabel] = useState('')
  const [downloadState, setDownloadState] = useState({})
  const [downloadError, setDownloadError] = useState(null)

  const fetchTests = useCallback(async (year) => {
    if (!year) {
      setTests([])
      setTestLabel('')
      return
    }
    try {
      const res = await api(`/admin/results/tests?exam_year=${year}`)
      setTests(res || [])
    } catch {
      setTests([])
    }
  }, [])

  useEffect(() => {
    fetchTests(filters.examYear)
  }, [filters.examYear, fetchTests])

  useEffect(() => {
    if (filters.view === 'average') {
      setTestLabel('Average of all tests')
      return
    }
    if (!filters.examYear || !filters.examNumber) {
      setTestLabel('')
      return
    }
    const t = tests.find((x) => String(x.exam_number) === String(filters.examNumber))
    setTestLabel(t ? `Test ${t.exam_number}` : `Test ${filters.examNumber}`)
  }, [filters.view, filters.examYear, filters.examNumber, tests])

  const buildQuery = useCallback(() => {
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
    return params.toString()
  }, [filters.examYear, filters.view, filters.examNumber, filters.instituteId])

  const handleDownload = useCallback(
    async (kind) => {
      if (!filters.examYear) return
      setDownloadState((prev) => ({ ...prev, [kind]: 'preparing' }))
      setDownloadError(null)
      const ext = kind === 'csv' ? 'csv' : 'pdf'
      const base =
        filters.view === 'average'
          ? `rank-list-${filters.examYear}-average`
          : `rank-list-${filters.examYear}-test-${filters.examNumber || 'all'}`
      const filename = `${base}.${ext}`
      try {
        await downloadFile(`/admin/results/export.${ext}?${buildQuery()}`, filename)
      } catch (err) {
        setDownloadError(err.message || 'Download failed')
      } finally {
        setDownloadState((prev) => ({ ...prev, [kind]: 'idle' }))
      }
    },
    [filters.examYear, filters.view, filters.examNumber, filters.instituteId, buildQuery]
  )

  return (
    <section className="w-full bg-white/95 h-screen flex">
      <AdminSideBar />
      <main className="flex-1 overflow-y-auto min-h-0 bg-slate-50">
        <div className="space-y-6 p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Results</h1>
              <p className="text-slate-600 mt-1">
                Rank lists and marks for every test, by institute and overall
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* <button
                type="button"
                onClick={() => handleDownload('csv')}
                disabled={downloadState.csv === 'preparing'}
                className="border border-slate-200 bg-white text-slate-700 px-5 py-2.5 rounded-xl font-medium  flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Export CSV"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {downloadState.csv === 'preparing' ? 'Preparing…' : 'Export CSV'}
              </button> */}
              <button
                type="button"
                onClick={() => handleDownload('pdf')}
                disabled={downloadState.pdf === 'preparing'}
                className="bg-gold hover:bg-gold/90 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-slate-900/10 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Download rank list PDF"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {downloadState.pdf === 'preparing' ? 'Preparing…' : 'Download rank list (PDF)'}
              </button>
            </div>
          </div>
          {downloadError && (
            <p className="text-sm text-red-600 mt-1">{downloadError}</p>
          )}

          {/* Filters */}
          <ResultsFilters filters={filters} setFilters={setFilters} />

          {/* Summary cards */}
          <SummaryCards filters={filters} />

          {/* Rank list */}
          <RankListTable filters={filters} testLabel={testLabel} />

          {/* Marks distribution (below rank list) */}
          <MarksDistribution filters={filters} testLabel={testLabel} />
        </div>
      </main>
    </section>
  )
}
