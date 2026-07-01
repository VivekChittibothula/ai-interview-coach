import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, CheckCircle, AlertTriangle, FileText } from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import GradientButton from "../components/ui/GradientButton";
import Spinner from "../components/ui/Spinner";
import { parseDocument } from "../services/ats";
import { loadATSData } from "../lib/storage";
import {
  JOB_ROLES, INTERVIEW_LEVELS, DIFFICULTY_LEVELS, QUESTION_COUNTS, EXPERIENCE_LEVELS,
} from "../lib/constants";

export default function SetupPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const jdFileRef = useRef(null);
  const atsData = loadATSData();

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [exp, setExp] = useState("");
  const [level, setLevel] = useState("Intermediate");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questionCount, setQuestionCount] = useState(5);
  const [jobDescription, setJobDescription] = useState(atsData?.jobDescription || "");
  const [resumeFileName, setResumeFileName] = useState(atsData?.resumeText ? "From ATS Analysis" : "");
  const [resumeText, setResumeText] = useState(atsData?.resumeText || "");
  const [parsing, setParsing] = useState(false);
  const [parsingJD, setParsingJD] = useState(false);
  const [error, setError] = useState("");

  const selectClass = "w-full border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/60 transition-colors appearance-none cursor-pointer bg-white/[0.05]";

  async function handleResumeSelect(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setParsing(true);
    setError("");
    try {
      const result = await parseDocument(file);
      setResumeFileName(result.fileName);
      setResumeText(result.text);
    } catch (err) {
      setError(err.message);
    } finally {
      setParsing(false);
    }
  }

  async function handleJDSelect(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setParsingJD(true);
    setError("");
    try {
      const result = await parseDocument(file);
      setJobDescription(result.text);
    } catch (err) {
      setError(err.message);
    } finally {
      setParsingJD(false);
    }
  }

  function handleContinue() {
    if (!name.trim() || !role || !exp) return;
    navigate("/review", {
      state: {
        name: name.trim(),
        role,
        exp,
        level,
        difficulty,
        questionCount,
        resumeText,
        resumeFileName,
        jobDescription: jobDescription.trim(),
      },
    });
  }

  const canContinue = name.trim() && role && exp && !parsing && !parsingJD;

  return (
    <div className="px-4 py-10 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Set Up Your Interview</h1>
        <p className="text-[var(--text-muted)] text-sm">Configure your personalized mock interview session</p>
      </motion.div>

      <GlassCard className="p-6 space-y-5">
        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-2 font-medium uppercase tracking-wider">Your Name</label>
          <input type="text" placeholder="e.g. Alex Johnson" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/60" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-2 font-medium uppercase tracking-wider">Job Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className={selectClass}>
              <option value="">Select role...</option>
              {JOB_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-2 font-medium uppercase tracking-wider">Experience</label>
            <select value={exp} onChange={(e) => setExp(e.target.value)} className={selectClass}>
              <option value="">Select...</option>
              {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-2 font-medium uppercase tracking-wider">Job Description</label>
          <textarea
            rows={5}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here so we can tailor questions and review your resume..."
            className="w-full border border-[var(--border)] rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-violet-500/60"
          />
          <input ref={jdFileRef} type="file" accept=".pdf,.docx" className="hidden" onChange={handleJDSelect} />
          <button
            type="button"
            onClick={() => jdFileRef.current?.click()}
            disabled={parsingJD}
            className="mt-2 flex items-center gap-2 text-xs text-violet-400 hover:text-violet-300 transition-colors disabled:opacity-50"
          >
            {parsingJD ? <Spinner size="sm" /> : <FileText className="w-3.5 h-3.5" />}
            {parsingJD ? "Parsing..." : "Or upload job description (PDF/DOCX)"}
          </button>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-2 font-medium uppercase tracking-wider">Level</label>
            <select value={level} onChange={(e) => setLevel(e.target.value)} className={selectClass}>
              {INTERVIEW_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-2 font-medium uppercase tracking-wider">Difficulty</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className={selectClass}>
              {DIFFICULTY_LEVELS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-2 font-medium uppercase tracking-wider">Questions</label>
            <select value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))} className={selectClass}>
              {QUESTION_COUNTS.map((q) => <option key={q.value} value={q.value}>{q.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-2 font-medium uppercase tracking-wider">Resume (PDF/DOCX)</label>
          <input ref={fileInputRef} type="file" accept=".pdf,.docx" className="hidden" onChange={handleResumeSelect} />
          <div className="rounded-xl border border-dashed border-[var(--border)] p-4 space-y-3">
            <GradientButton variant="secondary" disabled={parsing} onClick={() => fileInputRef.current?.click()}>
              {parsing ? <Spinner size="sm" /> : <Upload className="w-4 h-4" />}
              {parsing ? "Parsing..." : "Upload Resume"}
            </GradientButton>
            {resumeFileName && (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <p className="text-xs text-emerald-300">{resumeFileName}</p>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm"><AlertTriangle className="w-4 h-4" /> {error}</div>
        )}

        <GradientButton onClick={handleContinue} disabled={!canContinue} className="w-full">
          Review Resume & Continue
        </GradientButton>
      </GlassCard>
    </div>
  );
}
