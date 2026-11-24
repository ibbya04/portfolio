// Living full-page sky, rich drifting clouds, starry night, and a short bottom green field
// with a mountain rising on the right side behind the footer, plus 24-hour time-of-day selector.

const ICON_SVG = {
  night: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
  morning: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2v8"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m8 6 4-4 4 4"/><path d="M16 18a4 4 0 0 0-8 0"/></svg>`,
  midday: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
  afternoon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 10V2"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m16 6-4 4-4-4"/><path d="M16 18a4 4 0 0 0-8 0"/></svg>`,
};

// 4-phase day cycle:
// 21..23, 0..3 -> night | 4..11 -> morning | 12..15 -> midday | 16..20 -> afternoon
export function getSkyPhase(hour) {
  const h = ((Math.round(hour) % 24) + 24) % 24;
  if (h >= 4 && h <= 11) return 'morning';
  if (h >= 12 && h <= 15) return 'midday';
  if (h >= 16 && h <= 20) return 'afternoon';
  return 'night';
}

export function formatHour(hour) {
  const h = ((Math.round(hour) % 24) + 24) % 24;
  const period = h < 12 ? 'AM' : 'PM';
  const display = h % 12 === 0 ? 12 : h % 12;
  return { display: String(display), period, full: `${display} ${period}` };
}

// Deterministic pseudo-random stars across the sky above the bottom landscape
function buildStarsMarkup(count = 88) {
  let seed = 4219;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  const circles = [];
  for (let i = 0; i < count; i++) {
    const cx = (rand() * 98 + 1).toFixed(2);
    const cy = (rand() * 78 + 1).toFixed(2);
    const r = rand() > 0.7 ? '1.45' : '0.85';
    const twinkle = (2.6 + rand() * 4.4).toFixed(2);
    const delay = (-rand() * 7).toFixed(2);
    circles.push(
      `<circle cx="${cx}%" cy="${cy}%" r="${r}" fill="white" style="--twinkle:${twinkle}s;--delay:${delay}s" />`
    );
  }
  return circles.join('');
}

// Painterly multi-puff cumulus cloud SVG builder
function buildCumulusSvg(id, variant) {
  const puffs = {
    wide: `
      <ellipse cx="140" cy="128" rx="92" ry="44" />
      <ellipse cx="225" cy="96" rx="108" ry="62" />
      <ellipse cx="332" cy="108" rx="96" ry="52" />
      <ellipse cx="418" cy="132" rx="76" ry="38" />
      <rect x="86" y="122" width="350" height="44" rx="22" />
    `,
    tall: `
      <ellipse cx="116" cy="136" rx="74" ry="38" />
      <ellipse cx="190" cy="94" rx="92" ry="64" />
      <ellipse cx="274" cy="84" rx="84" ry="58" />
      <ellipse cx="344" cy="122" rx="78" ry="44" />
      <rect x="78" y="126" width="290" height="42" rx="21" />
    `,
    wisp: `
      <ellipse cx="136" cy="112" rx="94" ry="34" />
      <ellipse cx="242" cy="96" rx="116" ry="42" />
      <ellipse cx="352" cy="114" rx="88" ry="32" />
      <rect x="88" y="110" width="286" height="30" rx="15" />
    `,
  };

  return `
    <svg viewBox="0 0 520 190" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <filter id="blur-${id}" x="-18%" y="-24%" width="136%" height="148%">
          <feGaussianBlur stdDeviation="7.5" />
        </filter>
        <linearGradient id="grad-${id}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style="stop-color: var(--cloud-highlight)" stop-opacity="0.96" />
          <stop offset="62%" style="stop-color: var(--cloud-mid)" stop-opacity="0.9" />
          <stop offset="100%" style="stop-color: var(--cloud-shadow)" stop-opacity="0.78" />
        </linearGradient>
      </defs>
      <g filter="url(#blur-${id})" fill="url(#grad-${id})">
        ${puffs[variant] || puffs.wide}
      </g>
    </svg>
  `;
}

