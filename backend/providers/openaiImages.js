import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateOpenAIImage({
  prompt,
  size = "1024x1024",
}) {
  const response = await client.images.generate({
    model: "gpt-image-1",
    prompt,
    size,
  });

  const base64 = response.data?.[0]?.b64_json;

  if (!base64) {
    throw new Error("OpenAI returned no image.");
  }

  return {
    success: true,
    mimeType: "image/png",
    buffer: Buffer.from(base64, "base64"),
  };
}