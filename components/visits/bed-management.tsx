"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Bed, Plus, User, Wrench } from "lucide-react"
import type { BedSummary, BedFilters } from "@/lib/types"
import { getBedStatusColor } from "@/lib/visit-utils"
import { useBeds } from "@/hooks/use-beds"
import { useAuth } from "@/contexts/auth-context"

interface BedManagementProps {
  summary: BedSummary
}

export function BedManagement({ summary }: BedManagementProps) {
  const { user } = useAuth()
  const { beds, addBed, updateBed, assignBed, freeBed, filterBeds } = useBeds()

  const [filters, setFilters] = useState<BedFilters>({
    search: "",
    status: "",
    bedType: "",
    ward: "",
    roomNumber: "",
  })

  const [showAddBed, setShowAddBed] = useState(false)
  const [newBedData, setNewBedData] = useState({
    bedNumber: "",
    roomNumber: "",
    ward: "",
    bedType: "general" as const,
    status: "available" as const,
  })

  const canManageBeds = user?.role === "admin" || user?.role === "nurse"
  const filteredBeds = filterBeds(filters)

  const handleAddBed = async () => {
    try {
      await addBed(newBedData)
      setShowAddBed(false)
      setNewBedData({
        bedNumber: "",
        roomNumber: "",
        ward: "",
        bedType: "general",
        status: "available",
      })
    } catch (error) {
      console.error("Error adding bed:", error)
    }
  }

  const handleStatusChange = async (bedId: string, newStatus: string) => {
    try {
      if (newStatus === "available") {
        await freeBed(bedId)
      } else {
        await updateBed(bedId, { status: newStatus as any })
      }
    } catch (error) {
      console.error("Error updating bed status:", error)
    }
  }

  const getBedIcon = (status: string) => {
    switch (status) {
      case "occupied":
        return <User className="h-4 w-4" />
      case "maintenance":
        return <Wrench className="h-4 w-4" />
      default:
        return <Bed className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Beds</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalBeds}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.availableBeds}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied</CardTitle>
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.occupiedBeds}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{summary.maintenanceBeds}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summary.occupancyRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bed Management</CardTitle>
              <CardDescription>Manage hospital bed assignments and status</CardDescription>
            </div>
            {canManageBeds && (
              <Dialog open={showAddBed} onOpenChange={setShowAddBed}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Bed
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Bed</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bedNumber">Bed Number</Label>
                        <Input
                          id="bedNumber"
                          value={newBedData.bedNumber}
                          onChange={(e) => setNewBedData((prev) => ({ ...prev, bedNumber: e.target.value }))}
                          placeholder="B001"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="roomNumber">Room Number</Label>
                        <Input
                          id="roomNumber"
                          value={newBedData.roomNumber}
                          onChange={(e) => setNewBedData((prev) => ({ ...prev, roomNumber: e.target.value }))}
                          placeholder="101"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ward">Ward</Label>
                        <Input
                          id="ward"
                          value={newBedData.ward}
                          onChange={(e) => setNewBedData((prev) => ({ ...prev, ward: e.target.value }))}
                          placeholder="General Ward"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bedType">Bed Type</Label>
                        <Select
                          value={newBedData.bedType}
                          onValueChange={(value: any) => setNewBedData((prev) => ({ ...prev, bedType: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                            <SelectItem value="icu">ICU</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowAddBed(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddBed}>Add Bed</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Input
              placeholder="Search beds..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            />
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.bedType}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, bedType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="icu">ICU</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Ward..."
              value={filters.ward}
              onChange={(e) => setFilters((prev) => ({ ...prev, ward: e.target.value }))}
            />
            <Input
              placeholder="Room..."
              value={filters.roomNumber}
              onChange={(e) => setFilters((prev) => ({ ...prev, roomNumber: e.target.value }))}
            />
          </div>

          {/* Bed Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBeds.map((bed) => (
              <Card key={bed.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Bed {bed.bedNumber}</CardTitle>
                    <Badge className={getBedStatusColor(bed.status)}>
                      {getBedIcon(bed.status)}
                      <span className="ml-1 capitalize">{bed.status}</span>
                    </Badge>
                  </div>
                  <CardDescription>
                    Room {bed.roomNumber} • {bed.ward}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Type:</span> {bed.bedType}
                    </div>
                    {bed.assignedPatientName && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Patient:</span> {bed.assignedPatientName}
                      </div>
                    )}
                    {bed.assignedDate && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Since:</span> {bed.assignedDate.toLocaleDateString()}
                      </div>
                    )}
                    {canManageBeds && (
                      <div className="pt-2">
                        <Select value={bed.status} onValueChange={(value) => handleStatusChange(bed.id, value)}>
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="occupied">Occupied</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="reserved">Reserved</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
