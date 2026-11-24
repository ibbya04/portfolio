import './style.css';
import { profile } from './data/profile.js';
import { initSkyScene } from './components/skyScene.js';
import { initThankYouFooter } from './components/thankYouFooter.js';

const SOCIAL_ICONS = {
  github: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>`,
  linkedin: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>`,
  email: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
};

const ACTION_ICONS = {
  github: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>`,
  blog: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>`,
  live: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>`,
};

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function isValidUrl(url) {
  return Boolean(url && url.trim() && url.trim() !== '#');
}

function createActionLink(href, label, iconSvg, variantClass) {
  const a = el(
    'a',
    `inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${variantClass}`
  );
  a.href = href;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.innerHTML = `<span>${label}</span>${iconSvg}`;
  return a;
}

function renderProfile() {
  document.title = `${profile.name} — Portfolio`;

  const nameEl = document.getElementById('profile-name');
  if (nameEl) nameEl.textContent = `Hi, I'm ${profile.name}`;

  const summaryEl = document.getElementById('profile-summary');
  if (summaryEl) summaryEl.textContent = profile.summary;

  // Header social glass icon buttons
  const socialLinksEl = document.getElementById('social-links');
  if (socialLinksEl) {
    profile.links.forEach((link) => {
      const a = el(
        'a',
        'hero-glass inline-flex size-9 items-center justify-center rounded-lg border outline-none focus-visible:ring-2 focus-visible:ring-indigo-400'
      );
      a.href = link.href;
      a.setAttribute('aria-label', link.label);
      a.title = link.label;
      if (link.href.startsWith('http')) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
      const key = link.id || link.label.toLowerCase();
      a.innerHTML = SOCIAL_ICONS[key] || `<span class="text-xs font-medium">${link.label.slice(0, 2)}</span>`;
      socialLinksEl.appendChild(a);
    });
  }

  // Experience (kept in the same structure so placeholder text can be filled in easily)
  const expList = document.getElementById('experience-list');
  if (expList) {
    profile.experience.forEach((item) => {
      const card = el('article', 'surface-card rounded-2xl p-5');
      const header = el('div', 'flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline');
      const title = el('h3', 'text-[15px] font-semibold leading-snug');
      title.append(item.role, el('span', 'surface-subtext font-normal', ` · ${item.company}`));

      const meta = el('p', 'surface-subtext shrink-0 font-mono text-xs', `${item.period} · ${item.location}`);
      header.append(title, meta);

      const ul = el('ul', 'surface-subtext mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed');
      item.highlights.forEach((bullet) => {
        ul.appendChild(el('li', '', bullet));
      });

      card.append(header, ul);
      expList.appendChild(card);
    });
  }

  // Projects (homepage image + title + description + GitHub / Blog Post / Live links when applicable)
  const projectsGrid = document.getElementById('projects-grid');
  if (projectsGrid) {
    profile.projects.forEach((project) => {
      const card = el('article', 'surface-card flex flex-col justify-between rounded-2xl p-3.5');

      const top = el('div');

      if (project.image) {
        const mediaWrap = el(
          'div',
          'overflow-hidden rounded-xl border border-dashed border-black/15 bg-white/60 aspect-[16/10]'
        );
        const img = document.createElement('img');
        img.src = project.image;
        img.alt = project.imageAlt || `${project.name} homepage preview`;
        img.loading = 'lazy';
        img.className = 'h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]';
        mediaWrap.appendChild(img);
        top.appendChild(mediaWrap);
      }

      const body = el('div', 'mt-3.5 px-1');
      body.appendChild(el('h3', 'text-[15px] font-semibold tracking-tight', project.name));
      body.appendChild(el('p', 'surface-subtext mt-1.5 text-[13px] leading-relaxed', project.description));
      top.appendChild(body);

      const actions = el('div', 'mt-4 flex flex-wrap items-center gap-2 px-1 pb-0.5');
      if (isValidUrl(project.repo)) {
        actions.appendChild(createActionLink(project.repo, 'GitHub', ACTION_ICONS.github, 'btn-github'));
      }
      if (isValidUrl(project.blog)) {
        actions.appendChild(createActionLink(project.blog, 'Blog Post', ACTION_ICONS.blog, 'btn-secondary-pill'));
      }
      if (isValidUrl(project.demo)) {
        actions.appendChild(createActionLink(project.demo, 'Live Site', ACTION_ICONS.live, 'btn-secondary-pill'));
      }

      card.append(top, actions);
      projectsGrid.appendChild(card);
    });
  }
}

// Visitor Counter — connects to AWS API Gateway + Lambda + DynamoDB endpoint
async function loadVisitorCount() {
  const countEl = document.getElementById('visitor-count');
  if (!countEl) return;

  const apiUrl = import.meta.env.VITE_VISITOR_API_URL;
  if (!apiUrl) {
    countEl.textContent = 'local preview';
    return;
  }

  try {
    const response = await fetch(apiUrl, { method: 'POST' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    countEl.textContent = Number(data.visits).toLocaleString();
  } catch (err) {
    console.error('Visitor counter error:', err);
    countEl.textContent = 'unavailable';
  }
}

renderProfile();
initSkyScene();
initThankYouFooter();
loadVisitorCount();
