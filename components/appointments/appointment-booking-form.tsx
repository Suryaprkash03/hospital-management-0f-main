"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Clock, User, Stethoscope, AlertCircle } from "lucide-react"
import { format, addDays, isBefore, startOfDay } from "date-fns"
import type { BookingRequest } from "@/lib/types"
import { useStaff } from "@/hooks/use-staff"
import { usePatients } from "@/hooks/use-patients"
import { useDoctorAvailability } from "@/hooks/use-appointments"
import { useAuth } from "@/contexts/auth-context"
import { specializations } from "@/lib/staff-utils"
import {
  formatTime,
  calculateEndTime,
  maxAdvanceBookingDays,
  defaultAppointmentDuration,
} from "@/lib/appointment-utils"

interface AppointmentBookingFormProps {
  onSubmit: (bookingData: BookingRequest) => Promise<void>
  onCancel: () => void
  loading?: boolean
  initialPatientId?: string
  initialDoctorId?: string
}

export function AppointmentBookingForm({
  onSubmit,
  onCancel,
  loading = false,
  initialPatientId,
  initialDoctorId,
}: AppointmentBookingFormProps) {
  const { user } = useAuth()
  const { staff } = useStaff()
  const { patients } = usePatients()

  const [formData, setFormData] = useState({
    patientId: initialPatientId || "",
    doctorId: initialDoctorId || "",
    specialization: "",
    date: null as Date | null,
    startTime: "",
    reason: "",
    duration: defaultAppointmentDuration,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const doctors = staff.filter((member) => member.role === "doctor" && member.status === "active")
  const filteredDoctors = formData.specialization
    ? doctors.filter((doctor) => doctor.specialization === formData.specialization)
    : doctors

  const { availability, loading: availabilityLoading } = useDoctorAvailability(
    formData.doctorId,
    formData.date || new Date(),
  )

  const availableSlots = availability?.timeSlots.filter((slot) => slot.isAvailable) || []

  useEffect(() => {
    if (initialDoctorId) {
      const doctor = doctors.find((d) => d.id === initialDoctorId)
      if (doctor) {
        setFormData((prev) => ({
          ...prev,
          doctorId: initialDoctorId,
          specialization: doctor.specialization || "",
        }))
      }
    }
  }, [initialDoctorId, doctors])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.patientId) newErrors.patientId = "Patient is required"
    if (!formData.doctorId) newErrors.doctorId = "Doctor is required"
    if (!formData.date) newErrors.date = "Date is required"
    if (!formData.startTime) newErrors.startTime = "Time slot is required"
    if (!formData.reason.trim()) newErrors.reason = "Reason for visit is required"

    // Check if date is in the future
    if (formData.date && isBefore(formData.date, startOfDay(new Date()))) {
      newErrors.date = "Cannot book appointments for past dates"
    }

    // Check if date is within booking window
    if (formData.date && formData.date > addDays(new Date(), maxAdvanceBookingDays)) {
      newErrors.date = `Cannot book appointments more than ${maxAdvanceBookingDays} days in advance`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      const endTime = calculateEndTime(formData.startTime, formData.duration)

      await onSubmit({
        patientId: formData.patientId,
        doctorId: formData.doctorId,
        date: formData.date!,
        startTime: formData.startTime,
        endTime,
        reason: formData.reason,
        duration: formData.duration,
      })
    } catch (error) {
      console.error("Error submitting booking:", error)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }

    // Reset dependent fields
    if (field === "specialization") {
      setFormData((prev) => ({ ...prev, doctorId: "", startTime: "" }))
    }
    if (field === "doctorId" || field === "date") {
      setFormData((prev) => ({ ...prev, startTime: "" }))
    }
  }

  const handleDoctorChange = (doctorId: string) => {
    const doctor = doctors.find((d) => d.id === doctorId)
    setFormData((prev) => ({
      ...prev,
      doctorId,
      specialization: doctor?.specialization || "",
      startTime: "",
    }))
  }

  const isWeekend = (date: Date) => {
    const day = date.getDay()
    return day === 0 || day === 6 // Sunday or Saturday
  }

  const selectedPatient = patients.find((p) => p.id === formData.patientId)
  const selectedDoctor = doctors.find((d) => d.id === formData.doctorId)

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Book New Appointment</CardTitle>
        <CardDescription>Schedule an appointment with a doctor</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Patient Information
            </h3>
            <div className="space-y-2">
              <Label htmlFor="patientId">Select Patient *</Label>
              <Select value={formData.patientId} onValueChange={(value) => handleChange("patientId", value)}>
                <SelectTrigger className={errors.patientId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Choose a patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName} - {patient.patientId}
                      <span className="text-muted-foreground ml-2">({patient.phone})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.patientId && <p className="text-sm text-red-500">{errors.patientId}</p>}
              {selectedPatient && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedPatient.phone} • {selectedPatient.email}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Doctor Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Doctor Selection
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Select
                  value={formData.specialization}
                  onValueChange={(value) => handleChange("specialization", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All specializations</SelectItem>
                    {specializations.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctorId">Select Doctor *</Label>
                <Select value={formData.doctorId} onValueChange={handleDoctorChange}>
                  <SelectTrigger className={errors.doctorId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Choose a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredDoctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                        {doctor.consultationFee && (
                          <span className="text-muted-foreground ml-2">(${doctor.consultationFee})</span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.doctorId && <p className="text-sm text-red-500">{errors.doctorId}</p>}
                {selectedDoctor && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">
                      Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedDoctor.specialization} • {selectedDoctor.department}
                    </p>
                    {selectedDoctor.consultationFee && (
                      <p className="text-sm font-medium text-green-600">Fee: ${selectedDoctor.consultationFee}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Date and Time Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Date & Time
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Select Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${errors.date ? "border-red-500" : ""}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date || undefined}
                      onSelect={(date) => handleChange("date", date)}
                      disabled={(date) =>
                        isBefore(date, startOfDay(new Date())) ||
                        date > addDays(new Date(), maxAdvanceBookingDays) ||
                        isWeekend(date)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
              </div>

              <div className="space-y-2">
                <Label>Available Time Slots *</Label>
                {formData.doctorId && formData.date ? (
                  availabilityLoading ? (
                    <div className="p-4 text-center text-muted-foreground">Loading available slots...</div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {availableSlots.map((slot) => (
                        <Button
                          key={slot.startTime}
                          type="button"
                          variant={formData.startTime === slot.startTime ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleChange("startTime", slot.startTime)}
                          className="justify-start"
                        >
                          {formatTime(slot.startTime)}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                      No available slots for this date
                    </div>
                  )
                ) : (
                  <div className="p-4 text-center text-muted-foreground">Please select a doctor and date first</div>
                )}
                {errors.startTime && <p className="text-sm text-red-500">{errors.startTime}</p>}
              </div>
            </div>

            {formData.startTime && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-900">Selected Appointment Time</p>
                <p className="text-blue-700">
                  {formData.date && format(formData.date, "EEEE, MMMM d, yyyy")} at {formatTime(formData.startTime)} -{" "}
                  {formatTime(calculateEndTime(formData.startTime, formData.duration))}
                </p>
                <p className="text-sm text-blue-600">Duration: {formData.duration} minutes</p>
              </div>
            )}
          </div>

          {/* Appointment Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Appointment Details</h3>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Visit *</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => handleChange("reason", e.target.value)}
                placeholder="Describe the reason for this appointment..."
                className={errors.reason ? "border-red-500" : ""}
                rows={3}
              />
              {errors.reason && <p className="text-sm text-red-500">{errors.reason}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select
                value={formData.duration.toString()}
                onValueChange={(value) => handleChange("duration", Number.parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Summary */}
          {formData.patientId && formData.doctorId && formData.date && formData.startTime && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Appointment Summary</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Patient:</strong> {selectedPatient?.firstName} {selectedPatient?.lastName}
                </p>
                <p>
                  <strong>Doctor:</strong> Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName} (
                  {selectedDoctor?.specialization})
                </p>
                <p>
                  <strong>Date & Time:</strong> {format(formData.date, "PPP")} at {formatTime(formData.startTime)}
                </p>
                <p>
                  <strong>Duration:</strong> {formData.duration} minutes
                </p>
                {selectedDoctor?.consultationFee && (
                  <p>
                    <strong>Consultation Fee:</strong> ${selectedDoctor.consultationFee}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Booking..." : "Book Appointment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
