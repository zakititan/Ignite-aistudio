import { Link } from "@tanstack/react-router";
import {
  Globe,
  Blocks,
  Mail,
  Network,
  ClipboardCheck,
  ShieldCheck,
  MapPin,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  CircleDashed,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PresenceStatusArea, PresenceAreaStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  domain: Globe,
  website: Blocks,
  email: Mail,
  dns: Network,
  customer_action: ClipboardCheck,
  ownership: ShieldCheck,
  local_presence: MapPin,
};

const STATUS_STYLES: Record<
  PresenceAreaStatus,
  { badge: string; icon: React.ComponentType<{ className?: string }>; labelClass: string }
> = {
  not_started: {
    badge: "border-border bg-muted text-muted-foreground",
    icon: CircleDashed,
    labelClass: "text-muted-foreground",
  },
  needs_information: {
    badge: "border-warning/30 bg-warning-soft text-warning-foreground",
    icon: Info,
    labelClass: "text-warning-foreground",
  },
  planned: {
    badge: "border-primary/20 bg-primary-soft text-primary",
    icon: Clock3,
    labelClass: "text-primary",
  },
  in_progress: {
    badge: "border-primary/20 bg-primary-soft text-primary",
    icon: Clock3,
    labelClass: "text-primary",
  },
  needs_attention: {
    badge: "border-destructive/20 bg-destructive-soft text-destructive",
    icon: AlertTriangle,
    labelClass: "text-destructive",
  },
  ready_for_review: {
    badge: "border-warning/30 bg-warning-soft text-warning-foreground",
    icon: AlertTriangle,
    labelClass: "text-warning-foreground",
  },
  complete: {
    badge: "border-success/30 bg-success-soft text-success",
    icon: CheckCircle2,
    labelClass: "text-success",
  },
};

export function OnlinePresenceStatusCard({ area }: { area: PresenceStatusArea }) {
  const Icon = ICON_MAP[area.id] ?? Globe;
  const style = STATUS_STYLES[area.status];
  const StatusIcon = style.icon;

  return (
    <article className="surface-panel flex flex-col gap-3 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <Badge variant="outline" className={cn("shrink-0 gap-1 text-[11px]", style.badge)}>
          <StatusIcon className="size-3" aria-hidden="true" />
          {area.statusLabel}
        </Badge>
      </div>

      <div>
        <h3 className="font-display text-base font-semibold leading-tight">{area.label}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
          {area.summary}
        </p>
      </div>

      {area.blockers && area.blockers.length > 0 ? (
        <ul className="space-y-1 text-xs text-muted-foreground">
          {area.blockers.slice(0, 2).map((b) => (
            <li key={b} className="flex gap-1.5">
              <span aria-hidden="true" className="text-warning-foreground">
                •
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {(area.lastVerifiedAt || area.evidence) && (
        <div className="space-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
          {area.lastVerifiedAt ? (
            <p>
              Last checked:{" "}
              <time dateTime={area.lastVerifiedAt}>
                {new Date(area.lastVerifiedAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </time>
            </p>
          ) : null}
          {area.evidence ? <p className="truncate">Evidence: {area.evidence}</p> : null}
        </div>
      )}

      <div className="mt-auto pt-1">
        <Link
          to={area.relatedRoute}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {area.actionLabel} <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
