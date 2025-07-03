import type { Medicine, MedicineStatus, InventorySummary } from "./types"

export function calculateMedicineStatus(medicine: Medicine): MedicineStatus {
  const now = new Date()
  const expiryDate = new Date(medicine.expiryDate)
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (medicine.quantity === 0) {
    return "out_of_stock"
  }

  if (daysUntilExpiry < 0) {
    return "expired"
  }

  if (daysUntilExpiry <= 30) {
    return "expiring_soon"
  }

  if (medicine.quantity <= medicine.minThreshold) {
    return "low_stock"
  }

  return "available"
}

export function getStatusColor(status: MedicineStatus): string {
  switch (status) {
    case "available":
      return "bg-green-100 text-green-800"
    case "low_stock":
      return "bg-yellow-100 text-yellow-800"
    case "out_of_stock":
      return "bg-red-100 text-red-800"
    case "expired":
      return "bg-red-100 text-red-800"
    case "expiring_soon":
      return "bg-orange-100 text-orange-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function getStatusLabel(status: MedicineStatus): string {
  switch (status) {
    case "available":
      return "Available"
    case "low_stock":
      return "Low Stock"
    case "out_of_stock":
      return "Out of Stock"
    case "expired":
      return "Expired"
    case "expiring_soon":
      return "Expiring Soon"
    default:
      return "Unknown"
  }
}

export function calculateInventorySummary(medicines: Medicine[]): InventorySummary {
  const summary: InventorySummary = {
    totalMedicines: medicines.length,
    totalValue: 0,
    lowStockItems: 0,
    expiredItems: 0,
    expiringSoonItems: 0,
    outOfStockItems: 0,
    categoryCounts: {
      tablet: 0,
      syrup: 0,
      injection: 0,
      capsule: 0,
      ointment: 0,
      drops: 0,
      inhaler: 0,
      other: 0,
    },
  }

  medicines.forEach((medicine) => {
    const status = calculateMedicineStatus(medicine)
    summary.totalValue += medicine.totalValue
    summary.categoryCounts[medicine.category]++

    switch (status) {
      case "low_stock":
        summary.lowStockItems++
        break
      case "expired":
        summary.expiredItems++
        break
      case "expiring_soon":
        summary.expiringSoonItems++
        break
      case "out_of_stock":
        summary.outOfStockItems++
        break
    }
  })

  return summary
}

export function generateMedicineId(): string {
  const prefix = "MED"
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `${prefix}${timestamp}${random}`
}

export function generateDispenseId(): string {
  const prefix = "DSP"
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `${prefix}${timestamp}${random}`
}

export function generateVendorId(): string {
  const prefix = "VEN"
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `${prefix}${timestamp}${random}`
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function isExpiringSoon(expiryDate: Date, days = 30): boolean {
  const now = new Date()
  const expiry = new Date(expiryDate)
  const diffTime = expiry.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= days && diffDays > 0
}

export function isExpired(expiryDate: Date): boolean {
  const now = new Date()
  const expiry = new Date(expiryDate)
  return expiry < now
}

export function exportInventoryToCSV(medicines: Medicine[]): void {
  const headers = [
    "Medicine ID",
    "Name",
    "Category",
    "Manufacturer",
    "Batch Number",
    "Quantity",
    "Unit Price",
    "Total Value",
    "Expiry Date",
    "Status",
    "Vendor",
  ]

  const csvContent = [
    headers.join(","),
    ...medicines.map((medicine) =>
      [
        medicine.medicineId,
        medicine.name,
        medicine.category,
        medicine.manufacturer,
        medicine.batchNumber,
        medicine.quantity,
        medicine.unitPrice,
        medicine.totalValue,
        new Date(medicine.expiryDate).toLocaleDateString(),
        getStatusLabel(calculateMedicineStatus(medicine)),
        medicine.vendorName || "",
      ].join(","),
    ),
  ].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `inventory_${new Date().toISOString().split("T")[0]}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
