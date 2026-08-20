import { searchTavily } from "../providers/tavily/search.js";

const MAX_RESEARCH_SOURCES = 6;
const MAX_SOURCE_CONTENT_CHARS = 1200;

/**
 * =====================================================
 * FRESHNESS
 * =====================================================
 */

function needsFreshResearch(query) {
  return /\b(current|latest|recent|today|now|2026|this year|up-to-date|newest)\b/i.test(
    query
  );
}

/**
 * =====================================================
 * BUILD RESEARCH QUERIES
 * =====================================================
 */

function buildQueries(query) {
  const normalized =
    String(query || "").trim();

  if (!normalized) {
    return [];
  }

  if (normalized.length < 90) {
    return [normalized];
  }

  return [
    normalized,
    `${normalized} latest developments`,
    `${normalized} statistics data report`,
    `${normalized} Africa Nigeria 2026`,
  ];
}

/**
 * =====================================================
 * NORMALIZE SOURCES
 * =====================================================
 */

function normalizeSources(results) {
  return (results || []).map(
    (item) => ({
      title:
        item?.title ||
        "Untitled source",

      url:
        item?.url ||
        null,

      content:
        String(item?.content || "")
          .trim()
          .slice(0, MAX_SOURCE_CONTENT_CHARS),

      publishedDate:
        item?.published_date ||
        null,
    })
  );
}

/**
 * =====================================================
 * NORMALIZE IMAGES
 * =====================================================
 */

function normalizeImages(images) {
  return (images || [])
    .map((image, index) => {
      /**
       * Tavily image results can vary in structure.
       */

      if (typeof image === "string") {
        return {
          id: index + 1,
          url: image,
          title: null,
          sourceUrl: null,
        };
      }

      return {
        id: index + 1,

        url:
          image?.url ||
          image?.image_url ||
          image?.src ||
          null,

        title:
          image?.title ||
          null,

        sourceUrl:
          image?.source_url ||
          image?.sourceUrl ||
          null,
      };
    })
    .filter(
      (image) =>
        typeof image.url === "string" &&
        image.url.startsWith("http")
    );
}

/**
 * =====================================================
 * CONDUCT RESEARCH
 * =====================================================
 */

export async function conductResearch({
  query,
  maxResults = 6,
  maxImages = 8,
  searchDepth = "advanced",
}) {
  const cleanQuery =
    String(query || "").trim();

  if (!cleanQuery) {
    return {
      success: false,
      error: "Research query is required.",
      sources: [],
      images: [],
    };
  }

  console.log(
    "🔬 ZURI RESEARCH:",
    cleanQuery
  );

  const fresh =
    needsFreshResearch(
      cleanQuery
    );

  const queries =
    buildQueries(
      cleanQuery
    );

  console.log(
    "🔎 RESEARCH QUERIES:",
    queries
  );

  const allResults = [];
  const allImages = [];

  /**
   * ===================================================
   * TAVILY SEARCH
   * ===================================================
   */

  for (
    const searchQuery of queries
  ) {
    const finalQuery = fresh
      ? `${searchQuery} after:2025-01-01`
      : searchQuery;

    console.log(
      "🔎 TAVILY SEARCH:",
      finalQuery
    );

    const result =
      await searchTavily({
        query:
          finalQuery,

        searchDepth,

        maxResults,

        topic: "general",
      });

    if (!result?.success) {
      console.warn(
        "⚠️ Tavily query failed:",
        finalQuery,
        result?.error
      );

      continue;
    }

    allResults.push(
      ...(result.results || [])
    );

    allImages.push(
      ...(result.images || [])
    );
  }

  /**
   * ===================================================
   * DEDUPLICATE SOURCES
   * ===================================================
   */

  const sourceMap =
    new Map();

  for (
    const item of allResults
  ) {
    if (!item?.url) {
      continue;
    }

    if (!sourceMap.has(item.url)) {
      sourceMap.set(
        item.url,
        item
      );
    }
  }

  const sources =
    normalizeSources(
      Array.from(
        sourceMap.values()
      )
        .sort(
          (a, b) =>
            Number(b?.score || 0) -
            Number(a?.score || 0)
        )
        .slice(
          0,
          Math.min(
            maxResults,
            MAX_RESEARCH_SOURCES
          )
        )
    );

  /**
   * ===================================================
   * DEDUPLICATE IMAGES
   * ===================================================
   */

  const imageMap =
    new Map();

  for (
    const image of allImages
  ) {
    const normalized =
      normalizeImages([image])[0];

    if (
      !normalized?.url
    ) {
      continue;
    }

    if (
      !imageMap.has(
        normalized.url
      )
    ) {
      imageMap.set(
        normalized.url,
        normalized
      );
    }
  }

  const images =
    Array.from(
      imageMap.values()
    ).slice(
      0,
      maxImages
    );

  console.log(
    "🖼️ RESEARCH IMAGES FOUND:",
    images.length
  );

  return {
    success: true,

    query:
      cleanQuery,

    currentResearch:
      fresh,

    sources,

    images,

    sourceCount:
      sources.length,

    imageCount:
      images.length,
  };
}