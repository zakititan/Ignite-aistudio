import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { ContentPageLayout, ContentSection } from "@/components/ContentPage";
import { Callout } from "@/components/Callouts";
import { Button } from "@/components/ui/button";
import { SERVICE_STATUSES, type ServiceStatus } from "@/lib/support-data";

export const Route = createFileRoute("/status")({
  head: () => ({
    meta: [
      { title: "Service status — Cornerstone" },
      {
        name: "description",
        content:
          "Current status of the guides, plan saving and sign-in, plus how to check whether the problem is your own provider.",
      },
      { property: "og:title", content: "Service status" },
      {
        property: "og:description",
        content: "All systems and how to tell if an outage is ours or your provider's.",
      },
    ],
  }),
  component: StatusPage,
});

const STATUS_UI: Record<
  ServiceStatus["status"],
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  operational: {
    label: "Operational",
    icon: CheckCircle2,
    className: "text-success bg-success-soft",
  },
  degraded: {
    label: "Degraded",
    icon: AlertTriangle,
    className: "text-warning bg-warning-soft",
  },
  down: { label: "Outage", icon: XCircle, className: "text-destructive bg-destructive/10" },
};

function StatusPage() {
  const allGood = SERVICE_STATUSES.every((s) => s.status === "operational");

  return (
    <ContentPageLayout
      eyebrow="Support"
      title="Service status"
      description="A quick look at whether the problem is on our side. Status shown here is illustrative and updated manually."
    >
      <Callout
        tone={allGood ? "success" : "warning"}
        title={allGood ? "All systems operational" : "Some systems are affected"}
      >
        {allGood
          ? "Everything is running normally. If something is not working for you, the troubleshooting guide is the fastest next step."
          : "We are aware of an issue and are working on it. Check back shortly."}
      </Callout>

      <section className="surface-panel divide-y divide-border">
        <h2 className="p-5 font-display text-lg font-bold sm:px-6">Systems</h2>
        <ul>
          {SERVICE_STATUSES.map((s) => {
            const ui = STATUS_UI[s.status];
            const Icon = ui.icon;
            return (
              <li
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-5 sm:px-6"
              >
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-sm text-muted-foreground">{s.description}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${ui.className}`}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {ui.label}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <ContentSection title="Is it us, or your provider?">
        <p>
          This page only covers Cornerstone. Your website, domain and email are run by other
          companies, and most outages people meet are theirs, not ours. To check:
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Search for your provider's own status page, for example “[provider name] status”.</li>
          <li>Try your site on mobile data as well as your usual network.</li>
          <li>Open your site in a private window to rule out caching.</li>
          <li>Confirm your domain has not simply expired.</li>
        </ul>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button asChild variant="outline">
            <Link to="/troubleshooting">Open troubleshooting</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/contact">Report a problem</Link>
          </Button>
        </div>
      </ContentSection>

      <ContentSection title="Recent history">
        <p className="text-sm text-muted-foreground">
          No incidents recorded in the last 90 days. Incident history is a placeholder while
          monitoring is being set up.
        </p>
      </ContentSection>
    </ContentPageLayout>
  );
}
