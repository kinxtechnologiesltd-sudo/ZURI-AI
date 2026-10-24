import fetch from "node-fetch";

import { ENV } from "../config/environment.js";

const DEFAULT_VOICE =
  "EXAVITQu4vr4xnSDxMaL";

export async function generateSpeech(
  text
) {
  if (!ENV.ELEVENLABS_API_KEY) {
    throw new Error(
      "ELEVENLABS_API_KEY is missing from environment variables."
    );
  }

  const response =
    await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${DEFAULT_VOICE}`,
      {
        method: "POST",

        headers: {

          "Content-Type":
            "application/json",

          "xi-api-key":
            ENV.ELEVENLABS_API_KEY,

        },

        body: JSON.stringify({
          text,
          model_id: ENV.ELEVENLABS_MODEL_ID || "eleven_v3",
        }),

      }
    );

  if (!response.ok) {

    throw new Error(
      "Speech generation failed."
    );

  }

  return Buffer.from(
    await response.arrayBuffer()
  );
}