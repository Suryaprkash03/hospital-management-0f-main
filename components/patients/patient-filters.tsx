"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Search, Filter, X } from "lucide-react"
import type { PatientFilters } from "@/lib/types"

interface PatientFiltersProps {
  filters: PatientFilters
  onFiltersChange: (filters: PatientFilters) => void
  onClearFilters: () => void
}

export function PatientFiltersComponent({ filters, onFiltersChange, onClearFilters }: PatientFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleFilterChange = (key: keyof PatientFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const hasActiveFilters =
    filters.search ||
    filters.gender ||
    filters.bloodGroup ||
    filters.status ||
    filters.ageRange[0] > 0 ||
    filters.ageRange[1] < 100

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
            placeholder="Search by name, patient ID, or email..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-10"
          />
        </div>

        {showAdvanced && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Gender Filter */}
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={filters.gender} onValueChange={(value) => handleFilterChange("gender", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All genders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All genders</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Blood Group Filter */}
            <div className="space-y-2">
              <Label>Blood Group</Label>
              <Select value={filters.bloodGroup} onValueChange={(value) => handleFilterChange("bloodGroup", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All blood groups" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All blood groups</SelectItem>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Age Range */}
            <div className="space-y-2">
              <Label>
                Age Range: {filters.ageRange[0]} - {filters.ageRange[1]} years
              </Label>
              <Slider
                value={filters.ageRange}
                onValueChange={(value) => handleFilterChange("ageRange", value as [number, number])}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
