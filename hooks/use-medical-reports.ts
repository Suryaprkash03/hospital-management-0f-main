"use client"

import { useState, useEffect } from "react"
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  where,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { MedicalReport, ReportFilters, ReportSummary, FileUploadProgress } from "@/lib/types"
import { uploadReportFile, deleteReportFile } from "@/lib/storage-utils"
import { generateReportId } from "@/lib/report-utils"
import { toast } from "sonner"

export function useMedicalReports(patientId?: string) {
  const [reports, setReports] = useState<MedicalReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let q = query(collection(db, "medicalReports"), orderBy("createdAt", "desc"))

    if (patientId) {
      q = query(collection(db, "medicalReports"), where("patientId", "==", patientId), orderBy("createdAt", "desc"))
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reportsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          reportDate: doc.data().reportDate?.toDate() || new Date(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          reviewedAt: doc.data().reviewedAt?.toDate() || null,
        })) as MedicalReport[]

        setReports(reportsData)
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching reports:", error)
        setError(error.message)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [patientId])

  const uploadReport = async (
    reportData: Omit<
      MedicalReport,
      "id" | "reportId" | "createdAt" | "updatedAt" | "fileUrl" | "fileSize" | "fileName" | "fileType"
    >,
    file: File,
    onProgress?: (progress: FileUploadProgress) => void,
  ) => {
    try {
      const reportId = generateReportId()

      onProgress?.({
        fileName: file.name,
        progress: 0,
        status: "uploading",
      })

      // Upload file to online storage (ImgBB/Cloudinary)
      const hostedUrl = await uploadReportFile(file, reportData.patientId, reportId, (progress) => {
        onProgress?.({
          fileName: file.name,
          progress,
          status: "uploading",
        })
      })

      // Save report metadata to Firestore
      const newReport = {
        ...reportData,
        reportId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileUrl: hostedUrl, // Store hosted URL
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      // Remove undefined values to prevent Firestore errors
      const sanitizedReport = Object.fromEntries(Object.entries(newReport).filter(([, value]) => value !== undefined))

      await addDoc(collection(db, "medicalReports"), sanitizedReport)

      onProgress?.({
        fileName: file.name,
        progress: 100,
        status: "completed",
      })

      toast.success("Report uploaded successfully to cloud storage!")
    } catch (error: any) {
      console.error("Error uploading report:", error)
      onProgress?.({
        fileName: file.name,
        progress: 0,
        status: "error",
        error: error.message,
      })
      toast.error(error.message || "Failed to upload report")
      throw error
    }
  }

  const updateReport = async (id: string, reportData: Partial<MedicalReport>) => {
    try {
      const updateData = {
        ...reportData,
        updatedAt: serverTimestamp(),
      }

      await updateDoc(doc(db, "medicalReports", id), updateData)
      toast.success("Report updated successfully!")
    } catch (error: any) {
      console.error("Error updating report:", error)
      toast.error(error.message || "Failed to update report")
      throw error
    }
  }

  const deleteReport = async (id: string, fileUrl: string) => {
    try {
      // Delete file from online storage
      await deleteReportFile(fileUrl)

      // Delete document from Firestore
      await deleteDoc(doc(db, "medicalReports", id))

      toast.success("Report deleted successfully!")
    } catch (error: any) {
      console.error("Error deleting report:", error)
      toast.error(error.message || "Failed to delete report")
      throw error
    }
  }

  const getReport = async (id: string): Promise<MedicalReport | null> => {
    try {
      const docRef = doc(db, "medicalReports", id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          reportDate: docSnap.data().reportDate?.toDate() || new Date(),
          createdAt: docSnap.data().createdAt?.toDate() || new Date(),
          updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
          reviewedAt: docSnap.data().reviewedAt?.toDate() || null,
        } as MedicalReport
      }
      return null
    } catch (error: any) {
      console.error("Error getting report:", error)
      throw error
    }
  }

  const getReportSummary = (): ReportSummary => {
    const totalReports = reports.length
    const labReports = reports.filter((r) => r.reportType === "lab").length
    const radiologyReports = reports.filter((r) => r.reportType === "radiology").length
    const prescriptionReports = reports.filter((r) => r.reportType === "prescription").length
    const pendingReview = reports.filter((r) => r.status === "pending_review").length
    const urgentReports = reports.filter((r) => r.priority === "urgent" || r.priority === "critical").length

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayUploads = reports.filter((r) => r.createdAt >= today).length

    return {
      totalReports,
      labReports,
      radiologyReports,
      prescriptionReports,
      pendingReview,
      urgentReports,
      todayUploads,
    }
  }

  const filterReports = (filters: ReportFilters): MedicalReport[] => {
    return reports.filter((report) => {
      const matchesSearch =
        !filters.search ||
        report.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        report.patientName.toLowerCase().includes(filters.search.toLowerCase()) ||
        report.description.toLowerCase().includes(filters.search.toLowerCase())

      const matchesType = !filters.reportType || report.reportType === filters.reportType
      const matchesStatus = !filters.status || report.status === filters.status
      const matchesPriority = !filters.priority || report.priority === filters.priority
      const matchesUploader = !filters.uploadedBy || report.uploadedBy === filters.uploadedBy

      const matchesDateRange =
        (!filters.dateRange[0] || report.reportDate >= filters.dateRange[0]) &&
        (!filters.dateRange[1] || report.reportDate <= filters.dateRange[1])

      const matchesTags = filters.tags.length === 0 || filters.tags.some((tag) => report.tags.includes(tag))

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesPriority &&
        matchesUploader &&
        matchesDateRange &&
        matchesTags
      )
    })
  }

  const reviewReport = async (id: string, reviewNotes: string, reviewedBy: string) => {
    try {
      await updateDoc(doc(db, "medicalReports", id), {
        status: "reviewed",
        reviewedBy,
        reviewedAt: serverTimestamp(),
        reviewNotes,
        updatedAt: serverTimestamp(),
      })
      toast.success("Report reviewed successfully!")
    } catch (error: any) {
      console.error("Error reviewing report:", error)
      toast.error(error.message || "Failed to review report")
      throw error
    }
  }

  return {
    reports,
    loading,
    error,
    uploadReport,
    updateReport,
    deleteReport,
    getReport,
    getReportSummary,
    filterReports,
    reviewReport,
  }
}

export function usePatientReports(patientId: string) {
  return useMedicalReports(patientId)
}

export function useTodayReports() {
  const [todayReports, setTodayReports] = useState<MedicalReport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const q = query(collection(db, "medicalReports"), where("createdAt", ">=", today), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        reportDate: doc.data().reportDate?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        reviewedAt: doc.data().reviewedAt?.toDate() || null,
      })) as MedicalReport[]

      setTodayReports(reportsData)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  return { todayReports, loading }
}
