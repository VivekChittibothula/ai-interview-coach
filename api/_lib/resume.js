const PDF_MAGIC = "%PDF";
const DEFAULT_MAX_SIZE_MB = 5;
const DEFAULT_MAX_TEXT_CHARS = 6000;

function getMaxSizeBytes() {
  const mb = Number(process.env.MAX_RESUME_SIZE_MB || DEFAULT_MAX_SIZE_MB);
  return mb * 1024 * 1024;
}

function getMaxTextChars() {
  return Number(process.env.MAX_RESUME_TEXT_CHARS || DEFAULT_MAX_TEXT_CHARS);
}

export function validatePdfBuffer(buffer) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error("Invalid file payload");
  }

  const maxBytes = getMaxSizeBytes();
  if (buffer.length === 0) {
    throw new Error("Uploaded file is empty");
  }

  if (buffer.length > maxBytes) {
    const maxMb = Math.round(maxBytes / (1024 * 1024));
    throw new Error(`PDF must be ${maxMb}MB or smaller`);
  }

  const header = buffer.subarray(0, 4).toString("utf8");
  if (!header.startsWith(PDF_MAGIC)) {
    throw new Error("Only valid PDF files are supported");
  }
}

export async function extractTextFromPdf(buffer) {
  validatePdfBuffer(buffer);

  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    const rawText = (result.text || "")
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!rawText) {
      throw new Error("Could not extract text from this PDF. Try a text-based PDF (not a scanned image).");
    }

    const maxChars = getMaxTextChars();
    const text = rawText.length > maxChars ? rawText.slice(0, maxChars) : rawText;

    return {
      text,
      wordCount: text.split(/\s+/).filter(Boolean).length,
      truncated: rawText.length > maxChars,
    };
  } finally {
    await parser.destroy();
  }
}
