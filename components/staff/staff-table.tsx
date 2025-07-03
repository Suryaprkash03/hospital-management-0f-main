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
import { Eye, Edit, Trash2, MoreHorizontal, Phone, Calendar, KeyRound } from "lucide-react"
import type { StaffMember } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { formatStaffName, getStatusColor, getRoleColor } from "@/lib/staff-utils"
import { toast } from "sonner"

interface StaffTableProps {
  staff?: StaffMember[]
  data?: StaffMember[]
  onViewStaff?: (staff: StaffMember) => void
  onEditStaff?: (staff: StaffMember) => void
  onDeleteStaff?: (staff: StaffMember) => void
  onManageSchedule?: (staff: StaffMember) => void
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
}

export function StaffTable({
  staff,
  data,
  onViewStaff,
  onEditStaff,
  onDeleteStaff,
  onManageSchedule,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: StaffTableProps) {
  const { user } = useAuth()

  // Ensure we always pass an array to the table instance
  const tableData = staff ?? data ?? []

  const canEdit = user?.role === "admin"
  const canDelete = user?.role === "admin"
  const canManageSchedule = user?.role === "admin"

  const handlePasswordReset = async (staffMember: StaffMember) => {
    try {
      const response = await fetch("/api/admin/reset-staff-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          staffId: staffMember.id,
          email: staffMember.email,
          newPassword: "TempPass123!", // You can make this configurable
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to reset password")
      }

      toast.success(
        `Password reset successfully for ${formatStaffName(staffMember.firstName, staffMember.lastName, staffMember.role)}`,
      )
    } catch (error) {
      console.error("Password reset error:", error)
      toast.error("Failed to reset password")
    }
  }

  const handleViewStaff = (staffMember: StaffMember) => {
    if (onViewStaff) {
      onViewStaff(staffMember)
    } else {
      toast.info(
        `Viewing profile for ${formatStaffName(staffMember.firstName, staffMember.lastName, staffMember.role)}`,
      )
    }
  }

  const handleEditStaff = (staffMember: StaffMember) => {
    if (onEditStaff) {
      onEditStaff(staffMember)
    } else {
      toast.info(`Editing ${formatStaffName(staffMember.firstName, staffMember.lastName, staffMember.role)}`)
    }
  }

  const handleDeleteStaff = (staffMember: StaffMember) => {
    if (onDeleteStaff) {
      onDeleteStaff(staffMember)
    } else {
      toast.error(`Delete action for ${formatStaffName(staffMember.firstName, staffMember.lastName, staffMember.role)}`)
    }
  }

  const handleManageSchedule = (staffMember: StaffMember) => {
    if (onManageSchedule) {
      onManageSchedule(staffMember)
    } else {
      toast.info(
        `Managing schedule for ${formatStaffName(staffMember.firstName, staffMember.lastName, staffMember.role)}`,
      )
    }
  }

  if (tableData.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold">No staff members found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Directory</CardTitle>
        <CardDescription>
          Showing {tableData.length} staff member{tableData.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((member) => (
                <TableRow
                  key={member.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleViewStaff(member)}
                >
                  <TableCell className="font-medium">{member.staffId || member.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {formatStaffName(member.firstName, member.lastName, member.role)}
                      </div>
                      <div className="text-sm text-muted-foreground">{member.email}</div>
                      {member.specialization && (
                        <div className="text-xs text-muted-foreground">{member.specialization}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(member.role)}>{member.role.replace("_", " ")}</Badge>
                  </TableCell>
                  <TableCell>{member.department}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Phone className="h-3 w-3" />
                      {member.phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(member.status)}>{member.status.replace("_", " ")}</Badge>
                  </TableCell>
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
                            handleViewStaff(member)
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Profile
                        </DropdownMenuItem>
                        {canManageSchedule && (member.role === "doctor" || member.role === "nurse") && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              handleManageSchedule(member)
                            }}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            Manage Schedule
                          </DropdownMenuItem>
                        )}
                        {canEdit && (
                          <>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditStaff(member)
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Staff
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handlePasswordReset(member)
                              }}
                            >
                              <KeyRound className="mr-2 h-4 w-4" />
                              Reset Password
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        {canDelete && (
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteStaff(member)
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Staff
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
                onClick={() => onPageChange?.(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(currentPage + 1)}
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

export default StaffTable
