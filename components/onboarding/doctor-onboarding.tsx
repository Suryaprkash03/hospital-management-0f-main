"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuth } from "@/contexts/auth-context"

const timeSlots = [
  "09:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "12:00-13:00",
  "14:00-15:00",
  "15:00-16:00",
  "16:00-17:00",
  "17:00-18:00",
]

const specializations = [
  "Cardiology",
  "Dermatology",
  "Emergency Medicine",
  "Family Medicine",
  "Internal Medicine",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Radiology",
  "Surgery",
  "Urology",
]

export function DoctorOnboarding() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    specialization: "",
    department: "",
    availableSlots: [] as string[],
  })
  const [loading, setLoading] = useState(false)
  const { updateProfile } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateProfile({
        ...formData,
        profileCompleted: true,
      })
      router.push("/dashboard")
    } catch (error) {
      // Error handled in context
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSlotChange = (slot: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      availableSlots: checked ? [...prev.availableSlots, slot] : prev.availableSlots.filter((s) => s !== slot),
    }))
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Complete Your Profile</CardTitle>
        <CardDescription>Please provide your information to complete your doctor profile</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialization">Specialization</Label>
            <Select value={formData.specialization} onValueChange={(value) => handleChange("specialization", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select specialization" />
              </SelectTrigger>
              <SelectContent>
                {specializations.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => handleChange("department", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Available Time Slots</Label>
            <div className="grid grid-cols-2 gap-2">
              {timeSlots.map((slot) => (
                <div key={slot} className="flex items-center space-x-2">
                  <Checkbox
                    id={slot}
                    checked={formData.availableSlots.includes(slot)}
                    onCheckedChange={(checked) => handleSlotChange(slot, checked as boolean)}
                  />
                  <Label htmlFor={slot} className="text-sm">
                    {slot}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <LoadingSpinner size="sm" /> : "Complete Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
