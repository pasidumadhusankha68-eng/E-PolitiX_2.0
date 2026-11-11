import { useCallback, useEffect, useState } from 'react'
import { api } from '../utils/api'
import { validateEmail, validateMobile } from '../utils/validation'

const GOLD_BTN =
  'bg-[#b8860b] text-white text-sm font-medium hover:bg-[#9a7009] transition-colors'

const INPUT_CLASSES =
  'bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#b8860b] focus:border-transparent'

const INPUT_ERROR_CLASSES =
  'bg-white text-slate-900 placeholder:text-slate-400 border border-red-500 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#b8860b] focus:border-transparent'

const READONLY_INPUT_CLASSES =
  'bg-slate-100 text-slate-600 cursor-not-allowed border border-slate-300 rounded-lg px-3 py-2.5'

function formatRegisteredOn(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function ProfileDetailsForm({ profile, onSaved }) {
  const [form, setForm] = useState({
    email: profile.email || '',
    mobile_number: profile.mobile_number || '',
    address: profile.address || '',
    school: profile.school || '',
  })
  const [initial, setInitial] = useState({
    email: profile.email || '',
    mobile_number: profile.mobile_number || '',
    address: profile.address || '',
    school: profile.school || '',
  })
  const [errors, setErrors] = useState({
    email: '',
    mobile_number: '',
    address: '',
    school: '',
  })
  const [serverError, setServerError] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [touched, setTouched] = useState({})

  const validateField = useCallback((name, value) => {
    let error = ''
    switch (name) {
      case 'email':
        if (!value.trim()) error = 'Email is required'
        else if (!validateEmail(value)) error = 'Invalid email format'
        break
      case 'mobile_number':
        if (!value.trim()) error = 'Mobile number is required'
        else if (!validateMobile(value)) error = 'Mobile must start with 07 and be 10 digits'
        break
      case 'address':
        if (!value.trim()) error = 'Address is required'
        else if (value.trim().length < 3) error = 'Address is too short'
        break
      case 'school':
        if (!value.trim()) error = 'School is required'
        else if (value.trim().length < 2) error = 'School name is too short'
        break
    }
    setErrors((prev) => ({ ...prev, [name]: error }))
    return !error
  }, [])

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setServerError('')
    if (touched[name]) {
      validateField(name, value)
    }
  }, [touched, validateField])

  const handleBlur = useCallback((e) => {
    const { name } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    validateField(name, form[name])
  }, [form, validateField])

  const hasChanges = useCallback(() => {
    return (
      form.email !== initial.email ||
      form.mobile_number !== initial.mobile_number ||
      form.address !== initial.address ||
      form.school !== initial.school
    )
  }, [form, initial])

  const handleReset = useCallback(() => {
    setForm({ ...initial })
    setErrors({ email: '', mobile_number: '', address: '', school: '' })
    setTouched({})
    setServerError('')
    setSaved(false)
  }, [initial])

  const handleSave = useCallback(async (e) => {
    e.preventDefault()
    setServerError('')
    setSaved(false)

    let valid = true
    const allTouched = { email: true, mobile_number: true, address: true, school: true }
    setTouched(allTouched)
    if (!validateField('email', form.email)) valid = false
    if (!validateField('mobile_number', form.mobile_number)) valid = false
    if (!validateField('address', form.address)) valid = false
    if (!validateField('school', form.school)) valid = false
    if (!valid) return

    setSaving(true)
    try {
      await api('/student/profile', {
        method: 'PUT',
        body: {
          email: form.email.trim().toLowerCase(),
          mobile_number: form.mobile_number.trim(),
          address: form.address.trim(),
          school: form.school.trim(),
        },
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      onSaved()
    } catch (err) {
      setServerError(err.message || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }, [form, onSaved])

  useEffect(() => {
    if (profile) {
      setForm({
        email: profile.email || '',
        mobile_number: profile.mobile_number || '',
        address: profile.address || '',
        school: profile.school || '',
      })
      setInitial({
        email: profile.email || '',
        mobile_number: profile.mobile_number || '',
        address: profile.address || '',
        school: profile.school || '',
      })
      setErrors({ email: '', mobile_number: '', address: '', school: '' })
      setTouched({})
      setServerError('')
      setSaved(false)
    }
  }, [profile])

  return (
    <form onSubmit={handleSave} className="space-y-5" noValidate>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Email Address
        </label>
        <input
          type="email"
          name="email"
          placeholder="your@email.com"
          value={form.email}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full ${errors.email ? INPUT_ERROR_CLASSES : INPUT_CLASSES}`}
        />
        {touched.email && errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Mobile Number
        </label>
        <input
          type="tel"
          name="mobile_number"
          placeholder="07xxxxxxxx"
          value={form.mobile_number}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full ${errors.mobile_number ? INPUT_ERROR_CLASSES : INPUT_CLASSES}`}
        />
        {touched.mobile_number && errors.mobile_number && (
          <p className="mt-1 text-sm text-red-500">{errors.mobile_number}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Address
        </label>
        <input
          type="text"
          name="address"
          placeholder="Enter your home address"
          value={form.address}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full ${errors.address ? INPUT_ERROR_CLASSES : INPUT_CLASSES}`}
        />
        {touched.address && errors.address && (
          <p className="mt-1 text-sm text-red-500">{errors.address}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          School
        </label>
        <input
          type="text"
          name="school"
          placeholder="Your school name"
          value={form.school}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full ${errors.school ? INPUT_ERROR_CLASSES : INPUT_CLASSES}`}
        />
        {touched.school && errors.school && (
          <p className="mt-1 text-sm text-red-500">{errors.school}</p>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Name with initials
            </label>
            <input
              type="text"
              readOnly
              defaultValue={profile.name_with_initials || '—'}
              className={READONLY_INPUT_CLASSES}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              NIC
            </label>
            <input
              type="text"
              readOnly
              defaultValue={profile.nic || '—'}
              className={READONLY_INPUT_CLASSES}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Gender
            </label>
            <input
              type="text"
              readOnly
              defaultValue={profile.gender || '—'}
              className={READONLY_INPUT_CLASSES}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Registered on
            </label>
            <input
              type="text"
              readOnly
              defaultValue={formatRegisteredOn(profile.created_at)}
              className={READONLY_INPUT_CLASSES}
            />
          </div>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          Grey fields can't be changed here. To change them, contact your institute.
        </p>
      </div>

      {serverError && (
        <p className="text-sm text-red-600 whitespace-pre-line" role="alert">
          {serverError}
        </p>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={handleReset}
          disabled={saving}
          className="px-5 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 disabled:opacity-60 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!hasChanges() || saving}
          className={`px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-60 transition-colors ${
            (hasChanges() && !saving)
              ? `${GOLD_BTN}`
              : 'border border-slate-200 bg-white text-slate-400'
          }`}
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      {saved && (
        <p className="mt-3 text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">
          Details saved
        </p>
      )}
    </form>
  )
}
