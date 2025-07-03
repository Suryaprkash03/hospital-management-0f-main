// Seed script to create sample visits for testing
import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc, getDocs, query, where } from "firebase/firestore"

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

function generateVisitId() {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 8)
  return `VIS-${timestamp}-${randomStr}`.toUpperCase()
}

async function getRandomPatient() {
  const patientsSnapshot = await getDocs(collection(db, "patients"))
  const patients = patientsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  return patients[Math.floor(Math.random() * patients.length)]
}

async function getRandomDoctor() {
  const staffSnapshot = await getDocs(query(collection(db, "staff"), where("role", "==", "doctor")))
  const doctors = staffSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  return doctors[Math.floor(Math.random() * doctors.length)]
}

async function getRandomBed() {
  const bedsSnapshot = await getDocs(query(collection(db, "beds"), where("status", "==", "available")))
  const beds = bedsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  return beds[Math.floor(Math.random() * beds.length)]
}

const sampleVisits = [
  {
    visitType: "opd",
    symptoms: "Fever, headache, and body aches for 3 days",
    diagnosis: "Viral fever",
    prescribedMedicines: ["Paracetamol 500mg", "Rest and fluids"],
    notes: "Patient advised to rest and return if symptoms worsen",
    status: "completed",
  },
  {
    visitType: "opd",
    symptoms: "Chest pain and shortness of breath",
    diagnosis: "Anxiety-related chest pain",
    prescribedMedicines: ["Alprazolam 0.25mg", "Lifestyle counseling"],
    notes: "Referred to cardiology for further evaluation",
    status: "completed",
  },
  {
    visitType: "ipd",
    symptoms: "Severe abdominal pain, vomiting",
    diagnosis: "Acute appendicitis",
    prescribedMedicines: ["IV Antibiotics", "Pain management"],
    notes: "Emergency appendectomy performed",
    status: "active",
    admissionReason: "Emergency appendectomy required",
    expectedDischargeDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
  },
  {
    visitType: "ipd",
    symptoms: "Difficulty breathing, chest congestion",
    diagnosis: "Pneumonia",
    prescribedMedicines: ["IV Antibiotics", "Bronchodilators", "Oxygen therapy"],
    notes: "Patient responding well to treatment",
    status: "active",
    admissionReason: "Severe pneumonia requiring IV antibiotics",
    expectedDischargeDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
  },
  {
    visitType: "opd",
    symptoms: "Persistent cough for 2 weeks",
    diagnosis: "Bronchitis",
    prescribedMedicines: ["Cough syrup", "Antibiotics", "Steam inhalation"],
    notes: "Follow-up in 1 week if symptoms persist",
    status: "completed",
  },
]

async function seedVisits() {
  console.log("Starting to seed visits...")

  try {
    for (const visitTemplate of sampleVisits) {
      const patient = await getRandomPatient()
      const doctor = await getRandomDoctor()

      if (!patient || !doctor) {
        console.log("Skipping visit - no patients or doctors found")
        continue
      }

      let bedData = null
      if (visitTemplate.visitType === "ipd") {
        const bed = await getRandomBed()
        if (bed) {
          bedData = {
            bedId: bed.id,
            bedNumber: bed.bedNumber,
            roomNumber: bed.roomNumber,
          }
        }
      }

      const visitData = {
        visitId: generateVisitId(),
        patientId: patient.id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        doctorId: doctor.id,
        doctorName: `${doctor.firstName} ${doctor.lastName}`,
        doctorSpecialization: doctor.specialization || "General Medicine",
        visitDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in last 30 days
        createdBy: doctor.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...visitTemplate,
        ...bedData,
      }

      await addDoc(collection(db, "visits"), visitData)
      console.log(`Added visit: ${visitData.visitId} for ${visitData.patientName}`)
    }

    console.log("✅ Successfully seeded all visits!")
  } catch (error) {
    console.error("❌ Error seeding visits:", error)
  }
}

seedVisits()
