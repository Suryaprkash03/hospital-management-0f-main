"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Package, AlertTriangle, Download } from "lucide-react"
import type { Medicine } from "@/lib/types"
import { getStatusColor, getStatusLabel, formatCurrency, exportInventoryToCSV } from "@/lib/inventory-utils"
import { useAuth } from "@/contexts/auth-context"

interface MedicineTableProps {
  medicines: Medicine[]
  onEdit: (medicine: Medicine) => void
  onDelete: (id: string) => void
  onRestock: (medicine: Medicine) => void
  onDispense: (medicine: Medicine) => void
}

export function MedicineTable({ medicines, onEdit, onDelete, onRestock, onDispense }: MedicineTableProps) {
  const { user } = useAuth()
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const canEdit = user?.role === "admin" || user?.role === "pharmacist"
  const canDispense = user?.role === "admin" || user?.role === "nurse" || user?.role === "doctor"

  const totalPages = Math.ceil(medicines.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentMedicines = medicines.slice(startIndex, endIndex)

  const handleExport = () => {
    exportInventoryToCSV(medicines)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Medicine Inventory</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine Details</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentMedicines.map((medicine) => (
                <TableRow key={medicine.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{medicine.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {medicine.medicineId} • {medicine.manufacturer}
                      </div>
                      <div className="text-xs text-muted-foreground">Batch: {medicine.batchNumber}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {medicine.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{medicine.quantity}</div>
                      <div className="text-xs text-muted-foreground">Min: {medicine.minThreshold}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div>{formatCurrency(medicine.unitPrice)}</div>
                      <div className="text-xs text-muted-foreground">Total: {formatCurrency(medicine.totalValue)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{new Date(medicine.expiryDate).toLocaleDateString()}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(medicine.status)}>{getStatusLabel(medicine.status)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{medicine.vendorName || "N/A"}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {canEdit && (
                          <>
                            <DropdownMenuItem onClick={() => onEdit(medicine)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onRestock(medicine)}>
                              <Package className="mr-2 h-4 w-4" />
                              Restock
                            </DropdownMenuItem>
                          </>
                        )}
                        {canDispense && medicine.quantity > 0 && (
                          <DropdownMenuItem onClick={() => onDispense(medicine)}>
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Dispense
                          </DropdownMenuItem>
                        )}
                        {canEdit && (
                          <DropdownMenuItem onClick={() => onDelete(medicine.id)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, medicines.length)} of {medicines.length} medicines
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="text-sm">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
