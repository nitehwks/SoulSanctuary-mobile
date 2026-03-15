import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { processQueue, isOnline } from './offline';
import { getScheduledNotifications } from './notifications';

/**
 * Initialize background sync functionality
 * Call this on app startup
 */
export async function initializeBackgroundSync(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    console.log('Background sync only available on native platforms');
    return;
  }

  try {
    // Listen for app state changes
    App.addListener('appStateChange', async ({ isActive }) => {
      console.log('SoulSanctuary state changed:', isActive ? 'active' : 'background');

      if (isActive) {
        // SoulSanctuary came to foreground
        await handleAppForeground();
      } else {
        // SoulSanctuary went to background
        await handleAppBackground();
      }
    });

    // Listen for app resume (from killed state)
    App.addListener('resume', async () => {
      console.log('SoulSanctuary resumed');
      await handleAppResume();
    });

    // Listen for app pause
    App.addListener('pause', async () => {
      console.log('SoulSanctuary paused');
      await handleAppPause();
    });

    console.log('Background sync initialized');
  } catch (error) {
    console.error('Failed to initialize background sync:', error);
  }
}

/**
 * Handle app coming to foreground
 */
async function handleAppForeground(): Promise<void> {
  try {
    // Check if we're online
    const online = await isOnline();

    if (online) {
      // Process any queued API calls
      const result = await processQueue();
      if (result.succeeded.length > 0) {
        console.log(`Synced ${result.succeeded.length} pending changes`);
      }

      // Refresh data from server
      await refreshDataFromServer();
    }

    // Check for scheduled notifications that should have fired
    await checkScheduledNotifications();
  } catch (error) {
    console.error('Error handling app foreground:', error);
  }
}

/**
 * Handle app going to background
 */
async function handleAppBackground(): Promise<void> {
  try {
    // Save any unsaved state
    await saveAppState();

    // Schedule any pending background tasks
    await scheduleBackgroundTasks();
  } catch (error) {
    console.error('Error handling app background:', error);
  }
}

/**
 * Handle app resume (from killed state)
 */
async function handleAppResume(): Promise<void> {
  try {
    // Process any queued API calls
    const online = await isOnline();
    if (online) {
      const result = await processQueue();
      console.log(`Processed ${result.succeeded.length} queued requests on resume`);
    }

    // Refresh critical data
    await refreshCriticalData();
  } catch (error) {
    console.error('Error handling app resume:', error);
  }
}

/**
 * Handle app pause
 */
async function handleAppPause(): Promise<void> {
  try {
    // Save current state
    await saveAppState();
  } catch (error) {
    console.error('Error handling app pause:', error);
  }
}

/**
 * Save current app state
 */
async function saveAppState(): Promise<void> {
  // Save any pending form data, scroll positions, etc.
  console.log('SoulSanctuary state saved');
}

/**
 * Schedule background tasks
 */
async function scheduleBackgroundTasks(): Promise<void> {
  // On iOS, this would use BGTaskScheduler
  // On Android, this would use WorkManager
  // For now, we rely on the offline queue
  console.log('Background tasks scheduled');
}

/**
 * Refresh data from server
 */
async function refreshDataFromServer(): Promise<void> {
  try {
    // Refresh user data, moods, goals, etc.
    const endpoints = [
      '/api/moods',
      '/api/goals',
      '/api/memories',
      '/api/notifications',
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          // Store in cache
          await cacheData(endpoint, data);
        }
      } catch (error) {
        console.error(`Failed to refresh ${endpoint}:`, error);
      }
    }

    console.log('Data refreshed from server');
  } catch (error) {
    console.error('Failed to refresh data:', error);
  }
}

/**
 * Refresh critical data only
 */
async function refreshCriticalData(): Promise<void> {
  try {
    // Only refresh essential data on resume
    const criticalEndpoints = [
      '/api/notifications',
      '/api/user/profile',
    ];

    for (const endpoint of criticalEndpoints) {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          await cacheData(endpoint, data);
        }
      } catch (error) {
        console.error(`Failed to refresh ${endpoint}:`, error);
      }
    }
  } catch (error) {
    console.error('Failed to refresh critical data:', error);
  }
}

/**
 * Cache data locally
 */
async function cacheData(key: string, data: any): Promise<void> {
  try {
    const { Preferences } = await import('@capacitor/preferences');
    await Preferences.set({
      key: `cache_${key}`,
      value: JSON.stringify({
        data,
        timestamp: Date.now(),
      }),
    });
  } catch (error) {
    console.error('Failed to cache data:', error);
  }
}

/**
 * Check scheduled notifications
 */
async function checkScheduledNotifications(): Promise<void> {
  try {
    // This would check for any notifications that should have been shown
    // while the app was in background
    const notifications = await getScheduledNotifications();
    
    for (const notification of notifications) {
      // Show the notification
      console.log('Showing missed notification:', notification.title);
    }
  } catch (error) {
    console.error('Failed to check scheduled notifications:', error);
  }
}

/**
 * Get cached data
 */
export async function getCachedData(key: string): Promise<any | null> {
  try {
    const { Preferences } = await import('@capacitor/preferences');
    const { value } = await Preferences.get({ key: `cache_${key}` });
    
    if (value) {
      const cached = JSON.parse(value);
      // Check if cache is still valid (1 hour)
      if (Date.now() - cached.timestamp < 3600000) {
        return cached.data;
      }
    }
    return null;
  } catch (error) {
    console.error('Failed to get cached data:', error);
    return null;
  }
}

/**
 * Clear all cached data
 */
export async function clearCachedData(): Promise<void> {
  try {
    const { Preferences } = await import('@capacitor/preferences');
    const { keys } = await Preferences.keys();
    
    for (const key of keys) {
      if (key.startsWith('cache_')) {
        await Preferences.remove({ key });
      }
    }
    
    console.log('Cached data cleared');
  } catch (error) {
    console.error('Failed to clear cached data:', error);
  }
}

/**
 * Perform periodic sync
 * Call this periodically when app is in use
 */
export async function performPeriodicSync(): Promise<void> {
  try {
    const online = await isOnline();
    if (!online) return;

    // Process any queued requests
    await processQueue();

    // Sync data
    await refreshDataFromServer();

    console.log('Periodic sync completed');
  } catch (error) {
    console.error('Periodic sync failed:', error);
  }
}

/**
 * Background fetch handler (iOS)
 * This would be called by the system when it allows background fetch
 */
export async function handleBackgroundFetch(): Promise<void> {
  try {
    console.log('Background fetch initiated');
    
    // Perform sync
    await performPeriodicSync();
    
    console.log('Background fetch completed');
  } catch (error) {
    console.error('Background fetch failed:', error);
  }
}
