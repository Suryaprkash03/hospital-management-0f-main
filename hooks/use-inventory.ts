"use client"

import { useState, useEffect } from "react"
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Medicine, Vendor, Dispense, Restock, InventoryFilters, InventorySummary } from "@/lib/types"
import { calculateMedicineStatus, calculateInventorySummary, generateMedicineId } from "@/lib/inventory-utils"
import { useAuth } from "@/contexts/auth-context"

export function useInventory() {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    const q = query(collection(db, "medicines"), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const medicinesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          purchaseDate: doc.data().purchaseDate?.toDate(),
          expiryDate: doc.data().expiryDate?.toDate(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Medicine[]

        // Calculate status for each medicine
        const medicinesWithStatus = medicinesData.map((medicine) => ({
          ...medicine,
          status: calculateMedicineStatus(medicine),
        }))

        setMedicines(medicinesWithStatus)
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [])

  const addMedicine = async (
    medicineData: Omit<Medicine, "id" | "medicineId" | "status" | "createdAt" | "updatedAt">,
  ) => {
    try {
      const medicineId = generateMedicineId()
      const totalValue = medicineData.quantity * medicineData.unitPrice

      await addDoc(collection(db, "medicines"), {
        ...medicineData,
        medicineId,
        totalValue,
        status: "available",
        createdBy: user?.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    } catch (err) {
      throw new Error(`Failed to add medicine: ${err}`)
    }
  }

  const updateMedicine = async (id: string, updates: Partial<Medicine>) => {
    try {
      const medicineRef = doc(db, "medicines", id)
      const totalValue = updates.quantity && updates.unitPrice ? updates.quantity * updates.unitPrice : undefined

      await updateDoc(medicineRef, {
        ...updates,
        ...(totalValue && { totalValue }),
        updatedAt: new Date(),
      })
    } catch (err) {
      throw new Error(`Failed to update medicine: ${err}`)
    }
  }

  const deleteMedicine = async (id: string) => {
    try {
      await deleteDoc(doc(db, "medicines", id))
    } catch (err) {
      throw new Error(`Failed to delete medicine: ${err}`)
    }
  }

  const restockMedicine = async (medicineId: string, restockData: Omit<Restock, "id" | "createdAt">) => {
    try {
      const medicine = medicines.find((m) => m.id === medicineId)
      if (!medicine) throw new Error("Medicine not found")

      // Add restock record
      await addDoc(collection(db, "restocks"), {
        ...restockData,
        createdAt: new Date(),
      })

      // Update medicine quantity and other details
      const newQuantity = medicine.quantity + restockData.quantity
      const newTotalValue = newQuantity * restockData.unitPrice

      await updateMedicine(medicineId, {
        quantity: newQuantity,
        unitPrice: restockData.unitPrice,
        totalValue: newTotalValue,
        expiryDate: restockData.expiryDate,
        batchNumber: restockData.batchNumber,
        vendorId: restockData.vendorId,
        vendorName: restockData.vendorName,
      })
    } catch (err) {
      throw new Error(`Failed to restock medicine: ${err}`)
    }
  }

  const filterMedicines = (filters: InventoryFilters): Medicine[] => {
    return medicines.filter((medicine) => {
      const matchesSearch =
        !filters.search ||
        medicine.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        medicine.manufacturer.toLowerCase().includes(filters.search.toLowerCase()) ||
        medicine.medicineId.toLowerCase().includes(filters.search.toLowerCase())

      const matchesCategory = !filters.category || medicine.category === filters.category
      const matchesStatus = !filters.status || medicine.status === filters.status
      const matchesVendor = !filters.vendorId || medicine.vendorId === filters.vendorId

      const matchesExpiryRange =
        !filters.expiryRange[0] ||
        !filters.expiryRange[1] ||
        (new Date(medicine.expiryDate) >= filters.expiryRange[0] &&
          new Date(medicine.expiryDate) <= filters.expiryRange[1])

      const matchesPriceRange =
        medicine.unitPrice >= filters.priceRange[0] && medicine.unitPrice <= filters.priceRange[1]

      return (
        matchesSearch && matchesCategory && matchesStatus && matchesVendor && matchesExpiryRange && matchesPriceRange
      )
    })
  }

  const getInventorySummary = (): InventorySummary => {
    return calculateInventorySummary(medicines)
  }

  return {
    medicines,
    loading,
    error,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    restockMedicine,
    filterMedicines,
    getInventorySummary,
  }
}

export function useVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    const q = query(collection(db, "vendors"), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const vendorsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Vendor[]

        setVendors(vendorsData)
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [])

  const addVendor = async (vendorData: Omit<Vendor, "id" | "vendorId" | "createdAt" | "updatedAt">) => {
    try {
      await addDoc(collection(db, "vendors"), {
        ...vendorData,
        createdBy: user?.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    } catch (err) {
      throw new Error(`Failed to add vendor: ${err}`)
    }
  }

  const updateVendor = async (id: string, updates: Partial<Vendor>) => {
    try {
      const vendorRef = doc(db, "vendors", id)
      await updateDoc(vendorRef, {
        ...updates,
        updatedAt: new Date(),
      })
    } catch (err) {
      throw new Error(`Failed to update vendor: ${err}`)
    }
  }

  return {
    vendors,
    loading,
    error,
    addVendor,
    updateVendor,
  }
}

export function useDispenses() {
  const [dispenses, setDispenses] = useState<Dispense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const q = query(collection(db, "dispenses"), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const dispensesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          dispensedDate: doc.data().dispensedDate?.toDate(),
          createdAt: doc.data().createdAt?.toDate(),
        })) as Dispense[]

        setDispenses(dispensesData)
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [])

  return {
    dispenses,
    loading,
    error,
  }
}
