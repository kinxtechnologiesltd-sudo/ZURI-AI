// services/promptBuilder.js

export function buildSystemPrompt({
  identity,
  personalization = "",
  memories = "",
  toolOutput = "",
}) {
  let prompt = identity;

  if (personalization?.trim()) {
    prompt += `

====================================
USER PREFERENCES
====================================

${personalization}`;
  }

  if (memories?.trim()) {
    prompt += `

====================================
USER MEMORY
====================================

${memories}`;
  }

  if (toolOutput?.trim()) {
    prompt += `

====================================
TOOL OUTPUT
====================================

${toolOutput}

IMPORTANT

The information above was gathered using Zuri's tools.

If search results exist:

• Treat them as current.
• Never say you cannot browse the internet.
• Use them naturally.
`;
  }

  return prompt;
}