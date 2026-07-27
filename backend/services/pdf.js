// services/pdf.js

import { PDFParse } from "pdf-parse";

export async function extractPdfText(buffer) {
  const parser = new PDFParse({
    data: buffer,
  });

  const pdfData = await parser.getText();
  const pdfText = pdfData.text;

  await parser.destroy();

  return pdfText;
}