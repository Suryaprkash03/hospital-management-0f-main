"use client"

import { useState, useEffect } from "react"
import { collection, query, onSnapshot, orderBy, where, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { AnalyticsData, DoctorAnalytics, PatientAnalytics } from "@/lib/types"
import {
  calculateKPIMetrics,
  generateMonthlyPatientVisits,
  generateDailyRevenueTrends,
  generateInventoryUsage,
  generateTopPrescribedMedicines,
  generateAppointmentsByTimeSlot,
  generateDoctorAnalytics,
  generatePatientAnalytics,
} from "@/lib/analytics-utils"
import { useAuth } from "@/contexts/auth-context"

export function useAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribes: (() => void)[] = []

    let patients: any[] = []
    let appointments: any[] = []
    let visits: any[] = []
    let medicines: any[] = []
    let invoices: any[] = []
    let staff: any[] = []

    const updateAnalytics = () => {
      try {
        const kpis = calculateKPIMetrics(patients, appointments, visits, medicines, invoices, staff)
        const monthlyPatientVisits = generateMonthlyPatientVisits(visits)
        const dailyRevenueTrends = generateDailyRevenueTrends(invoices)
        const inventoryUsage = generateInventoryUsage(medicines)
        const topPrescribedMedicines = generateTopPrescribedMedicines(medicines)
        const appointmentsByTimeSlot = generateAppointmentsByTimeSlot(appointments)

        const chartData = {
          monthlyPatientVisits,
          dailyRevenueTrends,
          inventoryUsage,
          topPrescribedMedicines,
          appointmentsByTimeSlot,
          diagnosisDistribution: [], // Would be calculated from visits
          departmentRevenue: [], // Would be calculated from invoices
          patientAgeDistribution: [], // Would be calculated from patients
        }

        setAnalyticsData({
          kpis,
          chartData,
        })
        setLoading(false)
      } catch (err) {
        console.error("Analytics calculation error:", err)
        setError(err instanceof Error ? err.message : "Failed to calculate analytics")
        setLoading(false)
      }
    }

    // Subscribe to patients
    const patientsQuery = query(collection(db, "patients"), orderBy("createdAt", "desc"))
    const unsubscribePatients = onSnapshot(
      patientsQuery,
      (snapshot) => {
        patients = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        }))
        updateAnalytics()
      },
      (error) => {
        console.error("Patients subscription error:", error)
        setError("Failed to load patients data")
        setLoading(false)
      },
    )
    unsubscribes.push(unsubscribePatients)

    // Subscribe to appointments
    const appointmentsQuery = query(collection(db, "appointments"), orderBy("date", "desc"))
    const unsubscribeAppointments = onSnapshot(
      appointmentsQuery,
      (snapshot) => {
        appointments = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate(),
          createdAt: doc.data().createdAt?.toDate(),
        }))
        updateAnalytics()
      },
      (error) => {
        console.error("Appointments subscription error:", error)
      },
    )
    unsubscribes.push(unsubscribeAppointments)

    // Subscribe to visits
    const visitsQuery = query(collection(db, "visits"), orderBy("visitDate", "desc"))
    const unsubscribeVisits = onSnapshot(
      visitsQuery,
      (snapshot) => {
        visits = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          visitDate: doc.data().visitDate?.toDate(),
          createdAt: doc.data().createdAt?.toDate(),
        }))
        updateAnalytics()
      },
      (error) => {
        console.error("Visits subscription error:", error)
      },
    )
    unsubscribes.push(unsubscribeVisits)

    // Subscribe to medicines
    const medicinesQuery = query(collection(db, "medicines"), orderBy("createdAt", "desc"))
    const unsubscribeMedicines = onSnapshot(
      medicinesQuery,
      (snapshot) => {
        medicines = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          expiryDate: doc.data().expiryDate?.toDate(),
          createdAt: doc.data().createdAt?.toDate(),
        }))
        updateAnalytics()
      },
      (error) => {
        console.error("Medicines subscription error:", error)
      },
    )
    unsubscribes.push(unsubscribeMedicines)

    // Subscribe to invoices
    const invoicesQuery = query(collection(db, "invoices"), orderBy("createdAt", "desc"))
    const unsubscribeInvoices = onSnapshot(
      invoicesQuery,
      (snapshot) => {
        invoices = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          invoiceDate: doc.data().invoiceDate?.toDate(),
          createdAt: doc.data().createdAt?.toDate(),
        }))
        updateAnalytics()
      },
      (error) => {
        console.error("Invoices subscription error:", error)
      },
    )
    unsubscribes.push(unsubscribeInvoices)

    // Subscribe to staff
    const staffQuery = query(collection(db, "staff"), orderBy("createdAt", "desc"))
    const unsubscribeStaff = onSnapshot(
      staffQuery,
      (snapshot) => {
        staff = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        }))
        updateAnalytics()
      },
      (error) => {
        console.error("Staff subscription error:", error)
      },
    )
    unsubscribes.push(unsubscribeStaff)

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe())
    }
  }, [])

  return {
    analyticsData,
    loading,
    error,
    // For backward compatibility, also return individual properties
    kpis: analyticsData?.kpis,
    chartData: analyticsData?.chartData,
  }
}

