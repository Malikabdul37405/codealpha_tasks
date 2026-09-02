import { isLoggedIn, getCurrentUser, clearAuth } from '../utils/auth.js';

export function renderNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  const loggedIn = isLoggedIn();
  const user = getCurrentUser();

  nav.innerHTML = `
    <div class="navbar-inner">
      <a href="/" class="logo">SocialApp</a>
      <div class="nav-links">
        ${
          loggedIn
            ? `
          <a href="/">Feed</a>
          <a href="/profile.html?id=${user.id}">Profile</a>
          <button id="logout-btn">Logout</button>
        `
            : `
          <a href="/login.html">Login</a>
          <a href="/register.html">Register</a>
        `
        }
      </div>
    </div>
  `;

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearAuth();
      window.location.href = '/login.html';
    });
  }
}
