import { runProvider } from "../providers/index.js";

const BRAIN_MODEL =
  "openai/gpt-oss-20b";

/**
 * =====================================================
 * ZURI BRAIN ROUTER
 * =====================================================
 *
 * Priority:
 *
 * 1. Explicit video request
 * 2. Explicit image request
 * 3. Explicit comic request
 * 4. Explicit music request
 * 5. Normal Brain classification
 */

function detectVideoRequest(message) {
  const text =
    String(message || "").toLowerCase();

  return (
    /\b(generate|create|make|produce|render)\b[\s\S]{0,120}\b(video|film|clip|animation)\b/i.test(
      text
    ) ||
    /\b(video|animation|film|clip)\b/i.test(
      text
    ) &&
      /\b(generate|create|make|produce|render)\b/i.test(
        text
      )
  );
}

function detectMusicRequest(message) {
  const text =
    String(message || "").toLowerCase();

  return (
    /\b(generate|create|make|compose)\b[\s\S]{0,80}\b(song|music|beat|soundtrack)\b/i.test(
      text
    ) ||
    /\b(instrumental|soundtrack|sing|singing|vocals|lyrics)\b/i.test(
      text
    ) ||
    /\b(afrobeat)\s+song\b/i.test(text)
  );
}

function detectComicRequest(message) {
  const text =
    String(message || "").toLowerCase();

  return /\b(create|make|generate|draw)\b[\s\S]{0,80}\b(comic|comics|comic page|comic panel|comic panels)\b/i.test(
    text
  );
}

/**
 * =====================================================
 * THINK
 * =====================================================
 */

