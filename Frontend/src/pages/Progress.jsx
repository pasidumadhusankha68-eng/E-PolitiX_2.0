import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts'
import {
  Activity,
  TrendingUp,
  Award,
  BarChart3,
  Users,
  RefreshCw,
  Clock,
  Target,
} from 'lucide-react'
import { useUser } from '../context/UserContext'
import { api } from '../utils/api'
import Navbar from '../components/Navbar'

const MCQ_COLOR = '#2563eb'
const ESSAY_COLOR = '#ff6000'
const TOTAL_COLOR = '#0ea5e9'

const statColors = {
  mcq: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', icon: Activity },
  essay: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', icon: Clock },
  total: { bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-100', icon: Target },
}

const fmt = (v) => (v == null ? '—' : v.toFixed(1))

function avgMarks(results, key) {
  const vals = results.map((r) => r[key]).filter((v) => v != null)
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
}

function maxMarks(results, key) {
  const vals = results.map((r) => r[key]).filter((v) => v != null)
  return vals.length ? Math.max(...vals) : null
}

export default function Progress() {
  const { user } = useUser() || {}
  const [data, setData] = useState(null)
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const token = localStorage.getItem('token') || localStorage.getItem('access_token')

  const authHeaders = { token }

  const fetchProgress = async () => {
    try {
      const [progress, studentMarks] = await Promise.all([
        api('/student/exam-progress', authHeaders),
        api('/student/all-students-marks', authHeaders),
      ])
      setData(progress)
      setStudents(studentMarks.students || [])
    } catch (err) {
      setError(err.message || 'Failed to load progress')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProgress()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-white scroll-sky">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full"
            />
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white scroll-sky">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-red-700">
            <p className="font-medium">{error}</p>
            <button
              onClick={fetchProgress}
              className="mt-3 inline-flex items-center gap-1 text-sm text-red-600 hover:underline"
            >
              <RefreshCw size={14} /> Try again
            </button>
          </div>
        </main>
      </div>
    )
  }

  const results = data.results || []
  const last = data.last_result
  const average = {
    mcq: avgMarks(results, 'mcq_marks'),
    essay: avgMarks(results, 'essay_marks'),
    total: avgMarks(results, 'final_marks'),
  }
  const highest = {
    mcq: maxMarks(results, 'mcq_marks'),
    essay: maxMarks(results, 'essay_marks'),
    total: maxMarks(results, 'final_marks'),
  }

  const chartData = results.map((r) => ({
    exam: r.exam_name || `Exam ${r.exam_number}`,
    mcq: r.mcq_marks ?? 0,
    essay: r.essay_marks ?? 0,
    total: r.final_marks ?? 0,
  }))

  const latestPerStudent = students.map((s) => {
    const exams = s.exams || []
    const latest = exams[exams.length - 1]
    return {
      name: s.name || s.code || 'Student',
      final: latest?.final_marks ?? 0,
    }
  })

  return (
    <div className="min-h-screen bg-white scroll-sky">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Progress</h1>
            <p className="text-slate-500 text-sm">
              Track your MCQ, Essay and Final marks across exams
            </p>
          </div>
          <button
            onClick={fetchProgress}
            className="flex items-center gap-2 text-sm text-sky-600 hover:text-sky-700 transition-colors"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </motion.div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-slate-500" />
                <h2 className="text-sm font-semibold text-slate-900">Last Exam</h2>
              </div>
              {last?.test_date && (
                <span className="text-xs text-slate-400">{new Date(last.test_date).toLocaleDateString()}</span>
              )}
            </div>
            <div className="space-y-2">
              {['mcq', 'essay', 'total'].map((key) => {
                const label = key === 'total' ? 'Final' : key.charAt(0).toUpperCase() + key.slice(1)
                const value = last?.[`${key}_marks`] ?? null
                const color = statColors[key]
                return (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">{label}</span>
                    <span className={`font-medium ${color.text}`}>{fmt(value)}</span>
                  </div>
                )
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-slate-500" />
                <h2 className="text-sm font-semibold text-slate-900">Current Average Mark</h2>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs">
                {results.length} exams
              </span>
            </div>
            <div className="space-y-2">
              {['mcq', 'essay', 'total'].map((key) => {
                const label = key === 'total' ? 'Final' : key.charAt(0).toUpperCase() + key.slice(1)
                const value = average[key]
                const color = statColors[key]
                return (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">{label}</span>
                    <span className={`font-medium ${color.text}`}>{fmt(value)}</span>
                  </div>
                )
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-slate-500" />
                <h2 className="text-sm font-semibold text-slate-900">Current Highest Mark</h2>
              </div>
            </div>
            <div className="space-y-2">
              {['mcq', 'essay', 'total'].map((key) => {
                const label = key === 'total' ? 'Final' : key.charAt(0).toUpperCase() + key.slice(1)
                const value = highest[key]
                const color = statColors[key]
                return (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">{label}</span>
                    <span className={`font-medium ${color.text}`}>{fmt(value)}</span>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* Line graph: MCQ, Essay, Total with horizontal scrollbar */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mb-8 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Marks Trend</h2>
              <p className="text-sm text-slate-500">MCQ, Essay and Total marks per exam</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-blue-600" /> MCQ
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-orange-600" /> Essay
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-sky-500" /> Total
              </span>
            </div>
          </div>
          <div className="w-full overflow-x-auto rounded-xl border border-slate-100 bg-slate-50/50">
            <div className="min-w-[700px] h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="exam"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    formatter={(v) => v.toFixed(1)}
                  />
                  <Legend iconType="circle" verticalAlign="top" align="right" height={36} />
                  <ReferenceLine y={average.total ?? 0} stroke="#94a3b8" strokeDasharray="2 2" label={{ value: 'Avg Total', position: 'insideLeft', fill: '#64748b', fontSize: 11 }} />
                  <Line type="monotone" dataKey="mcq" stroke={MCQ_COLOR} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} name="MCQ" />
                  <Line type="monotone" dataKey="essay" stroke={ESSAY_COLOR} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} name="Essay" />
                  <Line type="monotone" dataKey="total" stroke={TOTAL_COLOR} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} name="Total" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Per-student marks graph */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Each Student Marks</h2>
              <p className="text-sm text-slate-500">Latest final mark per student from exam_marks</p>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs">
              {students.length} students
            </span>
          </div>
          <div className="w-full overflow-x-auto rounded-xl border border-slate-100 bg-slate-50/50">
            <div className="min-w-[600px] h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={latestPerStudent}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    formatter={(v) => v.toFixed(1)}
                  />
                  <Bar dataKey="final" fill={TOTAL_COLOR} radius={[4, 4, 0, 0]} />
                  <ReferenceLine y={data.current_average_mark ?? 0} stroke="#94a3b8" strokeDasharray="2 2" label={{ value: 'Class Avg', position: 'insideLeft', fill: '#64748b', fontSize: 11 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
