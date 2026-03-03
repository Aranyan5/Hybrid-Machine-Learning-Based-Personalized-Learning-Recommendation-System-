import { NextResponse } from "next/server"
import { getLearner, getCourse, addInteraction, getLearnerInteractions } from "@/lib/data"

export async function POST(request: Request) {
  const body = await request.json()
  const { learner_id, course_id } = body

  if (!learner_id || !course_id) {
    return NextResponse.json({ error: "learner_id and course_id are required" }, { status: 400 })
  }

  const learner = getLearner(learner_id)
  if (!learner) return NextResponse.json({ error: "Learner not found" }, { status: 404 })

  const course = getCourse(course_id)
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 })

  const existing = getLearnerInteractions(learner_id)
  const isEnrolled = existing.some((i) => i.course_id === course_id && i.event_type === "enroll")
  if (!isEnrolled) {
    return NextResponse.json({ error: "Must be enrolled first" }, { status: 400 })
  }

  const alreadyCompleted = existing.some(
    (i) => i.course_id === course_id && i.event_type === "complete"
  )
  if (alreadyCompleted) {
    return NextResponse.json({ error: "Already completed this course" }, { status: 409 })
  }

  addInteraction({
    learner_id,
    course_id,
    event_type: "complete",
    rating: "",
    feedback: "",
    score: "",
    time_spent: "",
  })

  return NextResponse.json({ success: true, message: "Course marked as completed" })
}
