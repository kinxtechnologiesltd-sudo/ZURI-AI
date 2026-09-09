// services/modelRouter.js

export function selectModel({
  tool,
  hasImage = false,
  wantsImageGeneration = false,
  wantsImageEditing = false,
}) {
  // Vision
  if (hasImage) {
    return {
      provider: "openai",
      model: "gpt-5.6-terra",
    };
  }

  // Image generation
  if (wantsImageGeneration) {
    return {
      provider: "openai",
      model: "gpt-image-2",
    };
  }

  // Image editing
  if (wantsImageEditing) {
    return {
      provider: "openai",
      model: "gpt-image-2",
    };
  }

  switch (tool) {
    case "image-generation":
      return {
        provider: "openai",
        model: "gpt-image-2",
      };

    case "coding":
      return {
        provider: "openai",
        model: "gpt-5.6-terra",
      };

    case "reasoning":
      return {
        provider: "openai",
        model: "gpt-5.6-terra",
      };

    case "search":
      return {
        provider: "openai",
        model: "gpt-5.6-terra",
      };

    default:
      return {
        provider: "openai",
        model: "gpt-5.6-terra",
      };
  }
}