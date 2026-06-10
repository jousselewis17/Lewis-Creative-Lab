/* ═══════════════════════════════════════════
   STRKT — script.js
   Cursor · Nav · Reveal · Stats · Hamburger
═══════════════════════════════════════════ */

(() => {
  'use strict';

  /* ── Utility ── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const isMobile = () => window.innerWidth <= 900;

  /* ═══ CURSOR ═══ */
  const cursor = $('#cursor');
  const trail = $('#cursorTrail');
  let cx = -100, cy = -100, tx = -100, ty = -100;

  document.addEventListener('mousemove', e => {
    cx = e.clientX;
    cy = e.clientY;
    cursor.style.left = `${cx}px`;
    cursor.style.top  = `${cy}px`;
  });

  // Trail follows with lag
  function animateTrail() {
    tx += (cx - tx) * 0.12;
    ty += (cy - ty) * 0.12;
    trail.style.left = `${tx}px`;
    trail.style.top  = `${ty}px`;
    requestAnimationFrame(animateTrail);
  }
  animateTrail();

  // Hover state on interactive elements
  const hoverEls = $$('a, button, [role="article"], .service-card, .work-card, .stack-item');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('cursor--hover');
      trail.classList.add('cursor-trail--hover');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('cursor--hover');
      trail.classList.remove('cursor-trail--hover');
    });
  });

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    trail.style.opacity  = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    trail.style.opacity  = '1';
  });

  /* ═══ NAV SCROLL ═══ */
  const nav = $('#nav');
  let lastY = 0;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastY = y;
  }, { passive: true });

  /* ═══ HAMBURGER ═══ */
  const hamburger = $('#navHamburger');
  const mobileMenu = $('#mobileMenu');
  let menuOpen = false;

  function toggleMenu(open) {
    menuOpen = open;
    hamburger.classList.toggle('active', open);
    mobileMenu.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  hamburger.addEventListener('click', () => toggleMenu(!menuOpen));

  $$('.mobile-link').forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menuOpen) toggleMenu(false);
  });

  /* ═══ SCROLL REVEAL ═══ */
  const revealEls = $$('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ═══ STAT COUNTER ═══ */
  const statNums = $$('.stat-num');
  let countersRan = false;

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animateCounter(el, target, duration = 1400) {
    const start = performance.now();
    const startVal = 0;

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);
      const value = Math.round(startVal + (target - startVal) * eased);
      el.textContent = value;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersRan) {
        countersRan = true;
        statNums.forEach((el, i) => {
          const target = parseInt(el.dataset.target, 10);
          setTimeout(() => animateCounter(el, target), i * 180);
        });
        statsObserver.disconnect();
      }
    });
  }, { threshold: 0.5 });

  const heroStats = $('.hero-stats');
  if (heroStats) statsObserver.observe(heroStats);

  /* ═══ SMOOTH SCROLL ═══ */
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72);
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ═══ ACTIVE NAV LINK ═══ */
  const sections = $$('section[id]');
  const navLinks = $$('.nav-link');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.style.color = link.getAttribute('href') === `#${id}` ? 'var(--blue)' : '';
        });
      }
    });
  }, { rootMargin: '-40% 0px -40% 0px' });

  sections.forEach(sec => sectionObserver.observe(sec));

  /* ═══ PAGE TRANSITION ═══ */
  const overlay = $('#pageTransition');

  // Enter animation on load
  if (overlay) {
    overlay.classList.add('enter');
    overlay.addEventListener('animationend', () => {
      overlay.classList.remove('enter');
    }, { once: true });
  }

  // Leave animation on external link click (non-anchor hrefs)
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    // Only trigger for real page navigations (not hash links, not blank targets)
    if (
      href &&
      !href.startsWith('#') &&
      !link.hasAttribute('target') &&
      !href.startsWith('mailto:') &&
      !href.startsWith('tel:')
    ) {
      link.addEventListener('click', e => {
        e.preventDefault();
        overlay.classList.add('leave');
        overlay.addEventListener('animationend', () => {
          window.location.href = href;
        }, { once: true });
      });
    }
  });



  /* ═══ BAND PAUSE ON HOVER ═══ */
  const band = $('.band-track');
  if (band) {
    const bandWrap = $('.band-manifesto');
    bandWrap.addEventListener('mouseenter', () => {
      band.style.animationPlayState = 'paused';
    });
    bandWrap.addEventListener('mouseleave', () => {
      band.style.animationPlayState = 'running';
    });
  }

  /* ═══ SERVICE CARD TILT ═══ */
  if (!isMobile()) {
    $$('.service-card, .work-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 6;
        card.style.transform = `perspective(600px) rotateY(${x}deg) rotateX(${-y}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ═══ FOOTER YEAR ═══ */
  const yearEls = $$('[data-year]');
  yearEls.forEach(el => { el.textContent = new Date().getFullYear(); });

})();
