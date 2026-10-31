const MAX_RESEARCH_CONTEXT_CHARS = 5600;
const MAX_RESEARCH_EXCERPT_CHARS = 1200;

export function buildResearchContext(result) {
  const knowledgeContext = String(result?.knowledgeContext || "").trim();
  const sources = getResearchSources(result);

  if (sources.length === 0 && !knowledgeContext) {
    return "";
  }

  const blocks = sources.map((source, index) => ({
    prefix: [
      `Citation: [${index + 1}]`,
      `Title: ${String(source.title || "Untitled source")}`,
      `URL: ${String(source.url)}`,
      `Published: ${String(source.publishedDate || "Unknown")}`,
    ].join("\n"),
    content: String(source.content || "").trim(),
  }));

  const fixedLength = blocks.reduce(
    (total, block) => total + block.prefix.length,
    0
  );
  const separatorLength = (blocks.length - 1) * 2;
  const availableExcerptLength = Math.max(
    0,
    MAX_RESEARCH_CONTEXT_CHARS -
      "RESEARCH SOURCES:\n\n".length -
      fixedLength -
      separatorLength -
      knowledgeContext.length
  );
  const excerptLimit = Math.min(
    MAX_RESEARCH_EXCERPT_CHARS,
    Math.floor(availableExcerptLength / blocks.length)
  );

  const sourceContext = sources.length
    ? [
        "RESEARCH SOURCES:",
        blocks
          .map(
            (block) =>
              `${block.prefix}\nExcerpt: ${block.content.slice(
                0,
                excerptLimit
              )}`
          )
          .join("\n\n"),
      ].join("\n\n")
    : "";

  return [knowledgeContext, sourceContext]
    .filter(Boolean)
    .join("\n\n")
    .slice(0, MAX_RESEARCH_CONTEXT_CHARS);
}

export function getResearchSources(result) {
  return [
    ...(Array.isArray(result?.knowledgeSources)
      ? result.knowledgeSources
      : []),
    ...(Array.isArray(result?.sources) ? result.sources : []),
  ]
    .filter(
      (source, index, all) =>
        source?.url &&
        all.findIndex((candidate) => candidate?.url === source.url) === index
    )
    .slice(0, 10);
}
