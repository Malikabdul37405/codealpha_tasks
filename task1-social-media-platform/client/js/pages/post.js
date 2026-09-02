import { renderNavbar } from '../components/navbar.js';
import { requireAuth, getCurrentUser } from '../utils/auth.js';
import { getPost } from '../api/posts.js';
import { getComments, createComment, deleteComment } from '../api/comments.js';
import { createPostCard } from '../components/postCard.js';
import { formatRelativeTime } from '../utils/formatDate.js';
import { showToast } from '../components/toast.js';

if (!requireAuth()) throw new Error('Not authenticated');
renderNavbar();

const params = new URLSearchParams(window.location.search);
const postId = params.get('id');
if (!postId) window.location.href = '/';

const postContainer = document.getElementById('post-container');
const commentsList = document.getElementById('comments-list');
const commentInput = document.getElementById('comment-input');
const addCommentBtn = document.getElementById('add-comment-btn');
const currentUser = getCurrentUser();

async function load() {
  try {
    const [postRes, commentsRes] = await Promise.all([
      getPost(postId),
      getComments(postId),
    ]);

    postContainer.innerHTML = '';
    postContainer.appendChild(createPostCard(postRes.data));

    renderComments(commentsRes.data.comments);
  } catch (err) {
    postContainer.innerHTML = `<div class="empty-state"><p>${err.message}</p></div>`;
  }
}

function renderComments(comments) {
  commentsList.innerHTML = '';
  if (comments.length === 0) {
    commentsList.innerHTML = '<p style="color: var(--text-secondary);">No comments yet.</p>';
    return;
  }

  comments.forEach((c) => {
    const avatar = c.author.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.author.username)}&background=1d9bf0&color=fff`;
    const isOwner = currentUser.id === c.author.id;

    const el = document.createElement('div');
    el.className = 'comment';
    el.innerHTML = `
      <img src="${avatar}" class="avatar avatar-sm" alt="">
      <div class="comment-content">
        <div class="comment-meta">
          <strong>${c.author.name || c.author.username}</strong>
          · ${formatRelativeTime(c.createdAt)}
          ${isOwner ? `<button class="delete-comment" data-id="${c.id}" style="margin-left: 8px; color: var(--danger);">Delete</button>` : ''}
        </div>
        <div>${escapeHtml(c.content)}</div>
      </div>
    `;
    commentsList.appendChild(el);
  });

  document.querySelectorAll('.delete-comment').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Delete comment?')) return;
      try {
        await deleteComment(btn.dataset.id);
        showToast('Comment deleted', 'success');
        load();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });
}

addCommentBtn.addEventListener('click', async () => {
  const content = commentInput.value.trim();
  if (!content) return;

  addCommentBtn.disabled = true;
  try {
    await createComment(postId, content);
    commentInput.value = '';
    showToast('Comment added', 'success');
    load();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    addCommentBtn.disabled = false;
  }
});

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

load();
