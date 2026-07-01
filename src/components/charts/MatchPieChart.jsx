import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ["#8b5cf6", "#3b82f6", "#06b6d4", "#10b981"];

export default function MatchPieChart({ data }) {
  const chartData = data || [
    { name: "Matching", value: 65 },
    { name: "Missing", value: 35 },
  ];

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ background: "var(--glass-bg)", border: "1px solid var(--border)", borderRadius: 12 }} />
        <Legend wrapperStyle={{ color: "var(--text-muted)", fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
