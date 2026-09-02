import { getToken, clearAuth } from '../utils/auth.js';

const API_BASE = '/api';

export async function apiRequest(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    clearAuth();
    if (!window.location.pathname.includes('login')) {
      window.location.href = '/login.html';
    }
    throw new Error(data.message || 'Unauthorized');
  }

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}
