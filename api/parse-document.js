import { extractTextFromDocument } from "./_lib/documents.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { fileBase64, fileName } = req.body || {};
    if (!fileBase64 || typeof fileBase64 !== "string") {
      return res.status(400).json({ error: "fileBase64 is required" });
    }

    const name = fileName || "document.pdf";
    const lower = name.toLowerCase();
    if (!lower.endsWith(".pdf") && !lower.endsWith(".docx")) {
      return res.status(400).json({ error: "Only PDF and DOCX files are supported" });
    }

    const base64Payload = fileBase64.includes(",") ? fileBase64.split(",").pop() : fileBase64;
    const buffer = Buffer.from(base64Payload, "base64");
    const result = await extractTextFromDocument(buffer, name);

    return res.status(200).json({
      text: result.text,
      wordCount: result.wordCount,
      truncated: result.truncated,
      fileName: name,
    });
  } catch (error) {
    console.error("Document parse error:", error);
    return res.status(400).json({ error: error.message || "Failed to parse document" });
  }
}
