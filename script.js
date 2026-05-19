/* ============================================
   KA-BAYAN SYNC — Interactive behaviors
   ============================================ */

(function () {
  'use strict';

  /* ---------- Nav scroll state ---------- */
  const nav = document.getElementById('nav');
  const navToggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.getElementById('mobileMenu');
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    if (y > 20) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const closeMobileMenu = () => {
    if (!nav || !navToggle || !mobileMenu) return;
    nav.classList.remove('menu-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
  };

  if (navToggle && mobileMenu && nav) {
    navToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('menu-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });
  }

  /* ---------- Smooth scroll with offset ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href === '#' || href.length < 2) return;
      const el = document.querySelector(href);
      if (!el) return;
      e.preventDefault();
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
      if (mobileMenu && mobileMenu.contains(a)) closeMobileMenu();
    });
  });

  window.addEventListener('resize', () => {
    if (window.matchMedia('(min-width: 769px)').matches) closeMobileMenu();
  });

  /* ---------- Counter animation on reveal ---------- */
  const counters = document.querySelectorAll('.stat-num[data-count]');
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    };
    requestAnimationFrame(tick);
  };

  /* ---------- Generic intersection reveal ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('[data-anim]').forEach(el => revealObserver.observe(el));

  /* ---------- Counter observer ---------- */
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => countObserver.observe(c));

  /* ---------- Flow tabs ---------- */
  const steps = document.querySelectorAll('.flow-step');
  const panels = document.querySelectorAll('.flow-panel');
  const progressFill = document.getElementById('flowProgress');

  const setFlow = (idx) => {
    steps.forEach((s, i) => {
      s.classList.toggle('active', i === idx);
      s.classList.toggle('completed', i < idx);
      s.setAttribute('aria-selected', i === idx ? 'true' : 'false');
    });
    panels.forEach((p, i) => p.classList.toggle('active', i === idx));
    if (progressFill) {
      const pct = steps.length > 1 ? (idx / (steps.length - 1)) * 100 : 0;
      progressFill.style.height = pct + '%';
    }
  };

  steps.forEach((step, i) => {
    step.addEventListener('click', () => setFlow(i));
    step.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        const next = (i + 1) % steps.length;
        steps[next].focus();
        setFlow(next);
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const prev = (i - 1 + steps.length) % steps.length;
        steps[prev].focus();
        setFlow(prev);
      }
    });
  });

  /* Auto-advance flow when section is in view */
  let flowInterval = null;
  let currentFlow = 0;
  const flowSection = document.getElementById('flow');
  const flowAutoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!flowInterval) {
          flowInterval = setInterval(() => {
            currentFlow = (currentFlow + 1) % steps.length;
            setFlow(currentFlow);
          }, 4000);
        }
      } else {
        if (flowInterval) { clearInterval(flowInterval); flowInterval = null; }
      }
    });
  }, { threshold: 0.3 });
  if (flowSection) flowAutoObserver.observe(flowSection);

  /* Pause auto-advance on user interaction */
  steps.forEach((step, i) => {
    step.addEventListener('click', () => {
      currentFlow = i;
      if (flowInterval) { clearInterval(flowInterval); flowInterval = null; }
    });
  });

  /* ---------- Subtle parallax on hero phone ---------- */
  const phone = document.querySelector('.phone');
  const heroVisual = document.querySelector('.hero-visual');
  if (phone && heroVisual && window.matchMedia('(hover: hover)').matches) {
    heroVisual.addEventListener('mousemove', (e) => {
      const r = heroVisual.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      phone.style.setProperty('transform', `rotate(${-4 + x * 2}deg) translate(${x * 6}px, ${y * 6}px)`);
    });
    heroVisual.addEventListener('mouseleave', () => {
      phone.style.removeProperty('transform');
    });
  }

  /* ---------- Active nav link highlighting ---------- */
  const navLinks = document.querySelectorAll('.nav-links a[data-nav], .nav-mobile-links a[data-nav]');
  const sections = Array.from(navLinks)
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(a => {
          a.style.color = a.getAttribute('href') === '#' + id
            ? 'var(--color-burgundy)'
            : '';
        });
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px' });

  sections.forEach(s => sectionObserver.observe(s));

})();
