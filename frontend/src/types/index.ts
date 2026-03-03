export interface Learner {
  learner_id: string
  name: string
  email: string
  stats?: {
    enrollments: number
    completions: number
    completion_rate: number
    average_rating: number
  }
  mastery?: Record<string, { score: number; attempts: number }>
}

export interface Course {
  course_id: string
  title: string
  description: string
  topic: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: number
  enrollment_count?: number
  average_rating?: number
  stats?: {
    enrollment_count: number
    average_rating: number
  }
}

export interface Interaction {
  interaction_id: string
  learner_id: string
  course_id: string
  interaction_type: 'enroll' | 'complete' | 'rating' | 'quiz'
  score?: number
  timestamp: string
  title?: string
  topic?: string
}

export interface Recommendation {
  course_id: string
  title: string
  topic: string
  score: number
  reasoning: string
}

export interface APIResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface AuthContextType {
  learner: Learner | null
  isLoading: boolean
  login: (learnerId: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}
