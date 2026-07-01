export default function Spinner({ size = "md", className = "" }) {
  const s = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-12 h-12" : "w-8 h-8";
  return (
    <div
      className={`${s} border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
