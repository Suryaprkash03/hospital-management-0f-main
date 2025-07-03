"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import type { VisitFilters } from "@/lib/types"
import { useStaff } from "@/hooks/use-staff"

interface VisitFiltersComponentProps {
  filters: VisitFilters
  onFiltersChange: (filters: VisitFilters) => void
  onClearFilters: () => void
}

export function VisitFiltersComponent({ filters, onFiltersChange, onClearFilters }: VisitFiltersComponentProps) {
  const { staff } = useStaff()
  const doctors = staff.filter((s) => s.role === "doctor")

  const handleFilterChange = (key: keyof VisitFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const handleDateRangeChange = (index: 0 | 1, date: Date | null) => {
    const newDateRange = [...filters.dateRange] as [Date | null, Date | null]
    newDateRange[index] = date
    handleFilterChange("dateRange", newDateRange)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter Visits</CardTitle>
        <CardDescription>Filter visits by various criteria</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Patient name, visit ID, doctor..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="visitType">Visit Type</Label>
            <Select value={filters.visitType} onValueChange={(value) => handleFilterChange("visitType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="opd">OPD</SelectItem>
                <SelectItem value="ipd">IPD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="discharged">Discharged</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="doctor">Doctor</Label>
            <Select value={filters.doctorId} onValueChange={(value) => handleFilterChange("doctorId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="All doctors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Doctors</SelectItem>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    Dr. {doctor.firstName} {doctor.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Input
              id="diagnosis"
              placeholder="Search diagnosis..."
              value={filters.diagnosis}
              onChange={(e) => handleFilterChange("diagnosis", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>From Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange[0] ? format(filters.dateRange[0], "PPP") : "Select date"}
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
            <Label>To Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange[1] ? format(filters.dateRange[1], "PPP") : "Select date"}
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

          <div className="flex items-end">
            <Button variant="outline" onClick={onClearFilters} className="w-full">
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
