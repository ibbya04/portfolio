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

// Deterministic pseudo-random interactive stars across the sky
function buildStarsMarkup(count = 88) {
  let seed = 4219;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  const nodes = [];
  for (let i = 0; i < count; i++) {
    const cx = (rand() * 98 + 1).toFixed(2);
    const cy = (rand() * 76 + 1).toFixed(2);
    const r = rand() > 0.7 ? '1.55' : '0.95';
    const twinkle = (2.6 + rand() * 4.4).toFixed(2);
    const delay = (-rand() * 7).toFixed(2);
    nodes.push(
      `<g class="sky-star-node" data-cx="${cx}" data-cy="${cy}">` +
        `<circle class="star-hit" cx="${cx}%" cy="${cy}%" r="14" fill="transparent" />` +
        `<circle class="star-dot" cx="${cx}%" cy="${cy}%" r="${r}" fill="white" style="--twinkle:${twinkle}s;--delay:${delay}s" />` +
        `</g>`
    );
  }
  return nodes.join('');
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
      <svg class="hero-sky-stars" id="sky-stars-svg" aria-hidden="true">${buildStarsMarkup(88)}</svg>
      <div class="hero-shooting-stars" id="sky-shooting-stars" aria-hidden="true"></div>

      <!-- Larger, slimmer animated crescent moon in the top-right corner (glimmers on hover) -->
      <div class="sky-moon-wrap" aria-hidden="true">
        <div class="sky-moon-halo"></div>
        <svg
          class="sky-moon-svg"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="moon-body-grad" x1="0.15" y1="0.08" x2="0.85" y2="0.92">
              <stop offset="0%" stop-color="#fffef9" />
              <stop offset="52%" stop-color="#eaf1ff" />
              <stop offset="100%" stop-color="#c3d5f8" />
            </linearGradient>
            <linearGradient id="moon-glimmer-grad" x1="0" y1="0" x2="1" y2="0.35">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0" />
              <stop offset="42%" stop-color="#ffffff" stop-opacity="0.95" />
              <stop offset="58%" stop-color="#fef9c3" stop-opacity="0.9" />
              <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
            </linearGradient>
            <!-- Slim, delicate crescent silhouette -->
            <mask id="crescent-cut">
              <rect width="120" height="120" fill="white" />
              <circle cx="72" cy="50" r="41" fill="black" />
            </mask>
            <mask id="crescent-shape-only">
              <circle cx="58" cy="60" r="43" fill="white" mask="url(#crescent-cut)" />
            </mask>
          </defs>

          <!-- Crescent moon body -->
          <circle cx="58" cy="60" r="43" fill="url(#moon-body-grad)" mask="url(#crescent-cut)" />

          <!-- Luminous glimmer sheen band that sweeps across the crescent on hover -->
          <g mask="url(#crescent-shape-only)">
            <rect
              class="moon-glimmer-band"
              x="-70"
              y="-10"
              width="48"
              height="140"
              transform="rotate(24 60 60)"
              fill="url(#moon-glimmer-grad)"
            />
          </g>

          <!-- Companion twinkling starlight sparkles -->
          <path
            class="moon-sparkle moon-sparkle-1"
            d="M95 22 L96.8 26.8 L101.6 28.6 L96.8 30.4 L95 35.2 L93.2 30.4 L88.4 28.6 L93.2 26.8 Z"
            fill="#ffffff"
          />
          <path
            class="moon-sparkle moon-sparkle-2"
            d="M22 22 L23.2 25.2 L26.4 26.4 L23.2 27.6 L22 30.8 L20.8 27.6 L17.6 26.4 L20.8 25.2 Z"
            fill="#dbe7ff"
          />
          <path
            class="moon-sparkle moon-sparkle-3"
            d="M84 89 L85.3 92.5 L88.8 93.8 L85.3 95.1 L84 98.6 L82.7 95.1 L79.2 93.8 L82.7 92.5 Z"
            fill="#fef9c3"
          />
        </svg>
      </div>

      <!-- One large, ultra-soft painterly billowing cloud mass sweeping across the sky (filter-free gradients for 60fps mobile) -->
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
            <radialGradient id="giant-cloud-halo-grad" cx="50%" cy="46%" r="52%">
              <stop offset="0%" style="stop-color: var(--cloud-mid)" stop-opacity="0.62" />
              <stop offset="55%" style="stop-color: var(--cloud-shadow)" stop-opacity="0.32" />
              <stop offset="100%" style="stop-color: var(--cloud-shadow)" stop-opacity="0" />
            </radialGradient>
            <radialGradient id="giant-cloud-body-grad" cx="48%" cy="42%" r="54%">
              <stop offset="0%" style="stop-color: var(--cloud-highlight)" stop-opacity="0.82" />
              <stop offset="48%" style="stop-color: var(--cloud-mid)" stop-opacity="0.58" />
              <stop offset="78%" style="stop-color: var(--cloud-shadow)" stop-opacity="0.22" />
              <stop offset="100%" style="stop-color: var(--cloud-shadow)" stop-opacity="0" />
            </radialGradient>
            <radialGradient id="giant-cloud-crest-grad" cx="50%" cy="45%" r="52%">
              <stop offset="0%" style="stop-color: var(--cloud-highlight)" stop-opacity="0.72" />
              <stop offset="55%" style="stop-color: var(--cloud-mid)" stop-opacity="0.3" />
              <stop offset="100%" style="stop-color: var(--cloud-mid)" stop-opacity="0" />
            </radialGradient>
          </defs>

          <!-- Layer 1: Wide dreamy atmospheric glow around the unified cloud mass -->
          <g fill="url(#giant-cloud-halo-grad)">
            <ellipse cx="190" cy="430" rx="420" ry="340" />
            <ellipse cx="470" cy="590" rx="490" ry="330" />
            <ellipse cx="870" cy="650" rx="520" ry="320" />
            <ellipse cx="1270" cy="540" rx="440" ry="335" />
            <ellipse cx="720" cy="830" rx="840" ry="310" />
          </g>

          <!-- Layer 2: Unified towering billowing cloud mass (swells left, sweeps across center, rises gently right) -->
          <g fill="url(#giant-cloud-body-grad)">
            <!-- Left towering billow -->
            <ellipse cx="70" cy="240" rx="280" ry="235" />
            <ellipse cx="265" cy="360" rx="320" ry="265" />
            <ellipse cx="140" cy="520" rx="370" ry="270" />
            <!-- Sweeping central cloud body -->
            <ellipse cx="465" cy="560" rx="380" ry="275" />
            <ellipse cx="745" cy="625" rx="405" ry="265" />
            <!-- Right-side soft billow -->
            <ellipse cx="1055" cy="570" rx="370" ry="270" />
            <ellipse cx="1310" cy="465" rx="330" ry="275" />
            <ellipse cx="1390" cy="660" rx="340" ry="270" />
            <!-- Lower cohesive cloud bed fading smoothly toward the bottom horizon -->
            <ellipse cx="340" cy="790" rx="480" ry="260" />
            <ellipse cx="760" cy="835" rx="550" ry="265" />
            <ellipse cx="1180" cy="800" rx="470" ry="255" />
          </g>

          <!-- Layer 3: Soft luminous sunlit/moonlit upper billow crests for painterly volume -->
          <g fill="url(#giant-cloud-crest-grad)">
            <ellipse cx="240" cy="325" rx="235" ry="165" />
            <ellipse cx="445" cy="495" rx="275" ry="175" />
            <ellipse cx="730" cy="565" rx="285" ry="170" />
            <ellipse cx="1040" cy="510" rx="265" ry="170" />
            <ellipse cx="1285" cy="425" rx="235" ry="165" />
            <ellipse cx="640" cy="735" rx="440" ry="170" />
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
            <radialGradient id="mtn-mist-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style="stop-color: var(--cloud-highlight)" stop-opacity="0.52" />
              <stop offset="65%" style="stop-color: var(--cloud-mid)" stop-opacity="0.2" />
              <stop offset="100%" style="stop-color: var(--cloud-mid)" stop-opacity="0" />
            </radialGradient>
          </defs>

          <!-- Rugged, jagged multi-ridge alpine mountain silhouette (inspired by reference sketch) -->
          <!-- 1. Left outer shoulder ridge -->
          <path
            d="M12 440 L92 368 L142 326 L184 294 L224 252 L256 226 L282 206 L306 218 L342 252 L412 440 Z"
            fill="url(#mtn-far-grad)"
          />
          <!-- Left outer shoulder shadow facet -->
          <path
            d="M12 440 L92 368 L142 326 L184 294 L224 252 L256 226 L282 206 L262 248 L226 286 L180 332 L112 396 L64 440 Z"
            fill="url(#mtn-shadow-grad)"
            opacity="0.78"
          />

          <!-- 2. Main tall jagged central peak -->
          <path
            d="M238 440 L318 248 L354 202 L384 166 L412 154 L434 128 L466 84 L486 94 L506 122 L528 134 L554 176 L598 202 L642 254 L688 302 L732 342 L760 356 L760 440 Z"
            fill="url(#mtn-lit-grad)"
          />

          <!-- Main peak dramatic shadowed left crags & central spine -->
          <path
            d="M238 440 L318 248 L354 202 L384 166 L412 154 L434 128 L466 84 L452 138 L428 176 L414 218 L382 272 L346 322 L310 440 Z"
            fill="url(#mtn-shadow-grad)"
          />
          <!-- Secondary shadowed ravine crease down right-center of main peak -->
          <path
            d="M466 84 L486 94 L506 122 L528 134 L512 172 L488 214 L470 264 L432 312 L408 358 L442 288 L458 218 L474 152 Z"
            fill="url(#mtn-shadow-grad)"
            opacity="0.48"
          />

          <!-- Jagged summit snow / moonlight ridge highlights on main peak -->
          <path
            d="M466 84 L486 94 L506 122 L528 134 L544 160 L516 156 L498 182 L482 162 L462 192 L452 146 L466 84 Z"
            fill="url(#mtn-peak-grad)"
          />
          <path
            d="M412 154 L434 128 L466 84 L450 132 L432 156 L416 174 Z"
            fill="url(#mtn-peak-grad)"
            opacity="0.45"
          />

          <!-- 3. Foreground left-center jagged spur peak -->
          <path
            d="M158 440 L236 364 L288 306 L326 244 L344 252 L388 302 L426 324 L478 368 L536 440 Z"
            fill="url(#mtn-lit-grad)"
          />
          <path
            d="M158 440 L236 364 L288 306 L326 244 L318 286 L296 332 L264 378 L224 440 Z"
            fill="url(#mtn-shadow-grad)"
            opacity="0.9"
          />
          <path
            d="M326 244 L344 252 L388 302 L364 304 L342 276 L326 244 Z"
            fill="url(#mtn-peak-grad)"
            opacity="0.55"
          />

          <!-- 4. Foreground right-side rocky sub-ridge -->
          <path
            d="M416 440 L476 342 L522 292 L564 268 L596 248 L614 268 L658 318 L704 358 L760 392 L760 440 Z"
            fill="url(#mtn-lit-grad)"
          />
          <path
            d="M416 440 L476 342 L522 292 L564 268 L596 248 L576 294 L544 332 L512 378 L474 440 Z"
            fill="url(#mtn-shadow-grad)"
            opacity="0.88"
          />
          <!-- Craggy inner ridge highlight on right sub-ridge -->
          <path
            d="M596 248 L614 268 L658 318 L630 314 L608 282 L596 248 Z"
            fill="url(#mtn-peak-grad)"
            opacity="0.48"
          />

          <!-- Subtle mist hugging the lower mountain flank -->
          <g fill="url(#mtn-mist-grad)">
            <ellipse cx="430" cy="348" rx="155" ry="30" />
            <ellipse cx="555" cy="356" rx="125" ry="26" />
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

function spawnShootingStar(container, { top, left, len, angle, fromStar = false } = {}) {
  if (!container) return;
  const star = document.createElement('div');
  star.className = fromStar ? 'hero-shooting-star hero-shooting-star-launch' : 'hero-shooting-star';
  const y = top ?? 5 + Math.random() * 48;
  const x = left ?? 10 + Math.random() * 68;
  const width = len ?? 135 + Math.random() * 85;
  const deg = angle ?? 20 + Math.random() * 18;
  star.style.top = `${y}%`;
  star.style.left = `${x}%`;
  star.style.width = `${width}px`;
  star.style.setProperty('--angle', `${deg}deg`);
  container.appendChild(star);
  star.addEventListener('animationend', () => star.remove(), { once: true });
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
      spawnShootingStar(container);
    }
    timeoutId = window.setTimeout(spawn, 3600 + Math.random() * 5200);
  }

  timeoutId = window.setTimeout(spawn, 1800);
  return () => window.clearTimeout(timeoutId);
}

