"use client"

import { StatCard } from "@/components/ui/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, FileText, Activity, Heart, Download, Eye } from "lucide-react"
import { dummyData } from "@/lib/dummy-data"
import { PatientAnalytics } from "@/components/analytics/patient-analytics"

export function PatientDashboard() {
  const { nextAppointment, recentVisits, reports, healthMetrics } = dummyData.patient

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Patient Dashboard</h1>
        <p className="text-muted-foreground">Your health information and appointments</p>
      </div>

      {/* Health Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Blood Pressure"
          value={healthMetrics.bloodPressure}
          change="Normal range"
          icon={Heart}
          trend="up"
        />
        <StatCard title="Heart Rate" value={healthMetrics.heartRate} change="Resting" icon={Activity} trend="neutral" />
        <StatCard
          title="Temperature"
          value={healthMetrics.temperature}
          change="Normal"
          icon={Activity}
          trend="neutral"
        />
        <StatCard title="Weight" value={healthMetrics.weight} change="Last recorded" icon={Activity} trend="neutral" />
      </div>

      {/* Next Appointment */}
      <Card>
        <CardHeader>
          <CardTitle>Next Appointment</CardTitle>
          <CardDescription>Your upcoming medical appointment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="space-y-1">
                <div className="font-semibold">{nextAppointment.doctor}</div>
                <div className="text-sm text-muted-foreground">{nextAppointment.specialization}</div>
                <div className="text-sm">
                  {nextAppointment.date} at {nextAppointment.time}
                </div>
                <div className="text-sm text-muted-foreground">{nextAppointment.location}</div>
              </div>
            </div>
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              Reschedule
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Visits and Reports */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Visits</CardTitle>
            <CardDescription>Your recent medical consultations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentVisits.map((visit, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">{visit.doctor}</div>
                    <div className="text-sm text-muted-foreground">{visit.type}</div>
                    <div className="text-sm text-muted-foreground">{visit.date}</div>
                  </div>
                  <Badge variant="outline">{visit.diagnosis}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medical Reports</CardTitle>
            <CardDescription>Your uploaded medical documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <FileText className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium text-sm">{report.name}</div>
                      <div className="text-xs text-muted-foreground">{report.date}</div>
                      <Badge variant="secondary" className="text-xs">
                        {report.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6">
        <PatientAnalytics />
      </div>
    </div>
  )
}
