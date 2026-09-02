import { apiRequest } from './client.js';

export async function getUser(id) {
  return apiRequest(`/users/${id}`);
}

export async function updateProfile(id, data) {
  return apiRequest(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function followUser(id) {
  return apiRequest(`/users/${id}/follow`, { method: 'POST' });
}

export async function unfollowUser(id) {
  return apiRequest(`/users/${id}/follow`, { method: 'DELETE' });
}

export async function getFollowers(id, page = 1) {
  return apiRequest(`/users/${id}/followers?page=${page}`);
}

export async function getFollowing(id, page = 1) {
  return apiRequest(`/users/${id}/following?page=${page}`);
}
