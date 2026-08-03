// engine/goalEngine.js

/**
 * ============================================
 * Goal Engine
 * ============================================
 *
 * Understands the user's real objective.
 */

export function detectGoal(message = "") {

  const text = message.toLowerCase();

  // Design
  if (
    /(design|logo|flyer|poster|banner|thumbnail|brand|ui|website)/i.test(text)
  ) {
    return {
      domain: "creative",
      objective: "design",
    };
  }

  // Learn
  if (
    /(teach|learn|explain|what is|how does|lesson|study)/i.test(text)
  ) {
    return {
      domain: "education",
      objective: "learn",
    };
  }

  // Code
  if (
    /(code|javascript|react|python|bug|debug|api)/i.test(text)
  ) {
    return {
      domain: "coding",
      objective: "develop",
    };
  }

  // Business
  if (
    /(business|startup|restaurant|company|marketing|brand)/i.test(text)
  ) {
    return {
      domain: "business",
      objective: "grow",
    };
  }

  // Research
  if (
    /(research|find|compare|latest|news)/i.test(text)
  ) {
    return {
      domain: "research",
      objective: "discover",
    };
  }

  return {
    domain: "general",
    objective: "assist",
  };
}