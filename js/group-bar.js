/* ============================================
   MBA Groupe SA — Group Bar Component
   Bandeau haut + Footer groupe partagé

   Usage (sur n'importe quel site du groupe) :
   <script src="https://www.mbagroupe.ch/js/group-bar.js"></script>
   ============================================ */

(function () {
  'use strict';

  const GROUP_COMPANIES = [
    { name: 'MBA Groupe SA', url: '#', parent: true },
    { name: 'MBA Construction SA', url: '#' },
    { name: 'ASV Construction Générale SA', url: '#' },
    { name: 'MBA Immobilier SA', url: '#' },
    { name: 'ASV Color SA', url: '#' },
    { name: 'ASV Fenêtres et Portes SA', url: '#' },
    { name: 'Les Praz Prins SA', url: '#' }
  ];

  const ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 182.23 299.63" style="height:16px;width:auto;vertical-align:middle;"><path fill="#636363" d="M105.73,257.64c-8.05,5.55-17.79,8.81-28.31,8.81-5.42,0-10.64-.86-15.53-2.46-3.16-1.03-6.17-2.49-9.05-4.14l-3.34-1.92L0,229.56v33.46l49.65,28.46,3.2,1.83c2.76,1.58,5.64,2.98,8.66,3.96,4.68,1.53,9.67,2.35,14.86,2.35,11.07,0,21.25-3.77,29.36-10.08v-31.91Z"/><path fill="#636363" d="M52.85,235.54c2.76,1.58,5.64,2.98,8.66,3.96,4.68,1.53,9.67,2.35,14.86,2.35,11.07,0,21.25-3.77,29.36-10.08v-31.91c-8.05,5.55-17.79,8.81-28.31,8.81-5.42,0-10.64-.86-15.53-2.46-3.16-1.03-6.17-2.49-9.05-4.14l-3.34-1.92L0,171.79v33.46l49.65,28.46,3.2,1.83Z"/><path fill="#fdd900" d="M182.23,0L0,65.83v48.19h0v33.46l49.65,28.46,3.2,1.83c2.76,1.58,5.64,2.98,8.66,3.96,4.68,1.53,9.67,2.35,14.86,2.35,11.07,0,21.25-3.77,29.36-10.08v-31.91c-8.05,5.55-17.79,8.81-28.31,8.81-5.42,0-10.64-.86-15.53-2.46-3.16-1.03-6.17-2.49-9.05-4.14l-3.34-1.92L6.2,117.57l20.68-9.79v-23.09l128.47-46.41v261.34h26.88V0Z"/></svg>';

  // Detect if we're on the MBA Groupe SA site itself
  const isGroupSite = document.querySelector('meta[name="site-id"]')?.content === 'mba-groupe';

  // Skip group bar on pages with hero (index page) to avoid overlap with fixed header
  const hasHero = document.querySelector('.hero-video-section') || document.querySelector('.hero');
  const skipGroupBar = hasHero;

  // --- Inject Group Top Bar ---
  function createGroupBar() {
    const bar = document.createElement('div');
    bar.className = 'group-bar';
    bar.setAttribute('role', 'navigation');
    bar.setAttribute('aria-label', 'Navigation du groupe MBA');

    const linksHTML = GROUP_COMPANIES
      .filter(c => !c.parent)
      .map(c => `<a href="${c.url}">${c.name}</a>`)
      .join('');

    const labelText = isGroupSite
      ? 'MBA Groupe SA'
      : 'Une société de MBA Groupe SA';

    bar.innerHTML = `
      <div class="container" style="width:90%;max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;">
        <div class="group-bar__label" style="display:flex;align-items:center;gap:8px;">
          ${ICON_SVG}
          <span>${labelText}</span>
        </div>
        <div class="group-bar__links" style="display:flex;gap:16px;">
          ${linksHTML}
        </div>
      </div>
    `;

    // Inline styles for standalone usage
    bar.style.cssText = 'background:#1a1a1a;padding:6px 0;font-size:0.75rem;color:rgba(255,255,255,0.7);';
    bar.querySelectorAll('.group-bar__links a').forEach(a => {
      a.style.cssText = 'color:rgba(255,255,255,0.5);font-size:0.7rem;text-decoration:none;transition:color 0.3s;';
      a.addEventListener('mouseenter', () => a.style.color = '#FDD900');
      a.addEventListener('mouseleave', () => a.style.color = 'rgba(255,255,255,0.5)');
    });

    document.body.insertBefore(bar, document.body.firstChild);
  }

  // --- Inject Group Footer Section ---
  function createGroupFooter() {
    const existingFooter = document.querySelector('.site-footer');
    if (!existingFooter) return;

    // Check if group footer already exists
    if (existingFooter.querySelector('.footer-group')) return;

    const groupSection = document.createElement('div');
    groupSection.className = 'footer-group';
    groupSection.innerHTML = `
      <div class="container" style="width:90%;max-width:1200px;margin:0 auto;">
        <p class="footer-group__title">Les sociétés du groupe</p>
        <div class="footer-group__logos" style="display:flex;justify-content:center;flex-wrap:wrap;gap:32px;">
          ${GROUP_COMPANIES.map(c =>
            `<a href="${c.url}" style="font-size:0.8rem;color:rgba(255,255,255,0.4);text-decoration:none;font-weight:500;letter-spacing:0.03em;transition:color 0.3s;">${c.name}</a>`
          ).join('')}
        </div>
      </div>
    `;

    groupSection.style.cssText = 'border-top:1px solid rgba(255,255,255,0.1);padding:40px 0;';

    const footerBottom = existingFooter.querySelector('.footer-bottom');
    if (footerBottom) {
      existingFooter.insertBefore(groupSection, footerBottom);
    } else {
      existingFooter.appendChild(groupSection);
    }

    // Hover effects
    groupSection.querySelectorAll('a').forEach(a => {
      a.addEventListener('mouseenter', () => a.style.color = '#FDD900');
      a.addEventListener('mouseleave', () => a.style.color = 'rgba(255,255,255,0.4)');
    });
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (!skipGroupBar) createGroupBar();
      createGroupFooter();
    });
  } else {
    if (!skipGroupBar) createGroupBar();
    createGroupFooter();
  }

})();
