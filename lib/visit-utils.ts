export function generateVisitId(): string {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 8)
  return `VIS-${timestamp}-${randomStr}`.toUpperCase()
}

export function formatVisitId(visitId: string): string {
  return visitId.replace(/(.{3})(.{8})(.{6})/, "$1-$2-$3")
}

export function getVisitStatusColor(status: string): string {
  switch (status) {
    case "active":
      return "bg-blue-100 text-blue-800"
    case "completed":
      return "bg-green-100 text-green-800"
    case "discharged":
      return "bg-purple-100 text-purple-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function getVisitTypeColor(type: string): string {
  switch (type) {
    case "opd":
      return "bg-emerald-100 text-emerald-800"
    case "ipd":
      return "bg-orange-100 text-orange-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function getBedStatusColor(status: string): string {
  switch (status) {
    case "available":
      return "bg-green-100 text-green-800"
    case "occupied":
      return "bg-red-100 text-red-800"
    case "maintenance":
      return "bg-yellow-100 text-yellow-800"
    case "reserved":
      return "bg-blue-100 text-blue-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function calculateLengthOfStay(admissionDate: Date, dischargeDate?: Date): number {
  const endDate = dischargeDate || new Date()
  const diffTime = Math.abs(endDate.getTime() - admissionDate.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function formatVitals(vitals: any): string {
  const parts = []
  if (vitals.bloodPressure) parts.push(`BP: ${vitals.bloodPressure}`)
  if (vitals.temperature) parts.push(`Temp: ${vitals.temperature}°F`)
  if (vitals.heartRate) parts.push(`HR: ${vitals.heartRate} bpm`)
  if (vitals.oxygenSaturation) parts.push(`SpO2: ${vitals.oxygenSaturation}%`)
  return parts.join(", ")
}

export function validateVitals(vitals: any): Record<string, string> {
  const errors: Record<string, string> = {}

  if (vitals.temperature && (vitals.temperature < 90 || vitals.temperature > 110)) {
    errors.temperature = "Temperature must be between 90-110°F"
  }

  if (vitals.heartRate && (vitals.heartRate < 30 || vitals.heartRate > 200)) {
    errors.heartRate = "Heart rate must be between 30-200 bpm"
  }

  if (vitals.respiratoryRate && (vitals.respiratoryRate < 8 || vitals.respiratoryRate > 40)) {
    errors.respiratoryRate = "Respiratory rate must be between 8-40 breaths/min"
  }

  if (vitals.oxygenSaturation && (vitals.oxygenSaturation < 70 || vitals.oxygenSaturation > 100)) {
    errors.oxygenSaturation = "Oxygen saturation must be between 70-100%"
  }

  return errors
}

export function generateDischargeSummaryPDF(summary: any): string {
  // This would integrate with a PDF generation library
  // For now, return a formatted text version
  return `
DISCHARGE SUMMARY

Patient: ${summary.patientName}
Doctor: ${summary.doctorName}
Admission Date: ${summary.admissionDate.toLocaleDateString()}
Discharge Date: ${summary.dischargeDate.toLocaleDateString()}

Final Diagnosis: ${summary.finalDiagnosis}

Treatment Given: ${summary.treatmentGiven}

Medicines at Discharge: ${summary.medicinesAtDischarge.join(", ")}

Follow-up Instructions: ${summary.followUpInstructions}

Final Notes: ${summary.finalNotes}
  `.trim()
}
