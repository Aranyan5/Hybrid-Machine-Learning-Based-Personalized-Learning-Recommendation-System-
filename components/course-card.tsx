"use client"

import Link from "next/link"
import type { Course } from "@/lib/types"
import { cn } from "@/lib/utils"

const difficultyColors: Record<string, string> = {
  Beginner: "bg-success/10 text-success",
  Intermediate: "bg-chart-4/15 text-chart-4",
  Advanced: "bg-destructive/10 text-destructive",
}

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/courses/${course.course_id}`}
      className="group flex flex-col rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-accent/50"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">{course.topic}</span>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
            difficultyColors[course.difficulty] || "bg-muted text-muted-foreground"
          )}
        >
          {course.difficulty}
        </span>
      </div>
      <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
        {course.title}
      </h3>
      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
        {course.description}
      </p>
      <div className="mt-3 text-[10px] text-muted-foreground/60">{course.course_id}</div>
    </Link>
  )
}
