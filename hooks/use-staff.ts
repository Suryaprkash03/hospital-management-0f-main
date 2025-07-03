"use client"

import { useState, useEffect } from "react"
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { db, auth } from "@/lib/firebase"
import type { StaffMember, StaffSchedule, StaffFilters, StaffSummary } from "@/lib/types"
import { generateStaffId } from "@/lib/staff-utils"
import { toast } from "sonner"

export function useStaff() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all staff members
  useEffect(() => {
    const q = query(collection(db, "staff"), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const staffData = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            hireDate: data.hireDate?.toDate?.() || data.hireDate,
            createdAt: data.createdAt?.toDate?.() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
          }
        }) as StaffMember[]

        setStaff(staffData)
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching staff:", error)
        setError(error.message)
        setLoading(false)
        toast.error("Failed to load staff data")
      },
    )

    return unsubscribe
  }, [])

  // Add new staff member
  const addStaffMember = async (staffData: Omit<StaffMember, "id" | "staffId" | "createdAt" | "updatedAt">) => {
    try {
      setLoading(true)

      // Generate staff ID
      const staffId = generateStaffId(staffData.role)

      // Create Firebase Auth user first
      let firebaseUid = ""
      let hasFirebaseAuth = false

      if ((staffData as any).password) {
        try {
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            staffData.email,
            (staffData as any).password,
          )
          firebaseUid = userCredential.user.uid
          hasFirebaseAuth = true

          // Create user profile in users collection
          await addDoc(collection(db, "users"), {
            uid: firebaseUid,
            email: staffData.email,
            role: staffData.role,
            firstName: staffData.firstName,
            lastName: staffData.lastName,
            phone: staffData.phone || "",
            profileCompleted: true,
            mustChangePassword: true, // Staff must change password on first login
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })

          console.log("User profile created for staff member")
        } catch (authError: any) {
          console.error("Firebase Auth error:", authError)

          // Handle specific auth errors
          let errorMessage = "Failed to create user account"
          switch (authError.code) {
            case "auth/email-already-in-use":
              errorMessage = "An account with this email already exists"
              break
            case "auth/invalid-email":
              errorMessage = "Invalid email address"
              break
            case "auth/weak-password":
              errorMessage = "Password should be at least 6 characters"
              break
            default:
              errorMessage = authError.message || "Failed to create user account"
          }

          toast.error(errorMessage)
          throw new Error(errorMessage)
        }
      }

      // Prepare staff data
      const newStaffData = {
        ...staffData,
        staffId,
        firebaseUid,
        hasFirebaseAuth,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      // Remove password from staff data (it's stored in Firebase Auth)
      delete (newStaffData as any).password

      // Create staff record
      const docRef = await addDoc(collection(db, "staff"), newStaffData)

      toast.success("Staff member added successfully!")
      console.log("Staff member created with ID:", docRef.id)

      return {
        success: true,
        id: docRef.id,
        staffId,
        message: "Staff member created successfully",
      }
    } catch (error: any) {
      console.error("Error creating staff member:", error)
      toast.error(error.message || "Failed to add staff member")
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Update staff member
  const updateStaffMember = async (id: string, staffData: Partial<StaffMember>) => {
    try {
      setLoading(true)

      const staffRef = doc(db, "staff", id)
      const updateData = {
        ...staffData,
        updatedAt: serverTimestamp(),
      }

      // Remove password from staff data if present (handled separately)
      delete (updateData as any).password

      await updateDoc(staffRef, updateData)

      toast.success("Staff member updated successfully!")

      return {
        success: true,
        message: "Staff member updated successfully",
      }
    } catch (error: any) {
      console.error("Error updating staff member:", error)
      toast.error(error.message || "Failed to update staff member")
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Delete staff member
  const deleteStaffMember = async (id: string) => {
    try {
      setLoading(true)

      await deleteDoc(doc(db, "staff", id))

      toast.success("Staff member deleted successfully!")

      return {
        success: true,
        message: "Staff member deleted successfully",
      }
    } catch (error: any) {
      console.error("Error deleting staff member:", error)
      toast.error(error.message || "Failed to delete staff member")
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Filter helpers ----------------------------------------------------------
  const filterStaff = (filters: StaffFilters): StaffMember[] => {
    return staff.filter((member) => {
      const matchesSearch =
        !filters.search ||
        `${member.firstName} ${member.lastName}`.toLowerCase().includes(filters.search.toLowerCase()) ||
        member.staffId?.toLowerCase().includes(filters.search.toLowerCase()) ||
        member.email?.toLowerCase().includes(filters.search.toLowerCase())

      const matchesRole = !filters.role || member.role === filters.role
      const matchesDepartment = !filters.department || member.department === filters.department
      const matchesStatus = !filters.status || member.status === filters.status
      const matchesSpecialization =
        !filters.specialization || (member.specialization && member.specialization === filters.specialization)

      return matchesSearch && matchesRole && matchesDepartment && matchesStatus && matchesSpecialization
    })
  }

  // Get staff by role
  const getStaffByRole = async (role: string) => {
    try {
      const q = query(collection(db, "staff"), where("role", "==", role), orderBy("firstName", "asc"))
      const querySnapshot = await getDocs(q)

      const staffData = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          hireDate: data.hireDate?.toDate?.() || data.hireDate,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        }
      }) as StaffMember[]

      return staffData
    } catch (error: any) {
      console.error("Error getting staff by role:", error)
      toast.error("Failed to load staff data")
      return []
    }
  }

  // Get staff by department
  const getStaffByDepartment = async (department: string) => {
    try {
      const q = query(collection(db, "staff"), where("department", "==", department), orderBy("firstName", "asc"))
      const querySnapshot = await getDocs(q)

      const staffData = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          hireDate: data.hireDate?.toDate?.() || data.hireDate,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        }
      }) as StaffMember[]

      return staffData
    } catch (error: any) {
      console.error("Error getting staff by department:", error)
      toast.error("Failed to load staff data")
      return []
    }
  }

  // Reset staff password
  const resetStaffPassword = async (staffId: string, newPassword: string) => {
    try {
      setLoading(true)

      const staffRef = doc(db, "staff", staffId)

      await updateDoc(staffRef, {
        mustChangePassword: true,
        passwordUpdatedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      toast.success("Password reset successfully!")

      return {
        success: true,
        message: "Password reset successfully",
      }
    } catch (error: any) {
      console.error("Error resetting password:", error)
      toast.error(error.message || "Failed to reset password")
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Update staff status
  const updateStaffStatus = async (staffId: string, status: "active" | "inactive" | "on_leave") => {
    try {
      setLoading(true)

      const staffRef = doc(db, "staff", staffId)

      await updateDoc(staffRef, {
        status,
        updatedAt: serverTimestamp(),
      })

      toast.success("Staff status updated successfully!")

      return {
        success: true,
        message: "Staff status updated successfully",
      }
    } catch (error: any) {
      console.error("Error updating staff status:", error)
      toast.error(error.message || "Failed to update staff status")
      throw error
    } finally {
      setLoading(false)
    }
  }

  // ------------------------------------------------------------------
  // Simple counts for dashboard cards & quick stats
  const getStaffSummary = (): StaffSummary => {
    const totalStaff = staff.length
    const doctorCount = staff.filter((s) => s.role === "doctor").length
    const nurseCount = staff.filter((s) => s.role === "nurse").length
    const receptionistCount = staff.filter((s) => s.role === "receptionist").length
    const labTechCount = staff.filter((s) => s.role === "lab_technician").length
    const activeStaff = staff.filter((s) => s.status === "active").length
    const onLeaveStaff = staff.filter((s) => s.status === "on_leave").length

    return {
      totalStaff,
      doctorCount,
      nurseCount,
      receptionistCount,
      labTechCount,
      activeStaff,
      onLeaveStaff,
    }
  }

  return {
    staff,
    loading,
    error,
    addStaffMember,
    updateStaffMember,
    deleteStaffMember,
    getStaffByRole,
    getStaffByDepartment,
    resetStaffPassword,
    updateStaffStatus,
    filterStaff,
    getStaffSummary,
  }
}

export function useStaffSchedule(staffId: string) {
  const [schedule, setSchedule] = useState<StaffSchedule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!staffId) return

    const q = query(collection(db, "staff", staffId, "schedule"), orderBy("dayOfWeek", "asc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate
            ? data.createdAt.toDate()
            : data.createdAt instanceof Date
              ? data.createdAt
              : new Date(),
          updatedAt: data.updatedAt?.toDate
            ? data.updatedAt.toDate()
            : data.updatedAt instanceof Date
              ? data.updatedAt
              : new Date(),
        }
      }) as StaffSchedule[]

      setSchedule(data)
      setLoading(false)
    })

    return unsubscribe
  }, [staffId])

  const updateSchedule = async (scheduleData: Omit<StaffSchedule, "id" | "createdAt" | "updatedAt">[]) => {
    try {
      // Delete existing schedule
      const existingSchedule = schedule
      for (const item of existingSchedule) {
        await deleteDoc(doc(db, "staff", staffId, "schedule", item.id))
      }

      // Add new schedule
      for (const item of scheduleData) {
        await addDoc(collection(db, "staff", staffId, "schedule"), {
          ...item,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      }

      toast.success("Schedule updated successfully!")
    } catch (error: any) {
      console.error("Error updating schedule:", error)
      toast.error(error.message || "Failed to update schedule")
      throw error
    }
  }

  return {
    schedule,
    loading,
    updateSchedule,
  }
}
