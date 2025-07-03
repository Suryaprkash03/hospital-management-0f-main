"use client"

import { StatCard } from "@/components/ui/stat-card"
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import type { AppointmentSummary } from "@/lib/types"

interface AppointmentSummaryCardsProps {
  summary: AppointmentSummary
}

export function AppointmentSummaryCards({ summary }: AppointmentSummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <StatCard
        title="Total Appointments"
        value={summary.totalAppointments.toLocaleString()}
        change={`${summary.upcomingCount} upcoming`}
        icon={Calendar}
        trend="up"
      />
      <StatCard
        title="Today's Appointments"
        value={summary.todayAppointments}
        change="Scheduled for today"
        icon={Clock}
        trend="neutral"
      />
      <StatCard
        title="Scheduled"
        value={summary.scheduledCount}
        change="Active bookings"
        icon={AlertCircle}
        trend="neutral"
      />
      <StatCard
        title="Completed"
        value={summary.completedCount}
        change="Finished consultations"
        icon={CheckCircle}
        trend="up"
      />
      <StatCard
        title="Cancelled"
        value={summary.cancelledCount}
        change="Cancelled appointments"
        icon={XCircle}
        trend="down"
      />
    </div>
  )
}
