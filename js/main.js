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

      // Extract frames sequentially — but mark ready immediately
      async function extractFrames() {
        if (extracting) return;
        extracting = true;
        const duration = video.duration;
        // Pre-allocate array so we can fill in any order if needed
        frames.length = TOTAL_FRAMES;

        // Mark ready right away — drawFrame will use closest available frame
        framesReady = true;

        for (let i = 0; i < TOTAL_FRAMES; i++) {
          const time = (i / (TOTAL_FRAMES - 1)) * duration;
          await seekTo(time);
          const offscreen = document.createElement('canvas');
          offscreen.width = canvas.width;
          offscreen.height = canvas.height;
          const offCtx = offscreen.getContext('2d');
          offCtx.drawImage(video, 0, 0, canvas.width, canvas.height);
          frames[i] = offscreen;
        }
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
        const target = Math.round(Math.max(0, Math.min(TOTAL_FRAMES - 1, index)));
        // Find closest available frame (in case extraction not finished)
        let i = target;
        if (!frames[i]) {
          // Search outward for nearest extracted frame
          for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
            if (frames[target - offset]) { i = target - offset; break; }
            if (frames[target + offset]) { i = target + offset; break; }
          }
        }
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

    // Regular page links close the menu
    mainNav.querySelectorAll('.dropdown-link, .nav-link:not(.nav-link--dropdown)').forEach(function(link) {
      link.addEventListener('click', function() {
        mainNav.classList.remove('open');
        if (menuOverlay) menuOverlay.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Dropdown toggles for mobile
  document.querySelectorAll('.nav-link--dropdown').forEach(function(trigger) {
    trigger.addEventListener('touchstart', function(e) {
      if (window.innerWidth > 768) return;
      e.preventDefault();
      var dd = trigger.parentElement;
      var wasOpen = dd.classList.contains('open');
      document.querySelectorAll('.nav-dropdown.open').forEach(function(d) { d.classList.remove('open'); });
      if (!wasOpen) dd.classList.add('open');
    }, { passive: false });

    trigger.addEventListener('click', function(e) {
      if (window.innerWidth > 768) return;
      e.preventDefault();
      var dd = trigger.parentElement;
      var wasOpen = dd.classList.contains('open');
      document.querySelectorAll('.nav-dropdown.open').forEach(function(d) { d.classList.remove('open'); });
      if (!wasOpen) dd.classList.add('open');
    });
  });

  // Dropdown toggle for mobile
  document.querySelectorAll('.nav-dropdown').forEach(function(dropdown) {
    var link = dropdown.querySelector('.nav-link--dropdown');
    if (link) {
      link.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          dropdown.classList.toggle('open');
        }
      });
    }
  });

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

  // --- Orbital Companies Timeline ---
  const orbitalStage = document.getElementById('orbitalStage');
  const orbitalNodes = document.getElementById('orbitalNodes');

  if (orbitalStage && orbitalNodes) {
    const companies = [
      {
        id: 'mba-construction',
        short: 'MC',
        name: 'MBA Construction SA',
        sector: 'Maçonnerie · Béton armé',
        text: 'Pilier historique du groupe depuis 2001. 25 ans d\'expertise au service du bâtiment valaisan.',
        meta: 'Fondation',
        value: '2001'
      },
      {
        id: 'mba-immobilier',
        short: 'MI',
        name: 'MBA Immobilier SA',
        sector: 'Promotion · Gestion',
        text: 'Promotion, vente et gestion d\'un portefeuille résidentiel et commercial haut de gamme.',
        meta: 'Activité',
        value: 'Immo'
      },
      {
        id: 'asv-construction',
        short: 'ASV',
        name: 'ASV Construction Générale SA',
        sector: 'Construction générale',
        text: 'Solutions clés en main pour les projets architecturaux complexes, conception à livraison.',
        meta: 'Type',
        value: 'Clés en main'
      },
      {
        id: 'asv-color',
        short: 'AC',
        name: 'ASV Color SA',
        sector: 'Peinture · Finitions',
        text: 'Le langage visuel de nos ouvrages, avec une précision artisanale et des finitions sur mesure.',
        meta: 'Spécialité',
        value: 'Finitions'
      },
      {
        id: 'asv-fenetres',
        short: 'AF',
        name: 'ASV Fenêtres et Portes SA',
        sector: 'Fenêtres · Portes',
        text: 'Spécialiste en fourniture et pose de fenêtres et portes de haute qualité.',
        meta: 'Mission',
        value: 'Qualité'
      }
    ];

    let rotation = 0;
    let autoRotate = true;
    let activeId = null;
    const RADIUS = 220;
    const RADIUS_MOBILE = 220;

    // Build nodes
    companies.forEach((c, i) => {
      const node = document.createElement('div');
      node.className = 'orbital-node';
      node.dataset.id = c.id;
      node.dataset.index = i;
      node.innerHTML = `
        <div class="orbital-node__halo"></div>
        <div class="orbital-node__dot">${c.short}</div>
        <div class="orbital-node__label">${c.name}</div>
        <div class="orbital-detail">
          <button class="orbital-detail__close" type="button" aria-label="Fermer">&times;</button>
          <div class="orbital-detail__inner">
            <span class="orbital-detail__sector">${c.sector}</span>
            <h3 class="orbital-detail__title">${c.name}</h3>
            <p class="orbital-detail__text">${c.text}</p>
            <div class="orbital-detail__meta">
              <div class="orbital-detail__meta-item">
                <span class="orbital-detail__meta-label">${c.meta}</span>
                <span class="orbital-detail__meta-value">${c.value}</span>
              </div>
            </div>
            <a href="companies.html#${c.id}" class="orbital-detail__cta">
              Découvrir la société
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      `;

      node.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleNode(c.id);
      });

      orbitalNodes.appendChild(node);
    });

    function updatePositions() {
      const total = companies.length;
      const nodeEls = orbitalNodes.querySelectorAll('.orbital-node');
      nodeEls.forEach((node, i) => {
        const angle = ((i / total) * 360 + rotation) % 360;
        const radian = (angle * Math.PI) / 180;
        const x = RADIUS * Math.cos(radian);
        const y = RADIUS * Math.sin(radian);
        const opacity = Math.max(0.5, 0.5 + 0.5 * ((1 + Math.sin(radian)) / 2));
        const zIndex = Math.round(100 + 50 * Math.cos(radian));
        node.style.transform = `translate(${x}px, ${y}px)`;
        // Active node always full opacity (so detail card stays opaque)
        node.style.opacity = node.classList.contains('active') ? 1 : opacity;
        node.style.zIndex = node.classList.contains('active') ? 500 : zIndex;
      });
    }

    function closeDetail() {
      orbitalNodes.querySelectorAll('.orbital-node').forEach(n => n.classList.remove('active'));
      activeId = null;
      autoRotate = true;
    }

    function toggleNode(id) {
      const nodes = orbitalNodes.querySelectorAll('.orbital-node');
      if (activeId === id) {
        closeDetail();
      } else {
        nodes.forEach(n => {
          if (n.dataset.id === id) {
            n.classList.add('active');
          } else {
            n.classList.remove('active');
          }
        });
        activeId = id;
        autoRotate = false;

        const idx = companies.findIndex(c => c.id === id);
        rotation = 270 - (idx / companies.length) * 360;
        updatePositions();
      }
    }

    // Close button inside each detail card
    orbitalNodes.addEventListener('click', (e) => {
      if (e.target.closest('.orbital-detail__close')) {
        e.stopPropagation();
        closeDetail();
      }
    });

    // Click outside to close
    orbitalStage.addEventListener('click', (e) => {
      if (e.target === orbitalStage) {
        closeDetail();
      }
    });

    // Auto-rotation loop
    function tick() {
      if (autoRotate) {
        rotation = (rotation + 0.15) % 360;
        updatePositions();
      }
      requestAnimationFrame(tick);
    }

    updatePositions();
    requestAnimationFrame(tick);
  }

  // --- Active nav link ---
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // --- Mobile gallery dots ---
  if (window.innerWidth <= 768) {
    document.querySelectorAll('.expand-gallery').forEach(function(gallery) {
      var items = gallery.querySelectorAll('.expand-gallery__item');
      if (items.length < 2) return;

      var dotsDiv = document.createElement('div');
      dotsDiv.className = 'gallery-dots';
      items.forEach(function(_, i) {
        var dot = document.createElement('button');
        dot.className = 'gallery-dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', function() {
          items[i].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        });
        dotsDiv.appendChild(dot);
      });
      gallery.parentNode.insertBefore(dotsDiv, gallery.nextSibling);

      gallery.addEventListener('scroll', function() {
        var scrollLeft = gallery.scrollLeft;
        var itemWidth = items[0].offsetWidth + 8;
        var active = Math.round(scrollLeft / itemWidth);
        dotsDiv.querySelectorAll('.gallery-dot').forEach(function(d, i) {
          d.classList.toggle('active', i === active);
        });
      }, { passive: true });
    });
  }

})();
