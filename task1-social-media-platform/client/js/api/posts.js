import { apiRequest } from './client.js';

export async function getFeed(page = 1, limit = 10) {
  return apiRequest(`/posts/feed?page=${page}&limit=${limit}`);
}

export async function createPost(data) {
  return apiRequest('/posts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getPost(id) {
  return apiRequest(`/posts/${id}`);
}

export async function updatePost(id, data) {
  return apiRequest(`/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deletePost(id) {
  return apiRequest(`/posts/${id}`, {
    method: 'DELETE',
  });
}

export async function likePost(id) {
  return apiRequest(`/posts/${id}/like`, { method: 'POST' });
}

export async function unlikePost(id) {
  return apiRequest(`/posts/${id}/like`, { method: 'DELETE' });
}

export async function getUserPosts(userId, page = 1) {
  return apiRequest(`/users/${userId}/posts?page=${page}`);
}
