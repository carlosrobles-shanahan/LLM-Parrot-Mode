// Main content script that modifies Claude and ChatGPT responses

// Default toggle states (all enabled by default)
let toggleStates = {
  firstPerson: true,
  emotional: true,
  epistemic: true,
  agency: true,
  memory: true
};

// ─── Counter state ──────────────────────────────────────────────────────────
let sessionCount = 0;
let lifetimeCount = 0;
const DIMENSIONS = ['firstPerson', 'emotional', 'epistemic', 'agency', 'memory'];
let sessionByDim  = { firstPerson: 0, emotional: 0, epistemic: 0, agency: 0, memory: 0 };
let lifetimeByDim = { firstPerson: 0, emotional: 0, epistemic: 0, agency: 0, memory: 0 };

// Load saved toggle states and lifetime counters from storage
chrome.storage.sync.get(['toggleStates', 'lifetimeCount', 'lifetimeByDim'], (result) => {
  if (result.toggleStates)  toggleStates  = result.toggleStates;
  if (result.lifetimeCount) lifetimeCount = result.lifetimeCount;
  if (result.lifetimeByDim) lifetimeByDim = result.lifetimeByDim;
  console.log('PARROT Mode loaded. Lifetime replacements:', lifetimeCount);
  processExistingMessages();
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.toggleStates) {
    toggleStates = changes.toggleStates.newValue;
    processExistingMessages();
  }
});

function saveCounters() {
  chrome.storage.sync.set({ lifetimeCount, lifetimeByDim, sessionCount, sessionByDim });
}

// ─── Inject tooltip stylesheet into the page ────────────────────────────────
// Claude and ChatGPT both suppress the browser's native title= tooltip via
// their React event layers. We inject our own CSS tooltip instead, driven by
// a data-parrot-original attribute on each replacement span.
(function injectTooltipStyles() {
  const style = document.createElement('style');
  style.id = 'parrot-mode-styles';
  style.textContent = `
    [data-parrot-original] {
      position: relative;
      cursor: help;
      border-bottom: 1px dashed rgba(74, 144, 226, 0.5);
    }

    [data-parrot-original]::after {
      content: "Original: " attr(data-parrot-original);
      position: absolute;
      bottom: calc(100% + 6px);
      left: 50%;
      transform: translateX(-50%);
      background: #1a1a2e;
      color: #e8e8f0;
      font-size: 11px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-weight: normal;
      font-style: normal;
      white-space: nowrap;
      padding: 4px 8px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.15s ease;
      z-index: 99999;
    }

    [data-parrot-original]:hover::after {
      opacity: 1;
    }

    /* Prevent tooltip being cut off at left edge */
    [data-parrot-original]::after {
      max-width: 300px;
      white-space: normal;
      text-align: center;
    }
  `;
  // Inject as early as possible; re-inject if head isn't ready yet
  const target = document.head || document.documentElement;
  target.appendChild(style);
})();

// ─── Site detection ─────────────────────────────────────────────────────────
const IS_CHATGPT = location.hostname.includes('chatgpt.com') ||
                   location.hostname.includes('chat.openai.com');
const IS_CLAUDE  = location.hostname.includes('claude.ai');

// ─── Selectors ──────────────────────────────────────────────────────────────
//
// Strategy: instead of a single mixed list, keep site-specific selectors
// separate so we can apply site-specific exclusion logic cleanly.
//
// Claude  – assistant turns have .font-claude-message or [data-is-streaming]
//           User turns have [data-human-turn] — never have those classes.
//
// ChatGPT – ONLY use [data-message-author-role="assistant"] as the root.
//           We then process the .markdown-new-styling *inside* it.
//           This is the critical fix: we anchor to the role attribute first,
//           then descend — so we can never accidentally land on a user bubble.
//
const CLAUDE_ASSISTANT_SELECTORS = [
  '[data-is-streaming]',
  '.font-claude-message',
  '.font-claude-message .prose'
];

// For ChatGPT we query the outer role container, then scope inside it.
const CHATGPT_ASSISTANT_ROOT = '[data-message-author-role="assistant"]';

// ─── Helper: is this element (or any ancestor) a USER message? ─────────────
function isUserMessage(element) {
  // ChatGPT: role attribute check — works for any depth
  const roleEl = element.closest('[data-message-author-role]');
  if (roleEl && roleEl.getAttribute('data-message-author-role') === 'user') return true;

  // Claude: human-turn marker
  if (element.closest('[data-human-turn]')) return true;

  // ChatGPT: user message text wrapper class
  if (element.closest('.whitespace-pre-wrap')) return true;

  // Extra guard: if we're on ChatGPT and the element is NOT inside an
  // assistant role container at all, treat it as untrusted and skip it.
  if (IS_CHATGPT) {
    const assistantRoot = element.closest(CHATGPT_ASSISTANT_ROOT);
    if (!assistantRoot) return true; // not inside any assistant bubble → skip
  }

  return false;
}

// ─── Helper: is this inside a code block? ──────────────────────────────────
function isCodeBlock(element) {
  return element.closest('pre, code') !== null;
}

