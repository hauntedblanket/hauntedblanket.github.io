(function () {
  const DEFAULTS = {
    siteTitle: 'HAUNTED BLANKET',
    homeSubtitle: 'COZY THINGS FOR SLEEPLESS NIGHTS',
    collectionHeading: 'COLLECTION',
    collectionSubtitle: 'EXPLORE THE COLLECTION',
    recentHeading: 'RECENTLY ADDED',
    recentSubtitle: 'NEWEST MOVIES AND GAMES',
    featuredHeading: 'FEATURED PICKS',
    featuredSubtitle: 'MOVIES AND GAMES FOR LATE NIGHTS',
    quote: 'EVERY NIGHT HAS A STORY.',
    footer: 'HAUNTED BLANKET',
    moviesSubtitle: '',
    moviesHeading: 'FAVORITE MOVIES',
    moviesFavoritesHeading: 'FAVORITE MOVIES',
    moviesAllHeading: 'ALL MOVIES',
    gamesSubtitle: '',
    gamesHeading: 'FAVORITE GAMES',
    gamesFavoritesHeading: 'FAVORITE GAMES',
    gamesAllHeading: 'ALL GAMES',
    socialsSubtitle: 'CREATORS, STREAMERS, PAGES, AND LINKS',
    socialsHeading: 'CREATORS / PAGES',
    backgroundColor: '#08080d',
    panelColor: '#11111a',
    textColor: '#d8c7ef',
    titleColor: '#f4efff',
    mutedColor: '#8e78aa',
    accentColor: '#d8c7ef',
    bodyFont: "'Courier New', monospace",
    titleFont: "'Courier New', monospace",
    baseFontSize: '14',
    titleFontSize: '64',
    aboutFontSize: '15',
    navFontSize: '12',
    letterSpacing: '2',
    uppercase: true
  };
  const data = window.HAUNTED_BLANKET_DATA || {};
  const settings = Object.assign({}, DEFAULTS, data.settings || {});
  window.HB_SETTINGS = settings;

  function getVideoLink(item) {
    return item.youtube || item.youtubeUrl || item.video || item.videoUrl || item.trailer || item.trailerUrl || '';
  }

  function esc(text) {
    return String(text == null ? '' : text).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  }
  function px(value, fallback) {
    const n = parseFloat(value || fallback);
    return Number.isFinite(n) ? n + 'px' : fallback + 'px';
  }
  function setVar(name, value) { document.documentElement.style.setProperty(name, value); }
  function applyStyles() {
    setVar('--hb-bg', settings.backgroundColor);
    setVar('--hb-panel', settings.panelColor);
    setVar('--hb-text', settings.textColor);
    setVar('--hb-title', settings.titleColor);
    setVar('--hb-muted', settings.mutedColor);
    setVar('--hb-accent', settings.accentColor);
    setVar('--hb-body-font', settings.bodyFont);
    setVar('--hb-title-font', settings.titleFont);
    setVar('--hb-base-size', px(settings.baseFontSize, 14));
    setVar('--hb-title-size', px(settings.titleFontSize, 64));
    setVar('--hb-about-size', px(settings.aboutFontSize, 15));
    setVar('--hb-nav-size', px(settings.navFontSize, 12));
    setVar('--hb-letter-spacing', px(settings.letterSpacing, 2));
    document.body.classList.toggle('no-uppercase', settings.uppercase === false || settings.uppercase === 'false');
  }
  function applyText() {
    document.querySelectorAll('[data-hb-text]').forEach(el => {
      const key = el.getAttribute('data-hb-text');
      if (Object.prototype.hasOwnProperty.call(settings, key)) el.textContent = settings[key] ?? '';
    });
    document.querySelectorAll('[data-hb-lines]').forEach(el => {
      const key = el.getAttribute('data-hb-lines');
      const lines = String(settings[key] || '').split(/\n+/).filter(Boolean);
      el.innerHTML = lines.map(line => `<p>${esc(line)}</p>`).join('');
    });
    if (settings.siteTitle) {
      const page = document.body.getAttribute('data-page');
      document.title = page && page !== 'home' ? `${document.title.split('•')[0].trim()} • ${settings.siteTitle}` : settings.siteTitle;
    }
  }
  document.addEventListener('DOMContentLoaded', () => { applyStyles(); applyText(); });
})();

