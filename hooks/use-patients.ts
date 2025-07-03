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
import type { Patient, MedicalHistory, PatientFilters, PatientSummary } from "@/lib/types"
import { generatePatientId, calculateAge } from "@/lib/patient-utils"
import { toast } from "sonner"

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const q = query(collection(db, "patients"), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const patientsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as Patient[]

        setPatients(patientsData)
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching patients:", error)
        setError(error.message)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [])

  const addPatient = async (patientData: Omit<Patient, "id" | "patientId" | "createdAt" | "updatedAt" | "age">) => {
    try {
      const patientId = generatePatientId()
      const age = calculateAge(patientData.dateOfBirth)

      const newPatient = {
        ...patientData,
        patientId,
        age,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      await addDoc(collection(db, "patients"), newPatient)
      toast.success("Patient added successfully!")
    } catch (error: any) {
      console.error("Error adding patient:", error)
      toast.error(error.message || "Failed to add patient")
      throw error
    }
  }

  const updatePatient = async (id: string, patientData: Partial<Patient>) => {
    try {
      const updateData = {
        ...patientData,
        updatedAt: serverTimestamp(),
      }

      if (patientData.dateOfBirth) {
        updateData.age = calculateAge(patientData.dateOfBirth)
      }

      await updateDoc(doc(db, "patients", id), updateData)
      toast.success("Patient updated successfully!")
    } catch (error: any) {
      console.error("Error updating patient:", error)
      toast.error(error.message || "Failed to update patient")
      throw error
    }
  }

  const deletePatient = async (id: string) => {
    try {
      await deleteDoc(doc(db, "patients", id))
      toast.success("Patient deleted successfully!")
    } catch (error: any) {
      console.error("Error deleting patient:", error)
      toast.error(error.message || "Failed to delete patient")
      throw error
    }
  }

  const getPatient = async (id: string): Promise<Patient | null> => {
    try {
      const docRef = doc(db, "patients", id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate() || new Date(),
          updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
        } as Patient
      }
      return null
    } catch (error: any) {
      console.error("Error getting patient:", error)
      throw error
    }
  }

  const getPatientSummary = (): PatientSummary => {
    const totalPatients = patients.length
    const maleCount = patients.filter((p) => p.gender === "male").length
    const femaleCount = patients.filter((p) => p.gender === "female").length
    const activePatients = patients.filter((p) => p.status === "active").length
    const inactivePatients = patients.filter((p) => p.status === "inactive").length
    const averageAge =
      patients.length > 0 ? Math.round(patients.reduce((sum, p) => sum + p.age, 0) / patients.length) : 0

    return {
      totalPatients,
      maleCount,
      femaleCount,
      averageAge,
      activePatients,
      inactivePatients,
    }
  }

  const filterPatients = (filters: PatientFilters): Patient[] => {
    return patients.filter((patient) => {
      const matchesSearch =
        !filters.search ||
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(filters.search.toLowerCase()) ||
        patient.patientId.toLowerCase().includes(filters.search.toLowerCase()) ||
        patient.email.toLowerCase().includes(filters.search.toLowerCase())

      const matchesGender = !filters.gender || patient.gender === filters.gender
      const matchesBloodGroup = !filters.bloodGroup || patient.bloodGroup === filters.bloodGroup
      const matchesStatus = !filters.status || patient.status === filters.status
      const matchesAge = patient.age >= filters.ageRange[0] && patient.age <= filters.ageRange[1]

      return matchesSearch && matchesGender && matchesBloodGroup && matchesStatus && matchesAge
    })
  }

  return {
    patients,
    loading,
    error,
    addPatient,
    updatePatient,
    deletePatient,
    getPatient,
    getPatientSummary,
    filterPatients,
  }
}

export function useMedicalHistory(patientId: string) {
  const [history, setHistory] = useState<MedicalHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!patientId) return

    const q = query(collection(db, "medicalHistory"), where("patientId", "==", patientId), orderBy("date", "desc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const historyData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as MedicalHistory[]

      setHistory(historyData)
      setLoading(false)
    })

    return unsubscribe
  }, [patientId])

  const addMedicalRecord = async (recordData: Omit<MedicalHistory, "id" | "createdAt">) => {
    try {
      await addDoc(collection(db, "medicalHistory"), {
        ...recordData,
        createdAt: serverTimestamp(),
      })
      toast.success("Medical record added successfully!")
    } catch (error: any) {
      console.error("Error adding medical record:", error)
      toast.error(error.message || "Failed to add medical record")
      throw error
    }
  }

  return {
    history,
    loading,
    addMedicalRecord,
  }
}
