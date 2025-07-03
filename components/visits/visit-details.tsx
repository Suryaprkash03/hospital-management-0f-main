"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { User, Stethoscope, Calendar, FileText, Pill, Bed, Activity, Edit, Trash2, Download, Plus } from "lucide-react"
import type { Visit } from "@/lib/types"
import { getVisitStatusColor, getVisitTypeColor, calculateLengthOfStay, formatVitals } from "@/lib/visit-utils"
import { useAuth } from "@/contexts/auth-context"
import { useVisitVitals } from "@/hooks/use-visits"
import { VitalsForm } from "./vitals-form"

interface VisitDetailsProps {
  visit: Visit
  onEdit: () => void
  onDelete: () => void
  onDischarge?: () => void
  onClose: () => void
}

export function VisitDetails({ visit, onEdit, onDelete, onDischarge, onClose }: VisitDetailsProps) {
  const { user } = useAuth()
  const { vitals, addVitals } = useVisitVitals(visit.id)
  const [showVitalsForm, setShowVitalsForm] = useState(false)

  const canEdit = user?.role === "admin" || user?.role === "doctor"
  const canDelete = user?.role === "admin"
  const canDischarge =
    (user?.role === "admin" || user?.role === "doctor") && visit.visitType === "ipd" && visit.status === "active"
  const canAddVitals =
    (user?.role === "doctor" || user?.role === "nurse") && visit.visitType === "ipd" && visit.status === "active"

  const handleVitalsSubmit = async (vitalsData: any) => {
    try {
      await addVitals({
        visitId: visit.id,
        recordedBy: user?.uid || "",
        ...vitalsData,
      })
      setShowVitalsForm(false)
    } catch (error) {
      console.error("Error adding vitals:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visit Details</h1>
          <p className="text-muted-foreground">Visit ID: {visit.visitId}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {canEdit && (
            <Button variant="outline" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {canDischarge && (
            <Button onClick={onDischarge}>
              <FileText className="h-4 w-4 mr-2" />
              Discharge
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

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="medical">Medical Details</TabsTrigger>
          {visit.visitType === "ipd" && <TabsTrigger value="vitals">Vitals</TabsTrigger>}
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Visit Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Visit Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Type</p>
                    <Badge className={getVisitTypeColor(visit.visitType)}>{visit.visitType.toUpperCase()}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <Badge className={getVisitStatusColor(visit.status)}>{visit.status}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Visit Date</p>
                    <p className="text-lg">{visit.visitDate.toLocaleDateString()}</p>
                  </div>
                  {visit.visitType === "ipd" && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Length of Stay</p>
                      <p className="text-lg">
                        {calculateLengthOfStay(visit.visitDate, visit.actualDischargeDate)} days
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Patient Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Patient Name</p>
                  <p className="text-lg font-medium">{visit.patientName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Doctor</p>
                  <p className="text-lg">Dr. {visit.doctorName}</p>
                  <p className="text-sm text-muted-foreground">{visit.doctorSpecialization}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* IPD Specific Information */}
          {visit.visitType === "ipd" && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bed className="h-4 w-4" />
                    Bed Assignment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Bed Number</p>
                      <p className="text-lg">{visit.bedNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Room</p>
                      <p className="text-lg">{visit.roomNumber}</p>
                    </div>
                  </div>
                  {visit.assignedNurseName && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Assigned Nurse</p>
                      <p className="text-lg">{visit.assignedNurseName}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Admission Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Admission Reason</p>
                    <p className="text-sm">{visit.admissionReason}</p>
                  </div>
                  {visit.expectedDischargeDate && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Expected Discharge</p>
                      <p className="text-lg">{visit.expectedDischargeDate.toLocaleDateString()}</p>
                    </div>
                  )}
                  {visit.actualDischargeDate && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Actual Discharge</p>
                      <p className="text-lg">{visit.actualDischargeDate.toLocaleDateString()}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="medical" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Symptoms & Diagnosis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Medical Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Symptoms</p>
                  <p className="whitespace-pre-wrap">{visit.symptoms}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Diagnosis</p>
                  <p className="whitespace-pre-wrap">{visit.diagnosis}</p>
                </div>
              </CardContent>
            </Card>

            {/* Prescribed Medicines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-4 w-4" />
                  Prescribed Medicines
                </CardTitle>
              </CardHeader>
              <CardContent>
                {visit.prescribedMedicines && visit.prescribedMedicines.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {visit.prescribedMedicines.map((medicine, index) => (
                      <Badge key={index} variant="outline">
                        {medicine}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No medicines prescribed</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Additional Notes */}
          {visit.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{visit.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {visit.visitType === "ipd" && (
          <TabsContent value="vitals" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Patient Vitals</h3>
              {canAddVitals && (
                <Button onClick={() => setShowVitalsForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Record Vitals
                </Button>
              )}
            </div>

            {showVitalsForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Record New Vitals</CardTitle>
                </CardHeader>
                <CardContent>
                  <VitalsForm onSubmit={handleVitalsSubmit} onCancel={() => setShowVitalsForm(false)} />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Vitals History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {vitals.length > 0 ? (
                  <div className="space-y-4">
                    {vitals.map((vital) => (
                      <div key={vital.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">
                            {vital.recordedAt.toLocaleDateString()} at {vital.recordedAt.toLocaleTimeString()}
                          </h4>
                          <Badge variant="outline">Recorded by Staff</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {vital.bloodPressure && (
                            <div>
                              <span className="text-muted-foreground">BP:</span> {vital.bloodPressure}
                            </div>
                          )}
                          {vital.temperature && (
                            <div>
                              <span className="text-muted-foreground">Temp:</span> {vital.temperature}°F
                            </div>
                          )}
                          {vital.heartRate && (
                            <div>
                              <span className="text-muted-foreground">HR:</span> {vital.heartRate} bpm
                            </div>
                          )}
                          {vital.oxygenSaturation && (
                            <div>
                              <span className="text-muted-foreground">SpO2:</span> {vital.oxygenSaturation}%
                            </div>
                          )}
                        </div>
                        {vital.notes && <p className="text-sm text-muted-foreground mt-2">{vital.notes}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No vitals recorded yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visit Timeline</CardTitle>
              <CardDescription>Chronological record of visit events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Visit Created</p>
                    <p className="text-sm text-muted-foreground">
                      {visit.createdAt.toLocaleDateString()} at {visit.createdAt.toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {visit.visitType === "ipd" && visit.bedNumber && (
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Bed Assigned</p>
                      <p className="text-sm text-muted-foreground">
                        Bed {visit.bedNumber} in Room {visit.roomNumber}
                      </p>
                    </div>
                  </div>
                )}

                {vitals.map((vital) => (
                  <div key={vital.id} className="flex items-start gap-4">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Vitals Recorded</p>
                      <p className="text-sm text-muted-foreground">
                        {vital.recordedAt.toLocaleDateString()} at {vital.recordedAt.toLocaleTimeString()}
                      </p>
                      <p className="text-sm">{formatVitals(vital)}</p>
                    </div>
                  </div>
                ))}

                {visit.actualDischargeDate && (
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Patient Discharged</p>
                      <p className="text-sm text-muted-foreground">
                        {visit.actualDischargeDate.toLocaleDateString()} at{" "}
                        {visit.actualDischargeDate.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
