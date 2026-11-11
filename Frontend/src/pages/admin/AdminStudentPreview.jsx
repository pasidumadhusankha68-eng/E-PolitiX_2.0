import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../../utils/api'

export default function AdminStudentPreview() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPreview = useCallback(() => {
    setLoading(true)
    setError(null)
    api(`/admin/users/students/${id}/preview`)
      .then((res) => {
        setData(res)
      })
      .catch((err) => {
        setError(err.message || 'Failed to load preview')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id])

  useEffect(() => {
    fetchPreview()
  }, [fetchPreview])

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <main className="ml-72 p-8 bg-slate-50 min-h-screen">
          <div className="p-8 text-center text-slate-500 text-sm">Loading…</div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <main className="ml-72 p-8 bg-slate-50 min-h-screen">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center justify-between gap-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </main>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const student = data.student
  const marks = data.marks || []

  return (
    <div className="min-h-screen bg-white">
      <main className="ml-72 p-8 bg-slate-50 min-h-screen">
        <div className="mb-6">
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm mb-6">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-center justify-between gap-4">
              <p className="text-sm text-amber-800">
                Viewing as {student.name} ({student.student_code}) - read-only
              </p>
              <Link
                to={`/admin/users/students/${id}`}
                className="text-sm text-amber-800 hover:underline font-medium"
              >
                Back to profile
              </Link>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
            Student Preview
          </h1>
          <p className="text-slate-500 text-sm mb-6">
            Read-only view of the student's dashboard
          </p>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-slate-900">
                    {student.name}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  Student code: {student.student_code}
                </p>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4 mt-4 md:mt-0">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-500 uppercase">
                    Institute
                  </label>
                  <p className="text-sm text-slate-900">
                    {student.institute_name || '—'}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-500 uppercase">
                    Exam year
                  </label>
                  <p className="text-sm text-slate-900">
                    {student.exam_year || '—'}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-500 uppercase">
                    Status
                  </label>
                  <p className={`text-sm font-medium ${
                    student.is_active ? 'text-emerald-700' : 'text-slate-600'
                  }`}>
                    {student.is_active ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Marks per test
            </h2>
            {marks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                        Test
                      </th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right">
                        MCQ
                      </th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right">
                        Essay
                      </th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right">
                        Final
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {marks.map((r) => (
                      <tr
                        key={r.exam_number}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-slate-900">
                          {r.exam_name || `Exam ${r.exam_number}`}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 text-right">
                          {r.mcq_marks == null ? '—' : r.mcq_marks.toFixed(1)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 text-right">
                          {r.essay_marks == null ? '—' : r.essay_marks.toFixed(1)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900 text-right">
                          {r.final_marks == null ? '—' : r.final_marks.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">
                No marks yet
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
