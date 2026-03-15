import { LocalNotifications } from '@capacitor/local-notifications';
import { Preferences } from '@capacitor/preferences';

const NOTIFICATIONS_KEY = 'scheduled_notifications';

/**
 * Request permission for local notifications
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return false;
  }
}

/**
 * Check if notifications are enabled
 */
export async function checkNotificationPermission(): Promise<boolean> {
  try {
    const result = await LocalNotifications.checkPermissions();
    return result.display === 'granted';
  } catch (error) {
    console.error('Failed to check notification permission:', error);
    return false;
  }
}

/**
 * Schedule a local notification
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  delayInMinutes: number,
  id?: number
): Promise<string> {
  try {
    const notificationId = id || Date.now();
    
    await LocalNotifications.schedule({
      notifications: [
        {
          id: notificationId,
          title,
          body,
          schedule: {
            at: new Date(Date.now() + delayInMinutes * 60000),
          },
          sound: 'default',
          smallIcon: 'ic_notification',
          iconColor: '#e94560',
        },
      ],
    });

    // Store in preferences for persistence
    const { value } = await Preferences.get({ key: NOTIFICATIONS_KEY });
    const scheduled = value ? JSON.parse(value) : [];
    
    scheduled.push({
      id: notificationId,
      title,
      body,
      scheduledFor: new Date(Date.now() + delayInMinutes * 60000).toISOString(),
    });
    
    await Preferences.set({
      key: NOTIFICATIONS_KEY,
      value: JSON.stringify(scheduled),
    });

    return String(notificationId);
  } catch (error) {
    console.error('Failed to schedule notification:', error);
    throw error;
  }
}

/**
 * Schedule a daily reminder notification
 */
export async function scheduleDailyReminder(
  title: string = 'Time to check in!',
  body: string = 'How are you feeling today? Take a moment to log your mood.',
  hour: number = 9,
  minute: number = 0
): Promise<void> {
  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 1001, // Fixed ID for daily reminder
          title,
          body,
          schedule: {
            on: {
              hour,
              minute,
            },
            repeats: true,
          },
          sound: 'default',
          smallIcon: 'ic_notification',
          iconColor: '#e94560',
        },
      ],
    });

    // Save reminder time
    await Preferences.set({
      key: 'daily_reminder_time',
      value: `${hour}:${minute}`,
    });
  } catch (error) {
    console.error('Failed to schedule daily reminder:', error);
    throw error;
  }
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(id: string): Promise<void> {
  try {
    await LocalNotifications.cancel({
      notifications: [{ id: Number(id) }],
    });

    // Remove from stored notifications
    const { value } = await Preferences.get({ key: NOTIFICATIONS_KEY });
    if (value) {
      const scheduled = JSON.parse(value);
      const updated = scheduled.filter((n: any) => String(n.id) !== id);
      await Preferences.set({
        key: NOTIFICATIONS_KEY,
        value: JSON.stringify(updated),
      });
    }
  } catch (error) {
    console.error('Failed to cancel notification:', error);
    throw error;
  }
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications(): Promise<any[]> {
  try {
    const { value } = await Preferences.get({ key: NOTIFICATIONS_KEY });
    return value ? JSON.parse(value) : [];
  } catch (error) {
    console.error('Failed to get scheduled notifications:', error);
    return [];
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await LocalNotifications.cancel({
      notifications: [], // Empty array cancels all
    });
    await Preferences.remove({ key: NOTIFICATIONS_KEY });
  } catch (error) {
    console.error('Failed to cancel all notifications:', error);
    throw error;
  }
}

/**
 * Schedule a goal reminder notification
 */
export async function scheduleGoalReminder(
  goalTitle: string,
  delayInHours: number = 24
): Promise<string> {
  return scheduleLocalNotification(
    'Goal Reminder',
    `Don't forget about your goal: ${goalTitle}`,
    delayInHours * 60
  );
}

/**
 * Schedule a mood check-in reminder
 */
export async function scheduleMoodCheckIn(): Promise<string> {
  return scheduleLocalNotification(
    'Mood Check-in',
    'How are you feeling right now? Take a moment to log your mood.',
    60 * 4 // 4 hours
  );
}

/**
 * Mark a notification as read via API
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const response = await fetch(`/api/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    throw error;
  }
}

/**
 * Listen for notification actions (when user taps notification)
 */
export function addNotificationListener(
  callback: (notification: any) => void
): () => void {
  const listener = LocalNotifications.addListener(
    'localNotificationActionPerformed',
    (action) => {
      callback(action.notification);
    }
  );

  // Return cleanup function
  return () => {
    listener.then((l) => l.remove());
  };
}

/**
 * Initialize notification system
 * Call this on app startup
 */
export async function initializeNotifications(): Promise<void> {
  try {
    // Request permissions
    const granted = await requestNotificationPermission();
    
    if (!granted) {
      console.log('Notification permission not granted');
      return;
    }

    // Register notification channels (Android)
    await LocalNotifications.createChannel({
      id: 'default',
      name: 'Default Notifications',
      importance: 4, // High
      vibration: true,
    });

    console.log('Notification system initialized');
  } catch (error) {
    console.error('Failed to initialize notifications:', error);
  }
}
