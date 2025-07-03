"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/ui/stat-card"
import { ChartWidget } from "@/components/ui/chart-widget"
import { useAnalytics } from "@/hooks/use-analytics"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Users, Calendar, DollarSign, Bed, AlertTriangle, TrendingUp, Activity, Pill } from "lucide-react"

export function AnalyticsDashboard() {
  const { analyticsData, loading, error } = useAnalytics()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        <p>Error loading analytics: {error}</p>
      </div>
    )
  }

  // Add null check for analyticsData
  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const { kpis, chartData } = analyticsData
  console.log("Analytics Data:", analyticsData)
  return (
    <div className="space-y-6 overflow-y-scroll">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Patients"
          value={kpis.totalPatients}
          icon={Users}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"
        />
        <StatCard
          title="Today's Appointments"
          value={kpis.todayAppointments}
          icon={Calendar}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white"
        />
        <StatCard
          title="Today's Revenue"
          value={`$${kpis.todayRevenue.toLocaleString()}`}
          icon={DollarSign}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white"
        />
        <StatCard
          title="Current Inpatients"
          value={kpis.currentInpatients}
          icon={Bed}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white"
        />
        <StatCard
          title="Low Stock Alerts"
          value={kpis.lowStockAlerts}
          icon={AlertTriangle}
          className="bg-gradient-to-r from-red-500 to-red-600 text-white"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWidget
          title="Monthly Patient Visits"
          data={chartData.monthlyPatientVisits || []}
          type="bar"
          dataKey="count" // Replace "count" with the actual key representing the value in your data
          height={300}
        />


        <ChartWidget
          title="Top 5 Prescribed Medicines"
          data={chartData.topPrescribedMedicines || []}
          type="pie"
          dataKey="count" // Replace "count" with the actual key representing the value in your data
          height={300}
        />

        <ChartWidget
          title="Appointment Distribution by Time"
          data={chartData.appointmentsByTimeSlot || []}
          type="bar"
          dataKey="count" // Replace "count" with the actual key representing the value in your data
          height={300}
        />
        <ChartWidget
          title="Daily Revenue Trends"
          data={chartData.dailyRevenueTrends || []}
          type="bar"
          dataKey="revenue" // Replace "revenue" with the actual key representing the value in your data
          height={300}
        />

      </div>

    </div>
  )
}
