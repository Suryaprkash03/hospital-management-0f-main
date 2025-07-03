"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Eye, Edit, Trash2, MoreHorizontal, Phone } from "lucide-react"
import type { Patient } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { formatPhoneNumber } from "@/lib/patient-utils"

interface PatientTableProps {
  patients: Patient[]
  onViewPatient: (patient: Patient) => void
  onEditPatient: (patient: Patient) => void
  onDeletePatient: (patient: Patient) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function PatientTable({
  patients,
  onViewPatient,
  onEditPatient,
  onDeletePatient,
  currentPage,
  totalPages,
  onPageChange,
}: PatientTableProps) {
  const { user } = useAuth()

  const canEdit = user?.role === "admin" || user?.role === "receptionist"
  const canDelete = user?.role === "admin"

  const getStatusBadge = (status: string) => {
    return <Badge variant={status === "active" ? "default" : "secondary"}>{status}</Badge>
  }

  const getGenderBadge = (gender: string) => {
    const colors = {
      male: "bg-blue-100 text-blue-800",
      female: "bg-pink-100 text-pink-800",
      other: "bg-gray-100 text-gray-800",
    }

    return <Badge className={colors[gender as keyof typeof colors] || colors.other}>{gender}</Badge>
  }

  if (patients.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold">No patients found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Records</CardTitle>
        <CardDescription>
          Showing {patients.length} patient{patients.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Blood Group</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow
                  key={patient.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onViewPatient(patient)}
                >
                  <TableCell className="font-medium">{patient.patientId}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {patient.firstName} {patient.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">{patient.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>{getGenderBadge(patient.gender)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Phone className="h-3 w-3" />
                      {formatPhoneNumber(patient.phone)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{patient.bloodGroup}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(patient.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onViewPatient(patient)
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {canEdit && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              onEditPatient(patient)
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Patient
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {canDelete && (
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeletePatient(patient)
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Patient
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
