"use client"

import { useAuth } from "@/contexts/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddStaffForm } from "@/components/admin/add-staff-form"
import { PasswordResetRequests } from "@/components/admin/password-reset-requests"
import { UserPlus, AlertCircle, Users } from "lucide-react"
import { redirect } from "next/navigation"

export default function AdminStaffManagementPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
        <p className="text-muted-foreground">Create and manage staff accounts, handle password reset requests</p>
      </div>

      <Tabs defaultValue="add-staff" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="add-staff" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add Staff
          </TabsTrigger>
          <TabsTrigger value="reset-requests" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Reset Requests
          </TabsTrigger>
          <TabsTrigger value="manage-staff" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Manage Staff
          </TabsTrigger>
        </TabsList>

        <TabsContent value="add-staff">
          <AddStaffForm />
        </TabsContent>

        <TabsContent value="reset-requests">
          <PasswordResetRequests />
        </TabsContent>

        <TabsContent value="manage-staff">
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Staff management features will be available here. For now, use the main Staff page to manage existing
              staff.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
