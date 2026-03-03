import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Learner, AuthContextType } from '@/types'
import { apiClient } from '@/services/api'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [learner, setLearner] = useState<Learner | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load learner from localStorage on mount
  useEffect(() => {
    const savedLearnerId = localStorage.getItem('learner_id')
    if (savedLearnerId) {
      loadLearner(savedLearnerId)
    } else {
      setIsLoading(false)
    }
  }, [])

  const loadLearner = async (learnerId: string) => {
    try {
      const response = await apiClient.get(`/learners/${learnerId}`)
      setLearner(response.data.data)
      localStorage.setItem('learner_id', learnerId)
    } catch (error) {
      console.error('Failed to load learner:', error)
      localStorage.removeItem('learner_id')
      setLearner(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (learnerId: string) => {
    setIsLoading(true)
    try {
      await loadLearner(learnerId)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setLearner(null)
    localStorage.removeItem('learner_id')
  }

  const value: AuthContextType = {
    learner,
    isLoading,
    login,
    logout,
    isAuthenticated: !!learner,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
