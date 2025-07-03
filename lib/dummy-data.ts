// Dummy data for different roles
export const dummyData = {
  admin: {
    stats: {
      totalPatients: 1234,
      totalDoctors: 56,
      totalNurses: 89,
      totalAppointments: 245,
      bedsOccupied: 78,
      totalBeds: 120,
      todayRevenue: 45231,
      lowStockItems: 12,
    },
    recentAppointments: [
      { id: 1, patient: "John Doe", doctor: "Dr. Smith", time: "09:00", status: "completed" },
      { id: 2, patient: "Jane Wilson", doctor: "Dr. Johnson", time: "10:30", status: "in-progress" },
      { id: 3, patient: "Mike Brown", doctor: "Dr. Davis", time: "11:00", status: "scheduled" },
    ],
    revenueData: [
      { month: "Jan", revenue: 35000 },
      { month: "Feb", revenue: 42000 },
      { month: "Mar", revenue: 38000 },
      { month: "Apr", revenue: 45000 },
      { month: "May", revenue: 52000 },
      { month: "Jun", revenue: 48000 },
    ],
    appointmentTrends: [
      { day: "Mon", appointments: 45 },
      { day: "Tue", appointments: 52 },
      { day: "Wed", appointments: 38 },
      { day: "Thu", appointments: 61 },
      { day: "Fri", appointments: 55 },
      { day: "Sat", appointments: 32 },
      { day: "Sun", appointments: 28 },
    ],
  },
  doctor: {
    upcomingAppointments: [
      { id: 1, patient: "Sarah Johnson", time: "09:00", type: "Consultation", room: "Room 101" },
      { id: 2, patient: "Michael Chen", time: "09:30", type: "Follow-up", room: "Room 101" },
      { id: 3, patient: "Emily Davis", time: "10:00", type: "Check-up", room: "Room 101" },
      { id: 4, patient: "Robert Wilson", time: "10:30", type: "Consultation", room: "Room 101" },
    ],
    todayStats: {
      patientsAttended: 8,
      appointmentsScheduled: 12,
      pendingReports: 3,
      emergencyCalls: 1,
    },
    notifications: [
      { id: 1, type: "lab-report", message: "Lab results ready for John Doe", time: "10 min ago" },
      { id: 2, type: "message", message: "Nurse requested consultation for Room 205", time: "25 min ago" },
      { id: 3, type: "appointment", message: "New appointment scheduled for 2:00 PM", time: "1 hour ago" },
    ],
  },
  nurse: {
    assignedPatients: [
      { id: 1, name: "Alice Cooper", room: "Room 201", condition: "Post-surgery", priority: "high" },
      { id: 2, name: "Bob Martin", room: "Room 203", condition: "Recovery", priority: "medium" },
      { id: 3, name: "Carol White", room: "Room 205", condition: "Observation", priority: "low" },
      { id: 4, name: "David Lee", room: "Room 207", condition: "Treatment", priority: "high" },
    ],
    bedStatus: [
      { room: "Room 201", status: "occupied", patient: "Alice Cooper" },
      { room: "Room 202", status: "available", patient: null },
      { room: "Room 203", status: "occupied", patient: "Bob Martin" },
      { room: "Room 204", status: "maintenance", patient: null },
      { room: "Room 205", status: "occupied", patient: "Carol White" },
    ],
    medicationSchedule: [
      { patient: "Alice Cooper", medication: "Antibiotics", time: "09:00", status: "completed" },
      { patient: "Bob Martin", medication: "Pain Relief", time: "10:00", status: "pending" },
      { patient: "Carol White", medication: "Vitamins", time: "11:00", status: "pending" },
      { patient: "David Lee", medication: "Blood Thinner", time: "12:00", status: "scheduled" },
    ],
  },
  receptionist: {
    todayAppointments: [
      { id: 1, time: "09:00", patient: "John Smith", doctor: "Dr. Wilson", status: "checked-in" },
      { id: 2, time: "09:30", patient: "Mary Johnson", doctor: "Dr. Brown", status: "waiting" },
      { id: 3, time: "10:00", patient: "Peter Davis", doctor: "Dr. Wilson", status: "scheduled" },
      { id: 4, time: "10:30", patient: "Lisa Anderson", doctor: "Dr. Smith", status: "scheduled" },
      { id: 5, time: "11:00", patient: "Tom Wilson", doctor: "Dr. Brown", status: "scheduled" },
    ],
    doctors: [
      { id: 1, name: "Dr. Wilson", specialization: "Cardiology" },
      { id: 2, name: "Dr. Brown", specialization: "Pediatrics" },
      { id: 3, name: "Dr. Smith", specialization: "Internal Medicine" },
    ],
    quickStats: {
      totalAppointments: 24,
      checkedIn: 8,
      waiting: 3,
      completed: 12,
    },
  },
  patient: {
    nextAppointment: {
      date: "2024-01-15",
      time: "10:30",
      doctor: "Dr. Sarah Wilson",
      specialization: "Cardiology",
      location: "Room 301",
    },
    recentVisits: [
      { date: "2024-01-08", doctor: "Dr. Wilson", type: "Consultation", diagnosis: "Routine Check-up" },
      { date: "2023-12-15", doctor: "Dr. Brown", type: "Follow-up", diagnosis: "Blood Pressure Monitoring" },
      { date: "2023-11-22", doctor: "Dr. Smith", type: "Emergency", diagnosis: "Chest Pain Evaluation" },
    ],
    reports: [
      { id: 1, name: "Blood Test Results", date: "2024-01-08", type: "Lab Report" },
      { id: 2, name: "X-Ray Chest", date: "2023-12-15", type: "Imaging" },
      { id: 3, name: "ECG Report", date: "2023-11-22", type: "Diagnostic" },
    ],
    healthMetrics: {
      bloodPressure: "120/80",
      heartRate: "72 bpm",
      temperature: "98.6°F",
      weight: "70 kg",
    },
  },
}

export const notifications = [
  { id: 1, message: "New appointment scheduled", time: "5 min ago", type: "appointment" },
  { id: 2, message: "Lab results are ready", time: "15 min ago", type: "lab" },
  { id: 3, message: "Medication reminder", time: "30 min ago", type: "medication" },
  { id: 4, message: "System maintenance at 2 AM", time: "2 hours ago", type: "system" },
]
