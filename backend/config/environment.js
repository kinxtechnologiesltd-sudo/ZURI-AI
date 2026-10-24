import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  PORT:
    process.env.PORT ||
    3001,

  NODE_ENV:
    process.env.NODE_ENV ||
    "development",

  PUBLIC_BASE_URL:
    process.env.PUBLIC_BASE_URL || "http://localhost:3001",

  GENERATED_FILES_DIR:
    process.env.GENERATED_FILES_DIR || "./generated",

  PDF_STORAGE_PROVIDER:
    process.env.PDF_STORAGE_PROVIDER || "local",

  R2_ENDPOINT:
    process.env.R2_ENDPOINT,

  R2_BUCKET_NAME:
    process.env.R2_BUCKET_NAME,

  R2_ACCESS_KEY_ID:
    process.env.R2_ACCESS_KEY_ID,

  R2_SECRET_ACCESS_KEY:
    process.env.R2_SECRET_ACCESS_KEY,

  R2_REGION:
    process.env.R2_REGION || "auto",

  // AI Providers
  GROQ_API_KEY:
    process.env.GROQ_API_KEY,

  GROQ_TRANSCRIPTION_MODEL:
    process.env.GROQ_TRANSCRIPTION_MODEL || "whisper-large-v3",

  OPENAI_API_KEY:
    process.env.OPENAI_API_KEY,

  OPENAI_MODEL:
    process.env.OPENAI_MODEL || "gpt-4.1",

  OPENAI_FAST_MODEL:
    process.env.OPENAI_FAST_MODEL || "gpt-4.1-mini",

  OPENAI_IMAGE_MODEL:
    process.env.OPENAI_IMAGE_MODEL || "gpt-image-2",

  OPENAI_TTS_MODEL:
    process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts",

  STABILITY_API_KEY:
    process.env.STABILITY_API_KEY,

  // Video Providers
  RUNWAY_API_KEY:
    process.env.RUNWAY_API_KEY,

  LUMA_API_KEY:
    process.env.LUMA_API_KEY,

  FAL_KEY:
    process.env.FAL_KEY,

  FAL_MODEL:
    process.env.FAL_MODEL || "fal-ai/flux/schnell",

  FAL_COMIC_MODEL:
    process.env.FAL_COMIC_MODEL || "fal-ai/flux-2-lora-gallery/digital-comic-art",

  PIKA_API_KEY:
    process.env.PIKA_API_KEY,

  HAILUO_API_KEY:
    process.env.HAILUO_API_KEY,

  // Music
  SUNO_API_KEY:
    process.env.SUNO_API_KEY,

  SUNO_CALLBACK_URL:
    process.env.SUNO_CALLBACK_URL,

  // Other Services
  ELEVENLABS_API_KEY:
    process.env.ELEVENLABS_API_KEY,

  ELEVENLABS_MODEL_ID:
    process.env.ELEVENLABS_MODEL_ID || "eleven_v3",

  TAVILY_API_KEY:
    process.env.TAVILY_API_KEY,
};