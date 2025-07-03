"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { X, Upload, FileText, AlertCircle } from "lucide-react"
import { usePatients } from "@/hooks/use-patients"
import { useStaff } from "@/hooks/use-staff"
import { useMedicalReports } from "@/hooks/use-medical-reports"
import { useAuth } from "@/contexts/auth-context"
import { validateFile, getFileTypeIcon, formatFileSize } from "@/lib/storage-utils"
import { getAvailableTags } from "@/lib/report-utils"
import type { ReportType, FileUploadProgress } from "@/lib/types"
import { toast } from "sonner"

interface ReportUploadFormProps {
  patientId?: string
  visitId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function ReportUploadForm({ patientId, visitId, onSuccess, onCancel }: ReportUploadFormProps) {
  const { user } = useAuth()
  const { patients } = usePatients()
  const { staff } = useStaff()
  const { uploadReport } = useMedicalReports()

  const [formData, setFormData] = useState({
    patientId: patientId || "",
    title: "",
    reportType: "lab" as ReportType,
    description: "",
    reportDate: new Date().toISOString().split("T")[0],
    priority: "normal" as "normal" | "urgent" | "critical",
    tags: [] as string[],
    doctorId: "",
  })

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const availableTags = getAvailableTags()
  const doctors = staff.filter((s) => s.role === "doctor")
  const selectedPatient = patients.find((p) => p.id === formData.patientId)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validation = validateFile(file)
    if (!validation.isValid) {
      toast.error(validation.error)
      return
    }

    setSelectedFile(file)
  }

  const handleTagToggle = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      toast.error("Please select a file to upload")
      return
    }

    if (!formData.patientId) {
      toast.error("Please select a patient")
      return
    }

    if (!user) {
      toast.error("User not authenticated")
      return
    }

    setIsUploading(true)

    try {
      const selectedDoctor = doctors.find((d) => d.id === formData.doctorId)

      await uploadReport(
        {
          patientId: formData.patientId,
          patientName: selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : "",
          title: formData.title,
          reportType: formData.reportType,
          description: formData.description,
          reportDate: new Date(formData.reportDate),
          uploadedBy: user.uid,
          uploadedByName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          uploadedByRole: user.role,
          status: "uploaded",
          tags: formData.tags,
          priority: formData.priority,
          visitId,
          doctorId: formData.doctorId || undefined,
          doctorName: selectedDoctor ? `${selectedDoctor.firstName} ${selectedDoctor.lastName}` : undefined,
        },
        selectedFile,
        setUploadProgress,
      )

      toast.success("Report uploaded successfully!")
      onSuccess?.()
    } catch (error) {
      console.error("Upload error:", error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Medical Report
        </CardTitle>
        <CardDescription>Upload medical reports, lab results, or other patient documents</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Selection */}
          {!patientId && (
            <div className="space-y-2">
              <Label htmlFor="patient">Patient *</Label>
              <Select
                value={formData.patientId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, patientId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName} ({patient.patientId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Report Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Report Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Blood Test Results"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type *</Label>
              <Select
                value={formData.reportType}
                onValueChange={(value: ReportType) => setFormData((prev) => ({ ...prev, reportType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lab">Laboratory</SelectItem>
                  <SelectItem value="radiology">Radiology</SelectItem>
                  <SelectItem value="prescription">Prescription</SelectItem>
                  <SelectItem value="discharge">Discharge Summary</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reportDate">Report Date *</Label>
              <Input
                id="reportDate"
                type="date"
                value={formData.reportDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, reportDate: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: "normal" | "urgent" | "critical") =>
                  setFormData((prev) => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Doctor Selection */}
          <div className="space-y-2">
            <Label htmlFor="doctor">Attending Doctor</Label>
            <Select
              value={formData.doctorId}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, doctorId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select doctor (optional)" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Additional notes or description about the report"
              rows={3}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={formData.tags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">File Upload *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              {!selectedFile ? (
                <div className="text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <Label htmlFor="file" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Click to upload or drag and drop
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">PDF, JPEG, PNG up to 10MB</span>
                    </Label>
                    <Input
                      id="file"
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                      onChange={handleFileSelect}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getFileTypeIcon(selectedFile.type)}</span>
                    <div>
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Upload Progress */}
          {uploadProgress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Uploading...</span>
                <span className="text-sm text-gray-500">{Math.round(uploadProgress.progress)}%</span>
              </div>
              <Progress value={uploadProgress.progress} />
              {uploadProgress.status === "error" && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{uploadProgress.error}</span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isUploading || !selectedFile}>
              {isUploading ? "Uploading..." : "Upload Report"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
