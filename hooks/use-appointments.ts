"use client"

import { useState, useEffect } from "react"
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  where,
  serverTimestamp,
  getDocs,
  and,
  Timestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type {
  Appointment,
  AppointmentFilters,
  AppointmentSummary,
  BookingRequest,
  DoctorAvailability,
} from "@/lib/types"
import {
  generateAppointmentId,
  calculateEndTime,
  generateTimeSlots,
  isTimeSlotAvailable,
  getWeekDayNumber,
} from "@/lib/appointment-utils"
import { toast } from "sonner"

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const q = query(collection(db, "appointments"), orderBy("date", "desc"), orderBy("startTime", "asc"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const appointmentsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate() || new Date(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as Appointment[]

        setAppointments(appointmentsData)
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching appointments:", error)
        setError(error.message)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [])

  const bookAppointment = async (bookingData: BookingRequest & { createdBy: string }) => {
    try {
      // Check for conflicts
      const isAvailable = await checkTimeSlotAvailability(
        bookingData.doctorId,
        bookingData.date,
        bookingData.startTime,
        bookingData.endTime,
      )

      if (!isAvailable) {
        throw new Error("This time slot is no longer available")
      }

      const appointmentId = generateAppointmentId()

      // Get patient and doctor details
      const patientDoc = await getDoc(doc(db, "patients", bookingData.patientId))
      const doctorDoc = await getDoc(doc(db, "staff", bookingData.doctorId))

      if (!patientDoc.exists() || !doctorDoc.exists()) {
        throw new Error("Patient or doctor not found")
      }

      const patientData = patientDoc.data()
      const doctorData = doctorDoc.data()

      const newAppointment = {
        appointmentId,
        patientId: bookingData.patientId,
        patientName: `${patientData.firstName} ${patientData.lastName}`,
        patientPhone: patientData.phone,
        patientEmail: patientData.email,
        doctorId: bookingData.doctorId,
        doctorName: `Dr. ${doctorData.firstName} ${doctorData.lastName}`,
        doctorSpecialization: doctorData.specialization,
        date: Timestamp.fromDate(bookingData.date),
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        duration: bookingData.duration,
        reason: bookingData.reason,
        status: "scheduled" as const,
        consultationFee: doctorData.consultationFee,
        createdBy: bookingData.createdBy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        reminderSent: false,
        followUpRequired: false,
      }

      await addDoc(collection(db, "appointments"), newAppointment)
      toast.success("Appointment booked successfully!")
    } catch (error: any) {
      console.error("Error booking appointment:", error)
      toast.error(error.message || "Failed to book appointment")
      throw error
    }
  }

  const updateAppointment = async (id: string, appointmentData: Partial<Appointment>) => {
    try {
      const updateData = {
        ...appointmentData,
        updatedAt: serverTimestamp(),
      }

      // If date is being updated, convert to Timestamp
      if (appointmentData.date) {
        updateData.date = Timestamp.fromDate(appointmentData.date)
      }

      await updateDoc(doc(db, "appointments", id), updateData)
      toast.success("Appointment updated successfully!")
    } catch (error: any) {
      console.error("Error updating appointment:", error)
      toast.error(error.message || "Failed to update appointment")
      throw error
    }
  }

  const cancelAppointment = async (id: string, reason?: string) => {
    try {
      await updateDoc(doc(db, "appointments", id), {
        status: "cancelled",
        notes: reason ? `Cancelled: ${reason}` : "Cancelled",
        updatedAt: serverTimestamp(),
      })
      toast.success("Appointment cancelled successfully!")
    } catch (error: any) {
      console.error("Error cancelling appointment:", error)
      toast.error(error.message || "Failed to cancel appointment")
      throw error
    }
  }

  const completeAppointment = async (id: string, notes?: string) => {
    try {
      await updateDoc(doc(db, "appointments", id), {
        status: "completed",
        notes: notes || "",
        updatedAt: serverTimestamp(),
      })
      toast.success("Appointment marked as completed!")
    } catch (error: any) {
      console.error("Error completing appointment:", error)
      toast.error(error.message || "Failed to complete appointment")
      throw error
    }
  }

  const getAppointment = async (id: string): Promise<Appointment | null> => {
    try {
      const docRef = doc(db, "appointments", id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          date: docSnap.data().date?.toDate() || new Date(),
          createdAt: docSnap.data().createdAt?.toDate() || new Date(),
          updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
        } as Appointment
      }
      return null
    } catch (error: any) {
      console.error("Error getting appointment:", error)
      throw error
    }
  }

  const getAppointmentSummary = (): AppointmentSummary => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const totalAppointments = appointments.length
    const todayAppointments = appointments.filter((apt) => {
      const aptDate = new Date(apt.date)
      aptDate.setHours(0, 0, 0, 0)
      return aptDate.getTime() === today.getTime()
    }).length

    const scheduledCount = appointments.filter((apt) => apt.status === "scheduled" || apt.status === "confirmed").length
    const completedCount = appointments.filter((apt) => apt.status === "completed").length
    const cancelledCount = appointments.filter((apt) => apt.status === "cancelled").length
    const upcomingCount = appointments.filter(
      (apt) => new Date(apt.date) >= today && apt.status !== "cancelled" && apt.status !== "completed",
    ).length

    return {
      totalAppointments,
      todayAppointments,
      scheduledCount,
      completedCount,
      cancelledCount,
      upcomingCount,
    }
  }

  const filterAppointments = (filters: AppointmentFilters): Appointment[] => {
    return appointments.filter((appointment) => {
      const matchesSearch =
        !filters.search ||
        appointment.patientName.toLowerCase().includes(filters.search.toLowerCase()) ||
        appointment.doctorName.toLowerCase().includes(filters.search.toLowerCase()) ||
        appointment.appointmentId.toLowerCase().includes(filters.search.toLowerCase())

      const matchesDoctor = !filters.doctorId || appointment.doctorId === filters.doctorId
      const matchesPatient = !filters.patientId || appointment.patientId === filters.patientId
      const matchesStatus = !filters.status || appointment.status === filters.status
      const matchesSpecialization =
        !filters.specialization || appointment.doctorSpecialization === filters.specialization

      let matchesDateRange = true
      if (filters.dateRange[0] && filters.dateRange[1]) {
        const aptDate = new Date(appointment.date)
        aptDate.setHours(0, 0, 0, 0)
        const startDate = new Date(filters.dateRange[0])
        startDate.setHours(0, 0, 0, 0)
        const endDate = new Date(filters.dateRange[1])
        endDate.setHours(23, 59, 59, 999)
        matchesDateRange = aptDate >= startDate && aptDate <= endDate
      }

      return (
        matchesSearch && matchesDoctor && matchesPatient && matchesStatus && matchesSpecialization && matchesDateRange
      )
    })
  }

  const checkTimeSlotAvailability = async (
    doctorId: string,
    date: Date,
    startTime: string,
    endTime: string,
  ): Promise<boolean> => {
    try {
      const dateStart = new Date(date)
      dateStart.setHours(0, 0, 0, 0)
      const dateEnd = new Date(date)
      dateEnd.setHours(23, 59, 59, 999)

      const q = query(
        collection(db, "appointments"),
        and(
          where("doctorId", "==", doctorId),
          where("date", ">=", Timestamp.fromDate(dateStart)),
          where("date", "<=", Timestamp.fromDate(dateEnd)),
          where("status", "in", ["scheduled", "confirmed", "in_progress"]),
        ),
      )

      const snapshot = await getDocs(q)
      const bookedSlots = snapshot.docs.map((doc) => ({
        startTime: doc.data().startTime,
        endTime: doc.data().endTime,
      }))

      return isTimeSlotAvailable(startTime, bookedSlots, 30)
    } catch (error) {
      console.error("Error checking availability:", error)
      return false
    }
  }

  return {
    appointments,
    loading,
    error,
    bookAppointment,
    updateAppointment,
    cancelAppointment,
    completeAppointment,
    getAppointment,
    getAppointmentSummary,
    filterAppointments,
    checkTimeSlotAvailability,
  }
}

