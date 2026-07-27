import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 3001,

  NODE_ENV: process.env.NODE_ENV || "development",

  // AI Providers
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  STABILITY_API_KEY: process.env.STABILITY_API_KEY,

  // Video Providers
  RUNWAY_API_KEY: process.env.RUNWAY_API_KEY,
  LUMA_API_KEY: process.env.LUMA_API_KEY,
FAL_KEY: process.env.FAL_KEY,
  PIKA_API_KEY: process.env.PIKA_API_KEY,
  HAILUO_API_KEY: process.env.HAILUO_API_KEY,

  // Other Services
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
  TAVILY_API_KEY: process.env.TAVILY_API_KEY,
};