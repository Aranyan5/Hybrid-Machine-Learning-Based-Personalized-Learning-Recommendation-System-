import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/services/api'
import { Recommendation } from '@/types'

interface RecommendationResponse {
  learner_id: string
  learner_name: string
  recommendations: Recommendation[]
  algorithm: string
}

export default function RecommendationsPage() {
  const { learner } = useAuth()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [algorithm, setAlgorithm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRecommendations = async () => {
      if (!learner) return

      try {
        const response = await apiClient.get<RecommendationResponse>(
          `/recommendations/${learner.learner_id}`
        )

        setRecommendations(response.data.recommendations)
        setAlgorithm(response.data.algorithm)
      } catch (error) {
        console.error('Failed to load recommendations:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRecommendations()
  }, [learner])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Personalized Recommendations</h1>
          <p className="text-muted-foreground">
            AI-powered course suggestions tailored to your learning profile
          </p>
        </div>

        {/* Algorithm Info */}
        <div className="bg-card rounded-lg border border-border p-4 mb-8">
          <div className="text-sm text-muted-foreground">
            <strong>Algorithm:</strong> {algorithm}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Recommendations are based on your completed courses (content-based filtering) and mastery gaps (performance-based scoring).
          </p>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <Link
                key={rec.course_id}
                to={`/courses/${rec.course_id}`}
                className="block bg-card rounded-lg border border-border p-6 hover:shadow-md hover:border-primary transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{rec.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{rec.topic}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">{rec.score}%</div>
                    <div className="text-xs text-muted-foreground">Match Score</div>
                  </div>
                </div>

                <p className="text-sm text-foreground bg-accent rounded-lg p-4 mb-4">
                  <strong>Why recommended:</strong> {rec.reasoning}
                </p>

                <div className="flex justify-end">
                  <span className="text-sm font-medium text-primary">View Course →</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <p className="text-muted-foreground text-lg mb-4">
              No recommendations yet
            </p>
            <p className="text-muted-foreground text-sm">
              Enroll in some courses and take quizzes to get personalized recommendations.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
