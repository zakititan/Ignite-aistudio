import { Link } from "@tanstack/react-router";
import { ArrowRight, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ReadinessStatusBadge } from "@/components/ReadinessStatusBadge";
import { LaunchBlockerList } from "@/components/LaunchBlockerList";
import type { LaunchReadiness } from "@/lib/types";

export function LaunchReadinessSummary({ readiness }: { readiness: LaunchReadiness }) {
  const { status, overallCompletionPercent, completedRequiredTasks, totalRequiredTasks, blockers } =
    readiness;

  if (status === "not_started") {
    return (
      <section aria-labelledby="readiness-summary-title" className="surface-panel p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="readiness-summary-title" className="font-display text-lg font-bold">
              Launch readiness
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a plan to see what to review before inviting customers — guidance, not a
              guarantee.
            </p>
          </div>
          <ReadinessStatusBadge status={status} />
        </div>
        <Button asChild className="mt-4">
          <Link to="/onboarding">Create my plan</Link>
        </Button>
      </section>
    );
  }

  return (
    <section aria-labelledby="readiness-summary-title" className="surface-panel p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="readiness-summary-title" className="font-display text-lg font-bold">
            Launch readiness
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {status === "ready_for_review"
              ? "No critical blockers found. Review everything once more on a real phone before inviting customers — guidance, not a guarantee."
              : status === "blocked"
                ? "Some critical items need review before you invite customers."
                : "You are getting close — complete the remaining required steps and review the notes below."}
          </p>
        </div>
        <ReadinessStatusBadge status={status} />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Overall progress
          </p>
          <p className="mt-1 text-2xl font-bold font-display">{overallCompletionPercent}%</p>
          <Progress
            value={overallCompletionPercent}
            className="mt-2"
            aria-label={`Overall progress ${overallCompletionPercent} percent`}
          />
          <p className="mt-1 text-xs text-muted-foreground">All tasks</p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Required checks
          </p>
          <p className="mt-1 text-2xl font-bold font-display">
            {completedRequiredTasks} of {totalRequiredTasks}
          </p>
          <Progress
            value={
              totalRequiredTasks
                ? Math.round((completedRequiredTasks / totalRequiredTasks) * 100)
                : 0
            }
            className="mt-2"
            aria-label={`Required tasks ${completedRequiredTasks} of ${totalRequiredTasks}`}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Required checks: {completedRequiredTasks} of {totalRequiredTasks} ·{" "}
            {totalRequiredTasks
              ? Math.round((completedRequiredTasks / totalRequiredTasks) * 100)
              : 0}
            %
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Current blockers
          </p>
          <p className="mt-1 text-2xl font-bold font-display">{blockers.length}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {blockers.length
              ? `Current blockers: ${blockers.length} · ${blockers.filter((b) => b.severity === "critical").length} critical, ${blockers.filter((b) => b.severity === "important").length} important`
              : "Current blockers: 0 — final review recommended"}
          </p>
        </div>
      </div>

      {blockers.length > 0 ? (
        <div className="mt-5 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            {blockers.some((b) => b.severity === "critical") ? (
              <AlertTriangle className="size-4 text-destructive" aria-hidden="true" />
            ) : (
              <Info className="size-4 text-warning-foreground" aria-hidden="true" />
            )}
            Why this matters & what to do next
          </h3>
          <LaunchBlockerList blockers={blockers.slice(0, 5)} />
          {blockers.length > 5 ? (
            <p className="text-xs text-muted-foreground">
              Showing 5 of {blockers.length} blockers — full list in checklist.
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
        <Button asChild size="sm">
          <Link to="/checklist" search={{ filter: "blockers" } as never}>
            Review launch checks <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
        {blockers.length > 0 && blockers[0]?.relatedRoute ? (
          <Button asChild variant="outline" size="sm">
            <Link to={blockers[0].relatedRoute as never}>
              {blockers[0].actionLabel ?? "Go to next step"}
            </Link>
          </Button>
        ) : null}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Educational guidance only — not a guarantee of a successful launch. Prices, eligibility and
        provider features vary.
      </p>
    </section>
  );
}
