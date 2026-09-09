import { searchWeb } from "../search.js";

export async function executeSearch({ message }) {
  try {
    const results = await searchWeb(message);

    if (!results || !results.success) {
      return "";
    }

    return `

==========================
WEB SEARCH RESULTS
==========================

SUMMARY

${results.answer}

SOURCES

${results.results
      .map(
        (r, i) => `${i + 1}. ${r.title}
${r.url}

${r.content}`
      )
      .join("\n\n")}

`;
  } catch (error) {
    console.error(error);
    return "";
  }
}

// Alias for compatibility
export const searchTool = executeSearch;