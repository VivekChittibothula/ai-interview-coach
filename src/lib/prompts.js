import { INTERVIEW_STAGES } from "./constants";

export function buildQuestionPrompt(role, experience, questionIndex, previousQuestions = [], resumeText = "", jobDescription = "", level = "Intermediate", difficulty = "Medium") {
  const resumeBlock = resumeText
    ? `\nRESUME CONTEXT (personalize questions using this; do not read it aloud or quote long sections):\n${resumeText}\n`
    : "";
  const jdBlock = jobDescription
    ? `\nJOB DESCRIPTION (align questions with these requirements):\n${jobDescription}\n`
    : "";

  if (questionIndex === 0) {
    return `You are a professional technical interviewer conducting a ${difficulty} difficulty interview for a ${level} ${role} candidate.

Your task is to ask the candidate to introduce themselves.

RULES:
- Ask ONLY for self introduction.
- Do not ask about projects.
- Do not ask about technologies.
- Do not ask about experience.
- Do not greet the candidate.
- Return only one sentence.
${resumeBlock}${jdBlock}
Choose one of the following:
- Tell me about yourself.
- Please introduce yourself.
- Could you briefly introduce yourself?

Return only the question text.
`;
  }

  const stage = INTERVIEW_STAGES[questionIndex] || "TECHNICAL";
  const stageInstructions = {
    INTRODUCTION: "Ask ONLY for self introduction.",
    BACKGROUND: "Ask about education, motivation, or career background.",
    TECH_STACK: "Ask about programming languages, frameworks, tools, or technologies.",
    PROJECTS: "Ask about one project or practical experience.",
    TECHNICAL: `Ask exactly one ${difficulty} technical question related to ${role}.`,
  };

  return `You are a professional interviewer at a top technology company.

RULES:
- Ask EXACTLY ONE question.
- Never greet the candidate.
- Never ask multiple questions.
- Difficulty: ${difficulty}, Level: ${level}
- Keep the question length between 5 and 20 words.
- Return ONLY the question text.

CANDIDATE PROFILE:
- Role: ${role}
- Experience: ${experience}
${resumeBlock}${jdBlock}
INTERVIEW STAGE: ${stage}
${stageInstructions[stage]}

PREVIOUS QUESTIONS:
${previousQuestions.length > 0 ? previousQuestions.join("\n") : "None"}

Do not repeat or paraphrase previous questions.
`;
}

export function buildFeedbackPrompt(role, experience, question, answer) {
  return `You are a strict technical interviewer evaluating a ${role} candidate with ${experience} experience.

Question: ${question}
Candidate's Answer: ${answer || "(No answer provided)"}

Evaluate the answer according to these criteria:
1. Relevance (0-3): Does the answer actually answer the question?
2. Technical Accuracy (0-3): Are the facts technically correct?
3. Detail and Depth (0-2): Does the answer provide sufficient explanation?
4. Communication (0-2): Is the answer clear and structured?

Scoring rules:
0-2: Completely irrelevant, single-word answers, greetings, nonsense, or empty responses.
3-4: Very weak answer with minimal understanding.
5-6: Average answer with partial understanding.
7-8: Good answer with strong understanding.
9-10: Excellent answer that is comprehensive and technically accurate.

Return JSON only in this exact format:
{
  "score": <number 1-10>,
  "strengths": ["point 1", "point 2"],
  "improvements": ["point 1", "point 2"],
  "improvedAnswer": "A concise model answer in 3-4 sentences."
}`;
}

export function buildReportPrompt(role, experience, qas, level = "Intermediate") {
  const summary = qas.map((q, i) => `Q${i + 1}: ${q.question}\nAnswer: ${q.answer || "(none)"}\nScore: ${q.feedback?.score ?? "N/A"}/10`).join("\n\n");
  return `You are an expert career coach. Analyze these interview Q&As for a ${role} (${experience}, ${level}) candidate and return ONLY valid JSON (no markdown):

${summary}

Format:
{
  "overall": <average score 1-10>,
  "technical": <score 1-10>,
  "communication": <score 1-10>,
  "confidence": <score 1-10>,
  "grammar": <score 1-10>,
  "vocabulary": <score 1-10>,
  "problemSolving": <score 1-10>,
  "leadership": <score 1-10>,
  "behavior": <score 1-10>,
  "speakingSpeed": "<slow|normal|fast>",
  "fillerWords": ["word1", "word2"],
  "timeManagement": <score 1-10>,
  "professionalism": <score 1-10>,
  "interviewReadiness": <score 1-10>,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "learningPath": ["step 1", "step 2", "step 3", "step 4", "step 5"],
  "roadmap": ["actionable tip 1", "actionable tip 2", "actionable tip 3", "actionable tip 4", "actionable tip 5"]
}`;
}

export function buildATSPrompt(resumeText, jobDescription) {
  return `You are an expert ATS (Applicant Tracking System) analyzer and career coach.

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
}

export function buildOptimizeResumePrompt(resumeText, jobDescription, atsAnalysis) {
  return `You are a professional resume writer. Optimize this resume for the job description.

CURRENT RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

ATS ANALYSIS SUMMARY:
${JSON.stringify(atsAnalysis?.suggestions || {}, null, 2)}

Return ONLY valid JSON (no markdown) with line-by-line optimization:

{
  "optimizedSections": [
    {
      "section": "Professional Summary",
      "original": "original text line",
      "optimized": "improved text line",
      "changeType": "improved"
    },
    {
      "section": "Skills",
      "original": "original text",
      "optimized": "optimized text with added keywords",
      "changeType": "added"
    }
  ],
  "fullOptimizedResume": "Complete optimized resume text with all sections",
  "summaryOfChanges": "Brief summary of key improvements made"
}

changeType must be one of: "added", "removed", "improved"
Include at least 8-15 section changes covering skills, experience, projects, and summary.`;
}
