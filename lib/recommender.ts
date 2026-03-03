import type { Course, Interaction, MasteryData, Recommendation } from "./types"
import { getCourses, getLearnerInteractions } from "./data"

// TF-IDF implementation
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((t) => t.length > 1)
}

function computeTfIdf(docs: string[][]): { vectors: number[][]; vocabulary: string[] } {
  const vocabulary = [...new Set(docs.flat())]
  const df: Record<string, number> = {}
  vocabulary.forEach((word) => {
    df[word] = docs.filter((doc) => doc.includes(word)).length
  })
  const N = docs.length
  const vectors = docs.map((doc) => {
    const wordCount: Record<string, number> = {}
    doc.forEach((w) => {
      wordCount[w] = (wordCount[w] || 0) + 1
    })
    return vocabulary.map((word) => {
      const tf = (wordCount[word] || 0) / (doc.length || 1)
      const idf = Math.log((N + 1) / (df[word] + 1)) + 1
      return tf * idf
    })
  })
  return { vectors, vocabulary }
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0
  let magA = 0
  let magB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    magA += a[i] * a[i]
    magB += b[i] * b[i]
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB)
  return denom === 0 ? 0 : dot / denom
}

// Compute mastery per topic
export function computeMastery(learnerId: string): MasteryData[] {
  const interactions = getLearnerInteractions(learnerId)
  const courses = getCourses()
  const courseMap = new Map(courses.map((c) => [c.course_id, c]))

  const topicData: Record<
    string,
    {
      scores: number[]
      enrolled: Set<string>
      completed: Set<string>
    }
  > = {}

  interactions.forEach((inter) => {
    const course = courseMap.get(inter.course_id)
    if (!course) return
    const topic = course.topic
    if (!topicData[topic]) {
      topicData[topic] = { scores: [], enrolled: new Set(), completed: new Set() }
    }
    if (inter.event_type === "enroll") {
      topicData[topic].enrolled.add(inter.course_id)
    }
    if (inter.event_type === "complete") {
      topicData[topic].completed.add(inter.course_id)
      topicData[topic].enrolled.add(inter.course_id)
    }
    if (inter.event_type === "quiz" && inter.score) {
      topicData[topic].scores.push(parseFloat(inter.score))
    }
  })

  return Object.entries(topicData).map(([topic, data]) => {
    const avgScore = data.scores.length > 0 ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length : 0
    const completionRate = data.enrolled.size > 0 ? data.completed.size / data.enrolled.size : 0
    const mastery = 0.6 * (avgScore / 100) + 0.4 * completionRate
    return {
      topic,
      avg_score: Math.round(avgScore * 10) / 10,
      completion_rate: Math.round(completionRate * 100) / 100,
      mastery: Math.round(mastery * 100) / 100,
      courses_enrolled: data.enrolled.size,
      courses_completed: data.completed.size,
    }
  })
}

// Content-based filtering
function getContentSimilarities(
  likedCourses: Course[],
  candidateCourses: Course[],
  allCourses: Course[]
): Map<string, { score: number; reason: string }> {
  const docs = allCourses.map((c) => tokenize(`${c.topic} ${c.difficulty} ${c.description}`))
  const { vectors } = computeTfIdf(docs)
  const courseIndexMap = new Map(allCourses.map((c, i) => [c.course_id, i]))
  const results = new Map<string, { score: number; reason: string }>()

  candidateCourses.forEach((candidate) => {
    const cIdx = courseIndexMap.get(candidate.course_id)
    if (cIdx === undefined) return
    let maxSim = 0
    let bestMatch = ""
    likedCourses.forEach((liked) => {
      const lIdx = courseIndexMap.get(liked.course_id)
      if (lIdx === undefined) return
      const sim = cosineSimilarity(vectors[cIdx], vectors[lIdx])
      if (sim > maxSim) {
        maxSim = sim
        bestMatch = liked.title
      }
    })
    results.set(candidate.course_id, {
      score: Math.round(maxSim * 100) / 100,
      reason: bestMatch
        ? `Similar to "${bestMatch}" based on topic and content`
        : "General content match",
    })
  })

  return results
}

