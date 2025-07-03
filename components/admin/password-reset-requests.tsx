"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Clock, Mail, User, CheckCircle, XCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "sonner"

interface PasswordResetRequest {
  id: string
  email: string
  role: string
  message?: string
  status: "pending" | "resolved" | "rejected"
  createdAt: Date
  resolvedAt?: Date
  resolvedBy?: string
}

export function PasswordResetRequests() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<PasswordResetRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role !== "admin") return

    const q = query(collection(db, "password_reset_requests"), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requestsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        resolvedAt: doc.data().resolvedAt?.toDate(),
      })) as PasswordResetRequest[]

      setRequests(requestsData)
      setLoading(false)
    })

    return unsubscribe
  }, [user])

  const handleResolveRequest = async (requestId: string, status: "resolved" | "rejected") => {
    try {
      await updateDoc(doc(db, "password_reset_requests", requestId), {
        status,
        resolvedAt: new Date(),
        resolvedBy: user?.uid,
      })

      toast.success(`Request ${status} successfully`)
    } catch (error) {
      console.error("Error updating request:", error)
      toast.error("Failed to update request")
    }
  }

  if (user?.role !== "admin") {
    return (
      <Alert>
        <AlertDescription>You don't have permission to access this feature. Admin access required.</AlertDescription>
      </Alert>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading password reset requests...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const pendingRequests = requests.filter((req) => req.status === "pending")
  const resolvedRequests = requests.filter((req) => req.status !== "pending")

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Clock className="h-4 w-4 text-white" />
            </div>
            Pending Password Reset Requests
            {pendingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingRequests.length}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>Review and manage password reset requests from staff members.</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No pending requests</h3>
              <p className="text-muted-foreground">All password reset requests have been handled.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{request.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {request.role.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground max-w-xs truncate">
                          {request.message || "No message provided"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {request.createdAt.toLocaleDateString()} at {request.createdAt.toLocaleTimeString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResolveRequest(request.id, "resolved")}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Resolve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResolveRequest(request.id, "rejected")}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {resolvedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
              Recent Activity
            </CardTitle>
            <CardDescription>Recently resolved password reset requests.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Resolved</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resolvedRequests.slice(0, 10).map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{request.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={request.status === "resolved" ? "default" : "destructive"}
                          className="capitalize"
                        >
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {request.resolvedAt?.toLocaleDateString()} at {request.resolvedAt?.toLocaleTimeString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
