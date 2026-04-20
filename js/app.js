/**
 * ============================================
 *  PORTFOLIO SYSTEM — MAIN APP LOGIC
 * ============================================
 */

// ── App Core Configurations ───────────────

document.addEventListener('DOMContentLoaded', () => {
  // ── Load config: Use the global PORTFOLIO_CONFIG exclusively for global sync ──
  const config = deepMergeConfig(PORTFOLIO_CONFIG);

  // ── Render All Sections ───────────────────
  renderHero(config);
  renderPortfolio(config);
  renderFeedback(config);
  renderFaqs(config);
  renderFooter(config);

  // ── Initialize Animations ─────────────────
  const canvas = document.getElementById('bg-canvas');
  const waveBg = new WaveBackground(canvas);

  hidePreloader(() => {
    waveBg.start();
    animateHeroEntry();

    const scrollReveal = new ScrollReveal();
    scrollReveal.observe('.video-block');
    scrollReveal.observe('.fade-in-up');
  });

  // ── Setup Interactions ────────────────────
  setupContactDropdown();
  setupHamburgerMenu();
  setupTabSwitching();
  setupScrollGradient();
  setupHireMeReveal();
});


// ── Deep merge helper ─────────────────────
function deepMergeConfig(target, source) {
  // If only one argument, act as deep clone for backwards compatibility
  if (!source) return JSON.parse(JSON.stringify(target));
  
  const output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) Object.assign(output, { [key]: source[key] });
        else output[key] = deepMergeConfig(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}
function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

// ── Newline to BR helper ──────────────────
function nl2br(str) {
  if (!str) return '';
  return str
    .replace(/\\n/g, '\n')   // convert escaped \n to real newline
    .replace(/\r\n/g, '<br>') // Windows line endings
    .replace(/\n/g, '<br>')   // Unix line endings
    .replace(/\r/g, '<br>');  // old Mac line endings
}


