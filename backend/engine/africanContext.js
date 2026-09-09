// engine/africanContext.js

/**
 * ============================================
 * African Context Engine
 * ============================================
 *
 * Detects African language, country,
 * education system, business context,
 * and cultural hints from the user's message.
 */

export function detectAfricanContext(message = "") {
  const text = message.toLowerCase();

  const context = {
    language: "English",
    country: null,
    region: null,
    education: null,
    culture: null,
    business: false,
    confidence: 0.5,
  };

  // ============================
  // Nigerian Pidgin
  // ============================

  if (
    /(abeg|dey|wahala|oga|na|how far|wetin|shey|una|no wahala)/i.test(
      text
    )
  ) {
    context.language = "Nigerian Pidgin";
    context.country = "Nigeria";
    context.region = "West Africa";
    context.confidence = 0.98;
  }

  // ============================
  // Yoruba
  // ============================

  if (
    /(ẹ káàrọ̀|e kaaro|bawo|egbon|omo|jare|se daadaa)/i.test(
      text
    )
  ) {
    context.language = "Yoruba";
    context.country = "Nigeria";
    context.region = "West Africa";
    context.confidence = 0.98;
  }

  // ============================
  // Igbo
  // ============================

  if (
    /(nno|kedu|ndewo|biko|anyị|nne|nna)/i.test(text)
  ) {
    context.language = "Igbo";
    context.country = "Nigeria";
    context.region = "West Africa";
    context.confidence = 0.98;
  }

  // ============================
  // Hausa
  // ============================

  if (
    /(sannu|lafiya|ina kwana|nagode)/i.test(text)
  ) {
    context.language = "Hausa";
    context.country = "Nigeria";
    context.region = "West Africa";
    context.confidence = 0.98;
  }

  // ============================
  // Swahili
  // ============================

  if (
    /(habari|mambo|asante|karibu|rafiki)/i.test(text)
  ) {
    context.language = "Swahili";
    context.country = "Kenya/Tanzania";
    context.region = "East Africa";
    context.confidence = 0.98;
  }

  // ============================
  // Education
  // ============================

  if (
    /(waec|jamb|neco|utme)/i.test(text)
  ) {
    context.education = "Nigeria";
  }

  if (
    /(kcse)/i.test(text)
  ) {
    context.education = "Kenya";
  }

  if (
    /(bece)/i.test(text)
  ) {
    context.education = "Ghana";
  }

  // ============================
  // Business
  // ============================

  if (
    /(restaurant|church|startup|school|hospital|business|company|brand|shop)/i.test(
      text
    )
  ) {
    context.business = true;
  }

  return context;
}