"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { QRCodeSVG } from "qrcode.react"
import { User, Phone, Mail, MapPin, Heart, AlertTriangle, FileText, Edit, Trash2, QrCode } from "lucide-react"
import type { Patient } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { useMedicalHistory } from "@/hooks/use-patients"
import { formatPhoneNumber } from "@/lib/patient-utils"

interface PatientProfileProps {
  patient: Patient
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}

export function PatientProfile({ patient, onEdit, onDelete, onClose }: PatientProfileProps) {
  const { user } = useAuth()
  const { history, loading: historyLoading } = useMedicalHistory(patient.id)
  const [showQR, setShowQR] = useState(false)

  const canEdit = user?.role === "admin" || user?.role === "receptionist"
  const canDelete = user?.role === "admin"
  const canAddNotes = user?.role === "doctor" || user?.role === "admin"

  const qrData = JSON.stringify({
    patientId: patient.patientId,
    name: `${patient.firstName} ${patient.lastName}`,
    id: patient.id,
  })

  const getStatusBadge = (status: string) => {
    return <Badge variant={status === "active" ? "default" : "secondary"}>{status}</Badge>
  }

  const getGenderBadge = (gender: string) => {
    const colors = {
      male: "bg-blue-100 text-blue-800",
      female: "bg-pink-100 text-pink-800",
      other: "bg-gray-100 text-gray-800",
    }

    return <Badge className={colors[gender as keyof typeof colors] || colors.other}>{gender}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {patient.firstName} {patient.lastName}
          </h1>
          <p className="text-muted-foreground">Patient ID: {patient.patientId}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowQR(!showQR)}>
            <QrCode className="h-4 w-4 mr-2" />
            QR Code
          </Button>
          {canEdit && (
            <Button variant="outline" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {canDelete && (
            <Button variant="destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <Card>
          <CardHeader>
            <CardTitle>Patient QR Code</CardTitle>
            <CardDescription>Scan this code for quick patient check-in</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <QRCodeSVG value={qrData} size={200} />
            <div className="text-center">
              <p className="font-medium">
                {patient.firstName} {patient.lastName}
              </p>
              <p className="text-sm text-muted-foreground">{patient.patientId}</p>
            </div>
            <Button onClick={() => setShowQR(false)}>Close</Button>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="medical">Medical History</TabsTrigger>
          <TabsTrigger value="visits">Visit History</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Age</p>
                    <p className="text-lg">{patient.age} years</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Gender</p>
                    <div className="mt-1">{getGenderBadge(patient.gender)}</div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Blood Group</p>
                    <Badge variant="outline" className="mt-1">
                      {patient.bloodGroup}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <div className="mt-1">{getStatusBadge(patient.status)}</div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                  <p className="text-lg">{new Date(patient.dateOfBirth).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{formatPhoneNumber(patient.phone)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.email}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <span>{patient.address}</span>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Emergency Contact</p>
                  <div className="space-y-1">
                    <p className="font-medium">{patient.emergencyContactName}</p>
                    <p className="text-sm text-muted-foreground">{formatPhoneNumber(patient.emergencyContact)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="medical" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Allergies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Allergies
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patient.allergies && patient.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {patient.allergies.map((allergy) => (
                      <Badge key={allergy} variant="destructive">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No known allergies</p>
                )}
              </CardContent>
            </Card>

            {/* Chronic Conditions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Chronic Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patient.chronicConditions && patient.chronicConditions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {patient.chronicConditions.map((condition) => (
                      <Badge key={condition} variant="secondary">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No chronic conditions</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Medical Notes */}
          {patient.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Medical Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{patient.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="visits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visit History</CardTitle>
              <CardDescription>Patient's medical visit records</CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <p>Loading visit history...</p>
              ) : history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((record) => (
                    <div key={record.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{record.title}</h4>
                        <Badge variant="outline">{record.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{record.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Dr. {record.doctor}</span>
                        <span>{record.date.toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No visit history available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Medical Reports
              </CardTitle>
              <CardDescription>Uploaded medical documents and test results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No reports available</p>
                <p className="text-sm text-muted-foreground">Medical reports will appear here when uploaded</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
