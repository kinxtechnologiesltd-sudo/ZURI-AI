import { ENV } from "../../config/environment.js";

const BASE_URL = "https://agents.lumalabs.ai/v1";

export async function generateLumaVideo({
  prompt,
  aspectRatio = "16:9",
  duration = "5s",
}) {
  try {
    const response = await fetch(`${BASE_URL}/generations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ENV.LUMA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        model: "ray-3.2",
        type: "video",
        aspect_ratio: aspectRatio,
        video: {
          duration,
        },
      }),
    });

    const job = await response.json();

    return {
      success: true,
      provider: "luma",
      taskId: job.id,
      status: job.state,
      raw: job,
    };
  } catch (error) {
    return {
      success: false,
      provider: "luma",
      error: error.message,
    };
  }
}