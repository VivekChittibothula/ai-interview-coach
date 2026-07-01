import { generateText } from "./_lib/llm.js";
import { parseJsonFromLLM } from "./_lib/documents.js";

const OPTIMIZE_PROMPT = (resumeText, jobDescription, suggestions) => `You are a professional resume writer. Optimize this resume for the job description.

CURRENT RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

SUGGESTIONS TO APPLY:
${JSON.stringify(suggestions || {}, null, 2)}

Return ONLY valid JSON (no markdown):

{
  "optimizedSections": [
    {
      "section": "Professional Summary",
      "original": "original text line",
      "optimized": "improved text line",
      "changeType": "improved"
    }
  ],
  "fullOptimizedResume": "Complete optimized resume text with all sections",
  "summaryOfChanges": "Brief summary of key improvements made"
}

changeType must be one of: "added", "removed", "improved"
Include at least 8-15 section changes.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { resumeText, jobDescription, suggestions } = req.body || {};
    if (!resumeText?.trim()) return res.status(400).json({ error: "resumeText is required" });
    if (!jobDescription?.trim()) return res.status(400).json({ error: "jobDescription is required" });

    const raw = await generateText(OPTIMIZE_PROMPT(resumeText, jobDescription, suggestions));
    const optimization = parseJsonFromLLM(raw);
    return res.status(200).json({ optimization });
  } catch (error) {
    console.error("Resume optimization error:", error);
    return res.status(500).json({ error: error.message || "Failed to optimize resume" });
  }
}
