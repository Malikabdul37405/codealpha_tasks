import { apiRequest } from './client.js';

export async function getComments(postId, page = 1) {
  return apiRequest(`/posts/${postId}/comments?page=${page}`);
}

export async function createComment(postId, content) {
  return apiRequest(`/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function updateComment(id, content) {
  return apiRequest(`/comments/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ content }),
  });
}

export async function deleteComment(id) {
  return apiRequest(`/comments/${id}`, {
    method: 'DELETE',
  });
}
