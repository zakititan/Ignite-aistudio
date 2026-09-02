import { createFileRoute } from "@tanstack/react-router";
import { Wrench } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Callout } from "@/components/Callouts";
import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import type { MaintenanceTask } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/maintenance")({
  head: () => ({
    meta: [
      { title: "Keep it running — your website maintenance rhythm" },
      {
        name: "description",
        content:
          "A light weekly, monthly, quarterly and yearly routine that keeps your website working and your accounts safe.",
      },
      { property: "og:title", content: "Keep your website running" },
      {
        property: "og:description",
        content:
          "Small recurring habits that prevent expired domains, broken forms and lost access.",
      },
    ],
  }),
  component: Maintenance,
});

const GROUPS: { key: MaintenanceTask["recurrence"]; label: string; blurb: string }[] = [
  {
    key: "weekly",
    label: "Every week",
    blurb: "Ten minutes. Mostly checking that enquiries are reaching you.",
  },
  {
    key: "monthly",
    label: "Every month",
    blurb: "Half an hour. Keep details current and confirm nothing is broken.",
  },
  {
    key: "quarterly",
    label: "Every quarter",
    blurb: "An hour. Refresh what visitors see and review who has access.",
  },
  {
    key: "yearly",
    label: "Every year",
    blurb: "The big ones: renewals, recovery details and legal pages.",
  },
];

function Maintenance() {
  const { state, hasPlan, updateMaintenance } = useStore();

  if (!hasPlan) {
    return (
      <AppShell title="Keep it running">
        <EmptyState
          icon={Wrench}
          title="Your maintenance routine appears with your plan"
          description="Once you create your launch plan, we will set up a light recurring routine so nothing important expires."
          actionLabel="Create my free plan"
          actionTo="/onboarding"
        />
      </AppShell>
    );
  }

  const overdue = state.maintenance.filter(
    (m) => m.status === "pending" && new Date(m.nextDue) < new Date(),
  );

  return (
    <AppShell
      title="Keep it running"
      description="A live website needs a little care — far less than people fear."
    >
      <div className="space-y-6">
        {overdue.length ? (
          <Callout
            tone="warning"
            title={`${overdue.length} item${overdue.length > 1 ? "s" : ""} due now`}
          >
            Nothing here is an emergency, but a domain renewal you miss can take your site offline.
            Start with the oldest.
          </Callout>
        ) : (
          <Callout tone="success" title="Nothing overdue">
            You are on top of it. Come back when the next item is due.
          </Callout>
        )}

        {GROUPS.map((g) => {
          const items = state.maintenance.filter((m) => m.recurrence === g.key);
          if (!items.length) return null;
          return (
            <section key={g.key} aria-labelledby={`m-${g.key}`}>
              <h2 id={`m-${g.key}`} className="font-display text-xl font-bold">
                {g.label}
              </h2>
              <p className="text-sm text-muted-foreground">{g.blurb}</p>
              <ul className="mt-3 space-y-2">
                {items.map((m) => {
                  const done = m.status === "done";
                  const isOverdue = m.status === "pending" && new Date(m.nextDue) < new Date();
                  return (
                    <li
                      key={m.id}
                      className={cn(
                        "surface-panel flex flex-wrap items-center gap-3 p-4",
                        done && "border-success/35 bg-success-soft/40",
                      )}
                    >
                      <Checkbox
                        id={`m-item-${m.id}`}
                        checked={done}
                        onCheckedChange={(checked) => {
                          updateMaintenance(m.id, { status: checked ? "done" : "pending" });
                          if (checked) toast.success("Nice — that is done for this cycle.");
                        }}
                      />
                      <Label
                        htmlFor={`m-item-${m.id}`}
                        className={cn(
                          "flex-1 text-sm font-medium",
                          done && "line-through opacity-70",
                        )}
                      >
                        {m.title}
                      </Label>
                      <Badge
                        variant="outline"
                        className={cn(isOverdue && "border-warning/50 bg-warning-soft")}
                      >
                        {isOverdue ? "Due now" : `Due ${m.nextDue}`}
                      </Badge>
                      {m.status !== "snoozed" && !done ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            updateMaintenance(m.id, { status: "snoozed" });
                            toast.success("Snoozed. It will come back around.");
                          }}
                        >
                          Snooze
                        </Button>
                      ) : null}
                      {m.status === "snoozed" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateMaintenance(m.id, { status: "pending" })}
                        >
                          Unsnooze
                        </Button>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}

        <section className="surface-panel p-5 sm:p-6">
          <h2 className="font-display text-xl font-bold">What happens if you ignore this</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              • A missed domain renewal can take your website and email offline, and recovery can be
              costly.
            </li>
            <li>
              • A broken contact form loses enquiries silently — nobody tells you they could not
              reach you.
            </li>
            <li>
              • Outdated hours and prices cost you trust with the customers who were ready to buy.
            </li>
            <li>
              • Lost account access is the hardest problem to fix, and the easiest to prevent.
            </li>
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
