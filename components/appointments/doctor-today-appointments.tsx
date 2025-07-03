"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, User, CheckCircle, AlertCircle } from "lucide-react"
import type { Appointment } from "@/lib/types"
import { getStatusColor, formatTime, isToday } from "@/lib/appointment-utils"

interface DoctorTodayAppointmentsProps {
  appointments: Appointment[]
  doctorId: string
  onAppointmentClick: (appointment: Appointment) => void
  onCompleteAppointment: (appointment: Appointment) => void
}

export function DoctorTodayAppointments({
  appointments,
  doctorId,
  onAppointmentClick,
  onCompleteAppointment,
}: DoctorTodayAppointmentsProps) {
  // Filter today's appointments for the doctor
  const todayAppointments = appointments.filter(
    (apt) => apt.doctorId === doctorId && isToday(apt.date) && apt.status !== "cancelled",
  )

  const upcomingAppointments = todayAppointments.filter(
    (apt) => apt.status === "scheduled" || apt.status === "confirmed",
  )
  const completedAppointments = todayAppointments.filter((apt) => apt.status === "completed")

  if (todayAppointments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Today's Appointments
          </CardTitle>
          <CardDescription>Your scheduled appointments for today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No appointments scheduled for today</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Today's Appointments
        </CardTitle>
        <CardDescription>
          {todayAppointments.length} appointment{todayAppointments.length !== 1 ? "s" : ""} scheduled •{" "}
          {completedAppointments.length} completed
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {todayAppointments
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
            .map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => onAppointmentClick(appointment)}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium">{appointment.patientName}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                    </div>
                    <div className="text-sm text-muted-foreground truncate max-w-xs">{appointment.reason}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(appointment.status)}>{appointment.status.replace("_", " ")}</Badge>
                  {appointment.status === "scheduled" && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onCompleteAppointment(appointment)
                      }}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Complete
                    </Button>
                  )}
                </div>
              </div>
            ))}
        </div>

        {upcomingAppointments.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">
                {upcomingAppointments.length} appointment{upcomingAppointments.length !== 1 ? "s" : ""} remaining today
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
