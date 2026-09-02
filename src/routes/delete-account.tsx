import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Download, Trash2 } from "lucide-react";
import { ContentPageLayout, ContentSection, SafetyWarningBanner } from "@/components/ContentPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export const Route = createFileRoute("/delete-account")({
  head: () => ({
    meta: [
      { title: "Delete your data — Cornerstone" },
      {
        name: "description",
        content:
          "Permanently remove your launch plan, drafts and ownership record from this device. Export first if you need a copy.",
      },
      { property: "og:title", content: "Delete your data" },
      {
        property: "og:description",
        content: "What deletion removes, what it does not touch, and how to export first.",
      },
    ],
  }),
  component: DeleteAccountPage,
});

function DeleteAccountPage() {
  const { state, resetAll } = useStore();
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState("");

  const exportPlan = () => {
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
    }
  };

  return (
    <ContentPageLayout
      eyebrow="Accounts"
      title="Delete your data"
      description="This removes everything this app has stored about your business on this device."
    >
      <SafetyWarningBanner title="This cannot be undone">
        Deleting removes your business profile, roadmap progress, page drafts, maintenance reminders
        and ownership record. Export a copy first if there is any chance you will want it back.
      </SafetyWarningBanner>

      <ContentSection title="What deletion does not touch">
        <p>
          Your domain, hosting, website, business email and social accounts are held by other
          companies. Deleting your data here does <strong className="text-foreground">not</strong>{" "}
          cancel or delete any of them. To close those, sign in to each provider directly — and
          remember that letting a domain lapse can mean losing it permanently.
        </p>
      </ContentSection>

      <section className="surface-panel space-y-3 p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold">Export first</h2>
        <p className="text-sm text-muted-foreground">
          Download a JSON copy of everything, including your ownership record.
        </p>
        <Button variant="outline" onClick={exportPlan}>
          <Download className="size-4" aria-hidden="true" />
          Download my plan
        </Button>
      </section>

      <section className="surface-panel space-y-4 border-destructive/30 p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold">Confirm deletion</h2>
        <div className="space-y-1.5">
          <Label htmlFor="da-confirm">
            Type <span className="font-mono font-semibold">DELETE</span> to enable the button
          </Label>
          <Input
            id="da-confirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            className="sm:max-w-xs"
          />
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={confirmText.trim().toUpperCase() !== "DELETE"}>
              <Trash2 className="size-4" aria-hidden="true" />
              Delete everything
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete all of your data?</AlertDialogTitle>
              <AlertDialogDescription>
                Your plan, progress, drafts and ownership record will be permanently removed from
                this device.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep my data</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  resetAll();
                  toast.success("Everything has been deleted from this device.");
                  navigate({ to: "/" });
                }}
              >
                Delete permanently
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <p className="text-sm text-muted-foreground">
          Changed your mind?{" "}
          <Link to="/settings" className="text-primary underline">
            Return to settings
          </Link>
        </p>
      </section>
    </ContentPageLayout>
  );
}
