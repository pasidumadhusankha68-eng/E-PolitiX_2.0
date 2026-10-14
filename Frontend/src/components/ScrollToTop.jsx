import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function ScrollToTop({ triggerSectionId = 'hero' }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const triggerSection = document.getElementById(triggerSectionId)
    if (!triggerSection) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(!entry.isIntersecting)
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0 }
    )

    observer.observe(triggerSection)
    return () => observer.disconnect()
  }, [triggerSectionId])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!isVisible) return null

  return (
    <motion.button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-lg transition-colors"
      aria-label="Scroll to top"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </motion.button>
  )
}