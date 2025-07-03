export function generateInvoiceNumber(): string {
  const prefix = "INV"
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `${prefix}-${timestamp}-${random}`
}

export function generatePaymentId(): string {
  const prefix = "PAY"
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `${prefix}-${timestamp}-${random}`
}

export function calculateInvoiceTotals(items: any[], discountPercentage = 0, taxPercentage = 0) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const discountAmount = (subtotal * discountPercentage) / 100
  const taxableAmount = subtotal - discountAmount
  const taxAmount = (taxableAmount * taxPercentage) / 100
  const totalAmount = taxableAmount + taxAmount

  return {
    subtotal,
    discountAmount,
    taxAmount,
    totalAmount,
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount)
}

export function getInvoiceStatusColor(status: string): string {
  const colors = {
    draft: "bg-gray-100 text-gray-800",
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    partially_paid: "bg-blue-100 text-blue-800",
    overdue: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-800",
  }
  return colors[status as keyof typeof colors] || colors.draft
}

export function getPaymentStatusColor(status: string): string {
  const colors = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    refunded: "bg-purple-100 text-purple-800",
  }
  return colors[status as keyof typeof colors] || colors.pending
}

export function isInvoiceOverdue(invoice: any): boolean {
  if (invoice.status === "paid") return false
  return new Date() > new Date(invoice.dueDate)
}

export function calculateDaysOverdue(dueDate: Date): number {
  const today = new Date()
  const due = new Date(dueDate)
  const diffTime = today.getTime() - due.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function getPaymentMethodIcon(method: string): string {
  const icons = {
    cash: "💵",
    card: "💳",
    upi: "📱",
    net_banking: "🏦",
    insurance: "🛡️",
    cheque: "📝",
  }
  return icons[method as keyof typeof icons] || "💰"
}

export const commonServices = [
  { name: "General Consultation", category: "consultation", price: 500 },
  { name: "Specialist Consultation", category: "consultation", price: 800 },
  { name: "Emergency Consultation", category: "consultation", price: 1000 },
  { name: "Blood Test - CBC", category: "test", price: 300 },
  { name: "Blood Test - Lipid Profile", category: "test", price: 600 },
  { name: "X-Ray Chest", category: "test", price: 400 },
  { name: "ECG", category: "test", price: 200 },
  { name: "Ultrasound", category: "test", price: 800 },
  { name: "General Ward Bed (per day)", category: "bed_charge", price: 1500 },
  { name: "Private Room (per day)", category: "bed_charge", price: 3000 },
  { name: "ICU Bed (per day)", category: "bed_charge", price: 5000 },
  { name: "Operation Theater", category: "procedure", price: 10000 },
  { name: "Dressing", category: "procedure", price: 200 },
  { name: "Injection", category: "procedure", price: 100 },
]

export const paymentMethods = [
  { value: "cash", label: "Cash", icon: "💵" },
  { value: "card", label: "Credit/Debit Card", icon: "💳" },
  { value: "upi", label: "UPI", icon: "📱" },
  { value: "net_banking", label: "Net Banking", icon: "🏦" },
  { value: "insurance", label: "Insurance", icon: "🛡️" },
  { value: "cheque", label: "Cheque", icon: "📝" },
]
