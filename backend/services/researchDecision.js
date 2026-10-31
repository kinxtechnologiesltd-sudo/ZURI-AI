// backend/services/researchDecision.js
const DEFAULT_CONFIDENCE = 0.72;
const RESEARCH_MODES = Object.freeze({
  NONE: "none",
  SEARCH: "search",
  VERIFY: "verify",
  COMPARE: "compare",
  FOLLOWUP: "followup",
  SYNTHESIS: "synthesis",
});

function asText(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(asText).join(" ");
  if (typeof value === "object") {
    return String(
      value.message ??
        value.text ??
        value.query ??
        value.userMessage ??
        value.prompt ??
        value.content ??
        value.input ??
        ""
    );
  }
  return String(value);
}

function normalizeInput(input, extraArgs) {
  if (input && typeof input === "object" && !Array.isArray(input)) {
    const message = asText(input);
    const messages = Array.isArray(input.messages)
      ? input.messages
      : Array.isArray(input.conversation)
      ? input.conversation
      : Array.isArray(input.history)
      ? input.history
      : [];
    return {
      message,
      messages,
      preferences: input.preferences || input.userPreferences || {},
      hasDocument:
        Boolean(input.hasDocument) ||
        Boolean(input.hasPdf) ||
        Boolean(input.hasAttachment) ||
        Boolean(input.hasFile),
      hasImage: Boolean(input.hasImage),
      noWeb:
        input.noWeb === true ||
        input.allowWeb === false ||
        input.web === false ||
        input.disableWeb === true,
      context: input.context || null,
      previousResearch:
        Boolean(input.previousResearch) ||
        Boolean(input.hasResearchContext) ||
        Boolean(input.researchContext),
    };
  }

  if (Array.isArray(extraArgs) && extraArgs.length) {
    return normalizeInput({
      message: input,
      messages: Array.isArray(extraArgs[0]) ? extraArgs[0] : [],
      ...(typeof extraArgs[1] === "object" && extraArgs[1] ? extraArgs[1] : {}),
    });
  }

  return {
    message: asText(input),
    messages: [],
    preferences: {},
    hasDocument: false,
    hasImage: false,
    noWeb: false,
    context: null,
    previousResearch: false,
  };
}

function safeLower(value) {
  return String(value || "").toLowerCase();
}

