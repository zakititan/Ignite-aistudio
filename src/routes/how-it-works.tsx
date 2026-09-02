import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { MarketingNavbar } from "@/components/MarketingNavbar";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/Callouts";
import { PHASES } from "@/lib/plan";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How it works — Cornerstone" },
      {
        name: "description",
        content:
          "Seven guided phases from planning your online presence to getting found: see exactly what happens after you build your free launch plan.",
      },
      { property: "og:title", content: "How Cornerstone works" },
      {
        property: "og:description",
        content:
          "Answer a few questions, get a phased roadmap, and complete one clear task at a time.",
      },
    ],
  }),
  component: HowItWorks,
});

function HowItWorks() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNavbar />
      <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:py-20">
        <h1 className="text-4xl font-extrabold sm:text-5xl">How it works</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          You answer questions about your business. We turn those answers into a phased roadmap with
          tasks sized in minutes, not weeks. Nothing is hidden behind jargon.
        </p>

        <Callout tone="info" title="You can use everything without signing in" className="mt-8">
          Your answers are saved in this browser. Create an account later if you want to continue on
          another device.
        </Callout>

        <h2 className="mt-12 font-display text-2xl font-bold">The seven phases</h2>
        <ol className="mt-6 space-y-4">
          {PHASES.map((p) => (
            <li key={p.key} className="surface-panel flex gap-4 p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary font-display font-bold text-primary-foreground">
                {p.number}
              </span>
              <div>
                <h3 className="font-display text-lg font-semibold">{p.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.why}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-12 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link to="/onboarding">
              Create My Free Plan <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/dashboard">Preview the demo dashboard</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
