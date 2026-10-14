import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

const validTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div']

export default function AnimatedText({ 
  text, 
  as = 'p', 
  className = '', 
  delay = 0, 
  stagger = 0.03, 
  once = true 
}) {
  const ref = useRef(null)
  const prefersReduced = useReducedMotion()
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const [forceVisible, setForceVisible] = useState(false)

  useEffect(() => {
    if (isInView && !forceVisible) {
      const timer = setTimeout(() => setForceVisible(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [isInView, forceVisible])

  const shouldAnimate = isInView || forceVisible

  const Tag = validTags.includes(as) ? as : 'p'
  const MotionTag = motion[Tag]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  }

  const wordVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: stagger },
    },
  }

  const letterVariants = {
    hidden: { opacity: 0, y: 10, filter: 'blur(2px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
  }

  const words = text.split(' ').filter(Boolean)

  if (prefersReduced) {
    return (
      <MotionTag ref={ref} className={className} aria-label={text}>
        {text}
      </MotionTag>
    )
  }

  return (
    <MotionTag
      ref={ref}
      className={className}
      aria-label={text}
      initial={shouldAnimate ? false : "hidden"}
      animate={shouldAnimate ? "visible" : "hidden"}
      variants={containerVariants}
      style={{ display: 'inline' }}
    >
      {words.map((word, wordIndex) => (
        <motion.span
          key={wordIndex}
          className="inline-block whitespace-nowrap"
          variants={wordVariants}
        >
          {word.split('').map((char, charIndex) => (
            <motion.span
              key={charIndex}
              variants={letterVariants}
              style={{ display: 'inline-block' }}
              aria-hidden="true"
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
          {wordIndex < words.length - 1 && <span aria-hidden="true"> </span>}
        </motion.span>
      ))}
    </MotionTag>
  )
}