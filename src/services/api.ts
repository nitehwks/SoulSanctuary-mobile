import { Preferences } from '@capacitor/preferences';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Get the Clerk token from cache or fetch a new one
 */
async function getAuthToken(): Promise<string | null> {
  // Try to get from cache first for performance
  const { value: cachedToken } = await Preferences.get({ key: 'clerk_token' });
  
  // Check if we have a window.Clerk instance (Clerk JS loaded)
  const clerk = (window as any).Clerk;
  if (clerk?.session) {
    try {
      const freshToken = await clerk.session.getToken();
      if (freshToken) {
        await Preferences.set({ key: 'clerk_token', value: freshToken });
        return freshToken;
      }
    } catch (error) {
      console.warn('Could not get fresh Clerk token:', error);
    }
  }
  
  return cachedToken;
}

/**
 * Make an authenticated API request
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  // Handle token expiration
  if (response.status === 401) {
    // Clear cached token
    await Preferences.remove({ key: 'clerk_token' });
    
    // Try to refresh token once
    const clerk = (window as any).Clerk;
    if (clerk?.session) {
      try {
        const newToken = await clerk.session.getToken();
        if (newToken) {
          await Preferences.set({ key: 'clerk_token', value: newToken });
          
          // Retry request with new token
          headers['Authorization'] = `Bearer ${newToken}`;
          const retryResponse = await fetch(url, {
            ...options,
            headers,
          });
          
          if (!retryResponse.ok) {
            const error = await retryResponse.json().catch(() => ({}));
            throw new ApiError(retryResponse.status, error.message || `Request failed: ${retryResponse.status}`);
          }
          
          return retryResponse.json();
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }
    
    throw new ApiError(401, 'Authentication required. Please sign in again.');
  }
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(response.status, error.message || `Request failed: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * API client methods
 */
export const api = {
  // User
  getProfile: () => apiRequest('/api/user/profile'),
  updateProfile: (data: any) => apiRequest('/api/user/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  deleteAccount: () => apiRequest('/api/user', { method: 'DELETE' }),
  syncUser: (data: any) => apiRequest('/api/user/sync', { method: 'POST', body: JSON.stringify(data) }),
  
  // Moods
  getMoods: () => apiRequest('/api/moods'),
  createMood: (data: any) => apiRequest('/api/moods', { method: 'POST', body: JSON.stringify(data) }),
  updateMood: (id: string, data: any) => apiRequest(`/api/moods/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteMood: (id: string) => apiRequest(`/api/moods/${id}`, { method: 'DELETE' }),
  
  // Goals
  getGoals: () => apiRequest('/api/goals'),
  createGoal: (data: any) => apiRequest('/api/goals', { method: 'POST', body: JSON.stringify(data) }),
  updateGoal: (id: string, data: any) => apiRequest(`/api/goals/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteGoal: (id: string) => apiRequest(`/api/goals/${id}`, { method: 'DELETE' }),
  
  // Milestones
  createMilestone: (goalId: string, data: any) => apiRequest(`/api/goals/${goalId}/milestones`, { method: 'POST', body: JSON.stringify(data) }),
  updateMilestone: (goalId: string, milestoneId: string, data: any) => apiRequest(`/api/goals/${goalId}/milestones/${milestoneId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  
  // Memories
  getMemories: () => apiRequest('/api/memories'),
  createMemory: (data: any) => apiRequest('/api/memories', { method: 'POST', body: JSON.stringify(data) }),
  updateMemory: (id: string, data: any) => apiRequest(`/api/memories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteMemory: (id: string) => apiRequest(`/api/memories/${id}`, { method: 'DELETE' }),
  
  // AI Chat
  sendChatMessage: (message: string, context?: any) => apiRequest('/api/ai/chat', { method: 'POST', body: JSON.stringify({ message, context }) }),
  
  // Crisis
  detectCrisis: (message: string) => apiRequest('/api/crisis/detect', { method: 'POST', body: JSON.stringify({ message }) }),
  getCrisisResources: () => apiRequest('/api/crisis/resources'),
  
  // Analytics
  getAnalytics: () => apiRequest('/api/analytics'),
  
  // Settings
  getSettings: () => apiRequest('/api/user/settings'),
  updateSettings: (data: any) => apiRequest('/api/user/settings', { method: 'PATCH', body: JSON.stringify(data) }),
  
  // FCM Token for push notifications
  registerFcmToken: (fcmToken: string) => apiRequest('/api/user/fcm-token', { method: 'POST', body: JSON.stringify({ fcmToken }) }),
};

export default api;
