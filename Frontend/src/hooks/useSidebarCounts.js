import { useEffect, useState } from 'react'
import { api } from '../utils/api'

export function useSidebarCounts() {
  const [counts, setCounts] = useState({
    payments_unpaid: 0,
    exams_incomplete: 0,
  })

  useEffect(() => {
    let timer
    const fetchCounts = async () => {
      try {
        const data = await api('/admin/sidebar/counts')
        setCounts({
          payments_unpaid: data.payments_unpaid || 0,
          exams_incomplete: data.exams_incomplete || 0,
        })
      } catch {
        // fail quietly, keep last values
      }
    }

    fetchCounts()
    timer = setInterval(fetchCounts, 60000)
    return () => clearInterval(timer)
  }, [])

  return counts
}
