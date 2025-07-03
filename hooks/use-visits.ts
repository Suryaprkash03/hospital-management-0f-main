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
  deleteDoc,
  where,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Visit, VisitFilters, VisitSummary, VisitVitals } from "@/lib/types"
import { generateVisitId } from "@/lib/visit-utils"
import { toast } from "sonner"

export function useVisits() {
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const q = query(collection(db, "visits"), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const visitsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          visitDate: doc.data().visitDate?.toDate() || new Date(),
          expectedDischargeDate: doc.data().expectedDischargeDate?.toDate(),
          actualDischargeDate: doc.data().actualDischargeDate?.toDate(),
          followUpDate: doc.data().followUpDate?.toDate(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as Visit[]

        setVisits(visitsData)
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching visits:", error)
        setError(error.message)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [])

  const addVisit = async (visitData: Omit<Visit, "id" | "visitId" | "createdAt" | "updatedAt">) => {
    try {
      const visitId = generateVisitId()

      const newVisit = {
        ...visitData,
        visitId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      await addDoc(collection(db, "visits"), newVisit)
      toast.success("Visit recorded successfully!")
    } catch (error: any) {
      console.error("Error adding visit:", error)
      toast.error(error.message || "Failed to record visit")
      throw error
    }
  }

  const updateVisit = async (id: string, visitData: Partial<Visit>) => {
    try {
      const updateData = {
        ...visitData,
        updatedAt: serverTimestamp(),
      }

      await updateDoc(doc(db, "visits", id), updateData)
      toast.success("Visit updated successfully!")
    } catch (error: any) {
      console.error("Error updating visit:", error)
      toast.error(error.message || "Failed to update visit")
      throw error
    }
  }

  const deleteVisit = async (id: string) => {
    try {
      await deleteDoc(doc(db, "visits", id))
      toast.success("Visit deleted successfully!")
    } catch (error: any) {
      console.error("Error deleting visit:", error)
      toast.error(error.message || "Failed to delete visit")
      throw error
    }
  }

  const getVisit = async (id: string): Promise<Visit | null> => {
    try {
      const docRef = doc(db, "visits", id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          visitDate: docSnap.data().visitDate?.toDate() || new Date(),
          expectedDischargeDate: docSnap.data().expectedDischargeDate?.toDate(),
          actualDischargeDate: docSnap.data().actualDischargeDate?.toDate(),
          followUpDate: docSnap.data().followUpDate?.toDate(),
          createdAt: docSnap.data().createdAt?.toDate() || new Date(),
          updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
        } as Visit
      }
      return null
    } catch (error: any) {
      console.error("Error getting visit:", error)
      throw error
    }
  }

  const getPatientVisits = (patientId: string): Visit[] => {
    return visits.filter((visit) => visit.patientId === patientId)
  }

  const getDoctorVisits = (doctorId: string): Visit[] => {
    return visits.filter((visit) => visit.doctorId === doctorId)
  }

  const getActiveIPDVisits = (): Visit[] => {
    return visits.filter((visit) => visit.visitType === "ipd" && visit.status === "active")
  }

  const getVisitSummary = (): VisitSummary => {
    const totalVisits = visits.length
    const opdVisits = visits.filter((v) => v.visitType === "opd").length
    const ipdVisits = visits.filter((v) => v.visitType === "ipd").length
    const activeIPD = visits.filter((v) => v.visitType === "ipd" && v.status === "active").length
    const completedVisits = visits.filter((v) => v.status === "completed" || v.status === "discharged").length

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayVisits = visits.filter((v) => {
      const visitDate = new Date(v.visitDate)
      visitDate.setHours(0, 0, 0, 0)
      return visitDate.getTime() === today.getTime()
    }).length

    return {
      totalVisits,
      opdVisits,
      ipdVisits,
      activeIPD,
      completedVisits,
      todayVisits,
    }
  }

  const filterVisits = (filters: VisitFilters): Visit[] => {
    return visits.filter((visit) => {
      const matchesSearch =
        !filters.search ||
        `${visit.patientName}`.toLowerCase().includes(filters.search.toLowerCase()) ||
        visit.visitId.toLowerCase().includes(filters.search.toLowerCase()) ||
        visit.doctorName.toLowerCase().includes(filters.search.toLowerCase())

      const matchesType = !filters.visitType || visit.visitType === filters.visitType
      const matchesStatus = !filters.status || visit.status === filters.status
      const matchesDoctor = !filters.doctorId || visit.doctorId === filters.doctorId
      const matchesDiagnosis =
        !filters.diagnosis || visit.diagnosis.toLowerCase().includes(filters.diagnosis.toLowerCase())

      let matchesDateRange = true
      if (filters.dateRange[0] && filters.dateRange[1]) {
        const visitDate = new Date(visit.visitDate)
        const startDate = new Date(filters.dateRange[0])
        const endDate = new Date(filters.dateRange[1])
        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(23, 59, 59, 999)
        matchesDateRange = visitDate >= startDate && visitDate <= endDate
      }

      return matchesSearch && matchesType && matchesStatus && matchesDoctor && matchesDiagnosis && matchesDateRange
    })
  }

  const dischargePatient = async (visitId: string, dischargeData: any) => {
    try {
      await updateVisit(visitId, {
        status: "discharged",
        actualDischargeDate: new Date(),
        ...dischargeData,
      })
      toast.success("Patient discharged successfully!")
    } catch (error: any) {
      console.error("Error discharging patient:", error)
      toast.error(error.message || "Failed to discharge patient")
      throw error
    }
  }

  return {
    visits,
    loading,
    error,
    addVisit,
    updateVisit,
    deleteVisit,
    getVisit,
    getPatientVisits,
    getDoctorVisits,
    getActiveIPDVisits,
    getVisitSummary,
    filterVisits,
    dischargePatient,
  }
}

export function useVisitVitals(visitId: string) {
  const [vitals, setVitals] = useState<VisitVitals[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!visitId) return

    const q = query(collection(db, "visitVitals"), where("visitId", "==", visitId), orderBy("recordedAt", "desc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const vitalsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        recordedAt: doc.data().recordedAt?.toDate() || new Date(),
      })) as VisitVitals[]

      setVitals(vitalsData)
      setLoading(false)
    })

    return unsubscribe
  }, [visitId])

  const addVitals = async (vitalsData: Omit<VisitVitals, "id" | "recordedAt">) => {
    try {
      await addDoc(collection(db, "visitVitals"), {
        ...vitalsData,
        recordedAt: serverTimestamp(),
      })
      toast.success("Vitals recorded successfully!")
    } catch (error: any) {
      console.error("Error adding vitals:", error)
      toast.error(error.message || "Failed to record vitals")
      throw error
    }
  }

  return {
    vitals,
    loading,
    addVitals,
  }
}
