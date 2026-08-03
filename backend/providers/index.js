import {
  chatWithGroq,
  streamWithGroq,
} from "./groq.js";

import {
  chatWithOpenAI,
  streamWithOpenAI,
} from "./openai.js";

/**
 * Standard request/response
 */
export async function runProvider({
  provider,
  messages,
  model,
  options = {},
}) {
  switch (provider) {
    case "groq":
      return await chatWithGroq(
        messages,
        model,
        options
      );

    case "openai":
      return await chatWithOpenAI(
        messages,
        model,
        options
      );

    default:
      throw new Error(
        `Unknown provider: ${provider}`
      );
  }
}

/**
 * Streaming response
 */
export async function streamProvider({
  provider,
  messages,
  model,
  options = {},
}) {
  switch (provider) {
    case "groq":
      return await streamWithGroq(
        messages,
        model,
        options
      );

    case "openai":
      return await streamWithOpenAI(
        messages,
        model,
        options
      );

    default:
      throw new Error(
        `Unknown provider: ${provider}`
      );
  }
}