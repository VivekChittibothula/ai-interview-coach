import { generateText } from "./_lib/llm.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const text = await generateText(prompt);

    return res.status(200).json({ text });
  } catch (error) {
    console.error("Interview LLM error:", error);

    return res.status(500).json({
      error: "Failed to generate response",
    });
  }
}
