import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, UserPlus, ClipboardList, TrendingUp, ChevronRight, CheckCircle2 } from 'lucide-react'
import { api } from '../../utils/api'
import AdminSideBar from '../../components/admin/AdminSideBar'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const CHART_COLORS = [
  '#ff6000',
  '#ffc901',
  '#2563eb',
  '#64748b',
  '#10b981',
  '#ef4444',
  '#8b5cf6',
  '#f59e0b',
]

const ACTIVITY = [
  { id: 'r1', text: 'Marks uploaded for Test 6 (Sapala)', time: '2 hours ago' },
  { id: 'r2', text: '14 new students registered this week', time: 'Today' },
  { id: 'r3', text: 'Rank list downloaded for Test 5', time: 'Yesterday' },
  { id: 'r4', text: 'Class dates updated (Wimasuma)', time: '2 days ago' },
  { id: 'r5', text: 'New resource added: Past paper 2024', time: '3 days ago' },
]

const greetingByHour = () => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Good Morning'
  if (hour >= 12 && hour < 17) return 'Good Afternoon'
  if (hour >= 17 && hour < 21) return 'Good Evening'
  return 'Good Night'
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [chartInstitutes, setChartInstitutes] = useState([])
  const [chartTests, setChartTests] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [attention, setAttention] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    let pending = 4

    const finish = () => {
      pending -= 1
      if (!cancelled && pending <= 0) {
        setLoading(false)
      }
    }

    api('/admin/dashboard/stats')
      .then((data) => {
        if (!cancelled) {
          setStats(data)
          finish()
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load dashboard stats')
          finish()
        }
      })

    api('/admin/dashboard/average-by-institute')
      .then((data) => {
        if (!cancelled) {
          setChartInstitutes(Array.isArray(data?.institutes) ? data.institutes : [])
          setChartTests(Array.isArray(data?.tests) ? data.tests : [])
          finish()
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load chart data')
          finish()
        }
      })

    api('/admin/dashboard/registrations')
      .then((data) => {
        if (!cancelled) {
          setRegistrations(Array.isArray(data?.registrations) ? data.registrations : [])
          finish()
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load registrations')
          finish()
        }
      })

    api('/admin/dashboard/attention')
      .then((data) => {
        if (!cancelled) {
          setAttention(Array.isArray(data?.attention) ? data.attention : [])
          finish()
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load attention items')
          finish()
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const storedUser = localStorage.getItem('user')
  const user = storedUser ? JSON.parse(storedUser) : null
  const fullName = user?.fullName ?? ''
  const firstName = fullName.trim().split(/\s+/)[0] || 'Admin'
  const greeting = greetingByHour()

  const dash = loading || !stats
    ? { students_total: null, new_this_week: null, tests_this_month: null, average_mark_last_test: null }
    : stats

  const chartData = chartTests.map((t) => {
    const row = { test: t.label }
    chartInstitutes.forEach((inst) => {
      row[String(inst.id)] = t.averages?.[String(inst.id)] ?? null
    })
    return row
  })

  return (
    <section className="w-full bg-white/95 h-screen flex">
      <AdminSideBar />
      <main className="flex-1 overflow-y-auto min-h-0 bg-slate-50 scroll-sky">
        <div className="space-y-6 p-6 lg:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-slate-900">
                {greeting}, {firstName}
              </h1>
              <p className="text-sm text-slate-500">Here is what is happening with your classes</p>
            </div>
            <div className="flex gap-2">
              <Link
                to="/admin/exams"
                className="rounded-full px-5 py-2.5 text-sm font-semibold transition-colors bg-[#ff6000] text-white hover:bg-[#e65600]"
              >
                Upload marks
              </Link>
              <Link
                to="/admin/results"
                className="rounded-full px-5 py-2.5 text-sm font-semibold transition-colors border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Download Rank List
              </Link>
            </div>
          </div>
          {error && (
            <p className="text-xs text-red-600 bg-red-50 rounded px-3 py-2 mb-4">{error}</p>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div
              key="students"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <p className="text-sm text-slate-500">Students</p>
                <div className="bg-orange-50 rounded-xl w-10 h-10 flex items-center justify-center">
                  <Users className="text-[#ff6000]" size={20} />
                </div>
              </div>
              <p className="mt-3 text-3xl font-semibold text-slate-900">
                {loading ? '-' : dash.students_total ?? '-'}
              </p>
              <p className="mt-3 text-xs text-slate-500">All institutes</p>
            </div>
            <div
              key="new"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <p className="text-sm text-slate-500">New this week</p>
                <div className="bg-emerald-50 rounded-xl w-10 h-10 flex items-center justify-center">
                  <UserPlus className="text-emerald-600" size={20} />
                </div>
              </div>
              <p className="mt-3 text-3xl font-semibold text-slate-900">
                {loading ? '-' : dash.new_this_week ?? '-'}
              </p>
              <div className="mt-3 flex justify-between items-center">
                <p className="text-xs text-slate-500">since Monday</p>
                {!loading && dash.new_this_week != null && (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    +{dash.new_this_week}
                  </span>
                )}
              </div>
            </div>
            <div
              key="tests"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <p className="text-sm text-slate-500">Tests this month</p>
                <div className="bg-blue-50 rounded-xl w-10 h-10 flex items-center justify-center">
                  <ClipboardList className="text-blue-600" size={20} />
                </div>
              </div>
              <p className="mt-3 text-3xl font-semibold text-slate-900">
                {loading ? '-' : dash.tests_this_month ?? '-'}
              </p>
              <p className="mt-3 text-xs text-slate-500">across all classes</p>
            </div>
            <div
              key="avg"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <p className="text-sm text-slate-500">Average mark</p>
                <div className="bg-amber-50 rounded-xl w-10 h-10 flex items-center justify-center">
                  <TrendingUp className="text-amber-600" size={20} />
                </div>
              </div>
              <p className="mt-3 text-3xl font-semibold text-slate-900">
                {loading ? '-' : dash.average_mark_last_test == null ? '-' : `${dash.average_mark_last_test}%`}
              </p>
              <p className="mt-3 text-xs text-slate-500">last test, all institutes</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm min-w-0 mt-4">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Average mark per test</h2>
              <p className="text-sm text-slate-500">By institute</p>
            </div>
            <div className="mt-4 h-80 w-full overflow-x-auto">
              {chartTests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                  <CheckCircle2 size={24} className="mb-2" />
                  <p className="text-sm">No exam data yet</p>
                </div>
              ) : (
                <div className="h-full" style={{ minWidth: Math.max(600, chartTests.length * 160) }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="test" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
                      <YAxis
                        domain={[0, 100]}
                        tick={[0, 25, 50, 75, 100]}
                        tickFormatter={(v) => v + '%'}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        axisLine={false}
                      />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px' }} />
                      <Legend iconType="circle" verticalAlign="bottom" height={36} />
                      {chartInstitutes.map((inst, i) => (
                        <Line
                          key={inst.id}
                          type="monotone"
                          dataKey={String(inst.id)}
                          stroke={CHART_COLORS[i % CHART_COLORS.length]}
                          strokeWidth={2.5}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                          isAnimationActive={
                            !window.matchMedia('(prefers-reduced-motion: reduce)').matches
                          }
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm min-w-0">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-slate-900">New registrations</h2>
                <p className="text-sm text-slate-500">Last 8 weeks</p>
              </div>
              <div className="mt-4 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={registrations}>
                    <CartesianGrid vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px' }} />
                    <Bar dataKey="students" fill="#ff6000" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm min-w-0">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Needs attention</h2>
              </div>
              {attention.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                  <CheckCircle2 size={20} className="mb-2" />
                  <p className="text-sm">All caught up</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {attention.map((item) => {
                    const dotColor = item.level === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                    return (
                      <Link
                        key={item.id}
                        to={item.to}
                        className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${dotColor}`}></div>
                        <span className="text-sm text-slate-700">{item.text}</span>
                        <ChevronRight size={16} className="ml-auto text-slate-400" />
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Recent activity card commented out for now
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm min-w-0">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Recent activity</h2>
            </div>
            {ACTIVITY.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                <CheckCircle2 size={20} className="mb-2" />
                <p className="text-sm">No activity yet</p>
              </div>
            ) : (
              <div className="relative pl-8">
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-200" />
                {ACTIVITY.map((item) => (
                  <div key={item.id} className="relative pl-8 mb-4 last:mb-0">
                    <div className="absolute left-0 top-1 w-2 h-2 rounded-full bg-[#ff6000]" />
                    <div className="text-sm text-slate-700">{item.text}</div>
                    <div className="text-xs text-slate-400">{item.time}</div>
                  </div>
                ))}
              </div>
            )}
          </div> */}
        </div>
      </main>
    </section>
  )
}
