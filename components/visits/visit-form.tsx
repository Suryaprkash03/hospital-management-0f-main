"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, X, Plus } from "lucide-react"
import { format } from "date-fns"
import type { Visit } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { usePatients } from "@/hooks/use-patients"
import { useStaff } from "@/hooks/use-staff"
import { useBeds } from "@/hooks/use-beds"

interface VisitFormProps {
  visit?: Visit | null
  onSubmit: (visitData: any) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function VisitForm({ visit, onSubmit, onCancel, loading = false }: VisitFormProps) {
  const { user } = useAuth()
  const { patients } = usePatients()
  const { staff } = useStaff()
  const { beds, getAvailableBeds } = useBeds()

  const [formData, setFormData] = useState({
    patientId: "",
    patientName: "",
    doctorId: "",
    doctorName: "",
    doctorSpecialization: "",
    visitType: "opd" as "opd" | "ipd",
    visitDate: new Date(),
    symptoms: "",
    diagnosis: "",
    prescribedMedicines: [] as string[],
    notes: "",
    status: "active" as const,

    // IPD specific
    admissionReason: "",
    bedId: "",
    bedNumber: "",
    roomNumber: "",
    expectedDischargeDate: null as Date | null,
    assignedNurseId: "",
    assignedNurseName: "",
  })

  const [newMedicine, setNewMedicine] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const doctors = staff.filter((s) => s.role === "doctor")
  const nurses = staff.filter((s) => s.role === "nurse")
  const availableBeds = getAvailableBeds()

  useEffect(() => {
    if (visit) {
      setFormData({
        patientId: visit.patientId || "",
        patientName: visit.patientName || "",
        doctorId: visit.doctorId || "",
        doctorName: visit.doctorName || "",
        doctorSpecialization: visit.doctorSpecialization || "",
        visitType: visit.visitType || "opd",
        visitDate: visit.visitDate || new Date(),
        symptoms: visit.symptoms || "",
        diagnosis: visit.diagnosis || "",
        prescribedMedicines: visit.prescribedMedicines || [],
        notes: visit.notes || "",
        status: visit.status || "active",
        admissionReason: visit.admissionReason || "",
        bedId: visit.bedId || "",
        bedNumber: visit.bedNumber || "",
        roomNumber: visit.roomNumber || "",
        expectedDischargeDate: visit.expectedDischargeDate || null,
        assignedNurseId: visit.assignedNurseId || "",
        assignedNurseName: visit.assignedNurseName || "",
      })
    }
  }, [visit])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.patientId) newErrors.patientId = "Patient is required"
    if (!formData.doctorId) newErrors.doctorId = "Doctor is required"
    if (!formData.symptoms.trim()) newErrors.symptoms = "Symptoms are required"
    if (!formData.diagnosis.trim()) newErrors.diagnosis = "Diagnosis is required"

