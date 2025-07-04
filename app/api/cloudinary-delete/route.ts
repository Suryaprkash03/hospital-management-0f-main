import { type NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const { publicId } = await request.json()

    if (!publicId) {
      return NextResponse.json({ error: "Public ID is required" }, { status: 400 })
    }

    const result = await cloudinary.uploader.destroy(publicId)

    if (result.result === "ok") {
      return NextResponse.json({ success: true })
    } else {
      throw new Error("Failed to delete from Cloudinary")
    }
  } catch (error) {
    console.error("Cloudinary delete error:", error)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}
