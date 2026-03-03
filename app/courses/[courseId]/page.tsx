"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"
import { ArrowLeft, BookOpen, CheckCircle2, Star, Clock } from "lucide-react"
import type { Course, Interaction } from "@/lib/types"
import { cn } from "@/lib/utils"

const difficultyColors: Record<string, string> = {
  Beginner: "bg-success/10 text-success",
  Intermediate: "bg-chart-4/15 text-chart-4",
  Advanced: "bg-destructive/10 text-destructive",
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { learnerId } = useAuth()
  const courseId = params.courseId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState("")

  // Form states
  const [rating, setRating] = useState(5)
  const [feedback, setFeedback] = useState("")
  const [quizScore, setQuizScore] = useState(75)
  const [timeSpent, setTimeSpent] = useState(30)

  const isEnrolled = interactions.some(
    (i) => i.course_id === courseId && i.event_type === "enroll"
  )
  const isCompleted = interactions.some(
    (i) => i.course_id === courseId && i.event_type === "complete"
  )

  const fetchData = useCallback(async () => {
    if (!learnerId) return
    setLoading(true)
    try {
      const [courseRes, intRes] = await Promise.all([
        fetch(`/api/courses/${courseId}`),
        fetch(`/api/interactions/${learnerId}`),
      ])
      const courseData = await courseRes.json()
      const intData = await intRes.json()
      setCourse(courseData)
      setInteractions(intData)
    } catch {
      toast.error("Failed to load course")
    } finally {
      setLoading(false)
    }
  }, [courseId, learnerId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleAction(
    endpoint: string,
    body: Record<string, unknown>,
    successMsg: string
  ) {
    setActionLoading(endpoint)
    try {
      const res = await fetch(`/api/interactions/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error)
        return
      }
      toast.success(successMsg)
      fetchData()
    } catch {
      toast.error("Action failed")
    } finally {
      setActionLoading("")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!course) {
    return <div className="py-20 text-center text-sm text-muted-foreground">Course not found</div>
  }

  return (
    <div className="mx-auto max-w-2xl">
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </button>

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-medium text-muted-foreground">{course.topic}</span>
            <h1 className="mt-1 text-lg font-semibold text-foreground">{course.title}</h1>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
              difficultyColors[course.difficulty] || "bg-muted text-muted-foreground"
            )}
          >
            {course.difficulty}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{course.description}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {!isEnrolled && (
            <button
              onClick={() =>
                handleAction("enroll", { learner_id: learnerId, course_id: courseId }, "Enrolled successfully")
              }
              disabled={!!actionLoading}
              className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Enroll
            </button>
          )}
          {isEnrolled && !isCompleted && (
            <button
              onClick={() =>
                handleAction("complete", { learner_id: learnerId, course_id: courseId }, "Course completed")
              }
              disabled={!!actionLoading}
              className="flex items-center gap-1.5 rounded-md bg-success px-4 py-2 text-sm font-medium text-success-foreground transition-colors hover:bg-success/90 disabled:opacity-50"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Mark Completed
            </button>
          )}
          {isCompleted && (
            <span className="flex items-center gap-1.5 rounded-md bg-success/10 px-4 py-2 text-sm font-medium text-success">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Completed
            </span>
          )}
        </div>
      </div>

      {isEnrolled && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {/* Rate */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="mb-3 flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Star className="h-3.5 w-3.5 text-chart-4" />
              Rate Course
            </h3>
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setRating(s)}
                  className={cn(
                    "h-8 w-8 rounded-md text-xs font-medium transition-colors",
                    s <= rating
                      ? "bg-chart-4/15 text-chart-4"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Optional feedback..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="mb-2 h-8 w-full rounded-md border border-input bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={() =>
                handleAction(
                  "rate",
                  { learner_id: learnerId, course_id: courseId, rating, feedback },
                  "Rating submitted"
                )
              }
              disabled={!!actionLoading}
              className="h-8 w-full rounded-md bg-secondary text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent disabled:opacity-50"
            >
              Submit Rating
            </button>
          </div>

          {/* Quiz */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="mb-3 flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Clock className="h-3.5 w-3.5 text-primary" />
              Submit Quiz
            </h3>
            <label className="mb-1 block text-[11px] text-muted-foreground">Score (0-100)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={quizScore}
              onChange={(e) => setQuizScore(Number(e.target.value))}
              className="mb-2 h-8 w-full rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <label className="mb-1 block text-[11px] text-muted-foreground">Time spent (minutes)</label>
            <input
              type="number"
              min={1}
              value={timeSpent}
              onChange={(e) => setTimeSpent(Number(e.target.value))}
              className="mb-2 h-8 w-full rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={() =>
                handleAction(
                  "quiz",
                  { learner_id: learnerId, course_id: courseId, score: quizScore, time_spent: timeSpent },
                  "Quiz score submitted"
                )
              }
              disabled={!!actionLoading}
              className="h-8 w-full rounded-md bg-secondary text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent disabled:opacity-50"
            >
              Submit Quiz
            </button>
          </div>
        </div>
      )}

      {/* Interaction History */}
      {interactions.filter((i) => i.course_id === courseId).length > 0 && (
        <div className="mt-4 rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-medium text-foreground">Activity History</h3>
          <div className="flex flex-col gap-2">
            {interactions
              .filter((i) => i.course_id === courseId)
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((inter, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-xs"
                >
                  <span className="font-medium capitalize text-foreground">{inter.event_type}</span>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    {inter.rating && <span>Rating: {inter.rating}/5</span>}
                    {inter.score && <span>Score: {inter.score}%</span>}
                    {inter.time_spent && <span>{inter.time_spent} min</span>}
                    <span>{new Date(inter.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
