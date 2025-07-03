// Sample inventory data seeding script
const sampleMedicines = [
  {
    name: "Paracetamol",
    category: "tablet",
    manufacturer: "ABC Pharma",
    batchNumber: "PAR001",
    quantity: 500,
    minThreshold: 50,
    unitPrice: 2.5,
    expiryDate: new Date("2025-12-31"),
    prescriptionRequired: false,
  },
  {
    name: "Amoxicillin",
    category: "capsule",
    manufacturer: "XYZ Pharma",
    batchNumber: "AMX001",
    quantity: 200,
    minThreshold: 30,
    unitPrice: 15.0,
    expiryDate: new Date("2025-06-30"),
    prescriptionRequired: true,
  },
  {
    name: "Cough Syrup",
    category: "syrup",
    manufacturer: "MediCare",
    batchNumber: "CS001",
    quantity: 100,
    minThreshold: 20,
    unitPrice: 45.0,
    expiryDate: new Date("2024-12-31"),
    prescriptionRequired: false,
  },
  {
    name: "Insulin",
    category: "injection",
    manufacturer: "DiabCare",
    batchNumber: "INS001",
    quantity: 50,
    minThreshold: 10,
    unitPrice: 250.0,
    expiryDate: new Date("2025-03-31"),
    prescriptionRequired: true,
  },
]

const sampleVendors = [
  {
    name: "MedSupply Co.",
    contactPerson: "John Smith",
    phone: "+91-9876543210",
    email: "john@medsupply.com",
    address: "123 Medical Street, Healthcare City, HC 12345",
    gstNumber: "29ABCDE1234F1Z5",
    status: "active",
  },
  {
    name: "PharmaDistributors Ltd.",
    contactPerson: "Sarah Johnson",
    phone: "+91-9876543211",
    email: "sarah@pharmadist.com",
    address: "456 Pharma Avenue, Medicine Town, MT 67890",
    gstNumber: "29FGHIJ5678K2Y6",
    status: "active",
  },
]

console.log("Sample inventory data ready for seeding")
console.log("Medicines:", sampleMedicines.length)
console.log("Vendors:", sampleVendors.length)
