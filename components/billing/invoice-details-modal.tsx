"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, CreditCard, Edit, X, FileText, User, Calendar, Building } from "lucide-react"
import type { Invoice } from "@/lib/types"
import {
  formatCurrency,
  getInvoiceStatusColor,
  getPaymentMethodIcon,
  isInvoiceOverdue,
  calculateDaysOverdue,
} from "@/lib/billing-utils"
import { useAuth } from "@/contexts/auth-context"

interface InvoiceDetailsModalProps {
  invoice: Invoice | null
  open: boolean
  onClose: () => void
  onEdit: (invoice: Invoice) => void
  onDownload: (invoice: Invoice) => void
  onPayment: (invoice: Invoice) => void
}

export function InvoiceDetailsModal({
  invoice,
  open,
  onClose,
  onEdit,
  onDownload,
  onPayment,
}: InvoiceDetailsModalProps) {
  const { user } = useAuth()

  if (!invoice) return null

  const canEdit = user?.role === "admin" || user?.role === "receptionist"
  const canProcessPayment = user?.role === "admin" || user?.role === "receptionist"
  const overdue = isInvoiceOverdue(invoice)
  const status = overdue && invoice.status !== "paid" ? "overdue" : invoice.status

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoice {invoice.invoiceNumber}
              </DialogTitle>
              <DialogDescription>Created on {new Date(invoice.createdAt).toLocaleDateString()}</DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getInvoiceStatusColor(status)}>{status.replace("_", " ").toUpperCase()}</Badge>
              {overdue && invoice.status !== "paid" && (
                <Badge variant="destructive">{calculateDaysOverdue(invoice.dueDate)} days overdue</Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient and Invoice Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium text-lg">{invoice.patientName}</p>
                  <p className="text-sm text-muted-foreground">{invoice.patientPhone}</p>
                  <p className="text-sm text-muted-foreground">{invoice.patientEmail}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Invoice Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Invoice Date</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(invoice.invoiceDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Due Date</p>
                    <p className="text-sm text-muted-foreground">{new Date(invoice.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Visit Type</p>
                    <Badge variant="outline">{invoice.visitType?.toUpperCase() || "N/A"}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Department</p>
                    <p className="text-sm text-muted-foreground">{invoice.department || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Doctor Information */}
          {invoice.doctorName && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Attending Doctor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">Dr. {invoice.doctorName}</p>
                <p className="text-sm text-muted-foreground">{invoice.department}</p>
              </CardContent>
            </Card>
          )}

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Items</CardTitle>
              <CardDescription>Services and charges breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.category.replace("_", " ")}</Badge>
                        </TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(item.totalPrice)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                {invoice.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({invoice.discountPercentage}%):</span>
                    <span>-{formatCurrency(invoice.discountAmount)}</span>
                  </div>
                )}
                {invoice.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Tax ({invoice.taxPercentage}%):</span>
                    <span>{formatCurrency(invoice.taxAmount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(invoice.totalAmount)}</span>
                </div>
                {invoice.paidAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Paid Amount:</span>
                    <span>{formatCurrency(invoice.paidAmount)}</span>
                  </div>
                )}
                {invoice.balanceAmount > 0 && (
                  <div className="flex justify-between text-red-600 font-medium">
                    <span>Balance Due:</span>
                    <span>{formatCurrency(invoice.balanceAmount)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          {invoice.paymentMethod && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Payment Method</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span>{getPaymentMethodIcon(invoice.paymentMethod)}</span>
                      <span className="capitalize">{invoice.paymentMethod.replace("_", " ")}</span>
                    </div>
                  </div>
                  {invoice.paymentDate && (
                    <div>
                      <p className="text-sm font-medium">Payment Date</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(invoice.paymentDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {invoice.transactionId && (
                    <div className="col-span-2">
                      <p className="text-sm font-medium">Transaction ID</p>
                      <p className="text-sm text-muted-foreground font-mono">{invoice.transactionId}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes and Terms */}
          {(invoice.notes || invoice.terms) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {invoice.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
                  </CardContent>
                </Card>
              )}
              {invoice.terms && (
                <Card>
                  <CardHeader>
                    <CardTitle>Terms & Conditions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{invoice.terms}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onDownload(invoice)}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          {canProcessPayment && invoice.status !== "paid" && (
            <Button onClick={() => onPayment(invoice)}>
              <CreditCard className="h-4 w-4 mr-2" />
              Process Payment
            </Button>
          )}
          {canEdit && (
            <Button variant="outline" onClick={() => onEdit(invoice)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Invoice
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
