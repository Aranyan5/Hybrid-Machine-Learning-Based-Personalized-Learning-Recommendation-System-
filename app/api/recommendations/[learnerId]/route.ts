import { NextResponse } from "next/server"
import { getLearner } from "@/lib/data"
import { getRecommendations } from "@/lib/recommender"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ learnerId: string }> }
) {
  const { learnerId } = await params
  const learner = getLearner(learnerId)
  if (!learner) {
    return NextResponse.json({ error: "Learner not found" }, { status: 404 })
  }

  const recommendations = getRecommendations(learnerId)
  return NextResponse.json(recommendations)
}
