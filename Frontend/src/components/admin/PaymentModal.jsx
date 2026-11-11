import { useCallback, useRef, useState } from 'react'
import { api } from '../../utils/api'

function monthLabel(yyyymm) {
  const [y, m] = yyyymm.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function PaymentModal({
  open,
  studentId,
  studentCode,
  name,
  institute,
  month,
  status,
  onSave,
  onClose,
}) {
  const [toggleStatus, setToggleStatus] = useState(
    status === 'unpaid' ? 'paid' : status
  )
  const [referenceNo, setReferenceNo] = useState('')
  const [paidDate, setPaidDate] = useState(todayISO())
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [force, setForce] = useState(false)
  const [conflict, setConflict] = useState(null)
  const [error, setError] = useState(null)

  const showPaid = toggleStatus === 'paid'

  const handleSave = useCallback(async () => {
    setError(null)
    setConflict(null)
    setSaving(true)
    try {
      await api(`/admin/payments/students/${studentId}`, {
        method: 'PUT',
        body: {
          month,
          status: toggleStatus,
          reference_no: referenceNo.trim() || null,
          paid_date: showPaid ? paidDate : null,
          note: note.trim() || null,
          force,
        },
      })
      onSave()
      onClose()
    } catch (err) {
      if (err.status === 409 && err.data) {
        const usedBy = err.data.used_by || {}
        setConflict({
          name: usedBy.name || 'another student',
          code: usedBy.student_code || '',
          month: usedBy.month || month,
        })
      } else {
        setError(err.message || 'Failed to save payment')
      }
    } finally {
      setSaving(false)
    }
  }, [
    studentId,
    month,
    toggleStatus,
    referenceNo,
    paidDate,
    note,
    force,
    showPaid,
    onSave,
    onClose,
  ])

  const handleSaveAnyway = useCallback(async () => {
    setForce(true)
    await handleSave()
  }, [handleSave])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
    >
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg mx-4 p-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900" id="payment-modal-title">
              Update payment
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="px-6 py-4 bg-slate-50">
            <div className="text-sm font-medium text-slate-900">{name}</div>
            <div className="text-sm text-slate-600 mt-0.5">
              {studentCode} &middot; {institute} &middot; {monthLabel(month)}
            </div>
          </div>

          <div className="px-6 py-4 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Status
              </label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setToggleStatus('paid')
                    setConflict(null)
                    setError(null)
                  }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
                    toggleStatus === 'paid'
                      ? 'btn-gold-fill border-transparent'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Paid
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setToggleStatus('unpaid')
                    setConflict(null)
                    setError(null)
                  }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
                    toggleStatus === 'unpaid'
                      ? 'btn-gold-fill border-transparent'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Unpaid
                </button>
              </div>
            </div>

            {showPaid && (
              <>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    Reference (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Slip or receipt number"
                    value={referenceNo}
                    onChange={(e) => {
                      setReferenceNo(e.target.value)
                      setConflict(null)
                      setError(null)
                    }}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-[#c2410c] focus:border-transparent outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    Paid date
                  </label>
                  <input
                    type="date"
                    value={paidDate}
                    onChange={(e) => {
                      setPaidDate(e.target.value)
                      setConflict(null)
                      setError(null)
                    }}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-[#c2410c] focus:border-transparent outline-none transition-colors"
                    max={todayISO()}
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Note (optional)
              </label>
              <textarea
                placeholder="For example: paid in cash at the Matara branch"
                value={note}
                onChange={(e) => {
                  setNote(e.target.value)
                  setConflict(null)
                  setError(null)
                }}
                rows={2}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-[#c2410c] focus:border-transparent outline-none transition-colors"
              />
            </div>

            {conflict && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm text-amber-800">
                  This slip number was already used for{' '}
                  <span className="font-medium">{conflict.name}</span>{' '}
                  ({conflict.code}) in {conflict.month}.
                </p>
                <button
                  type="button"
                  onClick={handleSaveAnyway}
                  disabled={saving}
                  className="mt-3 w-full px-3 py-2 rounded-lg btn-gold-fill text-sm font-medium disabled:opacity-70 transition-colors"
                >
                  Save anyway
                </button>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-5 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 disabled:opacity-60 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-lg btn-gold-fill text-sm font-medium disabled:opacity-70 transition-colors"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