// ── Hamburger Menu ──────────────────────────
function setupHamburgerMenu() {
  const btn = document.getElementById('hamburger-btn');
  const nav = document.getElementById('side-nav');
  const overlay = document.getElementById('side-nav-overlay');

  if (!btn || !nav || !overlay) return;

  function toggleMenu() {
    const isActive = nav.classList.toggle('active');
    btn.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = isActive ? 'hidden' : '';
  }

  function closeMenu() {
    nav.classList.remove('active');
    btn.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', closeMenu);

  // Close on nav link click
  nav.querySelectorAll('[data-nav]').forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}


// ── Hero Text Reveal Animation ──────────────
function animateHeroEntry() {
  const elements = [
    { el: '.hero-intro', delay: 300 },
    { el: '.availability-badge', delay: 400 },
    { el: '.hero-name', delay: 500 },
    { el: '.hero-role', delay: 700 },
    { el: '.hero-tagline', delay: 950 },
    { el: '.cta-wrapper', delay: 1200 },
    { el: '.availability-mini', delay: 1300 },
    { el: '.hero-bio-block', delay: 1450 }
  ];

  elements.forEach(({ el, delay }) => {
    const element = document.querySelector(el);
    if (element) {
      setTimeout(() => {
        element.style.transition = 'opacity 0.8s var(--ease-out), transform 0.8s var(--ease-out)';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, delay);
    }
  });
}


// ── Hero Renderer ───────────────────────────
function renderHero(config) {
  const hero = document.getElementById('hero');
  const { personalInfo, contactInfo, bioBlock } = config;

  let bioHTML = '';
  if (bioBlock) {
    const servicesHTML = (bioBlock.services || []).map(s => `<li>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      ${s}
    </li>`).join('');
    
    bioHTML = `
      <div class="hero-bio-block">
        <h3 class="bio-intro-title">${bioBlock.introTitle || 'About Me'}</h3>
        <p class="bio-intro-text">${bioBlock.introText || ''}</p>
        
        <div class="bio-section">
          <h4 class="bio-subtitle">Specialization</h4>
          <p class="bio-text">${bioBlock.specialization || ''}</p>
        </div>

        <div class="bio-section">
          <h4 class="bio-subtitle">Services</h4>
          <ul class="bio-services-list">
            ${servicesHTML}
          </ul>
        </div>
        
        ${bioBlock.importantNoteText ? `
        <div class="bio-important-note">
          <div class="bio-important-note-title">${bioBlock.importantNoteTitle || 'Important Note'}</div>
          <div class="bio-important-note-text">${bioBlock.importantNoteText}</div>
        </div>
        ` : ''}
      </div>
    `;
  }

  hero.innerHTML = `
    <!-- Top Right Availability Badge -->
    ${config.availability ? `
      <div class="availability-badge ${config.availability.isAvailable ? 'available' : 'unavailable'}">
        <span class="status-dot"></span>
        <span class="status-text">${config.availability.isAvailable ? (config.availability.customText || 'Available for Work') : 'Currently Unavailable'}</span>
      </div>
    ` : ''}

    <div class="hero-layout-row">
      <div class="hero-content">
      <p class="hero-intro">${personalInfo.introText}</p>
      <h1 class="hero-name">${personalInfo.name}</h1>
      <p class="hero-role">${personalInfo.role}</p>
      <p class="hero-tagline">"${personalInfo.tagline}"</p>

      <div class="cta-group">
        <div class="cta-wrapper" id="cta-wrapper">
          <button class="cta-btn" id="cta-btn" aria-expanded="false" aria-haspopup="true">
            Contact Me
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        <div class="contact-dropdown" id="contact-dropdown" role="menu">
          <a href="mailto:${contactInfo.email}" class="contact-item" role="menuitem">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"></rect>
              <path d="M22 4L12 13 2 4"></path>
            </svg>
            <div>
              <div>Email</div>
              <span>${contactInfo.email}</span>
            </div>
          </a>
          <a href="${contactInfo.whatsapp}" target="_blank" rel="noopener" class="contact-item" role="menuitem">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <div>
              <div>WhatsApp</div>
              <span>Chat now</span>
            </div>
          </a>
        </div>
      </div>
      
      ${config.availability ? `
        <div class="availability-mini ${config.availability.isAvailable ? 'available' : 'unavailable'}">
          <span class="status-dot"></span>
          <span class="status-text">${config.availability.isAvailable ? (config.availability.customText || 'Available for Work') : 'Currently Unavailable'}</span>
        </div>
      ` : ''}
    </div>

      ${bioHTML}
    </div>

    <div class="scroll-hint">
      <div class="scroll-hint-line"></div>
    </div>
  `;
}


// ── Normalize YouTube URL for embed ─────────
function getYouTubeId(url) {
  if (!url) return null;
  const mt = url.trim().match(/(?:v=|vi=|youtu\.be\/|\/v\/|\/embed\/|\/shorts\/|\/e\/|\/live\/|^)([a-zA-Z0-9_-]{11})(?:[?&/]|$)/i);
  return mt ? mt[1] : null;
}

function normalizeVideoUrl(url) {
  if (!url) return url;
  url = url.trim();

  // Google Drive Embed
  if (url.includes('drive.google.com')) {
    const driveRegex = /\/file\/d\/([a-zA-Z0-9_-]+)/;
    const match = url.match(driveRegex);
    let driveId = null;
    
    if (match && match[1]) {
      driveId = match[1];
    } else {
      const idParamMatch = url.match(/id=([a-zA-Z0-9_-]+)/);
      if (idParamMatch && idParamMatch[1]) driveId = idParamMatch[1];
    }

    if (driveId) {
      // Use clean preview link (autoplay=1 causes infinite loop on Drive)
      return `https://drive.google.com/file/d/${driveId}/preview`;
    }
    return url;
  }

  // Instagram Embed
  if (url.includes('instagram.com/reel/') || url.includes('instagram.com/p/')) {
    let cleanUrl = url.split('?')[0].replace(/\/$/, ""); 
    return `${cleanUrl}/embed`;
  }

  // YouTube Embed
  const ytId = getYouTubeId(url);
  if (ytId) {
    return `https://www.youtube.com/embed/${ytId}?autoplay=1&mute=0&rel=0&modestbranding=1&controls=1&showinfo=0`;
  }
  return url;
}


// ── Portfolio Renderer ──────────────────────
function renderPortfolio(config) {
  const portfolio = document.getElementById('portfolio');
  const { portfolioVideos, filters } = config;

  const visibleVideos = portfolioVideos.filter(v => v.isVisible !== false);

  let filtersHTML = '';
  if (filters && filters.enabled && filters.categories && filters.categories.length > 0) {
    const cats = ['All Categories', ...filters.categories];
    filtersHTML = `
      <div class="portfolio-filters fade-in-up" id="portfolio-filters">
        <button class="filter-dropdown-btn" id="filter-dropdown-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
          <span class="filter-current" id="filter-current-text">All Categories</span>
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
        <div class="filter-dropdown-menu">
          ${cats.map(c => `<button class="filter-item ${c === 'All Categories' ? 'active' : ''}" data-filter="${c}">${c}</button>`).join('')}
        </div>
      </div>
    `;
  }

  let videosHTML = visibleVideos.map((video, index) => {
    const isReversed = index % 2 === 1;
    const tagsHTML = video.tags ? video.tags.map(tag => `<span class="video-tag">${tag}</span>`).join('') : '';
    const ratioClass = video.ratio === '9:16' ? 'ratio-vertical' : 'ratio-horizontal';
    
    // Remove background thumbnails as per user request (want clean black screen)
    const bgStyle = ''; 


    return `
      <div class="video-block ${ratioClass} ${isReversed ? 'reversed' : ''}" data-video-id="${video.id}" data-categories="${(video.categories || []).join(',')}">
        <div class="video-container">
          <div class="video-placeholder" ${bgStyle} data-src="${video.videoUrl}" role="button" aria-label="Play ${video.title}" tabindex="0">
            <div class="play-icon">
              <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            </div>
          </div>
        </div>
        <div class="video-info">
          <h3 class="video-title">${video.title}</h3>
          <p class="video-description" data-full-text="${(video.description || video.problem || '').replace(/"/g, '&quot;')}">${(video.description || video.problem || '').length > 150 ? (video.description || video.problem || '').substring(0, 150) + '... <span class="read-more-toggle" role="button" tabindex="0" aria-expanded="false">Read More</span>' : (video.description || video.problem || '')}</p>
          ${tagsHTML ? `<div class="video-tags">${tagsHTML}</div>` : ''}
          <button class="view-case-study-btn" data-video-id="${video.id}">
            View Details
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
        </div>
      </div>
    `;
  }).join('');

  portfolio.innerHTML = `
    <div class="portfolio-header fade-in-up">
      <div>
        <p class="section-label" style="text-align: left;">Selected Work</p>
        <h2 class="section-title" style="text-align: left; margin-bottom: 0;">Portfolio</h2>
      </div>
      ${filtersHTML}
    </div>
    <div id="portfolio-list">
      ${videosHTML}
    </div>
  `;

  // ── Filter Listener ─────────────
  const filterWrapper = document.getElementById('portfolio-filters');
  const blocks = document.querySelectorAll('.video-block');
  if (filterWrapper) {
    const btn = document.getElementById('filter-dropdown-btn');
    const items = filterWrapper.querySelectorAll('.filter-item');
    const textLabel = document.getElementById('filter-current-text');

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      filterWrapper.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!filterWrapper.contains(e.target)) filterWrapper.classList.remove('open');
    });

    items.forEach(item => {
      item.addEventListener('click', () => {
        items.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        filterWrapper.classList.remove('open');
        const selected = item.dataset.filter;
        textLabel.textContent = selected;

        let count = 0;
        blocks.forEach(block => {
          const cats = block.dataset.categories ? block.dataset.categories.split(',') : [];
          if (selected === 'All Categories' || cats.includes(selected)) {
            block.style.display = '';
            count++;
          } else {
            block.style.display = 'none';
          }
        });

        // Re-apply alternating left/right layout based on visible order
        let visibleIndex = 0;
        blocks.forEach(block => {
          if (block.style.display !== 'none') {
            if (visibleIndex % 2 === 1) {
              block.classList.add('reversed');
            } else {
              block.classList.remove('reversed');
            }
            // Re-trigger scroll animation
            setTimeout(() => block.classList.add('visible'), 50);
            visibleIndex++;
          }
        });

        let emptyMsg = document.getElementById('no-videos-msg');
        if (count === 0) {
          if (!emptyMsg) {
            emptyMsg = document.createElement('div');
            emptyMsg.id = 'no-videos-msg';
            emptyMsg.className = 'fade-in-up';
            emptyMsg.style = 'text-align: center; padding: 60px 20px; color: var(--text-secondary); width: 100%; grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; gap: 12px;';
            emptyMsg.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32" style="opacity: 0.5;"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg><p>No videos under this category</p>';
            document.getElementById('portfolio-list').appendChild(emptyMsg);
          }
          emptyMsg.style.display = 'flex';
        } else {
          if (emptyMsg) emptyMsg.style.display = 'none';
        }

        ScrollReveal().trigger();
      });
    });
  }

  // ── Case Study Logic ─────────────
  portfolio.querySelectorAll('.view-case-study-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const v = visibleVideos.find(vid => vid.id === btn.dataset.videoId);
      if (v) openCaseStudy(v);
    });
  });

  // ── Read More Toggle (event delegation) ────────────
  portfolio.addEventListener('click', (e) => {
    const toggle = e.target.closest('.read-more-toggle');
    if (!toggle) return;

    const desc = toggle.closest('.video-description');
    const fullText = desc.dataset.fullText;
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

    if (isExpanded) {
      desc.innerHTML = fullText.substring(0, 150) + '... <span class="read-more-toggle" role="button" tabindex="0" aria-expanded="false">Read More</span>';
    } else {
      desc.innerHTML = fullText + ' <span class="read-more-toggle" role="button" tabindex="0" aria-expanded="true">Show Less</span>';
    }
  });

  // ── Lazy Load Videos (one at a time, event delegation) ─────────────
  portfolio.addEventListener('click', (e) => {
    const placeholder = e.target.closest('.video-placeholder');
    if (!placeholder || !portfolio.contains(placeholder)) return;

    // Stop any currently playing video first
    stopAllVideos(portfolio);

    // Load the clicked video
    const rawSrc = placeholder.dataset.src;
    const ytId = getYouTubeId(rawSrc);
    const container = placeholder.parentElement;
    container.innerHTML = '';

    const iframe = document.createElement('iframe');
    iframe.src = normalizeVideoUrl(rawSrc);

    iframe.dataset.originalSrc = rawSrc;
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
    iframe.setAttribute('allowfullscreen', 'true');

    container.appendChild(iframe);
  });
}

