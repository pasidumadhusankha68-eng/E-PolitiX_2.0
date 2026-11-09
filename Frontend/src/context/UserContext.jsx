import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    } else {
      setUser(null)
    }
    setLoading(false)
    return storedUser ? JSON.parse(storedUser) : null
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const signOut = () => {
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <UserContext.Provider value={{ user, loading, refreshUser, signOut }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}