import admin from 'firebase-admin';
import { db } from '../db';
import { notifications, users } from '../db/schema';
import { eq } from 'drizzle-orm';

// Initialize Firebase Admin if credentials are available
let messaging: admin.messaging.Messaging | null = null;

if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
  const serviceAccount: admin.ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
  };
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  
  messaging = admin.messaging();
  console.log('Firebase Admin initialized for push notifications');
} else {
  console.log('Firebase credentials not found - push notifications disabled');
}

interface NotificationData {
  [key: string]: string;
}

/**
 * Send a push notification to a specific user
 */
export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data: NotificationData = {}
): Promise<void> {
  try {
    // Get user's FCM token from database
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user || !(user as any).fcmToken) {
      console.log(`No FCM token found for user ${userId}`);
      return;
    }

    // Only send via Firebase if initialized
    if (messaging) {
      const fcmToken = (user as any).fcmToken;
      
      await messaging.send({
        token: fcmToken,
        notification: {
          title,
          body,
        },
        data,
        android: {
          priority: 'high',
          notification: {
            channelId: 'default',
            priority: 'high',
          },
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title,
                body,
              },
              badge: 1,
              sound: 'default',
            },
          },
        },
      });
      
      console.log(`Push notification sent to user ${userId}`);
    } else {
      console.log(`Firebase not initialized - notification stored but not sent`);
    }

    // Always store in database
    await db.insert(notifications).values({
      userId,
      title,
      body,
      type: data.type || 'general',
      data,
      read: false,
    });
  } catch (error) {
    console.error('Failed to send push notification:', error);
    throw error;
  }
}

/**
 * Send push notification to multiple users
 */
export async function sendToMultipleUsers(
  userIds: string[],
  title: string,
  body: string,
  data: NotificationData = {}
): Promise<void> {
  await Promise.all(
    userIds.map(userId => sendPushNotification(userId, title, body, data))
  );
}

/**
 * Schedule a notification for future delivery
 */
export async function scheduleNotification(
  userId: string,
  title: string,
  body: string,
  scheduledTime: Date,
  data: NotificationData = {}
): Promise<string> {
  // Store scheduled notification in database
  const [notification] = await db.insert(notifications).values({
    userId,
    title,
    body,
    type: data.type || 'scheduled',
    data: { ...data, scheduledFor: scheduledTime.toISOString() },
    read: false,
  }).returning();

  // In production, use a job queue like Bull/BullMQ with Redis
  // For now, we'll handle this with a cron job that checks for pending notifications
  console.log(`Notification scheduled for ${scheduledTime.toISOString()}`);

  return notification.id;
}

/**
 * Get pending scheduled notifications
 */
export async function getPendingScheduledNotifications(): Promise<any[]> {
  const now = new Date().toISOString();
  
  // This would query for notifications with scheduledFor in the past
  // and not yet sent
  const pending = await db.query.notifications.findMany({
    where: (notifications, { and, eq, sql }) => and(
      eq(notifications.read, false),
      sql`${notifications.data}->>'scheduledFor' < ${now}`
    ),
  });

  return pending;
}

/**
 * Process and send all pending scheduled notifications
 * Call this from a cron job every minute
 */
export async function processScheduledNotifications(): Promise<void> {
  const pending = await getPendingScheduledNotifications();

  for (const notification of pending) {
    try {
      await sendPushNotification(
        notification.userId,
        notification.title,
        notification.body,
        notification.data as NotificationData
      );

      // Mark as sent/read
      await db.update(notifications)
        .set({ read: true })
        .where(eq(notifications.id, notification.id));
    } catch (error) {
      console.error(`Failed to send scheduled notification ${notification.id}:`, error);
    }
  }
}

/**
 * Get user's notification history
 */
export async function getUserNotifications(userId: string, limit: number = 50): Promise<any[]> {
  return db.query.notifications.findMany({
    where: eq(notifications.userId, userId),
    orderBy: (notifications, { desc }) => [desc(notifications.createdAt)],
    limit,
  });
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  await db.update(notifications)
    .set({ read: true })
    .where(eq(notifications.id, notificationId));
}

/**
 * Save user's FCM token
 */
export async function saveFCMToken(userId: string, fcmToken: string): Promise<void> {
  await db.update(users)
    .set({ fcmToken } as any)
    .where(eq(users.id, userId));
}
