"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { User, Phone, Mail, Calendar, Edit, Trash2, Clock, Award, Briefcase, GraduationCap } from "lucide-react"
import type { StaffMember } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { useStaffSchedule } from "@/hooks/use-staff"
import { formatStaffName, getStatusColor, getRoleColor, getDayName, formatTime } from "@/lib/staff-utils"

interface StaffProfileProps {
  staff: StaffMember
  onEdit: () => void
  onDelete: () => void
  onManageSchedule: () => void
  onClose: () => void
}

export function StaffProfile({ staff, onEdit, onDelete, onManageSchedule, onClose }: StaffProfileProps) {
  const { user } = useAuth()
  const { schedule, loading: scheduleLoading } = useStaffSchedule(staff.id)

  const canEdit = user?.role === "admin" || user?.uid === staff.id
  const canDelete = user?.role === "admin"
  const canManageSchedule = user?.role === "admin" && (staff.role === "doctor" || staff.role === "nurse")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {formatStaffName(staff.firstName, staff.lastName, staff.role)}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-muted-foreground">Staff ID: {staff.staffId}</p>
            <Badge className={getRoleColor(staff.role)}>{staff.role.replace("_", " ")}</Badge>
            <Badge className={getStatusColor(staff.status)}>{staff.status.replace("_", " ")}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canManageSchedule && (
            <Button variant="outline" onClick={onManageSchedule}>
              <Calendar className="h-4 w-4 mr-2" />
              Manage Schedule
            </Button>
          )}
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

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
          {(staff.role === "doctor" || staff.role === "nurse") && <TabsTrigger value="schedule">Schedule</TabsTrigger>}
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
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                  <p className="text-lg">
                    {staff.firstName} {staff.lastName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{staff.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{staff.email}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Department</p>
                  <p className="text-lg">{staff.department}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Hire Date</p>
                  <p className="text-lg">{staff.hireDate.toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>

            {/* Role-specific Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Role Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {staff.role === "doctor" && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Specialization</p>
                      <p className="text-lg">{staff.specialization}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">License Number</p>
                      <p className="text-lg">{staff.licenseNumber}</p>
                    </div>
                    {staff.consultationFee && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Consultation Fee</p>
                        <p className="text-lg">${staff.consultationFee}</p>
                      </div>
                    )}
                    {staff.experience && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Experience</p>
                        <p className="text-lg">{staff.experience} years</p>
                      </div>
                    )}
                  </>
                )}

                {staff.role === "nurse" && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Shift</p>
                      <Badge variant="outline" className="mt-1">
                        {staff.shift?.replace("_", " ")}
                      </Badge>
                    </div>
                    {staff.assignedWards && staff.assignedWards.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Assigned Wards</p>
                        <div className="flex flex-wrap gap-2">
                          {staff.assignedWards.map((ward) => (
                            <Badge key={ward} variant="secondary">
                              {ward}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {staff.nursingLicense && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Nursing License</p>
                        <p className="text-lg">{staff.nursingLicense}</p>
                      </div>
                    )}
                  </>
                )}

                {staff.role === "receptionist" && (
                  <>
                    {staff.deskLocation && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Desk Location</p>
                        <p className="text-lg">{staff.deskLocation}</p>
                      </div>
                    )}
                    {staff.languages && staff.languages.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Languages</p>
                        <div className="flex flex-wrap gap-2">
                          {staff.languages.map((language) => (
                            <Badge key={language} variant="secondary">
                              {language}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {staff.role === "lab_technician" && (
                  <>
                    {staff.assignedTests && staff.assignedTests.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Assigned Tests</p>
                        <div className="flex flex-wrap gap-2">
                          {staff.assignedTests.map((test) => (
                            <Badge key={test} variant="secondary">
                              {test}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {staff.certifications && staff.certifications.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Certifications</p>
                        <div className="flex flex-wrap gap-2">
                          {staff.certifications.map((cert) => (
                            <Badge key={cert} variant="outline">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="professional" className="space-y-4">
          {staff.role === "doctor" && staff.biography && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Biography
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{staff.biography}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Professional Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Employee Since</p>
                  <p className="text-lg">{staff.hireDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Status</p>
                  <Badge className={getStatusColor(staff.status)}>{staff.status.replace("_", " ")}</Badge>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                <p className="text-sm">{staff.updatedAt.toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {(staff.role === "doctor" || staff.role === "nurse") && (
          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Weekly Schedule
                </CardTitle>
                <CardDescription>Current availability and working hours</CardDescription>
              </CardHeader>
              <CardContent>
                {scheduleLoading ? (
                  <p>Loading schedule...</p>
                ) : schedule.length > 0 ? (
                  <div className="space-y-3">
                    {schedule.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="font-medium">{getDayName(item.dayOfWeek)}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatTime(item.startTime)} - {formatTime(item.endTime)}
                          </div>
                        </div>
                        <Badge variant={item.isAvailable ? "default" : "secondary"}>
                          {item.isAvailable ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No schedule configured</p>
                    <p className="text-sm text-muted-foreground">Schedule will appear here when configured</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
