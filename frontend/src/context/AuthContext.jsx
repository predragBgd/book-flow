import { createContext, useContext, useEffect, useState } from 'react'
import { api, getErrorMessage } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('bookflow_user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('bookflow_token')
    if (!token) {
      setLoading(false)
      return
    }

    api
      .me()
      .then(({ data }) => {
        setUser(data)
        localStorage.setItem('bookflow_user', JSON.stringify(data))
      })
      .catch(() => {
        localStorage.removeItem('bookflow_token')
        localStorage.removeItem('bookflow_user')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const { data } = await api.login(email, password)
    localStorage.setItem('bookflow_token', data.access_token)
    localStorage.setItem('bookflow_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('bookflow_token')
    localStorage.removeItem('bookflow_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export { getErrorMessage }
