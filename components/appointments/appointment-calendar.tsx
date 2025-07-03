"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns"
import type { Appointment } from "@/lib/types"
import { useStaff } from "@/hooks/use-staff"
import { getStatusColor, formatTime } from "@/lib/appointment-utils"

interface AppointmentCalendarProps {
  appointments: Appointment[]
  onAppointmentClick: (appointment: Appointment) => void
  selectedDoctorId?: string
  onDoctorChange?: (doctorId: string) => void
}

export function AppointmentCalendar({
  appointments,
  onAppointmentClick,
  selectedDoctorId,
  onDoctorChange,
}: AppointmentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const { staff } = useStaff()

  const doctors = staff.filter((member) => member.role === "doctor" && member.status === "active")

  // Filter appointments by selected doctor and current month
  const filteredAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.date)
    const isInCurrentMonth = isSameMonth(aptDate, currentDate)
    const matchesDoctor = !selectedDoctorId || apt.doctorId === selectedDoctorId
    return isInCurrentMonth && matchesDoctor
  })

  // Get days for the calendar
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get appointments for a specific day
  const getAppointmentsForDay = (day: Date) => {
    return filteredAppointments.filter((apt) => isSameDay(new Date(apt.date), day))
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => (direction === "prev" ? subMonths(prev, 1) : addMonths(prev, 1)))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Appointment Calendar
            </CardTitle>
            <CardDescription>View appointments in calendar format</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {onDoctorChange && (
              <Select value={selectedDoctorId || "all"} onValueChange={onDoctorChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All doctors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All doctors</SelectItem>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      Dr. {doctor.firstName} {doctor.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">{format(currentDate, "MMMM yyyy")}</h2>
          <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="p-2 text-center font-medium text-muted-foreground">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((day) => {
            const dayAppointments = getAppointmentsForDay(day)
            const isToday = isSameDay(day, new Date())

            return (
              <div
                key={day.toISOString()}
                className={`min-h-24 p-2 border rounded-lg ${
                  isToday ? "bg-blue-50 border-blue-200" : "bg-background"
                } hover:bg-muted/50 transition-colors`}
              >
                <div className={`text-sm font-medium mb-1 ${isToday ? "text-blue-600" : ""}`}>{format(day, "d")}</div>
                <div className="space-y-1">
                  {dayAppointments.slice(0, 3).map((appointment) => (
                    <div
                      key={appointment.id}
                      onClick={() => onAppointmentClick(appointment)}
                      className="cursor-pointer p-1 rounded text-xs bg-white border hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">{formatTime(appointment.startTime)}</span>
                        <Badge className={`${getStatusColor(appointment.status)} text-xs`} variant="secondary">
                          {appointment.status.charAt(0).toUpperCase()}
                        </Badge>
                      </div>
                      <div className="truncate text-muted-foreground">{appointment.patientName}</div>
                    </div>
                  ))}
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center">+{dayAppointments.length - 3} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-100 text-blue-800">S</Badge>
            <span>Scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-yellow-100 text-yellow-800">P</Badge>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800">C</Badge>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-red-100 text-red-800">X</Badge>
            <span>Cancelled</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
