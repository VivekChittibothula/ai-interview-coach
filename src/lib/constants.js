export const JOB_ROLES = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "AI Engineer",
  "Data Scientist",
  "Cloud Engineer",
  "Cyber Security",
  "DevOps Engineer",
  "HR",
  "Behavioral",
  "Full Stack Developer",
  "Java Developer",
  "Data Analyst",
  "Custom Job Description",
];

export const INTERVIEW_LEVELS = ["Beginner", "Intermediate", "Advanced", "Senior"];

export const DIFFICULTY_LEVELS = ["Easy", "Medium", "Hard"];

export const QUESTION_COUNTS = [
  { label: "5 Questions", value: 5 },
  { label: "10 Questions", value: 10 },
  { label: "15 Questions", value: 15 },
  { label: "20 Questions", value: 20 },
  { label: "Unlimited", value: 999 },
];

export const EXPERIENCE_LEVELS = ["Fresher", "1-3 Years", "3-5 Years", "5+ Years"];

export const INTERVIEW_STAGES = {
  0: "INTRODUCTION",
  1: "BACKGROUND",
  2: "TECH_STACK",
  3: "PROJECTS",
  4: "TECHNICAL",
};

export const BACKGROUND_OPTIONS = [
  { id: "office", label: "Office", gradient: "linear-gradient(135deg, #1e293b 0%, #334155 100%)" },
  { id: "workspace", label: "Modern Workspace", gradient: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)" },
  { id: "library", label: "Library", gradient: "linear-gradient(135deg, #292524 0%, #44403c 100%)" },
  { id: "minimal", label: "Minimal Room", gradient: "linear-gradient(135deg, #18181b 0%, #27272a 100%)" },
  { id: "blur", label: "Blur Background", gradient: "linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(30,41,59,0.9) 100%)" },
  { id: "virtual", label: "Virtual Interview Room", gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" },
  { id: "gradient", label: "Gradient Background", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)" },
  { id: "animated", label: "Animated Background", gradient: "animated" },
];

export const ATS_COMPANIES = ["Google", "Microsoft", "Amazon", "Meta", "Netflix"];

export const HIRING_PROBABILITY = ["Low", "Medium", "High", "Very High"];

export const STORAGE_KEYS = {
  SESSION: "ai-interview-session",
  THEME: "ai-interview-theme",
  DASHBOARD: "ai-interview-dashboard",
  ATS: "ai-interview-ats",
  BACKGROUND: "ai-interview-background",
};

export const PRICING_PLANS = [
  {
    name: "Starter",
    price: "Free",
    features: ["5 interviews/month", "Basic ATS scan", "Voice interviews", "PDF resume upload"],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$19/mo",
    features: ["Unlimited interviews", "Full ATS analysis", "Resume optimization", "Company predictions", "Priority AI"],
    cta: "Start Pro Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: ["Team dashboard", "Custom branding", "API access", "Dedicated support", "SSO integration"],
    cta: "Contact Sales",
    popular: false,
  },
];

export const FAQ_ITEMS = [
  { q: "How does the AI interviewer work?", a: "Our AI uses advanced language models to conduct realistic mock interviews tailored to your role, experience level, and resume." },
  { q: "Is my resume data secure?", a: "Yes. Resume text is processed in-memory during your session and never stored on our servers permanently." },
  { q: "Can I practice behavioral questions?", a: "Absolutely. Select HR or Behavioral role types for STAR-method focused questions." },
  { q: "Does voice input work on all browsers?", a: "Voice recognition works best on Chrome and Edge. Text input is always available as a fallback." },
  { q: "What is ATS scoring?", a: "ATS scoring compares your resume against a job description to show keyword match, missing skills, and company-specific predictions." },
];

export const TESTIMONIALS = [
  { name: "Sarah Chen", role: "Software Engineer @ Google", text: "The ATS analyzer helped me tailor my resume and I landed 3 interviews in one week.", avatar: "SC" },
  { name: "Marcus Johnson", role: "Data Scientist @ Meta", text: "Voice interviews feel incredibly realistic. The feedback after each answer is spot-on.", avatar: "MJ" },
  { name: "Priya Sharma", role: "Frontend Dev @ Stripe", text: "Best interview prep tool I've used. The dashboard tracks my progress beautifully.", avatar: "PS" },
];

export const STATS = [
  { value: "50K+", label: "Interviews Completed" },
  { value: "92%", label: "User Satisfaction" },
  { value: "3.2x", label: "Interview Success Rate" },
  { value: "200+", label: "Job Roles Supported" },
];
