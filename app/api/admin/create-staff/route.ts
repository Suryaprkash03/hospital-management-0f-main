import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/firebase"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, password, role, department, ...otherData } = body

    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Create staff record in Firestore
    const staffData = {
      id: user.uid,
      firstName,
      lastName,
      email,
      role,
      department,
      status: "active",
      mustChangePassword: true,
      firstLogin: true,
      loginCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...otherData,
    }

    await setDoc(doc(db, "staff", user.uid), staffData)

    return NextResponse.json({
      success: true,
      message: "Staff account created successfully",
      staffId: user.uid,
    })
  } catch (error: any) {
    console.error("Error creating staff account:", error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create staff account",
      },
      { status: 500 },
    )
  }
}
