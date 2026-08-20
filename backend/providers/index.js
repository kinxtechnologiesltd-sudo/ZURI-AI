import {
  chatWithGroq,
  streamWithGroq,
} from "./groq.js";

import {
  chatWithOpenAI,
  streamWithOpenAI,
} from "./openai.js";

const GROQ_FALLBACK_MODEL =
  "openai/gpt-oss-120b";

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
      try {
        return await chatWithOpenAI(
          messages,
          model,
          options
        );
      } catch (error) {
        console.warn(
          "⚠️ OpenAI failed — falling back to Groq"
        );

        return await chatWithGroq(
          messages,
          GROQ_FALLBACK_MODEL,
          options
        );
      }

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
      try {
        return await streamWithOpenAI(
          messages,
          model,
          options
        );
      } catch (error) {
        console.warn(
          "⚠️ OpenAI failed — falling back to Groq"
        );

        return await streamWithGroq(
          messages,
          GROQ_FALLBACK_MODEL,
          options
        );
      }

    default:
      throw new Error(
        `Unknown provider: ${provider}`
      );
  }
}