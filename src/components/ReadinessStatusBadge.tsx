import { AlertTriangle, CheckCircle2, CircleDashed, Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReadinessStatus } from "@/lib/types";

const MAP: Record<
  ReadinessStatus,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    className: string;
    ariaLabel: string;
  }
> = {
  not_started: {
    label: "Not started",
    icon: CircleDashed,
    className: "border-border bg-muted text-muted-foreground",
    ariaLabel: "Status: not started",
  },
  blocked: {
    label: "Blocked — review items",
    icon: AlertTriangle,
    className: "border-destructive/30 bg-destructive-soft text-destructive",
    ariaLabel: "Status: blocked, review launch blockers",
  },
  nearly_ready: {
    label: "Nearly ready",
    icon: Clock3,
    className: "border-warning/30 bg-warning-soft text-foreground",
    ariaLabel: "Status: nearly ready",
  },
  ready_for_review: {
    label: "Ready for final review",
    icon: CheckCircle2,
    className: "border-success/30 bg-success-soft text-success",
    ariaLabel: "Status: ready for final review",
  },
};

export function ReadinessStatusBadge({ status }: { status: ReadinessStatus }) {
  const m = MAP[status];
  const Icon = m.icon;
  return (
    <span
      role="status"
      aria-label={m.ariaLabel}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
        m.className,
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      {m.label}
    </span>
  );
}

export function readinessStatusLabel(status: ReadinessStatus): string {
  return MAP[status].label;
}
