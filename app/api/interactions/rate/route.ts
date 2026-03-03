import { NextResponse } from "next/server"
import { getLearner, getCourse, addInteraction } from "@/lib/data"

export async function POST(request: Request) {
  const body = await request.json()
  const { learner_id, course_id, rating, feedback } = body

  if (!learner_id || !course_id || !rating) {
    return NextResponse.json(
      { error: "learner_id, course_id, and rating are required" },
      { status: 400 }
    )
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
  }

  const learner = getLearner(learner_id)
  if (!learner) return NextResponse.json({ error: "Learner not found" }, { status: 404 })

  const course = getCourse(course_id)
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 })

  addInteraction({
    learner_id,
    course_id,
    event_type: "rate",
    rating: String(rating),
    feedback: feedback || "",
    score: "",
    time_spent: "",
  })

  return NextResponse.json({ success: true, message: "Rating submitted" })
}
