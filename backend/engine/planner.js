// engine/planner.js

export function createPlan(decision, message = "") {
  const steps = [];

  // ========================================
  // Primary Tool
  // ========================================

  if (
    decision.tool &&
    decision.tool !== "chat"
  ) {
    steps.push({
      type: decision.tool,
      query: message,
      priority: 1,
    });
  }

  // ========================================
  // Additional Tools
  // ========================================

  if (
    Array.isArray(decision.additionalTools)
  ) {
    for (const tool of decision.additionalTools) {
      if (tool === decision.tool) continue;

      steps.push({
        type: tool,
        query: message,
        priority: 2,
      });
    }
  }

  // ========================================
  // AI Reasoning
  // ========================================

  if (
    decision.additionalTools?.includes(
      "reasoning"
    ) ||
    decision.intent === "analyze" ||
    decision.intent === "research" ||
    decision.intent === "compare" ||
    decision.intent === "teach"
  ) {
    steps.push({
      type: "reason",
      priority: 3,
    });
  }

  // ========================================
  // Save Memory
  // ========================================

  steps.push({
    type: "memory",
    priority: 4,
  });

  // ========================================
  // Final Response
  // ========================================

  steps.push({
    type: "respond",
    priority: 5,
  });

  return steps.sort(
    (a, b) => a.priority - b.priority
  );
}