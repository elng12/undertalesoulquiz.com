type ReviewDecision = 'pass' | 'revise';

interface ReviewEntry {
  decision: ReviewDecision | null;
  note: string;
}

interface ReviewState {
  schemaVersion: 1;
  sampleVersion: string;
  entries: Record<string, ReviewEntry>;
}

const STORAGE_KEY = 'undertale-soul-quiz:content-review:v3';
const SAMPLE_VERSION = 'original-calibration-v3';
const reviewItems = [...document.querySelectorAll<HTMLElement>('[data-review-id]')];
const progress = requireElement<HTMLElement>('#review-progress');
const gate = requireElement<HTMLElement>('#review-gate');
const statusMessage = requireElement<HTMLElement>('#review-status-message');
const clearDialog = requireElement<HTMLDialogElement>('#clear-review-dialog');
let state = loadState();

for (const item of reviewItems) {
  const id = item.dataset.reviewId;
  if (!id) continue;
  const entry = state.entries[id] ?? { decision: null, note: '' };
  state.entries[id] = entry;
  applyEntry(item, entry);

  for (const button of item.querySelectorAll<HTMLButtonElement>('[data-review-decision]')) {
    button.addEventListener('click', () => {
      const decision = button.dataset.reviewDecision as ReviewDecision;
      entry.decision = entry.decision === decision ? null : decision;
      applyEntry(item, entry);
      persistState();
      updateSummary();
    });
  }

  const note = item.querySelector<HTMLTextAreaElement>('[data-review-note]');
  note?.addEventListener('input', () => {
    entry.note = note.value;
    persistState();
  });
}

for (const filter of document.querySelectorAll<HTMLButtonElement>('[data-review-filter]')) {
  filter.addEventListener('click', () => {
    const selected = filter.dataset.reviewFilter ?? 'all';
    for (const button of document.querySelectorAll<HTMLButtonElement>('[data-review-filter]')) {
      button.setAttribute('aria-pressed', String(button === filter));
    }
    for (const item of reviewItems) {
      item.hidden = selected !== 'all' && item.dataset.reviewGroup !== selected;
    }
    for (const section of document.querySelectorAll<HTMLElement>('[data-review-section]')) {
      section.hidden = selected !== 'all' && section.dataset.reviewSection !== selected;
    }
  });
}

requireElement<HTMLButtonElement>('#copy-review-report').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(buildReport());
    showStatus('Review report copied.', 'success');
  } catch {
    showStatus('The review report could not be copied in this browser.', 'error');
  }
});

requireElement<HTMLButtonElement>('#open-clear-review').addEventListener('click', () => clearDialog.showModal());
requireElement<HTMLButtonElement>('#confirm-clear-review').addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEY);
  state = emptyState();
  for (const item of reviewItems) {
    const id = item.dataset.reviewId;
    if (!id) continue;
    const entry = { decision: null, note: '' } satisfies ReviewEntry;
    state.entries[id] = entry;
    applyEntry(item, entry);
  }
  clearDialog.close();
  updateSummary();
  showStatus('Local review decisions cleared.', 'success');
});

updateSummary();

function applyEntry(item: HTMLElement, entry: ReviewEntry): void {
  item.dataset.reviewStatus = entry.decision ?? 'pending';
  const label = item.querySelector<HTMLElement>('[data-review-status-label]');
  if (label) label.textContent = entry.decision === 'pass' ? 'PASS' : entry.decision === 'revise' ? 'REVISE' : 'PENDING';
  for (const button of item.querySelectorAll<HTMLButtonElement>('[data-review-decision]')) {
    button.setAttribute('aria-pressed', String(button.dataset.reviewDecision === entry.decision));
  }
  const note = item.querySelector<HTMLTextAreaElement>('[data-review-note]');
  if (note) note.value = entry.note;
}

function updateSummary(): void {
  const entries = reviewItems
    .map((item) => state.entries[item.dataset.reviewId ?? ''])
    .filter((entry): entry is ReviewEntry => Boolean(entry));
  const reviewed = entries.filter((entry) => entry.decision !== null).length;
  const revisions = entries.filter((entry) => entry.decision === 'revise').length;
  progress.textContent = `${reviewed} / ${entries.length} reviewed`;

  if (revisions > 0) {
    gate.textContent = `${revisions} REVISION${revisions === 1 ? '' : 'S'} REQUIRED`;
    gate.dataset.tone = 'warning';
  } else if (entries.length > 0 && reviewed === entries.length) {
    gate.textContent = 'CALIBRATION V3 PASS';
    gate.dataset.tone = 'success';
  } else {
    gate.textContent = 'REVIEW PENDING';
    gate.dataset.tone = 'pending';
  }
}

function buildReport(): string {
  const lines = [
    'Calibration v3 content review',
    `Sample: ${SAMPLE_VERSION}`,
    `Gate: ${gate.textContent ?? 'REVIEW PENDING'}`,
    '',
  ];
  for (const item of reviewItems) {
    const id = item.dataset.reviewId ?? 'unknown';
    const title = item.querySelector<HTMLElement>('[data-review-title]')?.textContent?.trim() ?? id;
    const entry = state.entries[id] ?? { decision: null, note: '' };
    lines.push(`[${entry.decision?.toUpperCase() ?? 'PENDING'}] ${title}`);
    if (entry.note.trim()) lines.push(`Note: ${entry.note.trim()}`);
  }
  return lines.join('\n');
}

function loadState(): ReviewState {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as unknown;
    if (!isReviewState(parsed)) return emptyState();
    return parsed;
  } catch {
    return emptyState();
  }
}

function isReviewState(value: unknown): value is ReviewState {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<ReviewState>;
  if (candidate.schemaVersion !== 1 || candidate.sampleVersion !== SAMPLE_VERSION || !candidate.entries) return false;
  return Object.values(candidate.entries).every((entry) => {
    if (!entry || typeof entry !== 'object') return false;
    const item = entry as Partial<ReviewEntry>;
    return (item.decision === null || item.decision === 'pass' || item.decision === 'revise')
      && typeof item.note === 'string';
  });
}

function emptyState(): ReviewState {
  return { schemaVersion: 1, sampleVersion: SAMPLE_VERSION, entries: {} };
}

function persistState(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    showStatus('This browser could not save the review locally.', 'error');
  }
}

function showStatus(message: string, tone: 'success' | 'error'): void {
  statusMessage.textContent = message;
  statusMessage.dataset.tone = tone;
  statusMessage.hidden = false;
}

function requireElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing content review element: ${selector}`);
  return element;
}
