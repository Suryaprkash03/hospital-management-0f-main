"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Medicine, Patient } from "@/lib/types"
import { formatCurrency, generateDispenseId } from "@/lib/inventory-utils"
import { useAuth } from "@/contexts/auth-context"
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface DispenseFormProps {
  medicine: Medicine | null
  isOpen: boolean
  onClose: () => void
  onDispense: () => void
}

export function DispenseForm({ medicine, isOpen, onClose, onDispense }: DispenseFormProps) {
  const { user } = useAuth()
  const [patients, setPatients] = useState<Patient[]>([])
  const [formData, setFormData] = useState({
    patientId: "",
    quantity: 1,
    notes: "",
    prescriptionId: "",
    doctorId: "",
  })
  const [loading, setLoading] = useState(false)
  const [loadingPatients, setLoadingPatients] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchPatients()
    }
  }, [isOpen])

  const fetchPatients = async () => {
    setLoadingPatients(true)
    try {
      const q = query(collection(db, "patients"), where("status", "==", "active"))
      const snapshot = await getDocs(q)
      const patientsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        dateOfBirth: doc.data().dateOfBirth?.toDate?.() || new Date(doc.data().dateOfBirth),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
      })) as Patient[]
      setPatients(patientsData)
    } catch (error) {
      console.error("Error fetching patients:", error)
    } finally {
      setLoadingPatients(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!medicine || !user) return

    setLoading(true)
    try {
      const selectedPatient = patients.find((p) => p.id === formData.patientId)
      if (!selectedPatient) {
        throw new Error("Patient not found")
      }

      // Check if enough stock is available
      if (formData.quantity > medicine.quantity) {
        throw new Error("Insufficient stock")
      }

      const dispenseId = generateDispenseId()
      const totalAmount = formData.quantity * medicine.unitPrice

      // Create dispense record
      await addDoc(collection(db, "dispenses"), {
        dispenseId,
        patientId: formData.patientId,
        patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
        medicineId: medicine.id,
        medicineName: medicine.name,
        quantity: formData.quantity,
        unitPrice: medicine.unitPrice,
        totalAmount,
        dispensedBy: user.uid,
        dispensedByName: user.email || "",
        dispensedByRole: user.role,
        dispensedDate: new Date(),
        status: "dispensed",
        notes: formData.notes,
        prescriptionId: formData.prescriptionId || undefined,
        doctorId: formData.doctorId || undefined,
        createdAt: new Date(),
      })

      // Update medicine stock
      const newQuantity = medicine.quantity - formData.quantity
      const newTotalValue = newQuantity * medicine.unitPrice

      await updateDoc(doc(db, "medicines", medicine.id), {
        quantity: newQuantity,
        totalValue: newTotalValue,
        updatedAt: new Date(),
      })

      // Reset form
      setFormData({
        patientId: "",
        quantity: 1,
        notes: "",
        prescriptionId: "",
        doctorId: "",
      })

      onDispense()
      onClose()
    } catch (error) {
      console.error("Error dispensing medicine:", error)
      alert(`Error: ${error}`)
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

  const totalAmount = medicine ? formData.quantity * medicine.unitPrice : 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Dispense Medicine</DialogTitle>
        </DialogHeader>

        {medicine && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium">{medicine.name}</h3>
              <p className="text-sm text-gray-600">Available Stock: {medicine.quantity} units</p>
              <p className="text-sm text-gray-600">Unit Price: {formatCurrency(medicine.unitPrice)}</p>
              {medicine.prescriptionRequired && (
                <p className="text-sm text-red-600 font-medium">⚠️ Prescription Required</p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patient">Patient *</Label>
                <Select
                  value={formData.patientId}
                  onValueChange={(value) => handleInputChange("patientId", value)}
                  disabled={loadingPatients}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingPatients ? "Loading patients..." : "Select patient"} />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.firstName} {patient.lastName} - {patient.patientId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={medicine.quantity}
                  value={formData.quantity}
                  onChange={(e) => handleInputChange("quantity", Number(e.target.value))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prescriptionId">Prescription ID</Label>
                <Input
                  id="prescriptionId"
                  value={formData.prescriptionId}
                  onChange={(e) => handleInputChange("prescriptionId", e.target.value)}
                  placeholder="Optional"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={2}
                  placeholder="Any additional notes..."
                />
              </div>

              {totalAmount > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium">Total Amount: {formatCurrency(totalAmount)}</p>
                  <p className="text-xs text-gray-600">
                    Remaining Stock: {medicine.quantity - formData.quantity} units
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || !formData.patientId || formData.quantity === 0}>
                  {loading ? "Dispensing..." : "Dispense Medicine"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
