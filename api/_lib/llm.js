import { GoogleGenerativeAI } from "@google/generative-ai";

const DEFAULT_OLLAMA_BASE_URL = "http://127.0.0.1:11434";
const DEFAULT_OLLAMA_MODEL = "qwen2.5:3b";
const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash";

function resolveProvider() {
  const configured = process.env.LLM_PROVIDER?.toLowerCase();

  if (configured === "gemini" || configured === "ollama") {
    return configured;
  }

  // Production default: Gemini when key exists; otherwise Ollama for local dev.
  return process.env.GEMINI_API_KEY ? "gemini" : "ollama";
}

async function generateWithOllama(prompt) {
  const baseUrl = process.env.OLLAMA_BASE_URL || DEFAULT_OLLAMA_BASE_URL;
  const model = process.env.OLLAMA_MODEL || DEFAULT_OLLAMA_MODEL;

  const response = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  const text = result.response?.trim();

  if (!text) {
    throw new Error("Ollama returned an empty response");
  }

  return text;
}

async function generateWithGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const modelName = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });
  const result = await model.generateContent(prompt);
  const text = result.response.text()?.trim();

  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  return text;
}

export async function generateText(prompt) {
  const provider = resolveProvider();

  if (provider === "gemini") {
    return generateWithGemini(prompt);
  }

  return generateWithOllama(prompt);
}

export function getActiveProvider() {
  return resolveProvider();
}
