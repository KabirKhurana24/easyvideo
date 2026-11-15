const initialScenes = [
  {
    id: 3, number: '03', title: 'Working arrangements', area: 'OFFICE ATTENDANCE', impact: 'High impact', impactClass: 'high',
    summary: 'The minimum number of in-office days has increased from two to three per week.',
    oldHeadline: 'Two days in the office', newHeadline: 'Three days together',
    oldText: 'Our hybrid approach asks every team member to work from the office at least two days each week.',
    newText: 'Our hybrid approach asks every team member to work from an office or hub at least three days each week.',
    source: 'Section 2.1 · Office attendance',
    sourceQuote: 'Employees are expected to work from an office or hub at least three days per week.',
    status: 'pending'
  },
  {
    id: 7, number: '07', title: 'Planning time away', area: 'LEAVE REQUESTS', impact: 'Medium impact', impactClass: 'medium',
    summary: 'The recommended notice period for planned leave has changed from five to ten business days.',
    oldHeadline: 'Give us five days’ notice', newHeadline: 'Plan ten business days ahead',
    oldText: 'For planned time away, submit your leave request at least five days in advance so your team can plan ahead.',
    newText: 'For planned time away, submit your leave request at least ten business days in advance so your team can plan ahead.',
    source: 'Section 4.3 · Planned leave',
    sourceQuote: 'Employees should submit planned leave requests at least ten business days in advance.',
    status: 'pending'
  },
  {
    id: 9, number: '09', title: 'Getting your request approved', area: 'APPROVAL WORKFLOW', impact: 'Medium impact', impactClass: 'medium',
    summary: 'The approval owner has moved from a direct manager to the People Partner for extended leave.',
    oldHeadline: 'Your manager approves', newHeadline: 'Your People Partner reviews',
    oldText: 'Your direct manager reviews and approves extended leave requests. You will receive confirmation by email.',
    newText: 'Your People Partner reviews extended leave requests in partnership with your manager. You will receive confirmation by email.',
    source: 'Section 4.5 · Extended leave approval',
    sourceQuote: 'Extended leave requests are reviewed by the assigned People Partner in partnership with the employee’s manager.',
    status: 'pending'
  }
];

const languagesSeed = [
  { code: 'EN', flag: '🇬🇧', name: 'English', locale: 'Original language', note: 'Narration and on-screen copy updated for all accepted scenes.', segments: 3, status: 'review' },
  { code: 'HI', flag: '🇮🇳', name: 'Hindi', locale: 'हिन्दी', note: 'Two translated captions may need line-break adjustments after the new wording.', segments: 3, status: 'review' },
  { code: 'DE', flag: '🇩🇪', name: 'German', locale: 'Deutsch', note: 'Voiceover timing adjusted. Check the longer office-attendance sentence.', segments: 3, status: 'review' },
  { code: 'FR', flag: '🇫🇷', name: 'French', locale: 'Français', note: 'Updated segments generated. Terminology is consistent with the approved glossary.', segments: 3, status: 'review' }
];

let scenes = structuredClone(initialScenes);
let languages = structuredClone(languagesSeed);
let currentView = 'review';
let activeSceneId = null;
let activeLanguageCode = null;
let sourceFile = { name: 'Remote_Work_Policy_v2.pdf', meta: 'PDF document · 2.4 MB', version: 'Policy v2 · Nov 12' };
let history = [{ version: '1.0', title: 'Initial training published', description: 'Original remote work onboarding video created from Remote_Work_Policy_v1.pdf.', date: 'August 18, 2026', author: 'People & Culture', tags: ['12 scenes', '4 languages'] }];
let isPublished = false;

const $ = (selector) => document.querySelector(selector);
const sceneList = $('#sceneList');

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function getScene(id) { return scenes.find((scene) => scene.id === Number(id)); }
function reviewedCount() { return scenes.filter((scene) => scene.status !== 'pending').length; }
function acceptedCount() { return scenes.filter((scene) => scene.status === 'accepted').length; }
function allScenesReviewed() { return reviewedCount() === scenes.length; }
function languagesReviewed() { return languages.filter((language) => language.status === 'approved').length; }
function allLanguagesReviewed() { return languagesReviewed() === languages.length; }

function toast(message, kind = 'success') {
  const node = document.createElement('div');
  node.className = 'toast';
  node.innerHTML = `<i style="background:${kind === 'warning' ? '#e5aa57' : '#68c39b'}"></i>${escapeHtml(message)}`;
  $('#toastRegion').appendChild(node);
  setTimeout(() => node.remove(), 3300);
}

