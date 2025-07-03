"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useMedicalReports } from "@/hooks/use-medical-reports"
import { canUserUploadReport } from "@/lib/report-utils"
import { ReportSummaryCards } from "@/components/reports/report-summary-cards"
import { ReportFiltersComponent } from "@/components/reports/report-filters"
import { ReportTable } from "@/components/reports/report-table"
import { ReportUploadForm } from "@/components/reports/report-upload-form"
import type { ReportFilters } from "@/lib/types"

const initialFilters: ReportFilters = {
  search: "",
  reportType: "",
  status: "",
  priority: "",
  dateRange: [null, null],
  uploadedBy: "",
  tags: [],
}

export default function ReportsPage() {
  const { user } = useAuth()
  const { reports, loading, getReportSummary, filterReports } = useMedicalReports()
  const [filters, setFilters] = useState<ReportFilters>(initialFilters)
  const [showUploadForm, setShowUploadForm] = useState(false)

  const filteredReports = filterReports(filters)
  const summary = getReportSummary()
  const canUpload = user && canUserUploadReport(user.role)

  const handleFiltersReset = () => {
    setFilters(initialFilters)
  }

  if (showUploadForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Upload Medical Report
              </h1>
              <p className="text-indigo-600/70">Add a new medical report to the system</p>
            </div>
          </div>

          <ReportUploadForm onSuccess={() => setShowUploadForm(false)} onCancel={() => setShowUploadForm(false)} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Medical Reports
            </h1>
            <p className="text-indigo-600/70">Manage and view medical reports, lab results, and patient documents</p>
          </div>
          {canUpload && (
            <Button
              onClick={() => setShowUploadForm(true)}
              className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Upload Report
            </Button>
          )}
        </div>

        {/* Summary Cards */}
        <ReportSummaryCards summary={summary} />

        {/* Filters */}
        <ReportFiltersComponent filters={filters} onFiltersChange={setFilters} onReset={handleFiltersReset} />

        {/* Reports Table */}
        <ReportTable reports={filteredReports} loading={loading} />
      </div>
    </div>
  )
}
