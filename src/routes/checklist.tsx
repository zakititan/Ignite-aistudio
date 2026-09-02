import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ListChecks, Plus, Printer } from "lucide-react";
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
        content: "Every step of getting your business online, grouped into seven plain-English phases.",
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

  const filtered = useMemo(
    () =>
      state.tasks.filter(
        (t) =>
          (phase === "all" || t.phase === phase) &&
          (status === "all" || t.status === status) &&
          (importance === "all" || t.importance === importance),
      ),
    [state.tasks, phase, status, importance],
  );

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
        <Button variant="outline" size="sm" onClick={() => window.print()} className="hidden sm:inline-flex">
          <Printer className="size-4" aria-hidden="true" />
          Print
        </Button>
      }
    >
      <div className="space-y-6">
        <section className="surface-panel p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-lg font-semibold">
                {state.tasks.filter((t) => t.status === "complete").length} of {state.tasks.length} steps
                complete
              </p>
              <p className="text-sm text-muted-foreground">
                Steady progress beats perfect progress. One task today is enough.
              </p>
            </div>
            <Badge className="bg-primary-soft text-primary">{percent}% ready</Badge>
          </div>
          <Progress value={percent} className="mt-4" />
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
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
                {tasks.map((t) => (
                  <LaunchTaskCard
                    key={t.id}
                    task={t}
                    onStatus={(s: TaskStatus) => setTaskStatus(t.id, s)}
                    onUpdate={(patch) => updateTask(t.id, patch)}
                  />
                ))}
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
