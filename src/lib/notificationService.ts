import { Notification } from '../types';
import { db } from './firebase';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  limit,
  orderBy,
  deleteDoc,
} from 'firebase/firestore';

const NOTIFICATIONS_COLLECTION = 'notifications';

/**
 * Save a new notification to Firebase
 */
export async function saveNotification(
  userId: string,
  message: string,
  type: 'positive' | 'warning' | 'neutral'
): Promise<Notification> {
  const notification: Omit<Notification, 'id'> = {
    message,
    type,
    timestamp: Date.now(),
    read: false,
  };

  const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
    ...notification,
    userId,
    createdAt: serverTimestamp(),
  });

  return {
    id: docRef.id,
    ...notification,
  };
}

/**
 * Get unread notifications for a user
 */
export async function getUnreadNotifications(userId: string): Promise<Notification[]> {
  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where('userId', '==', userId),
    where('read', '==', false),
    orderBy('timestamp', 'desc'),
    limit(50)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as Omit<Notification, 'id'>),
  }));
}

/**
 * Get all notifications for a user (limited to last 30 days)
 */
export async function getAllNotifications(userId: string): Promise<Notification[]> {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where('userId', '==', userId),
    where('timestamp', '>=', thirtyDaysAgo),
    orderBy('timestamp', 'desc'),
    limit(100)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as Omit<Notification, 'id'>),
  }));
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const notifRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
  await updateDoc(notifRef, {
    read: true,
  });
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where('userId', '==', userId),
    where('read', '==', false)
  );

  const querySnapshot = await getDocs(q);
  const updates = querySnapshot.docs.map(doc =>
    updateDoc(doc.ref, { read: true })
  );

  await Promise.all(updates);
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  await deleteDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId));
}

/**
 * Clear all old notifications (older than 30 days)
 */
export async function clearOldNotifications(userId: string): Promise<void> {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where('userId', '==', userId),
    where('timestamp', '<', thirtyDaysAgo)
  );

  const querySnapshot = await getDocs(q);
  const deletes = querySnapshot.docs.map(doc => deleteDoc(doc.ref));

  await Promise.all(deletes);
}