function buildSkyBackdropMarkup() {
  return `
    <!-- Full-page sky layers (extend behind the entire document) -->
    <div class="sky-canvas">
      <div class="sky-layer sky-layer-midday"></div>
      <div class="sky-layer sky-layer-morning"></div>
      <div class="sky-layer sky-layer-afternoon"></div>
      <div class="sky-layer sky-layer-night"></div>

      <!-- Soft atmospheric sun/moon glow -->
      <div class="sky-celestial-glow"></div>

      <!-- Night stars + shooting stars -->
      <svg class="hero-sky-stars" aria-hidden="true">${buildStarsMarkup(88)}</svg>
      <div class="hero-shooting-stars" id="sky-shooting-stars" aria-hidden="true"></div>

      <!-- Soft high-altitude atmospheric haze -->
      <div class="sky-upper-haze">
        <div class="cloud-veil cloud-veil-a"></div>
        <div class="cloud-veil cloud-veil-b"></div>
      </div>

      <!-- Layered drifting cumulus clouds across the sky -->
      <div class="sky-clouds-layer">
        <div class="cloud-puff cloud-puff-1">${buildCumulusSvg('c1', 'wide')}</div>
        <div class="cloud-puff cloud-puff-2">${buildCumulusSvg('c2', 'tall')}</div>
        <div class="cloud-puff cloud-puff-3">${buildCumulusSvg('c3', 'wisp')}</div>
        <div class="cloud-puff cloud-puff-4">${buildCumulusSvg('c4', 'wide')}</div>
        <div class="cloud-puff cloud-puff-5">${buildCumulusSvg('c5', 'tall')}</div>
        <div class="cloud-puff cloud-puff-6">${buildCumulusSvg('c6', 'wisp')}</div>
        <div class="cloud-puff cloud-puff-7">${buildCumulusSvg('c7', 'wide')}</div>
      </div>
    </div>

    <!-- Bottom Landscape: short green field strictly behind the footer + mountain rising on the right side -->
    <div class="scene-landscape">
      <!-- Mountain rising on the right side behind the field -->
      <div class="landscape-mountain-wrap">
        <svg
          class="landscape-mountain-svg"
          viewBox="0 0 760 440"
          preserveAspectRatio="xMaxYMax meet"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="mtn-far-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style="stop-color: var(--mtn-far-top)" />
              <stop offset="100%" style="stop-color: var(--mtn-far-bottom)" />
            </linearGradient>
            <linearGradient id="mtn-lit-grad" x1="0.2" y1="0" x2="0.8" y2="1">
              <stop offset="0%" style="stop-color: var(--mtn-lit-top)" />
              <stop offset="100%" style="stop-color: var(--mtn-lit-bottom)" />
            </linearGradient>
            <linearGradient id="mtn-shadow-grad" x1="0" y1="0" x2="0.4" y2="1">
              <stop offset="0%" style="stop-color: var(--mtn-shadow-top)" />
              <stop offset="100%" style="stop-color: var(--mtn-shadow-bottom)" />
            </linearGradient>
            <linearGradient id="mtn-peak-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style="stop-color: var(--mtn-peak)" stop-opacity="0.92" />
              <stop offset="100%" style="stop-color: var(--mtn-peak)" stop-opacity="0.18" />
            </linearGradient>
            <filter id="mtn-cloud-blur" x="-20%" y="-25%" width="140%" height="150%">
              <feGaussianBlur stdDeviation="8" />
            </filter>
          </defs>

          <!-- Distant secondary peak tucked slightly to the left -->
          <path
            d="M72 440 L256 226 C268 212 284 212 296 225 L476 440 Z"
            fill="url(#mtn-far-grad)"
          />

          <!-- Main mountain on the right side (sunlit left slope) -->
          <path
            d="M170 440 L482 104 C498 86 520 86 536 103 L760 338 L760 440 Z"
            fill="url(#mtn-lit-grad)"
          />

          <!-- Shaded right face split along a natural jagged ridge line -->
          <path
            d="M509 92 L536 103 L760 338 L760 440 L526 440 L554 342 L514 278 L538 206 L504 152 Z"
            fill="url(#mtn-shadow-grad)"
          />

          <!-- Soft snow / sunlit summit cap -->
          <path
            d="M447 142 L482 104 C498 86 520 86 536 103 L576 145 L546 156 L532 138 L509 152 L494 134 L468 152 Z"
            fill="url(#mtn-peak-grad)"
          />

          <!-- Wispy low cloud drifting softly across the mountain flank -->
          <g filter="url(#mtn-cloud-blur)" opacity="0.65">
            <ellipse cx="420" cy="282" rx="110" ry="22" style="fill: var(--cloud-highlight)" />
            <ellipse cx="525" cy="290" rx="84" ry="18" style="fill: var(--cloud-mid)" />
          </g>
        </svg>
      </div>

      <!-- Short green field strictly behind the thank-you footer -->
      <div class="landscape-field-wrap">
        <svg
          class="landscape-field-svg"
          viewBox="0 0 1440 220"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="field-back-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style="stop-color: var(--field-back-top)" />
              <stop offset="100%" style="stop-color: var(--field-back-bottom)" />
            </linearGradient>
            <linearGradient id="field-front-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style="stop-color: var(--field-front-top)" />
              <stop offset="55%" style="stop-color: var(--field-front-mid)" />
              <stop offset="100%" style="stop-color: var(--field-front-bottom)" />
            </linearGradient>
            <linearGradient id="field-rim-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" style="stop-color: var(--field-rim)" stop-opacity="0.22" />
              <stop offset="45%" style="stop-color: var(--field-rim)" stop-opacity="0.65" />
              <stop offset="100%" style="stop-color: var(--field-rim)" stop-opacity="0.2" />
            </linearGradient>
          </defs>

          <!-- Soft distant meadow rise -->
          <path
            d="M0 78 C320 42, 680 96, 1080 56 C1260 38, 1365 44, 1440 52 L1440 220 L0 220 Z"
            fill="url(#field-back-grad)"
          />

          <!-- Foreground green field spanning cleanly across the bottom -->
          <path
            d="M0 98 C360 72, 740 112, 1120 84 C1280 72, 1375 78, 1440 86 L1440 220 L0 220 Z"
            fill="url(#field-front-grad)"
          />

          <!-- Gentle sunlit / moonlit edge highlight along the field horizon -->
          <path
            d="M0 98 C360 72, 740 112, 1120 84 C1280 72, 1375 78, 1440 86"
            fill="none"
            stroke="url(#field-rim-grad)"
            stroke-width="2"
          />
        </svg>

        <!-- Solid lower meadow strip so the field fills flush to bottom: 0 -->
        <div class="landscape-field-base"></div>
      </div>
    </div>
  `;
}