/* Global search */
document.addEventListener('DOMContentLoaded', () => {
  const search = document.getElementById('globalSearch');
  const results = document.getElementById('globalSearchResults');

  if (!search || !results) return;

  const media = window.HAUNTED_BLANKET_DATA?.media || [];

  function slugify(value='') {
    return String(value)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  function mediaPage(item) {
    const type = String(item.type || '').toLowerCase();
    return type.includes('game') ? 'games.html' : 'movies.html';
  }

  function searchableText(item) {
    return [
      item.title,
      item.type,
      item.year,
      item.rating,
      item.mood,
      item.status,
      item.blurb,
      item.notes,
      ...(Array.isArray(item.tags) ? item.tags : [])
    ].filter(Boolean).join(' ').toLowerCase();
  }

  search.addEventListener('focus', () => {
    setTimeout(() => {
      search.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 250);
  });

  search.addEventListener('input', () => {
    const q = search.value.toLowerCase().trim();
    results.innerHTML = '';

    if (!q) return;

    const filtered = media
      .filter(item => searchableText(item).includes(q))
      .slice(0, 10);

    filtered.forEach(item => {
      const title = item.title || 'UNTITLED';
      const href = `${mediaPage(item)}?search=${encodeURIComponent(title)}#${slugify(title)}`;

      const el = document.createElement('a');
      el.className = 'search-result';
      el.href = href;
      el.addEventListener('touchend', e => {
        e.preventDefault();
        search.blur();
        window.location.href = href;
      });
      el.addEventListener('click', e => {
        e.preventDefault();
        search.blur();
        window.location.href = href;
      });

      el.innerHTML = `
        <strong>${title}</strong>
        <small>${item.type || 'MEDIA'}${item.rating ? ` • ${item.rating}` : ''}</small>
      `;
      results.appendChild(el);
    });

    if (!filtered.length) {
      results.innerHTML = '<div class="search-result search-empty">NO MATCHES FOUND</div>';
    }
  });
});

/* Search result highlight */
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const query = params.get('search');
  if (!query) return;

  const target = String(query).toLowerCase().trim();

  setTimeout(() => {
    const cards = [...document.querySelectorAll('.media-card, .collection-card, .card, article')];

    const match = cards.find(card => {
      const text = card.textContent.toLowerCase();
      return text.includes(target);
    });

    if (match) {
      match.scrollIntoView({ behavior: 'smooth', block: 'center' });
      match.classList.add('search-selected-card');
      setTimeout(() => match.classList.remove('search-selected-card'), 2600);
    }
  }, 450);
});

