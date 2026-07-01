export default function Skeleton({ className = "", lines = 1 }) {
  if (lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className={`skeleton rounded-lg h-4 ${i === lines - 1 ? "w-3/4" : "w-full"} ${className}`} />
        ))}
      </div>
    );
  }
  return <div className={`skeleton rounded-lg ${className}`} />;
}
