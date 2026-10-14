/**
 * PERSONA 5 THEME PORTFOLIO - MAIN JAVASCRIPT
 * Author: Supphakan Chuadsri
 * Features: Web Audio SFX, Portfolio Filter, Lightbox Modal, Active Nav, Interactive UI
 */

document.addEventListener('DOMContentLoaded', () => {
  initActiveNav();
  initP5AudioEffects();
  initPortfolioFilter();
  initPortfolioModal();
  initContactForm();
});

/* ==========================================================================
   1. Active Navigation Indicator
   ========================================================================== */
function initActiveNav() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.p5-nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/* ==========================================================================
   2. Persona 5 Web Audio Synthesizer (Zero External Assets Needed!)
   Creates authentic snappy UI blips, clicks, and whooshes
   ========================================================================== */
let audioCtx = null;
let sfxEnabled = true;

function initP5AudioEffects() {
  // Restore sound preference from localStorage
  const storedPref = localStorage.getItem('p5_sfx_enabled');
  if (storedPref !== null) {
    sfxEnabled = storedPref === 'true';
  }

  const sfxToggleBtn = document.getElementById('sfxToggleBtn');
  updateSfxButtonUI(sfxToggleBtn);

  if (sfxToggleBtn) {
    sfxToggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      sfxEnabled = !sfxEnabled;
      localStorage.setItem('p5_sfx_enabled', sfxEnabled);
      updateSfxButtonUI(sfxToggleBtn);
      if (sfxEnabled) {
        playP5Sound('confirm');
      }
    });
  }

  // Attach sound effects to interactive buttons & links
  const clickables = document.querySelectorAll('a, button, .filter-btn, .portfolio-card, .activity-card');
  clickables.forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (sfxEnabled) playP5Sound('hover');
    });
    el.addEventListener('click', () => {
      if (sfxEnabled) playP5Sound('click');
    });
  });
}

function updateSfxButtonUI(btn) {
  if (!btn) return;
  const icon = btn.querySelector('i');
  const label = btn.querySelector('.sfx-label');
  if (sfxEnabled) {
    if (icon) icon.className = 'fas fa-volume-high';
    if (label) label.textContent = 'SFX: ON';
    btn.style.color = '#ffde00';
  } else {
    if (icon) icon.className = 'fas fa-volume-xmark';
    if (label) label.textContent = 'SFX: OFF';
    btn.style.color = '#a0a0a5';
  }
}

function playP5Sound(type) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (!audioCtx) {
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    if (type === 'hover') {
      // High pitch quick blip
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'click') {
      // Snappy Persona 5 menu select hit
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'confirm') {
      // Two-tone fanfare confirmation
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'square';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc2.frequency.setValueAtTime(1046.5, now + 0.08); // C6

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);
      osc1.start(now);
      osc2.start(now + 0.08);
      osc1.stop(now + 0.25);
      osc2.stop(now + 0.25);
    }
  } catch (err) {
    // Ignore audio restriction errors on un-interacted documents
  }
}

/* ==========================================================================
   3. Portfolio Filter System
   ========================================================================== */
function initPortfolioFilter() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-grid-item');

  if (filterButtons.length === 0 || portfolioItems.length === 0) return;

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Set active button
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      portfolioItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        if (filterValue === 'all' || itemCategory === filterValue) {
          item.style.display = 'block';
          item.classList.add('fade-in-up');
        } else {
          item.style.display = 'none';
          item.classList.remove('fade-in-up');
        }
      });
    });
  });
}

/* ==========================================================================
   4. Portfolio Lightbox Modal
   ========================================================================== */
function initPortfolioModal() {
  const modalEl = document.getElementById('portfolioDetailModal');
  if (!modalEl) return;

  const modalImg = modalEl.querySelector('#modalImage');
  const modalTitle = modalEl.querySelector('#modalTitle');
  const modalCategory = modalEl.querySelector('#modalCategory');
  const modalDescription = modalEl.querySelector('#modalDescription');
  const modalTools = modalEl.querySelector('#modalTools');

  const previewButtons = document.querySelectorAll('.btn-preview-work');

  previewButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const title = btn.getAttribute('data-title') || 'ผลงานสร้างสรรค์';
      const category = btn.getAttribute('data-category-name') || 'หมวดหมู่ผลงาน';
      const imgSrc = btn.getAttribute('data-img') || '';
      const desc = btn.getAttribute('data-desc') || '';
      const tools = btn.getAttribute('data-tools') || 'Adobe Photoshop, Illustrator';

      if (modalTitle) modalTitle.textContent = title;
      if (modalCategory) modalCategory.textContent = category;
      if (modalImg) modalImg.src = imgSrc;
      if (modalDescription) modalDescription.textContent = desc;

      if (modalTools) {
        modalTools.innerHTML = '';
        const toolList = tools.split(',');
        toolList.forEach(t => {
          const badge = document.createElement('span');
          badge.className = 'badge bg-dark border border-danger me-1 mb-1 p-2';
          badge.textContent = t.trim();
          modalTools.appendChild(badge);
        });
      }

      // Show Bootstrap Modal
      const bsModal = new bootstrap.Modal(modalEl);
      bsModal.show();
    });
  });
}

/* ==========================================================================
   5. Contact Form Simulation (Persona 5 Calling Card Effect)
   ========================================================================== */
function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  const alertSuccess = document.getElementById('callingCardSuccessAlert');

  if (!contactForm) return;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('senderName')?.value || '';
    const email = document.getElementById('senderEmail')?.value || '';
    const message = document.getElementById('senderMessage')?.value || '';

    if (!name || !email || !message) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง');
      return;
    }

    if (sfxEnabled) {
      playP5Sound('confirm');
    }

    // Display stylish success notification
    if (alertSuccess) {
      alertSuccess.classList.remove('d-none');
      alertSuccess.classList.add('fade-in-up');
    }

    // Reset Form
    contactForm.reset();

    // Scroll to alert
    if (alertSuccess) {
      alertSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
}