// Mastery-based fitness scoring
function getMasteryFitScores(
  candidateCourses: Course[],
  mastery: MasteryData[]
): Map<string, { score: number; reason: string }> {
  const masteryMap = new Map(mastery.map((m) => [m.topic, m]))
  const results = new Map<string, { score: number; reason: string }>()
  const difficultyOrder: Record<string, number> = { Beginner: 1, Intermediate: 2, Advanced: 3 }

  candidateCourses.forEach((course) => {
    const topicMastery = masteryMap.get(course.topic)
    let score: number
    let reason: string

    if (!topicMastery) {
      score = 0.8
      reason = `New topic "${course.topic}" - expand your knowledge`
    } else if (topicMastery.mastery < 0.4) {
      const diffLevel = difficultyOrder[course.difficulty] || 1
      score = diffLevel === 1 ? 0.95 : diffLevel === 2 ? 0.7 : 0.4
      reason = `Low mastery in "${course.topic}" (${Math.round(topicMastery.mastery * 100)}%) - ${course.difficulty} level to build foundation`
    } else if (topicMastery.mastery < 0.7) {
      const diffLevel = difficultyOrder[course.difficulty] || 1
      score = diffLevel === 2 ? 0.9 : diffLevel === 1 ? 0.5 : 0.7
      reason = `Moderate mastery in "${course.topic}" (${Math.round(topicMastery.mastery * 100)}%) - ${course.difficulty} level to advance skills`
    } else {
      const diffLevel = difficultyOrder[course.difficulty] || 1
      score = diffLevel === 3 ? 0.85 : diffLevel === 2 ? 0.5 : 0.2
      reason = `High mastery in "${course.topic}" (${Math.round(topicMastery.mastery * 100)}%) - ${course.difficulty} level for mastery`
    }

    results.set(course.course_id, { score, reason })
  })

  return results
}

// Hybrid recommendation
export function getRecommendations(learnerId: string): Recommendation[] {
  const courses = getCourses()
  const interactions = getLearnerInteractions(learnerId)
  const mastery = computeMastery(learnerId)

  // Find completed course IDs
  const completedIds = new Set(
    interactions.filter((i) => i.event_type === "complete").map((i) => i.course_id)
  )

  // Liked courses: rated >= 4 or completed
  const likedIds = new Set<string>()
  interactions.forEach((i) => {
    if (i.event_type === "complete") likedIds.add(i.course_id)
    if (i.event_type === "rate" && parseFloat(i.rating) >= 4) likedIds.add(i.course_id)
  })
  const likedCourses = courses.filter((c) => likedIds.has(c.course_id))

  // Candidate courses: not completed
  const candidateCourses = courses.filter((c) => !completedIds.has(c.course_id))

  if (candidateCourses.length === 0) return []

  // If no liked courses, use all enrolled as seeds, or just recommend by mastery
  const seedCourses = likedCourses.length > 0 ? likedCourses : candidateCourses.slice(0, 3)

  const contentScores = getContentSimilarities(seedCourses, candidateCourses, courses)
  const masteryScores = getMasteryFitScores(candidateCourses, mastery)

  const ranked: Recommendation[] = candidateCourses.map((course) => {
    const content = contentScores.get(course.course_id) || { score: 0, reason: "" }
    const masteryFit = masteryScores.get(course.course_id) || { score: 0, reason: "" }
    const finalScore = 0.6 * content.score + 0.4 * masteryFit.score

    return {
      course,
      final_score: Math.round(finalScore * 100) / 100,
      similarity_score: content.score,
      mastery_fit: masteryFit.score,
      similarity_reason: content.reason,
      mastery_reason: masteryFit.reason,
    }
  })

  // Sort by final score descending
  ranked.sort((a, b) => b.final_score - a.final_score)

  // Diversify: avoid all same topic in top 5
  const result: Recommendation[] = []
  const topicCount: Record<string, number> = {}
  for (const rec of ranked) {
    if (result.length >= 5) break
    const topic = rec.course.topic
    if ((topicCount[topic] || 0) >= 2) continue
    result.push(rec)
    topicCount[topic] = (topicCount[topic] || 0) + 1
  }

  return result
}
