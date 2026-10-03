export function LoadingBlossom({ label = "loading" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className="relative w-12 h-12">
        <svg viewBox="0 0 48 48" className="w-full h-full animate-spin" style={{ animationDuration: "2.4s" }}>
          {[0, 72, 144, 216, 288].map((angle) => (
            <ellipse
              key={angle}
              cx="24" cy="14" rx="6" ry="9"
              fill="url(#petal)"
              transform={`rotate(${angle} 24 24)`}
              opacity="0.9"
            />
          ))}
          <circle cx="24" cy="24" r="4" fill="#fde047" />
          <defs>
            <linearGradient id="petal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbcfe8" />
              <stop offset="100%" stopColor="#f9a8d4" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {label && <div className="text-xs text-muted-foreground animate-pulse">{label}</div>}
    </div>
  );
}
