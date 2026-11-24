// Iconic "THANK YOU / Have a nice day" bodega-bag pixel graphic + "Stop it between the arrows" minigame
// Inspired by mattrothenberg.com

// 8x11 chunky 2-pixel-stroke uppercase bitmaps for T, H, A, N, K, Y, O, U
const BIG_FONT = {
  T: [
    '11111111',
    '11111111',
    '00011000',
    '00011000',
    '00011000',
    '00011000',
    '00011000',
    '00011000',
    '00011000',
    '00011000',
    '00011000',
  ],
  H: [
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '11111111',
    '11111111',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
  ],
  A: [
    '00111100',
    '01111110',
    '11100111',
    '11000011',
    '11000011',
    '11111111',
    '11111111',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
  ],
  N: [
    '11000011',
    '11100011',
    '11110011',
    '11110011',
    '11011011',
    '11011011',
    '11001111',
    '11001111',
    '11000111',
    '11000011',
    '11000011',
  ],
  K: [
    '11000011',
    '11000111',
    '11001110',
    '11011100',
    '11111000',
    '11110000',
    '11111000',
    '11011100',
    '11001110',
    '11000111',
    '11000011',
  ],
  Y: [
    '11000011',
    '11000011',
    '01100110',
    '01100110',
    '00111100',
    '00011000',
    '00011000',
    '00011000',
    '00011000',
    '00011000',
    '00011000',
  ],
  O: [
    '00111100',
    '01111110',
    '11100111',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '11100111',
    '01111110',
    '00111100',
  ],
  U: [
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '11100111',
    '01111110',
    '00111100',
  ],
};

// Crisp 5x7 pixel font for "Have a nice day"
const SMALL_FONT = {
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  a: ['00000', '00000', '01110', '00001', '01111', '10001', '01111'],
  v: ['00000', '00000', '10001', '10001', '10001', '01010', '00100'],
  e: ['00000', '00000', '01110', '10001', '11111', '10000', '01110'],
  n: ['00000', '00000', '10110', '11001', '10001', '10001', '10001'],
  i: ['010', '000', '010', '010', '010', '010', '010'],
  c: ['00000', '00000', '01110', '10000', '10000', '10001', '01110'],
  d: ['00001', '00001', '01101', '10011', '10001', '10001', '01111'],
  y: ['00000', '00000', '10001', '10001', '01111', '00001', '01110'],
  ' ': ['000', '000', '000', '000', '000', '000', '000'],
};

function buildWordPaths(word, cellSize, letterGapCols, spaceGapCols) {
  let colOffset = 0;
  const solidParts = [];
  const outlineParts = [];

  for (let idx = 0; idx < word.length; idx++) {
    const ch = word[idx];
    if (ch === ' ') {
      colOffset += spaceGapCols;
      continue;
    }
    const bitmap = BIG_FONT[ch];
    if (!bitmap) continue;

    const rows = bitmap.length;
    const cols = bitmap[0].length;
    const isOn = (r, c) => r >= 0 && r < rows && c >= 0 && c < cols && bitmap[r][c] === '1';

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!isOn(r, c)) continue;
        const x = (colOffset + c) * cellSize;
        const y = r * cellSize;
        const x2 = x + cellSize;
        const y2 = y + cellSize;

        // Solid cell
        solidParts.push(`M${x.toFixed(2)} ${y.toFixed(2)}h${cellSize.toFixed(2)}v${cellSize.toFixed(2)}h-${cellSize.toFixed(2)}Z`);

        // Perimeter-only outline segments (crisp stepped edges, zero internal grid seams)
        if (!isOn(r - 1, c)) outlineParts.push(`M${x.toFixed(2)} ${y.toFixed(2)}H${x2.toFixed(2)}`);
        if (!isOn(r + 1, c)) outlineParts.push(`M${x.toFixed(2)} ${y2.toFixed(2)}H${x2.toFixed(2)}`);
        if (!isOn(r, c - 1)) outlineParts.push(`M${x.toFixed(2)} ${y.toFixed(2)}V${y2.toFixed(2)}`);
        if (!isOn(r, c + 1)) outlineParts.push(`M${x2.toFixed(2)} ${y.toFixed(2)}V${y2.toFixed(2)}`);
      }
    }

    colOffset += cols;
    if (idx < word.length - 1 && word[idx + 1] !== ' ') {
      colOffset += letterGapCols;
    }
  }

  return {
    solidPath: solidParts.join(''),
    outlinePath: outlineParts.join(''),
    totalWidth: colOffset * cellSize,
  };
}

