"use client"

import { StatCard } from "@/components/ui/stat-card"
import { NotificationPanel } from "@/components/ui/notification-panel"
import { DoctorTodayAppointments } from "@/components/appointments/doctor-today-appointments"
import { Calendar, Users, FileText, AlertCircle } from "lucide-react"
import { dummyData } from "@/lib/dummy-data"
import { useAppointments } from "@/hooks/use-appointments"
import { useAuth } from "@/contexts/auth-context"
import { DoctorAnalytics } from "@/components/analytics/doctor-analytics"

export function DoctorDashboard() {
  const { user } = useAuth()
  const { appointments, completeAppointment } = useAppointments()
  const { todayStats, notifications } = dummyData.doctor

  // Filter appointments for the current doctor
  const doctorAppointments = appointments.filter((apt) => apt.doctorId === user?.uid)

  const handleAppointmentClick = (appointment: any) => {
    // Navigate to appointment details
    console.log("View appointment:", appointment)
  }

  const handleCompleteAppointment = async (appointment: any) => {
    try {
      await completeAppointment(appointment.id)
    } catch (error) {
      console.error("Error completing appointment:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Doctor Dashboard</h1>
        <p className="text-muted-foreground">Your schedule and patient updates</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Patients Attended Today"
          value={todayStats.patientsAttended}
          change="Out of 12 scheduled"
          icon={Users}
          trend="up"
        />
        <StatCard
          title="Appointments Scheduled"
          value={todayStats.appointmentsScheduled}
          change="4 remaining today"
          icon={Calendar}
          trend="neutral"
        />
        <StatCard
          title="Pending Reports"
          value={todayStats.pendingReports}
          change="Awaiting review"
          icon={FileText}
          trend="neutral"
        />
        <StatCard
          title="Emergency Calls"
          value={todayStats.emergencyCalls}
          change="This shift"
          icon={AlertCircle}
          trend="down"
        />
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        <DoctorTodayAppointments
          appointments={doctorAppointments}
          doctorId={user?.uid || ""}
          onAppointmentClick={handleAppointmentClick}
          onCompleteAppointment={handleCompleteAppointment}
        />
        <NotificationPanel notifications={notifications} />
      </div>

      <div className="mt-6">
        <DoctorAnalytics />
      </div>
    </div>
  )
}
