/**
 * ============================================
 *  ADMIN PANEL — LOGIC
 *  Manages config via localStorage + export
 * ============================================
 */

document.addEventListener('DOMContentLoaded', () => {
  const config = loadConfig();
  setupPasswordGate(config);
});


// ── Config Management ───────────────────────

function deepMergeConfig(target, source) {
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

function loadConfig() {
  const saved = localStorage.getItem('portfolio_config');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return deepMergeConfig(PORTFOLIO_CONFIG, parsed);
    } catch (e) {
      console.warn('Invalid saved config, using default');
    }
  }
  return deepClone(PORTFOLIO_CONFIG);
}

function saveConfig(config) {
  localStorage.setItem('portfolio_config', JSON.stringify(config));
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}


// ── Password Gate ───────────────────────────

function setupPasswordGate(config) {
  const gate = document.getElementById('admin-gate');
  const dashboard = document.getElementById('admin-dashboard');
  const input = document.getElementById('admin-password');
  const btn = document.getElementById('admin-login-btn');
  const error = document.getElementById('admin-error');

  // Password gate is forced on every load for maximum security

  btn.addEventListener('click', () => attemptLogin());
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') attemptLogin();
  });

  const eyeBtn = document.querySelector('.admin-gate-box .eye-btn');
  if (eyeBtn) {
    eyeBtn.addEventListener('click', () => {
      window.togglePwd('admin-password', eyeBtn);
    });
  }

  function attemptLogin() {
    const password = input.value.trim();
    if (password === config.admin.password) {
      sessionStorage.setItem('admin_auth', 'true');
      gate.style.display = 'none';
      dashboard.classList.add('active');
      initDashboard(config);
    } else {
      error.classList.add('show');
      input.value = '';
      input.focus();
      setTimeout(() => error.classList.remove('show'), 3000);
    }
  }
}


// ── Dashboard Init ──────────────────────────

function initDashboard(config) {
  let liveConfig = deepClone(config);

  renderAvailabilityForm(liveConfig);
  renderPersonalInfoForm(liveConfig);
  renderBioBlockForm(liveConfig);
  renderContactForm(liveConfig);
  renderSocialForm(liveConfig);
  renderVideoList(liveConfig);
  renderFeedbackList(liveConfig);
  renderFaqList(liveConfig);
  renderGitHubSettingsForm();
  renderAdminSettingsForm(liveConfig);

  setupFilterModal(liveConfig);

  // Save button
  document.getElementById('save-btn').addEventListener('click', () => {
    saveConfig(liveConfig);
    showToast('Changes saved successfully!', 'success');
  });

  // Export button
  document.getElementById('export-btn').addEventListener('click', () => {
    exportConfig(liveConfig);
  });

  // Preview button
  document.getElementById('preview-btn').addEventListener('click', () => {
    // Save first, then open main page
    saveConfig(liveConfig);
    window.open('index.html', '_blank');
  });

  // Publish button
  document.getElementById('publish-btn').addEventListener('click', () => {
    publishToGitHub(liveConfig);
  });
}


// ── Personal Info Form ──────────────────────

function renderPersonalInfoForm(config) {
  const container = document.getElementById('personal-info-form');

  container.innerHTML = `
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Name</label>
        <input class="form-input" type="text" id="field-name" value="${escapeHtml(config.personalInfo.name)}" placeholder="Your name">
      </div>
      <div class="form-group">
        <label class="form-label">Role</label>
        <input class="form-input" type="text" id="field-role" value="${escapeHtml(config.personalInfo.role)}" placeholder="Your role">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Intro Text</label>
        <input class="form-input" type="text" id="field-intro" value="${escapeHtml(config.personalInfo.introText)}" placeholder="Small intro text">
      </div>
      <div class="form-group">
        <label class="form-label">Tagline</label>
        <input class="form-input" type="text" id="field-tagline" value="${escapeHtml(config.personalInfo.tagline)}" placeholder="Your tagline">
      </div>
    </div>
  `;

  // Bind live updates
  bindInput('field-name', (v) => config.personalInfo.name = v);
  bindInput('field-role', (v) => config.personalInfo.role = v);
  bindInput('field-intro', (v) => config.personalInfo.introText = v);
  bindInput('field-tagline', (v) => config.personalInfo.tagline = v);
}


