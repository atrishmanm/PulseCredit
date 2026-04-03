import { db } from './firebase';
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  getDoc,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';

interface LifetimeScoreRecord {
  userId: string;
  lifetimeScore: number;
  lastUpdated: number;
}

interface DailyScoreRecord {
  userId: string;
  date: string; // ISO date: YYYY-MM-DD
  score: number;
  timestamp: number;
}

const LIFETIME_SCORES_COLLECTION = 'lifetimeScores';
const DAILY_SCORES_COLLECTION = 'dailyScores';

/**
 * Get or initialize lifetime score for a user
 */
export async function getLifetimeScore(userId: string): Promise<number> {
  try {
    const docRef = doc(db, LIFETIME_SCORES_COLLECTION, userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().lifetimeScore ?? 700;
    }

    // First time - initialize with 700
    await setDoc(docRef, {
      userId,
      lifetimeScore: 700,
      lastUpdated: Date.now(),
    } as LifetimeScoreRecord);

    return 700;
  } catch (error) {
    console.error('Error getting lifetime score:', error);
    return 700;
  }
}

/**
 * Update lifetime score in Firebase
 */
export async function updateLifetimeScore(userId: string, newScore: number): Promise<void> {
  try {
    const docRef = doc(db, LIFETIME_SCORES_COLLECTION, userId);
    await setDoc(
      docRef,
      {
        userId,
        lifetimeScore: newScore,
        lastUpdated: Date.now(),
      } as LifetimeScoreRecord,
      { merge: true }
    );
  } catch (error) {
    console.error('Error updating lifetime score:', error);
  }
}

/**
 * Save daily score for a user (one per day)
 */
export async function saveDailyScore(userId: string, score: number): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const docRef = doc(db, DAILY_SCORES_COLLECTION, `${userId}_${today}`);

    await setDoc(
      docRef,
      {
        userId,
        date: today,
        score,
        timestamp: Date.now(),
      } as DailyScoreRecord,
      { merge: true }
    );
  } catch (error) {
    console.error('Error saving daily score:', error);
  }
}

/**
 * Get daily score for a specific date
 */
export async function getDailyScore(userId: string, date: string): Promise<number | null> {
  try {
    const docRef = doc(db, DAILY_SCORES_COLLECTION, `${userId}_${date}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().score ?? null;
    }
    return null;
  } catch (error) {
    console.error('Error getting daily score:', error);
    return null;
  }
}

/**
 * Get last 30 days of daily scores
 */
export async function getLast30DaysScores(userId: string): Promise<{ date: string; score: number }[]> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoString = thirtyDaysAgo.toISOString().split('T')[0];

    const q = query(
      collection(db, DAILY_SCORES_COLLECTION),
      where('userId', '==', userId),
      where('date', '>=', thirtyDaysAgoString),
      orderBy('date', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const scores: { date: string; score: number }[] = [];

    querySnapshot.forEach(doc => {
      const data = doc.data() as DailyScoreRecord;
      const dateObj = new Date(data.date);
      scores.push({
        date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: data.score,
      });
    });

    return scores;
  } catch (error) {
    console.error('Error getting 30-day scores:', error);
    return [];
  }
}

/**
 * Get all daily scores (unlimited history)
 */
export async function getAllDailyScores(userId: string): Promise<{ date: string; score: number }[]> {
  try {
    const q = query(
      collection(db, DAILY_SCORES_COLLECTION),
      where('userId', '==', userId),
      orderBy('date', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const scores: { date: string; score: number }[] = [];

    querySnapshot.forEach(doc => {
      const data = doc.data() as DailyScoreRecord;
      const dateObj = new Date(data.date);
      scores.push({
        date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: data.score,
      });
    });

    return scores;
  } catch (error) {
    console.error('Error getting all daily scores:', error);
    return [];
  }
}
