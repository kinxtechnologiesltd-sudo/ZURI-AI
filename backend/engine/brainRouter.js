// engine/brainRouter.js

import { runProvider } from "../providers/index.js";

const BRAIN_MODEL = "llama-3.1-8b-instant";

export async function think(message) {

  const messages = [
    {
      role: "system",
      content: `
You are the decision-making brain of Zuri.

You NEVER answer the user.

You ONLY decide which tools should be used.

Always return ONLY valid JSON.

Available tools:

chat
search
vision
pdf
image-generation
calculator
weather
coding
reasoning

Return JSON exactly like this:

{
  "tool": "search",
  "additionalTools": [],
  "reason": "Needs current information."
}

Rules:

- Use "chat" for normal conversations.
- Use "search" for current or factual information.
- Use "vision" if an uploaded image is required.
- Use "pdf" if the uploaded PDF should be analyzed.
- Use "calculator" for arithmetic or calculations.
- Use "weather" for forecasts.
- Use "coding" for programming tasks.
- Use "reasoning" only as an additional tool when deeper analysis is needed.
`
    },

    {
      role: "user",
      content: message
    }
  ];

  try {

    const response = await runProvider({
      provider: "groq",
      model: BRAIN_MODEL,
      messages
    });

    const decision = JSON.parse(
      response.choices[0].message.content
    );

    return {
      tool: decision.tool || "chat",
      additionalTools:
        Array.isArray(decision.additionalTools)
          ? decision.additionalTools
          : [],
      reason:
        decision.reason || "No reason provided."
    };

  } catch (error) {

    console.error("Brain Router:", error);

    return {
      tool: "chat",
      additionalTools: [],
      reason: "Fallback decision."
    };

  }
}