// ── Availability Form ───────────────────────

function renderAvailabilityForm(config) {
  const container = document.getElementById('availability-form');
  if (!container) return;

  // Provide defaults if missing
  if (!config.availability) {
    config.availability = { isAvailable: true, customText: "Available for Work" };
  }

  container.innerHTML = `
    <div class="form-row" style="align-items: center;">
      <div class="form-group" style="flex: 0 0 auto;">
        <label class="form-label" style="margin-bottom: 0;">Currently Available?</label>
      </div>
      <div class="form-group" style="flex: 0 0 auto; margin-right: 20px;">
        <label class="toggle-switch">
          <input type="checkbox" id="field-availability-toggle" ${config.availability.isAvailable ? 'checked' : ''}>
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div class="form-group" style="flex: 1;">
        <label class="form-label">Custom Display Text <span style="font-size: 0.8em; color: var(--text-secondary); font-weight: normal;">(e.g., "Booked till May")</span></label>
        <input class="form-input" type="text" id="field-availability-text" value="${escapeHtml(config.availability.customText || '')}" placeholder="Available for Work">
      </div>
    </div>
  `;

  // Bind live updates
  const toggleRaw = document.getElementById('field-availability-toggle');
  toggleRaw.addEventListener('change', (e) => {
    config.availability.isAvailable = e.target.checked;
  });

  bindInput('field-availability-text', (v) => config.availability.customText = v);
}


// ── Bio Block Form ──────────────────────────

function renderBioBlockForm(config) {
  const container = document.getElementById('bio-block-form');
  if (!container) return;
  if (!config.bioBlock) {
    config.bioBlock = {
      introTitle: '', introText: '', specialization: '', services: []
    };
  }

  container.innerHTML = `
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Intro Title</label>
        <input class="form-input" type="text" id="field-bio-title" value="${escapeHtml(config.bioBlock.introTitle || '')}" placeholder="About Me">
      </div>
      <div class="form-group">
        <label class="form-label">Specialization</label>
        <input class="form-input" type="text" id="field-bio-spec" value="${escapeHtml(config.bioBlock.specialization || '')}" placeholder="Short-form, Documentaries...">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Intro Text</label>
      <textarea class="form-textarea" id="field-bio-text" placeholder="I specialize in creating...">${escapeHtml(config.bioBlock.introText || '')}</textarea>
    </div>
    <div class="form-group">
      <label class="form-label">Services (comma separated)</label>
      <input class="form-input" type="text" id="field-bio-services" value="${(config.bioBlock.services || []).join(', ')}" placeholder="Color Grading, Motion Graphics, Sound Design">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Important Note Title</label>
        <input class="form-input" type="text" id="field-bio-note-title" value="${escapeHtml(config.bioBlock.importantNoteTitle || 'Important Note')}" placeholder="Important Note">
      </div>
      <div class="form-group">
        <label class="form-label">Important Note Text</label>
        <textarea class="form-textarea" id="field-bio-note-text" placeholder="Note context...">${escapeHtml(config.bioBlock.importantNoteText || '')}</textarea>
      </div>
    </div>
  `;

  bindInput('field-bio-title', (v) => config.bioBlock.introTitle = v);
  bindInput('field-bio-spec', (v) => config.bioBlock.specialization = v);
  bindInput('field-bio-text', (v) => config.bioBlock.introText = v);
  bindInput('field-bio-services', (v) => {
    config.bioBlock.services = v.split(',').map(s => s.trim()).filter(Boolean);
  });
  bindInput('field-bio-note-title', (v) => config.bioBlock.importantNoteTitle = v);
  bindInput('field-bio-note-text', (v) => config.bioBlock.importantNoteText = v);
}

// ── Contact Form ────────────────────────────

function renderContactForm(config) {
  const container = document.getElementById('contact-form');

  container.innerHTML = `
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Email</label>
        <input class="form-input" type="email" id="field-email" value="${escapeHtml(config.contactInfo.email)}" placeholder="your@email.com">
      </div>
      <div class="form-group">
        <label class="form-label">WhatsApp Link</label>
        <input class="form-input" type="url" id="field-whatsapp" value="${escapeHtml(config.contactInfo.whatsapp)}" placeholder="https://wa.me/...">
      </div>
    </div>
  `;

  bindInput('field-email', (v) => config.contactInfo.email = v);
  bindInput('field-whatsapp', (v) => config.contactInfo.whatsapp = v);
}