function startShootingStars(container) {
  if (!container) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let timeoutId = null;

  function spawn() {
    if (
      document.documentElement.dataset.skyTime === 'night' &&
      !reducedMotion.matches &&
      document.visibilityState === 'visible'
    ) {
      const star = document.createElement('div');
      star.className = 'hero-shooting-star';
      const top = 5 + Math.random() * 48;
      const left = 10 + Math.random() * 68;
      const len = 70 + Math.random() * 65;
      const angle = 22 + Math.random() * 16;
      star.style.top = `${top}%`;
      star.style.left = `${left}%`;
      star.style.width = `${len}px`;
      star.style.setProperty('--angle', `${angle}deg`);
      container.appendChild(star);
      star.addEventListener('animationend', () => star.remove(), { once: true });
    }
    timeoutId = window.setTimeout(spawn, 3600 + Math.random() * 5200);
  }

  timeoutId = window.setTimeout(spawn, 1800);
  return () => window.clearTimeout(timeoutId);
}

export function initSkyScene() {
  const backdrop = document.getElementById('scene-backdrop');
  if (backdrop) {
    backdrop.innerHTML = buildSkyBackdropMarkup();
    startShootingStars(document.getElementById('sky-shooting-stars'));
  }

  // Keep the green ground short and bounded strictly behind the thank-you footer
  function syncGroundHeight() {
    const footerEl = document.getElementById('thank-you-footer');
    if (!footerEl) return;
    const footerRect = footerEl.getBoundingClientRect();
    const docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    const footerTopFromBottom = Math.round(docHeight - (footerRect.top + window.scrollY));
    // Ground ends right around the top edge of the thank-you graphic (never past the footer!)
    const groundHeight = Math.max(200, footerTopFromBottom + 26);
    document.documentElement.style.setProperty('--footer-ground-h', `${groundHeight}px`);
  }

  syncGroundHeight();
  window.addEventListener('resize', syncGroundHeight, { passive: true });
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(syncGroundHeight);
    ro.observe(document.body);
  }

  // Time-of-day selector (hover/focus/tap-expanding glass slider)
  const mount = document.getElementById('sky-time-mount');
  const realHour = new Date().getHours();
  let currentHour = realHour;

  const savedHour = window.sessionStorage.getItem('sky-hour');
  if (savedHour !== null && !Number.isNaN(Number(savedHour))) {
    currentHour = Math.max(0, Math.min(23, Number(savedHour)));
  }

  function applyHour(hour, save = false) {
    currentHour = Math.max(0, Math.min(23, Math.round(hour)));
    const phase = getSkyPhase(currentHour);
    const { display, period, full } = formatHour(currentHour);

    document.documentElement.dataset.skyTime = phase;
    document.documentElement.dataset.skyHour = String(currentHour);

    if (save) {
      window.sessionStorage.setItem('sky-hour', String(currentHour));
    }

    if (!mount) return;
    const hourNumEl = mount.querySelector('[data-sky-hour-num]');
    const periodEl = mount.querySelector('[data-sky-period]');
    const iconEl = mount.querySelector('[data-sky-icon]');
    const slider = mount.querySelector('.sky-time-slider');
    const nowDot = mount.querySelector('[data-sky-now-dot]');

    if (hourNumEl) hourNumEl.textContent = display;
    if (periodEl) periodEl.textContent = period;
    if (iconEl) iconEl.innerHTML = ICON_SVG[phase];
    if (slider) {
      slider.value = String(currentHour);
      slider.setAttribute('aria-valuetext', `${full}, ${phase}`);
    }
    if (nowDot) {
      nowDot.toggleAttribute('data-visible', currentHour !== realHour);
    }
  }

  if (mount) {
    const nowPct = (realHour / 23) * 100;
    const nowOffset = (realHour / 23 - 0.5) * 14;

    mount.innerHTML = `
      <div class="sky-time relative size-9 shrink-0" data-sky-control>
        <div class="sky-time-panel hero-glass absolute top-0 right-0 flex h-9 items-center justify-end overflow-hidden rounded-lg border">
          <div class="sky-time-body flex shrink-0 items-center gap-2.5 pl-3">
            <span aria-hidden="true" class="flex w-11 shrink-0 justify-end gap-1 text-xs font-medium whitespace-nowrap tabular-nums">
              <span data-sky-hour-num></span>
              <span data-sky-period></span>
            </span>
            <div class="relative flex items-center">
              <input
                type="range"
                min="0"
                max="23"
                step="1"
                value="${currentHour}"
                aria-label="Time of day"
                class="sky-time-slider w-24 sm:w-32"
              />
              <span
                data-sky-now-dot
                aria-hidden="true"
                title="Current local hour"
                class="sky-now-dot pointer-events-none absolute top-full mt-0.5 size-1 -translate-x-1/2 rounded-full transition-opacity duration-150"
                style="left: calc(${nowPct.toFixed(3)}% - ${nowOffset.toFixed(2)}px);"
              ></span>
            </div>
          </div>
          <button
            type="button"
            data-sky-toggle
            aria-label="Choose time of day"
            title="Time of day"
            class="grid size-9 shrink-0 cursor-pointer place-items-center outline-none"
          >
            <span data-sky-icon class="flex items-center justify-center"></span>
          </button>
        </div>
      </div>
    `;

    const control = mount.querySelector('[data-sky-control]');
    const slider = mount.querySelector('.sky-time-slider');
    const toggleBtn = mount.querySelector('[data-sky-toggle]');

    slider?.addEventListener('input', (e) => {
      applyHour(Number(e.target.value), true);
    });

    toggleBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = control.hasAttribute('data-pinned');
      if (isOpen) {
        control.removeAttribute('data-pinned');
      } else {
        control.setAttribute('data-pinned', '');
        slider?.focus({ preventScroll: true });
      }
    });

    document.addEventListener('click', (e) => {
      if (control && !control.contains(e.target)) {
        control.removeAttribute('data-pinned');
      }
    });
  }

  applyHour(currentHour, false);
}
