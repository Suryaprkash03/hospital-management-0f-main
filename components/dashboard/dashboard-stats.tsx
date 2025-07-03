"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Calendar, Users, FileText } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

const statsConfig = {
  admin: [
    { title: "Total Patients", value: "1,234", icon: Users, change: "+12%" },
    { title: "Total Doctors", value: "56", icon: Activity, change: "+2%" },
    { title: "Appointments Today", value: "89", icon: Calendar, change: "+8%" },
    { title: "Revenue", value: "$45,231", icon: FileText, change: "+15%" },
  ],
  doctor: [
    { title: "Today's Appointments", value: "12", icon: Calendar, change: "+2" },
    { title: "Total Patients", value: "234", icon: Users, change: "+5%" },
    { title: "Completed Consultations", value: "8", icon: Activity, change: "+1" },
    { title: "Pending Reports", value: "3", icon: FileText, change: "-1" },
  ],
  patient: [
    { title: "Upcoming Appointments", value: "2", icon: Calendar, change: "" },
    { title: "Medical Records", value: "15", icon: FileText, change: "+1" },
    { title: "Health Score", value: "85%", icon: Activity, change: "+2%" },
    { title: "Last Visit", value: "5 days ago", icon: Users, change: "" },
  ],
  nurse: [
    { title: "Assigned Patients", value: "18", icon: Users, change: "+3" },
    { title: "Tasks Completed", value: "24", icon: Activity, change: "+6" },
    { title: "Pending Tasks", value: "5", icon: FileText, change: "-2" },
    { title: "Shift Hours", value: "8h", icon: Calendar, change: "" },
  ],
  receptionist: [
    { title: "Check-ins Today", value: "45", icon: Users, change: "+8" },
    { title: "Appointments Scheduled", value: "23", icon: Calendar, change: "+5" },
    { title: "Pending Approvals", value: "7", icon: FileText, change: "+2" },
    { title: "Calls Handled", value: "67", icon: Activity, change: "+12" },
  ],
}

export function DashboardStats() {
  const { user } = useAuth()

  if (!user) return null

  const stats = statsConfig[user.role] || []

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {stat.change && <p className="text-xs text-muted-foreground">{stat.change} from last month</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
