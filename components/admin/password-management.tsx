"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, Key, RefreshCw, Shield } from "lucide-react"
import { toast } from "sonner"
import type { Staff } from "@/lib/types"

interface PasswordManagementProps {
  staff: Staff
  onPasswordUpdate?: () => void
}

export function PasswordManagement({ staff, onPasswordUpdate }: PasswordManagementProps) {
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setNewPassword(password)
  }

  const handlePasswordReset = async () => {
    if (!newPassword.trim()) {
      toast.error("Please enter a password")
      return
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/admin/reset-staff-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          staffId: staff.id,
          email: staff.email,
          newPassword,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to reset password")
      }

      toast.success("Password updated successfully")
      setOpen(false)
      setNewPassword("")
      onPasswordUpdate?.()
    } catch (error) {
      console.error("Password reset error:", error)
      toast.error("Failed to reset password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Key className="h-4 w-4 mr-2" />
          Manage Password
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Password Management
          </DialogTitle>
          <DialogDescription>
            Manage password for {staff.firstName} {staff.lastName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium">Current Status</p>
              <p className="text-xs text-muted-foreground">{staff.email}</p>
            </div>
            <Badge variant={staff.password ? "default" : "secondary"}>
              {staff.password ? "Auth Enabled" : "No Auth"}
            </Badge>
          </div>

          {staff.password && (
            <div className="space-y-2">
              <Label>Current Password</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={staff.password}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button type="button" variant="outline" size="sm" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="newPassword"
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="font-mono text-sm"
              />
              <Button type="button" variant="outline" size="sm" onClick={generateRandomPassword}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Minimum 6 characters. Click refresh to generate random password.
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePasswordReset} disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
