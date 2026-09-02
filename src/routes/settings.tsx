import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Trash2 } from "lucide-react";
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
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings and privacy — your data, your control" },
      {
        name: "description",
        content: "Export your launch plan, load the demo business, or delete everything stored on this device.",
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
  const { state, loadDemo, resetAll } = useStore();
  const [busy, setBusy] = useState(false);

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

  return (
    <AppShell title="Settings & privacy" description="What we store, and how to remove it.">
      <div className="space-y-6">
        <Callout tone="info" title="Everything stays on this device">
          Your business details, checklist progress and drafts are stored in this browser. We do not send them
          anywhere, and clearing your browser data removes them.
        </Callout>

        <section className="surface-panel space-y-3 p-5 sm:p-6">
          <h2 className="font-display text-xl font-bold">Export your plan</h2>
          <p className="text-sm text-muted-foreground">
            Download a copy of everything you have entered, including your checklist, drafts and ownership
            record. Useful as a backup or to share with someone helping you.
          </p>
          <Button onClick={exportPlan} disabled={busy}>
            <Download className="size-4" aria-hidden="true" />
            Download my plan
          </Button>
        </section>

        <section className="surface-panel space-y-3 p-5 sm:p-6">
          <h2 className="font-display text-xl font-bold">Explore with demo data</h2>
          <p className="text-sm text-muted-foreground">
            Load Harbor &amp; Hearth Bakery, a fictional business with a partly completed plan, to see how every
            screen works. This replaces what is currently saved.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">Load the demo business</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Replace your current plan with the demo?</AlertDialogTitle>
                <AlertDialogDescription>
                  Your existing answers and progress will be replaced by the demo bakery. Export first if you
                  want to keep them.
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
            Removes your business details, checklist, drafts and ownership record from this device. This cannot
            be undone.
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
                  Your plan, progress, drafts and ownership record will be permanently removed. Consider
                  exporting first.
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
            <li>• We do not sell domains, hosting or email, and we are not paid to recommend providers.</li>
            <li>• Provider pricing, features and availability change often — always check current terms.</li>
            <li>• Domain availability shown in this app is illustrative until you check with a registrar.</li>
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
