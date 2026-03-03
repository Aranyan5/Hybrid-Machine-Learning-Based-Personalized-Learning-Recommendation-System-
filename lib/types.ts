export interface Learner {
  learner_id: string
  name: string
  dept: string
  level: string
}

export interface Course {
  course_id: string
  title: string
  topic: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  description: string
}

export interface Interaction {
  learner_id: string
  course_id: string
  event_type: "enroll" | "complete" | "rate" | "quiz"
  rating: string
  feedback: string
  score: string
  time_spent: string
  timestamp: string
}

export interface MasteryData {
  topic: string
  avg_score: number
  completion_rate: number
  mastery: number
  courses_enrolled: number
  courses_completed: number
}

export interface Recommendation {
  course: Course
  final_score: number
  similarity_score: number
  mastery_fit: number
  similarity_reason: string
  mastery_reason: string
}

export interface LearnerProfile {
  learner: Learner
  mastery: MasteryData[]
  total_enrolled: number
  total_completed: number
  avg_rating_given: number
}
