"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, updateDoc } from "firebase/firestore"
import { useAuth } from "@/contexts/auth-context"

export function ChangePassword() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const validateForm = () => {
    if (!formData.currentPassword) {
      toast.error("Current password is required")
      return false
    }
    if (!formData.newPassword) {
      toast.error("New password is required")
      return false
    }
    if (formData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters")
      return false
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match")
      return false
    }
    if (formData.currentPassword === formData.newPassword) {
      toast.error("New password must be different from current password")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !user) return

    setLoading(true)
    try {
      const currentUser = auth.currentUser
      if (!currentUser) {
        throw new Error("No authenticated user")
      }

      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(currentUser.email!, formData.currentPassword)
      await reauthenticateWithCredential(currentUser, credential)

      // Update password in Firebase Auth
      await updatePassword(currentUser, formData.newPassword)

      // Update password in Firestore (for staff records)
      if (user.role !== "patient") {
        const staffRef = doc(db, "staff", user.uid)
        await updateDoc(staffRef, {
          password: formData.newPassword,
          updatedAt: new Date(),
        })
      }

      // Update user record
      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, {
        updatedAt: new Date(),
      })

      toast.success("Password updated successfully")
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error: any) {
      console.error("Password change error:", error)

      let errorMessage = "Failed to update password"
      if (error.code === "auth/wrong-password") {
        errorMessage = "Current password is incorrect"
      } else if (error.code === "auth/weak-password") {
        errorMessage = "New password is too weak"
      } else if (error.code === "auth/requires-recent-login") {
        errorMessage = "Please log out and log back in before changing your password"
      }

      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Change Password
        </CardTitle>
        <CardDescription>
          Update your account password. You'll need to enter your current password to confirm.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords.current ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility("current")}
              >
                {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPasswords.new ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => handleInputChange("newPassword", e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility("new")}
              >
                {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility("confirm")}
              >
                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Alert>
            <AlertDescription>
              Your password must be at least 6 characters long and different from your current password.
            </AlertDescription>
          </Alert>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Updating Password..." : "Update Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
