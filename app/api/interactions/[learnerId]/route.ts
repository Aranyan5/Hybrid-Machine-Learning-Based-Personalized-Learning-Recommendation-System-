import { NextResponse } from "next/server"
import { getLearnerInteractions } from "@/lib/data"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ learnerId: string }> }
) {
  const { learnerId } = await params
  const interactions = getLearnerInteractions(learnerId)
  return NextResponse.json(interactions)
}
