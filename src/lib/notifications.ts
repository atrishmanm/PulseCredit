import { messaging } from './firebase.ts';
import { getToken, onMessage } from 'firebase/messaging';

/**
 * PulseCredit Push Notifications Setup
 * Handles Firebase Cloud Messaging for meal reminders
 */

// Request notification permission
export async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('✓ Notification permission granted');

      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: 'YOUR_VAPID_KEY_FROM_FIREBASE_CONSOLE'
      });

      console.log('FCM Token:', token);
      return token;
    }
  } catch (error) {
    console.error('Notification permission denied:', error);
  }
}

// Listen for incoming messages when app is open
export function setupMessageListener() {
  onMessage(messaging, (payload) => {
    console.log('Message received in foreground:', payload);

    // Show notification
    const { title, body, image } = payload.notification || {};

    if ('Notification' in window) {
      new Notification(title || 'PulseCredit', {
        body: body || 'You have a new update',
        icon: '/vitecredit-icon.png',
        badge: '/vitecredit-badge.png',
        image: image
      });
    }
  });
}

// Example: Schedule meal reminder
export async function scheduleMealReminder(userId: string, mealType: 'breakfast' | 'lunch' | 'dinner') {
  const reminderTimes = {
    breakfast: '08:00',
    lunch: '12:00',
    dinner: '18:30'
  };

  console.log(`📢 Reminder scheduled for ${mealType} at ${reminderTimes[mealType]}`);

  // This would call a Cloud Function to send the notification
  // At the scheduled time, Firebase would send:
  // {
  //   title: `Time for ${mealType}!`,
  //   body: 'Don\'t forget to log your meal',
  //   icon: '/vitecredit-icon.png'
  // }
}

export default {
  requestNotificationPermission,
  setupMessageListener,
  scheduleMealReminder
};