// ── Stop all playing videos and revert to thumbnails ────
function stopAllVideos() {
  // Target both main portfolio and popup content
  const roots = [
    document.getElementById('portfolio'),
    document.getElementById('case-study-content')
  ];
  
  roots.forEach(root => {
    if (!root) return;
    // Find iframes in either container
    root.querySelectorAll('.video-container iframe, .cs-video-container iframe').forEach(iframe => {
      const container = iframe.parentElement;
      // Get source from data attribute or src
      let rawSrc = iframe.dataset.originalSrc;
      if (!rawSrc && iframe.src.includes('youtube.com/embed/')) {
        const id = iframe.src.split('embed/')[1].split('?')[0];
        rawSrc = `https://www.youtube.com/watch?v=${id}`;
      }

      if (rawSrc) {
        container.innerHTML = `
          <div class="video-placeholder" data-src="${rawSrc}" role="button" aria-label="Play video" tabindex="0">
            <div class="play-icon">
              <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            </div>
          </div>
        `;
      } else {
        container.innerHTML = ''; 
      }
    });
  });
}

// ── Render Case Study Modal ─────────────────
function openCaseStudy(video) {
  const modal = document.getElementById('case-study-modal');
  const content = document.getElementById('case-study-content');
  
  const tagsHTML = video.tags ? video.tags.map(tag => `<span class="video-tag">${tag}</span>`).join('') : '';
  const ratioClass = video.ratio === '9:16' ? 'vertical-case' : 'horizontal-case';

  // Check if this specific video is already playing on the main page
  const mainVideoBlock = document.querySelector(`.video-block[data-video-id="${video.id}"]`);
  const isPlayingOnMain = mainVideoBlock ? !!mainVideoBlock.querySelector('.video-container iframe') : false;

  // Build modal content structure
  content.innerHTML = `
    <div class="cs-layout ${ratioClass}">
      <div class="cs-video-container" id="cs-video-slot"></div>
      <div class="cs-content">
        ${video.category ? `<span class="cs-category">${video.category}</span>` : ''}
        <h2 class="cs-title">${video.title}</h2>
        <div class="cs-details">
          ${video.problem ? `<div class="cs-section"><h4 class="cs-subheading">Problem</h4><div class="cs-text">${nl2br(video.problem)}</div></div>` : ''}
          ${video.goal ? `<div class="cs-section"><h4 class="cs-subheading">Goal</h4><div class="cs-text">${nl2br(video.goal)}</div></div>` : ''}
          ${video.solution ? `<div class="cs-section"><h4 class="cs-subheading">What I did</h4><div class="cs-text">${nl2br(video.solution)}</div></div>` : ''}
          ${!video.problem && !video.goal && !video.solution && video.description ? `<div class="cs-description">${nl2br(video.description)}</div>` : ''}
        </div>
        ${tagsHTML ? `<div class="cs-tags">${tagsHTML}</div>` : ''}
      </div>
    </div>
  `;

  const videoSlot = document.getElementById('cs-video-slot');

  // Stop any OTHER videos that might be playing elsewhere
  stopAllVideos();

  if (isPlayingOnMain) {
    // Video WAS playing → load it with AUTOPLAY in the popup
    const id = getYouTubeId(video.videoUrl);
    const iframe = document.createElement('iframe');
    if (id) iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
    else iframe.src = normalizeVideoUrl(video.videoUrl);
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
    iframe.setAttribute('allowfullscreen', 'true');
    videoSlot.appendChild(iframe);
  } else {
    videoSlot.innerHTML = `
      <div class="video-placeholder" data-src="${video.videoUrl}" role="button" aria-label="Play ${video.title}" tabindex="0">
        <div class="play-icon">
          <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        </div>
      </div>
    `;
    
    // Add manual play listener for the popup
    const placeholder = videoSlot.querySelector('.video-placeholder');
    placeholder.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = normalizeVideoUrl(video.videoUrl);
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
      iframe.setAttribute('allowfullscreen', 'true');
      videoSlot.innerHTML = '';
      videoSlot.appendChild(iframe);
    });
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Scroll the content area to the top (Handle both desktop internal scroll and mobile overlay scroll)
  const scrollArea = modal.querySelector('.case-study-scroll-area');
  if (scrollArea) scrollArea.scrollTop = 0;
  modal.scrollTop = 0; // Fixed: Reset overlay scroll for mobile "natural scroll" model

  const closeFn = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // STOP ALL PLAYBACK on close
    stopAllVideos();
    
    // Cleanup internal content to stop any stray audio
    setTimeout(() => { content.innerHTML = ''; }, 400);
    
    document.getElementById('close-case-study').removeEventListener('click', closeFn);
  };

  document.getElementById('close-case-study').addEventListener('click', closeFn);
  
  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('case-study-scroll-area')) closeFn();
  });
}


