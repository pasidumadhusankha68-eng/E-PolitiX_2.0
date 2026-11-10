import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../../utils/api'
import StudentFormModal from '../../components/admin/StudentFormModal'
import StatusConfirmModal from '../../components/admin/StatusConfirmModal'

export default function AdminStudentView() {
  const { id } = useParams()
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmError, setConfirmError] = useState(null)

  const reloadStudent = () => {
    let cancelled = false
    setLoading(true)
    setError(null)
    api(`/admin/users/students/${id}`)
      .then((data) => {
        if (!cancelled) setStudent(data)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.status === 404 ? 'Student not found' : err.message || 'Failed to load student')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }

  useEffect(() => {
    return reloadStudent()
  }, [id])

  const handleModalSuccess = () => {
    setShowModal(false)
    reloadStudent()
  }

  const handleConfirmStatus = async (newIsActive) => {
    setConfirmError(null)
    try {
      await api(`/admin/users/students/${id}/status`, {
        method: 'PATCH',
        body: { is_active: newIsActive },
      })
      setStudent((prev) => (prev ? { ...prev, is_active: newIsActive } : prev))
      setConfirmOpen(false)
    } catch (err) {
      setConfirmError(err.message || 'Failed to update status')
    }
  }

  if (loading) return <div className="p-8 text-center text-slate-500 text-sm">Loading...</div>
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>
  if (!student) return null

  const isActive = student.is_active
  const paymentPaid = student.payment_status === 'paid'

  return (
    <>
      <section className="w-full bg-white/95 h-screen flex">
        <main className="flex-1 overflow-y-auto min-h-0 bg-slate-50 p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-[#c2410c] mb-6"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Users
            </Link>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mb-6 text-center">
              <div className="flex flex-col items-center gap-2 mb-4">
                <h1 className="text-2xl font-bold text-slate-900">{student.full_name}</h1>
                <p className="text-sm text-slate-500">Student code: {student.student_code}</p>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      isActive
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {isActive ? 'Active' : 'Disabled'}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      paymentPaid
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {paymentPaid ? 'Paid' : 'Unpaid'}
                  </span>
                </div>
              </div>
              <div className="flex justify-center gap-3">
                <button className="btn-gold-sm flex items-center gap-2" onClick={() => setShowModal(true)}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit
                </button>
                <button
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-white font-medium text-sm transition-colors ${
                    isActive ? 'bg-red-500 hover:bg-red-700' : 'btn-gold-sm'
                  }`}
                  onClick={() => {
                    setConfirmError(null)
                    setConfirmOpen(true)
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isActive ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    )}
                  </svg>
                  {isActive ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mb-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-500 uppercase">Email</label>
                  <p className="text-sm text-slate-900">{student.email || '—'}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-500 uppercase">Institute</label>
                  <p className="text-sm text-slate-900">{student.institute_name || '—'}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-500 uppercase">Exam year</label>
                  <p className="text-sm text-slate-900">{student.exam_year || '—'}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-500 uppercase">Mobile</label>
                  <p className="text-sm text-slate-900">{student.mobile_number || '—'}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-500 uppercase">NIC</label>
                  <p className="text-sm text-slate-900">{student.nic || '—'}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-500 uppercase">School</label>
                  <p className="text-sm text-slate-900">{student.school || '—'}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-500 uppercase">Gender</label>
                  <p className="text-sm text-slate-900">{student.gender || '—'}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-500 uppercase">Address</label>
                  <p className="text-sm text-slate-900">{student.address || '—'}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-500 uppercase">Registered date</label>
                  <p className="text-sm text-slate-900">{student.created_at ? new Date(student.created_at).toLocaleDateString() : '—'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Exam results</h2>
              {Array.isArray(student.results) && student.results.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Test</th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">MCQ</th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Essay</th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Final</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {student.results.map((r) => (
                        <tr key={r.exam_number} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-slate-900">{r.exam_name}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{r.mcq_marks ?? '—'}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{r.essay_marks ?? '—'}</td>
                          <td className="px-6 py-4 text-sm text-slate-900 font-medium">{r.final_marks ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500">No results yet</div>
              )}
            </div>
          </div>
        </main>
      </section>
      <StudentFormModal
        open={showModal}
        onClose={handleModalSuccess}
        mode="edit"
        studentId={Number(id)}
      />
      <StatusConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        studentName={student.full_name}
        studentCode={student.student_code}
        isActive={student.is_active}
        error={confirmError}
        onConfirm={handleConfirmStatus}
      />
    </>
  )
}
