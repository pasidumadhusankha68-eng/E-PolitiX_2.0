import { Link } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../../utils/api'
import AdminSideBar from '../../components/admin/AdminSideBar'
import StudentFormModal from '../../components/admin/StudentFormModal'
import StatusConfirmModal from '../../components/admin/StatusConfirmModal'

const ORANGE = '#c2410c'

export default function AdminUsers() {
  const [activeTab, setActiveTab] = useState('students')
  const [search, setSearch] = useState('')
  const [instituteId, setInstituteId] = useState('')
  const [examYear, setExamYear] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [students, setStudents] = useState([])
  const [admins, setAdmins] = useState([])
  const [total, setTotal] = useState(0)
  const [institutes, setInstitutes] = useState([])
  const [years, setYears] = useState([])
  const [counts, setCounts] = useState({ students: 0, admins: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [editStudentId, setEditStudentId] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmStudentId, setConfirmStudentId] = useState(null)
  const [confirmStudentName, setConfirmStudentName] = useState('')
  const [confirmStudentCode, setConfirmStudentCode] = useState('')
  const [confirmIsActive, setConfirmIsActive] = useState(true)
  const [confirmError, setConfirmError] = useState(null)

  const searchTimer = useRef(null)

  const fetchData = useCallback(async () => {
    setError(null)
    try {
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
      })
      if (search.trim()) params.set('search', search.trim())
      if (instituteId) params.set('institute_id', instituteId)
      if (examYear) params.set('exam_year', examYear)
      if (status !== 'all') params.set('status', status)

      const [studentsRes, countsRes, filtersRes] = await Promise.all([
        api(`/admin/users/students?${params.toString()}`),
        api('/admin/users/counts'),
        api('/admin/users/filters'),
      ])

      setStudents(studentsRes.items || [])
      setTotal(studentsRes.total || (studentsRes.items?.length || 0))
      setCounts(countsRes)
      setInstitutes(filtersRes.institutes || [])
      setYears(filtersRes.exam_years || [])
    } catch (err) {
      console.error('fetchData error:', err)
      setError(err.message || 'Failed to load students')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, instituteId, examYear, status])

  const fetchAdmins = useCallback(async () => {
    try {
      const data = await api('/admin/users/admins')
      setAdmins(Array.isArray(data) ? data : [])
    } catch {
      setAdmins([])
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (activeTab === 'admins') fetchAdmins()
  }, [activeTab, fetchAdmins])

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setPage(1)
      fetchData()
    }, 400)
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current)
    }
  }, [search, fetchData])

  const handleFilterChange = useCallback(() => {
    setPage(1)
    fetchData()
  }, [fetchData])

  const handleModalSuccess = useCallback((created, studentCode) => {
    setShowModal(false)
    setModalMode('add')
    setEditStudentId(null)
    if (created && studentCode) {
      setSuccessMessage(`Student created: ${studentCode}`)
    } else if (created) {
      setSuccessMessage('Student updated successfully')
    }
    fetchData()
    if (activeTab === 'admins') fetchAdmins()
  }, [fetchData, fetchAdmins, activeTab])

  const handleConfirmStatus = async (newIsActive) => {
    setConfirmError(null)
    try {
      await api(`/admin/users/students/${confirmStudentId}/status`, {
        method: 'PATCH',
        body: { is_active: newIsActive },
      })
      setStudents((prev) =>
        prev.map((s) =>
          s.id === confirmStudentId ? { ...s, is_active: newIsActive } : s
        )
      )
      setCounts((c) => ({
        students: newIsActive ? c.students + 1 : c.students - 1,
        admins: c.admins,
      }))
      setConfirmOpen(false)
    } catch (err) {
      setConfirmError(err.message || 'Failed to update status')
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const startIndex = total === 0 ? 0 : (page - 1) * pageSize + 1
  const endIndex = Math.min(page * pageSize, total)

  const items = activeTab === 'students' ? students : admins

  return (
    <>
      <section className="w-full bg-white/95 h-screen flex">
        <AdminSideBar />
        <main className="flex-1 overflow-y-auto min-h-0 bg-slate-50">
          <div className="space-y-6 p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Users</h1>
              <p className="text-slate-600 mt-1">Manage student and admin accounts</p>
            </div>
            <button
              className="bg-gold text-white px-5 py-2.5 rounded-xl font-medium hover-bg-gold transition-colors flex items-center gap-2"
              onClick={() => {
                setModalMode('add')
                setEditStudentId(null)
                setShowModal(true)
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add student
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl text-sm">
              {successMessage}
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div className="relative">
                <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Name, student ID or mobile"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-[#c2410c] focus:border-transparent outline-none transition-colors"
                />
              </div>
              <select
                value={instituteId}
                onChange={(e) => { setInstituteId(e.target.value); handleFilterChange() }}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-[#c2410c] focus:border-transparent outline-none transition-colors"
              >
                <option value="">Institute</option>
                {institutes.map((inst) => (
                  <option key={inst.id} value={inst.id}>{inst.name}</option>
                ))}
              </select>
              <select
                value={examYear}
                onChange={(e) => { setExamYear(e.target.value); handleFilterChange() }}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-[#c2410c] focus:border-transparent outline-none transition-colors"
              >
                <option value="">Exam year</option>
                {years.map((yr) => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); handleFilterChange() }}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-[#c2410c] focus:border-transparent outline-none transition-colors"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('students')}
            className={`px-6 py-2 rounded-lg font-medium border transition-colors ${
              activeTab === 'students'
                ? 'bg-gold text-white border-gold'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Students {counts.students}
          </button>
          <button
            onClick={() => setActiveTab('admins')}
            className={`px-6 py-2 rounded-lg font-medium border transition-colors ${
              activeTab === 'admins'
                ? 'bg-gold text-white border-gold'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Admins {counts.admins}
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {loading && (
            <div className="p-8 text-center text-slate-500 text-sm">Loading...</div>
          )}
          {!loading && items.length === 0 && !error && (
            <div className="p-12 text-center">
              <p className="text-sm text-slate-500">No students found</p>
            </div>
          )}
          {!loading && items.length > 0 && (
            <table className="w-full text-left border-collapse divide-y divide-slate-100">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {activeTab === 'students' ? (
                    <>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Student ID</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Institute</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Exam year</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Mobile</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((row) => {
                  if (activeTab === 'students') {
                    const isActive = row.is_active
                    return (
                      <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-600">{row.student_code}</td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{row.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{row.institute_name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{row.exam_year}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{row.mobile || '—'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <Link
                              to={`/admin/users/students/${row.id}`}
                              className="text-slate-600 hover:text-[#c2410c] text-sm"
                            >
                              View
                            </Link>
                            <span
                              onClick={(e) => {
                                e.stopPropagation()
                                setModalMode('edit')
                                setEditStudentId(row.id)
                                setShowModal(true)
                              }}
                              className="flex items-center gap-1 text-slate-600 hover:text-[#c2410c] text-sm cursor-pointer"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                              Edit
                            </span>
                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                setConfirmStudentId(row.id)
                                setConfirmStudentName(row.name)
                                setConfirmStudentCode(row.student_code)
                                setConfirmIsActive(isActive)
                                setConfirmError(null)
                                setConfirmOpen(true)
                              }}
                              className={`text-sm ${isActive ? 'text-red-600 hover:text-red-700' : 'text-emerald-600 hover:text-emerald-700'}`}
                            >
                              {isActive ? 'Disable' : 'Enable'}
                            </a>
                          </div>
                        </td>
                      </tr>
                    )
                  }
                  return (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{row.full_name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{row.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <Link
                            to={`/admin/users/students/${row.id}`}
                            className="text-slate-600 hover:text-[#c2410c] text-sm"
                          >
                            View
                          </Link>
                          <span
                            onClick={(e) => {
                              e.stopPropagation()
                              setModalMode('edit')
                              setEditStudentId(row.id)
                              setShowModal(true)
                            }}
                            className="flex items-center gap-1 text-slate-600 hover:text-[#c2410c] text-sm cursor-pointer"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Edit
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {!loading && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Showing {startIndex}-{endIndex} of {total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
        </div>
      </main>
    </section>
    <StudentFormModal
      open={showModal}
      onClose={handleModalSuccess}
      mode={modalMode}
      studentId={editStudentId}
    />
    <StatusConfirmModal
      open={confirmOpen}
      onClose={() => setConfirmOpen(false)}
      studentName={confirmStudentName}
      studentCode={confirmStudentCode}
      isActive={confirmIsActive}
      error={confirmError}
      onConfirm={handleConfirmStatus}
    />
    </>
  )
}
