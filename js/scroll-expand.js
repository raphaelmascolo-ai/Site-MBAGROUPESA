/* ============================================
   Scroll-Expansion Hero — Companies Page
   Drives the --p custom property (0 → 1)
   based on scroll position within each .se-scroll
   ============================================ */
(function () {
  'use strict';

  var sections = document.querySelectorAll('.se-scroll');
  if (!sections.length) return;

  // Autoplay videos when they enter the viewport
  var videos = document.querySelectorAll('.se-media__video');
  videos.forEach(function (v) {
    v.muted = true;
    v.playsInline = true;
    v.loop = true;
    v.play().catch(function () {});
  });

  function update() {
    sections.forEach(function (scroll) {
      var rect = scroll.getBoundingClientRect();
      var stickyH = window.innerHeight;
      var scrollable = scroll.offsetHeight - stickyH;
      if (scrollable <= 0) return;

      var scrolled = -rect.top;
      var p = Math.max(0, Math.min(1, scrolled / scrollable));

      // Set --p on the sticky element so all children can use it
      var sticky = scroll.querySelector('.se-sticky');
      if (sticky) {
        sticky.style.setProperty('--p', p.toFixed(4));
      }

      // Also set on media and darken (for elements that need it)
      var media = scroll.querySelector('.se-media');
      if (media) {
        media.style.setProperty('--p', p.toFixed(4));
      }
    });

    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
})();