function renderScenes() {
  const ordered = [...scenes].sort((a, b) => a.id - b.id);
  sceneList.innerHTML = ordered.map((scene) => {
    const stateMarkup = scene.status === 'accepted'
      ? '<span class="review-state accepted">✓ Accepted</span>'
      : scene.status === 'rejected'
        ? '<span class="review-state rejected">↶ Kept current</span>'
        : `<div class="scene-actions"><button class="mini-action" data-action="reject" data-id="${scene.id}">Keep current</button><button class="mini-action accept" data-action="accept" data-id="${scene.id}">Accept update ✓</button></div>`;
    return `
      <article class="scene-card" data-scene-card="${scene.id}">
        <div class="scene-card-top">
          <div class="scene-number">${scene.number}</div>
          <div class="scene-main">
            <div class="scene-kicker">SCENE ${scene.number} · ${escapeHtml(scene.area)}</div>
            <h3 class="scene-title">${escapeHtml(scene.title)}</h3>
            <p class="scene-description">${escapeHtml(scene.summary)}</p>
          </div>
          <span class="impact-pill impact-${scene.impactClass}">${scene.impact}</span>
        </div>
        <div class="scene-diff">
          <div class="diff-line"><span class="diff-tag old">BEFORE</span><span class="diff-text">${escapeHtml(scene.oldHeadline)}</span></div>
          <div class="diff-line"><span class="diff-tag new">SUGGESTED</span><span class="diff-text new-text">${escapeHtml(scene.newHeadline)}</span></div>
        </div>
        <div class="scene-card-footer">
          <span class="source-ref">↳ ${escapeHtml(scene.source)}</span>
          <div class="scene-actions"><button class="mini-action" data-action="view" data-id="${scene.id}">Inspect scene ↗</button>${stateMarkup}</div>
        </div>
      </article>`;
  }).join('');
  updateReadiness();
}

function updateReadiness() {
  const reviewed = reviewedCount();
  $('#readinessText').textContent = `${reviewed} of 3 changes reviewed`;
  $('#readinessBar').style.width = `${(reviewed / 3) * 100}%`;
  $('#pendingStat').textContent = String(scenes.filter((scene) => scene.status === 'pending').length);
  $('#changeCount').textContent = String(scenes.filter((scene) => scene.status === 'pending').length || 3);
  $('#goLocalization').disabled = !allScenesReviewed();
  $('#goLocalization').innerHTML = allScenesReviewed() ? 'Continue to localization <span>→</span>' : 'Continue to localization <span>→</span>';
  const step = document.querySelector('[data-step="localization"]');
  if (step) step.classList.toggle('complete', allScenesReviewed());
  const locNumber = step?.querySelector('.step-number');
  if (locNumber && allScenesReviewed()) locNumber.textContent = '✓';
  renderLanguages();
}

function renderLanguages() {
  $('#languageGrid').innerHTML = languages.map((language) => {
    const approved = language.status === 'approved';
    return `<article class="language-card">
      <div class="language-card-top">
        <div class="language-id"><div class="flag">${language.flag}</div><div><strong>${language.name}</strong><small>${language.locale}</small></div></div>
        <span class="language-status ${approved ? 'approved' : 'review'}">${approved ? '✓ Reviewed' : 'Needs review'}</span>
      </div>
      <div class="language-scene"><span>Updated segments</span><strong>${acceptedCount()} of 3 scenes</strong></div>
      <p>${escapeHtml(language.note)}</p>
      <button class="button ${approved ? 'button-secondary' : 'button-outline'} full-width" data-language="${language.code}">${approved ? 'Review again ↗' : 'Review language →'}</button>
    </article>`;
  }).join('');
  $('#openPublish').disabled = !allLanguagesReviewed();
  const step = document.querySelector('[data-step="publish"]');
  if (step) step.classList.toggle('complete', allLanguagesReviewed());
  const stepNumber = step?.querySelector('.step-number');
  if (stepNumber && allLanguagesReviewed()) stepNumber.textContent = '✓';
}

function renderHistory() {
  $('#historyPanel').innerHTML = [...history].reverse().map((item, index) => `
    <div class="history-row ${index === 0 ? 'latest' : ''}">
      <div class="history-marker">${index === 0 ? '✓' : '◷'}</div>
      <div class="history-detail">
        <div class="history-title"><strong>Version ${item.version} · ${escapeHtml(item.title)}</strong>${index === 0 && isPublished ? '<span class="version-tag">LATEST</span>' : ''}</div>
        <p>${escapeHtml(item.description)}</p>
        <span class="history-meta">${escapeHtml(item.date)} · ${escapeHtml(item.author)}</span>
        <div class="history-chips">${item.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
      </div>
    </div>`).join('');
}

