interface ProgressRingProps {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
}

export function ProgressRing({ value, size = 120, stroke = 10, label }: ProgressRingProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      role="img"
      aria-label={`${clamped}% complete${label ? ` — ${label}` : ""}`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="stroke-primary transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-display text-2xl font-bold">{clamped}%</div>
        {label ? <div className="text-xs text-muted-foreground">{label}</div> : null}
      </div>
    </div>
  );
}
