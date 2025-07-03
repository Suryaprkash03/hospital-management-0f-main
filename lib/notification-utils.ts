import type { Notification, NotificationType, NotificationPriority, UserRole } from "./types"

export function generateNotificationId(): string {
  return `NOT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function generateBroadcastId(): string {
  return `BROADCAST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function getNotificationIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    appointment_booked: "📅",
    appointment_cancelled: "❌",
    appointment_reminder: "⏰",
    report_uploaded: "📄",
    invoice_payment: "💳",
    low_stock_alert: "📦",
    medicine_expired: "💊",
    custom_message: "💬",
    system_alert: "⚠️",
  }
  return icons[type] || "🔔"
}

export function getNotificationColor(priority: NotificationPriority): string {
  const colors: Record<NotificationPriority, string> = {
    low: "bg-gray-100 text-gray-800 border-gray-200",
    medium: "bg-blue-100 text-blue-800 border-blue-200",
    high: "bg-orange-100 text-orange-800 border-orange-200",
    critical: "bg-red-100 text-red-800 border-red-200",
  }
  return colors[priority]
}

export function getPriorityBadgeColor(priority: NotificationPriority): string {
  const colors: Record<NotificationPriority, string> = {
    low: "bg-gray-500",
    medium: "bg-blue-500",
    high: "bg-orange-500",
    critical: "bg-red-500",
  }
  return colors[priority]
}

export function formatNotificationTime(date: Date): string {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return "Just now"
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`

  return date.toLocaleDateString()
}

export function createNotificationTemplate(
  type: NotificationType,
  data: Record<string, any>,
): { title: string; message: string } {
  const templates: Record<NotificationType, (data: any) => { title: string; message: string }> = {
    appointment_booked: (data) => ({
      title: "New Appointment Booked",
      message: `Appointment with ${data.doctorName} scheduled for ${data.date} at ${data.time}`,
    }),
    appointment_cancelled: (data) => ({
      title: "Appointment Cancelled",
      message: `Your appointment with ${data.doctorName} on ${data.date} has been cancelled`,
    }),
    appointment_reminder: (data) => ({
      title: "Appointment Reminder",
      message: `You have an appointment with ${data.doctorName} in 1 hour`,
    }),
    report_uploaded: (data) => ({
      title: "New Report Available",
      message: `${data.reportType} report has been uploaded for ${data.patientName}`,
    }),
    invoice_payment: (data) => ({
      title: "Payment Received",
      message: `Payment of $${data.amount} received for invoice ${data.invoiceNumber}`,
    }),
    low_stock_alert: (data) => ({
      title: "Low Stock Alert",
      message: `${data.medicineName} is running low (${data.quantity} remaining)`,
    }),
    medicine_expired: (data) => ({
      title: "Medicine Expired",
      message: `${data.medicineName} has expired on ${data.expiryDate}`,
    }),
    custom_message: (data) => ({
      title: data.title || "Custom Message",
      message: data.message || "You have a new message",
    }),
    system_alert: (data) => ({
      title: "System Alert",
      message: data.message || "System notification",
    }),
  }

  return templates[type]?.(data) || { title: "Notification", message: "You have a new notification" }
}

export function shouldSendNotification(type: NotificationType, userRole: UserRole, preferences?: any): boolean {
  // Define which roles should receive which notification types
  const rolePermissions: Record<NotificationType, UserRole[]> = {
    appointment_booked: ["patient", "doctor", "receptionist"],
    appointment_cancelled: ["patient", "doctor", "receptionist"],
    appointment_reminder: ["patient"],
    report_uploaded: ["patient", "doctor"],
    invoice_payment: ["patient", "admin", "receptionist"],
    low_stock_alert: ["admin", "nurse"],
    medicine_expired: ["admin", "nurse"],
    custom_message: ["admin", "doctor", "nurse", "receptionist", "patient"],
    system_alert: ["admin", "doctor", "nurse", "receptionist", "patient"],
  }

  return rolePermissions[type]?.includes(userRole) || false
}

export function getTargetUsers(targetGroup: string, users: any[], targetUserIds?: string[]): string[] {
  if (targetGroup === "specific" && targetUserIds) {
    return targetUserIds
  }

  if (targetGroup === "all") {
    return users.map((user) => user.uid)
  }

  // Filter by role
  return users.filter((user) => user.role === targetGroup).map((user) => user.uid)
}

export function validateNotificationData(notification: Partial<Notification>): string[] {
  const errors: string[] = []

  if (!notification.title?.trim()) {
    errors.push("Title is required")
  }

  if (!notification.message?.trim()) {
    errors.push("Message is required")
  }

  if (!notification.recipientId?.trim()) {
    errors.push("Recipient is required")
  }

  if (!notification.type) {
    errors.push("Notification type is required")
  }

  if (!notification.priority) {
    errors.push("Priority is required")
  }

  return errors
}

export function sortNotificationsByPriority(notifications: Notification[]): Notification[] {
  const priorityOrder: Record<NotificationPriority, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  }

  return notifications.sort((a, b) => {
    // First sort by status (unread first)
    if (a.status !== b.status) {
      return a.status === "unread" ? -1 : 1
    }

    // Then by priority
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
    if (priorityDiff !== 0) return priorityDiff

    // Finally by creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}
