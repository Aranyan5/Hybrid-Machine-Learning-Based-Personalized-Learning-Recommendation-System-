"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

interface AuthContext {
  learnerId: string | null
  learnerName: string | null
  login: (id: string, name: string) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContext | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [learnerId, setLearnerId] = useState<string | null>(null)
  const [learnerName, setLearnerName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("learner_id") : null
    const storedName = typeof window !== "undefined" ? window.localStorage.getItem("learner_name") : null
    if (stored) {
      setLearnerId(stored)
      setLearnerName(storedName)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!isLoading && !learnerId && pathname !== "/login") {
      router.replace("/login")
    }
  }, [isLoading, learnerId, pathname, router])

  const login = useCallback((id: string, name: string) => {
    window.localStorage.setItem("learner_id", id)
    window.localStorage.setItem("learner_name", name)
    setLearnerId(id)
    setLearnerName(name)
    router.push("/dashboard")
  }, [router])

  const logout = useCallback(() => {
    window.localStorage.removeItem("learner_id")
    window.localStorage.removeItem("learner_name")
    setLearnerId(null)
    setLearnerName(null)
    router.push("/login")
  }, [router])

  return (
    <AuthContext value={{ learnerId, learnerName, login, logout, isLoading }}>
      {children}
    </AuthContext>
  )
}
