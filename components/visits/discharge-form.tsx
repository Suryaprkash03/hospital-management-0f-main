"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, X, Plus } from "lucide-react"
import { format } from "date-fns"
import type { Visit } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { useDischargeSummaries } from "@/hooks/use-discharge-summaries"

interface DischargeFormProps {
  visit: Visit
  onSubmit: (dischargeData: any) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function DischargeForm({ visit, onSubmit, onCancel, loading = false }: DischargeFormProps) {
  const { user } = useAuth()
  const { createDischargeSummary } = useDischargeSummaries()

  const [formData, setFormData] = useState({
    finalDiagnosis: visit.diagnosis || "",
    treatmentGiven: "",
    medicinesAtDischarge: [] as string[],
    followUpInstructions: "",
    followUpDate: null as Date | null,
    finalNotes: "",
    dischargeDate: new Date(),
  })

  const [newMedicine, setNewMedicine] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.finalDiagnosis.trim()) newErrors.finalDiagnosis = "Final diagnosis is required"
    if (!formData.treatmentGiven.trim()) newErrors.treatmentGiven = "Treatment given is required"
    if (!formData.followUpInstructions.trim()) newErrors.followUpInstructions = "Follow-up instructions are required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      // Create discharge summary
      await createDischargeSummary({
        patientId: visit.patientId,
        visitId: visit.id,
        patientName: visit.patientName,
        doctorId: visit.doctorId,
        doctorName: visit.doctorName,
        admissionDate: visit.visitDate,
        dischargeDate: formData.dischargeDate,
        finalDiagnosis: formData.finalDiagnosis,
        treatmentGiven: formData.treatmentGiven,
        medicinesAtDischarge: formData.medicinesAtDischarge,
        followUpInstructions: formData.followUpInstructions,
        followUpDate: formData.followUpDate,
        finalNotes: formData.finalNotes,
        dischargedBy: user?.uid || "",
      })

      // Update visit with discharge information
      await onSubmit({
        finalDiagnosis: formData.finalDiagnosis,
        followUpInstructions: formData.followUpInstructions,
        followUpDate: formData.followUpDate,
        followUpRequired: !!formData.followUpDate,
        notes: formData.finalNotes,
      })
    } catch (error) {
      console.error("Error processing discharge:", error)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const addMedicine = () => {
    if (newMedicine.trim() && !formData.medicinesAtDischarge.includes(newMedicine.trim())) {
      setFormData((prev) => ({
        ...prev,
        medicinesAtDischarge: [...prev.medicinesAtDischarge, newMedicine.trim()],
      }))
      setNewMedicine("")
    }
  }

  const removeMedicine = (medicine: string) => {
    setFormData((prev) => ({
      ...prev,
      medicinesAtDischarge: prev.medicinesAtDischarge.filter((m) => m !== medicine),
    }))
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Discharge Patient</CardTitle>
        <CardDescription>Complete discharge summary for {visit.patientName}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Summary */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Patient Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Patient:</span> {visit.patientName}
              </div>
              <div>
                <span className="text-muted-foreground">Doctor:</span> Dr. {visit.doctorName}
              </div>
              <div>
                <span className="text-muted-foreground">Admission Date:</span> {visit.visitDate.toLocaleDateString()}
              </div>
              <div>
                <span className="text-muted-foreground">Bed:</span> {visit.bedNumber} - Room {visit.roomNumber}
              </div>
            </div>
          </div>

          {/* Discharge Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Discharge Information</h3>

            <div className="space-y-2">
              <Label htmlFor="dischargeDate">Discharge Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.dischargeDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dischargeDate}
                    onSelect={(date) => handleChange("dischargeDate", date || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="finalDiagnosis">Final Diagnosis *</Label>
              <Textarea
                id="finalDiagnosis"
                value={formData.finalDiagnosis}
                onChange={(e) => handleChange("finalDiagnosis", e.target.value)}
                placeholder="Final diagnosis and condition at discharge..."
                className={errors.finalDiagnosis ? "border-red-500" : ""}
              />
              {errors.finalDiagnosis && <p className="text-sm text-red-500">{errors.finalDiagnosis}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="treatmentGiven">Treatment Given *</Label>
              <Textarea
                id="treatmentGiven"
                value={formData.treatmentGiven}
                onChange={(e) => handleChange("treatmentGiven", e.target.value)}
                placeholder="Summary of treatment provided during admission..."
                className={errors.treatmentGiven ? "border-red-500" : ""}
              />
              {errors.treatmentGiven && <p className="text-sm text-red-500">{errors.treatmentGiven}</p>}
            </div>

            <div className="space-y-2">
              <Label>Medicines at Discharge</Label>
              <div className="flex gap-2">
                <Input
                  value={newMedicine}
                  onChange={(e) => setNewMedicine(e.target.value)}
                  placeholder="Add discharge medicine"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addMedicine())}
                />
                <Button type="button" onClick={addMedicine} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.medicinesAtDischarge.map((medicine) => (
                  <Badge key={medicine} variant="secondary" className="flex items-center gap-1">
                    {medicine}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeMedicine(medicine)} />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="followUpInstructions">Follow-up Instructions *</Label>
              <Textarea
                id="followUpInstructions"
                value={formData.followUpInstructions}
                onChange={(e) => handleChange("followUpInstructions", e.target.value)}
                placeholder="Instructions for follow-up care, diet, activity restrictions, etc..."
                className={errors.followUpInstructions ? "border-red-500" : ""}
              />
              {errors.followUpInstructions && <p className="text-sm text-red-500">{errors.followUpInstructions}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="followUpDate">Follow-up Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.followUpDate ? format(formData.followUpDate, "PPP") : "Select follow-up date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.followUpDate || undefined}
                    onSelect={(date) => handleChange("followUpDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="finalNotes">Final Notes</Label>
              <Textarea
                id="finalNotes"
                value={formData.finalNotes}
                onChange={(e) => handleChange("finalNotes", e.target.value)}
                placeholder="Any additional notes or observations..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Processing Discharge..." : "Discharge Patient"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
