const API_BASE = import.meta.env.VITE_API_URL || '';

export async function apiFetch(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE}/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
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
