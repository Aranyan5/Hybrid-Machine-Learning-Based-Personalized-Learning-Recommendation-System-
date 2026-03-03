import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/services/api'
import { Learner } from '@/types'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()
  const [learners, setLearners] = useState<Learner[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  // Load available learners on mount
  useEffect(() => {
    const loadLearners = async () => {
      try {
        const response = await apiClient.get<Learner[]>('/auth/learners')
        setLearners(response.data)
      } catch (err) {
        console.error('Failed to load learners:', err)
      }
    }
    loadLearners()
  }, [])

  const handleLogin = async (learnerId: string) => {
    try {
      setLoading(true)
      setError('')
      await login(learnerId)
      navigate('/dashboard')
    } catch (err) {
      setError('Failed to login. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-card rounded-lg border border-border p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-foreground mb-2">LearnRec</h1>
          <p className="text-muted-foreground mb-8">
            AI-powered course recommendations for personalized learning
          </p>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-4 mb-6">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground mb-4">
              Select a demo learner to get started:
            </p>
            {learners.map((learner) => (
              <button
                key={learner.learner_id}
                onClick={() => handleLogin(learner.learner_id)}
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg border border-border bg-card hover:bg-accent text-foreground font-medium transition-colors disabled:opacity-50"
              >
                <div className="flex justify-between items-center">
                  <span>{learner.name}</span>
                  <span className="text-xs text-muted-foreground">ID: {learner.learner_id}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              This is a demo application with pre-loaded learner accounts. No password required.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