// ── Footer Renderer ─────────────────────────
function renderFooter(config) {
  const footer = document.getElementById('footer');
  const { socialLinks, contactInfo, personalInfo } = config;

  footer.innerHTML = `
    <div class="footer-socials">
      <a href="${socialLinks.youtube.url}" target="_blank" rel="noopener" class="social-link" aria-label="YouTube">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
        ${socialLinks.youtube.label}
      </a>
      <a href="${socialLinks.instagram.url}" target="_blank" rel="noopener" class="social-link" aria-label="Instagram">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
        </svg>
        ${socialLinks.instagram.label}
      </a>
      <a href="mailto:${contactInfo.email}" class="social-link" aria-label="Email">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2"></rect>
          <path d="M22 4L12 13 2 4"></path>
        </svg>
        ${contactInfo.email}
      </a>
    </div>
    <p class="footer-copy">© ${new Date().getFullYear()} ${personalInfo.name}. All rights reserved.</p>
  `;
}


// ── Contact Dropdown ────────────────────────
function setupContactDropdown() {
  const wrapper = document.getElementById('cta-wrapper');
  const btn = document.getElementById('cta-btn');

  if (!wrapper || !btn) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = wrapper.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen);
  });

  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) {
      wrapper.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      wrapper.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

// ── Section Tabs Switcher ───────────────────
function setupTabSwitching() {
  const tabs = document.querySelectorAll('.tab-btn');
  const sections = document.querySelectorAll('.section-view');

  if (tabs.length === 0 || sections.length === 0) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));

      tab.classList.add('active');
      const targetId = tab.dataset.target;
      const targetView = document.getElementById(targetId);
      if (targetView) targetView.classList.add('active');
      
      // Let scroll reveal trigger if elements were hidden
      setTimeout(() => {
        window.dispatchEvent(new Event('scroll'));
      }, 100);
    });
  });
}