export function useDoctorAnalytics(doctorId?: string) {
  const [doctorAnalytics, setDoctorAnalytics] = useState<DoctorAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const targetDoctorId = doctorId || user?.uid

  useEffect(() => {
    if (!targetDoctorId) return

    const unsubscribes: (() => void)[] = []
    let appointments: any[] = []
    let visits: any[] = []

    const updateAnalytics = () => {
      if (appointments.length > 0 || visits.length > 0) {
        const analytics = generateDoctorAnalytics(targetDoctorId, appointments, visits)
        setDoctorAnalytics(analytics)
        setLoading(false)
      }
    }

    // Subscribe to doctor's appointments
    const appointmentsQuery = query(
      collection(db, "appointments"),
      where("doctorId", "==", targetDoctorId),
      orderBy("date", "desc"),
      limit(100),
    )
    const unsubscribeAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
      appointments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(),
      }))
      updateAnalytics()
    })
    unsubscribes.push(unsubscribeAppointments)

    // Subscribe to doctor's visits
    const visitsQuery = query(
      collection(db, "visits"),
      where("doctorId", "==", targetDoctorId),
      orderBy("visitDate", "desc"),
      limit(100),
    )
    const unsubscribeVisits = onSnapshot(visitsQuery, (snapshot) => {
      visits = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        visitDate: doc.data().visitDate?.toDate(),
      }))
      updateAnalytics()
    })
    unsubscribes.push(unsubscribeVisits)

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe())
    }
  }, [targetDoctorId])

  return { doctorAnalytics, loading }
}

export function usePatientAnalytics(patientId?: string) {
  const [patientAnalytics, setPatientAnalytics] = useState<PatientAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const targetPatientId = patientId || user?.uid

  useEffect(() => {
    if (!targetPatientId) return

    const unsubscribes: (() => void)[] = []
    let visits: any[] = []
    let invoices: any[] = []

    const updateAnalytics = () => {
      if (visits.length > 0 || invoices.length > 0) {
        const analytics = generatePatientAnalytics(targetPatientId, visits, invoices)
        setPatientAnalytics(analytics)
        setLoading(false)
      }
    }

    // Subscribe to patient's visits
    const visitsQuery = query(
      collection(db, "visits"),
      where("patientId", "==", targetPatientId),
      orderBy("visitDate", "desc"),
    )
    const unsubscribeVisits = onSnapshot(visitsQuery, (snapshot) => {
      visits = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        visitDate: doc.data().visitDate?.toDate(),
      }))
      updateAnalytics()
    })
    unsubscribes.push(unsubscribeVisits)

    // Subscribe to patient's invoices
    const invoicesQuery = query(
      collection(db, "invoices"),
      where("patientId", "==", targetPatientId),
      orderBy("invoiceDate", "desc"),
    )
    const unsubscribeInvoices = onSnapshot(invoicesQuery, (snapshot) => {
      invoices = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        invoiceDate: doc.data().invoiceDate?.toDate(),
      }))
      updateAnalytics()
    })
    unsubscribes.push(unsubscribeInvoices)

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe())
    }
  }, [targetPatientId])

  return { patientAnalytics, loading }
}
