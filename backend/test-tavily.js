import { searchTavily } from "./providers/tavily/search.js";

const result = await searchTavily({
  query:
    "latest AI developments in Africa 2026",
  searchDepth: "advanced",
  maxResults: 5,
  topic: "general",
});

console.log("\n==============================");
console.log("TAVILY TEST");
console.log("==============================");

console.log(
  "Success:",
  result.success
);

console.log(
  "Sources:",
  result.results?.length || 0
);

console.log(
  "Images:",
  result.images?.length || 0
);

console.log(
  "\nIMAGE DATA:"
);

console.dir(
  result.images,
  {
    depth: null,
  }
);

console.log(
  "\nFIRST SOURCE:"
);

console.dir(
  result.results?.[0],
  {
    depth: null,
  }
);

console.log(
  "==============================\n"
);