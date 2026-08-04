/* ============================================================
   KAYLEE — Personal Website
   Shared behavior + configurable liquid mist interaction
   ============================================================ */

'use strict';

const LIQUID_SITE_CONFIG = {
  glass: {
    blurPx: 28,
    saturate: 1.55,
    highlightOpacity: 0.18,
  },
};

const root = document.documentElement;
const nav = document.getElementById('nav');
const sections = document.querySelectorAll('section[id]');
const menuBtn = document.getElementById('navMenuBtn');
const drawer = document.getElementById('navDrawer');
const overlay = document.getElementById('navOverlay');
const drawerClose = document.getElementById('drawerClose');
let lastFocusedElement = null;

root.style.setProperty('--glass-blur', `${LIQUID_SITE_CONFIG.glass.blurPx}px`);
root.style.setProperty('--glass-saturate', LIQUID_SITE_CONFIG.glass.saturate);
root.style.setProperty('--glass-highlight', `rgba(255, 255, 255, ${LIQUID_SITE_CONFIG.glass.highlightOpacity})`);

document.querySelectorAll('.exp-card, .project-card, .life-panel').forEach((element, index) => {
  if (!element.classList.contains('fade-in')) {
    element.classList.add('fade-in');
    element.style.transitionDelay = `${(index % 3) * 90}ms`;
  }
});

function updateActiveNav() {
  if (!sections.length) return;

  const midpoint = window.scrollY + window.innerHeight * 0.4;

  sections.forEach(section => {
    const id = section.getAttribute('id');
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;
    const link = document.querySelector(`.nav-links a[href="#${id}"]`);

    if (link) {
      link.classList.toggle('active', midpoint >= top && midpoint < bottom);
    }
  });
}

function onScroll() {
  if (nav) {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }
  updateActiveNav();
}

function setDrawerState(isOpen) {
  if (!drawer || !overlay || !menuBtn) return;

  drawer.classList.toggle('open', isOpen);
  overlay.classList.toggle('visible', isOpen);
  menuBtn.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';

  if (isOpen) {
    lastFocusedElement = document.activeElement;
    drawerClose?.focus();
  } else if (lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus();
    lastFocusedElement = null;
  }
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

if (menuBtn && drawer && overlay && drawerClose) {
  menuBtn.setAttribute('aria-controls', drawer.id);
  menuBtn.setAttribute('aria-expanded', 'false');

  menuBtn.addEventListener('click', () => setDrawerState(true));
  drawerClose.addEventListener('click', () => setDrawerState(false));
  overlay.addEventListener('click', () => setDrawerState(false));
  drawer.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setDrawerState(false)));

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && drawer.classList.contains('open')) {
      setDrawerState(false);
    }
  });
}

if ('IntersectionObserver' in window) {
  const fadeObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.fade-in').forEach(element => fadeObserver.observe(element));
} else {
  document.querySelectorAll('.fade-in').forEach(element => element.classList.add('visible'));
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;

    const target = document.querySelector(href);
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ============================================================
   THEME TOGGLE — dark ↔ light
   ============================================================ */
(function () {
  const html   = document.documentElement;
  const btn    = document.getElementById('themeToggle');
  if (!btn) return;

  /* Restore saved preference; site defaults to dark */
  const saved  = localStorage.getItem('theme') || 'dark';
  html.setAttribute('data-theme', saved);

  btn.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
}());

/* ============================================================
   EXPERIENCE V2 — Toggle: Resume ↔ Reflections
   ============================================================ */
(function () {
  const section = document.getElementById('experience');
  const toggle  = document.getElementById('expV2Toggle');
  const track   = document.getElementById('expV2Track');
  if (!section || !toggle || !track) return;

  const buttons = toggle.querySelectorAll('.exp-v2-btn');

  function positionTrack(btn) {
    track.style.width     = btn.offsetWidth + 'px';
    track.style.transform = `translateX(${btn.offsetLeft}px)`;
  }

  /* Set initial position after layout */
  requestAnimationFrame(() => {
    const active = toggle.querySelector('.exp-v2-btn.active');
    if (active) positionTrack(active);
  });

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      section.dataset.expmode = btn.dataset.mode;
      positionTrack(btn);
    });
  });
}());