// ── Social Links Form ───────────────────────

function renderSocialForm(config) {
  const container = document.getElementById('social-form');

  container.innerHTML = `
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">YouTube URL</label>
        <input class="form-input" type="url" id="field-yt-url" value="${escapeHtml(config.socialLinks.youtube.url)}" placeholder="https://youtube.com/@...">
      </div>
      <div class="form-group">
        <label class="form-label">YouTube Label</label>
        <input class="form-input" type="text" id="field-yt-label" value="${escapeHtml(config.socialLinks.youtube.label)}" placeholder="Channel name">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Instagram URL</label>
        <input class="form-input" type="url" id="field-ig-url" value="${escapeHtml(config.socialLinks.instagram.url)}" placeholder="https://instagram.com/...">
      </div>
      <div class="form-group">
        <label class="form-label">Instagram Label</label>
        <input class="form-input" type="text" id="field-ig-label" value="${escapeHtml(config.socialLinks.instagram.label)}" placeholder="Handle">
      </div>
    </div>
  `;

  bindInput('field-yt-url', (v) => config.socialLinks.youtube.url = v);
  bindInput('field-yt-label', (v) => config.socialLinks.youtube.label = v);
  bindInput('field-ig-url', (v) => config.socialLinks.instagram.url = v);
  bindInput('field-ig-label', (v) => config.socialLinks.instagram.label = v);
}

// ── Admin Settings Form ─────────────────────

function renderAdminSettingsForm(config) {
  const container = document.getElementById('admin-settings-form');
  if (!container) return; // safeguard

  container.innerHTML = `
    <div class="form-group">
      <label class="form-label">Current Password</label>
      <div class="password-wrapper">
        <input class="form-input" type="password" id="field-current-pwd" placeholder="Enter current password to authorize change">
        <button class="eye-btn" type="button" onclick="window.togglePwd('field-current-pwd', this)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">New Password</label>
        <div class="password-wrapper">
          <input class="form-input" type="password" id="field-new-pwd" placeholder="Enter new password">
          <button class="eye-btn" type="button" onclick="window.togglePwd('field-new-pwd', this)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Confirm New Password</label>
        <div class="password-wrapper">
          <input class="form-input" type="password" id="field-confirm-pwd" placeholder="Confirm new password">
          <button class="eye-btn" type="button" onclick="window.togglePwd('field-confirm-pwd', this)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
        </div>
      </div>
    </div>
    <button class="admin-btn admin-btn-primary" id="change-pwd-btn">Update Password</button>
  `;

  document.getElementById('change-pwd-btn').addEventListener('click', () => {
    const current = document.getElementById('field-current-pwd').value;
    const newPwd = document.getElementById('field-new-pwd').value;
    const confirmPwd = document.getElementById('field-confirm-pwd').value;

    if (!current) return showToast('Please enter your current password.', 'error');
    if (current !== config.admin.password) return showToast('Current password is incorrect.', 'error');
    if (!newPwd) return showToast('Please enter a new password.', 'error');
    if (newPwd !== confirmPwd) return showToast('New passwords do not match.', 'error');

    config.admin.password = newPwd;
    saveConfig(config);
    showToast('Password updated! The page will now reload with your new credentials.', 'success');
    
    // Clear fields and reload to test
    document.getElementById('field-current-pwd').value = '';
    document.getElementById('field-new-pwd').value = '';
    document.getElementById('field-confirm-pwd').value = '';
    
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  });
}


// ── Video List Manager ──────────────────────

