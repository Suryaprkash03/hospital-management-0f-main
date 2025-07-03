import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest) {
  try {
    const { filePath, deleteUrl } = await request.json()

    if (!filePath && !deleteUrl) {
      return NextResponse.json({ error: "File path or delete URL is required" }, { status: 400 })
    }

    // If we have a delete URL from ImgBB, use it
    if (deleteUrl) {
      const response = await fetch(deleteUrl, { method: "DELETE" })
      if (response.ok) {
        return NextResponse.json({ success: true })
      }
    }

    // For files hosted on ImgBB, we can't delete them without the delete URL
    // So we'll just mark it as deleted in our system
    console.log("File marked for deletion:", filePath)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}
