// Patient utility functions
export function generatePatientId(): string {
  const year = new Date().getFullYear()
  const randomNum = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
  return `PAT${year}${randomNum}`
}

export function calculateAge(birthDate: string): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "")
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`
  }
  return phone
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhoneNumber(phone: string): boolean {
  // Validate a 10-digit mobile number starting with 6, 7, 8, or 9
  const phoneRegex = /^[6-9]\d{9}$/
  return phoneRegex.test(phone)
}
