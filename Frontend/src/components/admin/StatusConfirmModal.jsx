import { useState } from 'react'

export default function StatusConfirmModal({
  open,
  onClose,
  studentName,
  studentCode,
  isActive,
  error,
  onConfirm,
}) {
  const [saving, setSaving] = useState(false)

  const isDisable = isActive

  const handleConfirm = async () => {
    setSaving(true)
    try {
      await onConfirm(!isActive)
      onClose(false)
    } catch (err) {
      setSaving(false)
      throw err
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
      <div className="relative w-full max-w-md p-4 sm:p-6">
        <div
          className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 sm:p-8 flex flex-col gap-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              {isDisable ? 'Disable Student' : 'Enable Student'}
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

          <p className="text-slate-700">
            {isDisable
              ? `Disable this student? ${studentName} (${studentCode}) will not be able to log in.`
              : `Enable this student? They will be able to log in again.`}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

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
              type="button"
              onClick={handleConfirm}
              className={`px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 ${
                isDisable
                  ? 'bg-red-500 text-white hover:bg-red-700'
                  : 'bg-[#c2410c] text-white hover:bg-[#a3360a]'
              }`}
              disabled={saving}
            >
              {saving ? (isDisable ? 'Disabling...' : 'Enabling...') : isDisable ? 'Disable' : 'Enable'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
