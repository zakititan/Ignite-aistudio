import { Link } from "@tanstack/react-router";
import { Rocket, ClipboardCheck, ShieldCheck, Building2, Globe, Blocks, Network, Mail, Search, FileText, Calculator, ShieldAlert } from "lucide-react";
import type { LaunchBlocker, PresenceStatusArea } from "@/lib/types";

type TopAction = PresenceStatusArea | LaunchBlocker | null;

interface Tool {
  to: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ALL_TOOLS: Record<string, Tool> = {
  wizard: { to: "/launch-wizard", label: "Launch Wizard", description: "Sequential 6-step guided setup", icon: Rocket },
  journey: { to: "/customer-journey", label: "Customer Journey Test", description: "Test your key customer action on a phone", icon: ClipboardCheck },
  preflight: { to: "/preflight", label: "Preflight Review", description: "Final checks before inviting customers", icon: ShieldCheck },
  ownership: { to: "/ownership-record", label: "Ownership Record", description: "Who controls domain, DNS & billing", icon: Building2 },
  domains: { to: "/domains", label: "Domain Finder", description: "Shortlist and check availability", icon: Globe },
  platform: { to: "/platform-matcher", label: "Website & Hosting", description: "Find the right website tool for you", icon: Blocks },
  connect: { to: "/connect-domain", label: "Connect Domain", description: "Point your address safely", icon: Network },
  email: { to: "/business-email", label: "Business Email", description: "Set up hello@yourbusiness", icon: Mail },
  getfound: { to: "/get-found", label: "Get Found", description: "Local presence & search", icon: Search },
  content: { to: "/content", label: "Content Builder", description: "Draft core pages quickly", icon: FileText },
  cost: { to: "/cost-calculator", label: "Cost Calculator", description: "True 3-year costs", icon: Calculator },
  security: { to: "/security-drill", label: "Security & Recovery", description: "Outage triage & 2FA", icon: ShieldAlert },
};

function getContextTools(action: TopAction): Tool[] {
  const id = action?.id ?? "";
  // Domain ownership
  if (id === "domain" || id === "domain-ownership")
    return [ALL_TOOLS["domains"]!, ALL_TOOLS["ownership"]!, ALL_TOOLS["connect"]!, ALL_TOOLS["wizard"]!];
  if (id === "website" || id === "platform-matcher")
    return [ALL_TOOLS["platform"]!, ALL_TOOLS["content"]!, ALL_TOOLS["connect"]!, ALL_TOOLS["preflight"]!];
  if (id === "email" || id === "protect-email")
    return [ALL_TOOLS["email"]!, ALL_TOOLS["connect"]!, ALL_TOOLS["ownership"]!, ALL_TOOLS["wizard"]!];
  if (id === "dns" || id === "website-connection" || id === "https")
    return [ALL_TOOLS["connect"]!, ALL_TOOLS["ownership"]!, ALL_TOOLS["preflight"]!, ALL_TOOLS["wizard"]!];
  if (
    id === "customer_action" ||
    id === "primary-action-test" ||
    id === "customer-journey-blocked" ||
    id === "customer-journey-needs-improvement"
  )
    return [ALL_TOOLS["journey"]!, ALL_TOOLS["preflight"]!, ALL_TOOLS["content"]!, ALL_TOOLS["wizard"]!];
  if (id === "ownership" || id === "business-essentials")
    return [ALL_TOOLS["ownership"]!, ALL_TOOLS["connect"]!, ALL_TOOLS["wizard"]!, ALL_TOOLS["preflight"]!];
  if (id === "local_presence" || id === "business-details" || id === "mobile-review")
    return [ALL_TOOLS["getfound"]!, ALL_TOOLS["content"]!, ALL_TOOLS["journey"]!, ALL_TOOLS["wizard"]!];
  if (id === "selling-data-policies")
    return [ALL_TOOLS["content"]!, ALL_TOOLS["preflight"]!, ALL_TOOLS["wizard"]!, ALL_TOOLS["ownership"]!];
  // Default when all complete or unknown
  return [ALL_TOOLS["wizard"]!, ALL_TOOLS["journey"]!, ALL_TOOLS["preflight"]!, ALL_TOOLS["ownership"]!];
}

export function QuickTools({ action }: { action: TopAction }) {
  const tools = getContextTools(action).slice(0, 4);

  return (
    <section aria-labelledby="quick-tools-title" className="surface-panel p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id="quick-tools-title" className="font-display text-lg font-bold">
            Quick tools
          </h2>
          <p className="text-sm text-muted-foreground">Top picks for your current next step. All tools remain in the side navigation.</p>
        </div>
        <Link to="/dashboard" className="text-xs font-medium text-primary underline-offset-4 hover:underline">
          Browse all via navigation →
        </Link>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tools.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.to}
              to={t.to as never}
              className="flex items-center gap-3 rounded-xl border border-border p-3.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <Icon className="size-4.5" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-semibold leading-tight">{t.label}</span>
                <span className="block text-xs font-normal text-muted-foreground leading-tight">{t.description}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
