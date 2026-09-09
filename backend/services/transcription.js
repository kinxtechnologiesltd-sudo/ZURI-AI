import FormData from "form-data";
import fetch from "node-fetch";

import { ENV } from "../config/environment.js";

export async function transcribeAudio(
  audioBuffer,
  filename = "audio.wav"
) {

  const form = new FormData();

  form.append(
    "file",
    audioBuffer,
    filename
  );

  form.append(
    "model",
    "whisper-large-v3"
  );

  const response =
    await fetch(
      "https://api.groq.com/openai/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ENV.GROQ_API_KEY}`,
        },
        body: form,
      }
    );

  if (!response.ok) {
    throw new Error(
      "Failed to transcribe audio."
    );
  }

  const data =
    await response.json();

  return data.text;
}