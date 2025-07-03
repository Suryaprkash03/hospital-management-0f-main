"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Clock, Save, X } from "lucide-react"
import type { StaffMember } from "@/lib/types"
import { useStaffSchedule } from "@/hooks/use-staff"
import { formatTime } from "@/lib/staff-utils"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, deleteDoc, addDoc } from "firebase/firestore"

interface ScheduleManagerProps {
  staff: StaffMember
  onClose: () => void
}

interface ScheduleItem {
  dayOfWeek: number
  startTime: string
  endTime: string
  isAvailable: boolean
  notes?: string
}

export function ScheduleManager({ staff, onClose }: ScheduleManagerProps) {
  const { schedule, loading, updateSchedule } = useStaffSchedule(staff.id)
  const [scheduleData, setScheduleData] = useState<ScheduleItem[]>([])
  const [saving, setSaving] = useState(false)

  const daysOfWeek = [
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
    { value: 0, label: "Sunday" },
  ]

  useEffect(() => {
    // Initialize schedule data
    const initialData = daysOfWeek.map((day) => {
      const existingSchedule = schedule.find((s) => s.dayOfWeek === day.value)
      return {
        dayOfWeek: day.value,
        startTime: existingSchedule?.startTime || "09:00",
        endTime: existingSchedule?.endTime || "17:00",
        isAvailable: existingSchedule?.isAvailable || false,
        notes: existingSchedule?.notes || "",
      }
    })
    setScheduleData(initialData)
  }, [schedule])

  const handleScheduleChange = (dayOfWeek: number, field: keyof ScheduleItem, value: any) => {
    setScheduleData((prev) => prev.map((item) => (item.dayOfWeek === dayOfWeek ? { ...item, [field]: value } : item)))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Delete existing schedules for this staff member
      const existingQuery = query(collection(db, "staffSchedules"), where("staffId", "==", staff.id))
      const existingSnapshot = await getDocs(existingQuery)

      // Delete existing schedules
      for (const doc of existingSnapshot.docs) {
        await deleteDoc(doc.ref)
      }

      // Add new schedules
      const scheduleToSave = scheduleData
        .filter((item) => item.isAvailable)
        .map((item) => ({
          staffId: staff.id,
          dayOfWeek: item.dayOfWeek,
          startTime: item.startTime,
          endTime: item.endTime,
          isAvailable: item.isAvailable,
          notes: item.notes,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))

      for (const schedule of scheduleToSave) {
        await addDoc(collection(db, "staffSchedules"), schedule)
      }

      onClose()
    } catch (error) {
      console.error("Error saving schedule:", error)
    } finally {
      setSaving(false)
    }
  }

  const toggleAllDays = (available: boolean) => {
    setScheduleData((prev) => prev.map((item) => ({ ...item, isAvailable: available })))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule Management</h1>
          <p className="text-muted-foreground">
            Configure weekly schedule for {staff.firstName} {staff.lastName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => toggleAllDays(true)} size="sm">
            Enable All
          </Button>
          <Button variant="outline" onClick={() => toggleAllDays(false)} size="sm">
            Disable All
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Schedule"}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Weekly Availability
          </CardTitle>
          <CardDescription>Set the working hours for each day of the week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {daysOfWeek.map((day) => {
              const daySchedule = scheduleData.find((s) => s.dayOfWeek === day.value)
              if (!daySchedule) return null

              return (
                <div key={day.value} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 min-w-[120px]">
                    <Checkbox
                      id={`day-${day.value}`}
                      checked={daySchedule.isAvailable}
                      onCheckedChange={(checked) => handleScheduleChange(day.value, "isAvailable", checked)}
                    />
                    <Label htmlFor={`day-${day.value}`} className="font-medium">
                      {day.label}
                    </Label>
                  </div>

                  {daySchedule.isAvailable && (
                    <>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`start-${day.value}`} className="text-sm">
                          Start:
                        </Label>
                        <Input
                          id={`start-${day.value}`}
                          type="time"
                          value={daySchedule.startTime}
                          onChange={(e) => handleScheduleChange(day.value, "startTime", e.target.value)}
                          className="w-32"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Label htmlFor={`end-${day.value}`} className="text-sm">
                          End:
                        </Label>
                        <Input
                          id={`end-${day.value}`}
                          type="time"
                          value={daySchedule.endTime}
                          onChange={(e) => handleScheduleChange(day.value, "endTime", e.target.value)}
                          className="w-32"
                        />
                      </div>

                      <div className="flex-1">
                        <Input
                          placeholder="Notes (optional)"
                          value={daySchedule.notes}
                          onChange={(e) => handleScheduleChange(day.value, "notes", e.target.value)}
                        />
                      </div>

                      <Badge variant="outline">
                        {formatTime(daySchedule.startTime)} - {formatTime(daySchedule.endTime)}
                      </Badge>
                    </>
                  )}

                  {!daySchedule.isAvailable && (
                    <div className="flex-1">
                      <Badge variant="secondary">Not Available</Badge>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ScheduleManager
