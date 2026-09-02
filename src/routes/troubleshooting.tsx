import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Wrench } from "lucide-react";
import { ContentPageLayout, SafetyWarningBanner } from "@/components/ContentPage";
import { EmptyState } from "@/components/EmptyState";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TROUBLESHOOTING_FLOWS } from "@/lib/support-data";

export const Route = createFileRoute("/troubleshooting")({
  head: () => ({
    meta: [
      { title: "Troubleshooting — Cornerstone" },
      {
        name: "description",
        content:
          "Fix the most common launch problems: site not loading, old website showing, email in spam, missing padlock.",
      },
      { property: "og:title", content: "Troubleshooting common launch problems" },
      {
        property: "og:description",
        content: "Step-by-step checks for domains, DNS, websites and email.",
      },
    ],
  }),
  component: TroubleshootingPage,
});

function TroubleshootingPage() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const flows = useMemo(
    () =>
      TROUBLESHOOTING_FLOWS.filter((f) =>
        q ? `${f.title} ${f.likelyCause} ${f.steps.join(" ")}`.toLowerCase().includes(q) : true,
      ),
    [q],
  );

  return (
    <ContentPageLayout
      eyebrow="Support"
      title="Troubleshooting"
      description="Work through the checks in order. Most launch problems are caused by caching, a missing record, or a change that has not finished spreading yet."
    >
      <SafetyWarningBanner>
        Before editing DNS, save a copy of your current records. Changes can take up to 48 hours to
        spread, so make one change at a time and wait before making another.
      </SafetyWarningBanner>

      <section className="surface-panel space-y-3 p-5 sm:p-6">
        <Label htmlFor="ts-search" className="font-display text-base font-semibold">
          Describe the problem
        </Label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="ts-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try “email” or “not loading”"
            className="pl-9"
          />
        </div>
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {flows.length} issue{flows.length === 1 ? "" : "s"} shown
        </p>
      </section>

      {flows.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No matching issue"
          description="Try a shorter search word, or contact us with what you are seeing and we will help you narrow it down."
          actionLabel="Contact support"
          actionTo="/contact"
        />
      ) : (
        <Accordion
          type="single"
          collapsible
          className="surface-panel divide-y divide-border px-5 sm:px-6"
        >
          {flows.map((f) => (
            <AccordionItem key={f.id} value={f.id} className="border-b-0">
              <AccordionTrigger className="text-left font-display text-base font-semibold">
                {f.title}
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Most likely cause: </span>
                  {f.likelyCause}
                </p>
                <ol className="list-decimal space-y-1.5 pl-5 text-sm">
                  {f.steps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
                {f.warning ? (
                  <p className="rounded-lg border border-warning/40 bg-warning-soft p-3 text-sm">
                    {f.warning}
                  </p>
                ) : null}
                <Button asChild variant="outline" size="sm">
                  <Link to={f.relatedTo}>{f.relatedLabel}</Link>
                </Button>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      <section className="surface-panel p-5">
        <h2 className="font-display text-base font-bold">Customer action still failing?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          If a phone call, form, booking or purchase does not work on a real phone, record it with
          the journey tester. Blocked steps appear as a critical blocker in your readiness.
        </p>
        <Button asChild size="sm" className="mt-3">
          <Link to="/customer-journey">Open journey tester →</Link>
        </Button>
      </section>

      <section className="surface-panel flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="font-display text-lg font-bold">Not solved it?</h2>
          <p className="text-sm text-muted-foreground">
            Tell us what you tried, and consider bringing in paid help for anything time-critical.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/contact">Contact us</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/hire-help">Find paid help</Link>
          </Button>
        </div>
      </section>
    </ContentPageLayout>
  );
}
