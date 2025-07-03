"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Eye, Edit, Trash2, Download, CreditCard, MoreHorizontal, FileText } from "lucide-react"
import type { Invoice } from "@/lib/types"
import {
  formatCurrency,
  getInvoiceStatusColor,
  getPaymentMethodIcon,
  isInvoiceOverdue,
  calculateDaysOverdue,
} from "@/lib/billing-utils"
import { useAuth } from "@/contexts/auth-context"

interface BillingTableProps {
  invoices: Invoice[]
  onView: (invoice: Invoice) => void
  onEdit: (invoice: Invoice) => void
  onDelete: (invoice: Invoice) => void
  onDownload: (invoice: Invoice) => void
  onPayment: (invoice: Invoice) => void
}

export function BillingTable({ invoices, onView, onEdit, onDelete, onDownload, onPayment }: BillingTableProps) {
  const { user } = useAuth()
  const [sortField, setSortField] = useState<keyof Invoice>("createdAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const canEdit = user?.role === "admin" || user?.role === "receptionist"
  const canDelete = user?.role === "admin"
  const canProcessPayment = user?.role === "admin" || user?.role === "receptionist"

  const sortedInvoices = [...invoices].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  const handleSort = (field: keyof Invoice) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getStatusBadge = (invoice: Invoice) => {
    const overdue = isInvoiceOverdue(invoice)
    const status = overdue && invoice.status !== "paid" ? "overdue" : invoice.status

    return (
      <div className="flex flex-col gap-1">
        <Badge className={getInvoiceStatusColor(status)}>{status.replace("_", " ").toUpperCase()}</Badge>
        {overdue && invoice.status !== "paid" && (
          <span className="text-xs text-red-600">{calculateDaysOverdue(invoice.dueDate)} days overdue</span>
        )}
      </div>
    )
  }

  if (invoices.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No invoices found</h3>
          <p className="text-muted-foreground text-center">
            No invoices match your current filters. Try adjusting your search criteria.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
        <CardDescription>
          Showing {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("invoiceNumber")}>
                  Invoice #
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("patientName")}>
                  Patient
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("invoiceDate")}>
                  Date
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("visitType")}>
                  Type
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("doctorName")}>
                  Doctor
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 text-right"
                  onClick={() => handleSort("totalAmount")}
                >
                  Amount
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedInvoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{invoice.patientName}</div>
                      <div className="text-sm text-muted-foreground">{invoice.patientPhone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{new Date(invoice.invoiceDate).toLocaleDateString()}</div>
                      <div className="text-sm text-muted-foreground">
                        Due: {new Date(invoice.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{invoice.visitType?.toUpperCase() || "N/A"}</Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{invoice.doctorName || "N/A"}</div>
                      <div className="text-sm text-muted-foreground">{invoice.department}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div>
                      <div className="font-medium">{formatCurrency(invoice.totalAmount)}</div>
                      {invoice.balanceAmount > 0 && (
                        <div className="text-sm text-red-600">Balance: {formatCurrency(invoice.balanceAmount)}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(invoice)}</TableCell>
                  <TableCell>
                    {invoice.paymentMethod && (
                      <div className="flex items-center gap-1">
                        <span>{getPaymentMethodIcon(invoice.paymentMethod)}</span>
                        <span className="text-sm capitalize">{invoice.paymentMethod.replace("_", " ")}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onView(invoice)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDownload(invoice)}>
                          <Download className="mr-2 h-4 w-4" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {canProcessPayment && invoice.status !== "paid" && (
                          <DropdownMenuItem onClick={() => onPayment(invoice)}>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Process Payment
                          </DropdownMenuItem>
                        )}
                        {canEdit && (
                          <DropdownMenuItem onClick={() => onEdit(invoice)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Invoice
                          </DropdownMenuItem>
                        )}
                        {canDelete && (
                          <DropdownMenuItem onClick={() => onDelete(invoice)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Invoice
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
  )
}
