"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Search, Clock } from "lucide-react"
import { StaffSummaryCards } from "@/components/staff/staff-summary-cards"
import { StaffFiltersComponent } from "@/components/staff/staff-filters"
import { StaffTable } from "@/components/staff/staff-table"
import { StaffForm } from "@/components/staff/staff-form"
import { StaffProfile } from "@/components/staff/staff-profile"
import { ScheduleManager } from "@/components/staff/schedule-manager"
import { DoctorFinder } from "@/components/staff/doctor-finder"
import { PasswordResetRequests } from "@/components/admin/password-reset-requests"
import { useStaff } from "@/hooks/use-staff"
import { useAuth } from "@/contexts/auth-context"
import type { StaffMember, StaffFilters } from "@/lib/types"

const ITEMS_PER_PAGE = 10

export default function StaffPage() {
  const { user } = useAuth()
  const { staff, loading, addStaffMember, updateStaffMember, deleteStaffMember, getStaffSummary, filterStaff } =
    useStaff()

  const [filters, setFilters] = useState<StaffFilters>({
    search: "",
    role: "",
    department: "",
    status: "",
    specialization: "",
  })

  const [currentPage, setCurrentPage] = useState(1)
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)
  const [showProfile, setShowProfile] = useState(false)
  const [showScheduleManager, setShowScheduleManager] = useState(false)
  const [showDoctorFinder, setShowDoctorFinder] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [showResetRequests, setShowResetRequests] = useState(false)

  const canAdd = user?.role === "admin"
  const canViewDoctorFinder = user?.role === "receptionist" || user?.role === "admin"
  const isAdmin = user?.role === "admin"

  // Filter and paginate staff
  const filteredStaff = filterStaff(filters)
  const totalPages = Math.ceil(filteredStaff.length / ITEMS_PER_PAGE)
  const paginatedStaff = filteredStaff.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const summary = getStaffSummary()

  const handleAddStaff = () => {
    setEditingStaff(null)
    setShowForm(true)
  }

  const handleEditStaff = (staff: StaffMember) => {
    setEditingStaff(staff)
    setShowForm(true)
    setShowProfile(false)
  }

  const handleViewStaff = (staff: StaffMember) => {
    setSelectedStaff(staff)
    setShowProfile(true)
  }

  const handleDeleteStaff = (staff: StaffMember) => {
    setStaffToDelete(staff)
    setShowDeleteDialog(true)
    setShowProfile(false)
  }

  const handleManageSchedule = (staff: StaffMember) => {
    setSelectedStaff(staff)
    setShowScheduleManager(true)
    setShowProfile(false)
  }

  const confirmDelete = async () => {
    if (staffToDelete) {
      try {
        await deleteStaffMember(staffToDelete.id)
        setShowDeleteDialog(false)
        setStaffToDelete(null)
      } catch (error) {
        console.error("Error deleting staff member:", error)
      }
    }
  }

  const handleFormSubmit = async (staffData: any) => {
    setFormLoading(true)
    try {
      if (editingStaff) {
        await updateStaffMember(editingStaff.id, staffData)
      } else {
        // For new staff with password, use the admin API
        if (staffData.password && isAdmin) {
          const response = await fetch("/api/admin/create-staff", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(staffData),
          })

          if (!response.ok) {
            throw new Error("Failed to create staff account")
          }

          const result = await response.json()
          console.log("Staff account created:", result)
        } else {
          // Regular staff record creation
          await addStaffMember(staffData)
        }
      }
      setShowForm(false)
      setEditingStaff(null)
    } catch (error) {
      console.error("Error saving staff member:", error)
    } finally {
      setFormLoading(false)
    }
  }

  const handleClearFilters = () => {
    setFilters({
      search: "",
      role: "",
      department: "",
      status: "",
      specialization: "",
    })
    setCurrentPage(1)
  }

  const handleFiltersChange = (newFilters: StaffFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
            <p className="text-purple-600 font-medium">Loading staff...</p>
          </div>
        </div>
      </div>
    )
  }

  if (showProfile && selectedStaff) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50">
        <StaffProfile
          staff={selectedStaff}
          onEdit={() => handleEditStaff(selectedStaff)}
          onDelete={() => handleDeleteStaff(selectedStaff)}
          onManageSchedule={() => handleManageSchedule(selectedStaff)}
          onClose={() => setShowProfile(false)}
        />
      </div>
    )
  }

  if (showScheduleManager && selectedStaff) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50">
        <ScheduleManager staff={selectedStaff} onClose={() => setShowScheduleManager(false)} />
      </div>
    )
  }

  if (showDoctorFinder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50">
        <DoctorFinder />
      </div>
    )
  }

  if (showResetRequests) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                Password Reset Requests
              </h1>
              <p className="text-purple-600/70">Manage staff password reset requests</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowResetRequests(false)}
              className="border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              Back to Staff
            </Button>
          </div>
          <PasswordResetRequests />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              Staff Management
            </h1>
            <p className="text-purple-600/70">Manage hospital staff and their information</p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button
                variant="outline"
                onClick={() => setShowResetRequests(true)}
                className="border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                <Clock className="h-4 w-4 mr-2" />
                Reset Requests
              </Button>
            )}
            {canViewDoctorFinder && (
              <Button
                variant="outline"
                onClick={() => setShowDoctorFinder(true)}
                className="border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                <Search className="h-4 w-4 mr-2" />
                Doctor Finder
              </Button>
            )}
            {canAdd && (
              <Button
                onClick={handleAddStaff}
                className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Staff
              </Button>
            )}
          </div>
        </div>

        <StaffSummaryCards summary={summary} />

        <StaffFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />

        <StaffTable
          staff={paginatedStaff}
          onViewStaff={handleViewStaff}
          onEditStaff={handleEditStaff}
          onDeleteStaff={handleDeleteStaff}
          onManageSchedule={handleManageSchedule}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

        {/* Add/Edit Staff Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-purple-200">
            <DialogHeader>
              <DialogTitle className="text-purple-700">
                {editingStaff ? "Edit Staff Member" : "Add New Staff Member"}
              </DialogTitle>
            </DialogHeader>
            <StaffForm
              staff={editingStaff}
              onSubmit={handleFormSubmit}
              onCancel={() => setShowForm(false)}
              loading={formLoading}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="bg-white/95 backdrop-blur-sm border-red-200">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-700">Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the staff record for{" "}
                <strong>
                  {staffToDelete?.firstName} {staffToDelete?.lastName}
                </strong>{" "}
                and remove all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-gray-200">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              >
                Delete Staff
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
