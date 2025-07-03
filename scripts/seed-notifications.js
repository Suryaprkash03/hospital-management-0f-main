import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore"

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

const sampleNotifications = [
  {
    title: "New Appointment Booked",
    message: "You have a new appointment scheduled with Dr. Smith for tomorrow at 10:00 AM",
    type: "appointment_booked",
    priority: "medium",
    status: "unread",
    recipientId: "sample-patient-id",
    recipientRole: "patient",
    senderId: "system",
    senderName: "Hospital System",
    data: {
      appointmentId: "APT-001",
      doctorName: "Dr. Smith",
      date: "2024-01-15",
      time: "10:00 AM",
    },
  },
  {
    title: "Low Stock Alert",
    message: "Paracetamol is running low in stock (5 units remaining)",
    type: "low_stock_alert",
    priority: "high",
    status: "unread",
    recipientId: "sample-admin-id",
    recipientRole: "admin",
    senderId: "system",
    senderName: "Inventory System",
    data: {
      medicineId: "MED-001",
      medicineName: "Paracetamol",
      quantity: 5,
      threshold: 10,
    },
  },
  {
    title: "Report Available",
    message: "Your blood test results are now available for review",
    type: "report_uploaded",
    priority: "medium",
    status: "unread",
    recipientId: "sample-patient-id",
    recipientRole: "patient",
    senderId: "sample-doctor-id",
    senderName: "Dr. Johnson",
    data: {
      reportId: "RPT-001",
      reportType: "Blood Test",
      patientName: "John Doe",
    },
  },
  {
    title: "Payment Received",
    message: "Payment of $2,500 has been received for invoice INV-001",
    type: "invoice_payment",
    priority: "low",
    status: "read",
    recipientId: "sample-admin-id",
    recipientRole: "admin",
    senderId: "system",
    senderName: "Billing System",
    data: {
      invoiceNumber: "INV-001",
      amount: 2500,
      paymentMethod: "card",
    },
  },
  {
    title: "Appointment Reminder",
    message: "Reminder: You have an appointment with Dr. Brown in 1 hour",
    type: "appointment_reminder",
    priority: "high",
    status: "unread",
    recipientId: "sample-patient-id",
    recipientRole: "patient",
    senderId: "system",
    senderName: "Appointment System",
    data: {
      appointmentId: "APT-002",
      doctorName: "Dr. Brown",
      time: "2:00 PM",
    },
  },
]

async function seedNotifications() {
  try {
    console.log("Starting to seed notifications...")

    for (const notification of sampleNotifications) {
      await addDoc(collection(db, "notifications"), {
        ...notification,
        sentAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      console.log(`Added notification: ${notification.title}`)
    }

    console.log("✅ Successfully seeded notifications!")
  } catch (error) {
    console.error("❌ Error seeding notifications:", error)
  }
}

seedNotifications()
