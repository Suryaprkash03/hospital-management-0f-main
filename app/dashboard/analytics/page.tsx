"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard"
import { DoctorAnalytics } from "@/components/analytics/doctor-analytics"
import { PatientAnalytics } from "@/components/analytics/patient-analytics"
import { BroadcastForm } from "@/components/notifications/broadcast-form"
import { useAuth } from "@/contexts/auth-context"

export default function AnalyticsPage() {
  const { user } = useAuth()

  if (!user) return null

  const canViewAdminAnalytics = user.role === "admin"
  const canSendBroadcasts = user.role === "admin"

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            Analytics & Notifications
          </h1>
          <p className="text-rose-600/70">Insights, metrics, and communication tools</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-white/70 backdrop-blur-sm border border-rose-200">
            {canViewAdminAnalytics && (
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
              >
                Overview
              </TabsTrigger>
            )}
            {(user.role === "doctor" || canViewAdminAnalytics) && (
              <TabsTrigger
                value="doctor"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
              >
                Doctor Analytics
              </TabsTrigger>
            )}
            {(user.role === "patient" || canViewAdminAnalytics) && (
              <TabsTrigger
                value="patient"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
              >
                Patient Analytics
              </TabsTrigger>
            )}
            {canSendBroadcasts && (
              <TabsTrigger
                value="notifications"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
              >
                Notifications
              </TabsTrigger>
            )}
          </TabsList>

          {canViewAdminAnalytics && (
            <TabsContent value="overview" className="space-y-4">
              <AnalyticsDashboard />
            </TabsContent>
          )}

          {(user.role === "doctor" || canViewAdminAnalytics) && (
            <TabsContent value="doctor" className="space-y-4">
              <DoctorAnalytics />
            </TabsContent>
          )}

          {(user.role === "patient" || canViewAdminAnalytics) && (
            <TabsContent value="patient" className="space-y-4">
              <PatientAnalytics />
            </TabsContent>
          )}

          {canSendBroadcasts && (
            <TabsContent value="notifications" className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                <BroadcastForm />
                <div className="space-y-4">{/* Recent broadcasts would go here */}</div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}
