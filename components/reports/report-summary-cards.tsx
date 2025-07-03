"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, TestTube, Scan, Pill, Clock, AlertTriangle, Upload } from "lucide-react"
import type { ReportSummary } from "@/lib/types"

interface ReportSummaryCardsProps {
  summary: ReportSummary
}

export function ReportSummaryCards({ summary }: ReportSummaryCardsProps) {
  const cards = [
    {
      title: "Total Reports",
      value: summary.totalReports,
      description: "All medical reports",
      icon: FileText,
      color: "text-blue-600",
    },
    {
      title: "Lab Reports",
      value: summary.labReports,
      description: "Laboratory test results",
      icon: TestTube,
      color: "text-green-600",
    },
    {
      title: "Radiology",
      value: summary.radiologyReports,
      description: "X-rays, CT, MRI scans",
      icon: Scan,
      color: "text-purple-600",
    },
    {
      title: "Prescriptions",
      value: summary.prescriptionReports,
      description: "Medication prescriptions",
      icon: Pill,
      color: "text-indigo-600",
    },
    {
      title: "Pending Review",
      value: summary.pendingReview,
      description: "Awaiting doctor review",
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      title: "Urgent Reports",
      value: summary.urgentReports,
      description: "High priority reports",
      icon: AlertTriangle,
      color: "text-red-600",
    },
    {
      title: "Today's Uploads",
      value: summary.todayUploads,
      description: "Reports uploaded today",
      icon: Upload,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <CardDescription className="text-xs">{card.description}</CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
