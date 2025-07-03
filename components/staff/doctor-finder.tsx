"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Stethoscope, Phone, Mail, Calendar } from "lucide-react"
import { useStaff } from "@/hooks/use-staff"
import { specializations, formatStaffName, getStatusColor } from "@/lib/staff-utils"
import type { StaffMember } from "@/lib/types"

export function DoctorFinder() {
  const { staff } = useStaff()
  const [searchSpecialization, setSearchSpecialization] = useState("")
  const [searchName, setSearchName] = useState("")
  const [results, setResults] = useState<StaffMember[]>([])

  const doctors = staff.filter((member) => member.role === "doctor" && member.status === "active")

  const handleSearch = () => {
    let filteredDoctors = doctors

    if (searchSpecialization) {
      filteredDoctors = filteredDoctors.filter((doctor) => doctor.specialization === searchSpecialization)
    }

    if (searchName) {
      filteredDoctors = filteredDoctors.filter((doctor) =>
        `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(searchName.toLowerCase()),
      )
    }

    setResults(filteredDoctors)
  }

  const clearSearch = () => {
    setSearchSpecialization("")
    setSearchName("")
    setResults([])
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Doctor Finder</h1>
        <p className="text-muted-foreground">Find doctors by specialization and availability</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search Doctors
          </CardTitle>
          <CardDescription>Search for doctors by name or specialization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Select value={searchSpecialization} onValueChange={setSearchSpecialization}>
                <SelectTrigger>
                  <SelectValue placeholder="Select specialization" />
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
              <Label htmlFor="doctorName">Doctor Name</Label>
              <Input
                id="doctorName"
                placeholder="Search by name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={handleSearch} className="flex-1">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button variant="outline" onClick={clearSearch}>
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>Found {results.length} doctor(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {results.map((doctor) => (
                <Card key={doctor.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Stethoscope className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">
                          {formatStaffName(doctor.firstName, doctor.lastName, doctor.role)}
                        </h3>
                        <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                      </div>
                      <Badge className={getStatusColor(doctor.status)}>{doctor.status}</Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span>{doctor.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span>{doctor.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>{doctor.department}</span>
                      </div>
                    </div>

                    {doctor.consultationFee && (
                      <div className="pt-2 border-t">
                        <p className="text-sm font-medium">Consultation Fee: ${doctor.consultationFee}</p>
                      </div>
                    )}

                    {doctor.experience && (
                      <div className="text-sm text-muted-foreground">{doctor.experience} years of experience</div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {results.length === 0 && (searchSpecialization || searchName) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No doctors found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
