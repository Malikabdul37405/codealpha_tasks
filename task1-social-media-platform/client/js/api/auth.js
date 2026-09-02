import { apiRequest } from './client.js';

export async function register(data) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function login(data) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getMe() {
  return apiRequest('/auth/me');
}
