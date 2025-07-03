
import { db } from '../config/firebase';
import { Timestamp } from 'firebase-admin/firestore';

export interface Appointment {
  id?: string;
  patientId: string;
  doctorId: string;
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM format
  duration: number; // minutes
  type: 'consultation' | 'follow-up' | 'emergency' | 'surgery';
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  reason: string;
  notes?: string;
  symptoms?: string[];
  diagnosis?: string;
  treatment?: string;
  prescription?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export class AppointmentModel {
  private static collection = db.collection('appointments');

  static async create(appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await this.collection.add({
      ...appointmentData,
      createdAt: now,
      updatedAt: now
    });
    return docRef.id;
  }

  static async findById(id: string): Promise<Appointment | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Appointment;
  }

  static async findByPatient(patientId: string, limit?: number): Promise<Appointment[]> {
    let query = this.collection
      .where('patientId', '==', patientId)
      .orderBy('date', 'desc');
    
    if (limit) {
      query = query.limit(limit) as any;
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
  }

  static async findByDoctor(doctorId: string, date?: string): Promise<Appointment[]> {
    let query = this.collection.where('doctorId', '==', doctorId);
    
    if (date) {
      query = query.where('date', '==', date);
    }
    
    query = query.orderBy('time', 'asc');

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
  }

  static async update(id: string, appointmentData: Partial<Appointment>): Promise<void> {
    await this.collection.doc(id).update({
      ...appointmentData,
      updatedAt: Timestamp.now()
    });
  }

  static async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }

  static async findByDateRange(startDate: string, endDate: string): Promise<Appointment[]> {
    const snapshot = await this.collection
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .orderBy('date', 'asc')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
  }
}
