import './style.css';
import { profile } from './data/profile.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderProfile() {
  document.title = `${profile.name} — Portfolio & Cloud Resume`;
  document.getElementById('nav-brand').textContent = profile.brand;
  document.getElementById('profile-status').textContent = profile.status;
  document.getElementById('profile-name').textContent = profile.name;
  document.getElementById('profile-role').textContent = `${profile.role} · ${profile.location}`;
  document.getElementById('profile-summary').textContent = profile.summary;

  // Links
  const linksEl = document.getElementById('profile-links');
  profile.links.forEach((link) => {
    const a = el(
      'a',
      'inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/70 px-3.5 py-2 text-slate-200 transition hover:border-emerald-500/50 hover:text-white',
      link.label
    );
    a.href = link.href;
    if (link.href.startsWith('http')) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    linksEl.appendChild(a);
  });

  // Projects
  const projectsGrid = document.getElementById('projects-grid');
  profile.projects.forEach((project) => {
    const card = el(
      'article',
      'flex flex-col justify-between rounded-xl border border-slate-800/90 bg-slate-900/40 p-5 transition hover:border-slate-700'
    );

    const top = el('div');
    const titleRow = el('div', 'flex items-start justify-between gap-3');
    titleRow.appendChild(el('h3', 'text-base font-semibold text-white', project.name));

    const actions = el('div', 'flex shrink-0 items-center gap-2 text-xs');
    if (project.repo) {
      const repoLink = el('a', 'text-slate-400 transition hover:text-emerald-400', 'Code');
      repoLink.href = project.repo;
      repoLink.target = '_blank';
      repoLink.rel = 'noopener noreferrer';
      actions.appendChild(repoLink);
    }
    if (project.demo && project.demo !== '#') {
      const demoLink = el('a', 'text-slate-400 transition hover:text-emerald-400', 'Live');
      demoLink.href = project.demo;
      demoLink.target = '_blank';
      demoLink.rel = 'noopener noreferrer';
      actions.appendChild(demoLink);
    }
    titleRow.appendChild(actions);
    top.appendChild(titleRow);
    top.appendChild(el('p', 'mt-2.5 text-sm leading-relaxed text-slate-300', project.description));

    const tags = el('div', 'mt-4 flex flex-wrap gap-1.5');
    project.tags.forEach((tag) => {
      tags.appendChild(
        el(
          'span',
          'rounded-md border border-slate-800 bg-slate-950/70 px-2 py-0.5 font-mono text-[11px] text-slate-300',
          tag
        )
      );
    });

    card.append(top, tags);
    projectsGrid.appendChild(card);
  });

  // Experience
  const expList = document.getElementById('experience-list');
  profile.experience.forEach((item) => {
    const wrapper = el('article', 'space-y-2');
    const header = el('div', 'flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline');
    const title = el('h3', 'text-base font-semibold text-white');
    title.append(item.role, el('span', 'font-normal text-slate-400', ` · ${item.company}`));
    const meta = el('p', 'font-mono text-xs text-slate-400', `${item.period} · ${item.location}`);
    header.append(title, meta);

    const ul = el('ul', 'list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-300');
    item.highlights.forEach((bullet) => {
      ul.appendChild(el('li', '', bullet));
    });

    wrapper.append(header, ul);
    expList.appendChild(wrapper);
  });

  // Skills
  const skillsGrid = document.getElementById('skills-grid');
  profile.skillGroups.forEach((group) => {
    const box = el('div', 'rounded-xl border border-slate-800/90 bg-slate-900/30 p-4');
    box.appendChild(el('h3', 'text-sm font-semibold text-white', group.category));
    const list = el('div', 'mt-3 flex flex-wrap gap-2');
    group.items.forEach((skill) => {
      list.appendChild(
        el(
          'span',
          'rounded-md bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-200',
          skill
        )
      );
    });
    box.appendChild(list);
    skillsGrid.appendChild(box);
  });

  // Certifications
  const certsWrap = document.getElementById('certifications-wrap');
  if (profile.certifications.length > 0) {
    certsWrap.appendChild(el('h3', 'text-sm font-semibold text-white', 'Certifications'));
    const certList = el('div', 'mt-3 space-y-2');
    profile.certifications.forEach((cert) => {
      const row = el(
        'div',
        'flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-800/80 bg-slate-900/30 px-4 py-2.5 text-sm'
      );
      const left = el('div');
      left.append(
        el('span', 'font-medium text-slate-100', cert.name),
        el('span', 'text-slate-400', ` — ${cert.issuer}`)
      );
      const badge = el(
        'span',
        'rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-xs text-emerald-300',
        cert.status
      );
      row.append(left, badge);
      certList.appendChild(row);
    });
    certsWrap.appendChild(certList);
  }

  // Education
  const eduList = document.getElementById('education-list');
  profile.education.forEach((edu) => {
    const row = el('div', 'flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline');
    const left = el('div');
    left.appendChild(el('h3', 'text-base font-semibold text-white', edu.degree));
    left.appendChild(el('p', 'text-sm text-slate-300', edu.school));
    if (edu.details) {
      left.appendChild(el('p', 'mt-1 text-xs text-slate-400', edu.details));
    }
    row.append(left, el('p', 'font-mono text-xs text-slate-400', edu.period));
    eduList.appendChild(row);
  });
}

// Visitor Counter — connects to our AWS API Gateway + Lambda + DynamoDB endpoint in Phase 3
async function loadVisitorCount() {
  const countEl = document.getElementById('visitor-count');
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

document.getElementById('print-btn')?.addEventListener('click', () => window.print());

renderProfile();
loadVisitorCount();
