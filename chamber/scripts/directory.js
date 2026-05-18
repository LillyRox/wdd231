const membersContainer = document.getElementById('members-container');
const memberCount      = document.getElementById('member-count');
const btnGrid          = document.getElementById('btn-grid');
const btnList          = document.getElementById('btn-list');
const navToggle        = document.getElementById('nav-toggle');
const primaryNav       = document.getElementById('primary-nav');
const copyrightYear    = document.getElementById('copyright-year');
const lastModified     = document.getElementById('last-modified');
if (copyrightYear) copyrightYear.textContent = new Date().getFullYear();
if (lastModified)  lastModified.textContent  = document.lastModified;
if (navToggle && primaryNav) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    primaryNav.classList.toggle('open', !expanded);
  });
}
const LEVEL = {
  1: { label: 'Member',    cls: 'badge-member', icon: '●' },
  2: { label: 'Silver',    cls: 'badge-silver', icon: '★' },
  3: { label: 'Gold',      cls: 'badge-gold',   icon: '✦' },
};

function levelBadge(level) {
  const info = LEVEL[level] || LEVEL[1];
  return `<span class="badge ${info.cls}" aria-label="${info.label} member">
    ${info.icon} ${info.label}
  </span>`;
}
function buildCard(member, index) {
  const imgMarkup = member.image
    ? `<img src="images/${member.image}" alt="${member.name} logo" loading="lazy">`
    : '';
  return `
    <article class="member-card">
      <div class="card-img-wrap">
        ${imgMarkup}
      </div>
      <div class="card-body">
        <div class="card-header">
          <h3 class="card-name">${member.name}</h3>
          ${levelBadge(member.membershipLevel)}
        </div>
        ${member.description ? `<p class="card-desc">${member.description}</p>` : ''}
        <div class="card-info">
          <div class="info-row">
            <svg class="info-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>${member.address}</span>
          </div>
          <div class="info-row">
            <svg class="info-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.08 3.4 2 2 0 0 1 3.05 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16.92z"/></svg>
            <span>${member.phone}</span>
          </div>
          <div class="info-row">
            <svg class="info-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            <a href="${member.website}" target="_blank" rel="noopener noreferrer">Visit Website</a>
          </div>
        </div>
      </div>
    </article>`;
}

function buildListItem(member, index) {
  const imgMarkup = member.image
    ? `<img src="images/${member.image}" alt="" loading="lazy">`
    : '';
  return `
    <div class="member-list-item">
      <div class="list-logo" aria-hidden="true">${imgMarkup}</div>
      <div class="list-info">
        <p class="list-name">${member.name}</p>
        <div class="list-details">
          <span>${member.phone}</span>
          <span>${member.address}</span>
          <span class="list-website"><a href="${member.website}" target="_blank" rel="noopener noreferrer">Website ↗</a></span>
        </div>
      </div>
      <div class="list-badge">${levelBadge(member.membershipLevel)}</div>
    </div>`;
}
let currentMembers = [];
let currentView    = localStorage.getItem('chamberView') || 'grid';

function renderMembers() {
  if (!membersContainer || currentMembers.length === 0) return;

  membersContainer.className = currentView === 'grid' ? 'grid-view' : 'list-view';

  const html = currentView === 'grid'
    ? currentMembers.map((m, i) => buildCard(m, i)).join('')
    : currentMembers.map((m, i) => buildListItem(m, i)).join('');

  membersContainer.innerHTML = html;
  btnGrid?.classList.toggle('active', currentView === 'grid');
  btnList?.classList.toggle('active', currentView === 'list');
}
btnGrid?.addEventListener('click', () => {
  currentView = 'grid';
  localStorage.setItem('chamberView', 'grid');
  renderMembers();
});

btnList?.addEventListener('click', () => {
  currentView = 'list';
  localStorage.setItem('chamberView', 'list');
  renderMembers();
});
async function loadMembers() {
  // Show loading state
  membersContainer.innerHTML = `
    <div class="loading-state">
      <div class="loading-spinner" role="status" aria-label="Loading members"></div>
      <p>Loading chamber members…</p>
    </div>`;

  try {
    const response = await fetch('data/members.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    const data = await response.json();
    currentMembers = data.members || [];

    if (currentMembers.length === 0) throw new Error('No member data found.');
    if (memberCount) memberCount.textContent = `${currentMembers.length} members`;
    currentView = localStorage.getItem('chamberView') || 'grid';
    renderMembers();

  } catch (err) {
    console.error('Failed to load members:', err);
    membersContainer.innerHTML = `
      <div class="error-state" role="alert">
        <p><strong>Unable to load member directory.</strong></p>
        <p>${err.message}</p>
      </div>`;
  }
}
document.addEventListener('DOMContentLoaded', loadMembers);