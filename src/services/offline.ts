import { Preferences } from '@capacitor/preferences';
import { Network } from '@capacitor/network';

const QUEUE_KEY = 'api_queue';
const CACHE_PREFIX = 'cache_';

interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  body: any;
  headers: Record<string, string>;
  timestamp: number;
  retries: number;
}

interface CachedData {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

/**
 * Check if device is online
 */
export async function isOnline(): Promise<boolean> {
  const status = await Network.getStatus();
  return status.connected;
}

/**
 * Add a request to the offline queue
 */
export async function queueRequest(
  url: string,
  method: string,
  body: any,
  headers: Record<string, string> = {}
): Promise<string> {
  const request: QueuedRequest = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    url,
    method,
    body,
    headers,
    timestamp: Date.now(),
    retries: 0,
  };

  const { value } = await Preferences.get({ key: QUEUE_KEY });
  const queue: QueuedRequest[] = value ? JSON.parse(value) : [];
  queue.push(request);

  await Preferences.set({
    key: QUEUE_KEY,
    value: JSON.stringify(queue),
  });

  console.log(`Request queued: ${method} ${url}`);
  return request.id;
}

/**
 * Get all queued requests
 */
export async function getQueuedRequests(): Promise<QueuedRequest[]> {
  const { value } = await Preferences.get({ key: QUEUE_KEY });
  return value ? JSON.parse(value) : [];
}

/**
 * Remove a request from the queue
 */
export async function removeFromQueue(requestId: string): Promise<void> {
  const { value } = await Preferences.get({ key: QUEUE_KEY });
  if (!value) return;

  const queue: QueuedRequest[] = JSON.parse(value);
  const filtered = queue.filter((r) => r.id !== requestId);

  await Preferences.set({
    key: QUEUE_KEY,
    value: JSON.stringify(filtered),
  });
}

/**
 * Clear the entire queue
 */
export async function clearQueue(): Promise<void> {
  await Preferences.remove({ key: QUEUE_KEY });
}

/**
 * Process all queued requests
 * Call this when app comes back online
 */
export async function processQueue(): Promise<{
  succeeded: string[];
  failed: string[];
}> {
  const queue = await getQueuedRequests();
  const succeeded: string[] = [];
  const failed: string[] = [];

  // Check if online
  const online = await isOnline();
  if (!online) {
    console.log('Still offline, cannot process queue');
    return { succeeded, failed };
  }

  console.log(`Processing ${queue.length} queued requests...`);

  for (const request of queue) {
    try {
      const response = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body ? JSON.stringify(request.body) : undefined,
      });

      if (response.ok) {
        await removeFromQueue(request.id);
        succeeded.push(request.id);
        console.log(`Queued request succeeded: ${request.method} ${request.url}`);
      } else {
        // Retry logic
        if (request.retries < 3) {
          request.retries++;
          // Update queue with retry count
          const currentQueue = await getQueuedRequests();
          const updated = currentQueue.map((r) =>
            r.id === request.id ? request : r
          );
          await Preferences.set({
            key: QUEUE_KEY,
            value: JSON.stringify(updated),
          });
        } else {
          failed.push(request.id);
          console.error(`Queued request failed after 3 retries: ${request.url}`);
        }
      }
    } catch (error) {
      console.error(`Failed to process queued request: ${request.url}`, error);
      failed.push(request.id);
    }
  }

  return { succeeded, failed };
}

/**
 * Cache data locally
 */
export async function cacheData(
  key: string,
  data: any,
  ttlMinutes: number = 60
): Promise<void> {
  const cached: CachedData = {
    data,
    timestamp: Date.now(),
    ttl: ttlMinutes * 60 * 1000,
  };

  await Preferences.set({
    key: `${CACHE_PREFIX}${key}`,
    value: JSON.stringify(cached),
  });
}

/**
 * Get cached data
 */
export async function getCachedData<T>(key: string): Promise<T | null> {
  const { value } = await Preferences.get({ key: `${CACHE_PREFIX}${key}` });
  if (!value) return null;

  const cached: CachedData = JSON.parse(value);
  const now = Date.now();

  // Check if cache is expired
  if (now - cached.timestamp > cached.ttl) {
    await Preferences.remove({ key: `${CACHE_PREFIX}${key}` });
    return null;
  }

  return cached.data as T;
}

/**
 * Clear all cached data
 */
export async function clearCache(): Promise<void> {
  const { keys } = await Preferences.keys();
  const cacheKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));

  for (const key of cacheKeys) {
    await Preferences.remove({ key });
  }
}

/**
 * Smart fetch that handles offline/online states
 */
export async function smartFetch<T>(
  url: string,
  options: RequestInit = {},
  cacheKey?: string,
  cacheTtlMinutes: number = 60
): Promise<T> {
  const online = await isOnline();

  // If it's a GET request and we have a cache key, try cache first
  if (options.method === 'GET' || !options.method) {
    const cached = cacheKey ? await getCachedData<T>(cacheKey) : null;

    if (cached) {
      // Return cached data immediately
      // In background, fetch fresh data if online
      if (online) {
        fetch(url, options)
          .then((res) => res.json())
          .then((data) => {
            if (cacheKey) {
              cacheData(cacheKey, data, cacheTtlMinutes);
            }
          })
          .catch(console.error);
      }

      return cached;
    }

    // No cache, fetch from network
    if (!online) {
      throw new Error('No internet connection and no cached data available');
    }

    const response = await fetch(url, options);
    const data = await response.json();

    // Cache the response
    if (cacheKey) {
      await cacheData(cacheKey, data, cacheTtlMinutes);
    }

    return data;
  }

  // For non-GET requests (POST, PUT, DELETE, etc.)
  if (online) {
    const response = await fetch(url, options);
    return response.json();
  } else {
    // Queue the request for later
    await queueRequest(
      url,
      options.method || 'POST',
      options.body,
      (options.headers as Record<string, string>) || {}
    );

    // Return a placeholder response
    return { queued: true, message: 'Request queued for sync' } as T;
  }
}

/**
 * Initialize offline support
 * Call this on app startup
 */
export async function initializeOfflineSupport(
  onStatusChange?: (online: boolean) => void
): Promise<void> {
  // Listen for network status changes
  Network.addListener('networkStatusChange', (status) => {
    console.log('Network status changed:', status.connected ? 'online' : 'offline');

    if (status.connected) {
      // Process queue when coming back online
      processQueue().then((result) => {
        console.log(`Processed ${result.succeeded} queued requests, ${result.failed} failed`);
      });
    }

    if (onStatusChange) {
      onStatusChange(status.connected);
    }
  });

  // Process any existing queue on startup
  const online = await isOnline();
  if (online) {
    const queue = await getQueuedRequests();
    if (queue.length > 0) {
      console.log(`Found ${queue.length} queued requests, processing...`);
      processQueue();
    }
  }

  console.log('Offline support initialized');
}

/**
 * Get offline status summary
 */
export async function getOfflineStatus(): Promise<{
  isOnline: boolean;
  queueSize: number;
  cacheSize: number;
}> {
  const [online, queue, cacheKeys] = await Promise.all([
    isOnline(),
    getQueuedRequests(),
    Preferences.keys(),
  ]);

  return {
    isOnline: online,
    queueSize: queue.length,
    cacheSize: cacheKeys.keys.filter((k) => k.startsWith(CACHE_PREFIX)).length,
  };
}
