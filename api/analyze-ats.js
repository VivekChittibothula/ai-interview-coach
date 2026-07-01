import { generateText } from "./_lib/llm.js";
import { parseJsonFromLLM } from "./_lib/documents.js";

const ATS_PROMPT = (resumeText, jobDescription) => `You are an expert ATS analyzer and career coach.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Analyze the resume against the job description and return ONLY valid JSON (no markdown):

{
  "atsMatchScore": <0-100>,
  "resumeRelevanceScore": <0-100>,
  "missingSkills": ["skill1", "skill2"],
  "missingKeywords": ["keyword1", "keyword2"],
  "matchingSkills": ["skill1", "skill2"],
  "technicalSkillsMatch": <0-100>,
  "softSkillsMatch": <0-100>,
  "experienceMatch": <0-100>,
  "educationMatch": <0-100>,
  "projectsMatch": <0-100>,
  "keywordDensity": <0-100>,
  "resumeStrengths": ["strength1", "strength2", "strength3"],
  "resumeWeaknesses": ["weakness1", "weakness2", "weakness3"],
  "suggestions": {
    "skillsToAdd": ["skill1"],
    "projectsToImprove": ["project suggestion"],
    "experienceWording": ["wording suggestion"],
    "actionVerbs": ["verb1", "verb2"],
    "missingAtsKeywords": ["keyword1"],
    "technicalTools": ["tool1"],
    "formattingImprovements": ["format tip"]
  },
  "companyPredictions": {
    "Google": { "score": <0-100>, "reasoning": "detailed reasoning" },
    "Microsoft": { "score": <0-100>, "reasoning": "detailed reasoning" },
    "Amazon": { "score": <0-100>, "reasoning": "detailed reasoning" },
    "Meta": { "score": <0-100>, "reasoning": "detailed reasoning" },
    "Netflix": { "score": <0-100>, "reasoning": "detailed reasoning" }
  },
  "hiringProbability": "<Low|Medium|High|Very High>",
  "hiringProbabilityReasoning": "detailed explanation"
}`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { resumeText, jobDescription } = req.body || {};
    if (!resumeText?.trim()) return res.status(400).json({ error: "resumeText is required" });
    if (!jobDescription?.trim()) return res.status(400).json({ error: "jobDescription is required" });

    const raw = await generateText(ATS_PROMPT(resumeText, jobDescription));
    const analysis = parseJsonFromLLM(raw);
    return res.status(200).json({ analysis });
  } catch (error) {
    console.error("ATS analysis error:", error);
    return res.status(500).json({ error: error.message || "Failed to analyze resume" });
  }
}
