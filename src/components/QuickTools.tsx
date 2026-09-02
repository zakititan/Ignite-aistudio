import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Rocket,
  ClipboardCheck,
  ShieldCheck,
  Building2,
  Globe,
  Blocks,
  Network,
  Mail,
  Search,
  FileText,
  Calculator,
  ShieldAlert,
  Star,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import type { LaunchBlocker, PresenceStatusArea } from "@/lib/types";
import { cn } from "@/lib/utils";

type TopAction = PresenceStatusArea | LaunchBlocker | null;

interface Tool {
  id: string;
  to: string;
  label: string;
  description: string;
  category: "Plan" | "Build" | "Launch" | "Grow";
  icon: React.ComponentType<{ className?: string }>;
}

const ALL_TOOLS: Tool[] = [
  {
    id: "domains",
    to: "/domains",
    label: "Domain Finder",
    description: "Shortlist, check availability & secure address",
    category: "Build",
    icon: Globe,
  },
  {
    id: "platform",
    to: "/platform-matcher",
    label: "Website & Hosting",
    description: "Match the right builder for your model",
    category: "Build",
    icon: Blocks,
  },
  {
    id: "content",
    to: "/content",
    label: "Content Builder",
    description: "Draft core pages (Home, About, Contact)",
    category: "Build",
    icon: FileText,
  },
  {
    id: "email",
    to: "/business-email",
    label: "Business Email",
    description: "Set up professional hello@yourdomain",
    category: "Build",
    icon: Mail,
  },
  {
    id: "connect",
    to: "/connect-domain",
    label: "Connect Domain",
    description: "Point your DNS safely without mail disruption",
    category: "Build",
    icon: Network,
  },
  {
    id: "wizard",
    to: "/launch-wizard",
    label: "Launch Wizard",
    description: "Sequential 6-step guided launch sequence",
    category: "Launch",
    icon: Rocket,
  },
  {
    id: "journey",
    to: "/customer-journey",
    label: "Customer Journey Test",
    description: "Test key customer actions on a real mobile phone",
    category: "Launch",
    icon: ClipboardCheck,
  },
  {
    id: "preflight",
    to: "/preflight",
    label: "Check Before Launch",
    description: "Final test of forms, dialers, and error pages",
    category: "Launch",
    icon: ShieldCheck,
  },
  {
    id: "ownership",
    to: "/ownership-record",
    label: "Ownership Record",
    description: "Confirm direct custody of domain, DNS & host",
    category: "Launch",
    icon: Building2,
  },
  {
    id: "security",
    to: "/security-drill",
    label: "Protect Website Access",
    description: "2FA checklist & disaster recovery drill",
    category: "Launch",
    icon: ShieldAlert,
  },
  {
    id: "getfound",
    to: "/get-found",
    label: "Get Found",
    description: "Claim Google Business profile & local search",
    category: "Grow",
    icon: Search,
  },
  {
    id: "reviews",
    to: "/review-kit",
    label: "Google Review QR Kit",
    description: "Customer QR codes and direct review links",
    category: "Grow",
    icon: Star,
  },
  {
    id: "signature",
    to: "/email-signature",
    label: "Email Signature",
    description: "Professional branded email signature",
    category: "Grow",
    icon: Mail,
  },
  {
    id: "cost",
    to: "/cost-calculator",
    label: "Cost Calculator",
    description: "Estimate true 3-year running costs",
    category: "Grow",
    icon: Calculator,
  },
];

export function QuickTools({ action }: { action: TopAction }) {
  const [showAll, setShowAll] = useState(false);
  const { state } = useStore();

  const b = state.business;
  const hasDomain = !!b.ownedDomain || !!b.registeredDomain || !!state.ownership.domainRegistrar;
  const hasDnsOrTesting =
    !!state.ownership.dnsProvider ||
    (state.customerJourneyTest?.steps?.some((s) => s.status === "passed") ?? false);
  const isNearLaunch =
    hasDnsOrTesting &&
    state.tasks
      .filter((t) => t.phase === "dns" || t.phase === "review")
      .some((t) => t.status === "complete");

  // Select 3-4 stage-appropriate tools
  let stageLabel = "Early Planning";
  let recommendedIds: string[] = [];

  if (!hasDomain) {
    stageLabel = "Securing Basics & Domain";
    recommendedIds = ["domains", "platform", "wizard", "cost"];
  } else if (!hasDnsOrTesting) {
    stageLabel = "Building Website & Content";
    recommendedIds = ["content", "platform", "email", "connect"];
  } else if (!isNearLaunch) {
    stageLabel = "Connecting & Verifying";
    recommendedIds = ["connect", "journey", "preflight", "ownership"];
  } else {
    stageLabel = "Launch & Growth";
    recommendedIds = ["preflight", "getfound", "reviews", "signature"];
  }

  // If specific action passed from presence/blockers, prioritize it
  if (action?.id === "domain" || action?.id === "domain-ownership") {
    recommendedIds = ["domains", "ownership", "connect", "wizard"];
  } else if (action?.id === "email" || action?.id === "protect-email") {
    recommendedIds = ["email", "connect", "ownership", "wizard"];
  } else if (action?.id === "customer_action" || action?.id === "primary-action-test") {
    recommendedIds = ["journey", "preflight", "content", "wizard"];
  }

  const stageTools = ALL_TOOLS.filter((t) => recommendedIds.includes(t.id)).slice(0, 4);

  return (
    <section aria-labelledby="quick-tools-title" className="surface-panel p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 id="quick-tools-title" className="font-display text-lg font-bold">
              Stage Toolkit
            </h2>
            <Badge variant="outline" className="text-xs font-normal">
              {stageLabel}
            </Badge>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            3–4 focused tools for where you are right now. No distractions until you need them.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAll((prev) => !prev)}
          className="text-xs gap-1.5"
        >
          <span>{showAll ? "Hide full toolkit" : "See all 14 tools"}</span>
          <ChevronDown
            className={cn("size-3.5 transition-transform duration-200", showAll && "rotate-180")}
          />
        </Button>
      </div>

      {/* Stage Tools Grid (3-4 items) */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stageTools.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.id}
              to={t.to as never}
              className="group flex flex-col justify-between rounded-xl border border-border bg-card/60 p-3.5 text-sm transition-all hover:border-primary/40 hover:bg-muted/50 hover:shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-4.5" aria-hidden="true" />
                  </span>
                  <Badge variant="secondary" className="text-[10px] font-normal py-0">
                    {t.category}
                  </Badge>
                </div>
                <h3 className="mt-2.5 font-semibold text-foreground leading-tight">{t.label}</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {t.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Collapsible Full Toolkit Grid */}
      {showAll && (
        <div className="mt-6 border-t border-border/70 pt-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            All Cornerstone Tools & Workspaces
          </p>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {ALL_TOOLS.map((t) => {
              const Icon = t.icon;
              return (
                <Link
                  key={t.id}
                  to={t.to as never}
                  className="flex items-start gap-3 rounded-lg border border-border/70 p-3 text-xs hover:bg-muted/40 transition-colors"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-foreground mt-0.5">
                    <Icon className="size-3.5" aria-hidden="true" />
                  </span>
                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-foreground truncate">{t.label}</span>
                      <span className="text-[10px] text-muted-foreground">({t.category})</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{t.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
