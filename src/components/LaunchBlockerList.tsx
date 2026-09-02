import { Link } from "@tanstack/react-router";
import { AlertTriangle, Info } from "lucide-react";
import type { LaunchBlocker } from "@/lib/types";
import { cn } from "@/lib/utils";

export function LaunchBlockerList({
  blockers,
  onResolve,
}: {
  blockers: LaunchBlocker[];
  onResolve?: (b: LaunchBlocker) => void;
}) {
  if (!blockers.length) return null;
  return (
    <ul className="space-y-3" aria-label="Launch blockers">
      {blockers.map((b) => (
        <li
          key={b.id}
          className={cn(
            "rounded-xl border p-3.5 sm:p-4",
            b.severity === "critical"
              ? "border-destructive/25 bg-destructive-soft/40"
              : "border-warning/25 bg-warning-soft/50",
          )}
        >
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className={cn(
                "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border",
                b.severity === "critical"
                  ? "border-destructive/20 bg-destructive-soft text-destructive"
                  : "border-warning/20 bg-warning-soft text-warning-foreground",
              )}
            >
              {b.severity === "critical" ? (
                <AlertTriangle className="size-4" />
              ) : (
                <Info className="size-4" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-display text-sm font-semibold">{b.title}</p>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
                    b.severity === "critical"
                      ? "border-destructive/30 bg-background text-destructive"
                      : "border-warning/30 bg-background text-warning-foreground",
                  )}
                  aria-label={`Severity: ${b.severity}`}
                >
                  {b.severity === "critical" ? (
                    <AlertTriangle className="size-3" aria-hidden="true" />
                  ) : (
                    <Info className="size-3" aria-hidden="true" />
                  )}
                  {b.severity}
                </span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{b.description}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {b.relatedRoute ? (
                  <Link
                    to={b.relatedRoute}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                  >
                    {b.actionLabel ?? "Review"} →
                  </Link>
                ) : null}
                {onResolve ? (
                  <button
                    type="button"
                    onClick={() => onResolve(b)}
                    className="text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
                  >
                    Go to task
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
