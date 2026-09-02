import { renderNavbar } from '../components/navbar.js';
import { requireAuth } from '../utils/auth.js';
import { getFeed, createPost } from '../api/posts.js';
import { createPostCard } from '../components/postCard.js';
import { showToast } from '../components/toast.js';

if (!requireAuth()) throw new Error('Not authenticated');

renderNavbar();

const feedContainer = document.getElementById('feed-container');
const loadMoreBtn = document.getElementById('load-more-btn');
const createBtn = document.getElementById('create-post-btn');
const contentInput = document.getElementById('post-content');

let currentPage = 1;
let totalPages = 1;
let isLoading = false;

async function loadFeed(page = 1, append = false) {
  if (isLoading) return;
  isLoading = true;

  if (!append) {
    feedContainer.innerHTML = '<div class="loading">Loading posts...</div>';
  }

  try {
    const res = await getFeed(page);
    const { posts, pagination } = res.data;
    totalPages = pagination.totalPages;
    currentPage = pagination.page;

    if (!append) feedContainer.innerHTML = '';

    if (posts.length === 0 && page === 1) {
      feedContainer.innerHTML = `
        <div class="empty-state">
          <h3>No posts yet</h3>
          <p>Follow some users or create your first post!</p>
        </div>
      `;
    } else {
      posts.forEach((post) => {
        feedContainer.appendChild(createPostCard(post));
      });
    }

    loadMoreBtn.style.display = currentPage < totalPages ? 'inline-flex' : 'none';
  } catch (err) {
    feedContainer.innerHTML = `<div class="empty-state"><p>${err.message}</p></div>`;
    showToast(err.message, 'error');
  } finally {
    isLoading = false;
  }
}

createBtn.addEventListener('click', async () => {
  const content = contentInput.value.trim();
  if (!content) {
    showToast('Please write something', 'error');
    return;
  }

  createBtn.disabled = true;
  try {
    const res = await createPost({ content });
    contentInput.value = '';
    showToast('Post created successfully', 'success');
    const empty = feedContainer.querySelector('.empty-state');
    if (empty) empty.remove();
    feedContainer.prepend(createPostCard(res.data));
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    createBtn.disabled = false;
  }
});

loadMoreBtn.addEventListener('click', () => {
  if (currentPage < totalPages) {
    loadFeed(currentPage + 1, true);
  }
});

loadFeed();
