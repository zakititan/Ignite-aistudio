import { Link } from "@tanstack/react-router";
import { Globe, Network, Blocks, Mail, Eye, Inbox, ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GlossaryTooltip } from "@/components/GlossaryTooltip";
import type { PresenceStatusArea } from "@/lib/types";
import { cn } from "@/lib/utils";

type MapProps = {
  domainArea?: PresenceStatusArea | undefined;
  dnsArea?: PresenceStatusArea | undefined;
  websiteArea?: PresenceStatusArea | undefined;
  emailArea?: PresenceStatusArea | undefined;
  customerActionArea?: PresenceStatusArea | undefined;
  domainName?: string | undefined;
};

const toneClasses: Record<string, string> = {
  complete: "border-success/30 bg-success-soft text-success",
  ready_for_review: "border-warning/30 bg-warning-soft text-warning-foreground",
  in_progress: "border-warning/30 bg-warning-soft text-warning-foreground",
  planned: "border-primary/30 bg-primary-soft text-primary",
  needs_attention: "border-destructive/30 bg-destructive-soft text-destructive",
  needs_information: "border-warning/30 bg-warning-soft text-warning-foreground",
  not_started: "border-border bg-muted text-muted-foreground",
};

function statusTone(status?: string) {
  if (!status) return toneClasses["not_started"];
  return (toneClasses[status] ?? toneClasses["not_started"]) as string;
}

function MiniCard({
  icon: Icon,
  title,
  subtitle,
  statusLabel,
  status,
  to,
  actionLabel,
}: {
  icon: typeof Globe;
  title: string;
  subtitle: string;
  statusLabel?: string | undefined;
  status?: string | undefined;
  to?: string | undefined;
  actionLabel?: string | undefined;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <Icon className="size-4" aria-hidden="true" />
          </span>
          <span className="font-display text-sm font-semibold">{title}</span>
        </div>
        {statusLabel ? (
          <Badge variant="outline" className={cn("shrink-0 text-[11px]", statusTone(status))}>
            {statusLabel}
          </Badge>
        ) : null}
      </div>
      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{subtitle}</p>
      {to && actionLabel ? (
        <Link
          to={to as never}
          className="mt-2 inline-flex text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          {actionLabel} →
        </Link>
      ) : null}
    </div>
  );
}

function ConnectionLabel({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium shadow-sm">
      <GlossaryTooltip term={term}>{children}</GlossaryTooltip>
    </span>
  );
}

function VerticalConnector({ labelTerm, label }: { labelTerm: string; label: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1.5 py-1.5">
      <span className="h-4 w-px bg-border" aria-hidden="true" />
      <ConnectionLabel term={labelTerm}>{label}</ConnectionLabel>
      <span className="h-4 w-px bg-border" aria-hidden="true" />
      <ArrowDown className="size-3 text-muted-foreground" aria-hidden="true" />
    </div>
  );
}

