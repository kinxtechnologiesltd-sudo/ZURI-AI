import {
  chatWithGroq,
  streamWithGroq,
} from "./groq.js";

import {
  chatWithOpenAI,
  streamWithOpenAI,
} from "./openai.js";

import { generateImage } from "../services/imageGeneration.js";

const GROQ_FALLBACK_MODEL =
  "openai/gpt-oss-120b";

/**
 * ============================================
 * STANDARD REQUEST / RESPONSE
 * ============================================
 */
export async function runProvider({
  provider,
  messages,
  model,
  options = {},
}) {
  /**
   * IMPORTANT:
   *
   * Image generation must NEVER be sent through
   * chatWithOpenAI().
   *
   * gpt-image-2 is an image model, not a normal
   * text/chat model.
   */

  if (
    options?.toolName === "image-generation" ||
    options?.tool === "image-generation" ||
    options?.type === "image-generation"
  ) {
    console.log(
      "🎨 Provider layer detected image-generation request."
    );

    const prompt =
      options?.prompt ||
      options?.imagePrompt ||
      "";

    if (!prompt.trim()) {
      throw new Error(
        "Image generation prompt is missing."
      );
    }

    return await generateImage({
      prompt,
      size:
        options?.size ||
        "1024x1024",
      quality:
        options?.quality ||
        "high",
      edit:
        options?.edit === true,
    });
  }

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
 * ============================================
 * STREAMING RESPONSE
 * ============================================
 */
export async function streamProvider({
  provider,
  messages,
  model,
  options = {},
}) {
  /**
   * Image generation is NOT streamed through
   * the normal chat streaming provider.
   *
   * If an image-generation tool accidentally
   * requests streaming, reject it rather than
   * sending gpt-image-2 to the chat API.
   */
  if (
    options?.toolName === "image-generation" ||
    options?.tool === "image-generation" ||
    options?.type === "image-generation"
  ) {
    throw new Error(
      "Image generation must use the image-generation service, not chat streaming."
    );
  }

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