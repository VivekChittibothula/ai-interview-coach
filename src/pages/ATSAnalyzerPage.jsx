import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, FileText, Sparkles, ArrowRight, Building2, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import GradientButton from "../components/ui/GradientButton";
import Spinner from "../components/ui/Spinner";
import ScoreRing from "../components/ui/ScoreRing";
import MatchPieChart from "../components/charts/MatchPieChart";
import ScoreBarChart from "../components/charts/ScoreBarChart";
import { parseDocument, analyzeATS, optimizeResume } from "../services/ats";
import { saveATSData, saveDashboardData, loadDashboardData } from "../lib/storage";

const PROBABILITY_COLORS = { Low: "text-red-400 bg-red-500/10", Medium: "text-amber-400 bg-amber-500/10", High: "text-emerald-400 bg-emerald-500/10", "Very High": "text-violet-400 bg-violet-500/10" };

export default function ATSAnalyzerPage() {
  const resumeInputRef = useRef(null);
  const jdFileRef = useRef(null);

  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [parsing, setParsing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [optimization, setOptimization] = useState(null);
  const [activeTab, setActiveTab] = useState("analysis");

  async function handleResumeUpload(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setParsing(true);
    try {
      const result = await parseDocument(file);
      setResumeFile(result.fileName);
      setResumeText(result.text);
    } catch (err) {
      setError(err.message);
    } finally {
      setParsing(false);
    }
  }

  async function handleJDUpload(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setParsing(true);
    try {
      const result = await parseDocument(file);
      setJobDescription(result.text);
    } catch (err) {
      setError(err.message);
    } finally {
      setParsing(false);
    }
  }

  async function runAnalysis() {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError("Please provide both resume and job description");
      return;
    }
    setError("");
    setAnalyzing(true);
    setAnalysis(null);
    setOptimization(null);
    try {
      const result = await analyzeATS(resumeText, jobDescription);
      setAnalysis(result);
      saveATSData({ analysis: result, resumeText, jobDescription });
      const dash = loadDashboardData();
      saveDashboardData({ ...dash, atsScore: result.atsMatchScore, resumeScore: result.resumeRelevanceScore });
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  }

  async function runOptimization() {
    if (!analysis) return;
    setOptimizing(true);
    try {
      const result = await optimizeResume(resumeText, jobDescription, analysis.suggestions);
      setOptimization(result);
      setActiveTab("optimize");
    } catch (err) {
      setError(err.message);
    } finally {
      setOptimizing(false);
    }
  }

  const matchScores = analysis ? [
    { name: "Technical", score: Math.round(analysis.technicalSkillsMatch / 10) },
    { name: "Soft Skills", score: Math.round(analysis.softSkillsMatch / 10) },
    { name: "Experience", score: Math.round(analysis.experienceMatch / 10) },
    { name: "Education", score: Math.round(analysis.educationMatch / 10) },
    { name: "Projects", score: Math.round(analysis.projectsMatch / 10) },
  ] : [];

  return (
    <div className="px-4 py-10 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">ATS Resume Analyzer</h1>
        <p className="text-[var(--text-muted)]">Upload your resume and job description for AI-powered ATS matching</p>
      </motion.div>

      {!analysis && (
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <GlassCard className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Upload className="w-5 h-5 text-violet-500" /> Resume</h3>
            <input ref={resumeInputRef} type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" onChange={handleResumeUpload} />
            <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-8 text-center cursor-pointer hover:border-violet-500/50 transition-colors" onClick={() => resumeInputRef.current?.click()}>
              {parsing ? <Spinner /> : (
                <>
                  <FileText className="w-10 h-10 mx-auto mb-3 text-[var(--text-muted)]" />
                  <p className="text-sm text-[var(--text-muted)]">PDF or DOCX (max 5MB)</p>
                </>
              )}
            </div>
            {resumeFile && <p className="text-sm text-emerald-500 mt-3 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> {resumeFile}</p>}
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-blue-500" /> Job Description</h3>
            <textarea
              rows={6}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job description here..."
              className="w-full rounded-xl px-4 py-3 text-sm border border-[var(--border)] focus:outline-none focus:border-violet-500/50 resize-none mb-3"
            />
            <input ref={jdFileRef} type="file" accept=".pdf,.docx" className="hidden" onChange={handleJDUpload} />
            <GradientButton variant="secondary" size="sm" onClick={() => jdFileRef.current?.click()} disabled={parsing}>
              <Upload className="w-4 h-4" /> Upload JD File
            </GradientButton>
          </GlassCard>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {!analysis && (
        <div className="flex justify-center mb-10">
          <GradientButton onClick={runAnalysis} disabled={analyzing || parsing || !resumeText || !jobDescription} size="lg">
            {analyzing ? <><Spinner size="sm" /> Analyzing...</> : <><Sparkles className="w-5 h-5" /> Analyze Resume</>}
          </GradientButton>
        </div>
      )}

      {analysis && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex gap-2 mb-6">
            {["analysis", "optimize"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${activeTab === tab ? "bg-violet-500/15 text-violet-500" : "text-[var(--text-muted)] hover:bg-white/5"}`}>
                {tab === "analysis" ? "ATS Analysis" : "Resume Optimization"}
              </button>
            ))}
          </div>

          {activeTab === "analysis" && (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <GlassCard className="p-6 flex flex-col items-center"><ScoreRing score={analysis.atsMatchScore} max={100} label="ATS Match" color="violet" /></GlassCard>
                <GlassCard className="p-6 flex flex-col items-center"><ScoreRing score={analysis.resumeRelevanceScore} max={100} label="Relevance" color="blue" /></GlassCard>
                <GlassCard className="p-6 flex flex-col items-center"><ScoreRing score={analysis.keywordDensity} max={100} label="Keyword Density" color="cyan" /></GlassCard>
                <GlassCard className="p-6 flex flex-col items-center justify-center">
                  <p className="text-xs text-[var(--text-muted)] mb-2">Hiring Probability</p>
                  <span className={`px-4 py-2 rounded-full text-lg font-bold ${PROBABILITY_COLORS[analysis.hiringProbability] || PROBABILITY_COLORS.Medium}`}>
                    {analysis.hiringProbability}
                  </span>
                </GlassCard>
              </div>

              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                <GlassCard className="p-6">
                  <h3 className="font-semibold mb-4">Match Breakdown</h3>
                  <ScoreBarChart data={matchScores} />
                </GlassCard>
                <GlassCard className="p-6">
                  <h3 className="font-semibold mb-4">Skills Match</h3>
                  <MatchPieChart data={[
                    { name: "Matching", value: analysis.matchingSkills?.length || 0 },
                    { name: "Missing", value: analysis.missingSkills?.length || 0 },
                  ]} />
                </GlassCard>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <GlassCard className="p-6">
                  <h3 className="font-semibold text-emerald-500 mb-3 flex items-center gap-2"><CheckCircle className="w-5 h-5" /> Matching Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {(analysis.matchingSkills || []).map((s) => <span key={s} className="px-3 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{s}</span>)}
                  </div>
                </GlassCard>
                <GlassCard className="p-6">
                  <h3 className="font-semibold text-red-400 mb-3 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Missing Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {(analysis.missingSkills || []).map((s) => <span key={s} className="px-3 py-1 rounded-full text-xs bg-red-500/10 text-red-400 border border-red-500/20">{s}</span>)}
                  </div>
                </GlassCard>
              </div>

              <GlassCard className="p-6 mb-8">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><Building2 className="w-5 h-5 text-violet-500" /> Company ATS Predictions</h3>
                <div className="space-y-4">
                  {Object.entries(analysis.companyPredictions || {}).map(([company, data]) => (
                    <div key={company} className="p-4 rounded-xl bg-white/[0.03] border border-[var(--border)]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{company} ATS Match</span>
                        <span className="text-xl font-bold text-violet-500">{data.score}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-[var(--ring-bg)] overflow-hidden mb-2">
                        <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-1000" style={{ width: `${data.score}%` }} />
                      </div>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">{data.reasoning}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="p-6 mb-8">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Suggestions</h3>
                <p className="text-sm text-[var(--text-muted)] mb-4">What changes should be made in the resume to become more relevant to this Job Description?</p>
                {analysis.suggestions && Object.entries(analysis.suggestions).map(([key, items]) => (
                  items?.length > 0 && (
                    <div key={key} className="mb-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-violet-500 mb-2">{key.replace(/([A-Z])/g, " $1").trim()}</p>
                      <ul className="space-y-1">
                        {items.map((item, i) => <li key={i} className="text-sm text-[var(--text-secondary)] flex gap-2"><span className="text-violet-400">•</span>{item}</li>)}
                      </ul>
                    </div>
                  )
                ))}
              </GlassCard>

              <div className="flex flex-wrap gap-4 justify-center">
                <GradientButton onClick={runOptimization} disabled={optimizing}>
                  {optimizing ? <><Spinner size="sm" /> Optimizing...</> : <><Sparkles className="w-4 h-4" /> Optimize Resume</>}
                </GradientButton>
                <Link to="/setup"><GradientButton variant="secondary">Continue to Interview <ArrowRight className="w-4 h-4" /></GradientButton></Link>
              </div>
            </>
          )}

          {activeTab === "optimize" && optimization && (
            <div className="space-y-6">
              <GlassCard className="p-6">
                <p className="text-sm text-[var(--text-muted)] mb-4">{optimization.summaryOfChanges}</p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-[var(--text-muted)]">Current Resume</h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {(optimization.optimizedSections || []).map((s, i) => (
                        <div key={i} className="p-3 rounded-lg text-sm bg-white/[0.03] border border-[var(--border)]">
                          <p className="text-xs text-[var(--text-muted)] mb-1">{s.section}</p>
                          <p>{s.original}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-violet-500">Suggested Resume ↓</h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {(optimization.optimizedSections || []).map((s, i) => (
                        <div key={i} className={`p-3 rounded-lg text-sm change-${s.changeType}`}>
                          <p className="text-xs text-[var(--text-muted)] mb-1">{s.section} · {s.changeType}</p>
                          <p>{s.optimized}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-4 text-xs">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded change-added" /> Added</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded change-removed" /> Remove</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded change-improved" /> Improved</span>
                </div>
              </GlassCard>
              <div className="flex justify-center">
                <Link to="/setup"><GradientButton size="lg">Start Interview with Optimized Resume <ArrowRight className="w-5 h-5" /></GradientButton></Link>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
