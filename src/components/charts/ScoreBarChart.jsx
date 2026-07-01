import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";

const COLORS = ["#8b5cf6", "#3b82f6", "#06b6d4", "#10b981", "#f59e0b"];

export default function ScoreBarChart({ data }) {
  const chartData = data || [
    { name: "Technical", score: 7 },
    { name: "Communication", score: 8 },
    { name: "Problem Solving", score: 6 },
    { name: "Leadership", score: 5 },
    { name: "Confidence", score: 7 },
  ];

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} barSize={32}>
        <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 10]} tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: "var(--glass-bg)", border: "1px solid var(--border)", borderRadius: 12 }} />
        <Bar dataKey="score" radius={[8, 8, 0, 0]}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
