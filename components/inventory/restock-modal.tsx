"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Medicine, Vendor } from "@/lib/types"
import { formatCurrency } from "@/lib/inventory-utils"
import { useAuth } from "@/contexts/auth-context"

interface RestockModalProps {
  medicine: Medicine | null
  vendors: Vendor[]
  isOpen: boolean
  onClose: () => void
  onRestock: (medicineId: string, restockData: any) => Promise<void>
}

export function RestockModal({ medicine, vendors, isOpen, onClose, onRestock }: RestockModalProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    quantity: 0,
    unitPrice: 0,
    vendorId: "",
    batchNumber: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
    notes: "",
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!medicine) return

    setLoading(true)
    try {
      const selectedVendor = vendors.find((v) => v.id === formData.vendorId)

      await onRestock(medicine.id, {
        medicineId: medicine.id,
        quantity: formData.quantity,
        unitPrice: formData.unitPrice,
        totalCost: formData.quantity * formData.unitPrice,
        vendorId: formData.vendorId || undefined,
        vendorName: selectedVendor?.name || undefined,
        batchNumber: formData.batchNumber,
        purchaseDate: new Date(formData.purchaseDate),
        expiryDate: new Date(formData.expiryDate),
        restockedBy: user?.uid || "",
        restockedByName: user?.email || "",
        notes: formData.notes,
      })

      // Reset form
      setFormData({
        quantity: 0,
        unitPrice: 0,
        vendorId: "",
        batchNumber: "",
        purchaseDate: new Date().toISOString().split("T")[0],
        expiryDate: "",
        notes: "",
      })

      onClose()
    } catch (error) {
      console.error("Error restocking medicine:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const totalCost = formData.quantity * formData.unitPrice

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Restock Medicine</DialogTitle>
        </DialogHeader>

        {medicine && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium">{medicine.name}</h3>
              <p className="text-sm text-gray-600">Current Stock: {medicine.quantity} units</p>
              <p className="text-sm text-gray-600">Current Price: {formatCurrency(medicine.unitPrice)}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity to Add *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange("quantity", Number(e.target.value))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unitPrice">Unit Price ($) *</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) => handleInputChange("unitPrice", Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor</Label>
                <Select value={formData.vendorId} onValueChange={(value) => handleInputChange("vendorId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-vendor">No Vendor</SelectItem>
                    {vendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="batchNumber">Batch Number *</Label>
                <Input
                  id="batchNumber"
                  value={formData.batchNumber}
                  onChange={(e) => handleInputChange("batchNumber", e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchaseDate">Purchase Date *</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => handleInputChange("purchaseDate", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date *</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={2}
                />
              </div>

              {totalCost > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium">Total Cost: {formatCurrency(totalCost)}</p>
                  <p className="text-xs text-gray-600">New Stock: {medicine.quantity + formData.quantity} units</p>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || formData.quantity === 0}>
                  {loading ? "Restocking..." : "Restock Medicine"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
