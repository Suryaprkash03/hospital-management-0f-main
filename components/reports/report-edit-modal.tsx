"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Save, FileText } from "lucide-react"
import { format } from "date-fns"
import { useMedicalReports } from "@/hooks/use-medical-reports"
import type { MedicalReport } from "@/lib/types"

interface ReportEditModalProps {
  report: MedicalReport
  onClose: () => void
}

export function ReportEditModal({ report, onClose }: ReportEditModalProps) {
  const { updateReport } = useMedicalReports()
  const [isUpdating, setIsUpdating] = useState(false)
  const [formData, setFormData] = useState({
    title: report.title,
    description: report.description || "",
    reportType: report.reportType,
    priority: report.priority,
    status: report.status,
    tags: report.tags.join(", "),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)

    try {
      const updateData = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
      }

      await updateReport(report.id, updateData)
      onClose()
    } catch (error) {
      console.error("Error updating report:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Edit Report
              </DialogTitle>
              <DialogDescription>Report ID: {report.reportId}</DialogDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Report Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Patient</Label>
              <Input value={report.patientName} disabled />
            </div>
            <div className="space-y-2">
              <Label>Report Date</Label>
              <Input value={format(report.reportDate, "PPP")} disabled />
            </div>
          </div>

          {/* Editable Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select value={formData.reportType} onValueChange={(value) => handleInputChange("reportType", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lab">Lab Report</SelectItem>
                    <SelectItem value="radiology">Radiology</SelectItem>
                    <SelectItem value="prescription">Prescription</SelectItem>
                    <SelectItem value="discharge">Discharge Summary</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending_review">Pending Review</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => handleInputChange("tags", e.target.value)}
                placeholder="urgent, follow-up, lab-results"
              />
            </div>
          </div>

          {/* File Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">File Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">File Name:</span> {report.fileName}
              </div>
              <div>
                <span className="font-medium">File Size:</span> {(report.fileSize / 1024 / 1024).toFixed(2)} MB
              </div>
              <div>
                <span className="font-medium">Uploaded By:</span> {report.uploadedByName}
              </div>
              <div>
                <span className="font-medium">Upload Date:</span> {format(report.createdAt, "PPP")}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              <Save className="h-4 w-4 mr-2" />
              {isUpdating ? "Updating..." : "Update Report"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
