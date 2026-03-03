"use client"

import { useEffect, useState, useCallback } from "react"
import { Search } from "lucide-react"
import { CourseCard } from "@/components/course-card"
import type { Course } from "@/lib/types"

const TOPICS = ["All", "Programming", "Data Science", "Web Development", "Databases", "Security", "Cloud", "Mathematics"]
const DIFFICULTIES = ["All", "Beginner", "Intermediate", "Advanced"]

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [topic, setTopic] = useState("All")
  const [difficulty, setDifficulty] = useState("All")
  const [query, setQuery] = useState("")

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (topic !== "All") params.set("topic", topic)
    if (difficulty !== "All") params.set("difficulty", difficulty)
    if (query.trim()) params.set("q", query.trim())
    try {
      const res = await fetch(`/api/courses?${params}`)
      const data = await res.json()
      setCourses(data)
    } catch {
      setCourses([])
    } finally {
      setLoading(false)
    }
  }, [topic, difficulty, query])

  useEffect(() => {
    const timer = setTimeout(fetchCourses, 300)
    return () => clearTimeout(timer)
  }, [fetchCourses])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-foreground">Course Catalog</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Browse and enroll in courses to build your skills
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search courses..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {TOPICS.map((t) => (
              <option key={t} value={t}>{t === "All" ? "All Topics" : t}</option>
            ))}
          </select>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>{d === "All" ? "All Levels" : d}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : courses.length === 0 ? (
        <div className="py-20 text-center text-sm text-muted-foreground">
          No courses found matching your criteria
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.course_id} course={course} />
          ))}
        </div>
      )}
    </div>
  )
}
