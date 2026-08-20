// services/pdf.js

import { PDFParse } from "pdf-parse";

/**
 * Extract text and metadata from a PDF.
 *
 * Returns:
 * - fullText: complete extracted text
 * - pageTexts: text separated by page
 * - pageCount: number of pages
 * - characterCount: extracted character count
 */
export async function extractPdfText(buffer) {
  if (!buffer) {
    throw new Error("No PDF buffer was provided.");
  }

  const parser = new PDFParse({
    data: buffer,
  });

  try {
    const pdfData = await parser.getText();

    const fullText =
      String(pdfData?.text || "").trim();

    /**
     * pdf-parse exposes page information through
     * the text result when available.
     */
    const pageTexts = Array.isArray(pdfData?.pages)
      ? pdfData.pages.map((page, index) => ({
          page: index + 1,
          text: String(
            page?.text || ""
          ).trim(),
        }))
      : [];

    const pageCount =
      pageTexts.length ||
      pdfData?.total ||
      null;

    return {
      fullText,
      pageTexts,
      pageCount,
      characterCount: fullText.length,
    };
  } finally {
    await parser.destroy();
  }
}