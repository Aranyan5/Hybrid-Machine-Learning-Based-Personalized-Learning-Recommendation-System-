"use client"

import { AuthProvider, useAuth } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar"
import { usePathname } from "next/navigation"

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const { learnerId, learnerName, logout, isLoading } = useAuth()
  const pathname = usePathname()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (pathname === "/login" || !learnerId) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar learnerName={learnerName || ""} onLogout={logout} />
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppLayoutInner>{children}</AppLayoutInner>
    </AuthProvider>
  )
}
