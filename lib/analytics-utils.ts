import type {
  DoctorAnalytics,
  PatientAnalytics,
  KPIMetrics,
  ChartData,
  Patient,
  Appointment,
  Visit,
  Medicine,
  Invoice,
  StaffMember,
} from "./types"

export function calculateKPIMetrics(
  patients: Patient[],
  appointments: Appointment[],
  visits: Visit[],
  medicines: Medicine[],
  invoices: Invoice[],
  staff: StaffMember[],
): KPIMetrics {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const thisMonth = new Date()
  thisMonth.setDate(1)
  thisMonth.setHours(0, 0, 0, 0)

  // Today's appointments
  const todayAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.date)
    aptDate.setHours(0, 0, 0, 0)
    return aptDate.getTime() === today.getTime()
  }).length

  // Today's revenue
  const todayRevenue = invoices
    .filter((inv) => {
      const invDate = new Date(inv.invoiceDate)
      invDate.setHours(0, 0, 0, 0)
      return invDate.getTime() === today.getTime() && inv.status === "paid"
    })
    .reduce((sum, inv) => sum + inv.totalAmount, 0)

  // Monthly revenue
  const monthlyRevenue = invoices
    .filter((inv) => new Date(inv.invoiceDate) >= thisMonth && inv.status === "paid")
    .reduce((sum, inv) => sum + inv.totalAmount, 0)

  // Current inpatients
  const currentInpatients = visits.filter((visit) => visit.visitType === "ipd" && visit.status === "active").length

  // Low stock alerts
  const lowStockAlerts = medicines.filter(
    (med) => med.quantity <= med.minThreshold || med.status === "low_stock",
  ).length

  // Occupancy rate (assuming 100 total beds for demo)
  const totalBeds = 100
  const occupancyRate = Math.round((currentInpatients / totalBeds) * 100)

  return {
    totalPatients: patients.length,
    todayAppointments,
    todayRevenue,
    monthlyRevenue,
    currentInpatients,
    lowStockAlerts,
    totalStaff: staff.length,
    occupancyRate,
  }
}

export function generateMonthlyPatientVisits(visits: Visit[]): ChartData[] {
  const monthlyData: Record<string, number> = {}

  visits.forEach((visit) => {
    const month = new Date(visit.visitDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    })
    monthlyData[month] = (monthlyData[month] || 0) + 1
  })

  return Object.entries(monthlyData).map(([month, value]) => ({
    name: month,
    value,
    month,
  }))
}

export function generateDailyRevenueTrends(invoices: Invoice[], days = 30): ChartData[] {
  const dailyData: Record<string, number> = {}

  // Initialize last N days
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    dailyData[dateStr] = 0
  }

  // Populate with actual data
  invoices
    .filter((inv) => inv.status === "paid")
    .forEach((invoice) => {
      const date = new Date(invoice.invoiceDate)
      const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      if (dailyData.hasOwnProperty(dateStr)) {
        dailyData[dateStr] += invoice.totalAmount
      }
    })

  return Object.entries(dailyData).map(([date, value]) => ({
    name: date,
    value,
    date,
  }))
}

export function generateInventoryUsage(medicines: Medicine[]): ChartData[] {
  const categoryData: Record<string, number> = {}

  medicines.forEach((medicine) => {
    const category = medicine.category
    categoryData[category] = (categoryData[category] || 0) + medicine.quantity
  })

  return Object.entries(categoryData).map(([category, value]) => ({
    name: category,
    value,
    category,
  }))
}

export function generateTopPrescribedMedicines(medicines: Medicine[], limit = 5): ChartData[] {
  // This would typically come from dispense records
  // For now, we'll use a mock calculation based on stock levels (inverse logic)
  return medicines
    .sort((a, b) => a.minThreshold - a.quantity - (b.minThreshold - b.quantity))
    .slice(0, limit)
    .map((medicine) => ({
      name: medicine.name,
      value: Math.max(0, medicine.minThreshold - medicine.quantity + 50), // Mock usage
      category: medicine.category,
    }))
}