// ─── Tooltip span injection ─────────────────────────────────────────────────
// Instead of directly overwriting textNode.textContent (which loses the
// original), we split the text node around each match and wrap matched
// segments in <span title="Original: [phrase]"> elements.
//
function injectTooltipSpans(textNode, replacements) {
  // Build a flat list of { start, end, original, replacement } for this node.
  const text = textNode.textContent;
  const segments = []; // { start, end, original, replacement }

  for (const [key, toggle] of Object.entries(replacements)) {
    if (!toggleStates[key]) continue;
    for (const pattern of toggle.patterns) {
      // Reset lastIndex for global regexes
      pattern.find.lastIndex = 0;
      let match;
      // Use exec loop so we get position info
      const re = new RegExp(pattern.find.source, pattern.find.flags);
      while ((match = re.exec(text)) !== null) {
        // For evaluative patterns, resolve capture-group references in the replacement string
        let resolvedReplacement = pattern.replace;
        if (pattern.evidence) {
          resolvedReplacement = match[0].replace(re, pattern.replace);
        }
        segments.push({
          start: match.index,
          end: match.index + match[0].length,
          original: match[0],
          replacement: resolvedReplacement,
          evidence: pattern.evidence || null,   // only set for evaluative patterns
          isEvaluative: !!pattern.evidence
        });
      }
    }
  }

  if (segments.length === 0) return 0; // nothing to do

  // Sort by start position, remove overlaps (keep first match)
  segments.sort((a, b) => a.start - b.start);
  const nonOverlapping = [];
  let cursor = 0;
  for (const seg of segments) {
    if (seg.start >= cursor) {
      nonOverlapping.push(seg);
      cursor = seg.end;
    }
  }

  if (nonOverlapping.length === 0) return 0;

  // Build a document fragment to replace the text node with
  const frag = document.createDocumentFragment();
  let pos = 0;

  for (const seg of nonOverlapping) {
    // Text before this match
    if (seg.start > pos) {
      frag.appendChild(document.createTextNode(text.slice(pos, seg.start)));
    }

    // The replacement wrapped in a tooltip span.
    // We use data-parrot-original + CSS ::after instead of title=,
    // because Claude and ChatGPT's React layers suppress native title tooltips.
    const span = document.createElement('span');
    span.setAttribute('data-parrot-original', seg.original);
    span.textContent = seg.replacement;

    // Evaluative claims get an extra class + evidence attribute for the click panel
    if (seg.isEvaluative) {
      span.classList.add('evaluative-claim');
      if (seg.evidence) span.setAttribute('data-evidence', seg.evidence);
    }

    frag.appendChild(span);

    pos = seg.end;
  }

  // Any trailing text
  if (pos < text.length) {
    frag.appendChild(document.createTextNode(text.slice(pos)));
  }

  textNode.parentNode.replaceChild(frag, textNode);
  return nonOverlapping.length;
}

// ─── Process a single text node ────────────────────────────────────────────
function processTextNode(textNode) {
  if (!textNode.parentNode) return;
  if (isCodeBlock(textNode.parentElement)) return;

  // Skip text nodes that are already inside one of our tooltip spans
  // (prevents re-processing on the next interval tick)
  if (textNode.parentElement && textNode.parentElement.dataset.parrotDone) return;

  const originalText = textNode.textContent;
  if (!originalText.trim()) return;

  // Use the counting variant first to know if anything would change
  const result = applyReplacementsWithCount(originalText, toggleStates);
  if (originalText === result.text) return; // nothing matched

  // Inject tooltip spans (this replaces the text node in the DOM)
  const count = injectTooltipSpans(textNode, REPLACEMENTS);

  if (count > 0) {
    sessionCount  += count;
    lifetimeCount += count;
    // byDimension from applyReplacementsWithCount is accurate for counts
    DIMENSIONS.forEach(dim => {
      const n = result.byDimension[dim] || 0;
      sessionByDim[dim]  = (sessionByDim[dim]  || 0) + n;
      lifetimeByDim[dim] = (lifetimeByDim[dim] || 0) + n;
    });
    saveCounters();
  }
}

// ─── Walk all text nodes inside an element ─────────────────────────────────
function processElement(element) {
  if (isUserMessage(element)) return;

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
  const textNodes = [];
  let node;
  while ((node = walker.nextNode())) {
    // Skip nodes whose parent is already a parrot span
    if (node.parentElement && node.parentElement.dataset.parrotDone) continue;
    textNodes.push(node);
  }
  // Process in reverse so DOM mutations don't invalidate the walker positions
  textNodes.reverse().forEach(processTextNode);
}

// ─── Process all existing assistant messages on the page ───────────────────
function processExistingMessages() {
  if (IS_CLAUDE) {
    CLAUDE_ASSISTANT_SELECTORS.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(el => {
          if (!isUserMessage(el)) processElement(el);
        });
      } catch (e) {
        console.debug('PARROT: Claude selector failed:', selector, e);
      }
    });
  }

  if (IS_CHATGPT) {
    // Anchor to assistant role containers first, then descend into content
    document.querySelectorAll(CHATGPT_ASSISTANT_ROOT).forEach(assistantEl => {
      // Double-check the role (belt-and-suspenders)
      if (assistantEl.getAttribute('data-message-author-role') !== 'assistant') return;
      processElement(assistantEl);
    });
  }
}

// ─── MutationObserver ───────────────────────────────────────────────────────
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) return;

      if (IS_CLAUDE) {
        const isAssistant = CLAUDE_ASSISTANT_SELECTORS.some(sel => {
          try { return node.matches(sel) || node.querySelector(sel); }
          catch { return false; }
        });
        if (isAssistant && !isUserMessage(node)) processElement(node);
      }

      if (IS_CHATGPT) {
        // Only process if the new node IS an assistant root or is inside one
        const assistantRoot =
          (node.matches && node.matches(CHATGPT_ASSISTANT_ROOT))
            ? node
            : node.closest && node.closest(CHATGPT_ASSISTANT_ROOT);

        if (assistantRoot &&
            assistantRoot.getAttribute('data-message-author-role') === 'assistant') {
          processElement(assistantRoot);
        }
      }
    });
  });
});

observer.observe(document.body, { childList: true, subtree: true });

processExistingMessages();
setInterval(processExistingMessages, 2000);

console.log('PARROT Mode content script initialized');
