/**
 * =====================================================
 * Retrieve Relevant Memories
 * =====================================================
 *
 * Returns the memories that are most relevant
 * to the current conversation.
 */

export function retrieveRelevantMemories(
  message,
  memories = []
) {
  if (!message || !Array.isArray(memories)) {
    return [];
  }

  const text = message
    .toLowerCase()
    .trim();

  const scored = memories.map((memory) => {

    const memoryText = memory
      .toLowerCase();

    let score = 0;

    // Exact match
    if (memoryText.includes(text)) {
      score += 100;
    }

    // Shared words
    const messageWords = text.split(/\s+/);

    for (const word of messageWords) {

      if (word.length < 3) continue;

      if (memoryText.includes(word)) {
        score += 10;
      }

    }

    // Prefer shorter, more focused memories
    score -= memoryText.length / 200;

    return {
      memory,
      score,
    };

  });

  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(item => item.memory);
}