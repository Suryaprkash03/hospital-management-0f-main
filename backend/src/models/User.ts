
import { db } from '../config/firebase';
import { Timestamp } from 'firebase-admin/firestore';

export interface User {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'patient';
  isActive: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  // Role-specific fields
  specialization?: string; // for doctors
  license?: string; // for doctors/nurses
  department?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
}

export class UserModel {
  private static collection = db.collection('users');

  static async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await this.collection.add({
      ...userData,
      createdAt: now,
      updatedAt: now
    });
    return docRef.id;
  }

  static async findById(id: string): Promise<User | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as User;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const snapshot = await this.collection.where('email', '==', email).limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
  }

  static async update(id: string, userData: Partial<User>): Promise<void> {
    await this.collection.doc(id).update({
      ...userData,
      updatedAt: Timestamp.now()
    });
  }

  static async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }

  static async findAll(role?: string, limit?: number): Promise<User[]> {
    let query = this.collection.orderBy('createdAt', 'desc');
    
    if (role) {
      query = query.where('role', '==', role) as any;
    }
    
    if (limit) {
      query = query.limit(limit) as any;
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  }
}
