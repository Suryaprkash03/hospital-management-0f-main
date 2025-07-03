"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Bed, User, Calendar, FileText, Activity } from "lucide-react"
import type { Visit } from "@/lib/types"
import { calculateLengthOfStay } from "@/lib/visit-utils"
import { useAuth } from "@/contexts/auth-context"

interface InpatientMonitoringProps {
  activeIPDVisits: Visit[]
  onViewVisit: (visit: Visit) => void
  onDischargePatient: (visit: Visit) => void
}

export function InpatientMonitoring({ activeIPDVisits, onViewVisit, onDischargePatient }: InpatientMonitoringProps) {
  const { user } = useAuth()
  const canDischarge = user?.role === "admin" || user?.role === "doctor"

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active IPD Patients</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeIPDVisits.length}</div>
            <p className="text-xs text-muted-foreground">Currently admitted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Cases</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Requiring attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Long Stay</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeIPDVisits.filter((v) => calculateLengthOfStay(v.visitDate) > 7).length}
            </div>
            <p className="text-xs text-muted-foreground">{">"}7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expected Discharge</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                activeIPDVisits.filter((v) => {
                  if (!v.expectedDischargeDate) return false
                  const today = new Date()
                  const expected = new Date(v.expectedDischargeDate)
                  return expected <= today
                }).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Due today or overdue</p>
          </CardContent>
        </Card>
      </div>

      {/* Active IPD Patients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Currently Admitted Patients</CardTitle>
          <CardDescription>Monitor and manage inpatient care</CardDescription>
        </CardHeader>
        <CardContent>
          {activeIPDVisits.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Bed</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Diagnosis</TableHead>
                    <TableHead>Admission Date</TableHead>
                    <TableHead>Length of Stay</TableHead>
                    <TableHead>Expected Discharge</TableHead>
                    <TableHead>Assigned Nurse</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeIPDVisits.map((visit) => {
                    const lengthOfStay = calculateLengthOfStay(visit.visitDate)
                    const isOverdue = visit.expectedDischargeDate && new Date(visit.expectedDischargeDate) < new Date()

                    return (
                      <TableRow key={visit.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {visit.patientName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Bed className="h-4 w-4 text-muted-foreground" />
                            Bed {visit.bedNumber}
                            <span className="text-muted-foreground">Room {visit.roomNumber}</span>
                          </div>
                        </TableCell>
                        <TableCell>Dr. {visit.doctorName}</TableCell>
                        <TableCell className="max-w-xs truncate">{visit.diagnosis}</TableCell>
                        <TableCell>{visit.visitDate.toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={lengthOfStay > 7 ? "destructive" : "secondary"}>{lengthOfStay} days</Badge>
                        </TableCell>
                        <TableCell>
                          {visit.expectedDischargeDate ? (
                            <Badge variant={isOverdue ? "destructive" : "outline"}>
                              {visit.expectedDischargeDate.toLocaleDateString()}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">Not set</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {visit.assignedNurseName || <span className="text-muted-foreground">Not assigned</span>}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={() => onViewVisit(visit)}>
                              View
                            </Button>
                            {canDischarge && (
                              <Button size="sm" onClick={() => onDischargePatient(visit)}>
                                Discharge
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Bed className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No patients currently admitted</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
