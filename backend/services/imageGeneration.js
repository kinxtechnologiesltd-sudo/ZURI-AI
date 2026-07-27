import { selectImageProvider } from "../engine/imageRouter.js";
import { generateOpenAIImage } from "../providers/openaiImages.js";
import { generateStabilityImage } from "../providers/stabilityImages.js";

export async function generateImage({
  prompt,
  size = "1024x1024",
  edit = false,
}) {
  const provider = selectImageProvider({
    prompt,
    edit,
  });

  switch (provider) {
    case "openai":
      return await generateOpenAIImage({
        prompt,
        size,
      });

    case "stability":
      return await generateStabilityImage({
        prompt,
        size,
      });

    default:
      throw new Error("No image provider selected.");
  }
}