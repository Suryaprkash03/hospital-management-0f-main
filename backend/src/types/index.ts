
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  profileCompleted: boolean;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface QueryParams {
  page?: string;
  limit?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
  status?: string;
  role?: string;
  department?: string;
}

export interface SocketUser {
  userId: string;
  socketId: string;
  role: UserRole;
  isOnline: boolean;
}

export interface NotificationData {
  title: string;
  message: string;
  type: NotificationType;
  userId?: string;
  data?: any;
  priority?: NotificationPriority;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR',
  NURSE = 'NURSE',
  RECEPTIONIST = 'RECEPTIONIST',
  PATIENT = 'PATIENT'
}

export enum NotificationType {
  APPOINTMENT_SCHEDULED = 'APPOINTMENT_SCHEDULED',
  APPOINTMENT_CANCELLED = 'APPOINTMENT_CANCELLED',
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  PATIENT_ADMITTED = 'PATIENT_ADMITTED',
  PATIENT_DISCHARGED = 'PATIENT_DISCHARGED',
  BILLING_CREATED = 'BILLING_CREATED',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  INVENTORY_LOW_STOCK = 'INVENTORY_LOW_STOCK',
  SYSTEM_ALERT = 'SYSTEM_ALERT'
}

export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface CreateAppointmentDTO {
  patientId: string;
  doctorId: string;
  dateTime: string;
  duration?: number;
  type: string;
  reason?: string;
}

export interface CreatePatientDTO {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  allergies?: string;
  chronicConditions?: string;
  insuranceNumber?: string;
  insuranceProvider?: string;
}

export interface CreateStaffDTO {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'DOCTOR' | 'NURSE' | 'RECEPTIONIST';
  specialization?: string;
  department: string;
  qualification?: string;
  experience?: number;
  licenseNumber?: string;
}

export interface CreateVisitDTO {
  patientId: string;
  doctorId: string;
  admissionDate: string;
  roomNumber?: string;
  bedNumber?: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
}

export interface CreateBillingDTO {
  patientId: string;
  visitId?: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    category: string;
  }[];
  discountAmount?: number;
  taxAmount?: number;
  paymentMethod?: string;
  dueDate?: string;
  notes?: string;
}

export interface CreateMedicineDTO {
  name: string;
  brand?: string;
  category: string;
  description?: string;
  dosageForm: string;
  strength: string;
  manufacturer?: string;
  batchNumber?: string;
  expiryDate?: string;
  stockQuantity: number;
  unitPrice: number;
  reorderLevel?: number;
}

export interface StockMovementDTO {
  medicineId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason?: string;
  reference?: string;
}

export interface VitalSignsDTO {
  visitId: string;
  temperature?: number;
  bloodPressure?: string;
  heartRate?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  notes?: string;
}

export interface AnalyticsQuery {
  startDate?: string;
  endDate?: string;
  department?: string;
  doctorId?: string;
  patientId?: string;
  groupBy?: 'day' | 'week' | 'month' | 'year';
}
