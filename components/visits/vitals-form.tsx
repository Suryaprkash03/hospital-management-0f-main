"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { validateVitals } from "@/lib/visit-utils"

interface VitalsFormProps {
  onSubmit: (vitalsData: any) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function VitalsForm({ onSubmit, onCancel, loading = false }: VitalsFormProps) {
  const [formData, setFormData] = useState({
    bloodPressure: "",
    temperature: "",
    heartRate: "",
    respiratoryRate: "",
    oxygenSaturation: "",
    weight: "",
    height: "",
    notes: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Convert string values to numbers where appropriate
    const vitalsData = {
      ...formData,
      temperature: formData.temperature ? Number.parseFloat(formData.temperature) : undefined,
      heartRate: formData.heartRate ? Number.parseInt(formData.heartRate) : undefined,
      respiratoryRate: formData.respiratoryRate ? Number.parseInt(formData.respiratoryRate) : undefined,
      oxygenSaturation: formData.oxygenSaturation ? Number.parseInt(formData.oxygenSaturation) : undefined,
      weight: formData.weight ? Number.parseFloat(formData.weight) : undefined,
      height: formData.height ? Number.parseFloat(formData.height) : undefined,
    }

    const validationErrors = validateVitals(vitalsData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      await onSubmit(vitalsData)
    } catch (error) {
      console.error("Error submitting vitals:", error)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bloodPressure">Blood Pressure</Label>
          <Input
            id="bloodPressure"
            value={formData.bloodPressure}
            onChange={(e) => handleChange("bloodPressure", e.target.value)}
            placeholder="120/80"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="temperature">Temperature (°F)</Label>
          <Input
            id="temperature"
            type="number"
            step="0.1"
            value={formData.temperature}
            onChange={(e) => handleChange("temperature", e.target.value)}
            placeholder="98.6"
            className={errors.temperature ? "border-red-500" : ""}
          />
          {errors.temperature && <p className="text-sm text-red-500">{errors.temperature}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
          <Input
            id="heartRate"
            type="number"
            value={formData.heartRate}
            onChange={(e) => handleChange("heartRate", e.target.value)}
            placeholder="72"
            className={errors.heartRate ? "border-red-500" : ""}
          />
          {errors.heartRate && <p className="text-sm text-red-500">{errors.heartRate}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="respiratoryRate">Respiratory Rate (breaths/min)</Label>
          <Input
            id="respiratoryRate"
            type="number"
            value={formData.respiratoryRate}
            onChange={(e) => handleChange("respiratoryRate", e.target.value)}
            placeholder="16"
            className={errors.respiratoryRate ? "border-red-500" : ""}
          />
          {errors.respiratoryRate && <p className="text-sm text-red-500">{errors.respiratoryRate}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="oxygenSaturation">Oxygen Saturation (%)</Label>
          <Input
            id="oxygenSaturation"
            type="number"
            value={formData.oxygenSaturation}
            onChange={(e) => handleChange("oxygenSaturation", e.target.value)}
            placeholder="98"
            className={errors.oxygenSaturation ? "border-red-500" : ""}
          />
          {errors.oxygenSaturation && <p className="text-sm text-red-500">{errors.oxygenSaturation}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            value={formData.weight}
            onChange={(e) => handleChange("weight", e.target.value)}
            placeholder="70.5"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="height">Height (cm)</Label>
          <Input
            id="height"
            type="number"
            step="0.1"
            value={formData.height}
            onChange={(e) => handleChange("height", e.target.value)}
            placeholder="175.0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          placeholder="Any additional observations..."
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Recording..." : "Record Vitals"}
        </Button>
      </div>
    </form>
  )
}
