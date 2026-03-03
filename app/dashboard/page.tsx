"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import type { LearnerProfile } from "@/lib/types"
import { BookOpen, CheckCircle2, Star, BarChart3 } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

const CHART_COLORS = [
  "oklch(0.45 0.18 250)",
  "oklch(0.6 0.15 165)",
  "oklch(0.55 0.2 27)",
  "oklch(0.7 0.15 85)",
  "oklch(0.5 0.12 300)",
]

export default function DashboardPage() {
  const { learnerId } = useAuth()
  const [profile, setProfile] = useState<LearnerProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!learnerId) return
    setLoading(true)
    fetch(`/api/learners/${learnerId}`)
      .then((r) => r.json())
      .then((data) => setProfile(data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false))
  }, [learnerId])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!profile || !profile.learner) {
    return <div className="py-20 text-center text-sm text-muted-foreground">Profile not found</div>
  }

  const { learner, mastery, total_enrolled, total_completed, avg_rating_given } = profile

  const chartData = mastery.map((m) => ({
    topic: m.topic.length > 12 ? m.topic.slice(0, 12) + "..." : m.topic,
    fullTopic: m.topic,
    mastery: Math.round(m.mastery * 100),
  }))

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Welcome back, {learner.name}
        </p>
      </div>

      {/* Profile Card */}
      <div className="mb-6 rounded-lg border border-border bg-card p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-medium text-foreground">{learner.name}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {learner.dept} &middot; {learner.level}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground/60">ID: {learner.learner_id}</p>
          </div>
          <div className="flex gap-6">
            <Stat icon={BookOpen} label="Enrolled" value={total_enrolled} />
            <Stat icon={CheckCircle2} label="Completed" value={total_completed} />
            <Stat icon={Star} label="Avg Rating" value={avg_rating_given.toFixed(1)} />
          </div>
        </div>
      </div>

      {/* Mastery Section */}
      {mastery.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Chart */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="mb-4 flex items-center gap-1.5 text-sm font-medium text-foreground">
              <BarChart3 className="h-3.5 w-3.5 text-primary" />
              Mastery by Topic
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.005 250)" />
                  <XAxis
                    dataKey="topic"
                    tick={{ fontSize: 11, fill: "oklch(0.5 0.02 250)" }}
                    axisLine={{ stroke: "oklch(0.91 0.005 250)" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: "oklch(0.5 0.02 250)" }}
                    axisLine={{ stroke: "oklch(0.91 0.005 250)" }}
                    tickLine={false}
                    unit="%"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(1 0 0)",
                      border: "1px solid oklch(0.91 0.005 250)",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [`${value}%`, "Mastery"]}
                    labelFormatter={(label: string, payload: Array<{ payload?: { fullTopic?: string } }>) => {
                      const fullTopic = payload?.[0]?.payload?.fullTopic
                      return fullTopic || label
                    }}
                  />
                  <Bar dataKey="mastery" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {chartData.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-medium text-foreground">Mastery Details</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 pr-4 text-left font-medium text-muted-foreground">Topic</th>
                    <th className="pb-2 pr-4 text-right font-medium text-muted-foreground">Avg Score</th>
                    <th className="pb-2 pr-4 text-right font-medium text-muted-foreground">Completion</th>
                    <th className="pb-2 text-right font-medium text-muted-foreground">Mastery</th>
                  </tr>
                </thead>
                <tbody>
                  {mastery.map((m) => (
                    <tr key={m.topic} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 pr-4 font-medium text-foreground">{m.topic}</td>
                      <td className="py-2.5 pr-4 text-right text-muted-foreground">{m.avg_score}%</td>
                      <td className="py-2.5 pr-4 text-right text-muted-foreground">
                        {m.courses_completed}/{m.courses_enrolled}
                      </td>
                      <td className="py-2.5 text-right">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{
                              backgroundColor:
                                m.mastery >= 0.7
                                  ? "oklch(0.55 0.17 155)"
                                  : m.mastery >= 0.4
                                    ? "oklch(0.7 0.15 85)"
                                    : "oklch(0.55 0.2 27)",
                            }}
                          />
                          <span className="text-foreground">{Math.round(m.mastery * 100)}%</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {mastery.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No mastery data yet. Enroll in courses and take quizzes to see your progress.
        </div>
      )}
    </div>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div>
        <div className="text-base font-semibold text-foreground">{value}</div>
        <div className="text-[10px] text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}
