"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Download, X, FileText, User, Calendar, Tag, MessageSquare } from "lucide-react"
import { format } from "date-fns"
import { useAuth } from "@/contexts/auth-context"
import { useMedicalReports } from "@/hooks/use-medical-reports"
import { getReportTypeLabel, getReportTypeColor, getStatusColor, getPriorityColor } from "@/lib/report-utils"
import { isImageFile, isPDFFile } from "@/lib/storage-utils"
import type { MedicalReport } from "@/lib/types"

interface ReportPreviewModalProps {
  report: MedicalReport
  onClose: () => void
}

export function ReportPreviewModal({ report, onClose }: ReportPreviewModalProps) {
  const { user } = useAuth()
  const { reviewReport } = useMedicalReports()
  const [reviewNotes, setReviewNotes] = useState("")
  const [isReviewing, setIsReviewing] = useState(false)

  const canReview = user?.role === "doctor" && report.status === "pending_review"

  const handleDownload = () => {
    window.open(report.fileUrl, "_blank")
  }

  const handleReview = async () => {
    if (!user || !reviewNotes.trim()) return

    setIsReviewing(true)
    try {
      await reviewReport(report.id, reviewNotes, `${user.firstName || ""} ${user.lastName || ""}`.trim())
      onClose()
    } catch (error) {
      console.error("Error reviewing report:", error)
    } finally {
      setIsReviewing(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {report.title}
              </DialogTitle>
              <DialogDescription>Report ID: {report.reportId}</DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Patient:</span>
                <span>{report.patientName}</span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Report Date:</span>
                <span>{format(report.reportDate, "PPP")}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium">Type:</span>
                <Badge className={getReportTypeColor(report.reportType)}>{getReportTypeLabel(report.reportType)}</Badge>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium">Status:</span>
                <Badge className={getStatusColor(report.status)}>{report.status.replace("_", " ")}</Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-medium">Priority:</span>
                <Badge className={getPriorityColor(report.priority)}>{report.priority}</Badge>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium">Uploaded by:</span>
                <span>{report.uploadedByName}</span>
                <Badge variant="outline" className="text-xs">
                  {report.uploadedByRole}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium">Upload Date:</span>
                <span>{format(report.createdAt, "PPP")}</span>
              </div>

              {report.doctorName && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Doctor:</span>
                  <span>Dr. {report.doctorName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {report.tags.length > 0 && (
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Tags:</span>
              <div className="flex flex-wrap gap-1">
                {report.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {report.description && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{report.description}</p>
            </div>
          )}

          <Separator />

          {/* File Preview */}
          <div>
            <h4 className="font-medium mb-4">File Preview</h4>
            <div className="border rounded-lg overflow-hidden">
              {isImageFile(report.fileType) ? (
                <img
                  src={report.fileUrl || "/placeholder.svg"}
                  alt={report.title}
                  className="w-full max-h-96 object-contain bg-gray-50"
                />
              ) : isPDFFile(report.fileType) ? (
                <iframe src={report.fileUrl} className="w-full h-96" title={report.title} />
              ) : (
                <div className="p-8 text-center bg-gray-50">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">Preview not available for this file type</p>
                  <Button variant="outline" className="mt-4" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download to View
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Review Section */}
          {report.reviewedBy && report.reviewedAt && (
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Review Notes
              </h4>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-800">Reviewed by {report.reviewedBy}</span>
                  <span className="text-xs text-green-600">{format(report.reviewedAt, "PPP 'at' p")}</span>
                </div>
                {report.reviewNotes && <p className="text-sm text-green-700">{report.reviewNotes}</p>}
              </div>
            </div>
          )}

          {/* Review Form */}
          {canReview && (
            <div>
              <h4 className="font-medium mb-2">Add Review</h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="reviewNotes">Review Notes</Label>
                  <Textarea
                    id="reviewNotes"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add your review notes..."
                    rows={3}
                  />
                </div>
                <Button onClick={handleReview} disabled={isReviewing || !reviewNotes.trim()}>
                  {isReviewing ? "Submitting Review..." : "Submit Review"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
