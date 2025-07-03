// Alternative implementation using Cloudinary
export async function uploadToCloudinary(file: File, patientId: string, reportId: string): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "hospital_reports")
  formData.append("folder", `hospital/reports/${patientId}`)
  formData.append("public_id", `${reportId}_${Date.now()}`)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
    {
      method: "POST",
      body: formData,
    },
  )

  if (!response.ok) {
    throw new Error("Failed to upload to Cloudinary")
  }

  const result = await response.json()
  return result.secure_url
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  const response = await fetch("/api/cloudinary-delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ publicId }),
  })

  if (!response.ok) {
    throw new Error("Failed to delete from Cloudinary")
  }
}