function renderVideoList(config) {
  const container = document.getElementById('video-list');
  container.innerHTML = '';

  config.portfolioVideos.forEach((video, index) => {
    const card = document.createElement('div');
    card.className = 'admin-video-card';
    card.innerHTML = `
      <div class="admin-video-card-header">
        <span class="admin-video-number">Video ${index + 1} ${video.isVisible === false ? '(Hidden)' : ''}</span>
        <div class="admin-video-card-actions">
          <button class="admin-btn-icon toggle-visibility-video-btn" data-index="${index}" title="${video.isVisible === false ? 'Show' : 'Hide'}">
            ${video.isVisible === false ? 
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>' : 
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>'}
          </button>
          <button class="admin-btn-icon move-up-video-btn ${index === 0 ? 'disabled' : ''}" data-index="${index}" title="Move Up">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
          </button>
          <button class="admin-btn-icon move-down-video-btn ${index === config.portfolioVideos.length - 1 ? 'disabled' : ''}" data-index="${index}" title="Move Down">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
          <button class="admin-btn admin-btn-danger delete-video-btn" data-index="${index}">Delete</button>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Title</label>
        <input class="form-input video-field" data-index="${index}" data-field="title" type="text" value="${escapeHtml(video.title)}" placeholder="Video title">
      </div>
      <div class="form-group">
        <label class="form-label">Video URL (YouTube Embed or Drive Preview)</label>
        <input class="form-input video-field" data-index="${index}" data-field="videoUrl" type="url" value="${escapeHtml(video.videoUrl)}" placeholder="https://www.youtube.com/embed/...">
      </div>
      <div class="form-group">
        <label class="form-label">Description (Overview)</label>
        <textarea class="form-textarea video-field" data-index="${index}" data-field="description" placeholder="Overview for the portfolio card...">${escapeHtml(video.description)}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Problem</label>
        <textarea class="form-textarea video-field" data-index="${index}" data-field="problem" placeholder="What challenge did this project address?">${escapeHtml(video.problem)}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Goal</label>
        <textarea class="form-textarea video-field" data-index="${index}" data-field="goal" placeholder="What was the intended outcome?">${escapeHtml(video.goal)}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">What I did (Solution)</label>
        <textarea class="form-textarea video-field" data-index="${index}" data-field="solution" placeholder="How did you achieve the goal?">${escapeHtml(video.solution)}</textarea>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Aspect Ratio</label>
          <select class="form-input video-field" data-index="${index}" data-field="ratio">
            <option value="16:9" ${(!video.ratio || video.ratio === '16:9') ? 'selected' : ''}>Horizontal (16:9)</option>
            <option value="9:16" ${video.ratio === '9:16' ? 'selected' : ''}>Vertical Shorts (9:16)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Categories</label>
          <div style="font-size: 0.85rem; color: var(--text-secondary); padding: 12px 16px; background: rgba(0,0,0,0.1); border: 1px dashed var(--border); border-radius: var(--radius-sm);">
            ${video.categories && video.categories.length ? video.categories.join(', ') : 'None assigned'}
            <div style="font-size: 0.75rem; margin-top: 4px;"><em>Manage multi-categories from top right Filters menu</em></div>
          </div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Tags (comma separated)</label>
        <input class="form-input video-field" data-index="${index}" data-field="tags" type="text" value="${video.tags ? video.tags.join(', ') : ''}" placeholder="Tag1, Tag2, Tag3">
      </div>
    `;
    container.appendChild(card);
  });

  // Add video button
  const addBtn = document.createElement('button');
  addBtn.className = 'add-video-btn';
  addBtn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
    Add New Video
  `;
  container.appendChild(addBtn);

  // Bind video field updates
  container.querySelectorAll('.video-field').forEach(field => {
    field.addEventListener('input', () => {
      const idx = parseInt(field.dataset.index);
      const fieldName = field.dataset.field;

      if (fieldName === 'tags') {
        config.portfolioVideos[idx].tags = field.value.split(',').map(t => t.trim()).filter(Boolean);
      } else {
        config.portfolioVideos[idx][fieldName] = field.value;
      }
    });
  });

  // Action Bindings
  container.querySelectorAll('.toggle-visibility-video-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      const video = config.portfolioVideos[idx];
      video.isVisible = video.isVisible === false ? true : false;
      renderVideoList(config);
    });
  });

  container.querySelectorAll('.move-up-video-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      if (idx > 0) {
        moveItemInArray(config.portfolioVideos, idx, idx - 1);
        renderVideoList(config);
      }
    });
  });

  container.querySelectorAll('.move-down-video-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      if (idx < config.portfolioVideos.length - 1) {
        moveItemInArray(config.portfolioVideos, idx, idx + 1);
        renderVideoList(config);
      }
    });
  });

  // Bind delete buttons
  container.querySelectorAll('.delete-video-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      if (config.portfolioVideos.length <= 1) {
        showToast('Must have at least one video', 'error');
        return;
      }
      config.portfolioVideos.splice(idx, 1);
      renderVideoList(config);
      showToast('Video removed', 'success');
    });
  });

  // Bind add button
  addBtn.addEventListener('click', () => {
    config.portfolioVideos.push({
      id: 'v' + Date.now(),
      title: 'New Video',
      description: 'Describe your editing approach here.',
      problem: '',
      goal: '',
      solution: '',
      videoUrl: 'https://www.youtube.com/embed/VIDEO_ID',
      tags: ['Tag'],
      ratio: '16:9',
      categories: [],
      isVisible: true
    });
    renderVideoList(config);
    showToast('New video added', 'success');

    // Scroll to new card
    setTimeout(() => {
      const cards = container.querySelectorAll('.admin-video-card');
      cards[cards.length - 1]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  });
}

// ── Feedback Manager ─────────────────────────
function renderFeedbackList(config) {
  const container = document.getElementById('feedback-list');
  if (!container) return;
  container.innerHTML = '';
  if (!config.feedbacks) config.feedbacks = [];

  config.feedbacks.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'admin-video-card'; // Reuse style
    card.innerHTML = `
      <div class="admin-video-card-header">
        <span class="admin-video-number">Testimonial ${index + 1} ${item.isVisible === false ? '(Hidden)' : ''}</span>
        <div class="admin-video-card-actions">
          <button class="admin-btn-icon toggle-visibility-fb-btn" data-index="${index}" title="${item.isVisible === false ? 'Show' : 'Hide'}">
            ${item.isVisible === false ? 
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>' : 
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>'}
          </button>
          <button class="admin-btn-icon move-up-fb-btn ${index === 0 ? 'disabled' : ''}" data-index="${index}" title="Move Up">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
          </button>
          <button class="admin-btn-icon move-down-fb-btn ${index === config.feedbacks.length - 1 ? 'disabled' : ''}" data-index="${index}" title="Move Down">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
          <button class="admin-btn admin-btn-danger delete-fb-btn" data-index="${index}">Delete</button>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Person Name / Role</label>
        <input class="form-input fb-field" data-index="${index}" data-field="personName" type="text" value="${escapeHtml(item.personName)}" placeholder="John Doe, CEO">
      </div>
      <div class="form-group">
        <label class="form-label">Testimonial Text</label>
        <textarea class="form-textarea fb-field" data-index="${index}" data-field="feedbackText" placeholder="Quote from client...">${escapeHtml(item.feedbackText)}</textarea>
      </div>
    `;
    container.appendChild(card);
  });

  const addBtn = document.createElement('button');
  addBtn.className = 'add-video-btn';
  addBtn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
    Add New Testimonial
  `;
  container.appendChild(addBtn);

  container.querySelectorAll('.fb-field').forEach(field => {
    field.addEventListener('input', () => {
      const idx = parseInt(field.dataset.index);
      config.feedbacks[idx][field.dataset.field] = field.value;
    });
  });

  // Action Bindings
  container.querySelectorAll('.toggle-visibility-fb-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      const fb = config.feedbacks[idx];
      fb.isVisible = fb.isVisible === false ? true : false;
      renderFeedbackList(config);
    });
  });

  container.querySelectorAll('.move-up-fb-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      if (idx > 0) {
        moveItemInArray(config.feedbacks, idx, idx - 1);
        renderFeedbackList(config);
      }
    });
  });

  container.querySelectorAll('.move-down-fb-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      if (idx < config.feedbacks.length - 1) {
        moveItemInArray(config.feedbacks, idx, idx + 1);
        renderFeedbackList(config);
      }
    });
  });

  container.querySelectorAll('.delete-fb-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      config.feedbacks.splice(idx, 1);
      renderFeedbackList(config);
      showToast('Testimonial removed', 'success');
    });
  });

  addBtn.addEventListener('click', () => {
    config.feedbacks.push({
      id: 'f' + Date.now(),
      personName: 'New Client',
      feedbackText: 'They did a great job!',
      isVisible: true
    });
    renderFeedbackList(config);
    showToast('New feedback added', 'success');
  });
}

