import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import boyImg from '../img/boy.svg'
import girlImg from '../img/Girl.svg'
import welcomeBanner from '../img/welcome_banner.png'
import whatsappIcon from '../img/whatsapp.svg'
import facebookIcon from '../img/facebook.svg'
import youtubeIcon from '../img/youtube.svg'

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
  const gender = user.gender || 'male'
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

  return (
    <div className="min-h-screen overflow-x-hidden">
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
                <p className="text-2xl font-bold text-slate-900 tracking-wide">
                  {greeting}, {firstName}!
                </p>
                <p className="text-slate-500 text-sm">Ready to continue learning?</p>
              </div>
            </div>
            <img
              src={characterImg}
              alt={gender === 'female' ? 'Girl' : 'Boy'}
              className="w-40 h-40 absolute right-8 top-1/2 -translate-y-1/2 "
            />
          </div>
          
          {/* Social Links Boxes */}
          <div className="flex gap- flex-shrink-0 gap-7 ">
            <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" className="bg-white text-green-600 rounded-lg p-4 w-44 h-44 flex flex-col items-center justify-center gap-2 transition-colors shadow-md hover:shadow-lg" aria-label="WhatsApp">
              <img src={whatsappIcon} alt="WhatsApp" className="w-2/3 transition-transform duration-300 hover:scale-105" />
              <span className="text-s font-bold text-black">WhatsApp</span>
              <span className="text-xs font-normal text-black -m-3">Community</span>
            </a>
            <a href="https://www.facebook.com/share/18apYRAecC/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className=" text-blue-600 rounded-lg p-4 w-44 h-44 flex flex-col items-center justify-center gap-2 transition-colors shadow-md hover:shadow-lg" aria-label="Facebook">
              <img src={facebookIcon} alt="WhatsApp" className="w-2/3 transition-transform duration-300 hover:scale-105" />
              <span className="text-s font-bold text-black">Facebook</span>
              <span className="text-xs font-normal text-black -m-3">Page</span>
            </a>
            <a href="https://youtube.com/@indunilsgamage?si=FAjeXsbUp3BttpXv" target="_blank" rel="noopener noreferrer" className=" text-red-600 rounded-lg p-4 w-44 h-44 flex flex-col gap-2 items-center justify-center transition-colors shadow-md hover:shadow-lg" aria-label="YouTube">
              <img src={youtubeIcon} alt="WhatsApp" className="w-2/3 transition-transform duration-300 hover:scale-105" />
              <span className="text-s font-bold text-black">Youtube</span>
              <span className="text-xs font-normal text-black -m-3">Channel</span>
            </a>
          </div>
        </div>

        {/* Welcome Box - Platform branding and WhatsApp CTA */}
        {/* Why: Reinforces brand identity and drives community engagement */}
        <div className="shadow-lg rounded-2xl">
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
      </main>
    </div>
  )
}