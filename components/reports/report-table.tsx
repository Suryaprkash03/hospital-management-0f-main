"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Eye, Download, Trash2, MoreHorizontal, FileText, Edit } from "lucide-react"
import { format } from "date-fns"
import { useAuth } from "@/contexts/auth-context"
import { useMedicalReports } from "@/hooks/use-medical-reports"
import {
  getReportTypeLabel,
  getReportTypeColor,
  getStatusColor,
  getPriorityColor,
  canUserDeleteReport,
} from "@/lib/report-utils"
import { getFileTypeIcon, formatFileSize } from "@/lib/storage-utils"
import { ReportPreviewModal } from "./report-preview-modal"
import type { MedicalReport } from "@/lib/types"
import { toast } from "sonner"
import { ReportEditModal } from "./report-edit-modal"

interface ReportTableProps {
  reports: MedicalReport[]
  loading?: boolean
}

export function ReportTable({ reports, loading }: ReportTableProps) {
  const { user } = useAuth()
  const { deleteReport } = useMedicalReports()
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const handleView = (report: MedicalReport) => {
    setSelectedReport(report)
    setShowPreview(true)
  }

  const handleEdit = (report: MedicalReport) => {
    setSelectedReport(report)
    setShowEditModal(true)
  }

  const handleDownload = (report: MedicalReport) => {
    window.open(report.fileUrl, "_blank")
  }

  const handleDelete = async (report: MedicalReport) => {
    if (!user || !canUserDeleteReport(user.role, user.uid, report)) {
      toast.error("You don't have permission to delete this report")
      return
    }

    if (window.confirm("Are you sure you want to delete this report? This action cannot be undone.")) {
      try {
        await deleteReport(report.id, report.fileUrl)
      } catch (error) {
        console.error("Error deleting report:", error)
      }
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading reports...</div>
        </CardContent>
      </Card>
    )
  }

  if (reports.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
            <p className="mt-1 text-sm text-gray-500">No medical reports match your current filters.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Medical Reports</CardTitle>
          <CardDescription>
            {reports.length} report{reports.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(report)}
                        className="flex items-center gap-2 p-2 hover:bg-gray-100"
                      >
                        <span className="text-lg">{getFileTypeIcon(report.fileType)}</span>
                        <div className="text-xs text-gray-500">{formatFileSize(report.fileSize)}</div>
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{report.title}</div>
                        {report.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">{report.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{report.patientName}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getReportTypeColor(report.reportType)}>
                        {getReportTypeLabel(report.reportType)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(report.status)}>{report.status.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(report.priority)}>{report.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{format(report.reportDate, "MMM dd, yyyy")}</div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm font-medium">{report.uploadedByName}</div>
                        <div className="text-xs text-gray-500 capitalize">{report.uploadedByRole}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(report)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(report)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownload(report)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          {user && canUserDeleteReport(user.role, user.uid, report) && (
                            <DropdownMenuItem onClick={() => handleDelete(report)} className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {showPreview && selectedReport && (
        <ReportPreviewModal
          report={selectedReport}
          onClose={() => {
            setShowPreview(false)
            setSelectedReport(null)
          }}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedReport && (
        <ReportEditModal
          report={selectedReport}
          onClose={() => {
            setShowEditModal(false)
            setSelectedReport(null)
          }}
        />
      )}
    </>
  )
}
