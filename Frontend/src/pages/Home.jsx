import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import TodayClasses from '../components/TodayClasses'
import boyImg from '../img/boy.svg'
import girlImg from '../img/Girl.svg'
import welcomeBanner from '../img/welcome_banner.png'
import whatsappIcon from '../img/whatsapp.svg'
import facebookIcon from '../img/facebook.svg'
import youtubeIcon from '../img/youtube.svg'
import { api } from '../utils/api'

/**
 * Home page - Main dashboard for logged-in students.
 * Displays time-based greeting and welcome section with WhatsApp join button.
 * Connected to route "/home" in App.jsx - accessed after successful login.
 */
export default function Home() {
  // Greeting state - updates based on current time
  // Why: Provides personalized, time-aware UX for students
  const [greeting, setGreeting] = useState('')

  // Student name from localStorage (set during login)
  // Why: Persists user session across page reloads without backend
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const firstName = user.fullName ? user.fullName.trim().split(/\s+/)[0] : 'Student'

  // Gender fetched from backend (/student/profile) — no localStorage gender field exists
  const [gender, setGender] = useState('male')
  const characterImg = gender === 'female' ? girlImg : boyImg

  // Top students cards (whole institutes, derived from student's exam year)
  const [topStudents, setTopStudents] = useState([])
  const [topLoading, setTopLoading] = useState(true)
  const [topError, setTopError] = useState(null)

  // Compute greeting based on current hour
  // Why: Runs on mount and updates if component stays mounted past time boundaries
  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours()
      if (hour >= 5 && hour < 12) setGreeting('Good Morning')
      else if (hour >= 12 && hour < 17) setGreeting('Good Afternoon')
      else if (hour >= 17 && hour < 21) setGreeting('Good Evening')
      else setGreeting('Good Night')
    }
    updateGreeting()
    // Check every minute to catch time boundary changes
    // Why: Keeps greeting accurate without page refresh
    const interval = setInterval(updateGreeting, 60000)
    return () => clearInterval(interval)
  }, [])

  // Fetch the user's gender from the backend so the greeting card shows
  // the correct character image for male/female students.
  useEffect(() => {
    let mounted = true
    async function fetchProfileAndTop() {
      try {
        const profile = await api('/student/profile')
        if (mounted && profile.gender) {
          setGender(profile.gender.toLowerCase())
        }
        if (mounted && profile.exam_year) {
          const data = await api(`/student/top-students?exam_year=${profile.exam_year}`)
          setTopStudents(Array.isArray(data.top_students) ? data.top_students : [])
        } else if (mounted) {
          setTopStudents([])
        }
      } catch {
        setGender('male')
        setTopStudents([])
      } finally {
        if (mounted) setTopLoading(false)
      }
    }
    fetchProfileAndTop()
    return () => {
      mounted = false
    }
  }, [])

  // Medal colors for 1st / 2nd / 3rd place (matches existing gold theme)
  const RANK_STYLES = [
    { medal: '1', fill: '#c2410c', text: '#ffffff' },
    { medal: '2', fill: '#c0c0c0', text: '#333333' },
    { medal: '3', fill: '#cd7f32', text: '#ffffff' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation bar with logo, tabs, notifications, profile/logout */}
      {/* Why: Provides consistent app navigation and user session controls */}
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-hidden">
        {/* Greeting Box - Time-aware personalized welcome */}
        {/* Why: Creates welcoming, human-first impression for students */}
        <div className='flex flex-col md:flex-row gap-6 mb-6'>
          <div className="rounded-xl bg-white border border-slate-200 h-44 flex items-center justify-between relative shadow-md w-full md:w-1/2">
            <div className="flex items-center gap-3 ml-6">
              <div>
                <p className="text-2xl font-bold text-slate-900 tracking-wide [@media(max-width:500px)]:text-base">
                  {greeting}, {firstName}!
                </p>
                <p className="text-slate-500 text-sm [@media(max-width:500px)]:text-xs">Ready to continue learning?</p>
              </div>
            </div>
            <img
              src={characterImg}
              alt={gender === 'female' ? 'Girl' : 'Boy'}
              className="w-40 h-40 absolute right-8 top-1/2 -translate-y-1/2 [@media(max-width:500px)]:w-[120px] [@media(max-width:500px)]:h-[120px] [@media(max-width:500px)]:-right-1"
            />
          </div>
          
        </div>

        {/* Top students cards - whole institutes */}
        {topLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : topError ? (
          <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            {topError}
          </div>
        ) : topStudents.length === 0 ? (
          <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
            No results yet
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {topStudents.map((student, i) => {
              const rank = RANK_STYLES[i] || RANK_STYLES[2]
              return (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col items-center text-center"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-3 text-white font-bold text-lg shadow-sm"
                    style={{ backgroundColor: rank.fill, color: rank.text }}
                  >
                    {rank.medal}
                  </div>
                  <div className="font-mono font-bold text-slate-900 text-sm mb-1">
                    {student.student_code}
                  </div>
                  <div className="font-semibold text-slate-800 text-sm mb-1 line-clamp-2">
                    {student.name}
                  </div>
                  <div className="text-xs text-slate-500 mb-2">
                    {student.institute_name || '-'}
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    {student.final_marks != null ? student.final_marks : '-'}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Welcome Box - Platform branding and WhatsApp CTA */}
        {/* Why: Reinforces brand identity and drives community engagement */}
        <div className="shadow-lg rounded-2xl mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-lg rounded-2xl">
            <div className="text-center sm:text-left ">
              <img
                src={welcomeBanner}
                alt="Welcome to E-PolitiX"
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
            {/* WhatsApp join button - placeholder link for community group */}
            {/* Why: Low-friction way to connect students to peer support network */}
            
          </div>
        </div>

        {/* Today’s classes */}
        <TodayClasses />

      </main>
    </div>
  )
}