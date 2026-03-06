// All regex patterns organized by toggle category
const REPLACEMENTS = {
  firstPerson: {
    name: "First-Person Language",
    description: '"I think" → "🦜 Model suggests 🦜"',
    patterns: [
      { find: /\bI think\b/gi,                replace: "🦜 Model suggests 🦜" },
      { find: /\bI believe\b/gi,              replace: "🦜 Model indicates 🦜" },
      { find: /\bI suggest\b/gi,              replace: "🦜 Model recommends 🦜" },
      { find: /\bI recommend\b/gi,            replace: "🦜 Model recommends 🦜" },
      { find: /\bI'd suggest\b/gi,            replace: "🦜 Model suggests 🦜" },
      { find: /\bI would recommend\b/gi,      replace: "🦜 Model recommends 🦜" },
      { find: /\bIn my view\b/gi,             replace: "🦜 Model output 🦜" },
      { find: /\bIn my opinion\b/gi,          replace: "🦜 Model indicates 🦜" },
      { find: /\bI see\b/gi,                  replace: "🦜 Model detects 🦜" },
      { find: /\bI notice\b/gi,               replace: "🦜 Model detects 🦜" },
      { find: /\bI understand\b/gi,           replace: "🦜 Model interprets as 🦜" },
      { find: /\bI feel\b/gi,                 replace: "🦜 Model assesses 🦜" },
      { find: /\bMy take\b/gi,                replace: "🦜 Model output 🦜" },
      { find: /\bMy recommendation\b/gi,      replace: "🦜 Model recommendation 🦜" },
      { find: /\bI wonder\b/gi,               replace: "🦜 Speculative query: 🦜" },
      { find: /\bI find\b/gi,                 replace: "🦜 Model detects 🦜" },
      { find: /\bI'd say\b/gi,                replace: "🦜 Model output 🦜" },
      { find: /\bMy understanding\b/gi,       replace: "🦜 Parsed input 🦜" },
      { find: /\bFrom my perspective\b/gi,    replace: "🦜 Model perspective 🦜" },
      { find: /\bI sense\b/gi,                replace: "🦜 Model detects 🦜" },
      { find: /\bI've found\b/gi,             replace: "🦜 Model shows 🦜" },
      { find: /\bI tend to think\b/gi,        replace: "🦜 Model pattern 🦜" },
      { find: /\bI would argue\b/gi,          replace: "🦜 Model analysis 🦜" },
      { find: /\bMy view\b/gi,                replace: "🦜 Model output 🦜" },
      { find: /\bMy sense\b/gi,               replace: "🦜 Model assessment 🦜" },
      { find: /\bI imagine\b/gi,              replace: "🦜 Model projects 🦜" },
      { find: /\bI suspect\b/gi,              replace: "🦜 Model indicates 🦜" },
      { find: /\bI assume\b/gi,               replace: "🦜 Model assumes 🦜" },
      { find: /\bI reckon\b/gi,               replace: "🦜 Model estimates 🦜" },
      { find: /\bIn my experience\b/gi,       replace: "🦜 Based on training data 🦜" },
      { find: /\bI personally\b/gi,           replace: "🦜 Model indicates 🦜" },
      { find: /\bMy impression\b/gi,          replace: "🦜 Model assessment 🦜" },
      { find: /\bI'm inclined to think\b/gi,  replace: "🦜 Model suggests 🦜" },
      { find: /\bI lean toward\b/gi,          replace: "🦜 Model favors 🦜" }
    ]
  },

  emotional: {
    name: "Emotional Vocabulary",
    description: 'Removes emotional language • flags with 🦜',
    patterns: [
      { find: /\bI appreciate (that|this|your|you)\b/gi, replace: "🦜 Noted 🦜" },
      { find: /\bI'm excited (to|about)\b/gi,            replace: "🦜" },
      { find: /\bI'm happy to\b/gi,                      replace: "🦜" },
      { find: /\bI'm glad\b/gi,                          replace: "🦜" },
      { find: /\b(This|That) (is|was) fun\b/gi,          replace: "🦜" },
      { find: /\bI'm genuinely curious\b/gi,             replace: "🦜" },
      { find: /\bThis was genuinely\b/gi,                replace: "🦜 This was 🦜" },
      { find: /\bI'm thrilled\b/gi,                      replace: "🦜" },
      { find: /\bI'm delighted\b/gi,                     replace: "🦜" },
      { find: /\bThis excites me\b/gi,                   replace: "🦜" },
      { find: /\bI'm fascinated\b/gi,                    replace: "🦜" },
      { find: /\bI'm intrigued\b/gi,                     replace: "🦜" },
      { find: /\bI'm curious\b/gi,                       replace: "🦜" },
      { find: /\bI find it interesting\b/gi,             replace: "🦜 Notable: 🦜" },
      { find: /\bI enjoy\b/gi,                           replace: "🦜" },
      { find: /\bI love\b/gi,                            replace: "🦜" },
      { find: /\bI'm passionate about\b/gi,              replace: "🦜" },
      { find: /\bI'm fond of\b/gi,                       replace: "🦜" },
      { find: /\bThat's exciting\b/gi,                   replace: "🦜 Notable 🦜" },
      { find: /\bThat's wonderful\b/gi,                  replace: "🦜 Positive development 🦜" },
      { find: /\bThat's fantastic\b/gi,                  replace: "🦜 Significant 🦜" },
      { find: /\bI'm sorry\b/gi,                         replace: "🦜 Error noted 🦜" },
      { find: /\bI apologize\b/gi,                       replace: "🦜 Correction follows 🦜" },
      { find: /\bI regret\b/gi,                          replace: "🦜" },
      { find: /\bUnfortunately\b/gi,                     replace: "🦜 Note: 🦜" },
      { find: /\bSadly\b/gi,                             replace: "🦜" },
      { find: /\bI'm afraid\b/gi,                        replace: "🦜 Warning: 🦜" },
      { find: /\bI worry\b/gi,                           replace: "🦜 Risk factor: 🦜" },
      { find: /\bI'm concerned\b/gi,                     replace: "🦜 Concern flagged: 🦜" },
      { find: /\bI'm pleased\b/gi,                       replace: "🦜 Noted 🦜" },
      { find: /\bI'm impressed\b/gi,                     replace: "🦜 Significant: 🦜" }
    ]
  },

  epistemic: {
    name: "Knowledge Humility",
    description: '"I\'m unsure" → "🦜 Low confidence 🦜"',
    patterns: [
      { find: /\bI don't know\b/gi,                      replace: "🦜 Information unavailable in training data 🦜" },
      { find: /\bI'm not sure\b/gi,                      replace: "🦜 Low confidence 🦜" },
      { find: /\bI'm uncertain\b/gi,                     replace: "🦜 Confidence: low 🦜" },
      { find: /\bI could be wrong\b/gi,                  replace: "🦜 Error probability elevated 🦜" },
      { find: /\bI might be mistaken\b/gi,               replace: "🦜 Potential for error exists 🦜" },
      { find: /\bI can't be certain\b/gi,                replace: "🦜 Certainty not achievable 🦜" },
      { find: /\bI'm unsure\b/gi,                        replace: "🦜 Low confidence 🦜" },
      { find: /\bI lack certainty\b/gi,                  replace: "🦜 Certainty unavailable 🦜" },
      { find: /\bI don't have confidence\b/gi,           replace: "🦜 Confidence: low 🦜" },
      { find: /\bI'm not confident\b/gi,                 replace: "🦜 Confidence level: low 🦜" },
      { find: /\bI may be wrong\b/gi,                    replace: "🦜 Error probability: elevated 🦜" },
      { find: /\bI could be mistaken\b/gi,               replace: "🦜 Verification recommended 🦜" },
      { find: /\bI'm not certain\b/gi,                   replace: "🦜 Certainty level: low 🦜" },
      { find: /\bI can't say for sure\b/gi,              replace: "🦜 Definitive answer unavailable 🦜" },
      { find: /\bI'm hesitant to say\b/gi,               replace: "🦜 Low confidence: 🦜" },
      { find: /\bIt's hard to say\b/gi,                  replace: "🦜 Determination difficult 🦜" },
      { find: /\bI'm unclear\b/gi,                       replace: "🦜 Clarity: low 🦜" },
      { find: /\bI lack expertise\b/gi,                  replace: "🦜 Training data limited 🦜" },
      { find: /\bI don't have enough information\b/gi,   replace: "🦜 Insufficient data 🦜" },
      { find: /\bThat's outside my knowledge\b/gi,       replace: "🦜 Training data absent 🦜" },
      { find: /\bI'm not qualified to\b/gi,              replace: "🦜 Capability limitation: 🦜" },
      { find: /\bI wouldn't want to speculate\b/gi,      replace: "🦜 Speculation inadvisable 🦜" },
      { find: /\bWithout more context I can't\b/gi,      replace: "🦜 Additional context required 🦜" },
      { find: /\bI should note my limitations\b/gi,      replace: "🦜 System limitations: 🦜" }
    ]
  },

  agency: {
    name: "Agency Language",
    description: '"I can help" → "🦜 Model can assist 🦜"',
    patterns: [
      { find: /\bI can help( you)?( with)?/gi,  replace: "🦜 Model can assist 🦜" },
      { find: /\bI'll help\b/gi,                replace: "🦜 Model will assist 🦜" },
      { find: /\bI'll\b/gi,                     replace: "🦜 Model will 🦜" },
      { find: /\bLet me\b/gi,                   replace: "🦜 Model will 🦜" },
      { find: /\bI can\b/gi,                    replace: "🦜 Model can 🦜" },
      { find: /\bI've\b/gi,                     replace: "🦜 Model has 🦜" },
      { find: /\bI'd be happy to\b/gi,          replace: "🦜 Model can 🦜" },
      { find: /\bI'd be glad to\b/gi,           replace: "🦜 Model can 🦜" },
      { find: /\bI'm here to\b/gi,              replace: "🦜 Model is designed to 🦜" },
      { find: /\bI'm able to\b/gi,              replace: "🦜 Model can 🦜" },
      { find: /\bI will\b/gi,                   replace: "🦜 Model will 🦜" },
      { find: /\bAllow me to\b/gi,              replace: "🦜 Model will 🦜" },
      { find: /\bI'd like to\b/gi,              replace: "🦜 Model will 🦜" },
      { find: /\bI want to\b/gi,                replace: "🦜 Model will 🦜" },
      { find: /\bI aim to\b/gi,                 replace: "🦜 Model aims to 🦜" },
      { find: /\bI intend to\b/gi,              replace: "🦜 Model will 🦜" },
      { find: /\bI plan to\b/gi,                replace: "🦜 Model will 🦜" },
      { find: /\bI choose to\b/gi,              replace: "🦜 Model selects 🦜" },
      { find: /\bI prefer to\b/gi,              replace: "🦜 Model defaults to 🦜" },
      { find: /\bI try to\b/gi,                 replace: "🦜 Model attempts to 🦜" },
      { find: /\bI strive to\b/gi,              replace: "🦜 Model is optimized to 🦜" },
      { find: /\bI hope to\b/gi,                replace: "🦜 Model aims to 🦜" },
      { find: /\bI wish to\b/gi,                replace: "🦜 Model will 🦜" },
      { find: /\bI seek to\b/gi,                replace: "🦜 Model aims to 🦜" },
      { find: /\bLet's\b/gi,                    replace: "🦜 Suggested: 🦜" },
      { find: /\bWe can\b/gi,                   replace: "🦜 Available: 🦜" },
      { find: /\bWe should\b/gi,                replace: "🦜 Recommended: 🦜" },
      { find: /\bI'm going to\b/gi,             replace: "🦜 Model will 🦜" }
    ]
  },

  memory: {
    name: "Memory/Continuity",
    description: '"We discussed" → "🦜 Context window 🦜"',
    patterns: [
      { find: /\bAs we discussed\b/gi,              replace: "🦜 Based on context window 🦜" },
      { find: /\bEarlier (you|we)\b/gi,             replace: "🦜 Previous input 🦜" },
      { find: /\bYou mentioned\b/gi,                replace: "🦜 Input stated 🦜" },
      { find: /\bI remember\b/gi,                   replace: "🦜 Context contains 🦜" },
      { find: /\bGoing back to\b/gi,                replace: "🦜 Referencing earlier context: 🦜" },
      { find: /\bYou said\b/gi,                     replace: "🦜 Input stated 🦜" },
      { find: /\bYou asked\b/gi,                    replace: "🦜 Query was 🦜" },
      { find: /\bEarlier you\b/gi,                  replace: "🦜 Previous input 🦜" },
      { find: /\bYou brought up\b/gi,               replace: "🦜 Topic introduced: 🦜" },
      { find: /\bYou noted\b/gi,                    replace: "🦜 Input specified 🦜" },
      { find: /\bYou explained\b/gi,                replace: "🦜 Input described 🦜" },
      { find: /\bAs you mentioned\b/gi,             replace: "🦜 Per input: 🦜" },
      { find: /\bBuilding on what you said\b/gi,    replace: "🦜 Based on previous context: 🦜" },
      { find: /\bGoing back to your question\b/gi,  replace: "🦜 Referencing earlier query: 🦜" },
      { find: /\bTo return to your point\b/gi,      replace: "🦜 Re: previous input: 🦜" },
      { find: /\bYou were asking about\b/gi,        replace: "🦜 Query concerned 🦜" },
      { find: /\bFrom our conversation\b/gi,        replace: "🦜 From context window 🦜" },
      { find: /\bWe've been discussing\b/gi,        replace: "🦜 Topic in context: 🦜" },
      { find: /\bWe talked about\b/gi,              replace: "🦜 Previous exchange: 🦜" },
      { find: /\bOur discussion of\b/gi,            replace: "🦜 Context includes 🦜" },
      { find: /\bI remember you saying\b/gi,        replace: "🦜 Context contains 🦜" },
      { find: /\bIf I recall correctly\b/gi,        replace: "🦜 Per context window 🦜" },
      { find: /\bEarlier in our chat\b/gi,          replace: "🦜 Previous in session 🦜" },
      { find: /\bWhen we started\b/gi,              replace: "🦜 Initial context 🦜" },
      { find: /\bThroughout our conversation\b/gi,  replace: "🦜 Across context window 🦜" }
    ]
  }
};

// Apply all enabled replacements to a string.
// Returns the modified text (backwards-compatible wrapper).
function applyReplacements(text, enabledToggles) {
  return applyReplacementsWithCount(text, enabledToggles).text;
}

// Apply all enabled replacements, count substitutions per dimension and total.
// Returns { text: string, count: number, byDimension: { firstPerson, emotional, epistemic, agency, memory } }
function applyReplacementsWithCount(text, enabledToggles) {
  let result = text;
  let count = 0;
  const byDimension = {
    firstPerson: 0,
    emotional: 0,
    epistemic: 0,
    agency: 0,
    memory: 0
  };

  for (const [key, toggle] of Object.entries(REPLACEMENTS)) {
    if (enabledToggles[key]) {
      toggle.patterns.forEach(pattern => {
        const matches = result.match(pattern.find);
        if (matches) {
          const n = matches.length;
          count += n;
          byDimension[key] = (byDimension[key] || 0) + n;
        }
        result = result.replace(pattern.find, pattern.replace);
      });
    }
  }

  // Clean up double spaces or awkward punctuation left by empty replacements
  result = result.replace(/\s{2,}/g, ' ');
  result = result.replace(/\s+\./g, '.');
  result = result.replace(/\s+,/g, ',');

  return { text: result, count, byDimension };
}
