// Appointment utility functions
export function generateAppointmentId(): string {
  const year = new Date().getFullYear()
  const month = (new Date().getMonth() + 1).toString().padStart(2, "0")
  const randomNum = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
  return `APT${year}${month}${randomNum}`
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "scheduled":
    case "confirmed":
      return "bg-blue-100 text-blue-800"
    case "in_progress":
      return "bg-yellow-100 text-yellow-800"
    case "completed":
      return "bg-green-100 text-green-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    case "no_show":
      return "bg-gray-100 text-gray-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":")
  const hour = Number.parseInt(hours)
  const ampm = hour >= 12 ? "PM" : "AM"
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

export function formatTimeRange(startTime: string, endTime: string): string {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`
}

export function generateTimeSlots(startTime: string, endTime: string, duration = 30): string[] {
  const slots: string[] = []
  const start = new Date(`2000-01-01T${startTime}:00`)
  const end = new Date(`2000-01-01T${endTime}:00`)

  const current = new Date(start)
  while (current < end) {
    const timeString = current.toTimeString().slice(0, 5)
    slots.push(timeString)
    current.setMinutes(current.getMinutes() + duration)
  }

  return slots
}

export function isTimeSlotAvailable(
  slot: string,
  bookedSlots: { startTime: string; endTime: string }[],
  duration = 30,
): boolean {
  const slotStart = new Date(`2000-01-01T${slot}:00`)
  const slotEnd = new Date(slotStart.getTime() + duration * 60000)

  return !bookedSlots.some((booked) => {
    const bookedStart = new Date(`2000-01-01T${booked.startTime}:00`)
    const bookedEnd = new Date(`2000-01-01T${booked.endTime}:00`)

    return (
      (slotStart >= bookedStart && slotStart < bookedEnd) ||
      (slotEnd > bookedStart && slotEnd <= bookedEnd) ||
      (slotStart <= bookedStart && slotEnd >= bookedEnd)
    )
  })
}

export function calculateEndTime(startTime: string, duration: number): string {
  const start = new Date(`2000-01-01T${startTime}:00`)
  start.setMinutes(start.getMinutes() + duration)
  return start.toTimeString().slice(0, 5)
}

export function isWithinCancellationWindow(appointmentDate: Date, hours = 24): boolean {
  const now = new Date()
  const timeDiff = appointmentDate.getTime() - now.getTime()
  const hoursDiff = timeDiff / (1000 * 3600)
  return hoursDiff >= hours
}

export function getAppointmentDuration(startTime: string, endTime: string): number {
  const start = new Date(`2000-01-01T${startTime}:00`)
  const end = new Date(`2000-01-01T${endTime}:00`)
  return (end.getTime() - start.getTime()) / (1000 * 60)
}

export function isToday(date: Date): boolean {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

export function isFutureDate(date: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date >= today
}

export function formatAppointmentDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function getWeekDayNumber(date: Date): number {
  return date.getDay()
}

export const appointmentStatuses = [
  { value: "scheduled", label: "Scheduled", color: "bg-blue-100 text-blue-800" },
  { value: "confirmed", label: "Confirmed", color: "bg-blue-100 text-blue-800" },
  { value: "in_progress", label: "In Progress", color: "bg-yellow-100 text-yellow-800" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-800" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
  { value: "no_show", label: "No Show", color: "bg-gray-100 text-gray-800" },
]

export const defaultAppointmentDuration = 30 // minutes
export const maxAdvanceBookingDays = 90 // days
export const minCancellationHours = 24 // hours