export function generateAppointmentsByTimeSlot(appointments: Appointment[]): ChartData[] {
  const timeSlotData: Record<string, number> = {
    "9-11 AM": 0,
    "11-1 PM": 0,
    "1-3 PM": 0,
    "3-5 PM": 0,
    "5-7 PM": 0,
  }

  appointments.forEach((appointment) => {
    const hour = Number.parseInt(appointment.startTime.split(":")[0])
    if (hour >= 9 && hour < 11) timeSlotData["9-11 AM"]++
    else if (hour >= 11 && hour < 13) timeSlotData["11-1 PM"]++
    else if (hour >= 13 && hour < 15) timeSlotData["1-3 PM"]++
    else if (hour >= 15 && hour < 17) timeSlotData["3-5 PM"]++
    else if (hour >= 17 && hour < 19) timeSlotData["5-7 PM"]++
  })

  return Object.entries(timeSlotData).map(([name, value]) => ({
    name,
    value,
  }))
}

export function generateDoctorAnalytics(
  doctorId: string,
  appointments: Appointment[],
  visits: Visit[],
): DoctorAnalytics {
  const doctorAppointments = appointments.filter((apt) => apt.doctorId === doctorId)
  const doctorVisits = visits.filter((visit) => visit.doctorId === doctorId)

  // Appointments per day (last 7 days)
  const appointmentsPerDay: ChartData[] = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" })
    const count = doctorAppointments.filter((apt) => {
      const aptDate = new Date(apt.date)
      return aptDate.toDateString() === date.toDateString()
    }).length

    appointmentsPerDay.push({ name: dayName, value: count })
  }

  // Common diagnoses
  const diagnosisCount: Record<string, number> = {}
  doctorVisits.forEach((visit) => {
    if (visit.diagnosis) {
      diagnosisCount[visit.diagnosis] = (diagnosisCount[visit.diagnosis] || 0) + 1
    }
  })

  const commonDiagnoses = Object.entries(diagnosisCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }))

  return {
    doctorId,
    appointmentsPerDay,
    appointmentsPerWeek: [], // Would be calculated similarly
    followUpTrends: [], // Would need follow-up data
    commonDiagnoses,
    patientLoadByTimeSlot: generateAppointmentsByTimeSlot(doctorAppointments),
    patientLoadByDay: appointmentsPerDay,
    totalPatientsSeen: doctorVisits.length,
    averageConsultationTime: 30, // Mock data
    followUpRate: 0.75, // Mock data
  }
}

export function generatePatientAnalytics(patientId: string, visits: Visit[], invoices: Invoice[]): PatientAnalytics {
  const patientVisits = visits.filter((visit) => visit.patientId === patientId)
  const patientInvoices = invoices.filter((inv) => inv.patientId === patientId)

  // Visits summary (last 12 months)
  const visitsSummary: ChartData[] = []
  for (let i = 11; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const monthName = date.toLocaleDateString("en-US", { month: "short" })
    const count = patientVisits.filter((visit) => {
      const visitDate = new Date(visit.visitDate)
      return visitDate.getMonth() === date.getMonth() && visitDate.getFullYear() === date.getFullYear()
    }).length

    visitsSummary.push({ name: monthName, value: count })
  }

  // Billing history
  const billingHistory = patientInvoices
    .sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime())
    .slice(0, 12)
    .map((invoice) => ({
      name: new Date(invoice.invoiceDate).toLocaleDateString("en-US", { month: "short" }),
      value: invoice.totalAmount,
    }))

  // Last five visits
  const lastFiveVisits = patientVisits
    .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())
    .slice(0, 5)
    .map((visit) => ({
      date: visit.visitDate,
      doctor: visit.doctorName,
      diagnosis: visit.diagnosis,
      amount: patientInvoices.find((inv) => inv.visitId === visit.id)?.totalAmount || 0,
    }))

  return {
    patientId,
    visitsSummary,
    billingHistory,
    medicationAdherence: 0.85, // Mock data
    lastFiveVisits,
    upcomingAppointments: 0, // Would need to calculate from appointments
    totalSpent: patientInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-IN").format(num)
}

export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

export function getGrowthTrend(rate: number): "up" | "down" | "neutral" {
  if (rate > 0) return "up"
  if (rate < 0) return "down"
  return "neutral"
}
