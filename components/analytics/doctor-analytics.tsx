"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/ui/stat-card"
import { ChartWidget } from "@/components/ui/chart-widget"
import { useDoctorAnalytics } from "@/hooks/use-analytics"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Users, Clock, Calendar, UserCheck } from "lucide-react"

export function DoctorAnalytics() {
  const { doctorAnalytics, loading } = useDoctorAnalytics()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Safe fallbacks for analytics data
  const doctorKpis = doctorAnalytics?.doctorKpis || {
    totalPatients: 0,
    patientsTrend: 0,
    avgConsultationTime: 0,
    consultationTrend: 0,
    followUpRate: 0,
    followUpTrend: 0,
    onTimeRate: 0,
    onTimeTrend: 0,
  }

  const doctorChartData = doctorAnalytics?.doctorChartData || {
    weeklyAppointments: [],
    patientLoadByTime: [],
    commonDiagnoses: [],
  }

  return (
    <div className="space-y-6">
      {/* Doctor KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Patients Seen"
          value={doctorKpis.totalPatients}
          icon={Users}
          trend={doctorKpis.patientsTrend}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"
        />
        <StatCard
          title="Avg Consultation Time"
          value={`${doctorKpis.avgConsultationTime} min`}
          icon={Clock}
          trend={doctorKpis.consultationTrend}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white"
        />
        <StatCard
          title="Follow-up Rate"
          value={`${doctorKpis.followUpRate}%`}
          icon={UserCheck}
          trend={doctorKpis.followUpTrend}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white"
        />
        <StatCard
          title="On-time Rate"
          value={`${doctorKpis.onTimeRate}%`}
          icon={Calendar}
          trend={doctorKpis.onTimeTrend}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white"
        />
      </div>

      {/* Doctor Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWidget title="Weekly Appointments" data={doctorChartData.weeklyAppointments} type="line" height={300} />

        <ChartWidget
          title="Patient Load by Time Slot"
          data={doctorChartData.patientLoadByTime}
          type="bar"
          height={300}
        />

        <ChartWidget title="Most Common Diagnoses" data={doctorChartData.commonDiagnoses} type="pie" height={300} />

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Patient Satisfaction</span>
              <span className="text-2xl font-bold text-green-600">4.8/5</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Referral Rate</span>
              <span className="text-2xl font-bold text-blue-600">12%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">No-show Rate</span>
              <span className="text-2xl font-bold text-orange-600">5%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
