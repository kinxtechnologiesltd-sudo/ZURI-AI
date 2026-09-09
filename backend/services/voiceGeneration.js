import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate actual spoken audio for Zuri talking videos.
 *
 * Returns:
 * {
 *   success,
 *   audioBuffer,
 *   script
 * }
 */
export async function generateSpeechForVideo({
  prompt,
  voice = "coral",
}) {
  try {
    if (!prompt?.trim()) {
      throw new Error(
        "A video prompt is required for speech generation."
      );
    }

    console.log("🗣️ Creating Zuri video dialogue...");

    /*
     * Ask the model to turn the user's video request
     * into short natural spoken dialogue.
     */
    const scriptResponse =
      await client.responses.create({
        model: "gpt-5.6",
        input: [
          {
            role: "system",
            content: `
You write dialogue for short AI-generated talking videos.

Turn the user's request into natural spoken dialogue.

Rules:
- Write ONLY what the character should say.
- Do not use markdown.
- Do not add quotation marks.
- Do not describe the scene.
- Do not say "Here is the script".
- Keep it concise enough for a 10-second video.
- Make it sound natural when spoken aloud.
- If the user asks the character to talk about Zuri, explain Zuri naturally.
            `.trim(),
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_output_tokens: 180,
      });

    const script =
      String(
        scriptResponse.output_text || ""
      ).trim();

    if (!script) {
      throw new Error(
        "Zuri could not create dialogue for the video."
      );
    }

    console.log(
      "🗣️ VIDEO SCRIPT:",
      script
    );

    console.log(
      "🎙️ Generating spoken audio..."
    );

    const speech =
      await client.audio.speech.create({
        model: "gpt-4o-mini-tts",
        voice,
        input: script,
        response_format: "mp3",
      });

    const audioBuffer =
      Buffer.from(
        await speech.arrayBuffer()
      );

    if (!audioBuffer.length) {
      throw new Error(
        "Speech generation returned empty audio."
      );
    }

    console.log(
      "✅ SPEECH GENERATED:",
      audioBuffer.length,
      "bytes"
    );

    return {
      success: true,
      script,
      audioBuffer,
    };
  } catch (error) {
    console.error(
      "❌ SPEECH GENERATION ERROR:",
      error
    );

    return {
      success: false,
      script: null,
      audioBuffer: null,
      error:
        error instanceof Error
          ? error.message
          : "Speech generation failed.",
    };
  }
}