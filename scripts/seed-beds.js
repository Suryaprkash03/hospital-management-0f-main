// Seed script to create sample beds for testing
import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const sampleBeds = [
  // General Ward
  { bedNumber: "G001", roomNumber: "101", ward: "General Ward", bedType: "general", status: "available" },
  { bedNumber: "G002", roomNumber: "101", ward: "General Ward", bedType: "general", status: "available" },
  {
    bedNumber: "G003",
    roomNumber: "102",
    ward: "General Ward",
    bedType: "general",
    status: "occupied",
    assignedPatientName: "John Doe",
    assignedDate: new Date(),
  },
  { bedNumber: "G004", roomNumber: "102", ward: "General Ward", bedType: "general", status: "available" },
  { bedNumber: "G005", roomNumber: "103", ward: "General Ward", bedType: "general", status: "maintenance" },

  // Private Ward
  { bedNumber: "P001", roomNumber: "201", ward: "Private Ward", bedType: "private", status: "available" },
  {
    bedNumber: "P002",
    roomNumber: "202",
    ward: "Private Ward",
    bedType: "private",
    status: "occupied",
    assignedPatientName: "Jane Smith",
    assignedDate: new Date(),
  },
  { bedNumber: "P003", roomNumber: "203", ward: "Private Ward", bedType: "private", status: "available" },
  { bedNumber: "P004", roomNumber: "204", ward: "Private Ward", bedType: "private", status: "reserved" },

  // ICU
  { bedNumber: "ICU001", roomNumber: "301", ward: "ICU", bedType: "icu", status: "available" },
  {
    bedNumber: "ICU002",
    roomNumber: "301",
    ward: "ICU",
    bedType: "icu",
    status: "occupied",
    assignedPatientName: "Bob Johnson",
    assignedDate: new Date(),
  },
  { bedNumber: "ICU003", roomNumber: "302", ward: "ICU", bedType: "icu", status: "available" },
  { bedNumber: "ICU004", roomNumber: "302", ward: "ICU", bedType: "icu", status: "maintenance" },

  // Emergency
  { bedNumber: "E001", roomNumber: "401", ward: "Emergency", bedType: "emergency", status: "available" },
  { bedNumber: "E002", roomNumber: "401", ward: "Emergency", bedType: "emergency", status: "available" },
  {
    bedNumber: "E003",
    roomNumber: "402",
    ward: "Emergency",
    bedType: "emergency",
    status: "occupied",
    assignedPatientName: "Alice Brown",
    assignedDate: new Date(),
  },
  { bedNumber: "E004", roomNumber: "402", ward: "Emergency", bedType: "emergency", status: "available" },
]

async function seedBeds() {
  console.log("Starting to seed beds...")

  try {
    for (const bed of sampleBeds) {
      const bedData = {
        ...bed,
        assignedDate: bed.assignedDate || null,
        lastCleaned: new Date(),
        notes: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await addDoc(collection(db, "beds"), bedData)
      console.log(`Added bed: ${bed.bedNumber}`)
    }

    console.log("✅ Successfully seeded all beds!")
  } catch (error) {
    console.error("❌ Error seeding beds:", error)
  }
}

seedBeds()
