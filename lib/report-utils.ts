import type { ReportType } from "./types"

export function generateReportId(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `RPT-${timestamp}-${random}`.toUpperCase()
}

export function getReportTypeLabel(type: ReportType): string {
  const labels = {
    lab: "Laboratory",
    radiology: "Radiology",
    prescription: "Prescription",
    discharge: "Discharge Summary",
    consultation: "Consultation",
    other: "Other",
  }
  return labels[type] || type
}

export function getReportTypeColor(type: ReportType): string {
  const colors = {
    lab: "bg-blue-100 text-blue-800",
    radiology: "bg-purple-100 text-purple-800",
    prescription: "bg-green-100 text-green-800",
    discharge: "bg-orange-100 text-orange-800",
    consultation: "bg-indigo-100 text-indigo-800",
    other: "bg-gray-100 text-gray-800",
  }
  return colors[type] || colors.other
}

export function getStatusColor(status: string): string {
  const colors = {
    uploaded: "bg-blue-100 text-blue-800",
    pending_review: "bg-yellow-100 text-yellow-800",
    reviewed: "bg-green-100 text-green-800",
    archived: "bg-gray-100 text-gray-800",
  }
  return colors[status as keyof typeof colors] || colors.uploaded
}

export function getPriorityColor(priority: string): string {
  const colors = {
    normal: "bg-gray-100 text-gray-800",
    urgent: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800",
  }
  return colors[priority as keyof typeof colors] || colors.normal
}

export function getStatusLabel(status: string): string {
  const labels = {
    uploaded: "Uploaded",
    pending_review: "Pending Review",
    reviewed: "Reviewed",
    archived: "Archived",
  }
  return labels[status as keyof typeof labels] || status
}

export function getPriorityLabel(priority: string): string {
  const labels = {
    normal: "Normal",
    urgent: "Urgent",
    critical: "Critical",
  }
  return labels[priority as keyof typeof labels] || priority
}

export function canUserAccessReport(userRole: string, userId: string, report: any): boolean {
  // Admin can access all reports
  if (userRole === "admin") return true

  // Doctors can access reports they uploaded or for their patients
  if (userRole === "doctor") {
    return report.uploadedBy === userId || report.doctorId === userId
  }

  // Lab technicians can access lab reports they uploaded
  if (userRole === "lab_technician") {
    return report.uploadedBy === userId && report.reportType === "lab"
  }

  // Patients can only access their own reports
  if (userRole === "patient") {
    return report.patientId === userId
  }

  // Nurses can view reports for patients in their care
  if (userRole === "nurse") {
    return true // Implement specific nurse access logic based on ward assignments
  }

  return false
}

export function canUserUploadReport(userRole: string): boolean {
  return ["admin", "doctor", "lab_technician"].includes(userRole)
}

export function canUserDeleteReport(userRole: string, userId: string, report: any): boolean {
  // Admin can delete any report
  if (userRole === "admin") return true

  // Users can delete reports they uploaded
  return report.uploadedBy === userId
}

export function getAvailableTags(): string[] {
  return [
    "Urgent",
    "Critical",
    "Follow-up",
    "Routine",
    "Emergency",
    "Pre-operative",
    "Post-operative",
    "Chronic Care",
    "Preventive",
    "Diagnostic",
  ]
}
