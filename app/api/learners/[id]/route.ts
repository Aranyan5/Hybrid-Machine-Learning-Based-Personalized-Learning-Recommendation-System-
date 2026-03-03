import { NextResponse } from "next/server"
import { getLearner, getLearnerInteractions } from "@/lib/data"
import { computeMastery } from "@/lib/recommender"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const learner = getLearner(id)
  if (!learner) {
    return NextResponse.json({ error: "Learner not found" }, { status: 404 })
  }

  const mastery = computeMastery(id)
  const interactions = getLearnerInteractions(id)

  const enrolledIds = new Set(
    interactions.filter((i) => i.event_type === "enroll").map((i) => i.course_id)
  )
  const completedIds = new Set(
    interactions.filter((i) => i.event_type === "complete").map((i) => i.course_id)
  )
  const ratings = interactions
    .filter((i) => i.event_type === "rate" && i.rating)
    .map((i) => parseFloat(i.rating))
  const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0

  return NextResponse.json({
    learner,
    mastery,
    total_enrolled: enrolledIds.size,
    total_completed: completedIds.size,
    avg_rating_given: Math.round(avgRating * 10) / 10,
  })
}
