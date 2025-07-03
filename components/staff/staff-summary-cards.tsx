"use client"

import { StatCard } from "@/components/ui/stat-card"
import { Users, Stethoscope, UserCheck, Activity, Briefcase } from "lucide-react"
import type { StaffSummary } from "@/lib/types"

interface StaffSummaryCardsProps {
  summary: StaffSummary
}

export function StaffSummaryCards({ summary }: StaffSummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <StatCard
        title="Total Staff"
        value={summary.totalStaff.toLocaleString()}
        change={`${summary.activeStaff} active`}
        icon={Users}
        trend="up"
      />
      <StatCard
        title="Doctors"
        value={summary.doctorCount}
        change={`${Math.round((summary.doctorCount / summary.totalStaff) * 100)}%`}
        icon={Stethoscope}
        trend="neutral"
      />
      <StatCard
        title="Nurses"
        value={summary.nurseCount}
        change={`${Math.round((summary.nurseCount / summary.totalStaff) * 100)}%`}
        icon={UserCheck}
        trend="neutral"
      />
      <StatCard
        title="Lab Technicians"
        value={summary.labTechCount}
        change={`${Math.round((summary.labTechCount / summary.totalStaff) * 100)}%`}
        icon={Activity}
        trend="neutral"
      />
      <StatCard title="On Leave" value={summary.onLeaveStaff} change="Staff members" icon={Briefcase} trend="down" />
    </div>
  )
}
