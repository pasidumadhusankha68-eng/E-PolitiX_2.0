import { useCallback, useEffect, useState } from 'react'
import { api } from '../utils/api'
import Navbar from '../components/Navbar'
import ProfileDetailsForm from '../components/ProfileDetailsForm'
import ChangePasswordCard from '../components/ChangePasswordCard'

const GOLD_BTN =
  'bg-[#b8860b] text-white text-sm font-medium hover:bg-[#9a7009] transition-colors'

const PAYMENT_PILL = {
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  unpaid: 'bg-red-50 text-red-700 border-red-200',
}

function monthLabel(yyyymm) {
  const [y, m] = yyyymm.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProfile = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await api('/student/profile')
      setProfile(res)
    } catch (err) {
      setError(err.message || 'Failed to load profile')
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-12 shadow-sm text-center">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-[#b8860b] rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-500 mt-2">Loading profile…</p>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center justify-between gap-4">
            <p className="text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={fetchProfile}
              className={`px-4 py-2 rounded-lg ${GOLD_BTN}`}
            >
              Try again
            </button>
          </div>
        </main>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  const initials = profile.full_name
    ? profile.full_name
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'UD'

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Profile
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Your details and class fee status
          </p>
        </div>

        {/* Header card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-yellow-200 flex items-center justify-center text-yellow-600 font-bold text-2xl">
                {initials}
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900 leading-tight">
                {profile.full_name}
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Student ID: {profile.student_code}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-600">
                  {profile.institute_name || '—'}
                </span>
                <span className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-600">
                  {profile.exam_year} A/L
                </span>
                <span className="px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-medium">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column: Personal details */}
          <div className="lg:col-span-7 space-y-6">
            <ProfileDetailsForm profile={profile} onSaved={fetchProfile} />
          </div>

          {/* Right column: Class & payment + Security */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">
                Class and payment
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Class</span>
                  <span className="font-medium text-slate-900">
                    {profile.class_name || '—'}
                  </span>
                </div>
                {profile.payments.map((p) => (
                  <div
                    key={p.month}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-slate-600">{monthLabel(p.month)}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${
                        PAYMENT_PILL[p.status] || PAYMENT_PILL.unpaid
                      }`}
                    >
                      {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                    </span>
                  </div>
                ))}
                <p className="text-xs text-slate-500 mt-2">
                  If a month is unpaid, resources and online class links stay
                  locked until your payment is recorded.
                </p>
              </div>
            </div>

            <ChangePasswordCard />
          </div>
        </div>
      </main>
    </div>
  )
}
