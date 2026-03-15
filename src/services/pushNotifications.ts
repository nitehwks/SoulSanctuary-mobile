import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

const FCM_TOKEN_KEY = 'fcm_token';

/**
 * Initialize push notifications
 * Call this on app startup after user is authenticated
 */
export async function initializePushNotifications(): Promise<void> {
  // Only run on native platforms
  if (!Capacitor.isNativePlatform()) {
    console.log('Push notifications only available on native platforms');
    return;
  }

  try {
    // Request permission
    const result = await PushNotifications.requestPermissions();
    
    if (result.receive !== 'granted') {
      console.log('Push notification permission denied');
      return;
    }

    // Register with FCM/APNs
    await PushNotifications.register();

    // Set up listeners
    setupPushNotificationListeners();

    console.log('Push notifications initialized');
  } catch (error) {
    console.error('Failed to initialize push notifications:', error);
  }
}

/**
 * Set up push notification event listeners
 */
function setupPushNotificationListeners(): void {
  // Token received (on first register or token refresh)
  PushNotifications.addListener('registration', async (token) => {
    console.log('Push registration token:', token.value);
    
    // Save token locally
    await Preferences.set({
      key: FCM_TOKEN_KEY,
      value: token.value,
    });

    // Send token to server
    await registerTokenWithServer(token.value);
  });

  // Registration error
  PushNotifications.addListener('registrationError', (error) => {
    console.error('Push registration error:', error);
  });

  // Notification received while app in foreground
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Push notification received:', notification);
    
    // Handle the notification
    handleForegroundNotification(notification);
  });

  // Notification action performed (user tapped notification)
  PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    console.log('Push notification action performed:', action);
    
    // Handle navigation based on notification type
    handleNotificationAction(action.notification);
  });
}

/**
 * Register FCM token with server
 */
async function registerTokenWithServer(token: string): Promise<void> {
  try {
    const response = await fetch('/api/user/fcm-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fcmToken: token }),
    });

    if (!response.ok) {
      throw new Error('Failed to register FCM token');
    }

    console.log('FCM token registered with server');
  } catch (error) {
    console.error('Failed to register FCM token:', error);
  }
}

/**
 * Handle notification received in foreground
 */
function handleForegroundNotification(notification: any): void {
  const { title, body, data } = notification;

  // Show a local notification or in-app alert
  // You could also use a toast or custom in-app notification
  
  // Example: Different handling based on notification type
  const type = data?.type;
  
  switch (type) {
    case 'crisis':
      // Show urgent alert
      console.log('CRISIS ALERT:', title, body);
      break;
    case 'goal':
      // Show goal reminder
      console.log('GOAL REMINDER:', title, body);
      break;
    case 'mood':
      // Show mood check-in prompt
      console.log('MOOD CHECK-IN:', title, body);
      break;
    default:
      console.log('NOTIFICATION:', title, body);
  }
}

/**
 * Handle notification tap action
 */
function handleNotificationAction(notification: any): void {
  const { data } = notification;
  const type = data?.type;

  // Navigate based on notification type
  switch (type) {
    case 'crisis':
      // Navigate to crisis support
      window.location.href = '/crisis';
      break;
    case 'goal':
      // Navigate to goals
      window.location.href = '/goals';
      break;
    case 'mood':
      // Navigate to mood tracker
      window.location.href = '/mood';
      break;
    case 'memory':
      // Navigate to memory vault
      window.location.href = '/memory';
      break;
    default:
      // Default to dashboard
      window.location.href = '/';
  }
}

/**
 * Get the current FCM token
 */
export async function getFCMToken(): Promise<string | null> {
  const { value } = await Preferences.get({ key: FCM_TOKEN_KEY });
  return value;
}

/**
 * Unregister from push notifications
 * Call this on logout
 */
export async function unregisterPushNotifications(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // Remove listeners
    await PushNotifications.removeAllListeners();
    
    // Clear stored token
    await Preferences.remove({ key: FCM_TOKEN_KEY });

    console.log('Push notifications unregistered');
  } catch (error) {
    console.error('Failed to unregister push notifications:', error);
  }
}

/**
 * Check push notification permission status
 */
export async function getPushNotificationStatus(): Promise<{
  hasPermission: boolean;
  isRegistered: boolean;
}> {
  if (!Capacitor.isNativePlatform()) {
    return { hasPermission: false, isRegistered: false };
  }

  try {
    const permission = await PushNotifications.checkPermissions();
    const token = await getFCMToken();

    return {
      hasPermission: permission.receive === 'granted',
      isRegistered: !!token,
    };
  } catch (error) {
    console.error('Failed to get push notification status:', error);
    return { hasPermission: false, isRegistered: false };
  }
}

/**
 * Request push notification permission
 * Returns true if granted
 */
export async function requestPushPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    return false;
  }

  try {
    const result = await PushNotifications.requestPermissions();
    return result.receive === 'granted';
  } catch (error) {
    console.error('Failed to request push permission:', error);
    return false;
  }
}

/**
 * Remove all delivered notifications
 */
export async function clearAllNotifications(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await PushNotifications.removeAllDeliveredNotifications();
  } catch (error) {
    console.error('Failed to clear notifications:', error);
  }
}

/**
 * Get delivered notifications
 */
export async function getDeliveredNotifications(): Promise<any[]> {
  if (!Capacitor.isNativePlatform()) {
    return [];
  }

  try {
    const result = await PushNotifications.getDeliveredNotifications();
    return result.notifications;
  } catch (error) {
    console.error('Failed to get delivered notifications:', error);
    return [];
  }
}
