export default function Waveform({ active, color = "violet" }) {
  const bars = [3, 6, 9, 5, 11, 7, 4, 8, 6, 10, 5, 7, 3, 9, 6];
  const colors = {
    violet: (h) => `rgba(139,92,246,${0.5 + (h / 11) * 0.5})`,
    emerald: (h) => `rgba(16,185,129,${0.5 + (h / 11) * 0.5})`,
    blue: (h) => `rgba(59,130,246,${0.5 + (h / 11) * 0.5})`,
  };

  return (
    <div className="flex items-center gap-0.5 h-8" aria-hidden="true">
      {bars.map((h, i) => (
        <div
          key={i}
          className="w-1 rounded-full transition-all duration-300"
          style={{
            height: active ? `${h * 2.2}px` : "4px",
            background: active ? colors[color](h) : "var(--ring-bg)",
            animation: active ? `wave ${0.6 + (i % 4) * 0.15}s ease-in-out infinite alternate` : "none",
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
}