export function useDoctorAvailability(doctorId: string, date: Date) {
  const [availability, setAvailability] = useState<DoctorAvailability | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!doctorId || !date) return

    const fetchAvailability = async () => {
      try {
        setLoading(true)

        // Get doctor's schedule for the day
        const dayOfWeek = getWeekDayNumber(date)

        // Query the schedule subcollection correctly
        const scheduleQuery = query(
          collection(db, "staffSchedules"),
          where("staffId", "==", doctorId),
          where("dayOfWeek", "==", dayOfWeek),
          where("isAvailable", "==", true),
        )

        const scheduleSnapshot = await getDocs(scheduleQuery)

        if (scheduleSnapshot.empty) {
          // If no schedule found, try to get from staff document directly
          const staffDoc = await getDoc(doc(db, "staff", doctorId))
          if (staffDoc.exists()) {
            const staffData = staffDoc.data()
            // Use default schedule if no specific schedule is set
            const defaultStartTime = "09:00"
            const defaultEndTime = "17:00"

            const allSlots = generateTimeSlots(defaultStartTime, defaultEndTime, 30)

            // Get existing appointments for the day (keep the existing appointment query code)
            const dateStart = new Date(date)
            dateStart.setHours(0, 0, 0, 0)
            const dateEnd = new Date(date)
            dateEnd.setHours(23, 59, 59, 999)

            const appointmentsQuery = query(
              collection(db, "appointments"),
              and(
                where("doctorId", "==", doctorId),
                where("date", ">=", Timestamp.fromDate(dateStart)),
                where("date", "<=", Timestamp.fromDate(dateEnd)),
                where("status", "in", ["scheduled", "confirmed", "in_progress"]),
              ),
            )

            const appointmentsSnapshot = await getDocs(appointmentsQuery)
            const bookedSlots = appointmentsSnapshot.docs.map((doc) => ({
              startTime: doc.data().startTime,
              endTime: doc.data().endTime,
              appointmentId: doc.id,
            }))

            // Create availability slots
            const timeSlots = allSlots.map((slot) => {
              const endSlot = calculateEndTime(slot, 30)
              const isAvailable = isTimeSlotAvailable(slot, bookedSlots, 30)
              const bookedAppointment = bookedSlots.find((booked) => booked.startTime === slot)

              return {
                startTime: slot,
                endTime: endSlot,
                isAvailable,
                appointmentId: bookedAppointment?.appointmentId,
              }
            })

            setAvailability({
              doctorId,
              date,
              timeSlots,
            })
            setLoading(false)
            return
          }

          setAvailability({
            doctorId,
            date,
            timeSlots: [],
          })
          setLoading(false)
          return
        }

        const scheduleData = scheduleSnapshot.docs[0].data()
        const { startTime, endTime } = scheduleData

        // Generate time slots
        const allSlots = generateTimeSlots(startTime, endTime, 30)

        // Get existing appointments for the day
        const dateStart = new Date(date)
        dateStart.setHours(0, 0, 0, 0)
        const dateEnd = new Date(date)
        dateEnd.setHours(23, 59, 59, 999)

        const appointmentsQuery = query(
          collection(db, "appointments"),
          and(
            where("doctorId", "==", doctorId),
            where("date", ">=", Timestamp.fromDate(dateStart)),
            where("date", "<=", Timestamp.fromDate(dateEnd)),
            where("status", "in", ["scheduled", "confirmed", "in_progress"]),
          ),
        )

        const appointmentsSnapshot = await getDocs(appointmentsQuery)
        const bookedSlots = appointmentsSnapshot.docs.map((doc) => ({
          startTime: doc.data().startTime,
          endTime: doc.data().endTime,
          appointmentId: doc.id,
        }))

        // Create availability slots
        const timeSlots = allSlots.map((slot) => {
          const endSlot = calculateEndTime(slot, 30)
          const isAvailable = isTimeSlotAvailable(slot, bookedSlots, 30)
          const bookedAppointment = bookedSlots.find((booked) => booked.startTime === slot)

          return {
            startTime: slot,
            endTime: endSlot,
            isAvailable,
            appointmentId: bookedAppointment?.appointmentId,
          }
        })

        setAvailability({
          doctorId,
          date,
          timeSlots,
        })
      } catch (error) {
        console.error("Error fetching doctor availability:", error)
        setAvailability(null)
      } finally {
        setLoading(false)
      }
    }

    fetchAvailability()
  }, [doctorId, date])

  return { availability, loading }
}
