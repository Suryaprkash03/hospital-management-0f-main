"use client"

import { StatCard } from "@/components/ui/stat-card"
import { AppointmentList } from "@/components/ui/appointment-list"
import { QuickBookForm } from "@/components/ui/quick-book-form"
import { Calendar, Users, UserCheck, Clock } from "lucide-react"
import { dummyData } from "@/lib/dummy-data"

export function ReceptionistDashboard() {
  const { todayAppointments, doctors, quickStats } = dummyData.receptionist

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Receptionist Dashboard</h1>
        <p className="text-muted-foreground">Appointment management and patient check-in</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Appointments"
          value={quickStats.totalAppointments}
          change="Today"
          icon={Calendar}
          trend="neutral"
        />
        <StatCard
          title="Checked In"
          value={quickStats.checkedIn}
          change={`${quickStats.waiting} waiting`}
          icon={UserCheck}
          trend="up"
        />
        <StatCard title="Completed" value={quickStats.completed} change="Today" icon={Users} trend="up" />
        <StatCard
          title="Remaining"
          value={quickStats.totalAppointments - quickStats.completed - quickStats.checkedIn}
          change="Scheduled"
          icon={Clock}
          trend="neutral"
        />
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        <AppointmentList
          title="Today's Appointments"
          appointments={todayAppointments}
          showPatient={true}
          showDoctor={true}
          showStatus={true}
        />
        <QuickBookForm doctors={doctors} />
      </div>
    </div>
  )
}
