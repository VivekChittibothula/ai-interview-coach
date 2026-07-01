import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import GlassCard from "../components/ui/GlassCard";
import GradientButton from "../components/ui/GradientButton";
import { useApp } from "../context/AppContext";

export default function FeedbackPage() {
  const navigate = useNavigate();
  const { lastQa, questionIndex, totalQuestions, nextQuestion } = useApp();

  if (!lastQa) {
    navigate("/interview");
    return null;
  }

  const { question, feedback } = lastQa;
  const score = feedback?.score ?? 0;
  const barColor = score >= 7 ? "from-emerald-500 to-teal-500" : score >= 4 ? "from-amber-500 to-orange-500" : "from-red-500 to-rose-500";
  const isLast = questionIndex >= totalQuestions - 1 && totalQuestions !== 999;

  function handleNext() {
    const result = nextQuestion();
    navigate(result === "report" ? "/report" : "/interview");
  }

  return (
    <div className="px-4 py-10 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <p className="text-[var(--text-muted)] text-sm mb-1">Question {questionIndex + 1} · Feedback</p>
        <h2 className="text-2xl font-bold">Here's how you did</h2>
      </motion.div>

      <GlassCard className="p-6 flex items-center gap-6 mb-5">
        <div className="relative w-20 h-20 shrink-0">
          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
            <circle cx="40" cy="40" r="32" fill="none" stroke="var(--ring-bg)" strokeWidth="5" />
            <motion.circle cx="40" cy="40" r="32" fill="none"
              stroke={score >= 7 ? "#10b981" : score >= 4 ? "#f59e0b" : "#ef4444"} strokeWidth="5"
              initial={{ strokeDasharray: "0 201" }}
              animate={{ strokeDasharray: `${(score / 10) * 201} 201` }}
              transition={{ duration: 1 }}
              strokeLinecap="round" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold">{score}</span>
        </div>
        <div className="flex-1">
          <p className="text-xs text-[var(--text-muted)] mb-1">Score out of 10</p>
          <div className="h-2 rounded-full bg-[var(--ring-bg)] overflow-hidden">
            <motion.div className={`h-full rounded-full bg-gradient-to-r ${barColor}`} initial={{ width: 0 }} animate={{ width: `${score * 10}%` }} transition={{ duration: 0.8 }} />
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-2 italic line-clamp-2">"{question}"</p>
        </div>
      </GlassCard>

      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        <GlassCard className="p-5">
          <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-3">Strengths</p>
          <ul className="space-y-2">
            {(feedback?.strengths || []).map((s, i) => (
              <li key={i} className="text-sm text-[var(--text-secondary)] flex gap-2"><span className="text-emerald-500">•</span>{s}</li>
            ))}
          </ul>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-3">To Improve</p>
          <ul className="space-y-2">
            {(feedback?.improvements || feedback?.weaknesses || []).map((w, i) => (
              <li key={i} className="text-sm text-[var(--text-secondary)] flex gap-2"><span className="text-amber-500">•</span>{w}</li>
            ))}
          </ul>
        </GlassCard>
      </div>

      <GlassCard className="p-5 mb-6">
        <p className="text-xs font-semibold text-violet-500 uppercase tracking-wider mb-3">Improved Answer</p>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{feedback?.improvedAnswer}</p>
      </GlassCard>

      <div className="flex justify-end">
        <GradientButton onClick={handleNext}>
          {isLast ? "View Final Report" : "Next Question"} →
        </GradientButton>
      </div>
    </div>
  );
}
