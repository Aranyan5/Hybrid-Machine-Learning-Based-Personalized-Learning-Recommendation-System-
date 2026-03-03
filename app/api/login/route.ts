import { NextResponse } from "next/server"
import { getLearner } from "@/lib/data"

export async function POST(request: Request) {
  const body = await request.json()
  const { learner_id } = body

  if (!learner_id) {
    return NextResponse.json({ error: "learner_id is required" }, { status: 400 })
  }

  const learner = getLearner(learner_id)
  if (!learner) {
    return NextResponse.json({ error: "Learner not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true, learner })
}
