"use client"

import { StatCard } from "@/components/ui/stat-card"
import { Users, User, Activity } from "lucide-react"
import type { PatientSummary } from "@/lib/types"

interface PatientSummaryCardsProps {
  summary: PatientSummary
}

export function PatientSummaryCards({ summary }: PatientSummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Patients"
        value={summary.totalPatients.toLocaleString()}
        change={`${summary.activePatients} active`}
        icon={Users}
        trend="up"
      />
      <StatCard
        title="Male Patients"
        value={summary.maleCount}
        change={`${Math.round((summary.maleCount / summary.totalPatients) * 100)}%`}
        icon={User}
        trend="neutral"
      />
      <StatCard
        title="Female Patients"
        value={summary.femaleCount}
        change={`${Math.round((summary.femaleCount / summary.totalPatients) * 100)}%`}
        icon={User}
        trend="neutral"
      />
      <StatCard
        title="Average Age"
        value={`${summary.averageAge} years`}
        change="All patients"
        icon={Activity}
        trend="neutral"
      />
    </div>
  )
}
