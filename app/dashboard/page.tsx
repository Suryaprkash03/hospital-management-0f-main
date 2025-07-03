"use client"

import { useAuth } from "@/contexts/auth-context"
import { AdminDashboard } from "@/components/dashboards/admin-dashboard"
import { DoctorDashboard } from "@/components/dashboards/doctor-dashboard"
import { NurseDashboard } from "@/components/dashboards/nurse-dashboard"
import { ReceptionistDashboard } from "@/components/dashboards/receptionist-dashboard"
import { PatientDashboard } from "@/components/dashboards/patient-dashboard"

export default function DashboardPage() {
  const { user } = useAuth()

  if (!user) return null

  const renderDashboard = () => {
    switch (user.role) {
      case "admin":
        return <AdminDashboard />
      case "doctor":
        return <DoctorDashboard />
      case "nurse":
        return <NurseDashboard />
      case "receptionist":
        return <ReceptionistDashboard />
      case "patient":
        return <PatientDashboard />
      default:
        return <PatientDashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="p-6">{renderDashboard()}</div>
    </div>
  )
}
