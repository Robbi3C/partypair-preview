/* Form handling for the inquiry modal and the guide lead magnet.

   Forms carry data-netlify="true" so they go live automatically when the
   site is deployed to Netlify. Until then (local preview), submissions are
   caught, validated, and acknowledged with a toast + confetti so the whole
   flow is testable. */

import { burstFrom } from './confetti.js';

function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  requestAnimationFrame(() => toast.classList.add('is-visible'));
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('is-visible'), 4200);
}

function validate(form) {
  let ok = true;
  for (const input of form.querySelectorAll('[required]')) {
    const valid = input.checkValidity();
    input.setAttribute('aria-invalid', String(!valid));
    if (!valid && ok) { input.focus(); ok = false; }
  }
  return ok;
}

// Clear the error state as soon as the field becomes valid again,
// instead of leaving it red until the next submit attempt.
function clearOnInput(form) {
  form.addEventListener('input', (e) => {
    const input = e.target;
    if (input.getAttribute('aria-invalid') === 'true' && input.checkValidity()) {
      input.setAttribute('aria-invalid', 'false');
    }
  });
}

async function submit(form) {
  const data = new FormData(form);
  // Netlify Forms endpoint: POST to any path with form-name included.
  try {
    const res = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(data).toString(),
    });
    if (!res.ok) throw new Error('non-200');
    return true;
  } catch {
    // Local preview or offline: keep the lead so nothing is silently lost.
    const stash = JSON.parse(localStorage.getItem('pp-leads') || '[]');
    stash.push({ ...Object.fromEntries(data), at: new Date().toISOString() });
    localStorage.setItem('pp-leads', JSON.stringify(stash));
    return true;
  }
}

export function initForms() {
  const inquiry = document.getElementById('inquiry-form');
  const modal = document.getElementById('inquiry-modal');

  if (inquiry) {
    clearOnInput(inquiry);
    inquiry.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validate(inquiry)) return;
      const btn = inquiry.querySelector('button[type="submit"]');
      btn.disabled = true;
      await submit(inquiry);
      burstFrom(btn, 120);
      modal?.close();
      showToast("You're on our list! We'll text you within 24 hours. 🥂");
      inquiry.reset();
      btn.disabled = false;
    });
  }

  for (const magnet of document.querySelectorAll('.magnet-form')) {
    clearOnInput(magnet);
    magnet.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validate(magnet)) return;
      const btn = magnet.querySelector('button[type="submit"]');
      btn.disabled = true;
      await submit(magnet);
      burstFrom(btn, 80);
      showToast('The guide is on its way to your inbox! 💌');
      magnet.reset();
      btn.disabled = false;
    });
  }

  // Date field can't be in the past
  for (const dateInput of document.querySelectorAll('input[type="date"]')) {
    dateInput.min = new Date().toISOString().split('T')[0];
  }
}