// ── FAQ Manager ─────────────────────────────
function renderFaqList(config) {
  const container = document.getElementById('admin-faq-list');
  if (!container) return;
  container.innerHTML = '';
  if (!config.faqs) config.faqs = [];

  config.faqs.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'admin-video-card';
    card.innerHTML = `
      <div class="admin-video-card-header">
        <span class="admin-video-number">FAQ ${index + 1}</span>
        <div class="admin-video-card-actions">
          <button class="admin-btn admin-btn-danger delete-faq-btn" data-index="${index}">Delete</button>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Question</label>
        <input class="form-input faq-field" data-index="${index}" data-field="question" type="text" value="${escapeHtml(item.question)}" placeholder="E.g. What is your turnaround time?">
      </div>
      <div class="form-group">
        <label class="form-label">Answer</label>
        <textarea class="form-textarea faq-field" data-index="${index}" data-field="answer" placeholder="Your answer...">${escapeHtml(item.answer)}</textarea>
      </div>
    `;
    container.appendChild(card);
  });

  const addBtn = document.createElement('button');
  addBtn.className = 'add-video-btn';
  addBtn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
    Add New FAQ
  `;
  container.appendChild(addBtn);

  container.querySelectorAll('.faq-field').forEach(field => {
    field.addEventListener('input', () => {
      const idx = parseInt(field.dataset.index);
      config.faqs[idx][field.dataset.field] = field.value;
    });
  });

  container.querySelectorAll('.delete-faq-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      config.faqs.splice(idx, 1);
      renderFaqList(config);
      showToast('FAQ removed', 'success');
    });
  });

  addBtn.addEventListener('click', () => {
    config.faqs.push({
      id: 'q' + Date.now(),
      question: 'New Question',
      answer: 'New Answer'
    });
    renderFaqList(config);
    showToast('New FAQ added', 'success');
  });
}


// ── Export Config as JS File ────────────────

function exportConfig(config) {
  const exportData = deepClone(config);

  const jsContent = `/**
 * ============================================
 *  PORTFOLIO CONFIGURATION FILE
 * ============================================
 *  Edit this file to update your portfolio.
 *  No coding knowledge required — just change
 *  the text between the quotes.
 * ============================================
 */

