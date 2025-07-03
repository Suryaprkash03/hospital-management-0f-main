"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Search, Calculator } from "lucide-react"
import { usePatients } from "@/hooks/use-patients"
import { useStaff } from "@/hooks/use-staff"
import { useBilling } from "@/hooks/use-billing"
import { useAuth } from "@/contexts/auth-context"
import type { Invoice, InvoiceItem } from "@/lib/types"
import { commonServices, paymentMethods, calculateInvoiceTotals, formatCurrency } from "@/lib/billing-utils"
import { toast } from "sonner"

interface InvoiceFormProps {
  invoice?: Invoice
  onSuccess: () => void
  onCancel: () => void
}

export function InvoiceForm({ invoice, onSuccess, onCancel }: InvoiceFormProps) {
  const { user } = useAuth()
  const { patients } = usePatients()
  const { staff } = useStaff()
  const { createInvoice, updateInvoice } = useBilling()

  const [formData, setFormData] = useState({
    patientId: invoice?.patientId || "",
    patientName: invoice?.patientName || "",
    patientPhone: invoice?.patientPhone || "",
    patientEmail: invoice?.patientEmail || "",
    visitType: invoice?.visitType || "opd",
    doctorId: invoice?.doctorId || "",
    doctorName: invoice?.doctorName || "",
    department: invoice?.department || "",
    invoiceDate: invoice?.invoiceDate
      ? new Date(invoice.invoiceDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    dueDate: invoice?.dueDate
      ? new Date(invoice.dueDate).toISOString().split("T")[0]
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    discountPercentage: invoice?.discountPercentage || 0,
    taxPercentage: invoice?.taxPercentage || 18,
    paymentMethod: invoice?.paymentMethod || "",
    notes: invoice?.notes || "",
    terms: invoice?.terms || "Payment due within 30 days",
  })

  const [items, setItems] = useState<InvoiceItem[]>(
    invoice?.items || [
      {
        id: "1",
        name: "",
        description: "",
        category: "consultation",
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
      },
    ],
  )

  const [totals, setTotals] = useState({
    subtotal: 0,
    discountAmount: 0,
    taxAmount: 0,
    totalAmount: 0,
  })

  const [loading, setLoading] = useState(false)
  const [patientSearch, setPatientSearch] = useState("")
  const [showPatientDropdown, setShowPatientDropdown] = useState(false)

  const doctors = staff.filter((s) => s.role === "doctor")
  const filteredPatients = patients
    .filter(
      (p) =>
        p.firstName.toLowerCase().includes(patientSearch.toLowerCase()) ||
        p.lastName.toLowerCase().includes(patientSearch.toLowerCase()) ||
        p.patientId.toLowerCase().includes(patientSearch.toLowerCase()),
    )
    .slice(0, 10)

  useEffect(() => {
    const calculatedTotals = calculateInvoiceTotals(items, formData.discountPercentage, formData.taxPercentage)
    setTotals(calculatedTotals)
  }, [items, formData.discountPercentage, formData.taxPercentage])

  const handlePatientSelect = (patient: any) => {
    setFormData((prev) => ({
      ...prev,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientPhone: patient.phone,
      patientEmail: patient.email,
    }))
    setPatientSearch(`${patient.firstName} ${patient.lastName}`)
    setShowPatientDropdown(false)
  }

  const handleDoctorSelect = (doctorId: string) => {
    const doctor = doctors.find((d) => d.id === doctorId)
    if (doctor) {
      setFormData((prev) => ({
        ...prev,
        doctorId: doctor.id,
        doctorName: `${doctor.firstName} ${doctor.lastName}`,
        department: doctor.department,
      }))
    }
  }

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      name: "",
      description: "",
      category: "consultation",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id))
    }
  }

  const updateItem = (id: string, field: string, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          if (field === "quantity" || field === "unitPrice") {
            updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice
          }
          return updatedItem
        }
        return item
      }),
    )
  }

  const addCommonService = (service: any, itemId: string) => {
    updateItem(itemId, "name", service.name)
    updateItem(itemId, "category", service.category)
    updateItem(itemId, "unitPrice", service.price)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.patientId) {
      toast.error("Please select a patient")
      return
    }

    if (items.some((item) => !item.name || item.unitPrice <= 0)) {
      toast.error("Please fill in all item details")
      return
    }

    setLoading(true)

    try {
      const invoiceData = {
        ...formData,
        items,
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        taxAmount: totals.taxAmount,
        totalAmount: totals.totalAmount,
        paidAmount: 0,
        balanceAmount: totals.totalAmount,
        status: "pending" as const,
        paymentStatus: "pending" as const,
        invoiceDate: new Date(formData.invoiceDate),
        dueDate: new Date(formData.dueDate),
        createdBy: user?.uid || "",
        createdByName: user?.profile?.firstName
          ? `${user.profile.firstName} ${user.profile.lastName}`
          : user?.email || "",
      }

      if (invoice) {
        await updateInvoice(invoice.id, invoiceData)
      } else {
        await createInvoice(invoiceData)
      }

      onSuccess()
    } catch (error) {
      console.error("Error saving invoice:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{invoice ? "Edit Invoice" : "Create New Invoice"}</CardTitle>
          <CardDescription>
            {invoice ? "Update invoice details" : "Generate a new invoice for patient services"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Patient Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patient">Patient *</Label>
              <div className="relative">
                <div className="flex">
                  <Input
                    placeholder="Search patient by name or ID..."
                    value={patientSearch}
                    onChange={(e) => {
                      setPatientSearch(e.target.value)
                      setShowPatientDropdown(true)
                    }}
                    onFocus={() => setShowPatientDropdown(true)}
                  />
                  <Button type="button" variant="outline" className="ml-2">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                {showPatientDropdown && filteredPatients.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredPatients.map((patient) => (
                      <div
                        key={patient.id}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b"
                        onClick={() => handlePatientSelect(patient)}
                      >
                        <div className="font-medium">
                          {patient.firstName} {patient.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {patient.patientId} | {patient.phone}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="visitType">Visit Type</Label>
              <Select
                value={formData.visitType}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, visitType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select visit type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="opd">OPD</SelectItem>
                  <SelectItem value="ipd">IPD</SelectItem>
                  <SelectItem value="pharmacy">Pharmacy</SelectItem>
                  <SelectItem value="lab">Laboratory</SelectItem>
                  <SelectItem value="radiology">Radiology</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Doctor and Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="doctor">Attending Doctor</Label>
              <Select value={formData.doctorId} onValueChange={handleDoctorSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select doctor" />
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

            <div className="space-y-2">
              <Label htmlFor="invoiceDate">Invoice Date</Label>
              <Input
                type="date"
                value={formData.invoiceDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, invoiceDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
          </div>

          <Separator />

          {/* Invoice Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Invoice Items</h3>
              <Button type="button" onClick={addItem} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <Card key={item.id}>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                      <div className="md:col-span-2 space-y-2">
                        <Label>Service/Item Name *</Label>
                        <Input
                          placeholder="Enter service name"
                          value={item.name}
                          onChange={(e) => updateItem(item.id, "name", e.target.value)}
                        />
                        <div className="flex flex-wrap gap-1 mt-2">
                          {commonServices.slice(0, 3).map((service) => (
                            <Badge
                              key={service.name}
                              variant="outline"
                              className="cursor-pointer text-xs"
                              onClick={() => addCommonService(service, item.id)}
                            >
                              {service.name}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={item.category} onValueChange={(value) => updateItem(item.id, "category", value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="consultation">Consultation</SelectItem>
                            <SelectItem value="procedure">Procedure</SelectItem>
                            <SelectItem value="medicine">Medicine</SelectItem>
                            <SelectItem value="test">Test</SelectItem>
                            <SelectItem value="bed_charge">Bed Charge</SelectItem>
                            <SelectItem value="equipment">Equipment</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, "quantity", Number.parseInt(e.target.value) || 1)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Unit Price ($)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, "unitPrice", Number.parseFloat(e.target.value) || 0)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Total</Label>
                          <div className="font-medium">{formatCurrency(item.totalPrice)}</div>
                        </div>
                        {items.length > 1 && (
                          <Button type="button" variant="outline" size="sm" onClick={() => removeItem(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="mt-3">
                      <Label>Description (Optional)</Label>
                      <Textarea
                        placeholder="Additional details about this item"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, "description", e.target.value)}
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Calculations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.discountPercentage}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, discountPercentage: Number.parseFloat(e.target.value) || 0 }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tax (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.taxPercentage}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, taxPercentage: Number.parseFloat(e.target.value) || 0 }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, paymentMethod: value }))}
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Invoice Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Discount ({formData.discountPercentage}%):</span>
                  <span>-{formatCurrency(totals.discountAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({formData.taxPercentage}%):</span>
                  <span>{formatCurrency(totals.taxAmount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(totals.totalAmount)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notes and Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Additional notes for this invoice"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Terms & Conditions</Label>
              <Textarea
                placeholder="Payment terms and conditions"
                value={formData.terms}
                onChange={(e) => setFormData((prev) => ({ ...prev, terms: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : invoice ? "Update Invoice" : "Create Invoice"}
        </Button>
      </div>
    </form>
  )
}
