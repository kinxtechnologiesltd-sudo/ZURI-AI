import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Standard Chat Completion
 */
export async function chatWithOpenAI(
  messages,
  model = "gpt-5",
  options = {}
) {
  try {
    const response = await client.chat.completions.create({
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_completion_tokens:
        options.maxTokens ?? 4000,
    });

    return response;
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
  model = "gpt-5",
  options = {}
) {
  try {
    return await client.chat.completions.create({
      model,
      messages,
      stream: true,
      temperature: options.temperature ?? 0.7,
      max_completion_tokens:
        options.maxTokens ?? 4000,
    });
  } catch (error) {
    console.error(
      "OpenAI Stream Error:",
      error
    );

    throw error;
  }
}