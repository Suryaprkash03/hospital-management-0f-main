"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { User, Stethoscope, Calendar, Edit, X, CheckCircle, Phone, Mail } from "lucide-react"
import { useState } from "react"
import type { Appointment } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { getStatusColor, formatTime, formatAppointmentDate, isWithinCancellationWindow } from "@/lib/appointment-utils"

interface AppointmentDetailsProps {
  appointment: Appointment
  onEdit: () => void
  onCancel: () => void
  onComplete: (notes?: string) => void
  onClose: () => void
}

export function AppointmentDetails({ appointment, onEdit, onCancel, onComplete, onClose }: AppointmentDetailsProps) {
  const { user } = useAuth()
  const [completionNotes, setCompletionNotes] = useState("")
  const [showCompletionForm, setShowCompletionForm] = useState(false)

  const canEdit = user?.role === "admin" || user?.role === "receptionist"
  const canCancel = () => {
    if (user?.role === "admin" || user?.role === "receptionist") return true
    if (user?.role === "patient" && appointment.patientId === user.uid) {
      return isWithinCancellationWindow(appointment.date)
    }
    return false
  }
  const canComplete = user?.role === "doctor" || user?.role === "admin"

  const handleComplete = () => {
    onComplete(completionNotes)
    setShowCompletionForm(false)
    setCompletionNotes("")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointment Details</h1>
          <p className="text-muted-foreground">ID: {appointment.appointmentId}</p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && appointment.status !== "completed" && appointment.status !== "cancelled" && (
            <Button variant="outline" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Reschedule
            </Button>
          )}
          {canComplete && appointment.status === "scheduled" && !showCompletionForm && (
            <Button onClick={() => setShowCompletionForm(true)}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark Complete
            </Button>
          )}
          {canCancel() && appointment.status !== "completed" && appointment.status !== "cancelled" && (
            <Button variant="destructive" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Status and Basic Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Appointment Information</CardTitle>
            <Badge className={getStatusColor(appointment.status)}>{appointment.status.replace("_", " ")}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date & Time
                </h4>
                <p className="text-lg">{formatAppointmentDate(appointment.date)}</p>
                <p className="text-muted-foreground">
                  {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)} ({appointment.duration}{" "}
                  minutes)
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Reason for Visit</h4>
                <p className="text-muted-foreground">{appointment.reason}</p>
              </div>

              {appointment.consultationFee && (
                <div>
                  <h4 className="font-semibold mb-2">Consultation Fee</h4>
                  <p className="text-lg font-medium text-green-600">${appointment.consultationFee}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Created By</h4>
                <p className="text-muted-foreground">{appointment.createdBy}</p>
                <p className="text-sm text-muted-foreground">
                  {appointment.createdAt.toLocaleDateString()} at {appointment.createdAt.toLocaleTimeString()}
                </p>
              </div>

              {appointment.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">{appointment.notes}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-lg">{appointment.patientName}</h4>
              <div className="flex items-center gap-4 mt-2">
                {appointment.patientPhone && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {appointment.patientPhone}
                  </div>
                )}
                {appointment.patientEmail && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {appointment.patientEmail}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Doctor Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4" />
            Doctor Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-lg">{appointment.doctorName}</h4>
              <p className="text-muted-foreground">{appointment.doctorSpecialization}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Form */}
      {showCompletionForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Complete Appointment
            </CardTitle>
            <CardDescription>Add consultation notes and mark the appointment as completed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="completionNotes">Consultation Notes</Label>
              <Textarea
                id="completionNotes"
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Enter consultation notes, diagnosis, treatment plan, etc..."
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCompletionForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleComplete}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Appointment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
