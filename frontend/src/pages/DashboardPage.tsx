import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/services/api'
import { Learner, Interaction } from '@/types'

export default function DashboardPage() {
  const { learner: authLearner } = useAuth()
  const [learner, setLearner] = useState<Learner | null>(null)
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (!authLearner) return

      try {
        const [learnerRes, interactionsRes] = await Promise.all([
          apiClient.get<Learner>(`/learners/${authLearner.learner_id}`),
          apiClient.get<Interaction[]>(`/learners/${authLearner.learner_id}/interactions`),
        ])

        setLearner(learnerRes.data)
        setInteractions(interactionsRes.data)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [authLearner])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!learner) {
    return <div className="text-center py-12">Failed to load learner data</div>
  }

  const stats = learner.stats || {
    enrollments: 0,
    completions: 0,
    completion_rate: 0,
    average_rating: 0,
  }

  const masteryEntries = Object.entries(learner.mastery || {})

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {learner.name}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="text-muted-foreground text-sm font-medium mb-2">Enrollments</div>
            <div className="text-3xl font-bold text-foreground">{stats.enrollments}</div>
          </div>
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="text-muted-foreground text-sm font-medium mb-2">Completions</div>
            <div className="text-3xl font-bold text-foreground">{stats.completions}</div>
          </div>
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="text-muted-foreground text-sm font-medium mb-2">Completion Rate</div>
            <div className="text-3xl font-bold text-foreground">{stats.completion_rate}%</div>
          </div>
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="text-muted-foreground text-sm font-medium mb-2">Average Rating</div>
            <div className="text-3xl font-bold text-foreground">{stats.average_rating}/5</div>
          </div>
        </div>

        {/* Mastery Section */}
        <div className="bg-card rounded-lg border border-border p-6 mb-8">
          <h2 className="text-xl font-bold text-foreground mb-6">Mastery by Topic</h2>
          <div className="space-y-4">
            {masteryEntries.length > 0 ? (
              masteryEntries.map(([topic, mastery]) => (
                <div key={topic}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-foreground">{topic}</span>
                    <span className="text-sm text-muted-foreground">
                      {mastery.score.toFixed(1)}% ({mastery.attempts} attempts)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${mastery.score}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">No mastery data yet</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-bold text-foreground mb-6">Recent Activity</h2>
          {interactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Course</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Topic</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Type</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Score</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {interactions.slice(0, 10).map((interaction) => (
                    <tr key={interaction.interaction_id} className="border-b border-border">
                      <td className="py-3 px-4 text-foreground">{interaction.title}</td>
                      <td className="py-3 px-4 text-foreground">{interaction.topic}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-accent text-accent-foreground">
                          {interaction.interaction_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-foreground">
                        {interaction.score ? interaction.score.toFixed(1) : '-'}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(interaction.timestamp).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No activity yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
