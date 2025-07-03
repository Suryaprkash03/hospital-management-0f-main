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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, FileText, Bed, Activity } from "lucide-react"
import { VisitSummaryCards } from "@/components/visits/visit-summary-cards"
import { VisitFiltersComponent } from "@/components/visits/visit-filters"
import { VisitTable } from "@/components/visits/visit-table"
import { VisitForm } from "@/components/visits/visit-form"
import { VisitDetails } from "@/components/visits/visit-details"
import { BedManagement } from "@/components/visits/bed-management"
import { InpatientMonitoring } from "@/components/visits/inpatient-monitoring"
import { DischargeForm } from "@/components/visits/discharge-form"
import { useVisits } from "@/hooks/use-visits"
import { useBeds } from "@/hooks/use-beds"
import { useAuth } from "@/contexts/auth-context"
import type { Visit, VisitFilters } from "@/lib/types"

const ITEMS_PER_PAGE = 10

export default function VisitsPage() {
  const { user } = useAuth()
  const {
    visits,
    loading,
    addVisit,
    updateVisit,
    deleteVisit,
    getVisitSummary,
    filterVisits,
    getActiveIPDVisits,
    dischargePatient,
  } = useVisits()
  const { getBedSummary, assignBed, freeBed } = useBeds()

  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null)
  const [showVisitForm, setShowVisitForm] = useState(false)
  const [showVisitDetails, setShowVisitDetails] = useState(false)
  const [showDischargeForm, setShowDischargeForm] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<VisitFilters>({
    search: "",
    visitType: "",
    status: "",
    doctorId: "",
    dateRange: [null, null],
    diagnosis: "",
  })

  const canCreateVisit = user?.role === "admin" || user?.role === "doctor"
  const canManageBeds = user?.role === "admin" || user?.role === "nurse"

  const visitSummary = getVisitSummary()
  const bedSummary = getBedSummary()
  const activeIPDVisits = getActiveIPDVisits()
  const filteredVisits = filterVisits(filters)

  const totalPages = Math.ceil(filteredVisits.length / ITEMS_PER_PAGE)
  const paginatedVisits = filteredVisits.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleCreateVisit = async (visitData: any) => {
    try {
      await addVisit(visitData)

      // If IPD visit, assign bed
      if (visitData.visitType === "ipd" && visitData.bedId) {
        await assignBed(visitData.bedId, visitData.patientId, visitData.patientName)
      }

      setShowVisitForm(false)
      setSelectedVisit(null)
    } catch (error) {
      console.error("Error creating visit:", error)
    }
  }

  const handleUpdateVisit = async (visitData: any) => {
    if (!selectedVisit) return

    try {
      await updateVisit(selectedVisit.id, visitData)
      setShowVisitForm(false)
      setSelectedVisit(null)
    } catch (error) {
      console.error("Error updating visit:", error)
    }
  }

  const handleDeleteVisit = async () => {
    if (!selectedVisit) return

    try {
      // If IPD visit, free the bed
      if (selectedVisit.visitType === "ipd" && selectedVisit.bedId) {
        await freeBed(selectedVisit.bedId)
      }

      await deleteVisit(selectedVisit.id)
      setShowDeleteDialog(false)
      setSelectedVisit(null)
    } catch (error) {
      console.error("Error deleting visit:", error)
    }
  }

  const handleDischargePatient = async (dischargeData: any) => {
    if (!selectedVisit) return

    try {
      // Free the bed
      if (selectedVisit.bedId) {
        await freeBed(selectedVisit.bedId)
      }

      await dischargePatient(selectedVisit.id, dischargeData)
      setShowDischargeForm(false)
      setSelectedVisit(null)
    } catch (error) {
      console.error("Error discharging patient:", error)
    }
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      visitType: "",
      status: "",
      doctorId: "",
      dateRange: [null, null],
      diagnosis: "",
    })
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600 mx-auto mb-4"></div>
            <p className="text-teal-600 font-medium">Loading visits...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Visit Management
            </h1>
            <p className="text-teal-600/70">Manage OPD and IPD patient visits</p>
          </div>
          {canCreateVisit && (
            <Button
              onClick={() => setShowVisitForm(true)}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Record Visit
            </Button>
          )}
        </div>

        {/* Summary Cards */}
        <VisitSummaryCards summary={visitSummary} />

        {/* Tabs */}
        <Tabs defaultValue="visits" className="space-y-4">
          <TabsList className="bg-white/70 backdrop-blur-sm border border-teal-200">
            <TabsTrigger
              value="visits"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white"
            >
              <FileText className="h-4 w-4" />
              All Visits
            </TabsTrigger>
            <TabsTrigger
              value="ipd"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white"
            >
              <Activity className="h-4 w-4" />
              IPD Monitoring
            </TabsTrigger>
            {canManageBeds && (
              <TabsTrigger
                value="beds"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white"
              >
                <Bed className="h-4 w-4" />
                Bed Management
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="visits" className="space-y-4">
            {/* Filters */}
            <VisitFiltersComponent filters={filters} onFiltersChange={setFilters} onClearFilters={clearFilters} />

            {/* Visits Table */}
            <VisitTable
              visits={paginatedVisits}
              onViewVisit={(visit) => {
                setSelectedVisit(visit)
                setShowVisitDetails(true)
              }}
              onEditVisit={(visit) => {
                setSelectedVisit(visit)
                setShowVisitForm(true)
              }}
              onDeleteVisit={(visit) => {
                setSelectedVisit(visit)
                setShowDeleteDialog(true)
              }}
              onDischargePatient={(visit) => {
                setSelectedVisit(visit)
                setShowDischargeForm(true)
              }}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </TabsContent>

          <TabsContent value="ipd" className="space-y-4">
            <InpatientMonitoring
              activeIPDVisits={activeIPDVisits}
              onViewVisit={(visit) => {
                setSelectedVisit(visit)
                setShowVisitDetails(true)
              }}
              onDischargePatient={(visit) => {
                setSelectedVisit(visit)
                setShowDischargeForm(true)
              }}
            />
          </TabsContent>

          {canManageBeds && (
            <TabsContent value="beds" className="space-y-4">
              <BedManagement summary={bedSummary} />
            </TabsContent>
          )}
        </Tabs>

        {/* Visit Form Dialog */}
        <Dialog open={showVisitForm} onOpenChange={setShowVisitForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-teal-200">
            <DialogHeader>
              <DialogTitle className="text-teal-700">{selectedVisit ? "Edit Visit" : "Record New Visit"}</DialogTitle>
            </DialogHeader>
            <VisitForm
              visit={selectedVisit}
              onSubmit={selectedVisit ? handleUpdateVisit : handleCreateVisit}
              onCancel={() => {
                setShowVisitForm(false)
                setSelectedVisit(null)
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Visit Details Dialog */}
        <Dialog open={showVisitDetails} onOpenChange={setShowVisitDetails}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-teal-200">
            {selectedVisit && (
              <VisitDetails
                visit={selectedVisit}
                onEdit={() => {
                  setShowVisitDetails(false)
                  setShowVisitForm(true)
                }}
                onDelete={() => {
                  setShowVisitDetails(false)
                  setShowDeleteDialog(true)
                }}
                onDischarge={() => {
                  setShowVisitDetails(false)
                  setShowDischargeForm(true)
                }}
                onClose={() => {
                  setShowVisitDetails(false)
                  setSelectedVisit(null)
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Discharge Form Dialog */}
        <Dialog open={showDischargeForm} onOpenChange={setShowDischargeForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-teal-200">
            {selectedVisit && (
              <DischargeForm
                visit={selectedVisit}
                onSubmit={handleDischargePatient}
                onCancel={() => {
                  setShowDischargeForm(false)
                  setSelectedVisit(null)
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="bg-white/95 backdrop-blur-sm border-red-200">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-700">Delete Visit</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this visit? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-gray-200">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteVisit}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
