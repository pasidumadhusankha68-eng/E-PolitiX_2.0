import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../utils/api'

const VIEWS = [
  { value: 'latest', label: 'Latest test' },
  { value: 'average', label: 'All tests' },
]

const PLACE_CONFIG = {
  1: {
    label: '1st place',
    gradient: 'linear-gradient(135deg, #fde68a, #f59e0b)',
    color: '#78350f',
    tint: 'bg-orange-50',
    textClass: 'text-yellow-900',
    borderClass: 'border-yellow-200',
  },
  2: {
    label: '2nd place',
    gradient: 'linear-gradient(135deg, #e2e8f0, #94a3b8)',
    color: '#334155',
    tint: 'bg-slate-50',
    textClass: 'text-slate-700',
    borderClass: 'border-slate-200',
  },
  3: {
    label: '3rd place',
    gradient: 'linear-gradient(135deg, #fed7aa, #c2773a)',
    color: '#7c2d12',
    tint: 'bg-orange-50',
    textClass: 'text-orange-800',
    borderClass: 'border-orange-200',
  },
}

// Full class strings so Tailwind can detect them (dynamic `md:order-${n}` is NOT generated).
// Podium layout on desktop: 2nd | 1st | 3rd
const PODIUM_ORDER = {
  1: 'md:order-2',
  2: 'md:order-1',
  3: 'md:order-3',
}

const CrownIcon = ({ color }) => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    aria-hidden="true"
    fill="currentColor"
    style={{ color }}
  >
    <path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 10H5L3 8z" />
    <rect x="5" y="19" width="14" height="2" rx="1" />
  </svg>
)

const MedalIcon = ({ place, color }) => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    aria-hidden="true"
    fill="currentColor"
    style={{ color }}
  >
    <path d="M7 2h4l1.5 5-3 2L7 2z" />
    <path d="M17 2h-4l-1.5 5 3 2L17 2z" />
    <circle cx="12" cy="15" r="6.5" />
    <text
      x="12"
      y="18"
      textAnchor="middle"
      fontSize="8"
      fontWeight="700"
      fill="#ffffff"
    >
      {place}
    </text>
  </svg>
)

function formatDateSubtitle(iso) {
  if (!iso) return ''
  const d = new Date(iso + 'T00:00:00')
  if (Number.isNaN(d.getTime())) return ''
  const parts = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
  }).formatToParts(d)
  const day = parts.find((p) => p.type === 'day')?.value ?? ''
  const month = parts.find((p) => p.type === 'month')?.value ?? ''
  return `${day} ${month}`.trim()
}

function formatMark(mark) {
  const n = Number(mark)
  if (!Number.isFinite(n)) return '–'
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

function initialsOf(name) {
  if (!name) return '?'
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].charAt(0).toUpperCase()
  return `${words[0].charAt(0).toUpperCase()}${words[words.length - 1].charAt(0).toUpperCase()}`
}

