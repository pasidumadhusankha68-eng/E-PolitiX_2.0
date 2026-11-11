import { useCallback, useMemo, useState } from 'react'
import { api } from '../utils/api'
import { validatePassword } from '../utils/validation'

const EYE_SHOW = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
)

const EYE_HIDE = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const MIN_PASSWORD_LEN = 8
const MAX_PASSWORD_LEN = 20

const INPUT_CLASSES =
  'bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#b8860b] focus:border-transparent pr-12'

const INPUT_ERROR_CLASSES =
  'bg-white text-slate-900 placeholder:text-slate-400 border border-red-500 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#b8860b] focus:border-transparent pr-12'

export default function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [currentError, setCurrentError] = useState('')
  const [newError, setNewError] = useState('')
  const [confirmError, setConfirmError] = useState('')
  const [serverError, setServerError] = useState('')
  const [saving, setSaving] = useState(false)
  const [changed, setChanged] = useState(false)

  const passwordRules = useMemo(() => ({
    length: newPassword.length >= MIN_PASSWORD_LEN && newPassword.length <= MAX_PASSWORD_LEN,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /\d/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
  }), [newPassword])

  const newPasswordValid = useMemo(() => validatePassword(newPassword), [newPassword])
  const passwordsMatch = confirmPassword !== '' && newPassword === confirmPassword
  const differentFromCurrent = newPassword !== '' && newPassword !== currentPassword

  const isValid = useMemo(() => {
    return currentPassword !== '' && newPasswordValid && passwordsMatch && differentFromCurrent
  }, [currentPassword, newPasswordValid, passwordsMatch, differentFromCurrent])

  const clearChanged = useCallback(() => {
    setChanged(false)
  }, [])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    setServerError('')

    if (!currentPassword) {
      setCurrentError('Current password is required')
      return
    }
    if (!newPasswordValid) {
      setNewError('Password must be 8-20 chars with uppercase, lowercase, number, special char')
      return
    }
    if (!passwordsMatch) {
      setConfirmError('Passwords do not match')
      return
    }
    if (!differentFromCurrent) {
      setNewError('New password must be different from current password')
      return
    }

    setSaving(true)
    try {
      await api('/student/profile/password', {
        method: 'POST',
        body: { current_password: currentPassword, new_password: newPassword },
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowCurrent(false)
      setShowNew(false)
      setShowConfirm(false)
      setCurrentError('')
      setNewError('')
      setConfirmError('')
      setChanged(true)
      setTimeout(clearChanged, 3000)
    } catch (err) {
      setServerError(err.message || 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }, [currentPassword, newPassword, newPasswordValid, passwordsMatch, differentFromCurrent, clearChanged])

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">Security</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Current password
          </label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value)
                setCurrentError('')
              }}
              placeholder="Current password"
              className={`w-full ${currentError ? INPUT_ERROR_CLASSES : INPUT_CLASSES}`}
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={showCurrent ? 'Hide password' : 'Show password'}
            >
              {showCurrent ? EYE_SHOW : EYE_HIDE}
            </button>
          </div>
          {currentError && <p className="mt-1 text-sm text-red-500">{currentError}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            New password
          </label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value)
                setNewError('')
              }}
              placeholder="New password"
              className={`w-full ${newError ? INPUT_ERROR_CLASSES : INPUT_CLASSES}`}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={showNew ? 'Hide password' : 'Show password'}
            >
              {showNew ? EYE_SHOW : EYE_HIDE}
            </button>
          </div>
          {newError && <p className="mt-1 text-sm text-red-500">{newError}</p>}

          <div className="mt-2 text-xs space-y-1">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  passwordRules.length ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              />
              <span className="text-slate-600">8–20 characters</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  passwordRules.uppercase ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              />
              <span className="text-slate-600">Uppercase letter</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  passwordRules.lowercase ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              />
              <span className="text-slate-600">Lowercase letter</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  passwordRules.number ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              />
              <span className="text-slate-600">Number</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  passwordRules.special ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              />
              <span className="text-slate-600">Special character</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Confirm new password
          </label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                setConfirmError('')
              }}
              placeholder="Confirm new password"
              className={`w-full ${confirmError ? INPUT_ERROR_CLASSES : INPUT_CLASSES}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? EYE_SHOW : EYE_HIDE}
            </button>
          </div>
          {confirmError && <p className="mt-1 text-sm text-red-500">{confirmError}</p>}
        </div>
      </div>

      {serverError && (
        <p className="text-sm text-red-600 whitespace-pre-line" role="alert">
          {serverError}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!isValid || saving}
        className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
          isValid && !saving
            ? 'bg-[#b8860b] text-white hover:bg-[#9a7009]'
            : 'border border-slate-200 bg-white text-slate-400'
        }`}
      >
        {saving ? 'Changing…' : 'Change password'}
      </button>

      {changed && (
        <p className="mt-3 text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">
          Password changed
        </p>
      )}
    </div>
  )
}