function buildTaglinePath(text, startX, startY, unit) {
  let cursorX = startX;
  const parts = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const glyph = SMALL_FONT[ch];
    if (!glyph) continue;
    const cols = glyph[0].length;
    for (let r = 0; r < glyph.length; r++) {
      for (let c = 0; c < cols; c++) {
        if (glyph[r][c] === '1') {
          const x = cursorX + c * unit;
          const y = startY + r * unit;
          parts.push(`M${x.toFixed(2)} ${y.toFixed(2)}h${unit.toFixed(2)}v${unit.toFixed(2)}h-${unit.toFixed(2)}Z`);
        }
      }
    }
    cursorX += (cols + 1) * unit;
  }

  return parts.join('');
}

function measureTaglineWidth(text, unit) {
  let cols = 0;
  for (let i = 0; i < text.length; i++) {
    const glyph = SMALL_FONT[text[i]];
    if (!glyph) continue;
    cols += glyph[0].length + 1;
  }
  return Math.max(0, (cols - 1) * unit);
}

export function initThankYouFooter() {
  const container = document.getElementById('thank-you-footer');
  if (!container) return;

  const cellSize = 6.75;
  const { solidPath, outlinePath, totalWidth } = buildWordPaths('THANK YOU', cellSize, 1.35, 5.2);
  const rowPitch = 80;
  const rowHeight = 11 * cellSize; // 74.25
  const viewBoxWidth = Math.ceil(totalWidth);
  const viewBoxHeight = 436;

  const taglineText = 'Have a nice day';
  const taglineUnit = 2.45;
  const taglineW = measureTaglineWidth(taglineText, taglineUnit);
  const taglineX = totalWidth - taglineW;
  const taglineY = 412;
  const taglinePath = buildTaglinePath(taglineText, taglineX, taglineY, taglineUnit);

  const rowsMarkup = [0, 1, 2, 3, 4]
    .map(
      (idx) => `
      <g class="bag-row" data-row="${idx}" ${idx === 2 ? 'data-on=""' : ''} transform="translate(0 ${idx * rowPitch})">
        <path class="bag-outline" d="${outlinePath}" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="square" />
        <path class="bag-solid" d="${solidPath}" fill="currentColor" />
      </g>`
    )
    .join('');

  // Stepped pixel triangles aligned vertically with row 2 (center y = 2 * 80 + 37.1 = 197.1)
  const arrowY = 2 * rowPitch + rowHeight / 2;
  const u = 5.2;
  const leftArrowX = -24;
  const rightArrowX = totalWidth + 24;

  const leftArrowPath = [
    `M${leftArrowX} ${arrowY - u * 0.5}h${u}v${u}h-${u}Z`,
    `M${leftArrowX - u} ${arrowY - u * 1.5}h${u}v${u * 3}h-${u}Z`,
    `M${leftArrowX - u * 2} ${arrowY - u * 2.5}h${u}v${u * 5}h-${u}Z`,
    `M${leftArrowX - u * 3} ${arrowY - u * 3.5}h${u}v${u * 7}h-${u}Z`,
  ].join('');

  const rightArrowPath = [
    `M${rightArrowX - u} ${arrowY - u * 0.5}h${u}v${u}h-${u}Z`,
    `M${rightArrowX} ${arrowY - u * 1.5}h${u}v${u * 3}h-${u}Z`,
    `M${rightArrowX + u} ${arrowY - u * 2.5}h${u}v${u * 5}h-${u}Z`,
    `M${rightArrowX + u * 2} ${arrowY - u * 3.5}h${u}v${u * 7}h-${u}Z`,
  ].join('');

  container.innerHTML = `
    <div data-bag-game="" class="bag-game group relative mx-auto w-full max-w-[440px]">
      <svg
        data-bag=""
        viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}"
        fill="currentColor"
        overflow="visible"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Thank you. Have a nice day."
        class="block h-auto w-full select-none"
      >
        ${rowsMarkup}
        <g aria-hidden="true">
          <path d="${taglinePath}" fill="currentColor" />
        </g>
        <g aria-hidden="true" class="bag-arrows max-md:hidden opacity-45 transition-opacity duration-200">
          <path class="bag-arrow-left" d="${leftArrowPath}" />
          <path class="bag-arrow-right" d="${rightArrowPath}" />
        </g>
        <g data-confetti="" aria-hidden="true"></g>
      </svg>

      <!-- Minigame controls aligned with the tagline row on desktop -->
      <div
        class="absolute left-0 hidden items-center gap-2.5 md:flex"
        style="bottom: 1.5%; transform: translateY(15%);"
      >
        <button
          type="button"
          data-bag-play=""
          aria-label="Play Stop it between the arrows"
          class="bag-play-btn grid size-7 shrink-0 cursor-pointer place-items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2"
        >
          <svg viewBox="0 0 6 6" class="bag-icon-play size-3" fill="currentColor" shape-rendering="crispEdges" aria-hidden="true">
            <path d="M2 0h1v6H2zM3 1h1v4H3zM4 2h1v2H4z"></path>
          </svg>
          <svg viewBox="0 0 6 6" class="bag-icon-stop hidden size-3" fill="currentColor" shape-rendering="crispEdges" aria-hidden="true">
            <path d="M1 1h4v4H1z"></path>
          </svg>
        </button>
        <p class="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-wider leading-none">
          <span data-bag-message="" class="opacity-65">Stop it between the arrows</span>
          <span data-bag-score="" aria-live="polite" class="font-semibold empty:hidden"></span>
        </p>
      </div>
    </div>
  `;

  // Minigame logic: loops solid row across 0..4; stop it on row 2!
  const gameEl = container.querySelector('[data-bag-game]');
  const svgEl = container.querySelector('[data-bag]');
  const rows = Array.from(container.querySelectorAll('.bag-row'));
  const playBtn = container.querySelector('[data-bag-play]');
  const messageEl = container.querySelector('[data-bag-message]');
  const scoreEl = container.querySelector('[data-bag-score]');
  const confettiLayer = container.querySelector('[data-confetti]');

  let activeRow = 2;
  let direction = 1;
  let playing = false;
  let timerId = null;
  let streak = 0;

  function setRow(idx) {
    activeRow = idx;
    rows.forEach((row, i) => {
      if (i === idx) {
        row.setAttribute('data-on', '');
      } else {
        row.removeAttribute('data-on');
      }
    });
  }

  function spawnConfetti() {
    if (!confettiLayer) return;
    confettiLayer.innerHTML = '';
    const colors = ['#ffffff', '#fef08a', '#86efac', '#fbcfe8', '#bfdbfe'];
    const cx = viewBoxWidth / 2;
    const cy = arrowY;
    for (let i = 0; i < 24; i++) {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      const angle = (Math.PI * 2 * i) / 24 + (Math.random() - 0.5) * 0.25;
      const dist = 65 + Math.random() * 145;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist - 28;
      const size = 4 + Math.random() * 4;
      rect.setAttribute('x', String(cx));
      rect.setAttribute('y', String(cy));
      rect.setAttribute('width', String(size.toFixed(1)));
      rect.setAttribute('height', String(size.toFixed(1)));
      rect.setAttribute('fill', colors[i % colors.length]);
      rect.classList.add('bag-confetti-piece');
      rect.style.setProperty('--dx', `${dx.toFixed(1)}px`);
      rect.style.setProperty('--dy', `${dy.toFixed(1)}px`);
      confettiLayer.appendChild(rect);
    }
    window.setTimeout(() => {
      if (confettiLayer) confettiLayer.innerHTML = '';
    }, 950);
  }

  function startGame() {
    playing = true;
    gameEl.setAttribute('data-playing', '');
    svgEl.removeAttribute('data-result');
    playBtn.setAttribute('aria-label', 'Stop');
    messageEl.textContent = 'Stop it between the arrows';

    // Speed up slightly with higher streaks for fun replayability
    const intervalMs = Math.max(72, 118 - streak * 8);
    setRow(0);
    direction = 1;

    timerId = window.setInterval(() => {
      let next = activeRow + direction;
      if (next >= rows.length) {
        direction = -1;
        next = rows.length - 2;
      } else if (next < 0) {
        direction = 1;
        next = 1;
      }
      setRow(next);
    }, intervalMs);
  }

  function stopGame() {
    playing = false;
    window.clearInterval(timerId);
    timerId = null;
    gameEl.removeAttribute('data-playing');
    playBtn.setAttribute('aria-label', 'Play again');

    const won = activeRow === 2;
    svgEl.setAttribute('data-result', won ? 'win' : 'miss');

    if (won) {
      streak += 1;
      messageEl.textContent = streak > 1 ? 'Nailed it!' : 'Nice!';
      scoreEl.textContent = `${streak}x`;
      spawnConfetti();
    } else {
      streak = 0;
      messageEl.textContent = Math.abs(activeRow - 2) === 1 ? 'So close — try again' : 'Missed — try again';
      scoreEl.textContent = '';
    }
  }

  playBtn?.addEventListener('click', () => {
    if (playing) {
      stopGame();
    } else {
      startGame();
    }
  });
}