export default function TopStudents() {
  // ---------- State ----------
  const [view, setView] = useState('latest')
  const [items, setItems] = useState([])
  const [test, setTest] = useState(null)
  const [examYear, setExamYear] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const mounted = useRef(false)

  // ---------- Data fetching ----------
  const fetchTopStudents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api(`/student/top-students?view=${view}`)
      if (!mounted.current) return
      setItems(Array.isArray(data?.items) ? data.items : [])
      setTest(data?.test || null)
      setExamYear(data?.exam_year || null)
    } catch (err) {
      if (!mounted.current) return
      setError(err.message || 'Failed to load top students')
      setItems([])
      setTest(null)
      setExamYear(null)
    } finally {
      if (mounted.current) setLoading(false)
    }
  }, [view])

  useEffect(() => {
    mounted.current = true
    fetchTopStudents()
    return () => {
      mounted.current = false
    }
  }, [fetchTopStudents])

  // ---------- Derived values ----------
  // FIX: every hook (including useMemo) must run on every render, BEFORE any
  // early return. Previously useMemo sat after `if (error) return ...`, which
  // changed the hook count between renders and crashed the whole page.
  const subtitle = useMemo(() => {
    const year = examYear ?? ''
    if (view === 'average') {
      return `Average of all tests · all institutes, ${year}`
    }
    const date = test?.test_date ? formatDateSubtitle(test.test_date) : ''
    return [test?.exam_name, date, `all institutes, ${year}`]
      .filter(Boolean)
      .join(' · ')
  }, [view, examYear, test])

  const podium =
    items.length === 3 &&
    items.every((i) => i.place && i.place >= 1 && i.place <= 3) &&
    new Set(items.map((i) => i.place)).size === 3

  const reducedMotion =
    typeof matchMedia === 'function' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches

  // ---------- Early returns (safe now: all hooks are above) ----------
  if (error) {
    return (
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Top students</h2>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
          <p className="text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={fetchTopStudents}
            className="mt-3 px-3 py-1.5 text-xs font-medium rounded-md border border-red-200 bg-white text-red-700 hover:bg-red-100 transition-colors"
          >
            Try again
          </button>
        </div>
      </section>
    )
  }

  if (loading) {
    return (
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Top students</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </section>
    )
  }

  // ---------- Card renderer ----------
  const renderCard = (item) => {
    const config = PLACE_CONFIG[item.place] || PLACE_CONFIG[1]
    const isFirst = item.place === 1
    return (
      <article
        className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm text-center flex flex-col items-center ${isFirst ? 'md:-mt-4 md:px-6 md:py-4' : ''}`}
        style={{
          boxShadow: item.is_me
            ? `0 0 0 2px ${config.color}, 0 0 12px rgba(184, 134, 11, 0.35)`
            : undefined,
        }}
        role="group"
        aria-label={`${config.label}, ${item.name}, ${item.institute_name || '-'}, ${formatMark(item.mark)} marks`}
      >
        <div
          className="w-full h-20 rounded-t-2xl overflow-hidden relative"
          style={{ background: config.gradient }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {item.place === 1 ? (
              <CrownIcon color={config.color} />
            ) : (
              <MedalIcon place={item.place} color={config.color} />
            )}
          </div>
        </div>
        <div className="relative -top-8 mb-2 z-20">
          <div
            className={`w-16 h-16 rounded-full border-4 border-white overflow-hidden flex items-center justify-center font-bold text-lg shadow-md ${config.tint} ${config.textClass}`}
            style={{ color: config.color }}
          >
            {initialsOf(item.name)}
          </div>
        </div>
        <h3 className="font-semibold text-slate-900 line-clamp-2 text-center px-2 mb-0.5">
          {item.name}
        </h3>
        <p className="text-sm text-slate-500 mb-1">
          {item.institute_name || '-'}
        </p>
        <p className="text-xs font-mono text-slate-400 mb-3">
          {item.code_masked}
        </p>
        <div className="text-3xl font-bold text-slate-900 mb-0.5">
          {formatMark(item.mark)}
          <span className="text-sm text-slate-400 font-normal"> / 100</span>
        </div>
        <span
          className={`text-xs font-semibold rounded-full px-2 py-0.5 mb-2 inline-block border ${config.tint} ${config.textClass} ${config.borderClass}`}
        >
          {config.label}
        </span>
        {item.is_me && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#78350f] bg-[#fde68a] px-2 py-0.5 rounded mb-2">
            That's you!
          </span>
        )}
      </article>
    )
  }

  const animationDelay = (index) =>
    reducedMotion ? '0ms' : `${index * 100}ms`

  // FIX: the API does not return student_id, so build a stable unique key
  // from place + name + index (names can repeat on ties).
  const keyOf = (item, index) => `${item.place}-${item.name}-${index}`

  // ---------- Main render ----------
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Top students</h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        <div
          role="tablist"
          className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm min-h-[44px]"
        >
          {VIEWS.map((v) => {
            const active = view === v.value
            return (
              <button
                key={v.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setView(v.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors min-h-[44px] flex items-center ${
                  active
                    ? 'bg-[#b8860b] text-white'
                    : 'border border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {v.label}
              </button>
            )
          })}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-sm text-slate-500">
            Top students will appear after the first results are entered.
          </p>
        </div>
      ) : podium ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 items-end">
          {items.map((item, index) => (
            <div
              key={keyOf(item, index)}
              className={`flex flex-col items-center w-full ${PODIUM_ORDER[item.place] || ''}`}
            >
              <div
                className="ts-card w-full"
                style={{ animationDelay: animationDelay(index) }}
              >
                {renderCard(item)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, index) => (
            <div
              key={keyOf(item, index)}
              className="ts-card"
              style={{ animationDelay: animationDelay(index) }}
            >
              {renderCard(item)}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
