const DEFAULT_MAX_SIZE_MB = 5;
const DEFAULT_MAX_TEXT_CHARS = 8000;

function getMaxSizeBytes() {
  const mb = Number(process.env.MAX_RESUME_SIZE_MB || DEFAULT_MAX_SIZE_MB);
  return mb * 1024 * 1024;
}

function getMaxTextChars() {
  return Number(process.env.MAX_RESUME_TEXT_CHARS || DEFAULT_MAX_TEXT_CHARS);
}

function truncateText(rawText) {
  const maxChars = getMaxTextChars();
  const text = rawText.length > maxChars ? rawText.slice(0, maxChars) : rawText;
  return { text, truncated: rawText.length > maxChars };
}

export function validateBuffer(buffer, maxBytes = getMaxSizeBytes()) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error("Invalid file payload");
  }
  if (buffer.length === 0) throw new Error("Uploaded file is empty");
  if (buffer.length > maxBytes) {
    throw new Error(`File must be ${Math.round(maxBytes / (1024 * 1024))}MB or smaller`);
  }
}

export async function extractTextFromPdf(buffer) {
  validateBuffer(buffer);
  const header = buffer.subarray(0, 4).toString("utf8");
  if (!header.startsWith("%PDF")) {
    throw new Error("Only valid PDF files are supported");
  }

  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    const rawText = (result.text || "").replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
    if (!rawText) {
      throw new Error("Could not extract text from this PDF. Try a text-based PDF (not a scanned image).");
    }
    const { text, truncated } = truncateText(rawText);
    return { text, wordCount: text.split(/\s+/).filter(Boolean).length, truncated };
  } finally {
    await parser.destroy();
  }
}

export async function extractTextFromDocx(buffer) {
  validateBuffer(buffer);
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  const rawText = (result.value || "").replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (!rawText) {
    throw new Error("Could not extract text from this DOCX file.");
  }
  const { text, truncated } = truncateText(rawText);
  return { text, wordCount: text.split(/\s+/).filter(Boolean).length, truncated };
}

export async function extractTextFromDocument(buffer, fileName = "") {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".docx")) return extractTextFromDocx(buffer);
  if (lower.endsWith(".pdf")) return extractTextFromPdf(buffer);
  throw new Error("Unsupported file type. Use PDF or DOCX.");
}

export function parseJsonFromLLM(raw) {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}