function initInteractiveStars(starsSvg, shootingContainer) {
  if (!starsSvg || !shootingContainer) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  starsSvg.querySelectorAll('.sky-star-node').forEach((node) => {
    node.addEventListener('pointerenter', () => {
      if (
        document.documentElement.dataset.skyTime !== 'night' ||
        node.hasAttribute('data-shot') ||
        reducedMotion.matches
      ) {
        return;
      }

      const cx = Number(node.dataset.cx);
      const cy = Number(node.dataset.cy);
      node.setAttribute('data-shot', 'true');

      // Shoot across the sky right from the hovered star's position
      const angle = cx > 72 ? 148 + Math.random() * 18 : 16 + Math.random() * 24;
      spawnShootingStar(shootingContainer, {
        top: cy,
        left: cx,
        len: 150 + Math.random() * 80,
        angle,
        fromStar: true,
      });

      window.setTimeout(() => {
        node.removeAttribute('data-shot');
      }, 3400);
    });
  });
}

function initCloudCurtain() {
  const curtain = document.getElementById('cloud-curtain');
  const brandSvg = document.getElementById('brand-i-svg');
  const brandMark = document.getElementById('nav-brand-mark');
  const stemReveal = document.getElementById('brand-i-stem-reveal');
  const stemFill = document.getElementById('brand-i-stem-fill');
  const brandDot = document.getElementById('brand-i-dot');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let drawRafId = null;
  let isDrawing = false;

  const totalStemLength = stemReveal ? Math.ceil(stemReveal.getTotalLength()) + 2 : 120;

  function setBrandMarkComplete() {
    if (drawRafId !== null) {
      cancelAnimationFrame(drawRafId);
      drawRafId = null;
    }
    isDrawing = false;
    if (stemReveal) {
      stemReveal.style.strokeDasharray = `${totalStemLength} ${totalStemLength}`;
      stemReveal.style.strokeDashoffset = '0';
    }
    if (stemFill) {
      stemFill.style.opacity = '1';
    }
    if (brandDot) {
      brandDot.style.opacity = '1';
      brandDot.style.transform = 'scale(1) translateY(0px)';
    }
    brandSvg?.classList.add('is-drawn');
  }

  function easeOutCubic(t) {
    return 1 - (1 - t) ** 3;
  }

  function easeOutBack(t) {
    const c1 = 1.9;
    const c3 = c1 + 1;
    return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
  }

  // JS-driven rAF animation avoids Safari/iOS WebKit's bug where CSS keyframes
  // animating stroke-dashoffset inside an SVG <mask> fail to repaint.
  function drawBrandMark() {
    if (!brandSvg || !stemReveal || !brandDot || isDrawing) return;
    isDrawing = true;

    const stemDuration = 850;
    const dotDelay = 680;
    const dotDuration = 320;
    const totalDuration = dotDelay + dotDuration;

    stemReveal.style.strokeDasharray = `0 ${totalStemLength}`;
    stemReveal.style.strokeDashoffset = '0';
    brandDot.style.opacity = '0';
    brandDot.style.transform = 'scale(0.35) translateY(-4px)';

    const startTime = performance.now();

    function frame(now) {
      const elapsed = now - startTime;

      const stemT = Math.min(1, elapsed / stemDuration);
      const easedStem = easeOutCubic(stemT);
      const drawn = (easedStem * totalStemLength).toFixed(2);
      stemReveal.style.strokeDasharray = `${drawn} ${totalStemLength}`;
      // Subtle opacity nudge guarantees WebKit invalidates the masked stem every frame
      if (stemFill) {
        stemFill.style.opacity = stemT < 1 ? (0.998 + (stemT % 0.002)).toFixed(4) : '1';
      }

      if (elapsed >= dotDelay) {
        const dotT = Math.min(1, (elapsed - dotDelay) / dotDuration);
        const scale = 0.35 + 0.65 * easeOutBack(dotT);
        const ty = -4 * (1 - easeOutCubic(dotT));
        brandDot.style.opacity = String(Math.min(1, dotT * 1.4));
        brandDot.style.transform = `scale(${scale.toFixed(3)}) translateY(${ty.toFixed(2)}px)`;
      }

      if (elapsed < totalDuration) {
        drawRafId = requestAnimationFrame(frame);
      } else {
        setBrandMarkComplete();
      }
    }

    drawRafId = requestAnimationFrame(frame);
  }

  brandMark?.addEventListener('pointerenter', (e) => {
    if (e.pointerType !== 'touch' && !reducedMotion.matches) {
      drawBrandMark();
    }
  });

  brandMark?.addEventListener('click', () => {
    if (!reducedMotion.matches) {
      drawBrandMark();
    }
  });

  if (!curtain) {
    if (reducedMotion.matches) {
      setBrandMarkComplete();
    } else {
      drawBrandMark();
    }
    return;
  }

  if (reducedMotion.matches) {
    curtain.remove();
    setBrandMarkComplete();
    return;
  }

  // Trigger parting animation on the next animation frame after first paint
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      curtain.classList.add('is-parting');
    });
  });

  // Draw the brush-stroke 'i' right as the clouds open up over the header
  window.setTimeout(() => {
    drawBrandMark();
  }, 550);

  // Remove curtain only after its slowest transition has completely finished (prevents any visible jump)
  let removed = false;
  const cleanupCurtain = () => {
    if (removed) return;
    removed = true;
    curtain.remove();
  };

  const leftCloud = curtain.querySelector('.curtain-cloud-left');
  leftCloud?.addEventListener(
    'transitionend',
    (e) => {
      if (e.propertyName === 'transform') {
        cleanupCurtain();
      }
    },
    { once: true }
  );

  // Safety fallback in case tab was backgrounded during load
  window.setTimeout(cleanupCurtain, 2800);
}

