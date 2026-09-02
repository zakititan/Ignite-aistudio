import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ClipboardCheck, Info, ListChecks, Plus, Printer } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { LaunchTaskCard } from "@/components/TaskCards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/lib/store";
import { PHASES, progressPercent } from "@/lib/plan";
import { getReadiness } from "@/lib/readiness";
import { LaunchReadinessCard } from "@/components/LaunchReadinessCard";
import { ReadinessStatusBadge } from "@/components/ReadinessStatusBadge";
import { LaunchBlockerList } from "@/components/LaunchBlockerList";
import type { Importance, PhaseKey, TaskStatus } from "@/lib/types";

export const Route = createFileRoute("/checklist")({
  head: () => ({
    meta: [
      { title: "Your launch checklist — every step in order" },
      {
        name: "description",
        content:
          "Work through your personalised launch checklist phase by phase, filter by what matters, and add your own steps.",
      },
      { property: "og:title", content: "Your launch checklist" },
      {
        property: "og:description",
        content:
          "Every step of getting your business online, grouped into seven plain-English phases.",
      },
    ],
  }),
  component: Checklist,
});

function Checklist() {
  const { state, hasPlan, setTaskStatus, updateTask, addTask } = useStore();
  const [phase, setPhase] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [importance, setImportance] = useState<string>("all");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ title: "", description: "", phase: "plan" as PhaseKey });

  const readiness = useMemo(
    () => getReadiness(state.tasks, state.business, state.ownership, state.customerJourneyTest),
    [state.tasks, state.business, state.ownership, state.customerJourneyTest],
  );

  const searchStr = useRouterState({ select: (s) => s.location.searchStr }) as string;
  const searchParams = useMemo(() => new URLSearchParams(searchStr), [searchStr]);
  const initialBlocker = searchParams.get("filter") === "blockers";
  const [blockerOnly, setBlockerOnly] = useState(initialBlocker);
  useEffect(() => {
    if (searchParams.get("filter") === "blockers") setBlockerOnly(true);
  }, [searchParams]);

  const blockerMap = useMemo(() => {
    const m = new Map<string, (typeof readiness.blockers)[number]>();
    for (const b of readiness.blockers) {
      if (b.relatedTaskId) m.set(b.relatedTaskId, b);
    }
    return m;
  }, [readiness]);

  const filtered = useMemo(() => {
    let tasks = state.tasks.filter(
      (t) =>
        (phase === "all" || t.phase === phase) &&
        (status === "all" || t.status === status) &&
        (importance === "all" || t.importance === importance),
    );
    if (blockerOnly) {
      // Show only tasks tied to applicable blockers. Completed optional tasks do not hide critical blockers — blockers themselves remain visible above.
      // Filter by blocker linkage OR by critical blocker existence when no relatedTaskId
      const hasCriticalWithoutTask = readiness.blockers.some(
        (b) => b.severity === "critical" && !b.relatedTaskId,
      );
      tasks = tasks.filter((t) => {
        if (blockerMap.has(t.id) && t.status !== "complete") return true;
        // If there are critical blockers without a task mapping, still show incomplete required tasks
        if (hasCriticalWithoutTask && t.importance === "required" && t.status !== "complete")
          return true;
        return false;
      });
    }
    return tasks;
  }, [state.tasks, phase, status, importance, blockerOnly, blockerMap, readiness.blockers]);

  const percent = progressPercent(state.tasks);

  if (!hasPlan) {
    return (
      <AppShell title="Your launch checklist">
        <EmptyState
          icon={ListChecks}
          title="Your checklist appears after your plan"
          description="Answer a few questions about your business and we will build a step-by-step checklist tailored to you."
          actionLabel="Create my free plan"
          actionTo="/onboarding"
        />
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Your launch checklist"
      description="Everything in order. Nothing you do not need."
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.print()}
          className="hidden sm:inline-flex"
        >
          <Printer className="size-4" aria-hidden="true" />
          Print
        </Button>
      }
    >
      <div className="space-y-6">
        <LaunchReadinessCard readiness={readiness} />

        {(() => {
          const journeyBlocker = readiness.blockers.find(
            (b) => b.relatedRoute === "/customer-journey",
          );
          const journeyLabel = state.customerJourneyTest
            ? state.customerJourneyTest.journeyType === "custom" &&
              state.customerJourneyTest.customJourneyLabel
              ? state.customerJourneyTest.customJourneyLabel
              : state.customerJourneyTest.journeyType.replace("_", " ")
            : null;
          if (journeyBlocker) {
            return (
              <div className="surface-panel flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between border-warning/30">
                <div>
                  <p className="font-display text-sm font-semibold flex items-center gap-2">
                    {journeyBlocker.severity === "critical" ? (
                      <AlertTriangle className="size-4 text-destructive" aria-hidden="true" />
                    ) : (
                      <Info className="size-4 text-warning-foreground" aria-hidden="true" />
                    )}
                    {journeyBlocker.title}
                  </p>
                  <p className="text-sm text-muted-foreground wrap-break-word">
                    {journeyBlocker.description}
                  </p>
                  {journeyLabel ? (
                    <p className="text-xs text-muted-foreground mt-1">Testing: {journeyLabel}</p>
                  ) : null}
                </div>
                <Button asChild size="sm" className="shrink-0">
                  <Link to="/customer-journey">
                    {journeyBlocker.actionLabel ?? "Open journey tester"} →
                  </Link>
                </Button>
              </div>
            );
          }
          return (
            <div className="surface-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-display text-sm font-semibold flex items-center gap-2">
                  <ClipboardCheck className="size-4 text-primary" aria-hidden="true" /> Test your
                  primary customer action
                </p>
                <p className="text-sm text-muted-foreground">
                  Use the journey tester to walk through your main action on a real phone and record
                  what happened.
                </p>
              </div>
              <Button asChild variant="outline" size="sm" className="shrink-0">
                <Link to="/customer-journey">Open journey tester →</Link>
              </Button>
            </div>
          );
        })()}

        <section className="surface-panel p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-lg font-semibold">
                {state.tasks.filter((t) => t.status === "complete").length} of {state.tasks.length}{" "}
                steps complete
              </p>
              <p className="text-sm text-muted-foreground">
                Steady progress beats perfect progress. One task today is enough.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {readiness.completedRequiredTasks} of {readiness.totalRequiredTasks} required steps
                · {readiness.requiredCompletionPercent}% required
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <ReadinessStatusBadge status={readiness.status} />
              <Badge className="bg-primary-soft text-primary">{percent}% overall</Badge>
            </div>
          </div>
          <Progress
            value={percent}
            className="mt-4"
            aria-label={`Overall progress ${percent} percent`}
          />
          <Progress
            value={readiness.requiredCompletionPercent}
            className="mt-2 h-1.5 bg-warning/20"
            aria-label={`Required progress ${readiness.requiredCompletionPercent} percent`}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Overall and required progress are shown separately — both use semantic colors plus text
            and icons, not color alone.
          </p>
        </section>

        {blockerOnly && readiness.blockers.length > 0 ? (
          <section aria-labelledby="applicable-blockers" className="surface-panel p-5">
            <h2
              id="applicable-blockers"
              className="font-display text-base font-bold flex items-center gap-2"
            >
              <AlertTriangle className="size-4 text-destructive" aria-hidden="true" /> Applicable
              launch blockers — why this matters
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Only applicable to your business type ({state.business.category || "category"},{" "}
              {state.business.customerModel || "model"},{" "}
              {state.business.needs.join(", ") || "no special needs"}) — others hidden. Completed
              optional steps do not hide critical items.
            </p>
            <div className="mt-3">
              <LaunchBlockerList blockers={readiness.blockers} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Each blocker shows why it matters and links directly to the page that fixes it.
            </p>
          </section>
        ) : null}

        <section className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="f-phase">Phase</Label>
            <Select value={phase} onValueChange={setPhase}>
              <SelectTrigger id="f-phase">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All phases</SelectItem>
                {PHASES.map((p) => (
                  <SelectItem key={p.key} value={p.key}>
                    {p.number}. {p.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="f-status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="f-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any status</SelectItem>
                <SelectItem value="todo">Not started</SelectItem>
                <SelectItem value="in_progress">In progress</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="f-imp">Importance</Label>
            <Select value={importance} onValueChange={setImportance}>
              <SelectTrigger id="f-imp">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Everything</SelectItem>
                <SelectItem value="required">Required</SelectItem>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="optional">Optional</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Launch blockers</Label>
            <Button
              variant={blockerOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setBlockerOnly((v) => !v)}
              aria-pressed={blockerOnly}
              className="w-full justify-center"
            >
              <AlertTriangle className="size-4" aria-hidden="true" />
              {blockerOnly ? "Showing blockers only" : "Show blockers only"}
              {readiness.blockers.length ? ` (${readiness.blockers.length})` : ""}
            </Button>
            {blockerOnly ? (
              <button
                type="button"
                onClick={() => setBlockerOnly(false)}
                className="w-full text-center text-xs text-muted-foreground underline underline-offset-4"
              >
                Clear filter
              </button>
            ) : null}
          </div>
        </section>

        {PHASES.map((p) => {
          const tasks = filtered.filter((t) => t.phase === p.key);
          if (!tasks.length) return null;
          return (
            <section key={p.key} aria-labelledby={`phase-${p.key}`} className="space-y-3">
              <div>
                <h2 id={`phase-${p.key}`} className="font-display text-lg font-bold">
                  Phase {p.number}: {p.title}
                </h2>
                <p className="text-sm text-muted-foreground">{p.why}</p>
              </div>
              <div className="space-y-3">
                {tasks.map((t) => {
                  const blocker = blockerMap.get(t.id);
                  const showBlocker = Boolean(blocker && t.status !== "complete");
                  return (
                    <div key={t.id} className="space-y-2">
                      {showBlocker ? (
                        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-warning/25 bg-warning-soft/40 px-3 py-2 text-xs">
                          <span className="inline-flex items-center gap-1.5 font-semibold text-warning-foreground">
                            {blocker!.severity === "critical" ? (
                              <AlertTriangle className="size-3.5" aria-hidden="true" />
                            ) : (
                              <Info className="size-3.5" aria-hidden="true" />
                            )}
                            Launch blocker — {blocker!.severity}
                          </span>
                          <span className="text-muted-foreground">· {blocker!.description}</span>
                          {blocker!.relatedRoute ? (
                            <Link
                              to={blocker!.relatedRoute}
                              className="font-medium text-primary underline underline-offset-4"
                            >
                              {blocker!.actionLabel ?? "Review"} →
                            </Link>
                          ) : null}
                        </div>
                      ) : null}
                      <LaunchTaskCard
                        task={t}
                        onStatus={(s: TaskStatus) => setTaskStatus(t.id, s)}
                        onUpdate={(patch) => updateTask(t.id, patch)}
                      />
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {!filtered.length ? (
          <p className="surface-panel p-6 text-sm text-muted-foreground">
            No steps match those filters. Try widening them.
          </p>
        ) : null}

        <section className="surface-panel p-5">
          {adding ? (
            <div className="space-y-3">
              <h2 className="font-display text-lg font-bold">Add your own step</h2>
              <div className="space-y-1.5">
                <Label htmlFor="custom-title">What needs doing?</Label>
                <Input
                  id="custom-title"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="Photograph the shop front"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="custom-desc">Any detail you want to remember</Label>
                <Textarea
                  id="custom-desc"
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="custom-phase">Which phase?</Label>
                <Select
                  value={draft.phase}
                  onValueChange={(v) => setDraft({ ...draft, phase: v as PhaseKey })}
                >
                  <SelectTrigger id="custom-phase">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PHASES.map((p) => (
                      <SelectItem key={p.key} value={p.key}>
                        {p.number}. {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (!draft.title.trim()) {
                      toast.error("Give your step a short title first.");
                      return;
                    }
                    addTask({
                      phase: draft.phase,
                      category: "Your own steps",
                      title: draft.title.trim().slice(0, 120),
                      description: draft.description.trim().slice(0, 500),
                      importance: "optional" as Importance,
                      estimatedMinutes: 30,
                      status: "todo",
                      notes: "",
                      assignedTo: "Me",
                      completedAt: null,
                      custom: true,
                    });
                    setDraft({ title: "", description: "", phase: "plan" });
                    setAdding(false);
                    toast.success("Added to your checklist.");
                  }}
                >
                  Add step
                </Button>
                <Button variant="ghost" onClick={() => setAdding(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setAdding(true)}>
              <Plus className="size-4" aria-hidden="true" />
              Add your own step
            </Button>
          )}
        </section>
      </div>
    </AppShell>
  );
}
