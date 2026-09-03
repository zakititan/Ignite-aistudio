import { useState } from "react";
import { BadgeCheck, Clock, StickyNote, User } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Importance, LaunchTask, TaskStatus } from "@/lib/types";

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const map: Record<TaskStatus, { label: string; className: string }> = {
    todo: { label: "To do", className: "bg-muted text-muted-foreground" },
    in_progress: { label: "In progress", className: "bg-primary-soft text-primary" },
    complete: { label: "Complete", className: "bg-success-soft text-success" },
  };
  const s = map[status];
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", s.className)}>
      {s.label}
    </span>
  );
}

export function ImportanceBadge({ importance }: { importance: Importance }) {
  const map: Record<Importance, string> = {
    required: "border-destructive/40 bg-destructive-soft text-destructive",
    recommended: "border-warning/40 bg-warning-soft text-foreground",
    optional: "border-border bg-muted text-muted-foreground",
  };
  return (
    <Badge variant="outline" className={cn("capitalize", map[importance])}>
      {importance}
    </Badge>
  );
}

export function LaunchTaskCard({
  task,
  onStatus,
  onUpdate,
}: {
  task: LaunchTask;
  onStatus: (status: TaskStatus) => void;
  onUpdate: (patch: Partial<LaunchTask>) => void;
}) {
  const [openNote, setOpenNote] = useState(false);
  const [note, setNote] = useState(task.notes);
  const [assignee, setAssignee] = useState(task.assignedTo);
  const [evidence, setEvidence] = useState(task.evidence ?? "");
  const done = task.status === "complete";

  return (
    <article
      className={cn(
        "surface-panel p-4 transition-colors sm:p-5",
        done && "border-success/35 bg-success-soft/40",
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          id={`task-${task.id}`}
          checked={done}
          onCheckedChange={(checked) => {
            onStatus(checked ? "complete" : "todo");
            toast.success(
              checked ? "Task marked complete. One completed task is progress." : "Task reopened.",
            );
          }}
          className="mt-1"
          aria-label={`Mark "${task.title}" complete`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Label
              htmlFor={`task-${task.id}`}
              className={cn(
                "font-display text-base font-semibold",
                done && "line-through opacity-70",
              )}
            >
              {task.title}
            </Label>
            <ImportanceBadge importance={task.importance} />
            <TaskStatusBadge status={task.status} />
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground">{task.description}</p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden="true" /> About {task.estimatedMinutes} min
            </span>
            <span className="inline-flex items-center gap-1.5">
              <User className="size-3.5" aria-hidden="true" /> {task.assignedTo || "Unassigned"}
            </span>
            <span>{task.category}</span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {!done ? (
              <Button
                size="sm"
                variant={task.status === "in_progress" ? "secondary" : "outline"}
                onClick={() => onStatus(task.status === "in_progress" ? "todo" : "in_progress")}
              >
                {task.status === "in_progress" ? "Pause this task" : "Start this task"}
              </Button>
            ) : null}
            <Button size="sm" variant="ghost" onClick={() => setOpenNote((v) => !v)}>
              <StickyNote className="size-4" aria-hidden="true" />
              {task.notes ? "Edit note" : "Add note"}
            </Button>
            {task.evidence ? (
              <span className="inline-flex items-center gap-1 text-xs text-success">
                <BadgeCheck className="size-4" aria-hidden="true" /> Verification recorded
              </span>
            ) : null}
          </div>

          {openNote ? (
            <div className="mt-3 space-y-3 rounded-lg border border-border bg-muted/50 p-3">
              <div className="space-y-1.5">
                <Label htmlFor={`note-${task.id}`}>Your note</Label>
                <Textarea
                  id={`note-${task.id}`}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Anything you want to remember about this step."
                  rows={3}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`evidence-${task.id}`}>How did you verify this? (optional)</Label>
                <Input
                  id={`evidence-${task.id}`}
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  placeholder="Live URL, confirmation number, or what you checked"
                />
                <p className="text-xs text-muted-foreground">
                  Helpful for launch-critical steps and handoffs. Never add passwords or recovery
                  codes.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`assign-${task.id}`}>Who is doing this?</Label>
                <Input
                  id={`assign-${task.id}`}
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  placeholder="Me, a teammate, or a contractor"
                />
              </div>
              <Button
                size="sm"
                onClick={() => {
                  onUpdate({ notes: note, assignedTo: assignee, evidence: evidence.trim() });
                  setOpenNote(false);
                  toast.success("Saved to your plan.");
                }}
              >
                Save note
              </Button>
            </div>
          ) : task.notes ? (
            <p className="mt-3 rounded-lg border border-border bg-muted/50 p-3 text-sm">
              {task.notes}
            </p>
          ) : null}
          {task.evidence && !openNote ? (
            <p className="mt-2 text-xs text-muted-foreground">Verified: {task.evidence}</p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
