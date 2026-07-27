/**
 * Returns only memories relevant to
 * the current user message.
 */
export function retrieveRelevantMemories(
  message,
  memories = []
) {
  if (!message || !memories.length) {
    return [];
  }

  const text = message.toLowerCase();

  return memories
    .filter((memory) => {
      const words = memory
        .toLowerCase()
        .split(/\s+/);

      return words.some(
        (word) =>
          word.length > 3 &&
          text.includes(word)
      );
    })
    .slice(0, 5);
}