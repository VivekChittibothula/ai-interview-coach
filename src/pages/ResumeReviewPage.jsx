import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle, ArrowLeft, CheckCircle, Sparkles, TrendingUp, XCircle,
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import GradientButton from "../components/ui/GradientButton";
import Spinner from "../components/ui/Spinner";
import ScoreRing from "../components/ui/ScoreRing";
import { useApp } from "../context/AppContext";
import { analyzeATS } from "../services/ats";

export default function ResumeReviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { startInterview } = useApp();
  const setup = location.state;

  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!setup) {
      navigate("/setup", { replace: true });
      return;
    }

    const { resumeText, jobDescription } = setup;
    if (!resumeText?.trim() || !jobDescription?.trim()) return;

    let cancelled = false;
    async function runAnalysis() {
      setAnalyzing(true);
      setError("");
      try {
        const result = await analyzeATS(resumeText, jobDescription);
        if (!cancelled) setAnalysis(result);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setAnalyzing(false);
      }
    }

    runAnalysis();
    return () => { cancelled = true; };
  }, [setup, navigate]);

  if (!setup) return null;

  const hasResume = Boolean(setup.resumeText?.trim());
  const hasJD = Boolean(setup.jobDescription?.trim());
  const canAnalyze = hasResume && hasJD;

  async function handleStartInterview() {
    setStarting(true);
    startInterview(setup);
    navigate("/interview");
  }

  const improvements = [
    ...(analysis?.resumeStrengths || []),
    ...(analysis?.matchingSkills || []),
    ...(analysis?.suggestions?.skillsToAdd || []),
    ...(analysis?.suggestions?.experienceWording || []),
    ...(analysis?.suggestions?.actionVerbs || []),
  ].filter(Boolean);

  const unwanted = [
    ...(analysis?.resumeWeaknesses || []),
    ...(analysis?.missingSkills || []),
    ...(analysis?.missingKeywords || []),
    ...(analysis?.suggestions?.formattingImprovements || []),
  ].filter(Boolean);

  return (
    <div className="px-4 py-10 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <button
          onClick={() => navigate("/setup")}
          className="flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-violet-400 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Setup
        </button>
        <h1 className="text-3xl font-bold mb-2">Resume Review</h1>
        <p className="text-[var(--text-muted)] text-sm">
          Review how your resume matches the job description before starting the interview
        </p>
      </motion.div>

      {!canAnalyze && (
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-start gap-3 text-amber-400">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Resume review skipped</p>
              <p className="text-[var(--text-muted)] text-sm mt-1">
                Upload a resume and provide a job description on the setup page to see match insights.
              </p>
            </div>
          </div>
          <GradientButton onClick={handleStartInterview} disabled={starting} className="w-full">
            {starting ? <Spinner size="sm" /> : "Start Interview Anyway"}
          </GradientButton>
        </GlassCard>
      )}

      {canAnalyze && analyzing && (
        <GlassCard className="p-10 flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-[var(--text-muted)] text-sm">Analyzing resume against job description...</p>
        </GlassCard>
      )}

      {canAnalyze && error && !analyzing && (
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
          </div>
          <GradientButton onClick={handleStartInterview} disabled={starting} className="w-full">
            {starting ? <Spinner size="sm" /> : "Start Interview Anyway"}
          </GradientButton>
        </GlassCard>
      )}

      {canAnalyze && analysis && !analyzing && (
        <div className="space-y-5">
          <GlassCard className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <ScoreRing score={analysis.atsMatchScore} max={100} label="ATS Match" size="lg" />
              <div className="flex-1 text-center sm:text-left">
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Match Summary</p>
                <p className="text-lg font-semibold mb-1">{setup.role} · {setup.exp}</p>
                <p className="text-sm text-[var(--text-muted)]">
                  {analysis.hiringProbabilityReasoning || "Your resume has been compared against the job description."}
                </p>
              </div>
            </div>
          </GlassCard>

          <div className="grid md:grid-cols-2 gap-5">
            <GlassCard className="p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-emerald-400">
                <TrendingUp className="w-5 h-5" /> Strengths & Improvements
              </h3>
              {improvements.length > 0 ? (
                <ul className="space-y-2">
                  {improvements.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">No specific improvements identified.</p>
              )}
            </GlassCard>

            <GlassCard className="p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-red-400">
                <XCircle className="w-5 h-5" /> Gaps & Unwanted Items
              </h3>
              {unwanted.length > 0 ? (
                <ul className="space-y-2">
                  {unwanted.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">No major gaps found.</p>
              )}
            </GlassCard>
          </div>

          {analysis.suggestions && (
            <GlassCard className="p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-400" /> Quick Tips Before Interview
              </h3>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                {analysis.suggestions.projectsToImprove?.length > 0 && (
                  <div>
                    <p className="text-xs text-[var(--text-muted)] uppercase mb-1">Projects</p>
                    <ul className="space-y-1">{analysis.suggestions.projectsToImprove.map((s, i) => <li key={i}>· {s}</li>)}</ul>
                  </div>
                )}
                {analysis.suggestions.technicalTools?.length > 0 && (
                  <div>
                    <p className="text-xs text-[var(--text-muted)] uppercase mb-1">Tools to Highlight</p>
                    <ul className="space-y-1">{analysis.suggestions.technicalTools.map((s, i) => <li key={i}>· {s}</li>)}</ul>
                  </div>
                )}
              </div>
            </GlassCard>
          )}

          <GradientButton onClick={handleStartInterview} disabled={starting} className="w-full">
            {starting ? <><Spinner size="sm" /> Starting Interview...</> : "Start Interview"}
          </GradientButton>
        </div>
      )}
    </div>
  );
}
