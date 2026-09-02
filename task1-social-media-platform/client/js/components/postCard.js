import { formatRelativeTime } from '../utils/formatDate.js';
import { likePost, unlikePost, deletePost } from '../api/posts.js';
import { getCurrentUser } from '../utils/auth.js';
import { showToast } from './toast.js';

export function createPostCard(post, { onDelete } = {}) {
  const currentUser = getCurrentUser();
  const isOwner = currentUser && currentUser.id === post.author.id;

  const card = document.createElement('article');
  card.className = 'card post-card';
  card.dataset.id = post.id;

  const avatar = post.author.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.username)}&background=1d9bf0&color=fff`;

  card.innerHTML = `
    <div class="post-header">
      <a href="/profile.html?id=${post.author.id}">
        <img src="${avatar}" alt="${post.author.username}" class="avatar">
      </a>
      <div>
        <a href="/profile.html?id=${post.author.id}" class="post-author">${post.author.name || post.author.username}</a>
        <div class="post-meta">@${post.author.username} · ${formatRelativeTime(post.createdAt)}</div>
      </div>
    </div>
    ${post.content ? `<div class="post-content">${escapeHtml(post.content)}</div>` : ''}
    ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Post image" class="post-image">` : ''}
    <div class="post-actions">
      <button class="like-btn ${post.isLiked ? 'liked' : ''}" data-liked="${post.isLiked}">
        <span class="like-icon">${post.isLiked ? '❤️' : '🤍'}</span>
        <span class="like-count">${post.likesCount || 0}</span>
      </button>
      <a href="/post.html?id=${post.id}">
        💬 <span>${post.commentsCount || 0}</span>
      </a>
      ${isOwner ? `<button class="delete-btn" title="Delete">🗑️</button>` : ''}
    </div>
  `;

  const likeBtn = card.querySelector('.like-btn');
  likeBtn.addEventListener('click', async () => {
    const isLiked = likeBtn.dataset.liked === 'true';
    try {
      const res = isLiked ? await unlikePost(post.id) : await likePost(post.id);
      likeBtn.dataset.liked = res.data.isLiked;
      likeBtn.classList.toggle('liked', res.data.isLiked);
      likeBtn.querySelector('.like-icon').textContent = res.data.isLiked ? '❤️' : '🤍';
      likeBtn.querySelector('.like-count').textContent = res.data.likesCount;
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  const deleteBtn = card.querySelector('.delete-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      if (!confirm('Delete this post?')) return;
      try {
        await deletePost(post.id);
        card.remove();
        showToast('Post deleted', 'success');
        if (onDelete) onDelete();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  return card;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
