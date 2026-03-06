// Popup script – handles toggles, counters, accordions, and tab switching

const DIMENSIONS = ['firstPerson', 'emotional', 'epistemic', 'agency', 'memory'];

// ── Tab switching ─────────────────────────────────────────────────────────────
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const tabName = tab.dataset.tab;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
  });
});

// ── About accordion ───────────────────────────────────────────────────────────
const aboutHeader = document.getElementById('aboutHeader');
const aboutBody   = document.getElementById('aboutBody');
const aboutArrow  = document.getElementById('aboutArrow');

if (aboutHeader) {
  aboutHeader.addEventListener('click', () => {
    const isOpen = aboutBody.classList.toggle('open');
    aboutArrow.classList.toggle('open', isOpen);
  });
}

// ── Breakdown accordion ───────────────────────────────────────────────────────
const breakdownToggle = document.getElementById('breakdownToggle');
const breakdownBody   = document.getElementById('breakdownBody');

if (breakdownToggle) {
  breakdownToggle.addEventListener('click', () => {
    const isOpen = breakdownBody.classList.toggle('open');
    breakdownToggle.textContent = isOpen
      ? '▼ hide breakdown by dimension'
      : '▶ show breakdown by dimension';
  });
}

// ── Counter display helpers ───────────────────────────────────────────────────
function updateCounterDisplay(sessionCount, lifetimeCount, sessionByDim) {
  const sessionEl  = document.getElementById('sessionValue');
  const lifetimeEl = document.getElementById('lifetimeValue');

  if (sessionEl)  sessionEl.textContent  = (sessionCount  || 0).toLocaleString();
  if (lifetimeEl) lifetimeEl.textContent = (lifetimeCount || 0).toLocaleString();

  // Per-dimension breakdown (shows session counts)
  DIMENSIONS.forEach(dim => {
    const el = document.getElementById(`dim-${dim}`);
    if (el) el.textContent = ((sessionByDim || {})[dim] || 0).toLocaleString();
  });
}

// Load counters when popup opens
chrome.storage.sync.get(['sessionCount', 'lifetimeCount', 'sessionByDim'], (result) => {
  updateCounterDisplay(result.sessionCount, result.lifetimeCount, result.sessionByDim);
});

// Stay live while popup is open (content.js writes to storage as it works)
chrome.storage.onChanged.addListener((changes) => {
  const sessionCount  = changes.sessionCount  ? changes.sessionCount.newValue  : null;
  const lifetimeCount = changes.lifetimeCount ? changes.lifetimeCount.newValue : null;
  const sessionByDim  = changes.sessionByDim  ? changes.sessionByDim.newValue  : null;

  // Only re-read if at least one counter changed
  if (sessionCount !== null || lifetimeCount !== null || sessionByDim !== null) {
    chrome.storage.sync.get(['sessionCount', 'lifetimeCount', 'sessionByDim'], (result) => {
      updateCounterDisplay(result.sessionCount, result.lifetimeCount, result.sessionByDim);
    });
  }
});

// Reset session counter (does NOT reset lifetime)
const counterResetBtn = document.getElementById('counterReset');
if (counterResetBtn) {
  counterResetBtn.addEventListener('click', () => {
    const zeroDims = { firstPerson: 0, emotional: 0, epistemic: 0, agency: 0, memory: 0 };
    chrome.storage.sync.set({ sessionCount: 0, sessionByDim: zeroDims });
    updateCounterDisplay(0, null, zeroDims);
    // Re-read lifetime so the display stays correct
    chrome.storage.sync.get(['lifetimeCount'], (r) => {
      updateCounterDisplay(0, r.lifetimeCount, zeroDims);
    });
  });
}

// ── Toggle states ─────────────────────────────────────────────────────────────
chrome.storage.sync.get(['toggleStates'], (result) => {
  const states = result.toggleStates || {
    firstPerson: true, emotional: true, epistemic: true, agency: true, memory: true
  };
  DIMENSIONS.forEach(dim => {
    const cb = document.getElementById(dim);
    if (cb) cb.checked = states[dim];
  });
});

DIMENSIONS.forEach(dim => {
  const cb = document.getElementById(dim);
  if (cb) {
    cb.addEventListener('change', (e) => {
      chrome.storage.sync.get(['toggleStates'], (result) => {
        const states = result.toggleStates || {};
        states[dim] = e.target.checked;
        chrome.storage.sync.set({ toggleStates: states });
      });
    });
  }
});

// Toggle All button
const toggleAllBtn = document.getElementById('toggleAll');
if (toggleAllBtn) {
  toggleAllBtn.addEventListener('click', () => {
    const firstCb = document.getElementById('firstPerson');
    const newState = firstCb ? !firstCb.checked : true;
    const states = {};
    DIMENSIONS.forEach(dim => {
      const cb = document.getElementById(dim);
      if (cb) { cb.checked = newState; states[dim] = newState; }
    });
    chrome.storage.sync.set({ toggleStates: states });
  });
}

// Reset Toggles button (restores all to on)
const resetBtn = document.getElementById('reset');
if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    const states = { firstPerson: true, emotional: true, epistemic: true, agency: true, memory: true };
    DIMENSIONS.forEach(dim => {
      const cb = document.getElementById(dim);
      if (cb) cb.checked = true;
    });
    chrome.storage.sync.set({ toggleStates: states });
  });
}

// ── Prompt card copy ──────────────────────────────────────────────────────
const PROMPT_TEXT = `When evaluating my work, provide evidence-based assessments:\n\nMode A (for important work): Give comprehensive analysis with sources, comparisons, and calibration data. For any quality claim, cite:\n- Comparable examples\n- Quantitative and/or qualitative benchmarks or percentiles\n- Specific observations that led to the assessment\n- Sources when claiming standards or best practices\n\nMode B (for casual ideas): Offer quick assessment with option to elaborate.\n\nAlways cite sources when claiming quality levels, percentiles, or comparisons. I value verification over encouragement.`;

const promptCopyBtn = document.getElementById('promptCopyBtn');

if (promptCopyBtn) {
  promptCopyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(PROMPT_TEXT).then(() => {
      promptCopyBtn.textContent = '✅ Copied!';
      promptCopyBtn.classList.add('copied');
      setTimeout(() => {
        promptCopyBtn.textContent = '📋 Copy Prompt';
        promptCopyBtn.classList.remove('copied');
      }, 2000);
    });
  });
}
