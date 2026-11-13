import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import TopStudents from '../components/TopStudents'
import TodayClasses from '../components/TodayClasses'
import boyImg from '../img/boy.svg'
import girlImg from '../img/Girl.svg'
import welcomeBanner from '../img/welcome_banner.png'
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
      } catch {
        setGender('male')
      }
    }
    fetchProfileAndTop()
    return () => {
      mounted = false
    }
  }, [])

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

        <TopStudents />

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
