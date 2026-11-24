// Living full-page sky with one large, soft painterly cloud formation (inspired by vanshnagar.com),
// starry night sky, a low green field at the very bottom behind the footer, a right-side mountain,
// and the 24-hour expanding time-of-day selector.

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

// Deterministic pseudo-random stars across the sky
function buildStarsMarkup(count = 88) {
  let seed = 4219;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  const circles = [];
  for (let i = 0; i < count; i++) {
    const cx = (rand() * 98 + 1).toFixed(2);
    const cy = (rand() * 76 + 1).toFixed(2);
    const r = rand() > 0.7 ? '1.45' : '0.85';
    const twinkle = (2.6 + rand() * 4.4).toFixed(2);
    const delay = (-rand() * 7).toFixed(2);
    circles.push(
      `<circle cx="${cx}%" cy="${cy}%" r="${r}" fill="white" style="--twinkle:${twinkle}s;--delay:${delay}s" />`
    );
  }
  return circles.join('');
}

function buildSkyBackdropMarkup() {
  return `
    <!-- Full-page sky layers -->
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

      <!-- One large, ultra-soft painterly billowing cloud mass sweeping across the sky -->
      <div class="sky-giant-cloud-wrap">
        <svg
          class="sky-giant-cloud-svg"
          viewBox="0 0 1440 1200"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <filter id="giant-cloud-halo" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="46" />
            </filter>
            <filter id="giant-cloud-body" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="28" />
            </filter>
            <filter id="giant-cloud-crest" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="18" />
            </filter>
            <linearGradient id="giant-cloud-grad" x1="0.3" y1="0" x2="0.65" y2="1">
              <stop offset="0%" style="stop-color: var(--cloud-highlight)" stop-opacity="0.95" />
              <stop offset="48%" style="stop-color: var(--cloud-mid)" stop-opacity="0.88" />
              <stop offset="86%" style="stop-color: var(--cloud-shadow)" stop-opacity="0.72" />
              <stop offset="100%" style="stop-color: var(--cloud-shadow)" stop-opacity="0" />
            </linearGradient>
            <linearGradient id="giant-cloud-inner" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style="stop-color: var(--cloud-highlight)" stop-opacity="0.96" />
              <stop offset="70%" style="stop-color: var(--cloud-mid)" stop-opacity="0.68" />
              <stop offset="100%" style="stop-color: var(--cloud-mid)" stop-opacity="0" />
            </linearGradient>
          </defs>

          <!-- Layer 1: Wide dreamy atmospheric glow around the unified cloud mass -->
          <g filter="url(#giant-cloud-halo)" fill="url(#giant-cloud-grad)" opacity="0.72">
            <ellipse cx="190" cy="430" rx="340" ry="270" />
            <ellipse cx="470" cy="590" rx="410" ry="260" />
            <ellipse cx="870" cy="650" rx="440" ry="250" />
            <ellipse cx="1270" cy="540" rx="360" ry="265" />
            <ellipse cx="720" cy="830" rx="760" ry="240" />
          </g>

          <!-- Layer 2: Unified towering billowing cloud mass (swells left, sweeps across center, rises gently right) -->
          <g filter="url(#giant-cloud-body)" fill="url(#giant-cloud-grad)" opacity="0.9">
            <!-- Left towering billow (like vanshnagar.com's left sky plume) -->
            <ellipse cx="70" cy="240" rx="220" ry="185" />
            <ellipse cx="265" cy="360" rx="260" ry="215" />
            <ellipse cx="140" cy="520" rx="310" ry="220" />
            <!-- Sweeping central cloud body -->
            <ellipse cx="465" cy="560" rx="320" ry="225" />
            <ellipse cx="745" cy="625" rx="345" ry="215" />
            <!-- Right-side soft billow -->
            <ellipse cx="1055" cy="570" rx="310" ry="220" />
            <ellipse cx="1310" cy="465" rx="270" ry="225" />
            <ellipse cx="1390" cy="660" rx="280" ry="220" />
            <!-- Lower cohesive cloud bed fading smoothly toward the bottom horizon -->
            <ellipse cx="340" cy="790" rx="420" ry="210" />
            <ellipse cx="760" cy="835" rx="490" ry="215" />
            <ellipse cx="1180" cy="800" rx="410" ry="205" />
          </g>

          <!-- Layer 3: Soft luminous sunlit/moonlit upper billow crests for painterly volume -->
          <g filter="url(#giant-cloud-crest)" fill="url(#giant-cloud-inner)" opacity="0.68">
            <ellipse cx="240" cy="325" rx="185" ry="125" />
            <ellipse cx="445" cy="495" rx="225" ry="135" />
            <ellipse cx="730" cy="565" rx="235" ry="130" />
            <ellipse cx="1040" cy="510" rx="215" ry="130" />
            <ellipse cx="1285" cy="425" rx="185" ry="125" />
            <ellipse cx="640" cy="735" rx="390" ry="130" />
          </g>
        </svg>
      </div>
    </div>

    <!-- Bottom Landscape: very low green field at the bottom edge + mountain rising on the right side -->
    <div class="scene-landscape">
      <!-- Mountain rising on the right side behind the low green field -->
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
              <feGaussianBlur stdDeviation="10" />
            </filter>
          </defs>

          <!-- Distant secondary peak tucked slightly to the left -->
          <path
            d="M84 440 L262 240 C274 226 290 226 302 239 L476 440 Z"
            fill="url(#mtn-far-grad)"
          />

          <!-- Main mountain on the right side (sunlit left slope) -->
          <path
            d="M178 440 L486 118 C502 100 524 100 540 117 L760 342 L760 440 Z"
            fill="url(#mtn-lit-grad)"
          />

          <!-- Shaded right face split along a natural ridge line -->
          <path
            d="M513 106 L540 117 L760 342 L760 440 L530 440 L558 346 L518 282 L542 214 L508 162 Z"
            fill="url(#mtn-shadow-grad)"
          />

          <!-- Soft snow / sunlit summit cap -->
          <path
            d="M452 155 L486 118 C502 100 524 100 540 117 L578 158 L548 168 L535 151 L513 164 L498 147 L472 164 Z"
            fill="url(#mtn-peak-grad)"
          />

          <!-- Soft mist hugging the mountain flank -->
          <g filter="url(#mtn-cloud-blur)" opacity="0.58">
            <ellipse cx="430" cy="296" rx="115" ry="22" style="fill: var(--cloud-highlight)" />
            <ellipse cx="535" cy="304" rx="88" ry="18" style="fill: var(--cloud-mid)" />
          </g>
        </svg>
      </div>

      <!-- Very low green field hugging the bottom edge behind the lower footer -->
      <div class="landscape-field-wrap">
        <svg
          class="landscape-field-svg"
          viewBox="0 0 1440 140"
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
              <stop offset="60%" style="stop-color: var(--field-front-mid)" />
              <stop offset="100%" style="stop-color: var(--field-front-bottom)" />
            </linearGradient>
            <linearGradient id="field-rim-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" style="stop-color: var(--field-rim)" stop-opacity="0.22" />
              <stop offset="45%" style="stop-color: var(--field-rim)" stop-opacity="0.65" />
              <stop offset="100%" style="stop-color: var(--field-rim)" stop-opacity="0.2" />
            </linearGradient>
          </defs>

          <!-- Low distant meadow contour -->
          <path
            d="M0 44 C340 20, 700 58, 1100 30 C1270 18, 1370 24, 1440 30 L1440 140 L0 140 Z"
            fill="url(#field-back-grad)"
          />

          <!-- Low foreground green field -->
          <path
            d="M0 58 C380 38, 760 72, 1140 48 C1290 38, 1380 44, 1440 50 L1440 140 L0 140 Z"
            fill="url(#field-front-grad)"
          />

          <!-- Gentle rim light along the low field horizon -->
          <path
            d="M0 58 C380 38, 760 72, 1140 48 C1290 38, 1380 44, 1440 50"
            fill="none"
            stroke="url(#field-rim-grad)"
            stroke-width="1.8"
          />
        </svg>

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

  // Keep the green field very low at the bottom edge (roughly the bottom 40% of the footer)
  function syncGroundHeight() {
    const footerEl = document.getElementById('thank-you-footer');
    if (!footerEl) return;
    const footerRect = footerEl.getBoundingClientRect();
    const lowGround = Math.round(footerRect.height * 0.42);
    const groundHeight = Math.max(120, Math.min(180, lowGround));
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
