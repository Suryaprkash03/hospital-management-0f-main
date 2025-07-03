import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const patientId = formData.get("patientId") as string
    const reportId = formData.get("reportId") as string

    if (!file || !patientId || !reportId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate file type and size
    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 })
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size too large" }, { status: 400 })
    }

    // Convert file to base64 for upload to ImgBB
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")

    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split(".").pop()
    const fileName = `${reportId}_${timestamp}.${extension}`

    // Upload to ImgBB (free image hosting service)
    const imgbbFormData = new FormData()
    imgbbFormData.append("image", base64)
    imgbbFormData.append("name", fileName)

    const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, {
      method: "POST",
      body: imgbbFormData,
    })

    if (!imgbbResponse.ok) {
      throw new Error("Failed to upload to ImgBB")
    }

    const imgbbResult = await imgbbResponse.json()

    if (!imgbbResult.success) {
      throw new Error("ImgBB upload failed")
    }

    // Return the hosted URL
    const hostedUrl = imgbbResult.data.url

    return NextResponse.json({
      success: true,
      filePath: hostedUrl,
      fileName,
      deleteUrl: imgbbResult.data.delete_url, // For future deletion
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
