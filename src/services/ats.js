import { parseJsonResponse } from "../lib/api";

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function parseDocument(file) {
  if (!file) throw new Error("No file provided");
  const name = file.name.toLowerCase();
  if (!name.endsWith(".pdf") && !name.endsWith(".docx")) {
    throw new Error("Only PDF and DOCX files are supported");
  }
  if (file.size > 5 * 1024 * 1024) throw new Error("File must be 5MB or smaller");

  const fileBase64 = await fileToBase64(file);
  const res = await fetch("/api/parse-document", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileBase64, fileName: file.name }),
  });
  return parseJsonResponse(res);
}

export async function parseResumePdf(file) {
  return parseDocument(file);
}

export async function analyzeATS(resumeText, jobDescription) {
  const res = await fetch("/api/analyze-ats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeText, jobDescription }),
  });
  const data = await parseJsonResponse(res);
  return data.analysis;
}

export async function optimizeResume(resumeText, jobDescription, suggestions) {
  const res = await fetch("/api/optimize-resume", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeText, jobDescription, suggestions }),
  });
  const data = await parseJsonResponse(res);
  return data.optimization;
}
