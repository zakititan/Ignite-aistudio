import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { CalendarPlus, Download, ShieldCheck, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Callout } from "@/components/Callouts";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ThemeSettingsCard } from "@/components/ThemeToggle";
import { Checkbox } from "@/components/ui/checkbox";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings and privacy — your data, your control" },
      {
        name: "description",
        content:
          "Export your launch plan, load the demo business, or delete everything stored on this device.",
      },
      { property: "og:title", content: "Settings and privacy" },
      {
        property: "og:description",
        content: "Plain answers about what we store, plus one-click export and delete.",
      },
    ],
  }),
  component: Settings,
});

function Settings() {
  const { state, loadDemo, resetAll, restoreBackup, setLocalInsightsConsent } = useStore();
  const [busy, setBusy] = useState(false);
  const backupInput = useRef<HTMLInputElement>(null);

  const exportPlan = () => {
    setBusy(true);
    try {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "launch-plan.json";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Your plan has been downloaded.");
    } catch {
      toast.error("We could not create the download just now.");
    } finally {
      setBusy(false);
    }
  };

  const importPlan = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 2_000_000) {
      toast.error("Choose a backup smaller than 2 MB.");
      return;
    }
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!restoreBackup(parsed)) throw new Error("invalid backup");
      toast.success("Your backup has been restored on this device.");
    } catch {
      toast.error("That file is not a valid Cornerstone backup.");
    } finally {
      if (backupInput.current) backupInput.current.value = "";
    }
  };

  const exportRenewalCalendar = () => {
    const date = state.ownership.renewalDate.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      toast.error("Add a domain renewal date (YYYY-MM-DD) in your ownership record first.");
      return;
    }
    const due = date.replaceAll("-", "");
    const reminder = new Date(`${date}T12:00:00Z`);
    reminder.setDate(reminder.getDate() - 30);
    const reminderDay = reminder.toISOString().slice(0, 10).replaceAll("-", "");
    const domain = state.business.preferredDomain || state.business.ownedDomain || "your domain";
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Cornerstone//EN",
      "BEGIN:VEVENT",
      `UID:domain-renewal-${due}@cornerstone`,
      `DTSTART;VALUE=DATE:${due}`,
      `SUMMARY:Renew ${domain}`,
      "DESCRIPTION:Confirm auto-renewal and payment details. Never share account credentials.",
      `BEGIN:VALARM`,
      `TRIGGER;VALUE=DATE-TIME:${reminderDay}T120000Z`,
      "ACTION:DISPLAY",
      "DESCRIPTION:Domain renewal due in 30 days",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "domain-renewal-reminder.ics";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Calendar reminder downloaded.");
  };

  return (
    <AppShell title="Settings & privacy" description="What we store, and how to remove it.">
      <div className="space-y-6">
        <Callout tone="info" title="Everything stays on this device">
          Your business details, checklist progress and drafts are stored in this browser. We do not
          send them anywhere, and clearing your browser data removes them.
        </Callout>

        <ThemeSettingsCard />

        <section className="surface-panel space-y-3 p-5 sm:p-6">
          <h2 className="font-display text-xl font-bold">Export your plan</h2>
          <p className="text-sm text-muted-foreground">
            Download a copy of everything you have entered, including your checklist, drafts and
            ownership record. Useful as a backup or to share with someone helping you.
          </p>
          <Button onClick={exportPlan} disabled={busy}>
            <Download className="size-4" aria-hidden="true" />
            Download my plan
          </Button>
          <input
            ref={backupInput}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(e) => void importPlan(e.target.files?.[0])}
          />
          <Button variant="outline" onClick={() => backupInput.current?.click()}>
            <Upload className="size-4" aria-hidden="true" /> Restore a backup
          </Button>
          <p className="text-xs text-muted-foreground">
            Restoring replaces the current device plan. Export first if you want to keep both.
          </p>
        </section>

        <section className="surface-panel space-y-3 p-5 sm:p-6">
          <h2 className="font-display text-xl font-bold">Renewal protection</h2>
          <p className="text-sm text-muted-foreground">
            Download a 30-day reminder for your domain expiry date. Add or update the date in your
            ownership record.
          </p>
          <Button variant="outline" onClick={exportRenewalCalendar}>
            <CalendarPlus className="size-4" aria-hidden="true" /> Add domain renewal reminder
          </Button>
        </section>

        <section className="surface-panel space-y-3 p-5 sm:p-6">
          <h2 className="font-display text-xl font-bold">AI assistance</h2>
          <p className="text-sm text-muted-foreground">
            AI assistance is optional. When enabled, your question, short chat context, and selected
            non-sensitive setup context are sent to our AI service (OpenAI GPT-5.6 Luna) to create a
            response. Chat history stays local and limited.
          </p>
          <p className="text-sm text-muted-foreground">
            Do not enter passwords, recovery codes, payment details, API keys, DNS credentials, or
            private customer information.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => {
                try {
                  localStorage.setItem("cornerstone_ai_consent", "ai");
                  toast.success("AI assistance enabled on this device.");
                } catch {
                  toast.error("Could not save preference.");
                }
              }}
            >
              Allow AI assistance on this device
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                try {
                  localStorage.setItem("cornerstone_ai_consent", "local");
                  toast.success("Local guides only enabled.");
                } catch {
                  toast.error("Could not save preference.");
                }
              }}
            >
              Use local guides only
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                try {
                  localStorage.removeItem("cornerstone_ai_consent");
                  toast.success("Local chat history cleared.");
                } catch {
                  toast.error("Could not clear.");
                }
              }}
            >
              Clear local chat history
            </Button>
          </div>
        </section>

        <section className="surface-panel space-y-3 p-5 sm:p-6">
          <h2 className="font-display text-xl font-bold">Private product insights</h2>
          <p className="text-sm text-muted-foreground">
            You can allow anonymous completion signals to be kept only in this browser. Nothing is
            sent to a server or shared with providers.
          </p>
          <div className="flex items-start gap-3">
            <Checkbox
              id="local-insights"
              checked={state.localInsightsConsent === true}
              onCheckedChange={(value) => setLocalInsightsConsent(value === true)}
            />
            <label htmlFor="local-insights" className="text-sm leading-relaxed">
              <ShieldCheck className="mr-1 inline size-4 text-success" aria-hidden="true" />
              Keep private, on-device improvement signals enabled
            </label>
          </div>
        </section>

        <section className="surface-panel space-y-3 p-5 sm:p-6">
          <h2 className="font-display text-xl font-bold">Explore with demo data</h2>
          <p className="text-sm text-muted-foreground">
            Load Harbor &amp; Hearth Bakery, a fictional business with a partly completed plan, to
            see how every screen works. This replaces what is currently saved.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">Load the demo business</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Replace your current plan with the demo?</AlertDialogTitle>
                <AlertDialogDescription>
                  Your existing answers and progress will be replaced by the demo bakery. Export
                  first if you want to keep them.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep my plan</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    loadDemo();
                    toast.success("Demo business loaded.");
                  }}
                >
                  Load demo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </section>

        <section className="surface-panel space-y-3 border-destructive/30 p-5 sm:p-6">
          <h2 className="font-display text-xl font-bold">Delete everything</h2>
          <p className="text-sm text-muted-foreground">
            Removes your business details, checklist, drafts and ownership record from this device.
            This cannot be undone.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="size-4" aria-hidden="true" />
                Delete my data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete everything on this device?</AlertDialogTitle>
                <AlertDialogDescription>
                  Your plan, progress, drafts and ownership record will be permanently removed.
                  Consider exporting first.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    resetAll();
                    toast.success("Everything has been deleted from this device.");
                  }}
                >
                  Delete permanently
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </section>

        <section className="surface-panel space-y-3 p-5 sm:p-6">
          <h2 className="font-display text-xl font-bold">Honest disclaimers</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• This is educational guidance, not legal, tax or financial advice.</li>
            <li>
              • We do not sell domains, hosting or email, and we are not paid to recommend
              providers.
            </li>
            <li>
              • Provider pricing, features and availability change often — always check current
              terms.
            </li>
            <li>
              • Domain availability shown in this app is illustrative until you check with a
              registrar.
            </li>
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
