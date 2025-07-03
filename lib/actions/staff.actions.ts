"use server"

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { db, auth } from "@/lib/firebase"
import type { StaffMember } from "@/lib/types"
import { generateStaffId } from "@/lib/staff-utils"

export async function createStaffMember(staffData: Omit<StaffMember, "id" | "staffId" | "createdAt" | "updatedAt">) {
  try {
    // Generate staff ID
    const staffId = generateStaffId(staffData.role)

    // Prepare staff data
    const newStaffData = {
      ...staffData,
      staffId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    // If password is provided, create Firebase Auth user
    if ((staffData as any).password) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, staffData.email, (staffData as any).password)

        // Add Firebase UID to staff data
        newStaffData.firebaseUid = userCredential.user.uid
        newStaffData.hasFirebaseAuth = true

        // Create user profile
        await addDoc(collection(db, "users"), {
          uid: userCredential.user.uid,
          email: staffData.email,
          role: staffData.role,
          firstName: staffData.firstName,
          lastName: staffData.lastName,
          profileCompleted: true,
          mustChangePassword: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      } catch (authError) {
        console.error("Firebase Auth error:", authError)
        // Continue with staff creation even if auth fails
        newStaffData.hasFirebaseAuth = false
        newStaffData.authError = (authError as Error).message
      }
    }

    // Create staff record
    const docRef = await addDoc(collection(db, "staff"), newStaffData)

    return {
      success: true,
      id: docRef.id,
      staffId,
      message: "Staff member created successfully",
    }
  } catch (error) {
    console.error("Error creating staff member:", error)
    return {
      success: false,
      error: (error as Error).message,
    }
  }
}

export async function updateStaffMember(id: string, staffData: Partial<StaffMember>) {
  try {
    const staffRef = doc(db, "staff", id)

    const updateData = {
      ...staffData,
      updatedAt: serverTimestamp(),
    }

    await updateDoc(staffRef, updateData)

    return {
      success: true,
      message: "Staff member updated successfully",
    }
  } catch (error) {
    console.error("Error updating staff member:", error)
    return {
      success: false,
      error: (error as Error).message,
    }
  }
}

export async function deleteStaffMember(id: string) {
  try {
    await deleteDoc(doc(db, "staff", id))

    return {
      success: true,
      message: "Staff member deleted successfully",
    }
  } catch (error) {
    console.error("Error deleting staff member:", error)
    return {
      success: false,
      error: (error as Error).message,
    }
  }
}

export async function getStaffMember(id: string) {
  try {
    const docRef = doc(db, "staff", id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        success: true,
        data: {
          id: docSnap.id,
          ...data,
          hireDate: data.hireDate?.toDate?.() || data.hireDate,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        } as StaffMember,
      }
    } else {
      return {
        success: false,
        error: "Staff member not found",
      }
    }
  } catch (error) {
    console.error("Error getting staff member:", error)
    return {
      success: false,
      error: (error as Error).message,
    }
  }
}

export async function getAllStaff() {
  try {
    const q = query(collection(db, "staff"), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    const staff = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        hireDate: data.hireDate?.toDate?.() || data.hireDate,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      }
    }) as StaffMember[]

    return {
      success: true,
      data: staff,
    }
  } catch (error) {
    console.error("Error getting all staff:", error)
    return {
      success: false,
      error: (error as Error).message,
    }
  }
}

export async function getStaffByRole(role: string) {
  try {
    const q = query(collection(db, "staff"), where("role", "==", role), orderBy("firstName", "asc"))
    const querySnapshot = await getDocs(q)

    const staff = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        hireDate: data.hireDate?.toDate?.() || data.hireDate,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      }
    }) as StaffMember[]

    return {
      success: true,
      data: staff,
    }
  } catch (error) {
    console.error("Error getting staff by role:", error)
    return {
      success: false,
      error: (error as Error).message,
    }
  }
}

export async function getStaffByDepartment(department: string) {
  try {
    const q = query(collection(db, "staff"), where("department", "==", department), orderBy("firstName", "asc"))
    const querySnapshot = await getDocs(q)

    const staff = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        hireDate: data.hireDate?.toDate?.() || data.hireDate,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      }
    }) as StaffMember[]

    return {
      success: true,
      data: staff,
    }
  } catch (error) {
    console.error("Error getting staff by department:", error)
    return {
      success: false,
      error: (error as Error).message,
    }
  }
}

export async function resetStaffPassword(staffId: string, newPassword: string) {
  try {
    const staffRef = doc(db, "staff", staffId)

    await updateDoc(staffRef, {
      password: newPassword,
      mustChangePassword: true,
      passwordUpdatedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return {
      success: true,
      message: "Password reset successfully",
    }
  } catch (error) {
    console.error("Error resetting password:", error)
    return {
      success: false,
      error: (error as Error).message,
    }
  }
}

export async function updateStaffStatus(staffId: string, status: "active" | "inactive" | "on_leave") {
  try {
    const staffRef = doc(db, "staff", staffId)

    await updateDoc(staffRef, {
      status,
      updatedAt: serverTimestamp(),
    })

    return {
      success: true,
      message: "Staff status updated successfully",
    }
  } catch (error) {
    console.error("Error updating staff status:", error)
    return {
      success: false,
      error: (error as Error).message,
    }
  }
}
