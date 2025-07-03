"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Medicine, Vendor } from "@/lib/types"

interface MedicineFormProps {
  medicine?: Medicine
  vendors: Vendor[]
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
}

export function MedicineForm({ medicine, vendors, onSubmit, onCancel }: MedicineFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    manufacturer: "",
    batchNumber: "",
    purchaseDate: "",
    expiryDate: "",
    quantity: 0,
    minThreshold: 10,
    unitPrice: 0,
    vendorId: "",
    vendorName: "",
    description: "",
    prescriptionRequired: false,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (medicine) {
      setFormData({
        name: medicine.name,
        category: medicine.category,
        manufacturer: medicine.manufacturer,
        batchNumber: medicine.batchNumber,
        purchaseDate: new Date(medicine.purchaseDate).toISOString().split("T")[0],
        expiryDate: new Date(medicine.expiryDate).toISOString().split("T")[0],
        quantity: medicine.quantity,
        minThreshold: medicine.minThreshold,
        unitPrice: medicine.unitPrice,
        vendorId: medicine.vendorId || "",
        vendorName: medicine.vendorName || "",
        description: medicine.description || "",
        prescriptionRequired: medicine.prescriptionRequired,
      })
    }
  }, [medicine])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const selectedVendor = vendors.find((v) => v.id === formData.vendorId)

      await onSubmit({
        ...formData,
        purchaseDate: new Date(formData.purchaseDate),
        expiryDate: new Date(formData.expiryDate),
        vendorName: selectedVendor?.name || "",
      })
    } catch (error) {
      console.error("Error submitting form:", error)
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

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{medicine ? "Edit Medicine" : "Add New Medicine"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Medicine Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tablet">Tablet</SelectItem>
                  <SelectItem value="syrup">Syrup</SelectItem>
                  <SelectItem value="injection">Injection</SelectItem>
                  <SelectItem value="capsule">Capsule</SelectItem>
                  <SelectItem value="ointment">Ointment</SelectItem>
                  <SelectItem value="drops">Drops</SelectItem>
                  <SelectItem value="inhaler">Inhaler</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer *</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => handleInputChange("manufacturer", e.target.value)}
                required
              />
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

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", Number(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minThreshold">Minimum Threshold *</Label>
              <Input
                id="minThreshold"
                type="number"
                min="0"
                value={formData.minThreshold}
                onChange={(e) => handleInputChange("minThreshold", Number(e.target.value))}
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

            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor</Label>
              <Select value={formData.vendorId} onValueChange={(value) => handleInputChange("vendorId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Vendor</SelectItem>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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

          <div className="flex items-center space-x-2">
            <Switch
              id="prescriptionRequired"
              checked={formData.prescriptionRequired}
              onCheckedChange={(checked) => handleInputChange("prescriptionRequired", checked)}
            />
            <Label htmlFor="prescriptionRequired">Prescription Required</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : medicine ? "Update Medicine" : "Add Medicine"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
