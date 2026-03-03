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

  // Check if already enrolled
  const existing = getLearnerInteractions(learner_id)
  const alreadyEnrolled = existing.some(
    (i) => i.course_id === course_id && i.event_type === "enroll"
  )
  if (alreadyEnrolled) {
    return NextResponse.json({ error: "Already enrolled in this course" }, { status: 409 })
  }

  addInteraction({
    learner_id,
    course_id,
    event_type: "enroll",
    rating: "",
    feedback: "",
    score: "",
    time_spent: "",
  })

  return NextResponse.json({ success: true, message: "Enrolled successfully" })
}
