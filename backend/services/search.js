// services/search.js

import { ENV } from "../config/environment.js";

const TAVILY_URL = "https://api.tavily.com/search";

export async function searchWeb(query) {
  if (!query?.trim()) {
    return {
      success: false,
      message: "Search query is empty.",
      answer: "",
      results: [],
    };
  }

  if (!ENV.TAVILY_API_KEY) {
    throw new Error(
      "TAVILY_API_KEY is missing."
    );
  }

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 15000);

  try {
    const response = await fetch(TAVILY_URL, {
      method: "POST",

      signal: controller.signal,

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        api_key: ENV.TAVILY_API_KEY,

        query,

        search_depth: "advanced",

        max_results: 5,

        include_answer: true,

        include_images: false,

        include_raw_content: false,
      }),
    });

    clearTimeout(timeout);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
        "Search request failed."
      );
    }

    return {
      success: true,

      answer: data.answer || "",

      results: (data.results || []).map(result => ({
        title: result.title,
        url: result.url,
        content: result.content,
        score: result.score,
      })),
    };

  } catch (error) {

    clearTimeout(timeout);

    console.error("Search Error:", error);

    return {
      success: false,
      message: error.message,
      answer: "",
      results: [],
    };
  }
}