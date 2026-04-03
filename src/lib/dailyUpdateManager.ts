import { generateNotification, checkMilestone } from './lifetimeScoring';
import { saveNotification } from './notificationService';
import { updateLifetimeScore as saveLifetimeScoreToFirebase } from './lifetimeScoreService';
import { Notification } from '../types';

interface DailyUpdateRecord {
  userId: string;
  lastUpdateDate: string; // ISO date string
  oldScore: number;
  newScore: number;
  notificationGenerated: boolean;
}

const DAILY_UPDATE_STORAGE_KEY = 'daily_update_record';

/**
 * Check if enough time has passed for daily update
 */
function shouldPerformDailyUpdate(lastUpdateDate: string | null): boolean {
  if (!lastUpdateDate) return true;

  const last = new Date(lastUpdateDate);
  const now = new Date();

  // Check if dates are different (new day)
  return (
    last.getFullYear() !== now.getFullYear() ||
    last.getMonth() !== now.getMonth() ||
    last.getDate() !== now.getDate()
  );
}

/**
 * Get today's date in ISO format (YYYY-MM-DD)
 */
function getTodayISO(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Perform daily update logic (called once per day per user)
 * This handles lifetime score updates and notification generation
 */
export async function performDailyUpdate(
  userId: string,
  currentDailyScore: number,
  previousLifetimeScore: number,
  newLifetimeScore: number
): Promise<{
  notification: Notification | null;
  milestone: string | null;
  recordUpdated: boolean;
}> {
  try {
    // Get stored record
    const stored = localStorage.getItem(`${DAILY_UPDATE_STORAGE_KEY}_${userId}`);
    const record: DailyUpdateRecord | null = stored ? JSON.parse(stored) : null;

    // Check if we should update today
    const lastDate = record?.lastUpdateDate || null;

    if (!shouldPerformDailyUpdate(lastDate)) {
      // Already updated today
      return {
        notification: null,
        milestone: null,
        recordUpdated: false,
      };
    }

    // Generate notification if score changed significantly
    let notification: Notification | null = null;
    try {
      const oldScore = record?.oldScore || previousLifetimeScore;
      const notificationData = generateNotification(oldScore, newLifetimeScore, userId);

      if (notificationData) {
        notification = await saveNotification(
          userId,
          notificationData.message,
          notificationData.type
        );
      }
    } catch (error) {
      console.error('Error generating notification:', error);
      // Continue even if notification fails
    }

    // Check for milestone
    const milestone = checkMilestone(newLifetimeScore);

    if (milestone) {
      try {
        const milestoneNotification = await saveNotification(
          userId,
          `🏆 ${milestone}`,
          'positive'
        );

        if (!notification) {
          notification = milestoneNotification;
        }
      } catch (error) {
        console.error('Error saving milestone notification:', error);
      }
    }

    // Update stored record
    const newRecord: DailyUpdateRecord = {
      userId,
      lastUpdateDate: getTodayISO(),
      oldScore: previousLifetimeScore,
      newScore: newLifetimeScore,
      notificationGenerated: !!notification,
    };

    localStorage.setItem(
      `${DAILY_UPDATE_STORAGE_KEY}_${userId}`,
      JSON.stringify(newRecord)
    );

    // Save to Firebase
    try {
      await saveLifetimeScoreToFirebase(userId, newLifetimeScore);
    } catch (error) {
      console.error('Error saving lifetime score to Firebase:', error);
    }

    return {
      notification,
      milestone,
      recordUpdated: true,
    };
  } catch (error) {
    console.error('Error performing daily update:', error);
    return {
      notification: null,
      milestone: null,
      recordUpdated: false,
    };
  }
}

/**
 * Initialize daily update system
 * Call this when app loads to check if daily update is needed
 */
export async function initializeDailyUpdateSystem(
  userId: string,
  currentDailyScore: number,
  previousLifetimeScore: number,
  calculateNewLifetime: () => number
): Promise<void> {
  const stored = localStorage.getItem(`${DAILY_UPDATE_STORAGE_KEY}_${userId}`);
  const record: DailyUpdateRecord | null = stored ? JSON.parse(stored) : null;

  if (shouldPerformDailyUpdate(record?.lastUpdateDate || null)) {
    const newLifetimeScore = calculateNewLifetime();

    const result = await performDailyUpdate(
      userId,
      currentDailyScore,
      previousLifetimeScore,
      newLifetimeScore
    );

    if (result.recordUpdated) {
      console.log('Daily update performed', {
        notification: result.notification?.message,
        milestone: result.milestone,
      });
    }
  }
}

/**
 * Clear daily update record (useful for testing)
 */
export function clearDailyUpdateRecord(userId: string): void {
  localStorage.removeItem(`${DAILY_UPDATE_STORAGE_KEY}_${userId}`);
}

/**
 * Get the last update date for a user
 */
export function getLastUpdateDate(userId: string): string | null {
  const stored = localStorage.getItem(`${DAILY_UPDATE_STORAGE_KEY}_${userId}`);
  const record: DailyUpdateRecord | null = stored ? JSON.parse(stored) : null;
  return record?.lastUpdateDate || null;
}
