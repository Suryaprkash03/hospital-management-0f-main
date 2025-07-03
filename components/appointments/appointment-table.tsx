"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Eye, Edit, X, CheckCircle, MoreHorizontal, Clock, Phone } from "lucide-react"
import type { Appointment } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { getStatusColor, formatTime, formatAppointmentDate, isWithinCancellationWindow } from "@/lib/appointment-utils"

interface AppointmentTableProps {
  appointments: Appointment[]
  onViewAppointment: (appointment: Appointment) => void
  onEditAppointment: (appointment: Appointment) => void
  onCancelAppointment: (appointment: Appointment) => void
  onCompleteAppointment: (appointment: Appointment) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function AppointmentTable({
  appointments,
  onViewAppointment,
  onEditAppointment,
  onCancelAppointment,
  onCompleteAppointment,
  currentPage,
  totalPages,
  onPageChange,
}: AppointmentTableProps) {
  const { user } = useAuth()

  const canEdit = user?.role === "admin" || user?.role === "receptionist"
  const canCancel = (appointment: Appointment) => {
    if (user?.role === "admin" || user?.role === "receptionist") return true
    if (user?.role === "patient" && appointment.patientId === user.uid) {
      return isWithinCancellationWindow(appointment.date)
    }
    return false
  }
  const canComplete = user?.role === "doctor" || user?.role === "admin"

  if (appointments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No appointments found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointments</CardTitle>
        <CardDescription>
          Showing {appointments.length} appointment{appointments.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Appointment ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow
                  key={appointment.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onViewAppointment(appointment)}
                >
                  <TableCell className="font-medium">{appointment.appointmentId}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{appointment.patientName}</div>
                      {appointment.patientPhone && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {appointment.patientPhone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{appointment.doctorName}</div>
                      <div className="text-sm text-muted-foreground">{appointment.doctorSpecialization}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{formatAppointmentDate(appointment.date)}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{appointment.duration} min</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(appointment.status)}>{appointment.status.replace("_", " ")}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{appointment.reason}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onViewAppointment(appointment)
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {canEdit && appointment.status !== "completed" && appointment.status !== "cancelled" && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              onEditAppointment(appointment)
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Reschedule
                          </DropdownMenuItem>
                        )}
                        {canComplete && appointment.status === "scheduled" && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              onCompleteAppointment(appointment)
                            }}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark Complete
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {canCancel(appointment) &&
                          appointment.status !== "completed" &&
                          appointment.status !== "cancelled" && (
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={(e) => {
                                e.stopPropagation()
                                onCancelAppointment(appointment)
                              }}
                            >
                              <X className="mr-2 h-4 w-4" />
                              Cancel
                            </DropdownMenuItem>
                          )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
