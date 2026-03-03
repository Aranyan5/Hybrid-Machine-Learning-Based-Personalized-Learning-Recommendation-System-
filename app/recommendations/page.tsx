"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import Link from "next/link"
import type { Recommendation } from "@/lib/types"
import { Lightbulb, ArrowUpRight, Brain, Target } from "lucide-react"
import { cn } from "@/lib/utils"

const difficultyColors: Record<string, string> = {
  Beginner: "bg-success/10 text-success",
  Intermediate: "bg-chart-4/15 text-chart-4",
  Advanced: "bg-destructive/10 text-destructive",
}

export default function RecommendationsPage() {
  const { learnerId } = useAuth()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!learnerId) return
    setLoading(true)
    fetch(`/api/recommendations/${learnerId}`)
      .then((r) => r.json())
      .then((data) => setRecommendations(data))
      .catch(() => setRecommendations([]))
      .finally(() => setLoading(false))
  }, [learnerId])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-foreground">Recommendations</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Your personalized top 5 course recommendations based on your learning history
        </p>
      </div>

      {/* Algorithm Info */}
      <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="text-xs leading-relaxed text-foreground">
            <span className="font-medium">Hybrid Recommendation Engine</span>
            <span className="text-muted-foreground">
              {" "}&mdash; Combines content-based filtering (TF-IDF + cosine similarity from your liked courses) with
              mastery-gap analysis (prioritizing topics where you have room to grow). Final score = 60% content similarity + 40% mastery fit.
            </span>
          </div>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No recommendations yet. Enroll in and complete some courses to get personalized suggestions.
          </p>
          <Link
            href="/courses"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Browse courses
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {recommendations.map((rec, index) => (
            <Link
              key={rec.course.course_id}
              href={`/courses/${rec.course.course_id}`}
              className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/30 hover:bg-accent/30"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {rec.course.title}
                      </h3>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-medium",
                          difficultyColors[rec.course.difficulty] || "bg-muted text-muted-foreground"
                        )}
                      >
                        {rec.course.difficulty}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{rec.course.topic}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      {rec.course.description}
                    </p>

                    {/* Explanation */}
                    <div className="mt-3 flex flex-col gap-1.5">
                      <div className="flex items-start gap-2 text-[11px]">
                        <Brain className="mt-0.5 h-3 w-3 shrink-0 text-chart-2" />
                        <span className="text-muted-foreground">{rec.similarity_reason}</span>
                      </div>
                      <div className="flex items-start gap-2 text-[11px]">
                        <Target className="mt-0.5 h-3 w-3 shrink-0 text-chart-4" />
                        <span className="text-muted-foreground">{rec.mastery_reason}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="shrink-0 text-right">
                  <div className="text-lg font-semibold text-foreground">
                    {Math.round(rec.final_score * 100)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">score</div>
                  <div className="mt-2 flex flex-col gap-0.5 text-[10px] text-muted-foreground">
                    <span>Sim: {Math.round(rec.similarity_score * 100)}%</span>
                    <span>Fit: {Math.round(rec.mastery_fit * 100)}%</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
