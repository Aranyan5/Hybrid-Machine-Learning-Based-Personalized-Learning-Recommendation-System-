import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/services/api'
import { Course, Interaction } from '@/types'

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { learner } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [rating, setRating] = useState(0)
  const [submittingRating, setSubmittingRating] = useState(false)
  const [quizScore, setQuizScore] = useState('')
  const [submittingQuiz, setSubmittingQuiz] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      if (!courseId || !learner) return

      try {
        const [courseRes, interactionsRes] = await Promise.all([
          apiClient.get<Course>(`/courses/${courseId}`),
          apiClient.get<Interaction[]>(`/learners/${learner.learner_id}/interactions`),
        ])

        setCourse(courseRes.data)
        setInteractions(
          interactionsRes.data.filter((i) => i.course_id === courseId)
        )
      } catch (error) {
        console.error('Failed to load course data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [courseId, learner])

  const handleEnroll = async () => {
    if (!learner || !courseId) return

    try {
      setEnrolling(true)
      await apiClient.post('/interactions/enroll', {
        learner_id: learner.learner_id,
        course_id: courseId,
      })

      // Reload interactions
      const res = await apiClient.get<Interaction[]>(
        `/learners/${learner.learner_id}/interactions`
      )
      setInteractions(res.data.filter((i) => i.course_id === courseId))
    } catch (error) {
      console.error('Failed to enroll:', error)
    } finally {
      setEnrolling(false)
    }
  }

  const handleComplete = async () => {
    if (!learner || !courseId) return

    try {
      setCompleting(true)
      await apiClient.post('/interactions/complete', {
        learner_id: learner.learner_id,
        course_id: courseId,
      })

      const res = await apiClient.get<Interaction[]>(
        `/learners/${learner.learner_id}/interactions`
      )
      setInteractions(res.data.filter((i) => i.course_id === courseId))
    } catch (error) {
      console.error('Failed to complete course:', error)
    } finally {
      setCompleting(false)
    }
  }

  const handleRate = async () => {
    if (!learner || !courseId || rating === 0) return

    try {
      setSubmittingRating(true)
      await apiClient.post('/interactions/rate', {
        learner_id: learner.learner_id,
        course_id: courseId,
        score: rating,
      })

      const res = await apiClient.get<Interaction[]>(
        `/learners/${learner.learner_id}/interactions`
      )
      setInteractions(res.data.filter((i) => i.course_id === courseId))
      setRating(0)
    } catch (error) {
      console.error('Failed to rate course:', error)
    } finally {
      setSubmittingRating(false)
    }
  }

  const handleSubmitQuiz = async () => {
    if (!learner || !courseId || !quizScore) return

    try {
      setSubmittingQuiz(true)
      await apiClient.post('/interactions/quiz', {
        learner_id: learner.learner_id,
        course_id: courseId,
        score: parseFloat(quizScore),
      })

      const res = await apiClient.get<Interaction[]>(
        `/learners/${learner.learner_id}/interactions`
      )
      setInteractions(res.data.filter((i) => i.course_id === courseId))
      setQuizScore('')
    } catch (error) {
      console.error('Failed to submit quiz:', error)
    } finally {
      setSubmittingQuiz(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!course) {
    return <div className="text-center py-12">Course not found</div>
  }

  const isEnrolled = interactions.some((i) => i.interaction_type === 'enroll')
  const isCompleted = interactions.some((i) => i.interaction_type === 'complete')

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Course Header */}
        <div className="bg-card rounded-lg border border-border p-8 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">{course.title}</h1>
              <p className="text-muted-foreground mb-4">{course.description}</p>
            </div>
            <span className="text-xs px-3 py-1 rounded bg-accent text-accent-foreground">
              {course.difficulty}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div>
              <div className="text-muted-foreground text-sm">Topic</div>
              <div className="font-semibold text-foreground">{course.topic}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-sm">Duration</div>
              <div className="font-semibold text-foreground">{course.duration} hours</div>
            </div>
            <div>
              <div className="text-muted-foreground text-sm">Enrolled</div>
              <div className="font-semibold text-foreground">{course.enrollment_count || 0}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-sm">Rating</div>
              <div className="font-semibold text-foreground">
                {(course.average_rating || 0).toFixed(1)}/5
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            {!isEnrolled ? (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 font-medium transition-colors"
              >
                {enrolling ? 'Enrolling...' : 'Enroll'}
              </button>
            ) : (
              <>
                {!isCompleted && (
                  <button
                    onClick={handleComplete}
                    disabled={completing}
                    className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 font-medium transition-colors"
                  >
                    {completing ? 'Marking Complete...' : 'Mark Complete'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Rating Section */}
        {isEnrolled && (
          <div className="bg-card rounded-lg border border-border p-6 mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Rate this Course</h2>
            <div className="flex gap-4 items-end">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-3xl transition-colors ${
                      star <= rating ? 'text-yellow-500' : 'text-muted'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <button
                onClick={handleRate}
                disabled={rating === 0 || submittingRating}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 font-medium transition-colors"
              >
                {submittingRating ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </div>
        )}

        {/* Quiz Section */}
        {isEnrolled && (
          <div className="bg-card rounded-lg border border-border p-6 mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Take Quiz</h2>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Quiz Score (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={quizScore}
                  onChange={(e) => setQuizScore(e.target.value)}
                  placeholder="Enter score..."
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button
                onClick={handleSubmitQuiz}
                disabled={!quizScore || submittingQuiz}
                className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 font-medium transition-colors whitespace-nowrap"
              >
                {submittingQuiz ? 'Submitting...' : 'Submit Quiz'}
              </button>
            </div>
          </div>
        )}

        {/* Activity History */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Activity History</h2>
          {interactions.length > 0 ? (
            <div className="space-y-3">
              {interactions.map((interaction) => (
                <div key={interaction.interaction_id} className="flex justify-between items-center py-3 border-b border-border last:border-0">
                  <div>
                    <span className="font-medium text-foreground capitalize">
                      {interaction.interaction_type}
                    </span>
                    <span className="text-muted-foreground text-sm ml-2">
                      {new Date(interaction.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  {interaction.score && (
                    <span className="font-semibold text-foreground">{interaction.score}</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No activity yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
