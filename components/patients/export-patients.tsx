"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import type { Patient } from "@/lib/types"

interface ExportPatientsProps {
  patients: Patient[]
  filename?: string
}

export function ExportPatients({ patients, filename = "patients" }: ExportPatientsProps) {
  const exportToCSV = () => {
    const headers = [
      "Patient ID",
      "First Name",
      "Last Name",
      "Age",
      "Gender",
      "Phone",
      "Email",
      "Address",
      "Blood Group",
      "Status",
      "Emergency Contact",
      "Emergency Contact Name",
      "Created Date",
    ]

    const csvContent = [
      headers.join(","),
      ...patients.map((patient) =>
        [
          patient.patientId,
          patient.firstName,
          patient.lastName,
          patient.age,
          patient.gender,
          patient.phone,
          patient.email,
          `"${patient.address.replace(/"/g, '""')}"`,
          patient.bloodGroup,
          patient.status,
          patient.emergencyContact,
          patient.emergencyContactName,
          patient.createdAt.toLocaleDateString(),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", `${filename}-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Button variant="outline" onClick={exportToCSV}>
      <Download className="h-4 w-4 mr-2" />
      Export CSV
    </Button>
  )
}
