import { type NextRequest, NextResponse } from "next/server"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function POST(request: NextRequest) {
  try {
    const { email, role, message } = await request.json()

    // Validate required fields
    if (!email || !role) {
      return NextResponse.json({ error: "Email and role are required" }, { status: 400 })
    }

    // Create password reset request
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const requestData = {
      email,
      role,
      message: message || "",
      status: "pending",
      createdAt: serverTimestamp(),
    }

    await setDoc(doc(db, "password_reset_requests", requestId), requestData)

    return NextResponse.json({
      success: true,
      message: "Password reset request submitted successfully",
      requestId,
    })
  } catch (error: any) {
    console.error("Error creating password reset request:", error)
    return NextResponse.json({ error: "Failed to submit password reset request" }, { status: 500 })
  }
}