async function submitRecommendation(){
  const name = document.getElementById('recommendName')?.value || 'ANONYMOUS';
  const type = document.getElementById('recommendType')?.value || '';
  const title = document.getElementById('recommendTitle')?.value || '';
  const reason = document.getElementById('recommendReason')?.value || '';

  try{
    const response = await fetch('https://haunted-recommendations.ohnotmai.workers.dev/', {
      method:'POST',
      headers:{
        'Content-Type':'application/json'
      },
      body: JSON.stringify({
        name,
        type,
        title,
        reason
      })
    });

    if(response.ok){
      alert('RECOMMENDATION SENT!');
    } else {
      alert('FAILED TO SEND RECOMMENDATION');
    }

  }catch(err){
    alert('ERROR SENDING RECOMMENDATION');
  }
}
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});
/* Shared media cards and detail modal */
(function () {
  const hbData = window.HAUNTED_BLANKET_DATA || { media: [] };
  const media = Array.isArray(hbData.media) ? hbData.media : [];

  function escapeHtml(text = '') {
    return String(text == null ? '' : text).replace(/[&<>'"]/g, c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[c]));
  }

  function getVideoLink(item = {}) {
    return item.youtube || item.youtubeUrl || item.video || item.videoUrl || item.trailer || item.trailerUrl || '';
  }

  function galleryMarkup(item = {}) {
    const images = Array.isArray(item.gallery) ? item.gallery.filter(Boolean) : [];
    if (!images.length) return '';
    return `<div class="modal-gallery">${images.map(src => imageTag(src, `${item.title || 'Media'} screenshot`, '', 'IMAGE MISSING')).join('')}</div>`;
  }

  function trailerMarkup(item = {}) {
    const link = getVideoLink(item);
    if (!link) return '';
    return `<div class="modal-actions">
      <a class="youtube-watch-btn" href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">
        ▶ WATCH ON YOUTUBE ↗
      </a>
    </div>`;
  }

  function mediaIndex(item) {
    return media.indexOf(item);
  }

  function imageTag(src, alt, className = '', placeholderText = 'IMAGE MISSING', placeholderClass = 'poster-placeholder') {
    if (!src) return `<div class="${placeholderClass}">${escapeHtml(placeholderText)}</div>`;
    const cls = className ? ` class="${escapeHtml(className)}"` : '';
    const fallback = `this.onerror=null;this.outerHTML='<div class=&quot;${escapeHtml(placeholderClass)}&quot;>${escapeHtml(placeholderText)}</div>'`;
    return `<img loading="lazy" decoding="async"${cls} src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" onerror="${fallback}">`;
  }

  function mediaCard(item = {}, options = {}) {
    const index = mediaIndex(item);
    const img = imageTag(item.image, `${item.title || 'Media'} poster`, 'poster', 'ADD COVER');
    const tags = (item.tags || []).map(t => `<span class="badge">${escapeHtml(t)}</span>`).join('');
    const favorite = options.showFavoritePill && item.favorite ? '<span class="favorite-pill">FAVORITE</span>' : '';
    const topLine = options.showFavoritePill ? `<div class="card-topline">${favorite}</div>` : '';
    const rating = item.rating ? `<p class="card-rating">RATING: ${escapeHtml(item.rating)}</p>` : '';

    return `<article class="card clickable-card" onclick="openMediaModal(${index})" tabindex="0" role="button" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openMediaModal(${index})}">
      ${img}
      ${topLine}
      <h3 class="card-title">${escapeHtml(item.title)}</h3>
      <p class="card-meta">${escapeHtml(item.year || item.type)} • ${escapeHtml(item.mood || 'LATE-NIGHT PICK')}</p>
      ${rating}
      <div class="badges">${tags}</div>
    </article>`;
  }

  function nowMiniCard(item) {
    if (!item) return '<div class="now-empty">NOT SET YET</div>';
    const index = mediaIndex(item);
    const img = imageTag(item.image, `${item.title || 'Media'} poster`, '', 'ADD COVER');
    return `<article class="now-mini-card" onclick="openMediaModal(${index})" tabindex="0" role="button" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openMediaModal(${index})}">
      ${img}
      <strong>${escapeHtml(item.title)}</strong>
    </article>`;
  }

  function openMediaModal(index) {
    const item = media[index];
    if (!item) return;

    const modal = document.getElementById('mediaModal');
    const content = document.getElementById('mediaModalContent');
    if (!modal || !content) return;

    const img = imageTag(item.image, `${item.title || 'Media'} poster`, 'modal-poster', 'ADD COVER', 'poster-placeholder modal-placeholder');
    const tags = (item.tags || []).map(t => `<span class="badge">${escapeHtml(t)}</span>`).join('');
    const rating = item.rating ? `<div class="detail-row"><strong>RATING</strong><span>${escapeHtml(item.rating)}</span></div>` : '';
    const mood = item.mood ? `<div class="detail-row"><strong>MOOD</strong><span>${escapeHtml(item.mood)}</span></div>` : '';
    const year = item.year ? `<div class="detail-row"><strong>YEAR</strong><span>${escapeHtml(item.year)}</span></div>` : '';
    const blurb = item.description ? `<p class="modal-blurb">${escapeHtml(item.description)}</p>` : `<p class="modal-blurb empty-blurb">NO BLURB YET</p>`;

    content.innerHTML = `
      <div class="media-detail-layout">
        ${img}
        <div class="media-detail-copy">
          <p class="modal-kicker">${escapeHtml(item.type || '')}</p>
          <h2>${escapeHtml(item.title)}</h2>
          <div class="detail-list">${year}${rating}${mood}</div>
          ${blurb}
          ${trailerMarkup(item)}
          ${galleryMarkup(item)}
          <div class="badges">${tags}</div>
        </div>
      </div>
    `;

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }

  function closeMediaModal() {
    const modal = document.getElementById('mediaModal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMediaModal();
  });

  window.HB_MEDIA = {
    data: hbData,
    media,
    escapeHtml,
    mediaCard,
    nowMiniCard,
    openMediaModal,
    closeMediaModal
  };
  window.openMediaModal = openMediaModal;
  window.closeMediaModal = closeMediaModal;
})();
