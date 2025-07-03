"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Eye, Edit, Trash2, MoreHorizontal, FileText } from "lucide-react"
import type { Visit } from "@/lib/types"
import { getVisitStatusColor, getVisitTypeColor, calculateLengthOfStay } from "@/lib/visit-utils"
import { useAuth } from "@/contexts/auth-context"

interface VisitTableProps {
  visits: Visit[]
  onViewVisit: (visit: Visit) => void
  onEditVisit: (visit: Visit) => void
  onDeleteVisit: (visit: Visit) => void
  onDischargePatient?: (visit: Visit) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function VisitTable({
  visits,
  onViewVisit,
  onEditVisit,
  onDeleteVisit,
  onDischargePatient,
  currentPage,
  totalPages,
  onPageChange,
}: VisitTableProps) {
  const { user } = useAuth()

  const canEdit = user?.role === "admin" || user?.role === "doctor"
  const canDelete = user?.role === "admin"
  const canDischarge = user?.role === "admin" || user?.role === "doctor"

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Visit ID</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Diagnosis</TableHead>
              <TableHead>Bed</TableHead>
              <TableHead>Length of Stay</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visits.map((visit) => (
              <TableRow key={visit.id}>
                <TableCell className="font-medium">{visit.visitId}</TableCell>
                <TableCell>{visit.patientName}</TableCell>
                <TableCell>Dr. {visit.doctorName}</TableCell>
                <TableCell>
                  <Badge className={getVisitTypeColor(visit.visitType)}>{visit.visitType.toUpperCase()}</Badge>
                </TableCell>
                <TableCell>{visit.visitDate.toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge className={getVisitStatusColor(visit.status)}>{visit.status}</Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate">{visit.diagnosis}</TableCell>
                <TableCell>
                  {visit.visitType === "ipd" && visit.bedNumber ? (
                    <span>Bed {visit.bedNumber}</span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {visit.visitType === "ipd" ? (
                    <span>{calculateLengthOfStay(visit.visitDate, visit.actualDischargeDate)} days</span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewVisit(visit)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {canEdit && (
                        <DropdownMenuItem onClick={() => onEditVisit(visit)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Visit
                        </DropdownMenuItem>
                      )}
                      {canDischarge && visit.visitType === "ipd" && visit.status === "active" && (
                        <DropdownMenuItem onClick={() => onDischargePatient?.(visit)}>
                          <FileText className="mr-2 h-4 w-4" />
                          Discharge Patient
                        </DropdownMenuItem>
                      )}
                      {canDelete && (
                        <DropdownMenuItem onClick={() => onDeleteVisit(visit)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Visit
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
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