export async function think(message) {
  const text =
    String(message || "").trim();

  /**
   * ===================================================
   * EMPTY MESSAGE
   * ===================================================
   */

  if (!text) {
    return {
      tool: "chat",
      additionalTools: [],
      intent: "question",
      category: "general",
      goal:
        "No user request provided.",
      language: "English",
      responseStyle: "concise",
      confidence: 0,
      reason:
        "No user request.",
    };
  }

  const videoRequest =
    detectVideoRequest(text);
  const imageRequest =
    detectImageRequest(text);
  const comicRequest =
    detectComicRequest(text);
  const musicRequest =
    detectMusicRequest(text);

  console.log(
    "🔎 TRACE BRAIN INPUT:",
    text
  );

  console.log(
    "🧠 CREATIVE INTENT CHECK"
  );
  console.log(
    "🖼️ IMAGE REQUEST:",
    imageRequest
  );
  console.log(
    "🎬 VIDEO REQUEST:",
    videoRequest
  );
  console.log(
    "📚 COMIC REQUEST:",
    comicRequest
  );
  console.log(
    "🎵 MUSIC REQUEST:",
    musicRequest
  );

  /**
   * ===================================================
   * HARD VIDEO ROUTING
   * ===================================================
   *
   * This happens BEFORE Groq.
   *
   * Example:
   *
   * Create a video of an African woman singing
   *
   * MUST become:
   *
   * video-generation
   */

  if (videoRequest) {
    console.log(
      "🎯 HARD ROUTE: VIDEO"
    );

    return {
      tool:
        "video-generation",

      additionalTools: [],

      intent:
        "generate",

      category:
        "creative",

      goal:
        text,

      language:
        "English",

      responseStyle:
        "creative",

      confidence:
        1,

      reason:
        "Explicit video or animation request detected. Video routing takes priority over music routing.",
    };
  }

  if (imageRequest) {
    console.log(
      "🔎 TRACE BRAIN SELECTED TOOL: image-generation"
    );
    console.log(
      "🧠 CREATIVE INTENT:\nIMAGE"
    );

    console.log(
      "🎨 IMAGE TOOL SELECTED"
    );

    return {
      tool: "image-generation",
      additionalTools: [],
      intent: "generate",
      category: "creative",
      goal: text,
      language: "English",
      responseStyle: "creative",
      confidence: 1,
      reason:
        "Explicit image-generation request detected.",
    };
  }

  if (comicRequest) {
    console.log(
      "🧠 SELECTED TOOL: comic-generation"
    );

    return {
      tool: "comic-generation",
      additionalTools: [],
      intent: "generate",
      category: "creative",
      goal: text,
      language: "English",
      responseStyle: "creative",
      confidence: 1,
      reason:
        "Explicit comic-generation request detected.",
    };
  }

  /**
   * ===================================================
   * HARD MUSIC ROUTING
   * ===================================================
   *
   * Only happens when the request is NOT a video or image.
   */

  if (musicRequest) {
    console.log(
      "🎯 HARD ROUTE: MUSIC"
    );

    return {
      tool:
        "music-generation",

      additionalTools: [],

      intent:
        "generate",

      category:
        "creative",

      goal:
        text,

      language:
        "English",

      responseStyle:
        "creative",

      confidence:
        1,

      reason:
        "Explicit music-generation request detected.",
    };
  }

  /**
   * ===================================================
   * GROQ BRAIN
   * ===================================================
   *
   * Used only when deterministic routing above did not
   * identify a specialized media request.
   */

  const messages = [
    {
      role: "system",

      content: `
You are Zuri's Brain.

You NEVER answer the user.

Your ONLY responsibility is to understand the user's request
and return a structured JSON decision for the Zuri Engine.

Return ONLY valid JSON.
Never return markdown.
Never explain anything outside the JSON.

====================================================
AVAILABLE TOOLS
====================================================

CORE TOOLS

chat
search
vision
pdf
image-generation
calculator
weather
coding

ADVANCED TOOLS

reasoning
translation
memory
research

ULTRA CREATIVE TOOLS

music-generation
video-generation
animation
comic-generation

====================================================
TOOL DEFINITIONS
====================================================

chat
Use for normal conversation, explanations, simple requests,
casual conversation, and responses that do not require another
specialized tool.

search
Use when current, external, recent, or web-based information
is required.

vision
Use when an uploaded image must be analyzed.

pdf
Use when an uploaded PDF must be analyzed.

image-generation
Use when the user wants an image, illustration, artwork,
poster, design, or other still visual created.

calculator
Use for arithmetic and numerical calculations.

weather
Use for weather forecasts or weather conditions.

coding
Use for programming, debugging, software architecture,
code explanations, or technical implementation.

reasoning
Use for difficult multi-step reasoning.

translation
Use when the user explicitly wants translation.

memory
Use when the request requires retrieving, storing, or using
important user-specific memory.

research
Use when the request requires deeper investigation,
cross-checking, or synthesis beyond a simple web search.

music-generation
Use when the user explicitly wants original music,
a song, instrumental, beat, melody, soundtrack,
rap song, vocals, or generated audio.

video-generation
Use when the user explicitly wants a generated video,
movie, film, clip, or visual sequence.

animation
Use when the user explicitly wants animation or animated
visuals.

comic-generation
Use when the user wants a comic, comic panels,
storyboard, or visual story sequence.

====================================================
IMPORTANT VIDEO RULE
====================================================

If the user explicitly requests a VIDEO or ANIMATION,
choose video-generation.

This remains true even when the request also includes:

music
song
rap
singing
vocals
soundtrack
audio
beat

The video pipeline is responsible for adding audio.

Examples:

"Create an Afrobeat song about Kaduna."
→ music-generation

"Create a video of an African woman singing Afrobeat."
→ video-generation

"Make an animated African girl dancing to music."
→ video-generation

"Create a silent sunset video."
→ video-generation

====================================================
IMPORTANT MUSIC RULE
====================================================

Use music-generation when the user wants music/audio
and does NOT explicitly request a video.

====================================================
DECISION RULES
====================================================

1. Always choose ONE primary tool.

2. Add additionalTools only when genuinely necessary.

3. Never add tools merely because they could be useful.

4. Use chat for ordinary conversation.

5. Use search for current or external information.

6. Use research for deeper investigation.

7. Use vision for uploaded-image analysis.

8. Use pdf for uploaded-PDF analysis.

9. Use calculator for arithmetic.

10. Use weather for weather requests.

11. Use coding for programming requests.

12. Use image-generation for still-image creation.

13. Use music-generation for generated music.

14. Use video-generation for generated video.

15. Use animation for animation requests.

16. Use comic-generation for comics.

17. Detect language.

18. Classify the request into the best category.

19. Detect intent.

20. Summarize the user's goal.

21. Choose a response style.

22. Return confidence between 0 and 1.

23. If uncertain, use chat with lower confidence.

====================================================
CATEGORIES
====================================================

general
education
business
creative
coding
research
productivity
health
finance
travel
history
culture
language
science
technology

====================================================
INTENTS
====================================================

question
create
edit
analyze
translate
research
summarize
compare
teach
plan
generate
brainstorm
debug

====================================================
RESPONSE STYLES
====================================================

concise
balanced
detailed
creative

====================================================
RETURN FORMAT
====================================================

Return JSON exactly like:

{
  "tool": "chat",
  "additionalTools": [],
  "intent": "question",
  "category": "general",
  "goal": "Answer the user's question",
  "language": "English",
  "responseStyle": "balanced",
  "confidence": 0.98,
  "reason": "Normal conversation."
}
`,
    },

    {
      role: "user",
      content: text,
    },
  ];

  /**
   * ===================================================
   * CALL GROQ
   * ===================================================
   */

  try {
    const response =
      await runProvider({
        provider:
          "groq",

        model:
          BRAIN_MODEL,

        messages,
      });

    const rawContent =
      response
        ?.choices?.[0]
        ?.message?.content;

    if (!rawContent) {
      throw new Error(
        "Brain returned empty content."
      );
    }

    console.log(
      "🧠 Raw Brain response:",
      rawContent
    );

    /**
     * Some reasoning models can occasionally wrap JSON
     * in whitespace/code fences. Strip those safely.
     */

    const cleanedContent =
      String(rawContent)
        .trim()
        .replace(
          /^```json\s*/i,
          ""
        )
        .replace(
          /^```\s*/i,
          ""
        )
        .replace(
          /\s*```$/i,
          ""
        )
        .trim();

    const decision =
      JSON.parse(
        cleanedContent
      );

    console.log(
      "🧠 Final Brain Decision:",
      decision
    );

    /**
     * =================================================
     * SAFETY OVERRIDE
     * =================================================
     *
     * Even if Groq somehow returns "chat" for an
     * explicit video request, correct it here.
     */

    if (
      detectVideoRequest(text)
    ) {
      console.log(
        "🛡️ FINAL OVERRIDE: VIDEO"
      );

      return {
        tool:
          "video-generation",

        additionalTools: [],

        intent:
          "generate",

        category:
          "creative",

        goal:
          text,

        language:
          decision.language ||
          "English",

        responseStyle:
          "creative",

        confidence:
          1,

        reason:
          "Explicit video request detected by deterministic final override.",
      };
    }

    /**
     * =================================================
     * FINAL MUSIC OVERRIDE
     * =================================================
     */

    if (
      detectMusicRequest(text)
    ) {
      console.log(
        "🛡️ FINAL OVERRIDE: MUSIC"
      );

      return {
        tool:
          "music-generation",

        additionalTools: [],

        intent:
          "generate",

        category:
          "creative",

        goal:
          text,

        language:
          decision.language ||
          "English",

        responseStyle:
          "creative",

        confidence:
          1,

        reason:
          "Explicit music request detected by deterministic final override.",
      };
    }
/**
 * =================================================
 * FINAL IMAGE OVERRIDE
 * =================================================
 */

if (
  detectImageRequest(text)
) {
  console.log(
    "🛡️ FINAL OVERRIDE: IMAGE"
  );

  return {
    tool: "image-generation",

    additionalTools: [],

    intent: "generate",

    category: "creative",

    goal:
      text,

    language:
      decision.language ||
      "English",

    responseStyle:
      "creative",

    confidence:
      1,

    reason:
      "Explicit image request detected by deterministic final override.",
  };
}
    /**
     * =================================================
     * NORMAL DECISION
     * =================================================
     */

    return {
      tool:
        decision.tool ||
        "chat",

      additionalTools:
        Array.isArray(
          decision.additionalTools
        )
          ? decision.additionalTools
          : [],

      intent:
        decision.intent ||
        "question",

      category:
        decision.category ||
        "general",

      goal:
        decision.goal ||
        text,

      language:
        decision.language ||
        "English",

      responseStyle:
        decision.responseStyle ||
        "balanced",

      confidence:
        typeof decision.confidence ===
        "number"
          ? decision.confidence
          : 0.8,

      reason:
        decision.reason ||
        "No reason provided.",
    };

  } catch (error) {
    console.error(
      "Brain Router:",
      error
    );

    /**
     * =================================================
     * FALLBACK ROUTING
     * =================================================
     *
     * Even if Groq fails, explicit media requests still
     * work.
     */
if (
  detectImageRequest(text)
) {
  console.log(
    "🛡️ FALLBACK ROUTE: IMAGE"
  );

  return {
    tool:
      "image-generation",

    additionalTools: [],

    intent:
      "generate",

    category:
      "creative",

    goal:
      text,

    language:
      "English",

    responseStyle:
      "creative",

    confidence:
      1,

    reason:
      "Image fallback route.",
  };
}
    if (
      detectVideoRequest(text)
    ) {
      console.log(
        "🛡️ FALLBACK ROUTE: VIDEO"
      );

      return {
        tool:
          "video-generation",

        additionalTools: [],

        intent:
          "generate",

        category:
          "creative",

        goal:
          text,

        language:
          "English",

        responseStyle:
          "creative",

        confidence:
          1,

        reason:
          "Video fallback route.",
      };
    }

    if (
      detectMusicRequest(text)
    ) {
      console.log(
        "🛡️ FALLBACK ROUTE: MUSIC"
      );

      return {
        tool:
          "music-generation",

        additionalTools: [],

        intent:
          "generate",

        category:
          "creative",

        goal:
          text,

        language:
          "English",

        responseStyle:
          "creative",

        confidence:
          1,

        reason:
          "Music fallback route.",
      };
    }

    return {
      tool:
        "chat",

      additionalTools: [],

      intent:
        "question",

      category:
        "general",

      goal:
        text,

      language:
        "English",

      responseStyle:
        "balanced",

      confidence:
        0.3,

      reason:
        "Fallback decision.",
    };
  }
}

function detectImageRequest(message) {
  const text = String(message || "")
    .trim()
    .toLowerCase();

  if (!text) {
    return false;
  }

  if (
    /\b(create|make|generate|draw)\b[\s\S]{0,80}\b(comic|comics|comic page|comic panel|comic panels)\b/i.test(
      text
    )
  ) {
    return false;
  }

  const visualTarget =
    "(?:images?|pictures?|photos?|photographs?|artworks?|art|illustrations?|drawings?|visuals?|scenes?|portraits?|landscapes?|posters?|flyers?|banners?|brochures?|invitations?|cards?|social\\s+media\\s+graphics?|advertisements?|adverts?|thumbnails?|covers?|album\\s+covers?|book\\s+covers?|presentation\\s+graphics?|diagrams?|infographics?|flowcharts?|charts?|graphs?|maps?|timelines?|mind\\s+maps?|schematics?|technical\\s+illustrations?|educational\\s+illustrations?|logos?|icons?|brand\\s+marks?|mascots?|packaging|product\\s+mockups?|brand\\s+visuals?|concept\\s+art|character\\s+designs?|manga|storyboards?|fantasy\\s+art|cinematic\\s+scenes?|architecture|3d\\s+renders?|visualizations?)";

  const creationRequest = new RegExp(
    `\\b(?:create|generate|make|draw|design|produce|render|illustrate|visualize|depict|compose)\\b(?:\\s+[\\w'-]+){0,6}\\s+${visualTarget}\\b`,
    "i"
  );
  const statedRequest = new RegExp(
    `\\b(?:i\\s+)?(?:need|want|would\\s+like)\\b(?:\\s+[\\w'-]+){0,3}\\s+${visualTarget}\\b`,
    "i"
  );
  const giveRequest = new RegExp(
    `\\bgive\\s+me\\s+(?:a|an|some)\\s+${visualTarget}\\b`,
    "i"
  );
  const informationalRequest =
    /^(?:what\b|why\b|how\b|when\b|where\b|who\b|tell me about\b|tell me how\b|explain\b|describe\b|define\b|can you explain\b|can you tell me how\b)/i;
  const hypotheticalVisualRequest =
    /\bshow\s+me\s+what\b[^.!?;\n]{0,100}\bwould\s+look\s+like\b/i;

  return text
    .split(/[.!?;\n]+/)
    .some((clause) => {
      const request = clause.trim();

      if (!request || informationalRequest.test(request)) {
        return false;
      }

      return (
        creationRequest.test(request) ||
        statedRequest.test(request) ||
        giveRequest.test(request) ||
        hypotheticalVisualRequest.test(request)
      );
    });
}