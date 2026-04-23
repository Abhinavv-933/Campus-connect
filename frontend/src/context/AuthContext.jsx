import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../utils/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const getErrorMessage = (error, fallback) =>
    error?.response?.data?.message || fallback

  const fetchMe = async () => {
    try {
      const { data } = await api.get('/api/auth/me')
      setUser(data.user)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMe()
  }, [])

  const login = async (payload) => {
    const { data } = await api.post('/api/auth/login', payload)
    setUser(data.user)
    return data
  }

  const register = async (payload) => {
    const { data } = await api.post('/api/auth/register', payload)
    setUser(data.user)
    return data
  }

  const logout = async () => {
    try {
      await api.post('/api/auth/logout')
    } finally {
      setUser(null)
    }
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      getErrorMessage,
    }),
    [user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
