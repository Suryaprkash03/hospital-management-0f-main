export const ALLOWED_FILE_TYPES = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
}

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function validateFile(file: File): { isValid: boolean; error?: string } {
  if (!ALLOWED_FILE_TYPES[file.type as keyof typeof ALLOWED_FILE_TYPES]) {
    return {
      isValid: false,
      error: "File type not allowed. Please upload PDF, JPEG, PNG, GIF, or WebP files.",
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: "File size too large. Maximum size is 10MB.",
    }
  }

  return { isValid: true }
}

export function generateReportPath(patientId: string, reportId: string, fileName: string): string {
  const timestamp = Date.now()
  const extension = fileName.split(".").pop()
  return `reports/${patientId}/${reportId}_${timestamp}.${extension}`
}

export async function uploadReportFile(
  file: File,
  patientId: string,
  reportId: string,
  onProgress?: (progress: number) => void,
): Promise<string> {
  const validation = validateFile(file)
  if (!validation.isValid) {
    throw new Error(validation.error)
  }

  try {
    onProgress?.(10)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("patientId", patientId)
    formData.append("reportId", reportId)

    onProgress?.(25)

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    onProgress?.(75)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Upload failed")
    }

    const result = await response.json()
    onProgress?.(100)

    console.log("✅ File uploaded successfully to online storage:", result.filePath)
    return result.filePath
  } catch (error) {
    console.error("💥 Upload error:", error)
    throw error
  }
}

export async function deleteReportFile(filePath: string, deleteUrl?: string): Promise<void> {
  try {
    const response = await fetch("/api/delete-file", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ filePath, deleteUrl }),
    })

    if (!response.ok) {
      throw new Error("Failed to delete file")
    }

    console.log("✅ File deleted successfully from online storage:", filePath)
  } catch (error) {
    console.error("💥 Error deleting file:", error)
    throw error
  }
}

export function getFileTypeIcon(fileType: string): string {
  if (fileType === "application/pdf") return "📄"
  if (fileType.startsWith("image/")) return "🖼️"
  return "📎"
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function isImageFile(fileType: string): boolean {
  return fileType.startsWith("image/")
}

export function isPDFFile(fileType: string): boolean {
  return fileType === "application/pdf"
}

// Helper function to extract file ID from hosted URL for deletion
export function extractFileIdFromUrl(url: string): string | null {
  try {
    // For ImgBB URLs, extract the file ID
    const match = url.match(/\/([^/]+)\.(jpg|jpeg|png|gif|webp|pdf)$/i)
    return match ? match[1] : null
  } catch {
    return null
  }
}
