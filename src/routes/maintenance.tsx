import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Wrench, Download, Bell, Copy, Calendar } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Callout } from "@/components/Callouts";
import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  const [reminderEnabled, setReminderEnabled] = useState(() => {
    try {
      return window.localStorage.getItem("lmbo.maintenance.reminder") === "1";
    } catch {
      return false;
    }
  });

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(state.maintenance, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "maintenance-reminders.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported maintenance list (JSON). Keep it with your ownership record.");
  };

  const exportIcs = () => {
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Cornerstone//Maintenance//EN"];
    for (const m of state.maintenance) {
      const dt = m.nextDue.replace(/-/g, "");
      lines.push("BEGIN:VEVENT", `UID:${m.id}@cornerstone.local`, `DTSTART;VALUE=DATE:${dt}`, `SUMMARY:${m.title} — ${m.recurrence}`, `DESCRIPTION:Maintenance reminder — ${m.title}\\nNotes: ${(m.notes || "").replace(/\n/g, "\\n")}`, "END:VEVENT");
    }
    lines.push("END:VCALENDAR");
    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cornerstone-maintenance.ics";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded calendar reminders (.ics) — import into Google/Apple Calendar.");
  };

  const copyDueDates = async () => {
    const text = state.maintenance.map((m) => `${m.recurrence.toUpperCase()} — ${m.title} — Due ${m.nextDue}${m.notes ? ` — ${m.notes}` : ""} — ${m.status}`).join("\n");
    await navigator.clipboard.writeText(text);
    toast.success("Copied due dates & notes to clipboard!");
  };

  const toggleReminder = () => {
    const next = !reminderEnabled;
    setReminderEnabled(next);
    try {
      window.localStorage.setItem("lmbo.maintenance.reminder", next ? "1" : "0");
    } catch {}
    if (next && "Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission().catch(() => {});
    }
    toast.success(next ? "Local reminder enabled — we’ll nudge you when items are due." : "Local reminder disabled.");
  };

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
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={copyDueDates} className="text-xs gap-1.5">
            <Copy className="size-3.5" /> Copy list
          </Button>
          <Button variant="outline" size="sm" onClick={exportJson} className="text-xs gap-1.5">
            <Download className="size-3.5" /> Export JSON
          </Button>
          <Button size="sm" onClick={exportIcs} className="text-xs gap-1.5 bg-primary text-primary-foreground shadow">
            <Calendar className="size-3.5" /> Export .ics
          </Button>
        </div>
      }
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

        <div className="surface-panel p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Bell className="size-3.5 text-primary" /> Local reminder
            </span>
            <p className="text-xs text-muted-foreground">Keep a local nudge in this browser + export to your calendar. No data leaves your device.</p>
          </div>
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input type="checkbox" checked={reminderEnabled} onChange={toggleReminder} className="size-4 rounded border-border" />
            <span className="font-medium text-foreground">Enable local reminder</span>
          </label>
        </div>

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
                        "surface-panel flex flex-col gap-3 p-4",
                        done && "border-success/35 bg-success-soft/40",
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-3">
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
                            "flex-1 text-sm font-medium cursor-pointer",
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
                      </div>
                      <div className="pl-7 space-y-1">
                        <Label htmlFor={`m-note-${m.id}`} className="text-[11px] font-semibold text-muted-foreground">
                          Notes
                        </Label>
                        <Textarea
                          id={`m-note-${m.id}`}
                          value={m.notes || ""}
                          onChange={(e) => updateMaintenance(m.id, { notes: e.target.value })}
                          placeholder="What did you check, what changed, who did it? (saved locally)"
                          rows={2}
                          className="text-xs"
                        />
                      </div>
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
