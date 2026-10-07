/**
 * T-02C: Dark Mode Theme Engine
 *
 * CONTRACT-FIRST CONSTRAINTS:
 * ✅ State stored in localStorage with key 'theme'
 * ✅ aria-pressed updated on toggle button
 * ✅ Zero console errors during theme toggling
 * ✅ Keyboard: Enter key triggers toggle (native on <button>)
 */

'use strict';

// ── 1. Get the theme toggle button ─────────────────────────────
const themeToggle = document.querySelector('#theme-btn');
const announcement = document.getElementById('theme-announcement');

/**
 * Apply a theme: toggle .dark-theme on body, update aria-pressed
 * and aria-label on the button, persist to localStorage.
 * @param {boolean} isDark
 */
function applyTheme(isDark) {
  // Toggle CSS class on body (pairs with T-02A .dark-theme rules)
  document.body.classList.toggle('dark-theme', isDark);

  // Update ARIA state for screen readers
  themeToggle.setAttribute('aria-pressed', String(isDark));
  themeToggle.setAttribute(
    'aria-label',
    isDark ? 'Switch to light mode' : 'Switch to dark mode'
  );

  // Persist choice — contract: key must be 'theme'
  localStorage.setItem('theme', isDark ? 'dark' : 'light');

  // Announce to screen readers via live region
  if (announcement) {
    announcement.textContent = isDark ? 'Dark mode activated' : 'Light mode activated';
    // Clear after 1.5 s so repeat toggles re-announce
    setTimeout(function () { announcement.textContent = ''; }, 1500);
  }
}

// ── 2. Click handler — exactly as referenced in lab spec ────────
themeToggle.addEventListener('click', function () {
  const isDark = document.body.classList.toggle('dark-theme');

  // Sync aria-pressed
  themeToggle.setAttribute('aria-pressed', String(isDark));
  themeToggle.setAttribute(
    'aria-label',
    isDark ? 'Switch to light mode' : 'Switch to dark mode'
  );

  // Persist — key 'theme' as mandated by contract
  localStorage.setItem('theme', isDark ? 'dark' : 'light');

  // Announce to screen readers
  if (announcement) {
    announcement.textContent = isDark ? 'Dark mode activated' : 'Light mode activated';
    setTimeout(function () { announcement.textContent = ''; }, 1500);
  }
});

// ── 3. Restore persisted theme on page load ─────────────────────
(function restoreTheme() {
  var saved;
  try {
    saved = localStorage.getItem('theme');
  } catch (e) {
    // localStorage unavailable (private mode) — fail silently
    return;
  }

  if (saved === 'dark') {
    document.body.classList.add('dark-theme');
    themeToggle.setAttribute('aria-pressed', 'true');
    themeToggle.setAttribute('aria-label', 'Switch to light mode');
  } else if (saved === 'light') {
    document.body.classList.remove('dark-theme');
    themeToggle.setAttribute('aria-pressed', 'false');
    themeToggle.setAttribute('aria-label', 'Switch to dark mode');
  }
  // If no saved value, @media (prefers-color-scheme: dark) in CSS
  // handles the OS preference automatically — no JS needed there.
})();

// ── 4. Listen to OS preference changes ─────────────────────────
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
  try {
    // Only follow OS if the user has NOT set a manual preference
    if (!localStorage.getItem('theme')) {
      document.body.classList.toggle('dark-theme', e.matches);
      themeToggle.setAttribute('aria-pressed', String(e.matches));
      themeToggle.setAttribute(
        'aria-label',
        e.matches ? 'Switch to light mode' : 'Switch to dark mode'
      );
    }
  } catch (err) {
    // localStorage unavailable — no action
  }
});
