// services/modelRouter.js

const HIGH_QUALITY_MODEL =
  process.env.OPENAI_MODEL || "gpt-4.1";

const FAST_MODEL =
  process.env.OPENAI_FAST_MODEL || "gpt-4.1-mini";

export function selectModel({
  tool,
  hasImage = false,
  wantsImageGeneration = false,
  wantsImageEditing = false,
}) {
  if (hasImage) {
    return {
      provider: "openai",
      model: HIGH_QUALITY_MODEL,
    };
  }

  if (wantsImageGeneration) {
    return {
      provider: "openai",
      model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-2",
    };
  }

  if (wantsImageEditing) {
    return {
      provider: "openai",
      model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-2",
    };
  }

  switch (tool) {
    case "image-generation":
      return {
        provider: "openai",
        model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-2",
      };

    case "coding":
      return {
        provider: "openai",
        model: HIGH_QUALITY_MODEL,
      };

    case "reasoning":
      return {
        provider: "openai",
        model: HIGH_QUALITY_MODEL,
      };

    case "search":
      return {
        provider: "openai",
        model: FAST_MODEL,
      };

    default:
      return {
        provider: "openai",
        model: HIGH_QUALITY_MODEL,
      };
  }
}
