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
      model: "gpt-5",
    };
  }

  // Image generation
  if (wantsImageGeneration) {
    return {
      provider: "openai",
      model: "gpt-image-1",
    };
  }

  // Image editing
  if (wantsImageEditing) {
    return {
      provider: "openai",
      model: "gpt-image-1",
    };
  }

  switch (tool) {
    case "coding":
      return {
        provider: "openai",
        model: "gpt-5",
      };

    case "reasoning":
      return {
        provider: "openai",
        model: "gpt-5",
      };

    case "search":
      return {
        provider: "openai",
        model: "gpt-5",
      };

    default:
      return {
        provider: "groq",
        model: "llama-3.3-70b-versatile",
      };
  }
}