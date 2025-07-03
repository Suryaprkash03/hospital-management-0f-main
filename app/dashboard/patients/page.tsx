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
import { Plus } from "lucide-react"
import { PatientSummaryCards } from "@/components/patients/patient-summary-cards"
import { PatientFiltersComponent } from "@/components/patients/patient-filters"
import { PatientTable } from "@/components/patients/patient-table"
import { PatientForm } from "@/components/patients/patient-form"
import { PatientProfile } from "@/components/patients/patient-profile"
import { ExportPatients } from "@/components/patients/export-patients"
import { usePatients } from "@/hooks/use-patients"
import { useAuth } from "@/contexts/auth-context"
import type { Patient, PatientFilters } from "@/lib/types"

const ITEMS_PER_PAGE = 10

export default function PatientsPage() {
  const { user } = useAuth()
  const { patients, loading, addPatient, updatePatient, deletePatient, getPatientSummary, filterPatients } =
    usePatients()

  const [filters, setFilters] = useState<PatientFilters>({
    search: "",
    gender: "",
    bloodGroup: "",
    ageRange: [0, 100],
    status: "",
  })

  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [showProfile, setShowProfile] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  const canAdd = user?.role === "admin" || user?.role === "receptionist"

  // Filter and paginate patients
  const filteredPatients = filterPatients(filters)
  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE)
  const paginatedPatients = filteredPatients.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const summary = getPatientSummary()

  const handleAddPatient = () => {
    setEditingPatient(null)
    setShowForm(true)
  }

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient)
    setShowForm(true)
    setShowProfile(false)
  }

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setShowProfile(true)
  }

  const handleDeletePatient = (patient: Patient) => {
    setPatientToDelete(patient)
    setShowDeleteDialog(true)
    setShowProfile(false)
  }

  const confirmDelete = async () => {
    if (patientToDelete) {
      try {
        await deletePatient(patientToDelete.id)
        setShowDeleteDialog(false)
        setPatientToDelete(null)
      } catch (error) {
        console.error("Error deleting patient:", error)
      }
    }
  }

  const handleFormSubmit = async (patientData: any) => {
    setFormLoading(true)
    try {
      if (editingPatient) {
        await updatePatient(editingPatient.id, patientData)
      } else {
        await addPatient(patientData)
      }
      setShowForm(false)
      setEditingPatient(null)
    } catch (error) {
      console.error("Error saving patient:", error)
    } finally {
      setFormLoading(false)
    }
  }

  const handleClearFilters = () => {
    setFilters({
      search: "",
      gender: "",
      bloodGroup: "",
      ageRange: [0, 100],
      status: "",
    })
    setCurrentPage(1)
  }

  const handleFiltersChange = (newFilters: PatientFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading patients...</p>
        </div>
      </div>
    )
  }

  if (showProfile && selectedPatient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <PatientProfile
          patient={selectedPatient}
          onEdit={() => handleEditPatient(selectedPatient)}
          onDelete={() => handleDeletePatient(selectedPatient)}
          onClose={() => setShowProfile(false)}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Patient Management
            </h1>
            <p className="text-slate-600 mt-1">Manage patient records and information</p>
          </div>
          <div className="flex items-center gap-3">
            <ExportPatients patients={filteredPatients} />
            {canAdd && (
              <Button
                onClick={handleAddPatient}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Patient
              </Button>
            )}
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 shadow-elegant-lg p-6">
          <PatientSummaryCards summary={summary} />
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 shadow-elegant-lg p-6">
          <PatientFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 shadow-elegant-lg">
          <PatientTable
            patients={paginatedPatients}
            onViewPatient={handleViewPatient}
            onEditPatient={handleEditPatient}
            onDeletePatient={handleDeletePatient}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Add/Edit Patient Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {editingPatient ? "Edit Patient" : "Add New Patient"}
              </DialogTitle>
            </DialogHeader>
            <PatientForm
              patient={editingPatient}
              onSubmit={handleFormSubmit}
              onCancel={() => setShowForm(false)}
              loading={formLoading}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="bg-white/95 backdrop-blur-sm">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-600">Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the patient record for{" "}
                <strong className="text-slate-900">
                  {patientToDelete?.firstName} {patientToDelete?.lastName}
                </strong>{" "}
                and remove all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              >
                Delete Patient
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