const PORTFOLIO_CONFIG = ${JSON.stringify(exportData, null, 2)};

// Make config available globally
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PORTFOLIO_CONFIG;
}
`;

  const blob = new Blob([jsContent], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'config.js';
  a.click();
  URL.revokeObjectURL(url);

  showToast('Config exported! Replace js/config.js with the downloaded file.', 'success');
}


// ── GitHub Settings Form ────────────────────

function renderGitHubSettingsForm() {
  const container = document.getElementById('github-settings-form');
  if (!container) return;

  const savedToken = localStorage.getItem('github_token') || '';
  const savedRepo = localStorage.getItem('github_repo') || 'loop-zot/portfolio';
  const isConnected = !!savedToken;

  container.innerHTML = `
    <div class="github-status ${isConnected ? 'connected' : 'disconnected'}">
      <span class="github-status-dot"></span>
      ${isConnected ? 'Connected to GitHub — Ready to publish' : 'Not connected — Enter your GitHub token below'}
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Repository <span style="font-size: 0.8em; color: var(--text-secondary); font-weight: normal;">(owner/repo)</span></label>
        <input class="form-input" type="text" id="field-github-repo" value="${escapeHtml(savedRepo)}" placeholder="username/repository">
      </div>
      <div class="form-group">
        <label class="form-label">Personal Access Token</label>
        <div class="password-wrapper">
          <input class="form-input" type="password" id="field-github-token" value="${escapeHtml(savedToken)}" placeholder="ghp_xxxxxxxxxxxx">
          <button class="eye-btn" type="button" onclick="window.togglePwd('field-github-token', this)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
        </div>
        <p class="github-token-hint">Token is stored only in your browser's localStorage. Never shared or uploaded.</p>
      </div>
    </div>
    <button class="admin-btn admin-btn-primary" id="save-github-settings-btn">Save GitHub Settings</button>
  `;

  document.getElementById('save-github-settings-btn').addEventListener('click', () => {
    const token = document.getElementById('field-github-token').value.trim();
    const repo = document.getElementById('field-github-repo').value.trim();

    if (!token) {
      localStorage.removeItem('github_token');
      localStorage.removeItem('github_repo');
      showToast('GitHub settings cleared.', 'success');
    } else {
      localStorage.setItem('github_token', token);
      localStorage.setItem('github_repo', repo || 'loop-zot/portfolio');
      showToast('GitHub settings saved!', 'success');
    }
    renderGitHubSettingsForm();
  });
}


// ── Publish to GitHub ───────────────────────

async function publishToGitHub(config) {
  const token = localStorage.getItem('github_token');
  const repo = localStorage.getItem('github_repo');

  if (!token || !repo) {
    showToast('Please configure GitHub settings first (scroll to GitHub Deploy Settings).', 'error');
    return;
  }

  const publishBtn = document.getElementById('publish-btn');
  const originalText = publishBtn.innerHTML;
  publishBtn.disabled = true;
  publishBtn.classList.add('publishing');
  publishBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"></polyline><line x1="12" y1="12" x2="12" y2="21"></line><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path><polyline points="16 16 12 12 8 16"></polyline></svg>
    Publishing...
  `;

  try {
    // Generate the config.js file content
    const exportData = deepClone(config);
    const jsContent = `/**
 * ============================================
 *  PORTFOLIO CONFIGURATION FILE
 * ============================================
 *  Edit this file to update your portfolio.
 *  No coding knowledge required — just change
 *  the text between the quotes.
 * ============================================
 */

const PORTFOLIO_CONFIG = ${JSON.stringify(exportData, null, 2)};

// Make config available globally
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PORTFOLIO_CONFIG;
}
`;

    // Step 1: Get the current file's SHA (required for updates)
    const filePath = 'js/config.js';
    const apiUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`;

    const getResponse = await fetch(apiUrl, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!getResponse.ok && getResponse.status !== 404) {
      throw new Error(`GitHub API error: ${getResponse.status} ${getResponse.statusText}`);
    }

    let sha = null;
    if (getResponse.ok) {
      const fileData = await getResponse.json();
      sha = fileData.sha;
    }

    // Step 2: Update the file
    const updateBody = {
      message: `Update portfolio config — ${new Date().toLocaleString()}`,
      content: btoa(unescape(encodeURIComponent(jsContent))),
      branch: 'main'
    };

    if (sha) {
      updateBody.sha = sha;
    }

    const putResponse = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateBody)
    });

    if (!putResponse.ok) {
      const errorData = await putResponse.json();
      throw new Error(errorData.message || `Failed: ${putResponse.status}`);
    }

    // Also save to localStorage
    saveConfig(config);

    showToast('Published! Your site will update in 1-2 minutes.', 'success');

  } catch (error) {
    console.error('Publish error:', error);
    showToast(`Publish failed: ${error.message}`, 'error');
  } finally {
    publishBtn.disabled = false;
    publishBtn.classList.remove('publishing');
    publishBtn.innerHTML = originalText;
  }
}


// ── Utilities ───────────────────────────────

function bindInput(id, callback) {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('input', () => callback(el.value));
  }
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showToast(message, type = 'success') {
  // Remove existing toast
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

window.togglePwd = function(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isPwd = input.type === 'password';
  input.type = isPwd ? 'text' : 'password';
  btn.innerHTML = isPwd ? 
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>` : 
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
};

