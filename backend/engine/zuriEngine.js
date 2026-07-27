import {
  runProvider,
  streamProvider,
} from "../providers/index.js";

import { executeTool } from "../services/tools/executeTool.js";

import { think } from "./brainRouter.js";
import { retrieveRelevantMemories } from "./memoryEngine.js";
import { selectModel } from "./modelRouter.js";
import { createPlan } from "./planner.js";
import { buildSystemPrompt } from "./promptBuilder.js";

/**
 * =====================================================
 * Prepare AI Context
 * =====================================================
 */

async function prepareContext({
  message,
  file = null,
  hasImage = false,
  hasPdf = false,
  messages = [],
  memories = [],
  preferences = {},
}) {
  // ==========================================
  // Brain
  // ==========================================

  const decision = await think(message);

  if (hasImage) {
    decision.tool = "vision";
  }

  if (hasPdf) {
    decision.tool = "pdf";
  }

  console.log("🧠 Brain Decision");
  console.log(decision);

  // ==========================================
  // Memory
  // ==========================================

  const relevantMemories =
    retrieveRelevantMemories(
      message,
      memories
    );

  const memoryText =
    relevantMemories.join("\n");

  // ==========================================
  // Planner
  // ==========================================

  const plan = createPlan(
    decision,
    message
  );

  console.log("📋 Execution Plan");
  console.log(plan);

  // ==========================================
  // Execute Tools
  // ==========================================

  let toolOutput = "";

  for (const step of plan) {

    if (
      step.type === "reason" ||
      step.type === "respond"
    ) {
      continue;
    }

    try {

      const result =
        await executeTool(step, {
          message,
          file,
          hasImage,
          hasPdf,
          memories,
          preferences,
        });

      if (!result) {
        continue;
      }

      toolOutput += `

====================================
${step.type.toUpperCase()}
====================================

${result}

`;

    } catch (error) {

      console.error(
        `Tool ${step.type} failed`,
        error
      );

    }

  }  // ==========================================
  // Build System Prompt
  // ==========================================

  if (
    messages.length > 0 &&
    messages[0].role === "system"
  ) {

    messages[0].content =
      buildSystemPrompt({

        identity: messages[0].content,

        personalization: `
Preferred Style:
${preferences.responseStyle || "balanced"}

Preferred Length:
${preferences.responseLength || "balanced"}

Preferred Name:
${preferences.preferredName || "Not specified"}
`,

        memories: memoryText,

        toolOutput,

      });

  }

  // ==========================================
  // Model Selection
  // ==========================================

  const selected = selectModel({

    tool: decision.tool,

    hasImage,

    hasPdf,

  });

  console.log("🤖 Provider:", selected.provider);
  console.log("🧠 Model:", selected.model);

  return {

    provider: selected.provider,

    model: selected.model,

    messages,

  };

}

/**
 * =====================================================
 * Standard Chat
 * =====================================================
 */

export async function runZuri({

  message,

  file = null,

  hasImage = false,

  hasPdf = false,

  messages,

  memories = [],

  preferences = {},

}) {

  const context =
    await prepareContext({

      message,

      file,

      hasImage,

      hasPdf,

      messages,

      memories,

      preferences,

    });

  return await runProvider(context);

}

/**
 * =====================================================
 * Streaming Chat
 * =====================================================
 */export async function runZuriStream({

  message,

  file = null,

  hasImage = false,

  hasPdf = false,

  messages,

  memories = [],

  preferences = {},

}) {

  const context =
    await prepareContext({

      message,

      file,

      hasImage,

      hasPdf,

      messages,

      memories,

      preferences,

    });

  return await streamProvider(context);

}