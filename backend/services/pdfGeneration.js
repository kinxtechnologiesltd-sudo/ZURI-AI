import PDFDocument from "pdfkit";

export function generatePdf({
  title = "Zuri Document",
  content = "",
}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
      });

      const chunks = [];

      doc.on("data", (chunk) => {
        chunks.push(chunk);
      });

      doc.on("end", () => {
        resolve(
          Buffer.concat(chunks)
        );
      });

      doc.on("error", reject);

      doc
        .fontSize(22)
        .font("Helvetica-Bold")
        .text(title, {
          align: "center",
        });

      doc.moveDown();

      doc
        .fontSize(11)
        .font("Helvetica")
        .text(content, {
          align: "left",
          lineGap: 4,
        });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}