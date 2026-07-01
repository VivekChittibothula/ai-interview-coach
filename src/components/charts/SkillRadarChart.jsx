import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";

export default function SkillRadarChart({ data }) {
  const chartData = data || [
    { skill: "Technical", value: 7 },
    { skill: "Communication", value: 8 },
    { skill: "Problem Solving", value: 6 },
    { skill: "Leadership", value: 5 },
    { skill: "Confidence", value: 7 },
    { skill: "Professionalism", value: 8 },
  ];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={chartData}>
        <PolarGrid stroke="var(--chart-grid)" />
        <PolarAngleAxis dataKey="skill" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
        <Radar name="Score" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} strokeWidth={2} />
        <Tooltip contentStyle={{ background: "var(--glass-bg)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text-primary)" }} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
