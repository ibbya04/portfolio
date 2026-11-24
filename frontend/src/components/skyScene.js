// Living sky, clouds, starry night, rolling green hills, and 24-hour time-of-day selector.

const ICON_SVG = {
  night: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
  morning: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2v8"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m8 6 4-4 4 4"/><path d="M16 18a4 4 0 0 0-8 0"/></svg>`,
  midday: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
  afternoon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 10V2"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m16 6-4 4-4-4"/><path d="M16 18a4 4 0 0 0-8 0"/></svg>`,
};

// Matches the 4-phase day cycle:
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

// Deterministic pseudo-random stars so layout is consistent across reloads
function buildStarsMarkup(count = 68) {
  let seed = 4219;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  const circles = [];
  for (let i = 0; i < count; i++) {
    const cx = (rand() * 98 + 1).toFixed(2);
    const cy = (rand() * 76 + 1).toFixed(2);
    const r = rand() > 0.68 ? '1.45' : '0.85';
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
    <div class="scene-sky-region">
      <!-- Base sky gradients (cross-faded smoothly per time of day) -->
      <div class="sky-layer sky-layer-midday"></div>
      <div class="sky-layer sky-layer-morning"></div>
      <div class="sky-layer sky-layer-afternoon"></div>
      <div class="sky-layer sky-layer-night"></div>

      <!-- Soft atmospheric sun/moon glow -->
      <div class="sky-celestial-glow"></div>

      <!-- Dreamy upper volumetric clouds -->
      <div class="sky-upper-clouds">
        <div class="cloud-veil cloud-veil-a"></div>
        <div class="cloud-veil cloud-veil-b"></div>
        <div class="cloud-veil cloud-veil-c"></div>
      </div>

      <!-- Night stars + shooting stars -->
      <svg class="hero-sky-stars" aria-hidden="true">${buildStarsMarkup(72)}</svg>
      <div class="hero-shooting-stars" id="sky-shooting-stars" aria-hidden="true"></div>

      <!-- Soft horizon atmospheric wash -->
      <div class="sky-horizon-glow"></div>

      <!-- Layered billowy cloud bank right where the sky meets the rolling hills -->
      <div class="cloud-bank-wrap">
        <svg class="cloud-bank cloud-bank-back" viewBox="0 0 1440 240" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <filter id="cloud-soft-back" x="-10%" y="-25%" width="120%" height="150%">
              <feGaussianBlur stdDeviation="10" />
            </filter>
            <linearGradient id="cloud-grad-back" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style="stop-color: var(--cloud-highlight)" stop-opacity="0.92" />
              <stop offset="68%" style="stop-color: var(--cloud-mid)" stop-opacity="0.88" />
              <stop offset="100%" style="stop-color: var(--cloud-shadow)" stop-opacity="0.82" />
            </linearGradient>
          </defs>
          <g filter="url(#cloud-soft-back)" fill="url(#cloud-grad-back)">
            <ellipse cx="60" cy="175" rx="165" ry="96" />
            <ellipse cx="235" cy="148" rx="185" ry="110" />
            <ellipse cx="445" cy="166" rx="170" ry="95" />
            <ellipse cx="655" cy="136" rx="205" ry="118" />
            <ellipse cx="890" cy="162" rx="190" ry="102" />
            <ellipse cx="1110" cy="142" rx="195" ry="112" />
            <ellipse cx="1340" cy="164" rx="185" ry="98" />
            <rect x="-40" y="168" width="1520" height="90" />
          </g>
        </svg>

        <svg class="cloud-bank cloud-bank-front" viewBox="0 0 1440 220" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <filter id="cloud-soft-front" x="-10%" y="-25%" width="120%" height="150%">
              <feGaussianBlur stdDeviation="6.5" />
            </filter>
            <linearGradient id="cloud-grad-front" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style="stop-color: var(--cloud-highlight)" stop-opacity="0.98" />
              <stop offset="58%" style="stop-color: var(--cloud-mid)" stop-opacity="0.95" />
              <stop offset="100%" style="stop-color: var(--cloud-shadow)" stop-opacity="0.9" />
            </linearGradient>
          </defs>
          <g filter="url(#cloud-soft-front)" fill="url(#cloud-grad-front)">
            <ellipse cx="115" cy="170" rx="150" ry="74" />
            <ellipse cx="320" cy="162" rx="165" ry="82" />
            <ellipse cx="535" cy="176" rx="160" ry="72" />
            <ellipse cx="755" cy="154" rx="180" ry="84" />
            <ellipse cx="990" cy="172" rx="170" ry="76" />
            <ellipse cx="1220" cy="158" rx="175" ry="82" />
            <ellipse cx="1410" cy="174" rx="135" ry="72" />
            <rect x="-40" y="174" width="1520" height="64" />
          </g>
        </svg>
      </div>
    </div>

    <!-- Ground / Rolling green hills directly beneath where the clouds end, extending to bottom of page -->
    <div class="scene-ground-region">
      <!-- Soft mist transition where clouds meet the distant ridge -->
      <div class="hill-mist-bridge"></div>

      <!-- Layered rolling hill silhouettes -->
      <svg class="hills-ridge-svg" viewBox="0 0 1440 340" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="hill-far-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style="stop-color: var(--hill-far-top)" />
            <stop offset="100%" style="stop-color: var(--hill-far-bottom)" />
          </linearGradient>
          <linearGradient id="hill-mid-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style="stop-color: var(--hill-mid-top)" />
            <stop offset="100%" style="stop-color: var(--hill-mid-bottom)" />
          </linearGradient>
          <linearGradient id="hill-near-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style="stop-color: var(--hill-near-top)" />
            <stop offset="48%" style="stop-color: var(--hill-near-mid)" />
            <stop offset="100%" style="stop-color: var(--hill-near-bottom)" />
          </linearGradient>
          <linearGradient id="hill-rim-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" style="stop-color: var(--hill-rim)" stop-opacity="0.18" />
            <stop offset="42%" style="stop-color: var(--hill-rim)" stop-opacity="0.65" />
            <stop offset="78%" style="stop-color: var(--hill-rim)" stop-opacity="0.35" />
            <stop offset="100%" style="stop-color: var(--hill-rim)" stop-opacity="0.14" />
          </linearGradient>
        </defs>

        <!-- Distant misty ridge -->
        <path
          d="M0 132 C210 62, 420 56, 675 112 C940 170, 1185 72, 1440 108 L1440 340 L0 340 Z"
          fill="url(#hill-far-grad)"
        />

        <!-- Midground rolling hill -->
        <path
          d="M0 178 C240 218, 495 104, 815 138 C1085 166, 1285 126, 1440 154 L1440 340 L0 340 Z"
          fill="url(#hill-mid-grad)"
        />

        <!-- Subtle sunlit / moonlit crest highlight on midground ridge -->
        <path
          d="M0 178 C240 218, 495 104, 815 138 C1085 166, 1285 126, 1440 154"
          fill="none"
          stroke="url(#hill-rim-grad)"
          stroke-width="2.5"
        />

        <!-- Foreground lush meadow hill -->
        <path
          d="M0 248 C310 178, 635 206, 945 248 C1175 278, 1325 232, 1440 218 L1440 340 L0 340 Z"
          fill="url(#hill-near-grad)"
        />

        <!-- Soft crest gleam on foreground hill -->
        <path
          d="M0 248 C310 178, 635 206, 945 248 C1175 278, 1325 232, 1440 218"
          fill="none"
          stroke="url(#hill-rim-grad)"
          stroke-width="2"
          opacity="0.7"
        />
      </svg>

      <!-- Rich meadow hillside extending all the way to the very bottom of the page -->
      <div class="hills-meadow-body">
        <!-- Gentle lower contour sweep for painterly depth -->
        <svg class="hills-lower-contour" viewBox="0 0 1440 260" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M0 96 C340 18, 680 152, 1080 78 C1260 44, 1365 62, 1440 84 L1440 260 L0 260 Z"
            style="fill: var(--hill-deep)"
            opacity="0.52"
          />
          <path
            d="M0 178 C420 112, 860 214, 1440 132 L1440 260 L0 260 Z"
            style="fill: var(--hill-deepest)"
            opacity="0.62"
          />
        </svg>
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
      const top = 6 + Math.random() * 44;
      const left = 12 + Math.random() * 68;
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

  // Sync sky height so the cloud bank ends cleanly right above/behind the Projects section
  // and the rolling green hills cover the entire lower half down to the very bottom.
  function syncHorizon() {
    const projectsEl = document.getElementById('projects');
    if (!backdrop || !projectsEl) return;
    const rect = projectsEl.getBoundingClientRect();
    const projectsTop = rect.top + window.scrollY;
    // Place the cloud bank bottom slightly into the top of Projects so the hill ridge rises gracefully
    const horizonPx = Math.max(540, Math.round(projectsTop + 36));
    document.documentElement.style.setProperty('--sky-horizon-y', `${horizonPx}px`);
  }

  syncHorizon();
  window.addEventListener('resize', syncHorizon, { passive: true });
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(syncHorizon);
    ro.observe(document.body);
  }

  // Time-of-day selector (same expanding frosted glass pill as vanshnagar.com)
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

    // Click/tap toggle for touch devices or quick pinning
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
