import { renderNavbar } from '../components/navbar.js';
import { redirectIfLoggedIn, setAuth } from '../utils/auth.js';
import { register } from '../api/auth.js';
import { showToast } from '../components/toast.js';

redirectIfLoggedIn();
renderNavbar();

const form = document.getElementById('register-form');
const submitBtn = document.getElementById('submit-btn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    username: document.getElementById('username').value.trim(),
    name: document.getElementById('name').value.trim() || undefined,
    email: document.getElementById('email').value.trim(),
    password: document.getElementById('password').value,
  };

  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating account...';

  try {
    const res = await register(data);
    setAuth(res.data.token, res.data.user);
    showToast('Account created successfully!', 'success');
    window.location.href = '/';
  } catch (err) {
    showToast(err.message, 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Sign up';
  }
});
