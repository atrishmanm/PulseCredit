import { db } from '../lib/firebase';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
  updateDoc,
  doc,
  deleteDoc,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { HealthMetrics } from './healthEngine';

export interface FoodLog {
  id?: string;
  userId: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  servingSize: string;
  imageUrl?: string;
  manualEntry: boolean;
  confirmedByUser: boolean;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  timestamp: number;
  createdAt: Timestamp;
}

export interface Prescription {
  id?: string;
  userId: string;
  docturName: string;
  diagnosis: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
  }[];
  date: string;
  fileUrl?: string;
  uploadedAt: Timestamp;
}

export async function addFoodLog(userId: string, log: Omit<FoodLog, 'id' | 'createdAt'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'foodLogs'), {
      ...log,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding food log:', error);
    throw error;
  }
}

export async function addPrescription(userId: string, prescription: Omit<Prescription, 'id' | 'uploadedAt'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'prescriptions'), {
      ...prescription,
      userId,
      uploadedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding prescription:', error);
    throw error;
  }
}

export async function getPrescriptionsForUser(userId: string): Promise<Prescription[]> {
  try {
    const q = query(
      collection(db, 'prescriptions'),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Prescription[];
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    throw error;
  }
}

export async function deletePrescription(prescriptionId: string, userId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'prescriptions', prescriptionId));
  } catch (error) {
    console.error('Error deleting prescription:', error);
    throw error;
  }
}

export async function getFoodLogsForDate(userId: string, date: Date): Promise<FoodLog[]> {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Simple query - filter by userId only, do timestamp filtering in memory
    const q = query(
      collection(db, 'foodLogs'),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    const allLogs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as FoodLog[];

    // Filter by date in memory and sort
    return allLogs
      .filter(log => log.timestamp >= startOfDay.getTime() && log.timestamp <= endOfDay.getTime())
      .sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error fetching food logs:', error);
    throw error;
  }
}

export async function getFoodLogsDateRange(userId: string, startDate: Date, endDate: Date): Promise<FoodLog[]> {
  try {
    // Simple query - filter by userId only, do date filtering in memory
    const q = query(
      collection(db, 'foodLogs'),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    const allLogs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as FoodLog[];

    // Filter by date range in memory and sort
    return allLogs
      .filter(log => log.timestamp >= startDate.getTime() && log.timestamp <= endDate.getTime())
      .sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error fetching food logs for date range:', error);
    throw error;
  }
}

export async function updateFoodLog(logId: string, updates: Partial<FoodLog>): Promise<void> {
  try {
    const docRef = doc(db, 'foodLogs', logId);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error('Error updating food log:', error);
    throw error;
  }
}

export async function deleteFoodLog(logId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'foodLogs', logId));
  } catch (error) {
    console.error('Error deleting food log:', error);
    throw error;
  }
}

export function calculateDailyNutrition(logs: FoodLog[]) {
  return {
    totalCalories: logs.reduce((sum, log) => sum + log.calories, 0),
    totalProtein: logs.reduce((sum, log) => sum + log.protein, 0),
    totalCarbs: logs.reduce((sum, log) => sum + log.carbs, 0),
    totalFat: logs.reduce((sum, log) => sum + log.fat, 0),
    totalFiber: logs.reduce((sum, log) => sum + log.fiber, 0),
    mealCount: logs.length,
  };
}

/**
 * Save user health metrics to Firebase (for persistence across sessions)
 */
export async function saveHealthMetrics(userId: string, metrics: HealthMetrics): Promise<void> {
  try {
    const docRef = doc(db, 'userMetrics', userId);
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    await setDoc(
      docRef,
      {
        userId,
        ...metrics,
        date: today,
        lastUpdated: Date.now(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error saving health metrics:', error);
  }
}

/**
 * Get user health metrics from Firebase
 */
export async function loadHealthMetrics(userId: string): Promise<HealthMetrics | null> {
  try {
    const docRef = doc(db, 'userMetrics', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Return metrics without userId and timestamp fields
      const { userId: _, date, lastUpdated, ...metrics } = data;
      return metrics as HealthMetrics;
    }

    return null;
  } catch (error) {
    console.error('Error loading health metrics:', error);
    return null;
  }
}

/**
 * Save custom personalized targets to Firebase
 */
export async function saveCustomTargets(
  userId: string,
  targets: { steps: number; sleep: number; calories: number; exercise: number }
): Promise<void> {
  try {
    const docRef = doc(db, 'userMetrics', userId);
    await setDoc(
      docRef,
      {
        customTargets: targets,
        lastUpdatedTargets: Date.now(),
      },
      { merge: true }
    );
    console.log('Custom targets saved:', targets);
  } catch (error) {
    console.error('Error saving custom targets:', error);
  }
}

/**
 * Load custom personalized targets from Firebase
 */
export async function loadCustomTargets(
  userId: string
): Promise<{ steps: number; sleep: number; calories: number; exercise: number } | null> {
  try {
    const docRef = doc(db, 'userMetrics', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.customTargets) {
        return data.customTargets;
      }
    }

    return null;
  } catch (error) {
    console.error('Error loading custom targets:', error);
    return null;
  }
}