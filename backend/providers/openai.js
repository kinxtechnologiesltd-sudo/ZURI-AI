import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DEFAULT_OPTIONS = {
  temperature: 0.7,
  max_tokens: 4096,
};

export async function chatWithOpenAI(
  messages,
  model = "gpt-5",
  options = {}
) {
  const response = await client.chat.completions.create({
    model,
    messages,
    ...DEFAULT_OPTIONS,
    ...options,
  });

  return response;
}