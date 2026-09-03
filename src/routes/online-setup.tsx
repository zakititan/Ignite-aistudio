import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Globe,
  Network,
  Blocks,
  Mail,
  ShieldCheck,
  Info,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Building2,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Callout } from "@/components/Callouts";
import { GlossaryTooltip } from "@/components/GlossaryTooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { getDnsImpactPreview, getOnlinePresenceStatus } from "@/lib/online-presence";
import { OnlineSetupMap } from "@/components/OnlineSetupMap";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/online-setup")({
  head: () => ({
    meta: [
      { title: "Your online setup map — Cornerstone" },
      {
        name: "description",
        content:
          "See how your web address, website, and business email fit together—and what to protect before making changes.",
      },
      { property: "og:title", content: "Your online setup map" },
      {
        property: "og:description",
        content:
          "A visual map of domain, DNS, website and business email with plain-English safeguards before you connect anything.",
      },
    ],
  }),
  component: OnlineSetupPage,
});

function formatTimestamp(iso?: string): string | null {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    // only show if within plausible range (not epoch)
    if (d.getFullYear() < 2000) return null;
    return d.toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return null;
  }
}

function OnlineSetupPage() {
  const { state } = useStore();
  const areas = useMemo(() => getOnlinePresenceStatus(state), [state]);
  const preview = useMemo(() => getDnsImpactPreview(state), [state]);

  const domainArea = useMemo(() => areas.find((a) => a.id === "domain"), [areas]);
  const dnsArea = useMemo(() => areas.find((a) => a.id === "dns"), [areas]);
  const websiteArea = useMemo(() => areas.find((a) => a.id === "website"), [areas]);
  const emailArea = useMemo(() => areas.find((a) => a.id === "email"), [areas]);
  const customerActionArea = useMemo(() => areas.find((a) => a.id === "customer_action"), [areas]);
  const ownershipArea = useMemo(() => areas.find((a) => a.id === "ownership"), [areas]);

  const business = state.business;
  const ownership = state.ownership;

  // ----- Domain card derived -----
  const preferredDomain = business.preferredDomain.trim();
  const ownedDomain = business.ownedDomain.trim();
  const savedPreferred = state.savedDomainIdeas.find((d) => d.status === "preferred")?.domain ?? "";
  const savedPurchased = state.savedDomainIdeas.find((d) => d.status === "purchased")?.domain ?? "";
  const displayDomain =
    ownedDomain || savedPurchased || preferredDomain || savedPreferred || "No domain selected yet";
  const hasDomain = displayDomain !== "No domain selected yet";

  const registrar = business.registrarName.trim() || ownership.domainRegistrar.trim() || "";
  const registrarDisplay =
    registrar || "Not yet recorded — add which company you pay for the address.";
  const renewal = ownership.renewalDate.trim() || "";
  const renewalDisplay =
    renewal || "Not yet recorded — record from your registrar to avoid expiry.";

  const hasRegistrarAccessRaw = (business.hasRegistrarAccess ?? "").trim().toLowerCase();
  const hasRegistrarAccessDisplay =
    hasRegistrarAccessRaw === "yes"
      ? "You have registrar access"
      : hasRegistrarAccessRaw === "no"
        ? "No access — confirm who holds the account"
        : hasRegistrarAccessRaw === "unsure"
          ? "Access unsure — confirm who can sign in"
          : "Access not yet recorded";

  const recoveryDisplay =
    (ownership.recoveryOwner ?? "").trim() ||
    (business.hasRecoveryEmailAccess ? String(business.hasRecoveryEmailAccess) : "");
  const recoveryLabel = (() => {
    const v = recoveryDisplay.toLowerCase().trim();
    if (v === "yes") return "Recovery email access: yes";
    if (v === "no") return "Recovery email access: no — add a recovery contact";
    if (v === "unsure") return "Recovery access: unsure";
    if (recoveryDisplay.trim().length > 0) return `Recovery: ${recoveryDisplay}`;
    return "Recovery contact not yet recorded";
  })();

  // ----- DNS card derived -----
  const dnsProvider =
    business.dnsProvider?.trim() ||
    ownership.dnsProvider.trim() ||
    state.dnsPlanning?.dnsProviderLocation?.trim() ||
    "";
  const dnsProviderDisplay =
    dnsProvider || "Unknown — check registrar or DNS host (where you manage DNS).";

  const websiteChangeRaw = (
    business.websiteChangePlanned ??
    state.dnsPlanning?.websiteChangeType ??
    ""
  )
    .toString()
    .trim()
    .toLowerCase();
  const websiteChangeDisplay =
    websiteChangeRaw === "yes" || websiteChangeRaw === "replacing"
      ? "Replacing an existing website"
      : websiteChangeRaw === "no" || websiteChangeRaw === "first"
        ? "First website (new)"
        : websiteChangeRaw === "unsure"
          ? "Unsure — confirm if you are replacing or starting fresh"
          : "Not yet specified — tell us if this is a new or replacement site";

  const emailActiveRaw = (
    business.usesBusinessEmail ??
    business.needsBusinessEmail ??
    state.dnsPlanning?.usesBusinessEmail ??
    ""
  )
    .toString()
    .trim()
    .toLowerCase();
  const emailActiveDisplay =
    emailActiveRaw === "yes"
      ? "Business email is active — protect mail records"
      : emailActiveRaw === "no"
        ? "Business email not used"
        : emailActiveRaw === "unsure" || emailActiveRaw === "not_sure"
          ? "Unknown if business email is active — confirm before changing DNS"
          : preview.emailAtRisk
            ? "Possibly at risk — confirm email use before DNS changes"
            : "Not specified";

  // Last live DNS check timestamp only if valid — check multiple sources
  const dnsCheckTimestamp =
    formatTimestamp(state.customerJourneyTest?.lastUpdatedAt) ||
    formatTimestamp(
      // try finding a task completedAt for DNS related tasks as proxy
      state.tasks.find((t) => t.title.toLowerCase().includes("point your web address"))
        ?.completedAt ?? undefined,
    );
  const hasValidTimestamp = Boolean(dnsCheckTimestamp);

  // ----- Website card derived -----
  const websiteUrl = business.websiteUrl?.trim() || "";
  const websiteUrlStatus = business.websiteUrlStatus ?? "not_added";
  const websiteStatusLabel = (() => {
    if (websiteUrlStatus === "live") return "Live";
    if (websiteUrlStatus === "draft") return "Draft";
    if (websiteUrlStatus === "not_added" || !websiteUrl) {
      const approach = business.websiteApproach?.trim();
      const provider = business.websiteProvider?.trim() || ownership.websitePlatform.trim();
      if (provider || approach) return "Selected — not yet built";
      return "Not chosen";
    }
    return websiteUrl ? "Selected" : "Not chosen";
  })();
  const websitePlatform =
    business.websiteProvider?.trim() ||
    ownership.websitePlatform.trim() ||
    business.websiteApproach?.trim() ||
    "";
  const websitePlatformDisplay = websitePlatform || "Not chosen yet — choose a website tool first.";
  const websiteUrlDisplay = websiteUrl || "No URL added yet — add in Business profile.";
  const customerActionSummary =
    customerActionArea?.summary ?? "Choose your primary customer action.";

  // ----- Business email card derived -----
  const emailNeedRaw = emailActiveRaw;
  const emailNeedDisplay =
    emailNeedRaw === "yes"
      ? "Needed — business email required"
      : emailNeedRaw === "no"
        ? "Not needed"
        : emailNeedRaw === "unsure" || emailNeedRaw === "not_sure"
          ? "Not specified — confirm need"
          : "Not specified";
  const emailProvider = ownership.emailProvider.trim() || "";
  const emailProviderDisplay = emailProvider || "Not yet chosen — pick where mailboxes will live.";
  const exampleAddress = business.businessEmail.trim() || "";
  const exampleAddressDisplay = exampleAddress || "No example address entered yet.";
  const mailProtectionState = (() => {
    if (emailNeedRaw === "no") return "Not applicable — email not used";
    if (preview.emailAtRisk)
      return "At risk during DNS changes — keep MX/SPF/DKIM records separate from website records.";
    if (preview.recordsToPreserve.some((r) => r.toLowerCase().includes("mx")))
      return "Preserve mail records — do not delete MX / SPF when pointing website.";
    return "Confirm email records before changing DNS.";
  })();

  // ----- At a glance -----
  const whatWeKnow = [
    {
      label: "Preferred domain",
      value: hasDomain ? displayDomain : "— Not yet chosen",
      sub: hasDomain ? `Status: ${domainArea?.statusLabel ?? "—"}` : "Choose in Domain finder",
    },
    {
      label: "Website provider",
      value: websitePlatformDisplay,
      sub: websitePlatform
        ? `Status: ${websiteArea?.statusLabel ?? "—"}`
        : "Pick in Platform matcher",
    },
    {
      label: "Business email",
      value: exampleAddress ? exampleAddress : emailProviderDisplay,
      sub: `Need: ${emailNeedDisplay} · ${emailArea?.statusLabel ?? ""}`,
    },
    {
      label: "DNS manager",
      value: dnsProviderDisplay,
      sub: `Change expected: ${preview.websiteChangeExpected ? "yes" : "no"} · Level: ${preview.level}`,
    },
  ];

  const whatToDoNext: { label: string; to: string; action: string }[] = [];
  if (!hasDomain) {
    whatToDoNext.push({
      label: "No domain yet — choose a web address",
      to: "/domains",
      action: "Choose a domain",
    });
  } else if (domainArea?.status !== "complete") {
    whatToDoNext.push({
      label: "Record who owns the domain and enable renewal",
      to: "/ownership-record",
      action: "Record ownership",
    });
  }
  if (websiteUrlStatus !== "live" && websiteUrlStatus !== "draft") {
    whatToDoNext.push({
      label: "Confirm website draft or live status",
      to: "/business-profile",
      action: "Add website details",
    });
  } else if (websiteUrlStatus === "draft") {
    whatToDoNext.push({
      label: "Draft detected — finish pages and plan connection",
      to: "/connect-domain",
      action: "Plan domain connection",
    });
  }
  if (preview.emailAtRisk) {
    whatToDoNext.push({
      label: "Protect mail records (MX / SPF / DKIM) before changing DNS",
      to: "/connect-domain",
      action: "Protect email during DNS changes",
    });
  } else if (emailNeedRaw === "unsure" || emailNeedRaw === "" || emailNeedRaw === "not_sure") {
    whatToDoNext.push({
      label: "Confirm if business email is needed",
      to: "/business-email",
      action: "Plan business email",
    });
  }
  if (whatToDoNext.length === 0) {
    whatToDoNext.push({
      label: "Review safeguards and connect when ready",
      to: "/connect-domain",
      action: "Review DNS guide",
    });
  }
  // cap at 4
  const nextSteps = whatToDoNext.slice(0, 4);

  return (
    <AppShell
      title="Your online setup map"
      description="See how your web address, website, and business email fit together—and what to protect before making changes."
    >
      <div className="space-y-8">
        {/* Intro summary from presence */}
        <section className="surface-panel p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
                Context workflow
              </p>
              <h2 className="mt-1 font-display text-xl font-bold">Your connected presence</h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                This map shows what you control today and what is still unknown. Nothing is guessed
                — unknown is shown as unknown. Review before you change DNS, so your website change
                does not break email.
              </p>
            </div>
            <Badge variant="outline" className="shrink-0">
              <ShieldCheck className="mr-1 size-3.5" aria-hidden="true" />
              Read-only overview
            </Badge>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <div className="rounded-lg border bg-muted/30 p-3 text-center">
              <p className="text-xs text-muted-foreground">Risk level</p>
              <p
                className={cn(
                  "mt-1 text-sm font-bold capitalize",
                  preview.level === "high"
                    ? "text-destructive"
                    : preview.level === "medium"
                      ? "text-warning"
                      : "text-success",
                )}
              >
                {preview.level} risk
              </p>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{preview.title}</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3 text-center">
              <p className="text-xs text-muted-foreground">Website change</p>
              <p className="mt-1 text-sm font-semibold">
                {preview.websiteChangeExpected ? "Expected" : "Not planned"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {preview.existingWebsiteAtRisk
                  ? "Existing site at risk"
                  : "No existing site at risk"}
              </p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3 text-center">
              <p className="text-xs text-muted-foreground">Email at risk</p>
              <p className="mt-1 text-sm font-semibold">
                {preview.emailAtRisk ? "Yes — protect MX" : "No"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {preview.recordsToPreserve.slice(0, 2).join(" · ")}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Based on <GlossaryTooltip term="DNS">DNS impact preview</GlossaryTooltip> and your saved
            answers. If unsure, choose “unknown” rather than guessing.
          </p>

          {/* Compact DNS impact summary — required spec */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary-soft/20 px-4 py-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold">
                DNS impact:{" "}
                {preview.level === "high" ? "High" : preview.level === "medium" ? "Medium" : "Low"}{" "}
                risk
                {preview.emailAtRisk ? " — Business email may be affected" : " — No email at risk"}
                {preview.existingWebsiteAtRisk ? " · Existing website at risk" : ""}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2">{preview.summary}</p>
            </div>
            <Button asChild size="sm">
              <Link to="/connect-domain">Review impact and connection plan →</Link>
            </Button>
          </div>
        </section>

        {/* Visual map */}
        <OnlineSetupMap
          domainArea={domainArea}
          dnsArea={dnsArea}
          websiteArea={websiteArea}
          emailArea={emailArea}
          customerActionArea={customerActionArea}
          domainName={displayDomain}
        />

        {/* Detailed cards grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Domain card */}
          <section aria-labelledby="domain-card" className="surface-panel p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <Globe className="size-4" aria-hidden="true" />
                </span>
                <h3 id="domain-card" className="font-display text-lg font-bold">
                  Domain
                </h3>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  domainArea?.status === "complete"
                    ? "bg-success-soft text-success border-success/30"
                    : "border-border",
                )}
              >
                {domainArea?.statusLabel ?? "—"}
              </Badge>
            </div>

            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-2 border-b border-border pb-2">
                <dt className="text-muted-foreground">Web address</dt>
                <dd className="max-w-[60%] text-right font-medium break-all">{displayDomain}</dd>
              </div>
              <div className="flex justify-between gap-2 border-b border-border pb-2">
                <dt className="text-muted-foreground">Registrar</dt>
                <dd className="max-w-[60%] text-right font-medium">{registrarDisplay}</dd>
              </div>
              <div className="flex justify-between gap-2 border-b border-border pb-2">
                <dt className="text-muted-foreground">Ownership & access</dt>
                <dd className="max-w-[60%] text-right font-medium">{hasRegistrarAccessDisplay}</dd>
              </div>
              <div className="flex justify-between gap-2 border-b border-border pb-2">
                <dt className="text-muted-foreground">Recovery</dt>
                <dd className="max-w-[60%] text-right font-medium">{recoveryLabel}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Renewal</dt>
                <dd className="max-w-[60%] text-right font-medium">{renewalDisplay}</dd>
              </div>
            </dl>
            {domainArea?.summary ? (
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {domainArea.summary}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <Link to="/domains">Choose a domain</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/ownership-record">Record ownership</Link>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link to="/ownership-record">Review renewal</Link>
              </Button>
            </div>
          </section>

          {/* DNS card */}
          <section aria-labelledby="dns-card" className="surface-panel p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <Network className="size-4" aria-hidden="true" />
                </span>
                <h3 id="dns-card" className="font-display text-lg font-bold">
                  DNS
                </h3>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  dnsArea?.status === "complete"
                    ? "bg-success-soft text-success border-success/30"
                    : "border-border",
                )}
              >
                {dnsArea?.statusLabel ?? "—"}
              </Badge>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              <GlossaryTooltip term="DNS">DNS</GlossaryTooltip> is the internet’s address book. It
              includes <GlossaryTooltip term="A record">address records</GlossaryTooltip> for your
              website and <GlossaryTooltip term="MX record">mail records</GlossaryTooltip> for
              email. Changing your website edits DNS; email records should stay separate.
            </p>

            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-2 border-b border-border pb-2">
                <dt className="text-muted-foreground">DNS provider</dt>
                <dd className="max-w-[60%] text-right font-medium">{dnsProviderDisplay}</dd>
              </div>
              <div className="flex justify-between gap-2 border-b border-border pb-2">
                <dt className="text-muted-foreground">Connection planning</dt>
                <dd className="max-w-[60%] text-right font-medium">
                  {dnsArea?.summary ?? preview.summary}
                </dd>
              </div>
              <div className="flex justify-between gap-2 border-b border-border pb-2">
                <dt className="text-muted-foreground">Website change planned</dt>
                <dd className="max-w-[60%] text-right font-medium">{websiteChangeDisplay}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Business email</dt>
                <dd className="max-w-[60%] text-right font-medium">{emailActiveDisplay}</dd>
              </div>
            </dl>

            {hasValidTimestamp ? (
              <p className="mt-3 text-xs text-muted-foreground">
                Last live DNS check: {dnsCheckTimestamp} — from recent activity.
              </p>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">
                No live DNS check recorded yet. Use the Live DNS checker in{" "}
                <Link to="/connect-domain" className="underline underline-offset-4">
                  Connect domain
                </Link>{" "}
                to verify before changing.
              </p>
            )}

            {preview.requiredBeforeChange.length > 0 ? (
              <div className="mt-3 rounded-lg border border-warning/30 bg-warning-soft/40 p-3">
                <p className="text-xs font-semibold">Before you change DNS:</p>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-xs leading-relaxed">
                  {preview.requiredBeforeChange.slice(0, 4).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link to="/connect-domain">Review DNS changes safely</Link>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link to="/ownership-record">Confirm DNS provider</Link>
              </Button>
            </div>
          </section>

          {/* Website card */}
          <section aria-labelledby="website-card" className="surface-panel p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <Blocks className="size-4" aria-hidden="true" />
                </span>
                <h3 id="website-card" className="font-display text-lg font-bold">
                  Website
                </h3>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  websiteArea?.status === "complete"
                    ? "bg-success-soft text-success border-success/30"
                    : "border-border",
                )}
              >
                {websiteArea?.statusLabel ?? "—"}
              </Badge>
            </div>

            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-2 border-b border-border pb-2">
                <dt className="text-muted-foreground">Status</dt>
                <dd className="max-w-[60%] text-right font-medium">{websiteStatusLabel}</dd>
              </div>
              <div className="flex justify-between gap-2 border-b border-border pb-2">
                <dt className="text-muted-foreground">Platform / host</dt>
                <dd className="max-w-[60%] text-right font-medium">{websitePlatformDisplay}</dd>
              </div>
              <div className="flex justify-between gap-2 border-b border-border pb-2">
                <dt className="text-muted-foreground">URL</dt>
                <dd className="max-w-[60%] text-right font-mono text-xs break-all">
                  {websiteUrlDisplay}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Primary customer action</dt>
                <dd className="max-w-[60%] text-right font-medium">
                  {customerActionArea?.label ?? "Customer action"} —{" "}
                  {customerActionArea?.statusLabel ?? "—"}
                  <span className="block text-xs font-normal text-muted-foreground">
                    {customerActionSummary}
                  </span>
                </dd>
              </div>
            </dl>

            {websiteArea?.summary ? (
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {websiteArea.summary}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <Link to="/platform-matcher">Choose website setup</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/business-profile">Add website details</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/connect-domain">Plan domain connection</Link>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link to="/customer-journey">Test customer action</Link>
              </Button>
            </div>
          </section>

          {/* Business email card */}
          <section aria-labelledby="email-card" className="surface-panel p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <Mail className="size-4" aria-hidden="true" />
                </span>
                <h3 id="email-card" className="font-display text-lg font-bold">
                  Business email
                </h3>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  emailArea?.status === "complete"
                    ? "bg-success-soft text-success border-success/30"
                    : "border-border",
                )}
              >
                {emailArea?.statusLabel ?? "—"}
              </Badge>
            </div>

            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-2 border-b border-border pb-2">
                <dt className="text-muted-foreground">Need / status</dt>
                <dd className="max-w-[60%] text-right font-medium">
                  {emailNeedDisplay} · {emailArea?.summary ?? ""}
                </dd>
              </div>
              <div className="flex justify-between gap-2 border-b border-border pb-2">
                <dt className="text-muted-foreground">Provider</dt>
                <dd className="max-w-[60%] text-right font-medium">{emailProviderDisplay}</dd>
              </div>
              <div className="flex justify-between gap-2 border-b border-border pb-2">
                <dt className="text-muted-foreground">Example address</dt>
                <dd className="max-w-[60%] text-right font-mono text-xs break-all">
                  {exampleAddressDisplay}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Mail protection</dt>
                <dd className="max-w-[60%] text-right text-xs leading-relaxed">
                  {mailProtectionState}
                </dd>
              </div>
            </dl>

            {preview.recordsToPreserve.length ? (
              <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs font-semibold">Records to preserve:</p>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-xs leading-relaxed">
                  {preview.recordsToPreserve.slice(0, 3).map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <Link to="/business-email">Plan business email</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/ownership-record">Record ownership</Link>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link to="/connect-domain">Protect email during DNS changes</Link>
              </Button>
            </div>
          </section>
        </div>

        {/* At a glance */}
        <section aria-labelledby="at-a-glance" className="surface-panel p-5 sm:p-6">
          <h2 id="at-a-glance" className="font-display text-lg font-bold">
            At a glance
          </h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <CheckCircle2 className="size-4 text-success" aria-hidden="true" /> What we know
              </h3>
              <ul className="mt-3 space-y-2">
                {whatWeKnow.map((item) => (
                  <li key={item.label} className="flex gap-2 rounded-lg border bg-muted/30 p-3">
                    <span
                      className="mt-0.5 size-1.5 shrink-0 rounded-full bg-primary"
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-sm break-all">{item.value}</p>
                      <p className="text-xs text-muted-foreground">{item.sub}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <AlertTriangle className="size-4 text-warning" aria-hidden="true" /> What to do next
              </h3>
              <ul className="mt-3 space-y-2">
                {nextSteps.map((step) => (
                  <li key={step.label} className="flex gap-2 rounded-lg border bg-card p-3">
                    <span
                      className="mt-0.5 size-1.5 shrink-0 rounded-full bg-warning"
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-relaxed">{step.label}</p>
                      <Button asChild variant="link" size="sm" className="h-auto px-0 text-xs">
                        <Link to={step.to as never}>{step.action} →</Link>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
              {ownershipArea?.summary ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  Ownership: {ownershipArea.summary}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        {/* Safety note */}
        <Callout tone="warning" title="Keep control of your accounts">
          <p className="text-sm leading-relaxed">
            Your web address, DNS, website and billing should stay in accounts you personally or
            jointly control. Keep a written record of who can access each account, turn on two-step
            sign-in, and store recovery codes offline. Never let an agency or freelancer be the only
            owner — if you part ways, you should not lose your domain.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link to="/ownership-record">Open ownership record</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/business-profile">Edit Business profile</Link>
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link to="/dashboard">Back to dashboard</Link>
            </Button>
          </div>
        </Callout>

        {/* Contextual footer links */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>Jump to:</span>
          <Link to="/domains" className="underline underline-offset-4 hover:text-foreground">
            Domain finder
          </Link>
          <span aria-hidden="true">·</span>
          <Link to="/connect-domain" className="underline underline-offset-4 hover:text-foreground">
            Connect domain
          </Link>
          <span aria-hidden="true">·</span>
          <Link to="/business-email" className="underline underline-offset-4 hover:text-foreground">
            Business email
          </Link>
          <span aria-hidden="true">·</span>
          <Link
            to="/ownership-record"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Ownership record
          </Link>
          <span aria-hidden="true">·</span>
          <Link
            to="/customer-journey"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Journey tester
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
