import { renderNavbar } from '../components/navbar.js';
import { redirectIfLoggedIn, setAuth } from '../utils/auth.js';
import { login } from '../api/auth.js';
import { showToast } from '../components/toast.js';

redirectIfLoggedIn();
renderNavbar();

const form = document.getElementById('login-form');
const submitBtn = document.getElementById('submit-btn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Logging in...';

  try {
    const res = await login({ email, password });
    setAuth(res.data.token, res.data.user);
    showToast('Welcome back!', 'success');
    window.location.href = '/';
  } catch (err) {
    showToast(err.message, 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Log in';
  }
});
