// Script to add sample doctor schedules for testing
import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc, getDocs, query, where } from "firebase/firestore"

// Your Firebase config (replace with your actual config)
const firebaseConfig = {
  // Add your config here
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function seedDoctorSchedules() {
  try {
    // Get all doctors
    const staffQuery = query(collection(db, "staff"), where("role", "==", "doctor"), where("status", "==", "active"))

    const staffSnapshot = await getDocs(staffQuery)

    for (const staffDoc of staffSnapshot.docs) {
      const doctorId = staffDoc.id
      const doctorData = staffDoc.data()

      console.log(`Adding schedule for Dr. ${doctorData.firstName} ${doctorData.lastName}`)

      // Add Monday to Friday schedule (9 AM to 5 PM)
      for (let dayOfWeek = 1; dayOfWeek <= 5; dayOfWeek++) {
        await addDoc(collection(db, "staffSchedules"), {
          staffId: doctorId,
          dayOfWeek: dayOfWeek,
          startTime: "09:00",
          endTime: "17:00",
          isAvailable: true,
          notes: "Regular working hours",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }

      console.log(`✅ Schedule added for ${doctorData.firstName} ${doctorData.lastName}`)
    }

    console.log("🎉 All doctor schedules have been seeded!")
  } catch (error) {
    console.error("Error seeding schedules:", error)
  }
}

seedDoctorSchedules()