function showView(view) {
  currentView = view;
  ['review', 'localization', 'history', 'library'].forEach((name) => {
    const element = name === 'review' ? $('#reviewView') : name === 'localization' ? $('#localizationView') : name === 'history' ? $('#historyView') : $('#libraryView');
    element.hidden = name !== view;
  });
  document.querySelectorAll('.nav-item').forEach((button) => button.classList.toggle('active', button.dataset.view === view));
  const breadcrumb = $('.breadcrumbs strong');
  breadcrumb.textContent = view === 'review' ? 'Change Studio' : view === 'localization' ? 'Localization QA' : view === 'history' ? 'Version history' : 'Training library';
  if (view === 'history') renderHistory();
  if (view === 'localization') renderLanguages();
}

function openScene(id) {
  const scene = getScene(id);
  if (!scene) return;
  activeSceneId = scene.id;
  $('#modalSceneNumber').textContent = `SCENE ${scene.number}`;
  $('#sceneModalTitle').textContent = scene.title;
  $('#oldSceneHeadline').textContent = scene.oldHeadline;
  $('#oldSceneScript').textContent = scene.oldText;
  $('#newSceneHeadline').value = scene.newHeadline;
  $('#newSceneScript').value = scene.newText;
  $('#previewCaption').textContent = scene.newHeadline;
  $('#sourceReference').textContent = `${scene.source} · “${scene.sourceQuote}”`;
  $('#sceneModal').hidden = false;
}

function closeModal(id) { const element = document.getElementById(id); if (element) element.hidden = true; }

function setSceneStatus(id, status) {
  const scene = getScene(id);
  if (!scene) return;
  scene.status = status;
  if (status === 'rejected') toast(`Scene ${scene.number} will keep its current version.`, 'warning');
  else toast(`Scene ${scene.number} update accepted.`);
  renderScenes();
}

function openLanguage(code) {
  const language = languages.find((item) => item.code === code);
  if (!language) return;
  activeLanguageCode = code;
  $('#languageModalTitle').textContent = `${language.name} · ${language.locale}`;
  $('#languageModalNote').textContent = language.note;
  $('#languageModalSegments').innerHTML = scenes.filter((scene) => scene.status === 'accepted').map((scene) => `
    <div class="translation-segment"><div><span>SCENE ${scene.number}</span><strong>${escapeHtml(scene.newHeadline)}</strong></div><p>${escapeHtml(scene.newText)}</p><div class="translation-meta">${language.code === 'EN' ? 'Source language · Updated copy' : 'AI translation · Ready for human review'}</div></div>`).join('') || '<p class="empty-translation">No scene changes were accepted. Existing translated scenes will be preserved.</p>';
  $('#confirmLanguageReview').textContent = language.status === 'approved' ? 'Mark as needs review' : 'Approve language review ✓';
  $('#localizationModal').hidden = false;
}

function resetDemo() {
  scenes = structuredClone(initialScenes);
  languages = structuredClone(languagesSeed);
  sourceFile = { name: 'Remote_Work_Policy_v2.pdf', meta: 'PDF document · 2.4 MB', version: 'Policy v2 · Nov 12' };
  history = [{ version: '1.0', title: 'Initial training published', description: 'Original remote work onboarding video created from Remote_Work_Policy_v1.pdf.', date: 'August 18, 2026', author: 'People & Culture', tags: ['12 scenes', '4 languages'] }];
  isPublished = false;
  $('#sourceFileName').textContent = sourceFile.name;
  $('#sourceFileMeta').textContent = sourceFile.meta;
  $('#sourceVersionLabel').textContent = sourceFile.version;
  $('#publishNote').value = 'Updated remote work and leave policy guidance.';
  renderScenes();
  renderHistory();
  showView('review');
  toast('Demo reset. You are back at the start of the update workflow.');
}

sceneList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const { action, id } = button.dataset;
  if (action === 'view') openScene(id);
  if (action === 'accept') setSceneStatus(id, 'accepted');
  if (action === 'reject') setSceneStatus(id, 'rejected');
});

$('#languageGrid').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-language]');
  if (button) openLanguage(button.dataset.language);
});

