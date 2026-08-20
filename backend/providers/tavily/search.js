import { ENV } from "../../config/environment.js";

const TAVILY_URL =
  "https://api.tavily.com/search";

export async function searchTavily({
  query,
  searchDepth = "advanced",
  maxResults = 5,
  topic = "general",
}) {
  try {
    const apiKey =
      String(
        ENV.TAVILY_API_KEY || ""
      ).trim();

    if (!apiKey) {
      throw new Error(
        "TAVILY_API_KEY is missing."
      );
    }

    if (!query?.trim()) {
      throw new Error(
        "Tavily search query is required."
      );
    }

    console.log(
      "🔎 TAVILY SEARCH:",
      query
    );

    const response =
      await fetch(
        TAVILY_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Accept:
              "application/json",
          },

          body:
            JSON.stringify({
              api_key:
                apiKey,

              query:
                query.trim(),

              search_depth:
                searchDepth,

              max_results:
                maxResults,

              include_images:
                true,

              topic,
            }),
        }
      );

    const text =
      await response.text();

    let data;

    try {
      data =
        JSON.parse(text);
    } catch {
      data = {
        rawText:
          text,
      };
    }

    console.log(
      "🔎 TAVILY STATUS:",
      response.status
    );

    if (!response.ok) {
      return {
        success: false,
        provider: "tavily",
        status:
          response.status,
        error:
          data?.detail ||
          data?.message ||
          "Tavily search failed.",
        raw: data,
      };
    }

    return {
      success: true,
      provider: "tavily",

      answer:
        data?.answer ||
        null,

      results:
        Array.isArray(
          data?.results
        )
          ? data.results
          : [],

      images:
        Array.isArray(
          data?.images
        )
          ? data.images
          : [],

      raw:
        data,
    };

  } catch (error) {
    console.error(
      "❌ Tavily error:",
      error
    );

    return {
      success: false,
      provider: "tavily",

      error:
        error instanceof Error
          ? error.message
          : "Tavily search failed.",
    };
  }
}