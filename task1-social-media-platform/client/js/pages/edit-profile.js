import { renderNavbar } from '../components/navbar.js';
import { requireAuth, getCurrentUser, setAuth, getToken } from '../utils/auth.js';
import { getUser, updateProfile } from '../api/users.js';
import { showToast } from '../components/toast.js';

if (!requireAuth()) throw new Error('Not authenticated');
renderNavbar();

const currentUser = getCurrentUser();
const form = document.getElementById('edit-form');
const submitBtn = document.getElementById('submit-btn');

async function load() {
  try {
    const res = await getUser(currentUser.id);
    document.getElementById('name').value = res.data.name || '';
    document.getElementById('bio').value = res.data.bio || '';
    document.getElementById('profileImage').value = res.data.profileImage || '';
  } catch (err) {
    showToast(err.message, 'error');
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  submitBtn.disabled = true;

  try {
    const data = {
      name: document.getElementById('name').value.trim() || null,
      bio: document.getElementById('bio').value.trim() || null,
      profileImage: document.getElementById('profileImage').value.trim() || null,
    };
    const res = await updateProfile(currentUser.id, data);
    setAuth(getToken(), { ...currentUser, ...res.data });
    showToast('Profile updated', 'success');
    window.location.href = `/profile.html?id=${currentUser.id}`;
  } catch (err) {
    showToast(err.message, 'error');
    submitBtn.disabled = false;
  }
});

load();