    if (formData.visitType === "ipd") {
      if (!formData.admissionReason.trim()) newErrors.admissionReason = "Admission reason is required"
      if (!formData.bedId) newErrors.bedId = "Bed assignment is required"
      if (!formData.expectedDischargeDate) newErrors.expectedDischargeDate = "Expected discharge date is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      await onSubmit({
        ...formData,
        createdBy: user?.uid || "",
      })
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handlePatientSelect = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId)
    if (patient) {
      handleChange("patientId", patientId)
      handleChange("patientName", `${patient.firstName} ${patient.lastName}`)
    }
  }

  const handleDoctorSelect = (doctorId: string) => {
    const doctor = doctors.find((d) => d.id === doctorId)
    if (doctor) {
      handleChange("doctorId", doctorId)
      handleChange("doctorName", `${doctor.firstName} ${doctor.lastName}`)
      handleChange("doctorSpecialization", doctor.specialization || "")
    }
  }

  const handleBedSelect = (bedId: string) => {
    const bed = beds.find((b) => b.id === bedId)
    if (bed) {
      handleChange("bedId", bedId)
      handleChange("bedNumber", bed.bedNumber)
      handleChange("roomNumber", bed.roomNumber)
    }
  }

  const handleNurseSelect = (nurseId: string) => {
    const nurse = nurses.find((n) => n.id === nurseId)
    if (nurse) {
      handleChange("assignedNurseId", nurseId)
      handleChange("assignedNurseName", `${nurse.firstName} ${nurse.lastName}`)
    }
  }

  const addMedicine = () => {
    if (newMedicine.trim() && !formData.prescribedMedicines.includes(newMedicine.trim())) {
      setFormData((prev) => ({
        ...prev,
        prescribedMedicines: [...prev.prescribedMedicines, newMedicine.trim()],
      }))
      setNewMedicine("")
    }
  }

  const removeMedicine = (medicine: string) => {
    setFormData((prev) => ({
      ...prev,
      prescribedMedicines: prev.prescribedMedicines.filter((m) => m !== medicine),
    }))
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{visit ? "Edit Visit" : "Record New Visit"}</CardTitle>
        <CardDescription>{visit ? "Update visit information" : "Record a new patient visit"}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="visitType">Visit Type *</Label>
                <Select
                  value={formData.visitType}
                  onValueChange={(value: "opd" | "ipd") => handleChange("visitType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select visit type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="opd">OPD (Outpatient)</SelectItem>
                    <SelectItem value="ipd">IPD (Inpatient)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visitDate">Visit Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(formData.visitDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.visitDate}
                      onSelect={(date) => handleChange("visitDate", date || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="patient">Patient *</Label>
                <Select value={formData.patientId} onValueChange={handlePatientSelect}>
                  <SelectTrigger className={errors.patientId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.firstName} {patient.lastName} - {patient.patientId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.patientId && <p className="text-sm text-red-500">{errors.patientId}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctor">Doctor *</Label>
                <Select value={formData.doctorId} onValueChange={handleDoctorSelect}>
                  <SelectTrigger className={errors.doctorId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.doctorId && <p className="text-sm text-red-500">{errors.doctorId}</p>}
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Medical Information</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="symptoms">Symptoms *</Label>
                <Textarea
                  id="symptoms"
                  value={formData.symptoms}
                  onChange={(e) => handleChange("symptoms", e.target.value)}
                  placeholder="Describe patient symptoms..."
                  className={errors.symptoms ? "border-red-500" : ""}
                />
                {errors.symptoms && <p className="text-sm text-red-500">{errors.symptoms}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnosis *</Label>
                <Textarea
                  id="diagnosis"
                  value={formData.diagnosis}
                  onChange={(e) => handleChange("diagnosis", e.target.value)}
                  placeholder="Enter diagnosis..."
                  className={errors.diagnosis ? "border-red-500" : ""}
                />
                {errors.diagnosis && <p className="text-sm text-red-500">{errors.diagnosis}</p>}
              </div>

              <div className="space-y-2">
                <Label>Prescribed Medicines</Label>
                <div className="flex gap-2">
                  <Input
                    value={newMedicine}
                    onChange={(e) => setNewMedicine(e.target.value)}
                    placeholder="Add medicine"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addMedicine())}
                  />
                  <Button type="button" onClick={addMedicine} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.prescribedMedicines.map((medicine) => (
                    <Badge key={medicine} variant="secondary" className="flex items-center gap-1">
                      {medicine}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeMedicine(medicine)} />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="Any additional notes..."
                />
              </div>
            </div>
          </div>

          {/* IPD Specific Fields */}
          {formData.visitType === "ipd" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">IPD Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admissionReason">Admission Reason *</Label>
                  <Textarea
                    id="admissionReason"
                    value={formData.admissionReason}
                    onChange={(e) => handleChange("admissionReason", e.target.value)}
                    placeholder="Reason for admission..."
                    className={errors.admissionReason ? "border-red-500" : ""}
                  />
                  {errors.admissionReason && <p className="text-sm text-red-500">{errors.admissionReason}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bed">Assign Bed *</Label>
                  <Select value={formData.bedId} onValueChange={handleBedSelect}>
                    <SelectTrigger className={errors.bedId ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select bed" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBeds.map((bed) => (
                        <SelectItem key={bed.id} value={bed.id}>
                          Bed {bed.bedNumber} - Room {bed.roomNumber} ({bed.ward})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.bedId && <p className="text-sm text-red-500">{errors.bedId}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedDischargeDate">Expected Discharge Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.expectedDischargeDate ? format(formData.expectedDischargeDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.expectedDischargeDate || undefined}
                        onSelect={(date) => handleChange("expectedDischargeDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.expectedDischargeDate && (
                    <p className="text-sm text-red-500">{errors.expectedDischargeDate}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assignedNurse">Assign Nurse</Label>
                  <Select value={formData.assignedNurseId} onValueChange={handleNurseSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select nurse" />
                    </SelectTrigger>
                    <SelectContent>
                      {nurses.map((nurse) => (
                        <SelectItem key={nurse.id} value={nurse.id}>
                          {nurse.firstName} {nurse.lastName} - {nurse.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : visit ? "Update Visit" : "Record Visit"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
