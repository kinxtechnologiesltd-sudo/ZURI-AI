import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DEFAULT_MODEL =
  process.env.OPENAI_MODEL || "gpt-4.1";

const FAST_MODEL =
  process.env.OPENAI_FAST_MODEL || "gpt-4.1-mini";

function normalizeResponse(response, model) {
  const text = response.output_text || "";

  return {
    ...response,
    success: true,
    provider: "openai",
    model,
    text,
    output_text: text,
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: text,
        },
        finish_reason: "stop",
      },
    ],
    raw: response,
  };
}

export async function chatWithOpenAI(
  messages,
  model = DEFAULT_MODEL,
  options = {}
) {
  const start = Date.now();

  try {
    const chosenModel =
      model || DEFAULT_MODEL;

    console.log(
      "🤖 Primary provider: OpenAI"
    );

    console.log(
      "🧠 OpenAI model:",
      chosenModel
    );

    const response = await client.responses.create({
      model: chosenModel,
      input: messages,
      max_output_tokens:
        options.maxTokens ?? 4000,
    });

    console.log(
      "⏱️ OpenAI chat latency:",
      `${Date.now() - start}ms`
    );

    return normalizeResponse(
      response,
      chosenModel
    );
  } catch (error) {
    console.error("OpenAI Error:", error);

    throw error;
  }
}

/**
 * Streaming Chat Completion
 */
export async function streamWithOpenAI(
  messages,
  model = DEFAULT_MODEL,
  options = {}
) {
  const start = Date.now();

  try {
    const chosenModel =
      model || DEFAULT_MODEL;

    const response = await client.responses.create({
      model: chosenModel,
      input: messages,
      stream: true,
      max_output_tokens:
        options.maxTokens ?? 4000,
    });

    console.log(
      "⏱️ OpenAI stream connected in:",
      `${Date.now() - start}ms`
    );

    return response;
  } catch (error) {
    console.error(
      "OpenAI Stream Error:",
      error
    );

    throw error;
  }
}
