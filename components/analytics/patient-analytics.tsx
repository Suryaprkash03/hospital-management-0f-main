"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/ui/stat-card"
import { ChartWidget } from "@/components/ui/chart-widget"
import { Badge } from "@/components/ui/badge"
import { Activity, DollarSign, Calendar, Heart } from "lucide-react"
import { usePatientAnalytics } from "@/hooks/use-analytics"
import { formatCurrency } from "@/lib/analytics-utils"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface PatientAnalyticsProps {
  patientId?: string
}

export function PatientAnalytics({ patientId }: PatientAnalyticsProps) {
  const { patientAnalytics, loading } = usePatientAnalytics(patientId)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  if (!patientAnalytics) {
    return (
      <div className="text-center text-muted-foreground p-8">
        <p>No analytics data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Your Health Summary</h2>
        <p className="text-muted-foreground">Track your health journey and medical history</p>
      </div>

      {/* Patient KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Visits"
          value={patientAnalytics.lastFiveVisits.length}
          change="This year"
          icon={Activity}
          trend="neutral"
        />
        <StatCard
          title="Total Spent"
          value={formatCurrency(patientAnalytics.totalSpent)}
          change="All time"
          icon={DollarSign}
          trend="neutral"
        />
        <StatCard
          title="Upcoming Appointments"
          value={patientAnalytics.upcomingAppointments}
          change="Scheduled"
          icon={Calendar}
          trend="neutral"
        />
        <StatCard
          title="Medication Adherence"
          value={`${Math.round(patientAnalytics.medicationAdherence * 100)}%`}
          change="Compliance rate"
          icon={Heart}
          trend={patientAnalytics.medicationAdherence > 0.8 ? "up" : "down"}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <ChartWidget
          title="Visit History"
          description="Your visits over the last 12 months"
          data={patientAnalytics.visitsSummary}
          type="line"
          dataKey="value"
          xAxisKey="name"
        />
        <ChartWidget
          title="Billing History"
          description="Your medical expenses over time"
          data={patientAnalytics.billingHistory}
          type="bar"
          dataKey="value"
          xAxisKey="name"
        />
      </div>

      {/* Recent Visits */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Visits</CardTitle>
          <CardDescription>Your last 5 medical consultations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {patientAnalytics.lastFiveVisits.map((visit, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">{visit.doctor}</div>
                  <div className="text-sm text-muted-foreground">{new Date(visit.date).toLocaleDateString()}</div>
                  <Badge variant="outline" className="text-xs">
                    {visit.diagnosis}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(visit.amount)}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
