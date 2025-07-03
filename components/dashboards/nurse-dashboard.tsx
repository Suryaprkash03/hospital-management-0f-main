"use client"

import { StatCard } from "@/components/ui/stat-card"
import { PatientList } from "@/components/ui/patient-list"
import { BedStatus } from "@/components/ui/bed-status"
import { MedicationSchedule } from "@/components/ui/medication-schedule"
import { Users, Bed, Pill, Clock } from "lucide-react"
import { dummyData } from "@/lib/dummy-data"

export function NurseDashboard() {
  const { assignedPatients, bedStatus, medicationSchedule } = dummyData.nurse

  const highPriorityPatients = assignedPatients.filter((p) => p.priority === "high").length
  const pendingMedications = medicationSchedule.filter((m) => m.status === "pending").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nurse Dashboard</h1>
        <p className="text-muted-foreground">Patient care and medication management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Assigned Patients"
          value={assignedPatients.length}
          change={`${highPriorityPatients} high priority`}
          icon={Users}
          trend="neutral"
        />
        <StatCard
          title="Available Beds"
          value={bedStatus.filter((b) => b.status === "available").length}
          change={`${bedStatus.filter((b) => b.status === "occupied").length} occupied`}
          icon={Bed}
          trend="neutral"
        />
        <StatCard title="Pending Medications" value={pendingMedications} change="Due now" icon={Pill} trend="down" />
        <StatCard title="Shift Hours" value="6h 30m" change="2h 30m remaining" icon={Clock} trend="neutral" />
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        <PatientList
          title="Assigned Patients"
          patients={assignedPatients}
          showRoom={true}
          showCondition={true}
          showPriority={true}
        />
        <BedStatus beds={bedStatus} />
      </div>

      <MedicationSchedule medications={medicationSchedule} />
    </div>
  )
}
