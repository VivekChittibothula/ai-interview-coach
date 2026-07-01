import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Pause, Play, RotateCcw, Download, Volume2 } from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import GradientButton from "../components/ui/GradientButton";
import Spinner from "../components/ui/Spinner";
import ScoreRing from "../components/ui/ScoreRing";
import SkillRadarChart from "../components/charts/SkillRadarChart";
import ScoreBarChart from "../components/charts/ScoreBarChart";
import { useApp } from "../context/AppContext";
import { speak, pauseSpeaking, resumeSpeaking, stopSpeaking, downloadSpeechAudio, subscribeSpeechState } from "../services/tts";

export default function ReportPage() {
  const navigate = useNavigate();
  const { session, report, generateReport, resetInterview, qas } = useApp();
  const [speechState, setSpeechState] = useState({ speaking: false, paused: false });
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [feedbackText, setFeedbackText] = useState("");
  const spokenRef = useRef(false);

  useEffect(() => {
    if (!session) navigate("/setup");
  }, [session, navigate]);

  useEffect(() => {
    if (!report && qas.length > 0 && session) generateReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return subscribeSpeechState(setSpeechState);
  }, []);

  useEffect(() => {
    if (report && !spokenRef.current) {
      spokenRef.current = true;
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      const text = buildFeedbackSpeech(report);
      setFeedbackText(text);
      setTimeout(() => speakFeedback(text), 1500);
    }
  }, [report]);

  function buildFeedbackSpeech(r) {
    return `Your interview is complete. Overall score: ${r.overall} out of 10. Technical: ${r.technical}. Communication: ${r.communication}. Confidence: ${r.confidence || r.overall}. ${r.strengths?.[0] || ""}. Area to improve: ${r.weaknesses?.[0] || r.suggestions?.[0] || ""}. ${r.learningPath?.[0] || r.roadmap?.[0] || ""}`;
  }

  async function speakFeedback(text) {
    const sentences = text.split(/(?<=[.!?])\s+/);
    for (let i = 0; i < sentences.length; i++) {
      setHighlightIdx(i);
      await speak(sentences[i]);
    }
    setHighlightIdx(-1);
  }

  function handleReplay() {
    stopSpeaking();
    if (feedbackText) speakFeedback(feedbackText);
  }

  if (!session) return null;

  if (!report) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Spinner size="lg" />
        <p className="text-[var(--text-muted)]">Generating comprehensive report...</p>
      </div>
    );
  }

  const radarData = [
    { skill: "Technical", value: report.technical },
    { skill: "Communication", value: report.communication },
    { skill: "Confidence", value: report.confidence || report.overall },
    { skill: "Problem Solving", value: report.problemSolving },
    { skill: "Leadership", value: report.leadership || report.overall - 1 },
    { skill: "Professionalism", value: report.professionalism || report.overall },
  ];

  const speechSentences = feedbackText.split(/(?<=[.!?])\s+/).filter(Boolean);

  return (
    <div className="px-4 py-10 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <span className="inline-flex px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-500 text-xs font-medium mb-4">Interview Complete</span>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Performance Report</h1>
        <p className="text-[var(--text-muted)]">{session.name} · {session.role} · {session.level}</p>
      </motion.div>

      <GlassCard className="p-8 text-center mb-8">
        <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">Overall Score</p>
        <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-6xl font-bold bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent">
          {report.overall}<span className="text-2xl text-[var(--text-muted)]">/10</span>
        </motion.div>
        <div className="h-2 rounded-full bg-[var(--ring-bg)] overflow-hidden mx-auto max-w-xs mt-4">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500" initial={{ width: 0 }} animate={{ width: `${report.overall * 10}%` }} transition={{ duration: 1.2 }} />
        </div>
      </GlassCard>

      <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Technical", score: report.technical, color: "violet" },
          { label: "Communication", score: report.communication, color: "blue" },
          { label: "Confidence", score: report.confidence || report.overall, color: "cyan" },
          { label: "Grammar", score: report.grammar || report.overall, color: "emerald" },
          { label: "Readiness", score: report.interviewReadiness || report.overall, color: "amber" },
        ].map((s) => (
          <GlassCard key={s.label} className="p-4 flex flex-col items-center">
            <ScoreRing score={s.score} label={s.label} color={s.color} size="sm" />
          </GlassCard>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <GlassCard className="p-6"><h3 className="font-semibold mb-4">Skill Radar</h3><SkillRadarChart data={radarData} /></GlassCard>
        <GlassCard className="p-6"><h3 className="font-semibold mb-4">Score Breakdown</h3><ScoreBarChart data={radarData.map((d) => ({ name: d.skill, score: d.value }))} /></GlassCard>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <GlassCard className="p-6">
          <h3 className="font-semibold text-emerald-500 mb-3">Strengths</h3>
          <ul className="space-y-2">{(report.strengths || []).map((s, i) => <li key={i} className="text-sm text-[var(--text-secondary)]">• {s}</li>)}</ul>
        </GlassCard>
        <GlassCard className="p-6">
          <h3 className="font-semibold text-amber-500 mb-3">Weaknesses</h3>
          <ul className="space-y-2">{(report.weaknesses || []).map((w, i) => <li key={i} className="text-sm text-[var(--text-secondary)]">• {w}</li>)}</ul>
        </GlassCard>
      </div>

      <GlassCard className="p-6 mb-8">
        <h3 className="font-semibold text-violet-500 mb-3">Recommended Learning Path</h3>
        <div className="space-y-3">
          {(report.learningPath || report.roadmap || []).map((step, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">{i + 1}</span>
              <p className="text-sm text-[var(--text-secondary)]">{step}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2"><Volume2 className="w-5 h-5 text-violet-500" /> Speech Feedback</h3>
          <div className="flex gap-2">
            <button onClick={() => speechState.paused ? resumeSpeaking() : pauseSpeaking()} className="p-2 rounded-lg border border-[var(--border)] hover:bg-white/5" aria-label={speechState.paused ? "Resume" : "Pause"}>
              {speechState.paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
            <button onClick={handleReplay} className="p-2 rounded-lg border border-[var(--border)] hover:bg-white/5" aria-label="Replay"><RotateCcw className="w-4 h-4" /></button>
            <button onClick={() => downloadSpeechAudio(feedbackText)} className="p-2 rounded-lg border border-[var(--border)] hover:bg-white/5" aria-label="Download"><Download className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="space-y-2">
          {speechSentences.map((s, i) => (
            <p key={i} className={`text-sm leading-relaxed transition-colors ${highlightIdx === i ? "highlight-speaking text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}>{s}</p>
          ))}
        </div>
      </GlassCard>

      <div className="flex flex-wrap justify-center gap-4">
        <GradientButton onClick={() => { resetInterview(); navigate("/setup"); }}>Start New Interview</GradientButton>
        <GradientButton variant="secondary" onClick={() => navigate("/dashboard")}>View Dashboard</GradientButton>
      </div>
    </div>
  );
}
