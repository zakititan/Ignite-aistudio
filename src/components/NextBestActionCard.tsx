import { Link } from "@tanstack/react-router";
import { AlertTriangle, HelpCircle, Mail, ArrowRight, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { LaunchBlocker, PresenceStatusArea } from "@/lib/types";
import { cn } from "@/lib/utils";

type TopAction = PresenceStatusArea | LaunchBlocker | null;

function isBlocker(item: TopAction): item is LaunchBlocker {
  return !!item && "severity" in item;
}

function getImpactLabel(item: TopAction): string {
  if (!item) return "Launch essential";
  const id = item.id;
  // Protects your email
  if (id === "email" || id === "protect-email") return "Protects your email";
  // Helps customers contact you
  if (
    id === "customer_action" ||
    id === "local_presence" ||
    id === "primary-action-test" ||
    id === "customer-journey-blocked" ||
    id === "customer-journey-needs-improvement" ||
    id === "business-details" ||
    id === "mobile-review"
  )
    return "Helps customers contact you";
  // Default launch essential for domain/website/dns/ownership etc.
  return "Launch essential";
}

function getWhyItMatters(item: PresenceStatusArea | LaunchBlocker): string {
  if (isBlocker(item)) return item.description;
  return item.description;
}

function getActionRoute(item: PresenceStatusArea | LaunchBlocker): string {
  if (isBlocker(item)) return item.relatedRoute ?? "/checklist";
  return item.relatedRoute;
}

function getActionLabel(item: PresenceStatusArea | LaunchBlocker): string {
  if (isBlocker(item)) return item.actionLabel ?? "Review";
  return item.actionLabel;
}

function getTitle(item: PresenceStatusArea | LaunchBlocker): string {
  if (isBlocker(item)) return item.title;
  // For presence area, use actionLabel as title if more actionable, else label
  // Show label + action to be clear, but spec says title — use actionLabel
  return item.actionLabel === item.label ? item.label : item.actionLabel;
}

export function NextBestActionCard({ action }: { action: TopAction }) {
  if (!action) {
    return (
      <section
        aria-labelledby="nba-title"
        className="surface-panel border-success/20 bg-success-soft/30 p-5 sm:p-6"
      >
        <p className="text-xs font-semibold tracking-wide text-success uppercase">
          Your next best action
        </p>
        <h2 id="nba-title" className="mt-2 font-display text-xl font-bold">
          All key presence areas look complete
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          No critical blockers found. Review everything once more on a real phone and with a test
          customer action before inviting customers — this is guidance, not a guarantee.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/checklist">
              Review launch checks <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/preflight">Run pre-flight check</Link>
          </Button>
        </div>
        <details className="mt-4 rounded-lg border border-border bg-card p-3">
          <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium">
            <HelpCircle className="size-4 text-primary" aria-hidden="true" />
            Why this first?
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            We prioritise in order: 1) domain ownership, 2) website connection, 3) HTTPS/padlock, 4)
            primary customer action blocked, 5) business details accuracy, 6) protecting business
            email. The most critical blocker is surfaced first so you fix what would stop customers
            before polishing secondary items.
          </p>
        </details>
      </section>
    );
  }

  const impact = getImpactLabel(action);
  const why = getWhyItMatters(action);
  const route = getActionRoute(action);
  const label = getActionLabel(action);
  const title = getTitle(action);
  const severity = isBlocker(action) ? action.severity : undefined;

  return (
    <section aria-labelledby="nba-title" className="surface-panel p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
            Your next best action
          </p>
          <h2 id="nba-title" className="mt-1 font-display text-xl font-bold sm:text-2xl">
            {title}
          </h2>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "shrink-0 text-xs",
            impact === "Launch essential" && "border-primary/20 bg-primary-soft text-primary",
            impact === "Protects your email" && "border-warning/30 bg-warning-soft text-foreground",
            impact === "Helps customers contact you" &&
              "border-success/20 bg-success-soft text-success",
          )}
        >
          {impact === "Protects your email" ? (
            <Mail className="mr-1 size-3" aria-hidden="true" />
          ) : impact === "Helps customers contact you" ? (
            <Rocket className="mr-1 size-3" aria-hidden="true" />
          ) : (
            <AlertTriangle className="mr-1 size-3" aria-hidden="true" />
          )}
          {impact}
        </Badge>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground">Why it matters:</span> {why}
      </p>

      {isBlocker(action) && severity ? (
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase">
          <span
            className={cn(
              "rounded-full border px-2 py-0.5",
              severity === "critical"
                ? "border-destructive/30 bg-destructive-soft text-destructive"
                : "border-warning/30 bg-warning-soft text-foreground",
            )}
          >
            {severity}
          </span>
          <span className="text-muted-foreground">
            Priority {severity === "critical" ? "1–4" : "5–6"}
          </span>
        </p>
      ) : null}

      {!isBlocker(action) && (action as PresenceStatusArea).summary ? (
        <p className="mt-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Current state:</span>{" "}
          {(action as PresenceStatusArea).summary}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <Button asChild>
          <Link to={route as never}>
            {label} <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/checklist" search={{ filter: "blockers" } as never}>
            Review launch checks
          </Link>
        </Button>
      </div>

      <details className="mt-4 rounded-lg border border-border bg-muted/40 p-3">
        <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium">
          <HelpCircle className="size-4 text-primary" aria-hidden="true" />
          Why this first?
        </summary>
        <div className="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground">
          <p>
            We surface the most critical blocker first so you fix what would stop customers before
            polishing secondary items. Priority order:
          </p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Domain ownership &amp; recovery — your address is business property</li>
            <li>Website connection — visitors must reach the right site</li>
            <li>HTTPS/padlock — browsers warn when this is missing</li>
            <li>Primary customer action blocked — customers cannot complete the key task</li>
            <li>Business details accuracy — name, contact, hours, pricing</li>
            <li>Protecting business email — mail records must stay separate</li>
          </ol>
          <p>
            Within the same priority we show the earliest presence area that is not yet complete.
          </p>
        </div>
      </details>
    </section>
  );
}
