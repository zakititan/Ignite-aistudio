import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Wrench } from "lucide-react";
import { MarketingNavbar } from "@/components/MarketingNavbar";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/Callouts";

interface PhaseDetail {
  key: string;
  number: number;
  title: string;
  why: string;
  outcome: string;
  tools: { label: string; to: string }[];
}

const PHASE_DETAILS: PhaseDetail[] = [
  {
    key: "plan",
    number: 1,
    title: "Plan your online presence",
    why: "Make foundational decisions on audience, ownership, and budget to prevent costly rebuilds later.",
    outcome: "Scope, custody records, and 3-year running cost projection.",
    tools: [
      { label: "Business Profile", to: "/business-profile" },
      { label: "Ownership Record", to: "/ownership-record" },
      { label: "Cost Calculator", to: "/cost-calculator" },
    ],
  },
  {
    key: "domain",
    number: 2,
    title: "Secure your web address",
    why: "Register your domain in your own account with registrar safeguards to stay in permanent control.",
    outcome: "Clean registered domain with two-factor authentication enabled.",
    tools: [
      { label: "Domain Finder", to: "/domains" },
      { label: "Security Drill", to: "/security-drill" },
    ],
  },
  {
    key: "setup",
    number: 3,
    title: "Choose your website and hosting setup",
    why: "Match the right builder for your specific business model and map how domain, hosting, and email connect.",
    outcome: "Platform selection with an interactive architectural setup map.",
    tools: [
      { label: "Platform Matcher", to: "/platform-matcher" },
      { label: "Online Setup Map", to: "/online-setup" },
    ],
  },
  {
    key: "build",
    number: 4,
    title: "Build your core pages",
    why: "Draft essential pages focused on conversion, then test the real visitor journey on mobile.",
    outcome: "Clear website copy and tested customer action flows.",
    tools: [
      { label: "Content Builder", to: "/content" },
      { label: "Customer Journey Test", to: "/customer-journey" },
    ],
  },
  {
    key: "connect",
    number: 5,
    title: "Connect your address and email",
    why: "Point your domain to your website host using guarded DNS records without interrupting email flow.",
    outcome: "Live DNS routing, pre-change screenshot safety, and verified business email.",
    tools: [
      { label: "Connect Domain (DNS)", to: "/connect-domain" },
      { label: "Business Email", to: "/business-email" },
    ],
  },
  {
    key: "launch",
    number: 6,
    title: "Test and launch",
    why: "Catch broken links, dialer bugs, and missing certificates before welcoming real customers.",
    outcome: "Resolved launch blockers, preflight inspection passed, and agency handover dossier.",
    tools: [
      { label: "Launch Wizard", to: "/launch-wizard" },
      { label: "Preflight Check", to: "/preflight" },
      { label: "Launch Dossier", to: "/launch-dossier" },
    ],
  },
  {
    key: "grow",
    number: 7,
    title: "Get found and maintain your site",
    why: "Establish local search visibility, collect verified reviews, and follow a regular care schedule.",
    outcome: "Google Business Profile ready, review QR kit created, and recurring care plan.",
    tools: [
      { label: "Get Found (SEO)", to: "/get-found" },
      { label: "Review QR Kit", to: "/review-kit" },
      { label: "Email Signature", to: "/email-signature" },
      { label: "Maintenance", to: "/maintenance" },
    ],
  },
];

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
          {PHASE_DETAILS.map((p) => (
            <li
              key={p.key}
              className="surface-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-start"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary font-display font-bold text-primary-foreground">
                {p.number}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-lg font-semibold">{p.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.why}</p>
                <p className="mt-2 text-xs font-medium text-foreground/85">
                  <span className="font-normal text-muted-foreground">Outcome: </span>
                  {p.outcome}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 mr-1">
                    <Wrench className="size-3" aria-hidden="true" />
                    Tools:
                  </span>
                  {p.tools.map((tool) => (
                    <Link
                      key={tool.to}
                      to={tool.to}
                      className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-secondary/60 px-2 py-0.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      {tool.label}
                      <ArrowRight className="size-2.5 opacity-60" aria-hidden="true" />
                    </Link>
                  ))}
                </div>
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
