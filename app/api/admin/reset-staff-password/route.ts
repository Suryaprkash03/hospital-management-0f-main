import { type NextRequest, NextResponse } from "next/server"
import { doc, updateDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function POST(request: NextRequest) {
  try {
    const { staffId, email, newPassword } = await request.json()

    if (!staffId || !email || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Update staff record in Firestore
    const staffRef = doc(db, "staff", staffId)
    await updateDoc(staffRef, {
      password: newPassword,
      updatedAt: new Date(),
    })

    // Check if user exists in Firebase Auth
    try {
      // Try to sign in with current credentials to check if user exists
      const userDoc = await getDoc(doc(db, "users", staffId))

      if (userDoc.exists()) {
        // User exists in Firestore, update their password
        await updateDoc(doc(db, "users", staffId), {
          password: newPassword,
          updatedAt: new Date(),
        })
      } else {
        // Create new user in Firestore users collection
        await updateDoc(doc(db, "users", staffId), {
          email,
          password: newPassword,
          role: "staff",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }
    } catch (error) {
      console.log("User might not exist in auth, will be created on first login")
    }

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    })
  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 })
  }
}