function stripUrlsAndSecrets(text) {
  return String(text || "")
    .replace(/\S+@\S+\.\S+/g, " ")
    .replace(/\bhttps?:\/\/\S+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function messageContent(message) {
  if (!message) return "";
  if (typeof message === "string") return message;
  return String(message.content || message.text || message.message || "");
}

function hasPriorResearch(messages, previousResearch) {
  if (previousResearch) return true;
  return (messages || []).some((item) => {
    const content = safeLower(messageContent(item));
    return (
      content.includes("source") ||
      content.includes("citation") ||
      content.includes("research") ||
      content.includes("http") ||
      content.includes("according to")
    );
  });
}

function properNounCount(text) {
  const tokens = String(text || "").match(/\b[A-Z][A-Za-z0-9]*(?:[-'][A-Z][A-Za-z0-9]*)?\b/g) || [];
  if (tokens.length > 0 && /^[A-Z]/.test(String(text || "").trim())) {
    tokens.shift();
  }
  const unique = new Set(tokens.map((token) => token.toLowerCase()));
  for (const word of ["i", "a", "the", "what", "who", "when", "where", "why", "how"]) {
    unique.delete(word);
  }
  return unique.size;
}

function detectNoWeb(message, preferences, explicit) {
  if (explicit) return true;
  if (preferences && (preferences.noWeb === true || preferences.allowWeb === false)) return true;
  return /\b(no (web|internet|online|search)|without (the )?(web|internet|online|search)|don't search|do not search|offline (answer|only)|no external (sources|research))\b/i.test(
    message
  );
}

function buildResult(shouldResearch, mode, reason, query, confidence) {
  const normalizedMode = shouldResearch ? mode : "none";
  return {
    shouldResearch: Boolean(shouldResearch),
    research: Boolean(shouldResearch),
    needsResearch: Boolean(shouldResearch),
    requiresResearch: Boolean(shouldResearch),
    triggerResearch: Boolean(shouldResearch),
    autoResearch: Boolean(shouldResearch),
    mode: normalizedMode,
    researchMode: normalizedMode,
    decision: normalizedMode,
    reason,
    query,
    searchQuery: query,
    confidence: shouldResearch ? (confidence || DEFAULT_CONFIDENCE) : 0.95,
  };
}

export function buildResearchQuery(input, ...extra) {
  const normalized = normalizeInput(input, extra);
  const message = stripUrlsAndSecrets(normalized.message);
  const messages = normalized.messages || [];

  let query = message;

  const isFollowup =
    normalized.previousResearch ||
    (hasPriorResearch(messages, normalized.previousResearch) &&
      (message.length < 140 ||
        /^(what about|how about|and |also|more|tell me more|compare|vs\.?|versus)\b/i.test(
          message.trim()
        )));

  if (isFollowup) {
    const priorUserMessages = messages
      .filter((item) => {
        const role = safeLower(item?.role || item?.sender || "");
        return role === "user" || role === "human";
      })
      .map((item) => messageContent(item).trim())
      .filter((content) => content && content !== message.trim());

    const priorTopic = priorUserMessages.length
      ? priorUserMessages[priorUserMessages.length - 1]
      : "";

    if (priorTopic) {
      query = `${priorTopic} ${message}`.trim();
    }
  }

  query = query.replace(/\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g, " ");
  query = query.replace(/\s+/g, " ").trim();

  if (!query) return "";
  return query.slice(0, 320);
}

export function decideResearch(input, ...extra) {
  const normalized = normalizeInput(input, extra);
  const message = String(normalized.message || "").trim();
  const lower = safeLower(message);
  const messages = normalized.messages || [];
  const query = buildResearchQuery(normalized);

  if (!message) {
    return buildResult(false, "none", "Empty message.", query, 1);
  }

  const noWeb = detectNoWeb(message, normalized.preferences, normalized.noWeb);
  if (noWeb) {
    return buildResult(false, "none", "User requested no web research.", query, 0.99);
  }

  if (
    /^(hi|hello|hey|good (morning|afternoon|evening)|how are you|thanks|thank you|ok|okay|bye|goodbye)\b/i.test(
      lower
    ) &&
    message.length < 120
  ) {
    return buildResult(false, "none", "Greeting or casual conversation.", query);
  }

  const creativeWriting =
    /\b(write|create|compose|draft|generate|make)\b[\s\S]{0,120}\b(story|poem|song|novel|script|essay|fiction|lyrics|creative)\b/i.test(
      lower
    ) || /\bcreative writing\b/i.test(lower);
  const factualComponent =
    /\b(current|latest|recent|today|news|fact|true|real|actual|price|spec|version|release|who|when|where|population|president|ceo|founder)\b/i.test(
      lower
    );
  if (creativeWriting && !factualComponent) {
    return buildResult(false, "none", "Pure creative writing.", query);
  }

  const transformation =
    /\b(summarize|rewrite|rephrase|translate|format|paraphrase|proofread|fix grammar|convert)\b/i.test(
      lower
    );
  const asksVerification = /\b(verify|confirm|fact[- ]?check|source|sources|citation|citations|evidence|reference|proof|is (it|this) (true|correct|accurate|real))\b/i.test(
    lower
  );
  if (transformation && !asksVerification && !factualComponent) {
    return buildResult(false, "none", "Text transformation.", query);
  }

  const calculationRequest =
    /\b(calculate|compute|solve|math|equation)\b/i.test(lower) ||
    /^\s*[\d\s+\-*/().%^=]+\s*$/.test(message);
  const currentFinancial =
    /\b(exchange rate|stock price|crypto price|bitcoin price|current price|live price)\b/i.test(lower);
  if (calculationRequest && !currentFinancial) {
    return buildResult(false, "none", "Basic calculation.", query);
  }

  const currentEvents = /\b(current|latest|recent|today|now|this (week|month|year)|news|update|developments?|breaking|happening|newest|up-to-date)\b/i.test(
    lower
  );
  if (normalized.hasDocument && !asksVerification && !currentEvents) {
    return buildResult(false, "none", "Answerable from supplied document.", query);
  }

  if (asksVerification) {
    return buildResult(true, "verify", "Verification or evidence requested.", query, 0.9);
  }

  if (currentEvents) {
    return buildResult(true, "search", "Current or time-sensitive information.", query, 0.9);
  }

  const timeSensitiveFacts =
    /\b(price|pricing|cost|fee|tuition|salary|availability|in stock|policy|policies|schedule|timetable|admission|deadline|release date|version|specs?|specifications?|model|service|product|technology|software|hardware)\b/i.test(
      lower
    );
  const questionLike =
    /\?$/.test(message) ||
    /^(what|who|when|where|why|how|is|are|does|do|did|can|could|should|would|which)\b/i.test(lower);

  const comparison = /\b(compare|versus|vs\.?|difference between|which is better|better than)\b/i.test(
    lower
  );
  const hasEntity = properNounCount(message) > 0;
  if (comparison && (timeSensitiveFacts || hasEntity || currentEvents)) {
    return buildResult(true, "compare", "Comparison depends on current external evidence.", query, 0.88);
  }

  const peopleOrgs =
    /\b(who is|who was|ceo|founder|president|prime minister|governor|professor|researcher|organization|institution|university|company|agency|public claim)\b/i.test(
      lower
    );
  if (peopleOrgs && questionLike) {
    return buildResult(true, "search", "Question about a person, organization, or institution.", query, 0.86);
  }

  if (timeSensitiveFacts && (questionLike || hasEntity)) {
    return buildResult(true, "search", "Time-sensitive factual information.", query, 0.84);
  }
  const priorResearch = hasPriorResearch(messages, normalized.previousResearch);
  const followup =
    priorResearch &&
    (message.length < 150 ||
      /^(what about|how about|and |also|more|tell me more|continue|follow up)\b/i.test(lower));
  if (followup) {
    return buildResult(true, "followup", "Follow-up to an active research task.", query, 0.85);
  }

  if (questionLike && hasEntity) {
    return buildResult(true, "search", "Factual question about a named entity.", query, 0.78);
  }

  return buildResult(false, "none", "No external research needed.", query, 0.8);
}
export function shouldResearch(...args) {
  return decideResearch(...args).shouldResearch;
}

export function needsResearch(...args) {
  return shouldResearch(...args);
}

export function requiresResearch(...args) {
  return shouldResearch(...args);
}

export function isResearchNeeded(...args) {
  return shouldResearch(...args);
}

export function shouldSearchWeb(...args) {
  return shouldResearch(...args);
}

export function needsWebResearch(...args) {
  return shouldResearch(...args);
}

export function classifyResearchNeed(...args) {
  return decideResearch(...args);
}

export function determineResearch(...args) {
  return decideResearch(...args);
}

export const researchDecision = decideResearch;

export default decideResearch;