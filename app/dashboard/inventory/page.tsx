"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useInventory, useVendors } from "@/hooks/use-inventory"
import { InventorySummaryCards } from "@/components/inventory/inventory-summary-cards"
import { InventoryFiltersComponent } from "@/components/inventory/inventory-filters"
import { MedicineTable } from "@/components/inventory/medicine-table"
import { MedicineForm } from "@/components/inventory/medicine-form"
import { RestockModal } from "@/components/inventory/restock-modal"
import { DispenseForm } from "@/components/inventory/dispense-form"
import { VendorForm } from "@/components/inventory/vendor-form"
import type { Medicine, InventoryFilters } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"

export default function InventoryPage() {
  const { user } = useAuth()
  const {
    medicines,
    loading,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    restockMedicine,
    filterMedicines,
    getInventorySummary,
  } = useInventory()
  const { vendors, addVendor, updateVendor } = useVendors()

  const [filters, setFilters] = useState<InventoryFilters>({
    search: "",
    category: "",
    status: "",
    vendorId: "",
    expiryRange: [null, null],
    priceRange: [0, 10000],
  })

  const [showMedicineForm, setShowMedicineForm] = useState(false)
  const [showVendorForm, setShowVendorForm] = useState(false)
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null)
  const [restockingMedicine, setRestockingMedicine] = useState<Medicine | null>(null)
  const [dispensingMedicine, setDispensingMedicine] = useState<Medicine | null>(null)

  const canManageInventory = user?.role === "admin" || user?.role === "pharmacist"
  const filteredMedicines = filterMedicines(filters)
  const summary = getInventorySummary()

  const handleAddMedicine = async (data: any) => {
    await addMedicine(data)
    setShowMedicineForm(false)
  }

  const handleUpdateMedicine = async (data: any) => {
    if (editingMedicine) {
      await updateMedicine(editingMedicine.id, data)
      setEditingMedicine(null)
      setShowMedicineForm(false)
    }
  }

  const handleDeleteMedicine = async (id: string) => {
    if (confirm("Are you sure you want to delete this medicine?")) {
      await deleteMedicine(id)
    }
  }

  const handleRestock = async (medicineId: string, restockData: any) => {
    await restockMedicine(medicineId, restockData)
    setRestockingMedicine(null)
  }

  const handleEditMedicine = (medicine: Medicine) => {
    setEditingMedicine(medicine)
    setShowMedicineForm(true)
  }

  const handleAddVendor = async (data: any) => {
    await addVendor(data)
    setShowVendorForm(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-4"></div>
            <p className="text-emerald-600 font-medium">Loading inventory...</p>
          </div>
        </div>
      </div>
    )
  }

  if (showMedicineForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-6">
        <MedicineForm
          medicine={editingMedicine || undefined}
          vendors={vendors}
          onSubmit={editingMedicine ? handleUpdateMedicine : handleAddMedicine}
          onCancel={() => {
            setShowMedicineForm(false)
            setEditingMedicine(null)
          }}
        />
      </div>
    )
  }

  if (showVendorForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-6">
        <VendorForm onSubmit={handleAddVendor} onCancel={() => setShowVendorForm(false)} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Inventory Management
            </h1>
            <p className="text-emerald-600/70">Manage medicines, track stock levels, and handle dispensing</p>
          </div>
          {canManageInventory && (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowVendorForm(true)}
                variant="outline"
                className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Vendor
              </Button>
              <Button
                onClick={() => setShowMedicineForm(true)}
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Medicine
              </Button>
            </div>
          )}
        </div>

        <InventorySummaryCards summary={summary} />

        <InventoryFiltersComponent filters={filters} onFiltersChange={setFilters} vendors={vendors} />

        <MedicineTable
          medicines={filteredMedicines}
          onEdit={handleEditMedicine}
          onDelete={handleDeleteMedicine}
          onRestock={setRestockingMedicine}
          onDispense={setDispensingMedicine}
        />

        <RestockModal
          medicine={restockingMedicine}
          vendors={vendors}
          isOpen={!!restockingMedicine}
          onClose={() => setRestockingMedicine(null)}
          onRestock={handleRestock}
        />

        <DispenseForm
          medicine={dispensingMedicine}
          isOpen={!!dispensingMedicine}
          onClose={() => setDispensingMedicine(null)}
          onDispense={() => {
            // Refresh data after dispensing
            setDispensingMedicine(null)
          }}
        />
      </div>
    </div>
  )
}
