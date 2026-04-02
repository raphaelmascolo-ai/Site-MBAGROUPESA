/* ============================================
   MBA Groupe SA — Main JavaScript
   ============================================ */

(function () {
  'use strict';

  const header = document.querySelector('.site-header');

  // --- Header transparent mode (index page) ---
  if (header && header.classList.contains('header-transparent')) {
    const handleScroll = () => {
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
    const isMobile = window.innerWidth < 768 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

    // Animate in text
    if (heroContent) {
      setTimeout(() => heroContent.classList.add('animate-in'), 300);
    }

    if (isMobile) {
      // --- MOBILE: autoplay video in background ---
      videoSection.style.height = '100vh';
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.play().catch(() => {});

    } else {
      // --- DESKTOP: canvas frame extraction for smooth scroll scrub ---
      const TOTAL_FRAMES = 150;
      const frames = [];
      let framesReady = false;
      let targetFrame = 0;
      let currentFrame = 0;
      let extracting = false;

      // Canvas that replaces the video
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.className = 'hero-video__player';
      canvas.style.cssText = 'width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0;';

      // Show first frame ASAP
      function showFirstFrame() {
        canvas.width = video.videoWidth || 1920;
        canvas.height = video.videoHeight || 1080;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Insert canvas, hide video
        video.style.display = 'none';
        video.parentNode.appendChild(canvas);
      }

      // Extract frames sequentially
      async function extractFrames() {
        if (extracting) return;
        extracting = true;
        const duration = video.duration;

        for (let i = 0; i < TOTAL_FRAMES; i++) {
          const time = (i / (TOTAL_FRAMES - 1)) * duration;
          await seekTo(time);
          const offscreen = document.createElement('canvas');
          offscreen.width = canvas.width;
          offscreen.height = canvas.height;
          const offCtx = offscreen.getContext('2d');
          offCtx.drawImage(video, 0, 0, canvas.width, canvas.height);
          frames.push(offscreen);
        }

        framesReady = true;
        // Draw correct frame for current scroll
        updateTargetFrame();
        currentFrame = targetFrame;
        drawFrame(currentFrame);
      }

      function seekTo(time) {
        return new Promise((resolve) => {
          const onSeeked = () => {
            video.removeEventListener('seeked', onSeeked);
            resolve();
          };
          video.addEventListener('seeked', onSeeked);
          video.currentTime = time;
        });
      }

      function drawFrame(index) {
        const i = Math.round(Math.max(0, Math.min(TOTAL_FRAMES - 1, index)));
        if (frames[i]) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(frames[i], 0, 0);
        }
      }

      function updateTargetFrame() {
        const rect = videoSection.getBoundingClientRect();
        const sectionHeight = videoSection.offsetHeight - window.innerHeight;
        const scrolled = -rect.top;
        const progress = Math.max(0, Math.min(1, scrolled / sectionHeight));
        targetFrame = progress * (TOTAL_FRAMES - 1);
      }

      function renderLoop() {
        if (framesReady) {
          const diff = targetFrame - currentFrame;
          if (Math.abs(diff) > 0.05) {
            currentFrame += diff * 0.12;
            drawFrame(currentFrame);
          }
        }
        requestAnimationFrame(renderLoop);
      }

      // Kick off as soon as video has enough data
      video.addEventListener('loadeddata', () => {
        showFirstFrame();
        requestAnimationFrame(renderLoop);
        extractFrames();
      });

      // Fallback if loadeddata already fired
      if (video.readyState >= 2) {
        showFirstFrame();
        requestAnimationFrame(renderLoop);
        extractFrames();
      }

      window.addEventListener('scroll', updateTargetFrame, { passive: true });
    }
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
