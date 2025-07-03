"use client"

import { useState, useEffect } from "react"
import { collection, query, orderBy, onSnapshot, doc, addDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Bed, BedFilters, BedSummary } from "@/lib/types"
import { toast } from "sonner"

export function useBeds() {
  const [beds, setBeds] = useState<Bed[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const q = query(collection(db, "beds"), orderBy("bedNumber", "asc"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const bedsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          assignedDate: doc.data().assignedDate?.toDate(),
          lastCleaned: doc.data().lastCleaned?.toDate(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as Bed[]

        setBeds(bedsData)
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching beds:", error)
        setError(error.message)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [])

  const addBed = async (bedData: Omit<Bed, "id" | "createdAt" | "updatedAt">) => {
    try {
      const newBed = {
        ...bedData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      await addDoc(collection(db, "beds"), newBed)
      toast.success("Bed added successfully!")
    } catch (error: any) {
      console.error("Error adding bed:", error)
      toast.error(error.message || "Failed to add bed")
      throw error
    }
  }

  const updateBed = async (id: string, bedData: Partial<Bed>) => {
    try {
      const updateData = {
        ...bedData,
        updatedAt: serverTimestamp(),
      }

      await updateDoc(doc(db, "beds", id), updateData)
      toast.success("Bed updated successfully!")
    } catch (error: any) {
      console.error("Error updating bed:", error)
      toast.error(error.message || "Failed to update bed")
      throw error
    }
  }

  const assignBed = async (bedId: string, patientId: string, patientName: string) => {
    try {
      await updateBed(bedId, {
        status: "occupied",
        assignedPatientId: patientId,
        assignedPatientName: patientName,
        assignedDate: new Date(),
      })
      toast.success("Bed assigned successfully!")
    } catch (error: any) {
      console.error("Error assigning bed:", error)
      toast.error(error.message || "Failed to assign bed")
      throw error
    }
  }

  const freeBed = async (bedId: string) => {
    try {
      await updateBed(bedId, {
        status: "available",
        assignedPatientId: null,
        assignedPatientName: null,
        assignedDate: null,
      })
      toast.success("Bed freed successfully!")
    } catch (error: any) {
      console.error("Error freeing bed:", error)
      toast.error(error.message || "Failed to free bed")
      throw error
    }
  }

  const getAvailableBeds = (): Bed[] => {
    return beds.filter((bed) => bed.status === "available")
  }

  const getBedSummary = (): BedSummary => {
    const totalBeds = beds.length
    const availableBeds = beds.filter((b) => b.status === "available").length
    const occupiedBeds = beds.filter((b) => b.status === "occupied").length
    const maintenanceBeds = beds.filter((b) => b.status === "maintenance").length
    const reservedBeds = beds.filter((b) => b.status === "reserved").length
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0

    return {
      totalBeds,
      availableBeds,
      occupiedBeds,
      maintenanceBeds,
      reservedBeds,
      occupancyRate,
    }
  }

  const filterBeds = (filters: BedFilters): Bed[] => {
    return beds.filter((bed) => {
      const matchesSearch =
        !filters.search ||
        bed.bedNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
        bed.roomNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
        bed.ward.toLowerCase().includes(filters.search.toLowerCase()) ||
        (bed.assignedPatientName && bed.assignedPatientName.toLowerCase().includes(filters.search.toLowerCase()))

      const matchesStatus = !filters.status || bed.status === filters.status
      const matchesBedType = !filters.bedType || bed.bedType === filters.bedType
      const matchesWard = !filters.ward || bed.ward === filters.ward
      const matchesRoom = !filters.roomNumber || bed.roomNumber === filters.roomNumber

      return matchesSearch && matchesStatus && matchesBedType && matchesWard && matchesRoom
    })
  }

  return {
    beds,
    loading,
    error,
    addBed,
    updateBed,
    assignBed,
    freeBed,
    getAvailableBeds,
    getBedSummary,
    filterBeds,
  }
}
