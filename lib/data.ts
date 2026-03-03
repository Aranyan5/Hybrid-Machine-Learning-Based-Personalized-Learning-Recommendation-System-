import fs from "fs"
import path from "path"
import type { Learner, Course, Interaction } from "./types"

const DATA_DIR = path.join(process.cwd(), "data")

function parseCsv<T>(filePath: string): T[] {
  const content = fs.readFileSync(filePath, "utf-8")
  const lines = content.trim().split("\n")
  if (lines.length < 2) return []
  const headers = lines[0].split(",").map((h) => h.trim())
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line)
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => {
      obj[h] = (values[i] || "").trim()
    })
    return obj as T
  })
}

function parseCsvLine(line: string): string[] {
  const values: string[] = []
  let current = ""
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      values.push(current)
      current = ""
    } else {
      current += char
    }
  }
  values.push(current)
  return values
}

function appendCsv(filePath: string, row: Record<string, string>) {
  const content = fs.readFileSync(filePath, "utf-8")
  const headers = content.trim().split("\n")[0].split(",").map((h) => h.trim())
  const values = headers.map((h) => {
    const val = row[h] || ""
    return val.includes(",") ? `"${val}"` : val
  })
  fs.appendFileSync(filePath, "\n" + values.join(","))
}

export function getLearners(): Learner[] {
  return parseCsv<Learner>(path.join(DATA_DIR, "learners.csv"))
}

export function getLearner(learnerId: string): Learner | undefined {
  return getLearners().find((l) => l.learner_id === learnerId)
}

export function getCourses(): Course[] {
  return parseCsv<Course>(path.join(DATA_DIR, "courses.csv"))
}

export function getCourse(courseId: string): Course | undefined {
  return getCourses().find((c) => c.course_id === courseId)
}

export function getInteractions(): Interaction[] {
  return parseCsv<Interaction>(path.join(DATA_DIR, "interactions.csv"))
}

export function getLearnerInteractions(learnerId: string): Interaction[] {
  return getInteractions().filter((i) => i.learner_id === learnerId)
}

export function addInteraction(interaction: Omit<Interaction, "timestamp">) {
  const row = {
    ...interaction,
    timestamp: new Date().toISOString(),
  }
  appendCsv(path.join(DATA_DIR, "interactions.csv"), row)
}
