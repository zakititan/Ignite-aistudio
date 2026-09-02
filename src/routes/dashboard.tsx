import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, ChevronDown, Clock, HelpCircle, Building2, Rocket } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ProgressRing } from "@/components/ProgressRing";
import { EmptyState } from "@/components/EmptyState";
import { OwnershipWarningCard } from "@/components/Callouts";
import { LaunchTaskCard } from "@/components/TaskCards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useStore } from "@/lib/store";
import { PHASES, currentStage, progressPercent } from "@/lib/plan";
import { getReadiness } from "@/lib/readiness";
import { getOnlinePresenceStatus, getTopPresenceAction } from "@/lib/online-presence";
import { NextBestActionCard } from "@/components/NextBestActionCard";
import { OnlinePresenceStatusGrid } from "@/components/OnlinePresenceStatusGrid";
import { LaunchReadinessSummary } from "@/components/LaunchReadinessSummary";
import { SetupMapPreview } from "@/components/SetupMapPreview";
import { QuickTools } from "@/components/QuickTools";
import { MilestoneSequence } from "@/components/MilestoneSequence";
import { getRecentTools } from "@/lib/recent-tools";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your launch dashboard — Cornerstone" },
      {
        name: "description",
        content:
          "See your progress, your next best action and your seven-area online presence overview from planning to launch.",
      },
      { property: "og:title", content: "Your personalized launch dashboard" },
      {
        property: "og:description",
        content: "Progress, next steps and a seven-area overview for getting your business online.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { state, hydrated, hasPlan, setTaskStatus, updateTask, loadDemo } = useStore();
  const [openPhase, setOpenPhase] = useState<string | null>(null);

  const tasks = state.tasks;
  const percent = progressPercent(tasks);
  const stage = currentStage(tasks);
  const readiness = useMemo(
    () => getReadiness(tasks, state.business, state.ownership, state.customerJourneyTest),
    [tasks, state.business, state.ownership, state.customerJourneyTest],
  );
  const areas = useMemo(() => getOnlinePresenceStatus(state), [state]);
  const topAction = useMemo(() => getTopPresenceAction(areas, readiness), [areas, readiness]);
  const recentTools = useMemo(() => getRecentTools(), []);

  const recent = useMemo(
    () =>
      tasks
        .filter((t) => t.completedAt)
        .sort((a, b) => (a.completedAt! < b.completedAt! ? 1 : -1))
        .slice(0, 4),
    [tasks],
  );

  if (!hydrated) {
    return (
      <AppShell title="Loading your plan…">
        <div className="grid gap-4 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </AppShell>
    );
  }

  if (!hasPlan) {
    return (
      <AppShell
        title="Your dashboard"
        description="Build a plan to unlock your personalized roadmap."
      >
        {/* A. Welcome and business context — empty state */}
        <div className="space-y-8">
          <section aria-labelledby="welcome-title" className="surface-panel p-6 sm:p-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
                Welcome to Cornerstone
              </p>
              <h2 id="welcome-title" className="mt-2 font-display text-2xl font-bold">
                Start with a few questions — we will build your online presence plan.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Answer seven short questions about your business and we will create a personalized
                roadmap plus a seven-area overview (domain, website, business email, DNS connection,
                customer action, ownership &amp; recovery, local presence) so you know what to do
                next.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button asChild>
                  <Link to="/onboarding">
                    Build my plan <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button variant="outline" onClick={loadDemo}>
                  Load the Harbor &amp; Hearth Bakery demo
                </Button>
              </div>
            </div>
          </section>

          {/* Preview of online presence even without plan — useful for new users */}
          <OnlinePresenceStatusGrid areas={areas} />

          <EmptyState
            icon={Rocket}
            title="No launch plan yet"
            description="You can also explore with a demo bakery to see how the dashboard works before creating your own plan."
            actionLabel="Create my free plan"
            actionTo="/onboarding"
          />
          <div className="text-center">
            <Button variant="ghost" onClick={loadDemo}>
              Load the Harbor &amp; Hearth Bakery demo
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  const stageLabel = PHASES.find((p) => p.key === stage)?.title ?? "Plan";
  const completed = tasks.filter((t) => t.status === "complete").length;
  const hasBusinessName = state.business.businessName.trim().length > 0;

  return (
    <AppShell
      title={hasBusinessName ? `Welcome back, ${state.business.businessName}` : "Welcome back"}
      description={`You are ${percent}% of the way to launching your business online.`}
      actions={
        <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
          <Link to="/learn">
            <HelpCircle className="size-4" aria-hidden="true" />
            Need help?
          </Link>
        </Button>
      }
    >
      <div className="space-y-8">
        {/* A. Welcome and business context */}
        <section aria-labelledby="welcome-context" className="surface-panel p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
                Online Presence Command Center
              </p>
              <h2 id="welcome-context" className="mt-1 font-display text-xl font-bold sm:text-2xl">
                {hasBusinessName ? `Welcome back, ${state.business.businessName}` : "Welcome back"}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {hasBusinessName && state.business.category
                  ? `${state.business.category} · ${state.business.location || state.business.address || "Location not yet set"} · Goal: ${state.business.primaryGoal || "—"}`
                  : "Your seven-area overview and next best action are below. Keep your business details in Business profile so downstream pages stay accurate."}
              </p>
              {hasBusinessName ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    <Building2 className="mr-1 size-3" aria-hidden="true" />
                    {state.business.businessName}
                  </Badge>
                  {state.business.primaryCustomerAction ? (
                    <Badge variant="outline" className="text-xs">
                      Action: {state.business.primaryCustomerAction.replace(/_/g, " ")}
                    </Badge>
                  ) : null}
                  {state.business.timeline ? (
                    <Badge variant="outline" className="text-xs">
                      Timeline: {state.business.timeline}
                    </Badge>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <ProgressRing value={percent} size={84} label="complete" />
              <div className="text-sm">
                <p className="font-semibold">
                  {completed} of {tasks.length} tasks done
                </p>
                <p className="text-xs text-muted-foreground">Stage: {stageLabel}</p>
                <div className="mt-1 flex gap-1">
                  {PHASES.map((p) => (
                    <span
                      key={p.key}
                      aria-hidden="true"
                      className={cn(
                        "h-1.5 w-5 rounded-full",
                        tasks
                          .filter((t) => t.phase === p.key)
                          .every((t) => t.status === "complete") &&
                          tasks.some((t) => t.phase === p.key)
                          ? "bg-success"
                          : p.key === stage
                            ? "bg-primary"
                            : "bg-muted",
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/business-profile">Edit Business profile</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/account">My plan &amp; ownership</Link>
            </Button>
          </div>
        </section>

        {/* Recently used quick jump bar */}
        {recentTools.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/80 bg-card/60 p-3 text-xs">
            <div className="flex items-center gap-1.5 font-medium text-muted-foreground pl-1">
              <Clock className="size-3.5" />
              <span>Recently used:</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {recentTools.map((tool) => (
                <Button
                  key={tool.path}
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2.5"
                >
                  <Link to={tool.path as never}>{tool.label}</Link>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* 5-Step Clear Milestone Sequence */}
        <MilestoneSequence />

        {/* B. Next best action card */}
        <NextBestActionCard action={topAction} />

        {/* C. Quick tools consolidated based on stage (3-4 tools + full toggle) */}
        <QuickTools action={topAction} />

        {/* D. Online Presence overview: 7-area grid */}
        <OnlinePresenceStatusGrid areas={areas} />

        {/* E. Launch readiness summary */}
        <LaunchReadinessSummary readiness={readiness} />

        {/* F. Setup map preview */}
        <SetupMapPreview areas={areas} />

        {/* Secondary: preserve useful widgets without duplicating primary info */}

        {/* Roadmap — consolidated, kept for existing users */}
        <section aria-labelledby="roadmap" className="space-y-3">
          <h2 id="roadmap" className="font-display text-xl font-bold">
            Your launch roadmap
          </h2>
          <p className="text-sm text-muted-foreground">
            Seven phases from planning to getting found. Open a phase to manage tasks.
          </p>
          <ol className="space-y-3">
            {PHASES.map((phase) => {
              const phaseTasks = tasks.filter((t) => t.phase === phase.key);
              const done = phaseTasks.filter((t) => t.status === "complete").length;
              const minutes = phaseTasks.reduce((s, t) => s + t.estimatedMinutes, 0);
              const isDone = phaseTasks.length > 0 && done === phaseTasks.length;
              const open = openPhase === phase.key;
              return (
                <li key={phase.key} className="surface-panel overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenPhase(open ? null : phase.key)}
                    aria-expanded={open}
                    className="flex w-full items-start gap-4 p-5 text-left transition-colors hover:bg-muted/50"
                  >
                    <span
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-xl font-display font-bold",
                        isDone
                          ? "bg-success text-success-foreground"
                          : phase.key === stage
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {phase.number}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-lg font-semibold">{phase.title}</h3>
                        {isDone ? (
                          <Badge className="bg-success-soft text-success">Complete</Badge>
                        ) : phase.key === stage ? (
                          <Badge className="bg-primary-soft text-primary">In progress</Badge>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{phase.why}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {done}/{phaseTasks.length} tasks · about {Math.round(minutes / 60) || 1}{" "}
                        hour
                        {Math.round(minutes / 60) === 1 ? "" : "s"}
                      </p>
                    </div>
                    <ChevronDown
                      className={cn(
                        "mt-1 size-5 shrink-0 transition-transform",
                        open && "rotate-180",
                      )}
                      aria-hidden="true"
                    />
                  </button>
                  {open ? (
                    <div className="space-y-3 border-t border-border bg-muted/30 p-4">
                      {phaseTasks.length ? (
                        phaseTasks.map((t) => (
                          <LaunchTaskCard
                            key={t.id}
                            task={t}
                            onStatus={(s) => setTaskStatus(t.id, s)}
                            onUpdate={(p) => updateTask(t.id, p)}
                          />
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No tasks in this phase for your current answers.
                        </p>
                      )}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Snapshot */}
          <section aria-labelledby="snapshot" className="surface-panel p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 id="snapshot" className="font-display text-lg font-bold">
                Your business snapshot
              </h2>
              <Button asChild variant="ghost" size="sm">
                <Link to="/business-profile">Business profile →</Link>
              </Button>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                ["Business", state.business.businessName],
                ["Category", state.business.category],
                ["Location", state.business.location || state.business.address],
                ["Main goal", state.business.primaryGoal],
                [
                  "Customer action",
                  state.business.primaryCustomerAction ? state.business.primaryCustomerAction : "—",
                ],
                ["Website needs", state.business.needs.join(", ")],
                [
                  "Contact",
                  state.business.phone ||
                    state.business.businessEmail ||
                    state.business.contactFormUrl ||
                    "—",
                ],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex flex-wrap justify-between gap-2 border-b border-border pb-2"
                >
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="max-w-[60%] text-right font-medium">{v || "—"}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/business-profile">Edit in Business profile</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/account">My plan &amp; ownership</Link>
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Business profile feeds greetings, content builder, journey tester and get-found.
            </p>
          </section>

          {/* Recent activity */}
          <section aria-labelledby="activity" className="surface-panel p-5">
            <h2 id="activity" className="font-display text-lg font-bold">
              Recent activity
            </h2>
            {recent.length ? (
              <ul className="mt-4 space-y-3">
                {recent.map((t) => (
                  <li key={t.id} className="flex items-start gap-3 text-sm">
                    <Clock className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                    <div>
                      <p className="font-medium">{t.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Completed {new Date(t.completedAt!).toLocaleDateString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Nothing completed yet. Your first finished task will appear here.
              </p>
            )}
          </section>
        </div>

        <OwnershipWarningCard />
      </div>
    </AppShell>
  );
}
