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
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Invoice, Payment, BillingFilters, BillingSummary, PaymentSummary } from "@/lib/types"
import { generateInvoiceNumber, generatePaymentId, calculateInvoiceTotals } from "@/lib/billing-utils"
import { toast } from "sonner"

export function useBilling() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const q = query(collection(db, "invoices"), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const invoicesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          invoiceDate: doc.data().invoiceDate?.toDate() || new Date(),
          dueDate: doc.data().dueDate?.toDate() || new Date(),
          paymentDate: doc.data().paymentDate?.toDate(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as Invoice[]

        setInvoices(invoicesData)
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching invoices:", error)
        setError(error.message)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [])

  const createInvoice = async (invoiceData: Omit<Invoice, "id" | "invoiceNumber" | "createdAt" | "updatedAt">) => {
    try {
      const invoiceNumber = generateInvoiceNumber()
      const totals = calculateInvoiceTotals(
        invoiceData.items,
        invoiceData.discountPercentage,
        invoiceData.taxPercentage,
      )

      const newInvoice = {
        ...invoiceData,
        invoiceNumber,
        ...totals,
        balanceAmount: totals.totalAmount - (invoiceData.paidAmount || 0),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, "invoices"), newInvoice)
      toast.success("Invoice created successfully!")
      return docRef.id
    } catch (error: any) {
      console.error("Error creating invoice:", error)
      toast.error(error.message || "Failed to create invoice")
      throw error
    }
  }

  const updateInvoice = async (id: string, invoiceData: Partial<Invoice>) => {
    try {
      const updateData = {
        ...invoiceData,
        updatedAt: serverTimestamp(),
      }

      // Recalculate totals if items changed
      if (invoiceData.items) {
        const totals = calculateInvoiceTotals(
          invoiceData.items,
          invoiceData.discountPercentage || 0,
          invoiceData.taxPercentage || 0,
        )
        Object.assign(updateData, totals)
        updateData.balanceAmount = totals.totalAmount - (invoiceData.paidAmount || 0)
      }

      await updateDoc(doc(db, "invoices", id), updateData)
      toast.success("Invoice updated successfully!")
    } catch (error: any) {
      console.error("Error updating invoice:", error)
      toast.error(error.message || "Failed to update invoice")
      throw error
    }
  }

  const deleteInvoice = async (id: string) => {
    try {
      await deleteDoc(doc(db, "invoices", id))
      toast.success("Invoice deleted successfully!")
    } catch (error: any) {
      console.error("Error deleting invoice:", error)
      toast.error(error.message || "Failed to delete invoice")
      throw error
    }
  }

  const getInvoice = async (id: string): Promise<Invoice | null> => {
    try {
      const docRef = doc(db, "invoices", id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          invoiceDate: docSnap.data().invoiceDate?.toDate() || new Date(),
          dueDate: docSnap.data().dueDate?.toDate() || new Date(),
          paymentDate: docSnap.data().paymentDate?.toDate(),
          createdAt: docSnap.data().createdAt?.toDate() || new Date(),
          updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
        } as Invoice
      }
      return null
    } catch (error: any) {
      console.error("Error getting invoice:", error)
      throw error
    }
  }

  const getPatientInvoices = (patientId: string): Invoice[] => {
    return invoices.filter((invoice) => invoice.patientId === patientId)
  }

  const getBillingSummary = (): BillingSummary => {
    const totalInvoices = invoices.length
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
    const paidInvoices = invoices.filter((inv) => inv.status === "paid").length
    const pendingInvoices = invoices.filter((inv) => inv.status === "pending").length
    const overdueInvoices = invoices.filter((inv) => {
      return inv.status !== "paid" && new Date() > new Date(inv.dueDate)
    }).length

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayRevenue = invoices
      .filter((inv) => {
        const invDate = new Date(inv.invoiceDate)
        invDate.setHours(0, 0, 0, 0)
        return invDate.getTime() === today.getTime() && inv.status === "paid"
      })
      .reduce((sum, inv) => sum + inv.totalAmount, 0)

    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)
    const monthlyRevenue = invoices
      .filter((inv) => new Date(inv.invoiceDate) >= thisMonth && inv.status === "paid")
      .reduce((sum, inv) => sum + inv.totalAmount, 0)

    const averageInvoiceAmount = totalInvoices > 0 ? totalRevenue / totalInvoices : 0

    return {
      totalInvoices,
      totalRevenue,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
      todayRevenue,
      monthlyRevenue,
      averageInvoiceAmount,
    }
  }

  const filterInvoices = (filters: BillingFilters): Invoice[] => {
    return invoices.filter((invoice) => {
      const matchesSearch =
        !filters.search ||
        invoice.patientName.toLowerCase().includes(filters.search.toLowerCase()) ||
        invoice.invoiceNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
        (invoice.doctorName && invoice.doctorName.toLowerCase().includes(filters.search.toLowerCase()))

      const matchesStatus = !filters.status || invoice.status === filters.status
      const matchesPaymentMethod = !filters.paymentMethod || invoice.paymentMethod === filters.paymentMethod
      const matchesVisitType = !filters.visitType || invoice.visitType === filters.visitType
      const matchesDoctor = !filters.doctorId || invoice.doctorId === filters.doctorId

      let matchesDateRange = true
      if (filters.dateRange[0] && filters.dateRange[1]) {
        const invoiceDate = new Date(invoice.invoiceDate)
        const startDate = new Date(filters.dateRange[0])
        const endDate = new Date(filters.dateRange[1])
        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(23, 59, 59, 999)
        matchesDateRange = invoiceDate >= startDate && invoiceDate <= endDate
      }

      const matchesAmountRange =
        invoice.totalAmount >= filters.amountRange[0] && invoice.totalAmount <= filters.amountRange[1]

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPaymentMethod &&
        matchesVisitType &&
        matchesDoctor &&
        matchesDateRange &&
        matchesAmountRange
      )
    })
  }

  const markAsPaid = async (invoiceId: string, paymentData: any) => {
    try {
      await updateInvoice(invoiceId, {
        status: "paid",
        paymentStatus: "completed",
        paymentDate: new Date(),
        paidAmount: paymentData.amount,
        balanceAmount: 0,
        paymentMethod: paymentData.paymentMethod,
        transactionId: paymentData.transactionId,
      })

      // Create payment record
      await addPayment({
        invoiceId,
        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod,
        transactionId: paymentData.transactionId,
        ...paymentData,
      })

      toast.success("Payment recorded successfully!")
    } catch (error: any) {
      console.error("Error marking invoice as paid:", error)
      toast.error(error.message || "Failed to record payment")
      throw error
    }
  }

  return {
    invoices,
    loading,
    error,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoice,
    getPatientInvoices,
    getBillingSummary,
    filterInvoices,
    markAsPaid,
  }
}

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, "payments"), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const paymentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        paymentDate: doc.data().paymentDate?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Payment[]

      setPayments(paymentsData)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const addPayment = async (paymentData: Omit<Payment, "id" | "paymentId" | "createdAt" | "updatedAt">) => {
    try {
      const paymentId = generatePaymentId()

      const newPayment = {
        ...paymentData,
        paymentId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      await addDoc(collection(db, "payments"), newPayment)
      toast.success("Payment recorded successfully!")
    } catch (error: any) {
      console.error("Error adding payment:", error)
      toast.error(error.message || "Failed to record payment")
      throw error
    }
  }

  const getPaymentSummary = (): PaymentSummary => {
    const totalPayments = payments.length
    const cashPayments = payments.filter((p) => p.paymentMethod === "cash").length
    const cardPayments = payments.filter((p) => p.paymentMethod === "card").length
    const upiPayments = payments.filter((p) => p.paymentMethod === "upi").length
    const insurancePayments = payments.filter((p) => p.paymentMethod === "insurance").length

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayPayments = payments.filter((p) => {
      const payDate = new Date(p.paymentDate)
      payDate.setHours(0, 0, 0, 0)
      return payDate.getTime() === today.getTime()
    }).length

    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)
    const monthlyPayments = payments.filter((p) => new Date(p.paymentDate) >= thisMonth).length

    return {
      totalPayments,
      cashPayments,
      cardPayments,
      upiPayments,
      insurancePayments,
      todayPayments,
      monthlyPayments,
    }
  }

  return {
    payments,
    loading,
    addPayment,
    getPaymentSummary,
  }
}

const addPayment = async (paymentData: any) => {
  // This function is used by the billing hook
  const paymentId = generatePaymentId()
  const newPayment = {
    ...paymentData,
    paymentId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  await addDoc(collection(db, "payments"), newPayment)
}
