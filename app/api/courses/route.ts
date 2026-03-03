import { NextResponse } from "next/server"
import { getCourses } from "@/lib/data"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const topic = searchParams.get("topic")
  const difficulty = searchParams.get("difficulty")
  const q = searchParams.get("q")

  let courses = getCourses()

  if (topic) {
    courses = courses.filter((c) => c.topic.toLowerCase() === topic.toLowerCase())
  }
  if (difficulty) {
    courses = courses.filter((c) => c.difficulty.toLowerCase() === difficulty.toLowerCase())
  }
  if (q) {
    const query = q.toLowerCase()
    courses = courses.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.topic.toLowerCase().includes(query)
    )
  }

  return NextResponse.json(courses)
}
