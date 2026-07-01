import { motion } from "framer-motion";

export default function ScoreRing({ score, max = 10, label, color = "violet", size = "md" }) {
  const r = size === "lg" ? 52 : size === "sm" ? 28 : 38;
  const circumference = 2 * Math.PI * r;
  const pct = Math.min(score / max, 1);
  const dash = pct * circumference;
  const colors = { violet: "#8b5cf6", blue: "#3b82f6", cyan: "#06b6d4", emerald: "#10b981", amber: "#f59e0b" };
  const dim = size === "lg" ? "w-32 h-32" : size === "sm" ? "w-16 h-16" : "w-24 h-24";
  const fontSize = size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-xl";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative ${dim}`}>
        <svg viewBox={`0 0 ${(r + 10) * 2} ${(r + 10) * 2}`} className="w-full h-full -rotate-90">
          <circle cx={r + 10} cy={r + 10} r={r} fill="none" stroke="var(--ring-bg)" strokeWidth="6" />
          <motion.circle
            cx={r + 10}
            cy={r + 10}
            r={r}
            fill="none"
            stroke={colors[color]}
            strokeWidth="6"
            strokeLinecap="round"
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{ strokeDasharray: `${dash} ${circumference}` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center ${fontSize} font-bold text-[var(--text-primary)]`}>
          {typeof score === "number" ? (Number.isInteger(score) ? score : score.toFixed(0)) : score}
          {max === 10 && <span className="text-xs text-[var(--text-muted)]">/10</span>}
          {max === 100 && <span className="text-xs text-[var(--text-muted)]">%</span>}
        </span>
      </div>
      {label && <span className="text-xs text-[var(--text-muted)] text-center">{label}</span>}
    </div>
  );
}
