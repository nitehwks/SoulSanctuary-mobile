import { Preferences } from '@capacitor/preferences';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * Get the authentication token from cache or Clerk
 */
async function getAuthToken(): Promise<string | null> {
  // Try to get from cache first
  const { value: cachedToken } = await Preferences.get({ key: 'clerk_token' });
  
  // Check if Clerk is available on window
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

export async function apiFetch(endpoint: string, options?: RequestInit) {
  const token = await getAuthToken();
  
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}/api${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });
  
  if (response.status === 401) {
    // Token expired, clear cache
    await Preferences.remove({ key: 'clerk_token' });
    throw new Error('Authentication required. Please sign in again.');
  }
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }
  
  return response.json();
}

export function get(endpoint: string) {
  return apiFetch(endpoint, { method: 'GET' });
}

export function post(endpoint: string, data: unknown) {
  return apiFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function patch(endpoint: string, data: unknown) {
  return apiFetch(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function del(endpoint: string) {
  return apiFetch(endpoint, { method: 'DELETE' });
}

// React hook for authenticated API calls using Clerk
export function useApi() {
  const { getToken } = useClerkAuth();
  
  const authFetch = async (endpoint: string, options?: RequestInit) => {
    const token = await getToken();
    
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}/api${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
    });
    
    if (response.status === 401) {
      throw new Error('Authentication required. Please sign in again.');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }
    
    return response.json();
  };

  return {
    get: (endpoint: string) => authFetch(endpoint),
    post: (endpoint: string, data: unknown) => authFetch(endpoint, { method: 'POST', body: JSON.stringify(data) }),
    patch: (endpoint: string, data: unknown) => authFetch(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),
    del: (endpoint: string) => authFetch(endpoint, { method: 'DELETE' }),
  };
}
