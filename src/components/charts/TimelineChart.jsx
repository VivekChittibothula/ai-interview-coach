import { motion } from "framer-motion";

export default function TimelineChart({ items = [] }) {
  if (!items.length) {
    return (
      <div className="text-center py-8 text-[var(--text-muted)] text-sm">
        Complete interviews to see your progress timeline
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <motion.div
          key={item.date + i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex gap-4 items-start"
        >
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 shrink-0" />
            {i < items.length - 1 && <div className="w-px flex-1 bg-[var(--border)] min-h-8 mt-1" />}
          </div>
          <div className="flex-1 pb-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-[var(--text-primary)]">{item.role}</p>
              <span className="text-xs font-bold text-violet-400">{item.overall}/10</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {new Date(item.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