document.querySelectorAll('.nav-item').forEach((button) => button.addEventListener('click', () => showView(button.dataset.view)));
$('#resetDemo').addEventListener('click', resetDemo);
$('#unchangedToggle').addEventListener('click', () => {
  const list = $('#unchangedList');
  list.hidden = !list.hidden;
  $('#unchangedToggle').classList.toggle('open', !list.hidden);
});
$('#goLocalization').addEventListener('click', () => {
  if (!allScenesReviewed()) return;
  showView('localization');
});
$('#backToReview').addEventListener('click', () => showView('review'));
$('#historyBack').addEventListener('click', () => showView('review'));
$('#openCurrentProject').addEventListener('click', () => showView('review'));
$('#libraryOpen').addEventListener('click', () => showView('review'));
$('#openPublish').addEventListener('click', () => {
  if (!allLanguagesReviewed()) return;
  $('#publishSceneCount').textContent = `${acceptedCount()} of 3`;
  $('#publishLanguageCount').textContent = `${languagesReviewed()} of 4`;
  $('#publishModal').hidden = false;
});
$('#viewOriginal').addEventListener('click', () => { $('#videoModal').hidden = false; });
$('#showMethodology').addEventListener('click', () => { $('#infoModal').hidden = false; });

$('#sceneModal').addEventListener('click', (event) => { if (event.target === $('#sceneModal')) closeModal('sceneModal'); });
$('#localizationModal').addEventListener('click', (event) => { if (event.target === $('#localizationModal')) closeModal('localizationModal'); });
document.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', () => closeModal(button.dataset.close)));

$('#acceptFromModal').addEventListener('click', () => {
  const scene = getScene(activeSceneId);
  if (!scene) return;
  scene.newHeadline = $('#newSceneHeadline').value.trim() || scene.newHeadline;
  scene.newText = $('#newSceneScript').value.trim() || scene.newText;
  scene.status = 'accepted';
  closeModal('sceneModal');
  renderScenes();
  toast(`Scene ${scene.number} update accepted.`);
});
$('#rejectFromModal').addEventListener('click', () => {
  if (activeSceneId !== null) setSceneStatus(activeSceneId, 'rejected');
  closeModal('sceneModal');
});
$('#regenerateScene').addEventListener('click', () => {
  const button = $('#regenerateScene');
  button.disabled = true;
  button.textContent = '✳ Generating preview…';
  setTimeout(() => {
    $('#previewCaption').textContent = $('#newSceneHeadline').value || 'Updated training content';
    button.disabled = false;
    button.textContent = '↻ Regenerate preview';
    toast('Preview refreshed using the edited script.');
  }, 850);
});
$('#newSceneHeadline').addEventListener('input', (event) => { $('#previewCaption').textContent = event.target.value; });

$('#confirmLanguageReview').addEventListener('click', () => {
  const language = languages.find((item) => item.code === activeLanguageCode);
  if (!language) return;
  language.status = language.status === 'approved' ? 'review' : 'approved';
  closeModal('localizationModal');
  renderLanguages();
  const remaining = languages.length - languagesReviewed();
  toast(language.status === 'approved' ? `${language.name} review approved. ${remaining} remaining.` : `${language.name} returned to review.`, language.status === 'approved' ? 'success' : 'warning');
});
$('#confirmPublish').addEventListener('click', () => {
  const note = $('#publishNote').value.trim() || 'Updated training content.';
  history.push({ version: '1.1', title: 'Policy update published', description: note, date: 'November 13, 2026', author: 'Kabir Khurana', tags: [`${acceptedCount()} scenes updated`, '4 languages reviewed', '9 scenes preserved'] });
  isPublished = true;
  closeModal('publishModal');
  renderHistory();
  showView('history');
  toast('Version 1.1 published to the demo version history.');
  const publishStep = document.querySelector('[data-step="publish"]');
  if (publishStep) {
    publishStep.classList.add('complete');
    const number = publishStep.querySelector('.step-number');
    if (number) number.textContent = '✓';
  }
});

$('#uploadSource').addEventListener('click', () => $('#sourceInput').click());
$('#sourceInput').addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  sourceFile = { name: file.name, meta: `${file.type || 'Document'} · ${(file.size / (1024 * 1024)).toFixed(1)} MB`, version: 'New source · Just uploaded' };
  $('#sourceFileName').textContent = sourceFile.name;
  $('#sourceFileMeta').textContent = sourceFile.meta;
  $('#sourceVersionLabel').textContent = sourceFile.version;
  toast('Source attached. Demo change analysis remains pre-seeded for this prototype.');
  event.target.value = '';
});

$('#sortChanges').addEventListener('click', () => {
  const sorted = [...scenes].sort((a, b) => (a.impactClass === 'high' ? -1 : 1) - (b.impactClass === 'high' ? -1 : 1));
  scenes = sorted;
  renderScenes();
  toast('Changes sorted by impact.');
});

renderScenes();
renderHistory();
