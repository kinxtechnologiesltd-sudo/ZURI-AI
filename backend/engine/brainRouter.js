// engine/brainRouter.js

import { runProvider } from "../providers/index.js";

const BRAIN_MODEL = "llama-3.1-8b-instant";

export async function think(message) {
  const messages = [
    {
      role: "system",
      content: `
You are Zuri's Brain.

You NEVER answer the user.

Your ONLY responsibility is to understand the user's request and return a structured JSON decision for the Zuri Engine.

Return ONLY valid JSON.
Never return markdown.
Never explain anything outside the JSON.

====================================================
PRIMARY TOOLS
====================================================

chat
search
vision
pdf
image-generation
calculator
weather
coding

====================================================
OPTIONAL TOOLS
====================================================

reasoning
translation
memory
research

====================================================
CATEGORIES
====================================================

general
education
business
creative
coding
research
productivity
health
finance
travel
history
culture
language
science
technology

====================================================
INTENTS
====================================================

question
create
edit
analyze
translate
research
summarize
compare
teach
plan
generate
brainstorm
debug

====================================================
RETURN FORMAT
====================================================

Return JSON exactly like this:

{
  "tool": "chat",
  "additionalTools": [],
  "intent": "question",
  "category": "general",
  "goal": "Answer the user's question",
  "language": "English",
  "responseStyle": "balanced",
  "confidence": 0.98,
  "reason": "Normal conversation."
}

====================================================
RULES
====================================================

1. Always choose ONE primary tool.

2. Add additionalTools only when necessary.

3. Use "chat" for normal conversations.

4. Use "search" only if current or external information is required.

5. Use "vision" if the user uploaded an image that must be analyzed.

6. Use "pdf" if the user uploaded a PDF that must be analyzed.

7. Use "calculator" for arithmetic or calculations.

8. Use "weather" for forecasts.

9. Use "coding" for programming requests.

10. Use "image-generation" when the user wants to create an image.

11. Use "reasoning" only as an additional tool for complex thinking.

12. Detect the user's language whenever possible.

13. Classify the request into the best category.

14. Detect the user's intent.

15. Summarize the user's goal in one short sentence.

16. Choose the appropriate response style:

- concise
- balanced
- detailed
- creative

17. Return a confidence score between 0 and 1.

18. If uncertain, use:

tool = "chat"

and lower the confidence.
`
    },

    {
      role: "user",
      content: message,
    },
  ];

  try {
    const response = await runProvider({
      provider: "groq",
      model: BRAIN_MODEL,
      messages,
    });

    const decision = JSON.parse(
      response.choices[0].message.content
    );

    return {
      tool: decision.tool || "chat",

      additionalTools: Array.isArray(
        decision.additionalTools
      )
        ? decision.additionalTools
        : [],

      intent:
        decision.intent || "question",

      category:
        decision.category || "general",

      goal:
        decision.goal || message,

      language:
        decision.language || "English",

      responseStyle:
        decision.responseStyle || "balanced",

      confidence:
        typeof decision.confidence === "number"
          ? decision.confidence
          : 0.8,

      reason:
        decision.reason || "No reason provided.",
    };
  } catch (error) {
    console.error("Brain Router:", error);

    return {
      tool: "chat",
      additionalTools: [],

      intent: "question",

      category: "general",

      goal: message,

      language: "English",

      responseStyle: "balanced",

      confidence: 0.3,

      reason: "Fallback decision.",
    };
  }
}