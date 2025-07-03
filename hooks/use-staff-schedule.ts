"use client"

import { useState, useEffect } from "react"
import { collection, query, where, onSnapshot, addDoc, deleteDoc, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { StaffSchedule } from "@/lib/types"

export function useStaffSchedule(staffId: string) {
  const [schedule, setSchedule] = useState<StaffSchedule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!staffId) return

    const q = query(collection(db, "staffSchedules"), where("staffId", "==", staffId))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const scheduleData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as StaffSchedule[]

      setSchedule(scheduleData)
      setLoading(false)
    })

    return unsubscribe
  }, [staffId])

  const updateSchedule = async (scheduleData: Omit<StaffSchedule, "id" | "createdAt" | "updatedAt">[]) => {
    try {
      // Delete existing schedules
      const existingQuery = query(collection(db, "staffSchedules"), where("staffId", "==", staffId))
      const existingSnapshot = await getDocs(existingQuery)

      for (const doc of existingSnapshot.docs) {
        await deleteDoc(doc.ref)
      }

      // Add new schedules
      for (const schedule of scheduleData) {
        await addDoc(collection(db, "staffSchedules"), {
          ...schedule,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }
    } catch (error) {
      console.error("Error updating schedule:", error)
      throw error
    }
  }

  return {
    schedule,
    loading,
    updateSchedule,
  }
}
