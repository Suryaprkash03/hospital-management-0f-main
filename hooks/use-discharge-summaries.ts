"use client"

import { useState, useEffect } from "react"
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { DischargeSummary } from "@/lib/types"
import { toast } from "sonner"

export function useDischargeSummaries() {
  const [summaries, setSummaries] = useState<DischargeSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, "dischargeSummaries"), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const summariesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        admissionDate: doc.data().admissionDate?.toDate() || new Date(),
        dischargeDate: doc.data().dischargeDate?.toDate() || new Date(),
        followUpDate: doc.data().followUpDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as DischargeSummary[]

      setSummaries(summariesData)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const createDischargeSummary = async (summaryData: Omit<DischargeSummary, "id" | "createdAt">) => {
    try {
      await addDoc(collection(db, "dischargeSummaries"), {
        ...summaryData,
        createdAt: serverTimestamp(),
      })
      toast.success("Discharge summary created successfully!")
    } catch (error: any) {
      console.error("Error creating discharge summary:", error)
      toast.error(error.message || "Failed to create discharge summary")
      throw error
    }
  }

  const getPatientSummaries = (patientId: string): DischargeSummary[] => {
    return summaries.filter((summary) => summary.patientId === patientId)
  }

  return {
    summaries,
    loading,
    createDischargeSummary,
    getPatientSummaries,
  }
}
