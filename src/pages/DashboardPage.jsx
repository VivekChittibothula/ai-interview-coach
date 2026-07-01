import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, Target, Mic, MessageSquare, Award, ArrowRight } from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import ScoreRing from "../components/ui/ScoreRing";
import GradientButton from "../components/ui/GradientButton";
import SkillRadarChart from "../components/charts/SkillRadarChart";
import ScoreBarChart from "../components/charts/ScoreBarChart";
import TimelineChart from "../components/charts/TimelineChart";
import { loadDashboardData } from "../lib/storage";

export default function DashboardPage() {
  const dash = loadDashboardData();

  const avgScore = useMemo(() => {
    if (!dash.totalScores.length) return 0;
    return Math.round(dash.totalScores.reduce((a, b) => a + b, 0) / dash.totalScores.length * 10) / 10;
  }, [dash.totalScores]);

  const avgConfidence = useMemo(() => {
    if (!dash.confidenceScores.length) return 0;
    return Math.round(dash.confidenceScores.reduce((a, b) => a + b, 0) / dash.confidenceScores.length * 10) / 10;
  }, [dash.confidenceScores]);

  const avgCommunication = useMemo(() => {
    if (!dash.communicationScores.length) return 0;
    return Math.round(dash.communicationScores.reduce((a, b) => a + b, 0) / dash.communicationScores.length * 10) / 10;
  }, [dash.communicationScores]);

  const radarData = useMemo(() => {
    const last = dash.interviewHistory[0];
    if (!last) return undefined;
    return [
      { skill: "Technical", value: last.technical || avgScore },
      { skill: "Communication", value: last.communication || avgCommunication },
      { skill: "Overall", value: last.overall || avgScore },
      { skill: "Confidence", value: avgConfidence || avgScore },
      { skill: "Readiness", value: Math.min(10, (last.overall || avgScore) + 1) },
    ];
  }, [dash.interviewHistory, avgScore, avgCommunication, avgConfidence]);

  const cards = [
    { icon: Target, label: "Resume Score", value: dash.resumeScore ?? "—", suffix: dash.resumeScore ? "%" : "", color: "violet" },
    { icon: TrendingUp, label: "ATS Score", value: dash.atsScore ?? "—", suffix: dash.atsScore ? "%" : "", color: "blue" },
    { icon: Award, label: "Interview Readiness", value: avgScore || "—", suffix: avgScore ? "/10" : "", color: "emerald" },
    { icon: Mic, label: "Completed Interviews", value: dash.completedInterviews, suffix: "", color: "cyan" },
    { icon: MessageSquare, label: "Avg Communication", value: avgCommunication || "—", suffix: avgCommunication ? "/10" : "", color: "amber" },
  ];

  return (
    <div className="px-4 py-10 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-[var(--text-muted)]">Track your interview preparation progress</p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GlassCard className="p-5" hover>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
                  <card.icon className="w-5 h-5 text-violet-500" />
                </div>
              </div>
              <p className="text-2xl font-bold">{card.value}{card.suffix}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">{card.label}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <GlassCard className="p-6">
          <h3 className="font-semibold mb-4">Skill Radar</h3>
          <SkillRadarChart data={radarData} />
        </GlassCard>
        <GlassCard className="p-6">
          <h3 className="font-semibold mb-4">Score Breakdown</h3>
          <ScoreBarChart data={radarData?.map((d) => ({ name: d.skill, score: d.value }))} />
        </GlassCard>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <GlassCard className="p-6 lg:col-span-1 flex flex-col items-center justify-center">
          <h3 className="font-semibold mb-6 self-start">Overall Progress</h3>
          <ScoreRing score={avgScore || 0} max={10} label="Average Score" color="violet" size="lg" />
          <p className="text-sm text-[var(--text-muted)] mt-4 text-center">
            {dash.completedInterviews === 0 ? "Complete your first interview to see progress" : `${dash.completedInterviews} interviews completed`}
          </p>
        </GlassCard>

        <GlassCard className="p-6 lg:col-span-2">
          <h3 className="font-semibold mb-4">Interview Timeline</h3>
          <TimelineChart items={dash.interviewHistory} />
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Recent Feedback</h3>
          <Link to="/setup"><GradientButton size="sm">New Interview <ArrowRight className="w-4 h-4" /></GradientButton></Link>
        </div>
        {dash.recentFeedback.length === 0 ? (
          <div className="text-center py-8 text-[var(--text-muted)]">
            <Mic className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No interviews yet. Start your first mock interview!</p>
            <Link to="/setup" className="inline-block mt-4"><GradientButton>Start Interview</GradientButton></Link>
          </div>
        ) : (
          <div className="space-y-3">
            {dash.recentFeedback.map((fb, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-[var(--border)]">
                <div>
                  <p className="font-medium text-sm">{fb.role}</p>
                  <p className="text-xs text-[var(--text-muted)]">{fb.summary}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-violet-500">{fb.score}/10</span>
                  <p className="text-xs text-[var(--text-muted)]">{new Date(fb.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
