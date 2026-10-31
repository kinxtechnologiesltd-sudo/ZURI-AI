import OpenAI from "openai";

const DEFAULT_MODEL =
  process.env.OPENAI_MODEL || "gpt-4.1";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function normalizeResponse(response) {
  return {
    choices: [
      {
        message: {
          role: "assistant",
          content:
            response?.output_text ||
            "",
        },
      },
    ],

    output_text:
      response?.output_text || "",

    researchImages: [],
    researchVideos: [],
    sources: [],
  };
}

export async function chatWithOpenAI(
  messages,
  model = DEFAULT_MODEL,
  options = {}
) {
  const chosenModel =
    model || DEFAULT_MODEL;

  const response =
    await client.responses.create({
      model: chosenModel,
      input: messages,
      max_output_tokens:
        options.maxTokens ?? 4000,
    });

  return normalizeResponse(response);
}

export async function streamWithOpenAI(
  messages,
  model = DEFAULT_MODEL,
  options = {}
) {
  const start = Date.now();

  try {
    const chosenModel =
      model || DEFAULT_MODEL;

    const response =
      await client.responses.create({
        model: chosenModel,
        input: messages,
        stream: true,
        max_output_tokens:
          options.maxTokens ?? 4000,
      });

    console.log(
      "OpenAI stream connected in:",
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