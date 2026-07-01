import { motion } from "framer-motion";

export default function ProgressBar({ current, total, showLabel = true }) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3 w-full">
      {showLabel && <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">Q{current}/{total === 999 ? "∞" : total}</span>}
      <div className="flex-1 h-2 rounded-full bg-[var(--ring-bg)] overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
