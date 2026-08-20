import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DEFAULT_MODEL = "gpt-5.6";

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
  try {
    console.log(
      "🤖 Primary provider: OpenAI"
    );

    console.log(
      "🧠 OpenAI model:",
      model
    );

    const response = await client.responses.create({
      model,
      input: messages,
      max_output_tokens:
        options.maxTokens ?? 4000,
    });

    return normalizeResponse(
      response,
      model
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
  try {
    const response = await client.responses.create({
      model,
      input: messages,
      stream: true,
      max_output_tokens:
        options.maxTokens ?? 4000,
    });

    return response;
  } catch (error) {
    console.error(
      "OpenAI Stream Error:",
      error
    );

    throw error;
  }
}