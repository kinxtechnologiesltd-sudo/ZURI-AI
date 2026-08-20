import { ENV } from "../../config/environment.js";

const BASE_URL = "https://agents.lumalabs.ai/v1";

export async function getLumaStatus(taskId) {
  const response = await fetch(`${BASE_URL}/generations/${taskId}`, {
    headers: {
      Authorization: `Bearer ${ENV.LUMA_API_KEY}`,
    },
  });

  const result = await response.json();

  return {
    success: true,
    provider: "luma",
    taskId,
    status: result.state,
    videoUrl: result.output?.[0]?.url ?? null,
    raw: result,
  };
}