// ── Gradient Scroll Parallax ────────────────
function setupScrollGradient() {
  // Disabled: Translating a strict fixed viewport container upward
  // causes its bottom bounds to lift into view, creating a hard cutoff line.
}

// ── Hire Me Button Reveal ───────────────────
function setupHireMeReveal() {
  const hireBtn = document.querySelector('.hire-me-btn');
  const bioBlock = document.querySelector('.hero-bio-block');

  if (!hireBtn) return;

  // Use the bio block as trigger, or fall back to the hero section
  const trigger = bioBlock || document.getElementById('hero');
  if (!trigger) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        hireBtn.classList.add('visible');
        observer.disconnect();
      }
    });
  }, { threshold: 0.1 });

  observer.observe(trigger);
}

// ── Feedback Renderer ───────────────────────
function renderFeedback(config) {
  const grid = document.getElementById('feedback-grid');
  if (!grid || !config.feedbacks) return;

  const visibleFb = config.feedbacks.filter(f => f.isVisible !== false);

  grid.innerHTML = visibleFb.map((item, index) => {
    return `
      <div class="feedback-card fade-in-up" style="transition-delay: ${index * 0.1}s">
        <p class="feedback-text">"${item.feedbackText}"</p>
        <p class="feedback-person">— ${item.personName}</p>
      </div>
    `;
  }).join('');
}

// ── FAQs Renderer ───────────────────────────
function renderFaqs(config) {
  const list = document.getElementById('faq-list');
  if (!list || !config.faqs) return;

  list.innerHTML = config.faqs.map((item, index) => {
    return `
      <div class="faq-item fade-in-up" style="transition-delay: ${index * 0.1}s">
        <div class="faq-question">
          <span>${item.question}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        <div class="faq-answer">
          <p>${item.answer}</p>
        </div>
      </div>
    `;
  }).join('');

  list.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
      const parent = question.parentElement;
      const isActive = parent.classList.contains('active');
      
      list.querySelectorAll('.faq-item').forEach(item => item.classList.remove('active'));
      
      if (!isActive) {
        parent.classList.add('active');
      }
    });
  });
}
