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
    // --- Canvas-based frame extraction for smooth scroll ---
    // Extract all frames upfront, then draw to canvas on scroll (no seeking during scroll)
    const TOTAL_FRAMES = 120;
    const frames = [];
    let framesReady = false;
    let targetFrame = 0;
    let currentFrame = 0;

    // Create canvas to replace video
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.className = 'hero-video__player';
    canvas.style.cssText = 'width:100%;height:100%;object-fit:cover;';

    // Animate in text
    if (heroContent) {
      setTimeout(() => heroContent.classList.add('animate-in'), 300);
    }

    // Extract frames from video
    function extractFrames() {
      return new Promise((resolve) => {
        const duration = video.duration;
        let extracted = 0;

        function grabFrame(index) {
          if (index >= TOTAL_FRAMES) {
            resolve();
            return;
          }
          const time = (index / (TOTAL_FRAMES - 1)) * duration;
          video.currentTime = time;
        }

        video.addEventListener('seeked', function onSeeked() {
          // Draw current frame to an offscreen canvas and store as ImageBitmap
          const offscreen = document.createElement('canvas');
          offscreen.width = video.videoWidth;
          offscreen.height = video.videoHeight;
          const offCtx = offscreen.getContext('2d');
          offCtx.drawImage(video, 0, 0);
          frames.push(offscreen);
          extracted++;

          if (extracted >= TOTAL_FRAMES) {
            video.removeEventListener('seeked', onSeeked);
            resolve();
          } else {
            grabFrame(extracted);
          }
        });

        grabFrame(0);
      });
    }

    video.addEventListener('loadeddata', async () => {
      // Set canvas size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw first frame immediately
      ctx.drawImage(video, 0, 0);

      // Replace video with canvas
      video.parentNode.replaceChild(canvas, video);

      // Extract all frames in background
      await extractFrames();
      framesReady = true;

      // Draw correct frame for current scroll position
      updateTargetFrame();
      currentFrame = targetFrame;
      drawFrame(currentFrame);

      // Start smooth render loop
      requestAnimationFrame(renderLoop);
    });

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
      if (!framesReady) {
        requestAnimationFrame(renderLoop);
        return;
      }

      // Lerp for smoothness
      const diff = targetFrame - currentFrame;
      if (Math.abs(diff) > 0.05) {
        currentFrame += diff * 0.1;
        drawFrame(currentFrame);
      }

      requestAnimationFrame(renderLoop);
    }

    window.addEventListener('scroll', updateTargetFrame, { passive: true });
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
