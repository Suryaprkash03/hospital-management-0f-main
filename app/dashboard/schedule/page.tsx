// NOTE: this is a server component by default in the App Router.
// If ScheduleManager is a client component, we lazy-load it with `dynamic()`.
"use client"
import { Suspense } from "react"
import dynamic from "next/dynamic"
import { Separator } from "@/components/ui/separator"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import ScheduleManager from "@/components/staff/schedule-manager"
import { useAuth } from "@/contexts/auth-context"
export default function SchedulePage() {
  const { user } = useAuth()
  const staff = { id: user?.id || "" }
  return (
    <main className="flex flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">My Schedule</h1>
        <p className="text-sm text-slate-500">Update the days and hours you’re available for appointments.</p>
        <Separator className="mt-4" />
        <ScheduleManager staff={staff} onClose={() => {}} />
      </header>
    </main>
  )
}
