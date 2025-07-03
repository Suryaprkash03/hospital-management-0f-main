"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, FileText, TrendingUp } from "lucide-react"
import { BillingSummaryCards } from "@/components/billing/billing-summary-cards"
import { BillingFiltersComponent } from "@/components/billing/billing-filters"
import { BillingTable } from "@/components/billing/billing-table"
import { InvoiceForm } from "@/components/billing/invoice-form"
import { InvoiceDetailsModal } from "@/components/billing/invoice-details-modal"
import { PaymentModal } from "@/components/billing/payment-modal"
import { RevenueAnalytics } from "@/components/billing/revenue-analytics"
import { useBilling } from "@/hooks/use-billing"
import { useAuth } from "@/contexts/auth-context"
import type { Invoice, BillingFilters } from "@/lib/types"
import { toast } from "sonner"

export default function BillingPage() {
  const { user } = useAuth()
  const { invoices, loading, getBillingSummary, filterInvoices, deleteInvoice } = useBilling()

  const [showInvoiceForm, setShowInvoiceForm] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)

  const [filters, setFilters] = useState<BillingFilters>({
    search: "",
    status: "",
    paymentMethod: "",
    visitType: "",
    dateRange: [null, null],
    doctorId: "",
    amountRange: [0, 999999],
  })

  const canCreateInvoice = user?.role === "admin" || user?.role === "receptionist"
  const canDelete = user?.role === "admin"

  const filteredInvoices = filterInvoices(filters)
  const billingSummary = getBillingSummary()

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowInvoiceDetails(true)
  }

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice)
    setShowInvoiceForm(true)
    setShowInvoiceDetails(false)
  }

  const handleDeleteInvoice = async (invoice: Invoice) => {
    if (!canDelete) {
      toast.error("You don't have permission to delete invoices")
      return
    }

    if (confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}?`)) {
      try {
        await deleteInvoice(invoice.id)
        setShowInvoiceDetails(false)
      } catch (error) {
        console.error("Error deleting invoice:", error)
      }
    }
  }

  const handleDownloadInvoice = (invoice: Invoice) => {
    // TODO: Implement PDF generation and download
    toast.info("PDF download feature will be implemented soon")
  }

  const handleProcessPayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowPaymentModal(true)
    setShowInvoiceDetails(false)
  }

  const handleInvoiceFormSuccess = () => {
    setShowInvoiceForm(false)
    setEditingInvoice(null)
    toast.success(editingInvoice ? "Invoice updated successfully!" : "Invoice created successfully!")
  }

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false)
    setSelectedInvoice(null)
    toast.success("Payment processed successfully!")
  }

  const resetFilters = () => {
    setFilters({
      search: "",
      status: "",
      paymentMethod: "",
      visitType: "",
      dateRange: [null, null],
      doctorId: "",
      amountRange: [0, 999999],
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600 mx-auto mb-4"></div>
            <p className="text-orange-600 font-medium">Loading billing data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Billing & Payments
            </h1>
            <p className="text-orange-600/70">Manage invoices, process payments, and track revenue</p>
          </div>
          {canCreateInvoice && (
            <Button
              onClick={() => setShowInvoiceForm(true)}
              className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          )}
        </div>

        <Tabs defaultValue="invoices" className="space-y-6">
          <TabsList className="bg-white/70 backdrop-blur-sm border border-orange-200">
            <TabsTrigger
              value="invoices"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white"
            >
              <FileText className="h-4 w-4" />
              Invoices
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white"
            >
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="space-y-6">
            {/* Summary Cards */}
            <BillingSummaryCards summary={billingSummary} />

            {/* Filters */}
            <BillingFiltersComponent filters={filters} onFiltersChange={setFilters} onReset={resetFilters} />

            {/* Invoices Table */}
            <BillingTable
              invoices={filteredInvoices}
              onView={handleViewInvoice}
              onEdit={handleEditInvoice}
              onDelete={handleDeleteInvoice}
              onDownload={handleDownloadInvoice}
              onPayment={handleProcessPayment}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <RevenueAnalytics />
          </TabsContent>
        </Tabs>

        {/* Invoice Form Modal */}
        {showInvoiceForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-orange-200">
              <div className="p-6">
                <InvoiceForm
                  invoice={editingInvoice}
                  onSuccess={handleInvoiceFormSuccess}
                  onCancel={() => {
                    setShowInvoiceForm(false)
                    setEditingInvoice(null)
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Invoice Details Modal */}
        <InvoiceDetailsModal
          invoice={selectedInvoice}
          open={showInvoiceDetails}
          onClose={() => {
            setShowInvoiceDetails(false)
            setSelectedInvoice(null)
          }}
          onEdit={handleEditInvoice}
          onDownload={handleDownloadInvoice}
          onPayment={handleProcessPayment}
        />

        {/* Payment Modal */}
        <PaymentModal
          invoice={selectedInvoice}
          open={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false)
            setSelectedInvoice(null)
          }}
          onSuccess={handlePaymentSuccess}
        />
      </div>
    </div>
  )
}
