import { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import {
  validateEmail,
  validateMobile,
  validateNIC,
  validatePassword,
} from '../../utils/validation'

export default function StudentFormModal({ open, onClose, mode = 'add', studentId = null }) {
  const [form, setForm] = useState({
    full_name: '',
    name_with_initials: '',
    email: '',
    password: '',
    institute_id: '',
    exam_year: '',
    mobile: '',
    nic: '',
    school: '',
    gender: '',
    address: '',
  })
  const [institutes, setInstitutes] = useState([])
  const [years, setYears] = useState([])
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return

    api('/admin/users/filters')
      .then((data) => {
        setInstitutes(Array.isArray(data?.institutes) ? data.institutes : [])
        setYears(Array.isArray(data?.exam_years) ? data.exam_years : [])
      })
      .catch(() => {})

    if (mode === 'edit' && studentId) {
      setLoading(true)
      api(`/admin/users/students/${studentId}`)
        .then((data) => {
          setForm({
            full_name: data.full_name || '',
            name_with_initials: data.name_with_initials || '',
            email: data.email || '',
            password: '',
            institute_id: data.institute_id ? data.institute_id.toString() : '',
            exam_year: data.exam_year ? data.exam_year.toString() : '',
            mobile: data.mobile_number || '',
            nic: data.nic || '',
            school: data.school || '',
            gender: data.gender || '',
            address: data.address || '',
          })
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [open, mode, studentId])

  const validate = () => {
    const e = {}
    if (!form.full_name.trim()) e.full_name = 'Full name is required'
    if (!form.name_with_initials.trim()) e.name_with_initials = 'Name with initials is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!validateEmail(form.email)) e.email = 'Enter a valid email'
    if (mode === 'add') {
      if (!form.password.trim()) e.password = 'Temporary password is required'
      else if (!validatePassword(form.password))
        e.password = 'Password must be 8-20 chars with uppercase, lowercase, number and symbol'
    } else if (form.password.trim() && !validatePassword(form.password)) {
      e.password = 'Password must be 8-20 chars with uppercase, lowercase, number and symbol'
    }
    if (!form.institute_id) e.institute_id = 'Institute is required'
    if (!form.exam_year) e.exam_year = 'Exam year is required'
    if (!form.mobile.trim()) e.mobile = 'Mobile is required'
    else if (!validateMobile(form.mobile)) e.mobile = 'Enter a valid mobile number'
    if (!form.nic.trim()) e.nic = 'NIC is required'
    else if (!validateNIC(form.nic)) e.nic = 'Enter a valid NIC'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setServerError(null)
    if (!validate()) return
    setSaving(true)
    try {
      const body = {
        full_name: form.full_name.trim(),
        name_with_initials: form.name_with_initials.trim(),
        email: form.email.toLowerCase().trim(),
        institute_id: Number(form.institute_id),
        exam_year: Number(form.exam_year),
        mobile: form.mobile.trim(),
        nic: form.nic.trim().toUpperCase(),
        school: form.school.trim() || null,
        gender: form.gender || null,
        address: form.address.trim() || null,
      }
      if (mode === 'add') {
        body.password = form.password
        const data = await api('/admin/users/students', {
          method: 'POST',
          body,
        })
        onClose(true, data.student_code)
      } else {
        if (form.password.trim()) {
          body.new_password = form.password
        }
        await api(`/admin/users/students/${studentId}`, {
          method: 'PUT',
          body,
        })
        onClose(true)
      }
    } catch (err) {
      setServerError(err.message || 'Failed to save student')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    onClose(false)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleCancel}
      />
      <div
        className="relative w-full max-w-7xl p-4 sm:p-6 max-h-[100vh] flex flex-col"
      >
        <div
          className="bg-white rounded-xl border border-slate-200 shadow-lg p-6 sm:p-8 max-h-full overflow-y-auto scrollbar-hide flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              {mode === 'add' ? 'Add Student' : 'Edit Student'}
            </h2>
            <button
              onClick={handleCancel}
              className="text-slate-400 hover:text-slate-600"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {serverError && (
            <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSave} className="flex flex-col gap-4">
            {mode === 'edit' && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">Student ID</label>
                <input
                  type="text"
                  value={String(studentId || '')}
                  readOnly
                  className="px-3 py-2 rounded-lg border text-slate-500 bg-slate-100 focus:ring-0 outline-none transition-colors border-slate-200"
                />
              </div>
            )}
            <div className="grid grid-cols-3 gap-4 sm:gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">Full name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className={`px-3 py-2 rounded-lg border text-slate-900 bg-slate-50 focus:ring-2 focus:ring-[#c2410c] focus:border-transparent outline-none transition-colors ${
                    errors.full_name ? 'border-red-500' : 'border-slate-200'
                  }`}
                />
                {errors.full_name && (
                  <span className="text-xs text-red-600">{errors.full_name}</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">Name with initials <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.name_with_initials}
                  onChange={(e) => setForm({ ...form, name_with_initials: e.target.value })}
                  className={`px-3 py-2 rounded-lg border text-slate-900 bg-slate-50 focus:ring-2 focus:ring-[#c2410c] focus:border-transparent outline-none transition-colors ${
                    errors.name_with_initials ? 'border-red-500' : 'border-slate-200'
                  }`}
                />
                {errors.name_with_initials && (
                  <span className="text-xs text-red-600">{errors.name_with_initials}</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`px-3 py-2 rounded-lg border text-slate-900 bg-slate-50 focus:ring-2 focus:ring-[#c2410c] focus:border-transparent outline-none transition-colors ${
                    errors.email ? 'border-red-500' : 'border-slate-200'
                  }`}
                />
                {errors.email && (
                  <span className="text-xs text-red-600">{errors.email}</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">
                  {mode === 'add'
                    ? 'Temporary password'
                    : 'New password (leave empty to keep the current one)'}
                  {mode === 'add' && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`px-3 py-2 rounded-lg border text-slate-900 bg-slate-50 focus:ring-2 focus:ring-[#c2410c] focus:border-transparent outline-none transition-colors ${
                    errors.password ? 'border-red-500' : 'border-slate-200'
                  }`}
                />
                {errors.password && (
                  <span className="text-xs text-red-600">{errors.password}</span>
                )}
                {mode === 'edit' && (
                  <span className="text-xs text-slate-500">Leave empty to keep the current password</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">Institute <span className="text-red-500">*</span></label>
                <select
                  value={form.institute_id}
                  onChange={(e) => setForm({ ...form, institute_id: e.target.value })}
                  className={`px-3 py-2 rounded-lg border text-slate-900 bg-slate-50 focus:ring-2 focus:ring-[#c2410c] focus:border-transparent outline-none transition-colors ${
                    errors.institute_id ? 'border-red-500' : 'border-slate-200'
                  }`}
                >
                  <option value="">Select institute</option>
                  {institutes.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name}
                    </option>
                  ))}
                </select>
                {errors.institute_id && (
                  <span className="text-xs text-red-600">{errors.institute_id}</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">Exam year <span className="text-red-500">*</span></label>
                <select
                  value={form.exam_year}
                  onChange={(e) => setForm({ ...form, exam_year: e.target.value })}
                  className={`px-3 py-2 rounded-lg border text-slate-900 bg-slate-50 focus:ring-2 focus:ring-[#c2410c] focus:border-transparent outline-none transition-colors ${
                    errors.exam_year ? 'border-red-500' : 'border-slate-200'
                  }`}
                >
                  <option value="">Select year</option>
                  {years.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
                {errors.exam_year && (
                  <span className="text-xs text-red-600">{errors.exam_year}</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">Mobile <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  className={`px-3 py-2 rounded-lg border text-slate-900 bg-slate-50 focus:ring-2 focus:ring-[#c2410c] focus:border-transparent outline-none transition-colors ${
                    errors.mobile ? 'border-red-500' : 'border-slate-200'
                  }`}
                />
                {errors.mobile && (
                  <span className="text-xs text-red-600">{errors.mobile}</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">NIC <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.nic}
                  onChange={(e) => setForm({ ...form, nic: e.target.value })}
                  className={`px-3 py-2 rounded-lg border text-slate-900 bg-slate-50 focus:ring-2 focus:ring-[#c2410c] focus:border-transparent outline-none transition-colors ${
                    errors.nic ? 'border-red-500' : 'border-slate-200'
                  }`}
                />
                {errors.nic && (
                  <span className="text-xs text-red-600">{errors.nic}</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">School</label>
                <input
                  type="text"
                  value={form.school}
                  onChange={(e) => setForm({ ...form, school: e.target.value })}
                  className="px-3 py-2 rounded-lg border text-slate-900 bg-slate-50 focus:ring-2 focus:ring-[#c2410c] focus:border-transparent outline-none transition-colors border-slate-200"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="px-3 py-2 rounded-lg border text-slate-900 bg-slate-50 focus:ring-2 focus:ring-[#c2410c] focus:border-transparent outline-none transition-colors border-slate-200"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">Address</label>
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={2}
                className="px-3 py-2 rounded-lg border text-slate-900 bg-slate-50 focus:ring-2 focus:ring-[#c2410c] focus:border-transparent outline-none transition-colors border-slate-200"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-gold-sm flex items-center gap-2"
                disabled={saving || loading}
              >
                {saving ? 'Saving...' : mode === 'add' ? 'Save student' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
