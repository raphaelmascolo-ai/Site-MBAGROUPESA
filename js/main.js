/* ============================================
   MBA Groupe SA — Main JavaScript
   ============================================ */

(function () {
  'use strict';

  const header = document.querySelector('.site-header');

  // --- Header transparent mode (index page) ---
  if (header && header.classList.contains('header-transparent')) {
    const heroSection = document.querySelector('.hero-video-section');
    const handleScroll = () => {
      // Switch header when we scroll past the hero sticky zone
      if (window.scrollY > 60) {
        header.classList.remove('header-transparent');
      } else {
        header.classList.add('header-transparent');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  // --- Scroll-driven video ---
  const videoSection = document.querySelector('.hero-video-section');
  const video = document.querySelector('.hero-video__player');
  const heroContent = document.querySelector('.hero-video__content');

  if (videoSection && video) {
    let videoReady = false;
    let videoDuration = 0;
    let targetProgress = 0;
    let currentProgress = 0;
    let rafId = null;
    const LERP_FACTOR = 0.06; // Lower = smoother/slower, higher = snappier

    video.addEventListener('loadedmetadata', () => {
      videoDuration = video.duration;
      videoReady = true;
      video.currentTime = 0;
      startRenderLoop();
    });

    // Animate in text on load
    if (heroContent) {
      setTimeout(() => heroContent.classList.add('animate-in'), 300);
    }

    // Update target on scroll (cheap, no DOM writes)
    function onScroll() {
      const rect = videoSection.getBoundingClientRect();
      const sectionHeight = videoSection.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      targetProgress = Math.max(0, Math.min(1, scrolled / sectionHeight));
    }

    // Smooth render loop — lerps currentProgress toward targetProgress
    function renderLoop() {
      if (!videoReady || !videoDuration) {
        rafId = requestAnimationFrame(renderLoop);
        return;
      }

      // Lerp: ease current toward target
      const diff = targetProgress - currentProgress;

      // Only update if there's meaningful change
      if (Math.abs(diff) > 0.0001) {
        currentProgress += diff * LERP_FACTOR;

        const time = currentProgress * videoDuration;
        if (isFinite(time) && Math.abs(video.currentTime - time) > 0.01) {
          video.currentTime = time;
        }
      }

      rafId = requestAnimationFrame(renderLoop);
    }

    function startRenderLoop() {
      if (!rafId) {
        onScroll(); // Set initial position
        rafId = requestAnimationFrame(renderLoop);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // --- Mobile menu ---
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  const menuOverlay = document.querySelector('.menu-overlay');

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      mainNav.classList.toggle('open');
      if (menuOverlay) menuOverlay.classList.toggle('active');
      menuToggle.setAttribute('aria-expanded',
        mainNav.classList.contains('open'));
    });

    if (menuOverlay) {
      menuOverlay.addEventListener('click', () => {
        mainNav.classList.remove('open');
        menuOverlay.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    }

    mainNav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        if (menuOverlay) menuOverlay.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // --- Scroll animations (IntersectionObserver) ---
  const animatedElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');

  if (animatedElements.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    });

    animatedElements.forEach(el => observer.observe(el));
  } else {
    animatedElements.forEach(el => el.classList.add('visible'));
  }

  // --- Active nav link ---
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

})();
