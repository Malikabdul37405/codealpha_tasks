import { renderNavbar } from '../components/navbar.js';
import { requireAuth, getCurrentUser } from '../utils/auth.js';
import { getUser, followUser, unfollowUser } from '../api/users.js';
import { getUserPosts } from '../api/posts.js';
import { createPostCard } from '../components/postCard.js';
import { showToast } from '../components/toast.js';

if (!requireAuth()) throw new Error('Not authenticated');
renderNavbar();

const params = new URLSearchParams(window.location.search);
const userId = params.get('id');
if (!userId) window.location.href = '/';

const currentUser = getCurrentUser();
const isOwnProfile = currentUser.id === userId;

const headerEl = document.getElementById('profile-header');
const postsEl = document.getElementById('posts-container');

async function loadProfile() {
  try {
    const res = await getUser(userId);
    const user = res.data;

    const avatar = user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=1d9bf0&color=fff&size=128`;

    headerEl.innerHTML = `
      <div class="profile-header card">
        <img src="${avatar}" alt="${user.username}" class="profile-avatar">
        <h2>${user.name || user.username}</h2>
        <p style="color: var(--text-secondary);">@${user.username}</p>
        ${user.bio ? `<p style="margin-top: 12px;">${user.bio}</p>` : ''}
        <div class="profile-stats">
          <div><strong>${user.postsCount}</strong> Posts</div>
          <div><strong>${user.followersCount}</strong> Followers</div>
          <div><strong>${user.followingCount}</strong> Following</div>
        </div>
        ${
          isOwnProfile
            ? `<a href="/edit-profile.html" class="btn btn-outline btn-sm mt-2">Edit profile</a>`
            : `<button class="btn ${user.isFollowing ? 'btn-outline' : 'btn-primary'} btn-sm mt-2" id="follow-btn">
                ${user.isFollowing ? 'Unfollow' : 'Follow'}
              </button>`
        }
      </div>
    `;

    if (!isOwnProfile) {
      const followBtn = document.getElementById('follow-btn');
      followBtn.addEventListener('click', async () => {
        try {
          if (user.isFollowing) {
            await unfollowUser(userId);
            user.isFollowing = false;
            user.followersCount--;
            followBtn.textContent = 'Follow';
            followBtn.className = 'btn btn-primary btn-sm mt-2';
          } else {
            await followUser(userId);
            user.isFollowing = true;
            user.followersCount++;
            followBtn.textContent = 'Unfollow';
            followBtn.className = 'btn btn-outline btn-sm mt-2';
          }
          headerEl.querySelector('.profile-stats div:nth-child(2) strong').textContent = user.followersCount;
          showToast(user.isFollowing ? 'Followed' : 'Unfollowed', 'success');
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    }

    const postsRes = await getUserPosts(userId);
    postsEl.innerHTML = '';
    if (postsRes.data.posts.length === 0) {
      postsEl.innerHTML = `<div class="empty-state"><p>No posts yet.</p></div>`;
    } else {
      postsRes.data.posts.forEach((p) => postsEl.appendChild(createPostCard(p)));
    }
  } catch (err) {
    headerEl.innerHTML = `<div class="empty-state"><p>${err.message}</p></div>`;
  }
}

loadProfile();
