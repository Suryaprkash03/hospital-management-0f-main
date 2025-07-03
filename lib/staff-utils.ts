// Staff utility functions
export function generateStaffId(role: string): string {
  const year = new Date().getFullYear()
  const randomNum = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")

  const rolePrefix =
    {
      doctor: "DOC",
      nurse: "NUR",
      receptionist: "REC",
      lab_technician: "LAB",
      admin: "ADM",
    }[role] || "STF"

  return `${rolePrefix}${year}${randomNum}`
}

export function formatStaffName(firstName: string, lastName: string, role: string): string {
  const title = role === "doctor" ? "Dr." : ""
  return `${title} ${firstName} ${lastName}`.trim()
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800"
    case "on_leave":
      return "bg-yellow-100 text-yellow-800"
    case "inactive":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function getRoleColor(role: string): string {
  switch (role) {
    case "doctor":
      return "bg-blue-100 text-blue-800"
    case "nurse":
      return "bg-green-100 text-green-800"
    case "receptionist":
      return "bg-purple-100 text-purple-800"
    case "lab_technician":
      return "bg-orange-100 text-orange-800"
    case "admin":
      return "bg-gray-100 text-gray-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function getDayName(dayNumber: number): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  return days[dayNumber] || ""
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":")
  const hour = Number.parseInt(hours)
  const ampm = hour >= 12 ? "PM" : "AM"
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

export function validateLicenseNumber(license: string, role: string): boolean {
  if (!license) return false

  // Basic validation - can be enhanced based on actual license formats
  switch (role) {
    case "doctor":
      return /^[A-Z]{2}\d{6}$/.test(license) // Example: MD123456
    case "nurse":
      return /^[A-Z]{2}\d{5}$/.test(license) // Example: RN12345
    default:
      return license.length >= 5
  }
}

export const departments = [
  "Cardiology",
  "Dermatology",
  "Emergency Medicine",
  "Family Medicine",
  "Internal Medicine",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Radiology",
  "Surgery",
  "Urology",
  "Laboratory",
  "Administration",
  "Reception",
]

export const specializations = [
  "Cardiology",
  "Dermatology",
  "Emergency Medicine",
  "Family Medicine",
  "Internal Medicine",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Radiology",
  "General Surgery",
  "Cardiac Surgery",
  "Neurosurgery",
  "Urology",
  "Oncology",
  "Endocrinology",
  "Gastroenterology",
  "Pulmonology",
]

export const labTests = [
  "Blood Chemistry",
  "Hematology",
  "Microbiology",
  "Immunology",
  "Pathology",
  "Radiology",
  "Cardiology Tests",
  "Molecular Diagnostics",
]

export const nursingWards = [
  "ICU",
  "Emergency",
  "Pediatrics",
  "Maternity",
  "Surgery",
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "General Medicine",
  "Oncology",
]
