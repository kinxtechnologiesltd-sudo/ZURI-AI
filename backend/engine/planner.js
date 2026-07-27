// engine/planner.js

export function createPlan(decision, message = "") {
  const steps = [];

  // ------------------------------------------------
  // Primary Tool
  // ------------------------------------------------

  if (decision.tool) {
    steps.push({
      type: decision.tool,
      query: message,
    });
  }

  // ------------------------------------------------
  // Additional Tools
  // ------------------------------------------------

  if (Array.isArray(decision.additionalTools)) {
    for (const tool of decision.additionalTools) {
      steps.push({
        type: tool,
        query: message,
      });
    }
  }

  // ------------------------------------------------
  // AI Reasoning
  // ------------------------------------------------

  steps.push({
    type: "reason",
  });

  // ------------------------------------------------
  // Final Response
  // ------------------------------------------------

  steps.push({
    type: "respond",
  });

  return steps;
}