export function initSkyScene() {
  initCloudCurtain();

  const backdrop = document.getElementById('scene-backdrop');
  if (backdrop) {
    backdrop.innerHTML = buildSkyBackdropMarkup();
    const shootingContainer = document.getElementById('sky-shooting-stars');
    startShootingStars(shootingContainer);
    initInteractiveStars(document.getElementById('sky-stars-svg'), shootingContainer);
  }

  // Keep the green field low and cleanly below the "THANK YOU" footer
  function syncGroundHeight() {
    const footerEl = document.getElementById('thank-you-footer');
    if (!footerEl) return;
    const footerRect = footerEl.getBoundingClientRect();
    const docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    const spaceBelowThankYou = Math.round(docHeight - (footerRect.bottom + window.scrollY));
    // Keep the field horizon cleanly below the "Have a nice day" tagline
    const groundHeight = Math.max(105, Math.min(165, spaceBelowThankYou - 8));
    document.documentElement.style.setProperty('--footer-ground-h', `${groundHeight}px`);
  }

  syncGroundHeight();
  window.addEventListener('resize', syncGroundHeight, { passive: true });
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(syncGroundHeight);
    ro.observe(document.body);
  }

  // Time-of-day selector — defaults to night mode (10 PM) unless user chose another hour this session
  const mount = document.getElementById('sky-time-mount');
  const realHour = new Date().getHours();
  let currentHour = 22;

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
