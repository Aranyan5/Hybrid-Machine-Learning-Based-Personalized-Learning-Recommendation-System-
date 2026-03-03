"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { BookOpen } from "lucide-react"
import { toast } from "sonner"

const DEMO_LEARNERS = [
  { id: "L001", name: "Alice Chen", dept: "Computer Science" },
  { id: "L002", name: "Bob Martinez", dept: "Data Science" },
  { id: "L003", name: "Carol Wang", dept: "Information Systems" },
  { id: "L004", name: "David Kim", dept: "Computer Science" },
  { id: "L005", name: "Eva Johnson", dept: "Data Science" },
]

export default function LoginPage() {
  const { login } = useAuth()
  const [learnerId, setLearnerId] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin(id?: string) {
    const targetId = id || learnerId.trim()
    if (!targetId) {
      toast.error("Please enter a learner ID")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ learner_id: targetId }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Login failed")
        return
      }
      login(data.learner.learner_id, data.learner.name)
      toast.success(`Welcome, ${data.learner.name}`)
    } catch {
      toast.error("Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-xl font-semibold text-foreground">LearnRec</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Course Recommender System
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <label className="mb-1.5 block text-xs font-medium text-foreground" htmlFor="learner-id">
            Learner ID
          </label>
          <div className="flex gap-2">
            <input
              id="learner-id"
              type="text"
              placeholder="e.g. L001"
              value={learnerId}
              onChange={(e) => setLearnerId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={loading}
            />
            <button
              onClick={() => handleLogin()}
              disabled={loading}
              className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "..." : "Sign in"}
            </button>
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-xs text-muted-foreground">Quick access</p>
          <div className="flex flex-col gap-1.5">
            {DEMO_LEARNERS.map((l) => (
              <button
                key={l.id}
                onClick={() => handleLogin(l.id)}
                disabled={loading}
                className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-left text-sm transition-colors hover:bg-accent disabled:opacity-50"
              >
                <span className="text-foreground">{l.name}</span>
                <span className="text-xs text-muted-foreground">{l.id}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
