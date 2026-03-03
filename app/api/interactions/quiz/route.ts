import { NextResponse } from "next/server"
import { getLearner, getCourse, addInteraction } from "@/lib/data"

export async function POST(request: Request) {
  const body = await request.json()
  const { learner_id, course_id, score, time_spent } = body

  if (!learner_id || !course_id || score === undefined || !time_spent) {
    return NextResponse.json(
      { error: "learner_id, course_id, score, and time_spent are required" },
      { status: 400 }
    )
  }

  if (score < 0 || score > 100) {
    return NextResponse.json({ error: "Score must be between 0 and 100" }, { status: 400 })
  }

  const learner = getLearner(learner_id)
  if (!learner) return NextResponse.json({ error: "Learner not found" }, { status: 404 })

  const course = getCourse(course_id)
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 })

  addInteraction({
    learner_id,
    course_id,
    event_type: "quiz",
    rating: "",
    feedback: "",
    score: String(score),
    time_spent: String(time_spent),
  })

  return NextResponse.json({ success: true, message: "Quiz score submitted" })
}
