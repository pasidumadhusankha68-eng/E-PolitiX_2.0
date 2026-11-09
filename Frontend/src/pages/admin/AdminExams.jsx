import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../../utils/api'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MAX_MARKS = 100

const formatDate = (iso) => {
  if (!iso) return '-'
  const day = iso.slice(8, 10).replace(/^0/, '')
  const month = MONTHS[parseInt(iso.slice(5, 7), 10) - 1]
  return `${day} ${month}`
}

const pillClass = (entered, total) => {
  if (entered === 0) return 'bg-slate-100 text-slate-600 border-slate-200'
  if (entered >= total) return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  return 'bg-amber-100 text-amber-700 border-amber-200'
}

export default function AdminExams() {
  const [classes, setClasses] = useState([])
  const [tests, setTests] = useState([])
  const [selectedClassId, setSelectedClassId] = useState(null)
  const [selectedTestId, setSelectedTestId] = useState(null)

  const [loading, setLoading] = useState({ classes: false, tests: false, sheet: false, saving: false })
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)
  const [serverError, setServerError] = useState(null)

  // Create test modal
  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState({ class_id: '', exam_number: '', exam_name: '', test_date: '' })
  const [createError, setCreateError] = useState(null)

  // Import CSV modal
  const [importOpen, setImportOpen] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [importPreview, setImportPreview] = useState(null)
  const [importError, setImportError] = useState(null)
  const [importLoading, setImportLoading] = useState(false)

  // Marks sheet state
  const [sheet, setSheet] = useState(null)
  const [edits, setEdits] = useState({}) // student_id -> {mcq_marks, essay_marks}
  const [showMissing, setShowMissing] = useState(false)

  const loadClasses = useCallback(async () => {
    setLoading((s) => ({ ...s, classes: true }))
    setError(null)
    try {
      const data = await api('/admin/exams/classes')
      setClasses(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e.message || 'Failed to load classes')
    } finally {
      setLoading((s) => ({ ...s, classes: false }))
    }
  }, [])

  const loadTests = useCallback(async (classId) => {
    setLoading((s) => ({ ...s, tests: true }))
    setError(null)
    try {
      const data = await api(`/admin/exams/tests?class_id=${classId}`)
      const list = Array.isArray(data) ? data : []
      setTests(list)
      if (list.length) setSelectedTestId(list[0].id)
      else setSelectedTestId(null)
    } catch (e) {
      setError(e.message || 'Failed to load tests')
      setTests([])
      setSelectedTestId(null)
    } finally {
      setLoading((s) => ({ ...s, tests: false }))
    }
  }, [])

  const loadSheet = useCallback(async (examId) => {
    setLoading((s) => ({ ...s, sheet: true }))
    setServerError(null)
    setEdits({})
    try {
      const data = await api(`/admin/exams/tests/${examId}/marks`)
      setSheet(data)
    } catch (e) {
      setServerError(e.message || 'Failed to load marks sheet')
      setSheet(null)
    } finally {
      setLoading((s) => ({ ...s, sheet: false }))
    }
  }, [])

  useEffect(() => {
    loadClasses()
  }, [loadClasses])

  useEffect(() => {
    if (classes.length && selectedClassId === null) {
      setSelectedClassId(classes[0].id)
    }
  }, [classes, selectedClassId])

  useEffect(() => {
    if (selectedClassId) {
      loadTests(selectedClassId)
    }
  }, [selectedClassId, loadTests])

  useEffect(() => {
    if (selectedTestId) {
      loadSheet(selectedTestId)
    }
  }, [selectedTestId, loadSheet])

  const selectedClass = classes.find((c) => c.id === selectedClassId)
  const selectedTest = tests.find((t) => t.id === selectedTestId)

  const filteredRows = useMemo(() => {
    if (!sheet?.rows) return []
    if (!showMissing) return sheet.rows
    return sheet.rows.filter((r) => r.mcq_marks == null || r.essay_marks == null)
  }, [sheet?.rows, showMissing])

  const hasChanges = useMemo(() => Object.keys(edits).length > 0, [edits])

  const totalInputs = useMemo(() => {
    let invalid = false
    Object.values(edits).forEach((e) => {
      for (const v of [e.mcq_marks, e.essay_marks]) {
        if (v !== null && v !== undefined && v !== '') {
          const n = Number(v)
          if (!Number.isFinite(n) || n < 0 || n > MAX_MARKS) invalid = true
        }
      }
    })
    return invalid
  }, [edits])

  const computeFinal = (mcq, essay) => {
    if (mcq == null || mcq === '' || essay == null || essay === '') return null
    const m = Number(mcq)
    const e = Number(essay)
    if (!Number.isFinite(m) || !Number.isFinite(e)) return null
    return m + e
  }

  const handleChange = (studentId, field, value) => {
    const raw = value === '' ? null : value
    let num = null
    if (raw !== null) {
      num = Number(raw)
      if (!Number.isFinite(num)) num = null
    }
    setEdits((prev) => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || {}), [field]: num },
    }))
    setServerError(null)
  }

  const handleSave = async () => {
    if (!selectedTestId) return
    const changed = Object.entries(edits).map(([studentId, vals]) => ({
      student_id: Number(studentId),
      mcq_marks: vals.mcq_marks ?? null,
      essay_marks: vals.essay_marks ?? null,
    }))
    setLoading((s) => ({ ...s, saving: true }))
    setServerError(null)
    try {
      await api(`/admin/exams/tests/${selectedTestId}/marks`, {
        method: 'PUT',
        body: { marks: changed },
      })
      setEdits({})
      setToast('Marks saved')
      await loadSheet(selectedTestId)
      await loadTests(selectedClassId)
      setTimeout(() => setToast(null), 3000)
    } catch (e) {
      setServerError(e.message || 'Failed to save marks')
    } finally {
      setLoading((s) => ({ ...s, saving: false }))
    }
  }

  const clearToast = () => setToast(null)
  const clearServerError = () => setServerError(null)

  const confirmLeave = (onConfirm) => {
    if (!hasChanges) {
      onConfirm()
      return
    }
    if (window.confirm('You have unsaved changes. Leave anyway?')) {
      onConfirm()
    }
  }

  const handleSelectTest = (id) => {
    if (id === selectedTestId) return
    confirmLeave(() => setSelectedTestId(id))
  }

  const handleSelectClass = (e) => {
    const id = e.target.value ? Number(e.target.value) : null
    if (id === selectedClassId) return
    confirmLeave(() => setSelectedClassId(id))
  }

  // ---- Create test modal ----
  const openCreateModal = () => {
    setCreateForm({ class_id: String(selectedClassId || ''), exam_number: '', exam_name: '', test_date: '' })
    setCreateError(null)
    setCreateOpen(true)
  }

  const handleCreateChange = (e) => {
    const { name, value } = e.target
    setCreateForm((prev) => ({ ...prev, [name]: value }))
    setCreateError(null)
  }

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    setCreateError(null)
    const body = {
      class_id: Number(createForm.class_id) || null,
      exam_number: createForm.exam_number ? Number(createForm.exam_number) : null,
      exam_name: createForm.exam_name || null,
      test_date: createForm.test_date || null,
    }
    try {
      const data = await api('/admin/exams/tests', {
        method: 'POST',
        body,
      })
      setCreateOpen(false)
      setCreateForm({ class_id: '', exam_number: '', exam_name: '', test_date: '' })
      await loadTests(selectedClassId)
      setSelectedTestId(data.id)
      setToast('Test created')
      setTimeout(() => setToast(null), 3000)
    } catch (e) {
      setCreateError(e.message || 'Failed to create test')
    }
  }

  // ---- Import CSV modal ----
  const openImportModal = () => {
    setImportFile(null)
    setImportPreview(null)
    setImportError(null)
    setImportOpen(true)
  }

  const handleImportFile = (e) => {
    setImportFile(e.target.files[0])
    setImportPreview(null)
    setImportError(null)
  }

  const handleImportSubmit = async (e) => {
    e.preventDefault()
    if (!selectedTestId || !importFile) return
    setImportLoading(true)
    setImportError(null)
    setImportPreview(null)
    const formData = new FormData()
    formData.append('file', importFile)
    try {
      const data = await api(`/admin/exams/tests/${selectedTestId}/marks/import`, {
        method: 'POST',
        body: formData,
      })
      setImportPreview(data)
    } catch (e) {
      setImportError(e.message || 'Import failed')
    } finally {
      setImportLoading(false)
    }
  }

  const applyImportToSheet = () => {
    if (!importPreview) return
    setEdits((prev) => {
      const next = { ...prev }
      importPreview.matched.forEach((m) => {
        next[m.student_id] = {
          mcq_marks: m.mcq_marks ?? null,
          essay_marks: m.essay_marks ?? null,
        }
      })
      return next
    })
    setImportOpen(false)
    setImportFile(null)
    setImportPreview(null)
  }

  const closeImport = () => {
    setImportOpen(false)
    setImportFile(null)
    setImportPreview(null)
    setImportError(null)
  }

  return (
    <div className="space-y-6 scroll-sky">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Exams</h1>
          <p className="text-slate-600 mt-1">Create tests and enter marks</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create test
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left card: Tests (~35%) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Tests</h2>
              <select
                value={selectedClassId == null ? '' : String(selectedClassId)}
                onChange={handleSelectClass}
                disabled={loading.classes}
                className="w-full max-w-xs py-2 pl-3 pr-9 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none cursor-not-allowed"
              >
                <option value="" disabled>
                  {loading.classes ? 'Loading classes...' : 'Select a class'}
                </option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.exam_year})
                  </option>
                ))}
              </select>
            </div>

            {loading.tests && (
              <div className="h-32 flex items-center justify-center rounded-xl border border-dashed border-slate-200 text-slate-400 text-sm">
                Loading tests…
              </div>
            )}

            {!loading.tests && tests.length === 0 && selectedClassId && (
              <div className="h-32 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 text-slate-500 text-sm">
                <p>No tests for this class yet</p>
              </div>
            )}

            {!loading.tests &&
              tests.map((t) => {
                const isSelected = selectedTestId === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTest(t.id)}
                    className={`w-full flex flex-col gap-3 p-4 rounded-xl border ${
                      isSelected
                        ? 'border-2 border-orange-500 bg-orange-50'
                        : 'border-slate-200 hover:border-orange-200 hover:bg-orange-25/50 transition-colors'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <h3 className={`text-sm font-bold ${isSelected ? 'text-orange-800' : 'text-slate-900'}`}>
                        Test {t.exam_number}
                      </h3>
                      <span className="text-xs font-medium text-slate-500">{formatDate(t.test_date)}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-medium border ${pillClass(
                        t.marks_entered,
                        t.students_total
                      )}`}
                    >
                      {t.marks_entered} / {t.students_total}
                    </span>
                  </button>
                )
              })}
          </div>
        </div>

        {/* Right card: Marks sheet (~65%) */}
        <div className="lg:col-span-8">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 flex flex-col h-[600px]">
            {selectedTest && sheet ? (
              <>
                <div className="flex items-start justify-between mb-4 gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {selectedTest.exam_name} · {selectedTest.class_name}
                    </h2>
                    <p className="text-sm text-slate-600">
                      {sheet.marks_entered} of {sheet.students_total} marks entered
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={openImportModal}
                      className="px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading.sheet}
                    >
                      Import CSV
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={!hasChanges || totalInputs || loading.saving}
                      className="px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading.saving ? 'Saving…' : 'Save marks'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-3">
                  <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500"
                      style={{
                        width: sheet.students_total
                          ? Math.round((sheet.marks_entered / sheet.students_total) * 100)
                          : 0,
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    {sheet.marks_entered} / {sheet.students_total}
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={showMissing}
                      onChange={() => setShowMissing((v) => !v)}
                      className="rounded text-slate-600 focus:ring-orange-500"
                    />
                    Show only missing
                  </label>
                </div>

                {serverError && (
                  <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                    {serverError}
                  </div>
                )}

                <div className="flex-1 overflow-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Student ID
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                          MCQ marks
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                          Essay marks
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                          Final
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRows.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                            {showMissing ? 'No missing marks' : 'No students in this class'}
                          </td>
                        </tr>
                      )}
                      {filteredRows.map((r) => {
                        const studentEdits = edits[r.student_id] || {}
                        const mcq =
                          studentEdits.mcq_marks ?? r.mcq_marks ?? null
                        const essay =
                          studentEdits.essay_marks ?? r.essay_marks ?? null
                        const final = computeFinal(mcq, essay)
                        const missing = mcq == null || essay == null
                        const mcqInvalid =
                          mcq != null && (mcq < 0 || mcq > MAX_MARKS)
                        const essayInvalid =
                          essay != null && (essay < 0 || essay > MAX_MARKS)
                        return (
                          <tr
                            key={r.student_id}
                            className={`transition-colors ${
                              missing ? 'bg-yellow-50' : ''
                            }`}
                          >
                            <td className="px-4 py-3 text-sm text-slate-600">
                              {r.student_code}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-slate-900">
                              {r.name}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <input
                                type="number"
                                step="0.5"
                                min={0}
                                max={MAX_MARKS}
                                value={mcq == null ? '' : String(mcq)}
                                onChange={(e) =>
                                  handleChange(r.student_id, 'mcq_marks', e.target.value)
                                }
                                placeholder="-"
                                disabled={loading.saving}
                                className={`w-20 py-1.5 pl-2 pr-8 rounded-md border text-sm text-right text-slate-900 focus:ring-2 focus:border-transparent outline-none ${
                                  mcqInvalid
                                    ? 'border-red-500 focus:ring-red-500 bg-red-50'
                                    : 'border-slate-200 focus:ring-orange-500'
                                } ${missing ? 'bg-yellow-100' : 'bg-white'}`}
                              />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <input
                                type="number"
                                step="0.5"
                                min={0}
                                max={MAX_MARKS}
                                value={essay == null ? '' : String(essay)}
                                onChange={(e) =>
                                  handleChange(r.student_id, 'essay_marks', e.target.value)
                                }
                                placeholder="-"
                                disabled={loading.saving}
                                className={`w-20 py-1.5 pl-2 pr-8 rounded-md border text-sm text-right text-slate-900 focus:ring-2 focus:border-transparent outline-none ${
                                  essayInvalid
                                    ? 'border-red-500 focus:ring-red-500 bg-red-50'
                                    : 'border-slate-200 focus:ring-orange-500'
                                } ${missing ? 'bg-yellow-100' : 'bg-white'}`}
                              />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className={`text-sm font-mono text-slate-600 ${missing ? 'text-slate-400' : 'font-medium text-slate-900'}`}>
                                {final == null ? '-' : final}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {toast && (
                  <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <span className="text-emerald-600">✓</span>
                    {toast}
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-sm">
                <p>Select a test</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-4 right-4 z-50 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="text-emerald-600">✓</span>
          {toast}
          <button
            onClick={clearToast}
            className="ml-2 text-emerald-600 hover:text-emerald-800"
          >
            ✕
          </button>
        </div>
      )}

      {/* Create test modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setCreateOpen(false) }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Create Test</h2>
            </div>
            <div className="p-6 space-y-4">
              {createError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  {createError}
                </div>
              )}
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                  <select
                    name="class_id"
                    value={createForm.class_id}
                    onChange={handleCreateChange}
                    required
                    className="w-full py-2 pl-3 pr-9 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  >
                    <option value="" disabled>Select a class</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.exam_year})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Test number</label>
                  <input
                    name="exam_number"
                    type="number"
                    value={createForm.exam_number}
                    onChange={handleCreateChange}
                    placeholder="Auto"
                    className="w-full py-2 pl-3 pr-9 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Test name</label>
                  <input
                    name="exam_name"
                    type="text"
                    value={createForm.exam_name}
                    onChange={handleCreateChange}
                    placeholder="Auto"
                    className="w-full py-2 pl-3 pr-9 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Test date</label>
                  <input
                    name="test_date"
                    type="date"
                    value={createForm.test_date}
                    onChange={handleCreateChange}
                    required
                    className="w-full py-2 pl-3 pr-9 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCreateOpen(false)}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading.saving}
                    className="px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 disabled:opacity-50 transition-colors"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Import CSV modal */}
      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) closeImport() }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Import CSV</h2>
            </div>
            <div className="p-6 space-y-4">
              <form onSubmit={handleImportSubmit} className="space-y-4">
                {importError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                    {importError}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">CSV file</label>
                  <p className="text-xs text-slate-500 mb-2">Columns: student_code, mcq_marks, essay_marks</p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleImportFile}
                    className="w-full py-2 pl-3 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeImport}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={importLoading || !importFile}
                    className="px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 disabled:opacity-50 transition-colors"
                  >
                    {importLoading ? 'Importing…' : 'Preview'}
                  </button>
                </div>
              </form>

              {importPreview && (
                <div className="border-t border-slate-100 pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-900">
                      {importPreview.matched.length} matched, {importPreview.errors.length} error(s)
                    </span>
                    <button
                      onClick={applyImportToSheet}
                      disabled={importPreview.matched.length === 0 || loading.saving}
                      className="px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 disabled:opacity-50 transition-colors"
                    >
                      Apply to sheet
                    </button>
                  </div>
                  {importPreview.errors.length > 0 && (
                    <div className="max-h-40 overflow-y-auto rounded-lg border border-red-100 bg-red-50 p-3 text-sm">
                      <p className="mb-2 text-xs font-semibold text-red-800 uppercase">Errors:</p>
                      <ul className="space-y-1">
                        {importPreview.errors.map((err, i) => (
                          <li key={i} className="text-red-700">
                            Line {err.line}: {err.student_code} — {err.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
