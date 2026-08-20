/**
 * ZURI PDF TOOL
 *
 * Handles instructions for PDF analysis.
 * The actual PDF file is processed by the /chat
 * upload pipeline, which extracts its contents.
 */

export async function pdfTool({
  message = "",
  pdfText = "",
  fileName = "",
  pageCount = null,
} = {}) {
  const cleanMessage = String(message || "").trim();

  if (!pdfText) {
    return JSON.stringify({
      success: false,
      type: "pdf-analysis",
      message:
        "No extracted PDF content was provided. Please upload the PDF again.",
    });
  }

  const documentInfo = [
    fileName
      ? `Document: ${fileName}`
      : null,

    pageCount
      ? `Pages: ${pageCount}`
      : null,

    `Extracted characters: ${pdfText.length}`,
  ]
    .filter(Boolean)
    .join("\n");

  return JSON.stringify({
    success: true,
    type: "pdf-analysis",

    instruction: `
You are analyzing an uploaded PDF document.

${documentInfo}

USER REQUEST:
${cleanMessage || "Analyze this document."}

PDF CONTENT:
${pdfText}

ANALYSIS RULES:

1. Answer using the PDF content as the primary source.
2. Do not invent information that is not supported by the PDF.
3. If something is not present, clearly say that it was not found.
4. When possible, identify the relevant page number or section.
5. For summaries, organize the answer into clear sections.
6. For questions, answer directly before explaining.
7. For comparisons, use a table when useful.
8. For study material, extract:
   - definitions
   - key concepts
   - important facts
   - examples
   - formulas
   - likely examination questions
9. For numerical information, preserve the exact values from the document.
10. If the PDF contains headings, use them to organize the response.
11. If the PDF contains tables, preserve their meaning and structure.
12. If the PDF contains lists, preserve the order and meaning of the items.
13. If the PDF contains references or citations, identify them when relevant.
14. If the extracted text appears incomplete, corrupted, or missing pages,
    clearly warn the user rather than guessing.
15. If the user asks about something that cannot be found in the PDF,
    explicitly say that the information was not found in the uploaded document.
16. Do not present outside knowledge as if it came from the PDF.
17. When answering a question about a specific part of the document,
    quote only short relevant phrases when necessary and identify the page.
18. Give the user a useful, well-structured answer rather than simply
    repeating the extracted PDF text.

OUTPUT STYLE:

- Use clear headings.
- Use bullet points when appropriate.
- Use numbered steps for procedures.
- Use tables for comparisons or structured data.
- Keep the answer proportional to the user's request.
- If the user asks for a brief answer, keep it brief.
- If the user asks for a detailed analysis, provide a detailed analysis.
`,
  });
}