import { Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { LaunchReadiness } from "@/lib/types";
import { ReadinessStatusBadge } from "@/components/ReadinessStatusBadge";
import { LaunchBlockerList } from "@/components/LaunchBlockerList";

export function LaunchReadinessCard({
  readiness,
  compact,
}: {
  readiness: LaunchReadiness;
  compact?: boolean;
}) {
  const {
    status,
    overallCompletionPercent,
    requiredCompletionPercent,
    completedRequiredTasks,
    totalRequiredTasks,
    blockers,
    nextRecommendedAction,
  } = readiness;

  const topBlockers = blockers.slice(0, 3);

  // Determine next action link — first critical else first blocker
  const nextRoute = blockers[0]?.relatedRoute;
  const nextLabel = nextRecommendedAction ?? "Review checklist";

  if (status === "not_started") {
    return (
      <section aria-labelledby="readiness-title" className="surface-panel p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="readiness-title" className="font-display text-lg font-bold">
              Launch readiness
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a plan to see what to review before inviting customers — this is guidance, not
              a guarantee.
            </p>
          </div>
          <ReadinessStatusBadge status={status} />
        </div>
        <div className="mt-4">
          <Button asChild>
            <Link to="/onboarding">Create my plan</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="readiness-title" className="surface-panel p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="readiness-title" className="font-display text-lg font-bold">
            Launch readiness
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {status === "ready_for_review"
              ? "No critical blockers found. Review everything once more before inviting customers — this is guidance, not a guarantee."
              : status === "blocked"
                ? "Some critical items need review before you invite customers."
                : "You are getting close — complete the remaining required steps and review the notes below."}
          </p>
        </div>
        <ReadinessStatusBadge status={status} />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Overall
            </p>
            <p className="text-xs font-medium">{overallCompletionPercent}%</p>
          </div>
          <Progress
            value={overallCompletionPercent}
            className="mt-2"
            aria-label={`Overall progress ${overallCompletionPercent} percent`}
          />
          <p className="mt-1 text-xs text-muted-foreground">All tasks</p>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Required
            </p>
            <p className="text-xs font-medium">
              {completedRequiredTasks} of {totalRequiredTasks} · {requiredCompletionPercent}%
            </p>
          </div>
          <Progress
            value={requiredCompletionPercent}
            className="mt-2"
            aria-label={`Required tasks ${requiredCompletionPercent} percent`}
          />
          <p className="mt-1 text-xs text-muted-foreground">Must-review steps</p>
        </div>
      </div>

      {topBlockers.length ? (
        <div className="mt-5">
          <h3 className="text-sm font-semibold">
            {blockers.length > 3
              ? `Top ${topBlockers.length} of ${blockers.length} items to review`
              : "Items to review before launch"}
          </h3>
          <div className="mt-3">
            <LaunchBlockerList blockers={topBlockers} />
          </div>
          {blockers.length > 3 ? (
            <Button asChild variant="outline" size="sm" className="mt-3">
              <Link to="/checklist" search={{ filter: "blockers" } as never}>
                View all launch checks <ExternalLink className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          ) : compact ? null : (
            <Button asChild variant="ghost" size="sm" className="mt-3">
              <Link to="/checklist" search={{ filter: "blockers" } as never}>
                View all launch checks →
              </Link>
            </Button>
          )}
          {!compact && blockers.length <= 3 ? (
            <p className="mt-2">
              <Link
                to="/checklist"
                search={{ filter: "blockers" } as never}
                className="text-xs text-muted-foreground underline underline-offset-4"
              >
                View all launch checks
              </Link>
            </p>
          ) : null}
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-success/20 bg-success-soft/40 p-4">
          <p className="text-sm font-medium text-success">
            No blockers found. Do a final review on a real phone and with a test customer action.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            This check is guidance only — review provider documentation and seek qualified advice
            when needed.
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {nextRoute ? (
          <Button asChild size="sm">
            <Link to={nextRoute as never}>
              {nextLabel} <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        ) : (
          <Button asChild size="sm">
            <Link to="/checklist">
              {nextLabel} <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        )}
        {blockers.length ? (
          <Button asChild variant="outline" size="sm">
            <Link to="/checklist" search={{ filter: "blockers" } as never}>
              View all launch checks
            </Link>
          </Button>
        ) : null}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Educational guidance only — not a guarantee of a successful launch.
      </p>
    </section>
  );
}
