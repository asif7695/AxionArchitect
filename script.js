/* ============================================
   ARCHI — JavaScript Interactions
   Scroll reveals, counters, filters, nav
   ============================================ */

(function () {
  'use strict';

  // ─── Preloader ───
  window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
      preloader.classList.add('is-hidden');
      // Trigger hero reveals after preloader fades
      setTimeout(triggerHeroReveal, 300);
    }, 800);
  });

  function triggerHeroReveal() {
    const heroReveals = document.querySelectorAll('.hero .reveal, .hero .line-reveal');
    heroReveals.forEach(el => el.classList.add('is-visible'));
  }


  // ─── Navigation scroll effect ───
  const nav = document.getElementById('nav');
  let lastScroll = 0;

  function handleNavScroll() {
    const scrollY = window.scrollY;
    if (scrollY > 60) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }
    lastScroll = scrollY;
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });


  // ─── Mobile menu toggle ───
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('is-active');
    navLinks.classList.toggle('is-open');
  });

  // Close mobile menu on link click
  navLinks.querySelectorAll('.nav__link, .nav__cta').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('is-active');
      navLinks.classList.remove('is-open');
    });
  });


  // ─── Smooth scroll for anchor links ───
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  // ─── Intersection Observer — scroll reveals ───
  const revealElements = document.querySelectorAll('.reveal, .line-reveal');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  revealElements.forEach(el => {
    // Skip hero elements — they're triggered after preloader
    if (el.closest('.hero')) return;
    revealObserver.observe(el);
  });


  // ─── Animated counter ───
  const counters = document.querySelectorAll('[data-count]');
  let countersDone = false;

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !countersDone) {
          countersDone = true;
          animateCounters();
          counterObserver.disconnect();
        }
      });
    },
    { threshold: 0.4 }
  );

  const statsSection = document.getElementById('stats');
  if (statsSection) counterObserver.observe(statsSection);

  function animateCounters() {
    counters.forEach(counter => {
      const target = parseInt(counter.dataset.count, 10);
      const duration = 2000; // ms
      const startTime = performance.now();

      function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);
        counter.textContent = current + (target >= 100 ? '+' : '+');

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        }
      }

      requestAnimationFrame(updateCounter);
    });
  }


  // ─── Project filter ───
  const filterBtns = document.querySelectorAll('.port-wrap .filter-btn');
  const projectCards = document.querySelectorAll('.port-wrap .card');

  const colors = [
    '#2a3d3a', '#3d2a2a', '#1a2a3d', '#3d3a2a',
    '#2a2a3d', '#3a2d1a', '#1d3d2a'
  ];

  projectCards.forEach((card, index) => {
    card.style.background = colors[index % colors.length];
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      projectCards.forEach(card => {
        if (filter === 'all' || card.dataset.cat === filter) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });


  // ─── Subtle parallax on hero background ───
  const heroBg = document.querySelector('.hero__bg img');

  function handleHeroParallax() {
    if (!heroBg) return;
    const scrollY = window.scrollY;
    const heroHeight = document.querySelector('.hero').offsetHeight;
    if (scrollY <= heroHeight) {
      const translate = scrollY * 0.3;
      heroBg.style.transform = `translateY(${translate}px) scale(1.05)`;
    }
  }

  window.addEventListener('scroll', handleHeroParallax, { passive: true });


  // ─── Project card tilt effect (desktop only) ───
  if (window.matchMedia('(min-width: 769px)').matches) {
    projectCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.5s ease';
        setTimeout(() => {
          card.style.transition = '';
        }, 500);
      });
    });
  }


  // ─── Active nav link on scroll ───
  const sections = document.querySelectorAll('section[id]');
  const navLinksAll = document.querySelectorAll('.nav__link');

  function highlightNavOnScroll() {
    const scrollY = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navLinksAll.forEach(link => {
          link.style.color = '';
          if (link.getAttribute('href') === '#' + id) {
            link.style.color = 'var(--color-text-primary)';
          }
        });
      }
    });
  }

  window.addEventListener('scroll', highlightNavOnScroll, { passive: true });

})();