function moveItemInArray(arr, fromIndex, toIndex) {
  const element = arr[fromIndex];
  arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, element);
}

// ── Filter Settings Manager ─────────────────
function setupFilterModal(config) {
  const modal = document.getElementById('filter-modal');
  const openBtn = document.getElementById('manage-filters-btn');
  const closeBtn = document.getElementById('close-filter-modal');
  const overlay = modal;
  
  if (!modal || !openBtn) return;

  const toggle = document.getElementById('field-filter-toggle');
  const list = document.getElementById('filter-categories-list');
  const addBtn = document.getElementById('add-category-btn');
  const input = document.getElementById('new-category-input');
  const applyBtn = document.getElementById('save-filter-modal');

  if (!config.filters) config.filters = { enabled: true, categories: ["Short Form", "Long Form"] };
  
  function renderCategories() {
    list.innerHTML = config.filters.categories.map((cat, i) => {
      const catVideos = config.portfolioVideos.filter(v => v.categories && v.categories.includes(cat));
      const otherVideos = config.portfolioVideos.filter(v => !v.categories || !v.categories.includes(cat));
      
      const vidsHtml = catVideos.map(v => `
        <div class="filter-video-item">
          <span class="truncate" style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">📽️ ${escapeHtml(v.title)}</span>
          <button class="remove-vid-btn admin-btn-icon" data-vid-id="${v.id}" data-cat="${escapeHtml(cat)}" title="Remove from category">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      `).join('');

      const selectOpts = otherVideos.map(v => `<option value="${v.id}">${escapeHtml(v.title)}</option>`).join('');

      return `
      <div class="filter-category-wrap">
        <div class="filter-category-item" style="border-bottom: none; padding-bottom: 0px; margin-bottom: 10px;">
          <span><strong>${escapeHtml(cat)}</strong></span>
          <button class="delete-cat-btn" data-index="${i}">Delete Category</button>
        </div>
        <div class="filter-video-list">
          ${vidsHtml ? vidsHtml : '<p class="filter-empty" style="font-size: 0.8em; color: var(--text-secondary); margin: 0 0 10px 0;">No videos assigned.</p>'}
        </div>
        ${otherVideos.length > 0 ? `
          <div class="filter-assign-group" style="display: flex; gap: 10px; margin-bottom: 20px;">
            <select class="form-input assign-vid-select" id="assign-vid-${i}" style="margin: 0; flex: 1;">
              <option value="">-- Assign a video --</option>
              ${selectOpts}
            </select>
            <button class="admin-btn admin-btn-primary assign-vid-btn" data-cat="${escapeHtml(cat)}" data-select-id="assign-vid-${i}">Assign</button>
          </div>
        ` : '<div style="margin-bottom: 20px;"></div>'}
        <hr style="border: none; border-top: 1px solid var(--border); margin-bottom: 20px;">
      </div>
      `;
    }).join('');

    list.querySelectorAll('.delete-cat-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        let i = parseInt(btn.dataset.index);
        let cat = config.filters.categories[i];
        config.filters.categories.splice(i, 1);
        config.portfolioVideos.forEach(v => {
          if (v.categories && v.categories.includes(cat)) {
            v.categories.splice(v.categories.indexOf(cat), 1);
          }
        });
        renderCategories();
      });
    });

    list.querySelectorAll('.remove-vid-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        let vidId = btn.dataset.vidId;
        let cat = btn.dataset.cat;
        let video = config.portfolioVideos.find(v => v.id === vidId);
        if (video && video.categories && video.categories.includes(cat)) {
           video.categories.splice(video.categories.indexOf(cat), 1);
        }
        renderCategories();
      });
    });

    list.querySelectorAll('.assign-vid-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        let cat = btn.dataset.cat;
        let select = document.getElementById(btn.dataset.selectId);
        if (select && select.value) {
          let video = config.portfolioVideos.find(v => v.id === select.value);
          if (video) {
             if (!video.categories) video.categories = [];
             if (!video.categories.includes(cat)) video.categories.push(cat);
          }
          renderCategories();
        }
      });
    });
  }

  function openModal() {
    toggle.checked = config.filters.enabled;
    renderCategories();
    overlay.classList.add('active');
  }

  function closeModal() {
    overlay.classList.remove('active');
    renderVideoList(config);
  }

  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  applyBtn.addEventListener('click', closeModal);

  toggle.addEventListener('change', (e) => {
    config.filters.enabled = e.target.checked;
  });

  addBtn.addEventListener('click', () => {
    const val = input.value.trim();
    if (val && !config.filters.categories.includes(val)) {
      config.filters.categories.push(val);
      input.value = '';
      renderCategories();
    }
  });
}



window.togglePwd = function(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isPwd = input.type === 'password';
  input.type = isPwd ? 'text' : 'password';
  btn.innerHTML = isPwd ? 
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>` : 
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
};
