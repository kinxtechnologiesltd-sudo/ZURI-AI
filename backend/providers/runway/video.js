import RunwayML, { TaskFailedError } from "@runwayml/sdk";
import { ENV } from "../../config/environment.js";

const client = new RunwayML({
  apiKey: ENV.RUNWAY_API_KEY,
});

export async function generateRunwayVideo({
  prompt,
  image = null,
  duration = 5,
  ratio = "1280:720",
  seed,
}) {
  try {
    let task;

    if (image) {
      task = await client.imageToVideo
        .create({
          model: "gen4.5",
          promptImage: image,
          promptText: prompt,
          duration,
          ratio,
          seed,
        })
        .waitForTaskOutput();
    } else {
      task = await client.textToVideo
        .create({
          model: "gen4.5",
          promptText: prompt,
          duration,
          ratio,
          seed,
        })
        .waitForTaskOutput();
    }

    return {
      success: true,
      provider: "runway",
      taskId: task.id,
      status: task.status,
      videoUrl: task.output?.[0] ?? null,
      raw: task,
    };
  } catch (error) {
    if (error instanceof TaskFailedError) {
      return {
        success: false,
        provider: "runway",
        error: "Generation failed.",
        details: error.taskDetails,
      };
    }

    return {
      success: false,
      provider: "runway",
      error: error.message,
    };
  }
}