export function OnlineSetupMap({
  domainArea,
  dnsArea,
  websiteArea,
  emailArea,
  customerActionArea: _customerActionArea,
  domainName,
}: MapProps) {
  // Fallbacks for display
  const domainSubtitle =
    domainName && domainName !== "No domain selected yet"
      ? domainName
      : (domainArea?.summary ?? "No domain selected yet");
  const dnsSubtitle = dnsArea?.summary ?? "Settings that point your address to website & email.";
  const websiteSubtitle = websiteArea?.summary ?? "Not yet chosen — pick a website tool to begin.";
  const emailSubtitle = emailArea?.summary ?? "Confirm if you need hello@yourbusiness.com.";

  // Desktop branching layout
  return (
    <section aria-labelledby="online-setup-map" className="surface-panel p-5 sm:p-6">
      <h2 id="online-setup-map" className="font-display text-lg font-bold">
        How the pieces connect
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Your domain is the address. <GlossaryTooltip term="DNS">DNS</GlossaryTooltip> is the traffic
        director that sends visitors to your website and messages to your inbox. Hover underlined
        labels for plain-English explanations.
      </p>

      {/* Mobile vertical flow */}
      <div className="mt-6 flex flex-col items-stretch gap-0 lg:hidden">
        <MiniCard
          icon={Globe}
          title="Domain / Registrar"
          subtitle={domainSubtitle}
          statusLabel={domainArea?.statusLabel}
          status={domainArea?.status}
          to="/domains"
          actionLabel="Choose domain"
        />
        <VerticalConnector labelTerm="DNS" label="Domain → DNS" />
        <MiniCard
          icon={Network}
          title="DNS settings / Traffic director"
          subtitle={dnsSubtitle}
          statusLabel={dnsArea?.statusLabel}
          status={dnsArea?.status}
          to="/connect-domain"
          actionLabel="Review DNS safely"
        />
        <VerticalConnector labelTerm="A record" label="DNS → Website" />
        <MiniCard
          icon={Blocks}
          title="Website / Host"
          subtitle={websiteSubtitle}
          statusLabel={websiteArea?.statusLabel}
          status={websiteArea?.status}
          to="/platform-matcher"
          actionLabel="Choose website setup"
        />
        <VerticalConnector labelTerm="Conversion" label="Website → Customer action" />
        <div className="rounded-xl border border-success/30 bg-success-soft p-3 text-center">
          <div className="flex items-center justify-center gap-2 text-sm font-semibold text-success">
            <Eye className="size-4" aria-hidden="true" /> Visitors see site
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            When DNS points to your host correctly.
          </p>
        </div>

        <div className="my-1 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span className="h-px w-8 bg-border" aria-hidden="true" /> also{" "}
          <span className="h-px w-8 bg-border" aria-hidden="true" />
        </div>

        <VerticalConnector labelTerm="MX record" label="DNS → Business email" />
        <MiniCard
          icon={Mail}
          title="Business email / Provider"
          subtitle={emailSubtitle}
          statusLabel={emailArea?.statusLabel}
          status={emailArea?.status}
          to="/business-email"
          actionLabel="Plan business email"
        />
        <div className="flex flex-col items-center gap-1.5 py-1.5">
          <span className="h-4 w-px bg-border" aria-hidden="true" />
          <ArrowDown className="size-3 text-muted-foreground" aria-hidden="true" />
        </div>
        <div className="rounded-xl border border-success/30 bg-success-soft p-3 text-center">
          <div className="flex items-center justify-center gap-2 text-sm font-semibold text-success">
            <Inbox className="size-4" aria-hidden="true" /> Messages reach inbox
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            When mail records (MX / SPF) stay intact during DNS changes.
          </p>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="mt-6 hidden lg:block">
        {/* Top: Domain centered */}
        <div className="mx-auto max-w-md">
          <MiniCard
            icon={Globe}
            title="Domain / Registrar"
            subtitle={domainSubtitle}
            statusLabel={domainArea?.statusLabel}
            status={domainArea?.status}
            to="/domains"
            actionLabel="Choose domain"
          />
        </div>

        <div className="flex flex-col items-center py-2">
          <span className="h-6 w-px bg-border" aria-hidden="true" />
          <ConnectionLabel term="DNS">Domain → DNS</ConnectionLabel>
          <span className="h-6 w-px bg-border" aria-hidden="true" />
          <ArrowDown className="size-4 text-muted-foreground" aria-hidden="true" />
        </div>

        {/* Middle: DNS centered */}
        <div className="mx-auto max-w-md">
          <MiniCard
            icon={Network}
            title="DNS settings / Traffic director"
            subtitle={dnsSubtitle}
            statusLabel={dnsArea?.statusLabel}
            status={dnsArea?.status}
            to="/connect-domain"
            actionLabel="Review DNS safely"
          />
        </div>

        {/* Branching row */}
        <div className="relative mt-4 grid grid-cols-2 gap-6">
          {/* diagonal lines visual: horizontal connector with vertical drops */}
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-6 w-px -translate-x-1/2 bg-border"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute left-[25%] right-[25%] top-6 h-px bg-border"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute left-[25%] top-6 h-6 w-px bg-border"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute right-[25%] top-6 h-6 w-px bg-border"
            aria-hidden="true"
          />

          {/* Left branch: Website */}
          <div className="flex flex-col items-center gap-3 pt-8">
            <ConnectionLabel term="A record">DNS → Website</ConnectionLabel>
            <div className="w-full">
              <MiniCard
                icon={Blocks}
                title="Website / Host"
                subtitle={websiteSubtitle}
                statusLabel={websiteArea?.statusLabel}
                status={websiteArea?.status}
                to="/platform-matcher"
                actionLabel="Choose website setup"
              />
            </div>
            <span className="h-6 w-px bg-border" aria-hidden="true" />
            <ConnectionLabel term="Conversion">Website → Customer action</ConnectionLabel>
            <span className="h-3 w-px bg-border" aria-hidden="true" />
            <ArrowDown className="size-4 text-muted-foreground" aria-hidden="true" />
            <div className="w-full rounded-xl border border-success/30 bg-success-soft p-3 text-center">
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-success">
                <Eye className="size-4" aria-hidden="true" /> Visitors see site
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Customers reach your pages when the address points to your host.
              </p>
            </div>
          </div>

          {/* Right branch: Business email */}
          <div className="flex flex-col items-center gap-3 pt-8">
            <ConnectionLabel term="MX record">DNS → Business email</ConnectionLabel>
            <div className="w-full">
              <MiniCard
                icon={Mail}
                title="Business email / Provider"
                subtitle={emailSubtitle}
                statusLabel={emailArea?.statusLabel}
                status={emailArea?.status}
                to="/business-email"
                actionLabel="Plan business email"
              />
            </div>
            <span className="h-6 w-px bg-border" aria-hidden="true" />
            <ArrowDown className="size-4 text-muted-foreground" aria-hidden="true" />
            <div className="w-full rounded-xl border border-success/30 bg-success-soft p-3 text-center">
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-success">
                <Inbox className="size-4" aria-hidden="true" /> Messages reach inbox
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Mail records (MX, SPF) direct @yourdomain messages to your provider.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Changing your website updates DNS. It should not require deleting email records. Keep a
          screenshot before you change anything.
        </p>
      </div>
    </section>
  );
}
