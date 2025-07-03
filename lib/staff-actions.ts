import { toast } from "sonner"

export async function createStaffAccount(staffData: any) {
  try {
    const response = await fetch("/api/admin/create-staff", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(staffData),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || "Failed to create staff account")
    }

    toast.success("Staff account created successfully!")
    return { success: true, data: result }
  } catch (error: any) {
    console.error("Error creating staff account:", error)
    toast.error(error.message || "Failed to create staff account")
    return { success: false, error: error.message }
  }
}

export async function resetStaffPassword(staffId: string, email: string, newPassword: string) {
  try {
    const response = await fetch("/api/admin/reset-staff-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        staffId,
        email,
        newPassword,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || "Failed to reset password")
    }

    toast.success("Password reset successfully!")
    return { success: true, data: result }
  } catch (error: any) {
    console.error("Error resetting password:", error)
    toast.error(error.message || "Failed to reset password")
    return { success: false, error: error.message }
  }
}
