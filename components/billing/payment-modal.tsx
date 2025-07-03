"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CreditCard, DollarSign } from "lucide-react"
import type { Invoice } from "@/lib/types"
import { formatCurrency, paymentMethods } from "@/lib/billing-utils"
import { useBilling } from "@/hooks/use-billing"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

interface PaymentModalProps {
  invoice: Invoice | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function PaymentModal({ invoice, open, onClose, onSuccess }: PaymentModalProps) {
  const { user } = useAuth()
  const { markAsPaid } = useBilling()

  const [paymentData, setPaymentData] = useState({
    amount: invoice?.balanceAmount || 0,
    paymentMethod: "",
    transactionId: "",
    referenceNumber: "",
    chequeNumber: "",
    bankName: "",
    notes: "",
  })

  const [loading, setLoading] = useState(false)

  if (!invoice) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!paymentData.paymentMethod) {
      toast.error("Please select a payment method")
      return
    }

    if (paymentData.amount <= 0 || paymentData.amount > invoice.balanceAmount) {
      toast.error("Please enter a valid payment amount")
      return
    }

    setLoading(true)

    try {
      await markAsPaid(invoice.id, {
        ...paymentData,
        invoiceNumber: invoice.invoiceNumber,
        patientId: invoice.patientId,
        patientName: invoice.patientName,
        processedBy: user?.uid || "",
        processedByName: user?.profile?.firstName
          ? `${user.profile.firstName} ${user.profile.lastName}`
          : user?.email || "",
      })

      toast.success("Payment processed successfully!")
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error processing payment:", error)
      toast.error("Failed to process payment")
    } finally {
      setLoading(false)
    }
  }

  const isPartialPayment = paymentData.amount < invoice.balanceAmount

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Process Payment
          </DialogTitle>
          <DialogDescription>Record payment for Invoice {invoice.invoiceNumber}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Invoice Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Patient:</span>
                <span className="font-medium">{invoice.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span>Invoice Total:</span>
                <span>{formatCurrency(invoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Paid Amount:</span>
                <span className="text-green-600">{formatCurrency(invoice.paidAmount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Balance Due:</span>
                <span className="text-red-600">{formatCurrency(invoice.balanceAmount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Payment Amount ($) *</Label>
              <Input
                id="amount"
                type="number"
                min="0.01"
                max={invoice.balanceAmount}
                step="0.01"
                value={paymentData.amount}
                onChange={(e) =>
                  setPaymentData((prev) => ({
                    ...prev,
                    amount: Number.parseFloat(e.target.value) || 0,
                  }))
                }
                required
              />
              {isPartialPayment && (
                <p className="text-sm text-yellow-600">
                  This is a partial payment. Remaining balance:{" "}
                  {formatCurrency(invoice.balanceAmount - paymentData.amount)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select
                value={paymentData.paymentMethod}
                onValueChange={(value) => setPaymentData((prev) => ({ ...prev, paymentMethod: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.icon} {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Additional Payment Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="transactionId">Transaction ID</Label>
              <Input
                id="transactionId"
                placeholder="Enter transaction ID"
                value={paymentData.transactionId}
                onChange={(e) => setPaymentData((prev) => ({ ...prev, transactionId: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="referenceNumber">Reference Number</Label>
              <Input
                id="referenceNumber"
                placeholder="Enter reference number"
                value={paymentData.referenceNumber}
                onChange={(e) => setPaymentData((prev) => ({ ...prev, referenceNumber: e.target.value }))}
              />
            </div>
          </div>

          {/* Cheque/Bank Details (conditional) */}
          {(paymentData.paymentMethod === "cheque" || paymentData.paymentMethod === "net_banking") && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentData.paymentMethod === "cheque" && (
                <div className="space-y-2">
                  <Label htmlFor="chequeNumber">Cheque Number</Label>
                  <Input
                    id="chequeNumber"
                    placeholder="Enter cheque number"
                    value={paymentData.chequeNumber}
                    onChange={(e) => setPaymentData((prev) => ({ ...prev, chequeNumber: e.target.value }))}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  placeholder="Enter bank name"
                  value={paymentData.bankName}
                  onChange={(e) => setPaymentData((prev) => ({ ...prev, bankName: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* Payment Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Payment Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about this payment"
              value={paymentData.notes}
              onChange={(e) => setPaymentData((prev) => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Processing..." : `Process Payment (${formatCurrency(paymentData.amount)})`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
