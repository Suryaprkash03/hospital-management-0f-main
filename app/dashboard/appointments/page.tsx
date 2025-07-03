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
import { Plus, CalendarIcon, List } from "lucide-react"
import { AppointmentSummaryCards } from "@/components/appointments/appointment-summary-cards"
import { AppointmentFiltersComponent } from "@/components/appointments/appointment-filters"
import { AppointmentTable } from "@/components/appointments/appointment-table"
import { AppointmentBookingForm } from "@/components/appointments/appointment-booking-form"
import { AppointmentDetails } from "@/components/appointments/appointment-details"
import { AppointmentCalendar } from "@/components/appointments/appointment-calendar"
import { useAppointments } from "@/hooks/use-appointments"
import { useAuth } from "@/contexts/auth-context"
import type { Appointment, AppointmentFilters, BookingRequest } from "@/lib/types"

const ITEMS_PER_PAGE = 10

export default function AppointmentsPage() {
  const { user } = useAuth()
  const {
    appointments,
    loading,
    bookAppointment,
    updateAppointment,
    cancelAppointment,
    completeAppointment,
    getAppointmentSummary,
    filterAppointments,
  } = useAppointments()

  const [filters, setFilters] = useState<AppointmentFilters>({
    search: "",
    doctorId: "",
    patientId: "",
    status: "",
    dateRange: [null, null],
    specialization: "",
  })

  const [currentPage, setCurrentPage] = useState(1)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("")

  const canBook = user?.role === "admin" || user?.role === "receptionist" || user?.role === "patient"

  // Filter appointments based on user role
  const userFilteredAppointments = appointments.filter((apt) => {
    if (user?.role === "doctor") {
      return apt.doctorId === user.uid
    }
    if (user?.role === "patient") {
      return apt.patientId === user.uid
    }
    return true // Admin, receptionist, nurse can see all
  })

  // Apply filters
  const filteredAppointments = filterAppointments(filters).filter((apt) => {
    if (user?.role === "doctor") {
      return apt.doctorId === user.uid
    }
    if (user?.role === "patient") {
      return apt.patientId === user.uid
    }
    return true
  })

  const totalPages = Math.ceil(filteredAppointments.length / ITEMS_PER_PAGE)
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  const summary = getAppointmentSummary()

  const handleBookAppointment = () => {
    setShowBookingForm(true)
  }

  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowDetails(true)
  }

  const handleEditAppointment = (appointment: Appointment) => {
    // For now, just show details - can be enhanced to show edit form
    setSelectedAppointment(appointment)
    setShowDetails(true)
  }

  const handleCancelAppointment = (appointment: Appointment) => {
    setAppointmentToCancel(appointment)
    setShowCancelDialog(true)
  }

  const handleCompleteAppointment = async (appointment: Appointment, notes?: string) => {
    try {
      await completeAppointment(appointment.id, notes)
      setShowDetails(false)
    } catch (error) {
      console.error("Error completing appointment:", error)
    }
  }

  const confirmCancel = async () => {
    if (appointmentToCancel) {
      try {
        await cancelAppointment(appointmentToCancel.id)
        setShowCancelDialog(false)
        setAppointmentToCancel(null)
        setShowDetails(false)
      } catch (error) {
        console.error("Error cancelling appointment:", error)
      }
    }
  }

  const handleBookingSubmit = async (bookingData: BookingRequest) => {
    setBookingLoading(true)
    try {
      await bookAppointment({
        ...bookingData,
        createdBy: user?.uid || "",
      })
      setShowBookingForm(false)
    } catch (error) {
      console.error("Error booking appointment:", error)
    } finally {
      setBookingLoading(false)
    }
  }

  const handleClearFilters = () => {
    setFilters({
      search: "",
      doctorId: "",
      patientId: "",
      status: "",
      dateRange: [null, null],
      specialization: "",
    })
    setCurrentPage(1)
  }

  const handleFiltersChange = (newFilters: AppointmentFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading appointments...</p>
        </div>
      </div>
    )
  }

  if (showDetails && selectedAppointment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <AppointmentDetails
          appointment={selectedAppointment}
          onEdit={() => handleEditAppointment(selectedAppointment)}
          onCancel={() => handleCancelAppointment(selectedAppointment)}
          onComplete={(notes) => handleCompleteAppointment(selectedAppointment, notes)}
          onClose={() => setShowDetails(false)}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              Appointment Management
            </h1>
            <p className="text-slate-600 mt-1">Manage and schedule appointments</p>
          </div>
          <div className="flex items-center gap-2">
            {canBook && (
              <Button
                onClick={handleBookAppointment}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Book Appointment
              </Button>
            )}
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 shadow-elegant-lg p-6">
          <AppointmentSummaryCards summary={summary} />
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 shadow-elegant-lg">
          <Tabs defaultValue="list" className="space-y-4">
            <div className="p-6 pb-0">
              <TabsList className="bg-white/50 backdrop-blur-sm">
                <TabsTrigger
                  value="list"
                  className="flex items-center gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white"
                >
                  <List className="h-4 w-4" />
                  List View
                </TabsTrigger>
                <TabsTrigger
                  value="calendar"
                  className="flex items-center gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white"
                >
                  <CalendarIcon className="h-4 w-4" />
                  Calendar View
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="list" className="space-y-4 px-6 pb-6">
              <AppointmentFiltersComponent
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
              />

              <AppointmentTable
                appointments={paginatedAppointments}
                onViewAppointment={handleViewAppointment}
                onEditAppointment={handleEditAppointment}
                onCancelAppointment={handleCancelAppointment}
                onCompleteAppointment={(apt) => handleCompleteAppointment(apt)}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </TabsContent>

            <TabsContent value="calendar" className="space-y-4 px-6 pb-6">
              <AppointmentCalendar
                appointments={userFilteredAppointments}
                onAppointmentClick={handleViewAppointment}
                selectedDoctorId={selectedDoctorId}
                onDoctorChange={setSelectedDoctorId}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Booking Dialog */}
        <Dialog open={showBookingForm} onOpenChange={setShowBookingForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                Book New Appointment
              </DialogTitle>
            </DialogHeader>
            <AppointmentBookingForm
              onSubmit={handleBookingSubmit}
              onCancel={() => setShowBookingForm(false)}
              loading={bookingLoading}
              initialPatientId={user?.role === "patient" ? user.uid : undefined}
            />
          </DialogContent>
        </Dialog>

        {/* Cancel Confirmation Dialog */}
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent className="bg-white/95 backdrop-blur-sm">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-600">Cancel Appointment</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this appointment with{" "}
                <strong>{appointmentToCancel?.patientName}</strong> on{" "}
                <strong>{appointmentToCancel?.date && new Date(appointmentToCancel.date).toLocaleDateString()}</strong>?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmCancel}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              >
                Cancel Appointment
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
