"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, Filter, X, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import type { AppointmentFilters } from "@/lib/types"
import { useStaff } from "@/hooks/use-staff"
import { usePatients } from "@/hooks/use-patients"
import { appointmentStatuses } from "@/lib/appointment-utils"
import { specializations } from "@/lib/staff-utils"

interface AppointmentFiltersProps {
  filters: AppointmentFilters
  onFiltersChange: (filters: AppointmentFilters) => void
  onClearFilters: () => void
}

export function AppointmentFiltersComponent({ filters, onFiltersChange, onClearFilters }: AppointmentFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const { staff } = useStaff()
  const { patients } = usePatients()

  const doctors = staff.filter((member) => member.role === "doctor" && member.status === "active")

  const handleFilterChange = (key: keyof AppointmentFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const handleDateRangeChange = (index: 0 | 1, date: Date | null) => {
    const newDateRange = [...filters.dateRange] as [Date | null, Date | null]
    newDateRange[index] = date
    handleFilterChange("dateRange", newDateRange)
  }

  const hasActiveFilters =
    filters.search ||
    filters.doctorId ||
    filters.patientId ||
    filters.status ||
    filters.specialization ||
    filters.dateRange[0] ||
    filters.dateRange[1]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowAdvanced(!showAdvanced)}>
              {showAdvanced ? "Simple" : "Advanced"}
            </Button>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={onClearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by patient name, doctor name, or appointment ID..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-10"
          />
        </div>

        {showAdvanced && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Doctor Filter */}
            <div className="space-y-2">
              <Label>Doctor</Label>
              <Select value={filters.doctorId} onValueChange={(value) => handleFilterChange("doctorId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All doctors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All doctors</SelectItem>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Patient Filter */}
            <div className="space-y-2">
              <Label>Patient</Label>
              <Select value={filters.patientId} onValueChange={(value) => handleFilterChange("patientId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All patients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All patients</SelectItem>
                  {patients.slice(0, 50).map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName} - {patient.patientId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {appointmentStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Specialization Filter */}
            <div className="space-y-2">
              <Label>Specialization</Label>
              <Select
                value={filters.specialization}
                onValueChange={(value) => handleFilterChange("specialization", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All specializations" />
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

            {/* Date Range */}
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange[0] ? format(filters.dateRange[0], "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange[0] || undefined}
                    onSelect={(date) => handleDateRangeChange(0, date || null)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange[1] ? format(filters.dateRange[1], "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange[1] || undefined}
                    onSelect={(date) => handleDateRangeChange(1, date || null)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
