import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Copy, Activity } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Callout } from "@/components/Callouts";
import { GlossaryTooltip } from "@/components/GlossaryTooltip";
import { LiveDnsChecker } from "@/components/LiveDnsChecker";
import { DnsImpactPreviewCard } from "@/components/DnsImpactPreviewCard";
import { DnsPreChangeChecklist } from "@/components/DnsPreChangeChecklist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { getDnsImpactPreview } from "@/lib/online-presence";

export const Route = createFileRoute("/connect-domain")({
  head: () => ({
    meta: [
      { title: "Connect your domain to your website — DNS guide" },
      {
        name: "description",
        content:
          "A careful, plain-English walkthrough for pointing your web address at your website without breaking your business email.",
      },
      { property: "og:title", content: "Connect your domain to your website" },
      {
        property: "og:description",
        content:
          "Guided DNS records, safeguards before you change anything, and troubleshooting in plain English.",
      },
    ],
  }),
  component: ConnectDomain,
});

interface RecordRow {
  id: string;
  type: string;
  host: string;
  value: string;
  purpose: string;
  category: "Website routing" | "Verification" | "Email" | "Redirect";
}

const WEBSITE_HOST_PRESETS: { id: string; name: string; records: RecordRow[] }[] = [
  {
    id: "custom",
    name: "Other / Custom Hosting Provider",
    records: [
      {
        id: "a-1",
        type: "A",
        host: "@",
        value: "203.0.113.10 (use the IP address your web host gave you)",
        purpose: "Points your bare root domain (e.g. yourdomain.com) to your web host server.",
        category: "Website routing",
      },
      {
        id: "cname-www",
        type: "CNAME",
        host: "www",
        value: "your-site.example-platform.com",
        purpose: "Sends visitors typing www.yourdomain.com to your website host.",
        category: "Website routing",
      },
    ],
  },
  {
    id: "squarespace",
    name: "Squarespace",
    records: [
      {
        id: "sq-a-1",
        type: "A",
        host: "@",
        value: "198.185.159.144",
        purpose: "Squarespace primary A record 1.",
        category: "Website routing",
      },
      {
        id: "sq-a-2",
        type: "A",
        host: "@",
        value: "198.185.159.145",
        purpose: "Squarespace redundant A record 2.",
        category: "Website routing",
      },
      {
        id: "sq-a-3",
        type: "A",
        host: "@",
        value: "198.49.23.144",
        purpose: "Squarespace redundant A record 3.",
        category: "Website routing",
      },
      {
        id: "sq-a-4",
        type: "A",
        host: "@",
        value: "198.49.23.145",
        purpose: "Squarespace redundant A record 4.",
        category: "Website routing",
      },
      {
        id: "sq-cname-www",
        type: "CNAME",
        host: "www",
        value: "ext-cust.squarespace.com",
        purpose: "Squarespace www routing target.",
        category: "Website routing",
      },
      {
        id: "sq-cname-verify",
        type: "CNAME",
        host: "(Unique 6-character code from Squarespace Settings)",
        value: "verify.squarespace.com",
        purpose: "Squarespace unique domain ownership verification record.",
        category: "Verification",
      },
    ],
  },
  {
    id: "shopify",
    name: "Shopify Store",
    records: [
      {
        id: "shop-a-1",
        type: "A",
        host: "@",
        value: "23.227.38.65",
        purpose: "Shopify official primary IP address for root domain.",
        category: "Website routing",
      },
      {
        id: "shop-cname-www",
        type: "CNAME",
        host: "www",
        value: "shops.myshopify.com",
        purpose: "Directs www traffic through Shopify's global load balancers.",
        category: "Website routing",
      },
    ],
  },
  {
    id: "wix",
    name: "Wix",
    records: [
      {
        id: "wix-a-1",
        type: "A",
        host: "@",
        value: "185.230.63.171 (or IP shown in Wix Domain Manager)",
        purpose: "Points your root domain to Wix servers.",
        category: "Website routing",
      },
      {
        id: "wix-cname-www",
        type: "CNAME",
        host: "www",
        value: "pointing.wixdns.net",
        purpose: "Directs www subdomain traffic to your Wix website.",
        category: "Website routing",
      },
    ],
  },
  {
    id: "siteground_hostinger_wp",
    name: "SiteGround / Hostinger / Managed WordPress",
    records: [
      {
        id: "wp-a-1",
        type: "A",
        host: "@",
        value: "(Copy the Server IP from your SiteGround Site Tools or Hostinger hPanel dashboard)",
        purpose: "Directs all root domain traffic to your dedicated WordPress server instance.",
        category: "Website routing",
      },
      {
        id: "wp-cname-www",
        type: "CNAME",
        host: "www",
        value: "@",
        purpose: "Aliases www traffic directly to your root domain WordPress A record.",
        category: "Website routing",
      },
    ],
  },
  {
    id: "webflow",
    name: "Webflow",
    records: [
      {
        id: "wf-a-1",
        type: "A",
        host: "@",
        value: "75.2.70.75",
        purpose: "Webflow primary AWS/Fastly edge A record.",
        category: "Website routing",
      },
      {
        id: "wf-a-2",
        type: "A",
        host: "@",
        value: "99.83.190.102",
        purpose: "Webflow secondary edge A record.",
        category: "Website routing",
      },
      {
        id: "wf-cname-www",
        type: "CNAME",
        host: "www",
        value: "proxy-ssl.webflow.com",
        purpose: "Webflow custom domain proxy CNAME.",
        category: "Website routing",
      },
    ],
  },
  {
    id: "carrd",
    name: "Carrd Pro",
    records: [
      {
        id: "carrd-a-1",
        type: "A",
        host: "@",
        value: "162.255.119.248 (or IP provided in Carrd Publish modal)",
        purpose: "Directs root traffic to Carrd's ultra-fast one-page hosting network.",
        category: "Website routing",
      },
      {
        id: "carrd-cname-www",
        type: "CNAME",
        host: "www",
        value: "(Your site name).carrd.co",
        purpose: "Routes www to your published Carrd project.",
        category: "Website routing",
      },
    ],
  },
  {
    id: "neo_site",
    name: "Neo AI One-Page Site",
    records: [
      {
        id: "neo-cname-www",
        type: "CNAME",
        host: "www",
        value: "site.neo.space",
        purpose: "Connects your custom domain www to your Neo AI business website.",
        category: "Website routing",
      },
      {
        id: "neo-a-root",
        type: "A",
        host: "@",
        value: "(Provided in Neo Admin > Site Settings)",
        purpose: "Points root domain to Neo's high-speed cloud site host.",
        category: "Website routing",
      },
    ],
  },
  {
    id: "cloudflare_pages",
    name: "Cloudflare Pages / Vercel",
    records: [
      {
        id: "pages-cname-www",
        type: "CNAME",
        host: "www",
        value: "(your-project).pages.dev (or cname.vercel-dns.com)",
        purpose: "Points www subdomain to your static edge deployment.",
        category: "Website routing",
      },
      {
        id: "pages-cname-root",
        type: "CNAME",
        host: "@",
        value: "(your-project).pages.dev",
        purpose: "CNAME Flattening / ALIAS record on root domain.",
        category: "Website routing",
      },
    ],
  },
];

const TROUBLESHOOTING = [
  {
    q: "My website is not loading",
    a: "Updates to these settings can take time to appear — sometimes minutes, sometimes many hours. Confirm the values match exactly what your provider gave you, then wait before changing anything else.",
  },
  {
    q: "I see a parking page",
    a: "That usually means your address is still pointing at your registrar's default page. Check that the record for the main address was saved, not just the www version.",
  },
  {
    q: "My old website still appears",
    a: "Your browser or network may be remembering the old answer. Try a different device or mobile data before assuming the change failed.",
  },
  {
    q: "My business email stopped working",
    a: "Restore the mail-related records you had before, using your screenshot. Mail records (MX, SPF TXT) are separate from website records and should never be deleted when pointing your domain at a web host.",
  },
  {
    q: "HTTPS is not active",
    a: "Most platforms issue the security certificate automatically once the address points at them correctly. It can take a while after the records are right. Check your platform's domain settings page for status.",
  },
  {
    q: "Verification is failing",
    a: "Verification usually uses a TXT or custom CNAME record. Check for extra spaces, a missing quote, or a host field that your provider auto-completed with your domain name twice.",
  },
  {
    q: "I am unsure which record to change",
    a: "Stop and ask your website provider's support for the exact record type, host and value. Do not guess, and do not delete anything to 'clean up'.",
  },
];

function ConnectDomain() {
  const { state, setDnsPlanning, updateDnsPlanningField } = useStore();
  const [selectedPresetId, setSelectedPresetId] = useState<string>("custom");
  const [added, setAdded] = useState<string[]>([]);

  const domain = state.business.ownedDomain || state.business.preferredDomain || "yourbusiness.com";
  const planning = state.dnsPlanning;

  // Pre-fill from business fields where planning is still default/unsure
  useEffect(() => {
    if (!planning) return;
    const b = state.business;
    const needs = (b.needsBusinessEmail ?? b.usesBusinessEmail ?? "").toString().toLowerCase();
    const existingPresent = (b.existingWebsitePresent ?? b.existingWebsiteStatus ?? "").toString().toLowerCase();
    const hasExact = (b.hasExactProviderRecords ?? "").toString().toLowerCase();
    const screenshot = (b.dnsScreenshotSaved ?? "").toString().toLowerCase();

    // Map business -> planning if planning still at default and business has info
    if (planning.websiteChangeType === "unsure") {
      if (existingPresent === "yes" || existingPresent.includes("improving") || existingPresent.includes("already") || b.websiteChangePlanned === "yes") {
        updateDnsPlanningField("websiteChangeType", "replacing");
      } else if (existingPresent === "no" || b.websiteChangePlanned === "no" || existingPresent.includes("nothing")) {
        updateDnsPlanningField("websiteChangeType", "first");
      }
    }
    if (planning.usesBusinessEmail === "not_sure") {
      if (needs === "yes" || b.businessEmail?.trim()) updateDnsPlanningField("usesBusinessEmail", "yes");
      else if (needs === "no") updateDnsPlanningField("usesBusinessEmail", "no");
    }
    if (!planning.dnsProviderLocation && (b.dnsProvider || b.registrarName || state.ownership.dnsProvider)) {
      updateDnsPlanningField("dnsProviderLocation", b.dnsProvider || b.registrarName || state.ownership.dnsProvider);
    }
    if (planning.screenshotSaved === "unsure") {
      if (screenshot === "yes") updateDnsPlanningField("screenshotSaved", "yes");
      else if (screenshot === "no") updateDnsPlanningField("screenshotSaved", "not_yet");
    }
    if (planning.hasExactRecords === "not_yet") {
      if (hasExact === "yes") updateDnsPlanningField("hasExactRecords", "yes");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const preview = useMemo(() => getDnsImpactPreview(state), [state]);

  const records: RecordRow[] = useMemo(() => {
    const preset =
      WEBSITE_HOST_PRESETS.find((p) => p.id === selectedPresetId) || WEBSITE_HOST_PRESETS[0]!;
    const rows: RecordRow[] = [...preset.records];

    if (planning?.websiteChangeType === "replacing") {
      rows.push({
        id: "redirect",
        type: "Redirect / 301",
        host: "old paths",
        value: "Map each old URL to its corresponding new URL in your host dashboard",
        purpose:
          "Preserves your existing Google SEO rankings and prevents 404 errors after the move.",
        category: "Redirect",
      });
    }
    return rows;
  }, [selectedPresetId, planning?.websiteChangeType]);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to your clipboard.");
    } catch {
      toast.error("We could not copy that just now. Select the text and copy it manually.");
    }
  };

  const providerKnown = (planning?.dnsProviderLocation ?? "").trim().length > 0;

  return (
    <AppShell
      title="Connect your domain to your website"
      description="Your domain is registered. Now tell it where your website lives."
    >
      <div className="space-y-8">
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/20 bg-primary-soft/30 px-3 py-2 text-sm">
          <Link
            to="/online-setup"
            className="inline-flex items-center gap-1.5 font-medium text-primary underline-offset-4 hover:underline"
          >
            View setup map — see how DNS connects your domain, website & email
          </Link>
          <span className="text-xs text-muted-foreground">Context workflow</span>
        </div>
        <Callout tone="warning" title="Read this before you change anything">
          Changes to these settings can affect your website <em>and</em> your business email. If
          your domain already receives email, do not remove mail records unless your email provider
          specifically tells you to.
        </Callout>

        {/* 1. Understand impact — Before you change settings: 5 questions + preview */}
        <section aria-labelledby="step1" className="space-y-4">
          <h2 id="step1" className="font-display text-xl font-bold">
            1. Understand impact — Before you change settings
          </h2>
          <div className="surface-panel space-y-6 p-5 sm:p-6">
            <p className="text-sm text-muted-foreground">
              Answer these 5 questions to understand what is at risk before you change DNS. These are non-secret
              planning facts saved locally (manual checks).
            </p>

            <fieldset>
              <legend className="text-sm font-medium">
                Are you connecting your domain for the first time, replacing an existing website, or unsure? (manual)
              </legend>
              <RadioGroup
                value={planning?.websiteChangeType ?? "unsure"}
                onValueChange={(v) => updateDnsPlanningField("websiteChangeType", v as never)}
                className="mt-3 gap-2 sm:grid-cols-3"
              >
                {[
                  { v: "first", l: "Connecting for the first time" },
                  { v: "replacing", l: "Replacing an existing website" },
                  { v: "unsure", l: "Not sure" },
                ].map((o) => (
                  <Label
                    key={o.v}
                    htmlFor={`change-${o.v}`}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm font-medium",
                      (planning?.websiteChangeType ?? "unsure") === o.v
                        ? "border-primary bg-primary-soft"
                        : "border-border hover:bg-muted",
                    )}
                  >
                    <RadioGroupItem id={`change-${o.v}`} value={o.v} />
                    {o.l}
                  </Label>
                ))}
              </RadioGroup>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-medium">Does business email run on this domain today? (manual)</legend>
              <RadioGroup
                value={planning?.usesBusinessEmail ?? "not_sure"}
                onValueChange={(v) => updateDnsPlanningField("usesBusinessEmail", v as never)}
                className="mt-3 gap-2 sm:grid-cols-3"
              >
                {[
                  { v: "yes", l: "Yes" },
                  { v: "no", l: "No" },
                  { v: "not_sure", l: "Not sure" },
                ].map((o) => (
                  <Label
                    key={o.v}
                    htmlFor={`email-risk-${o.v}`}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm font-medium",
                      (planning?.usesBusinessEmail ?? "not_sure") === o.v
                        ? "border-primary bg-primary-soft"
                        : "border-border hover:bg-muted",
                    )}
                  >
                    <RadioGroupItem id={`email-risk-${o.v}`} value={o.v} />
                    {o.l}
                  </Label>
                ))}
              </RadioGroup>
            </fieldset>

            <div className="space-y-2">
              <Label htmlFor="dns-manager">Where is your DNS managed? (manual)</Label>
              <Input
                id="dns-manager"
                value={planning?.dnsProviderLocation ?? ""}
                onChange={(e) => updateDnsPlanningField("dnsProviderLocation", e.target.value)}
                placeholder="e.g. Cloudflare, Porkbun, Namecheap, GoDaddy — where you manage DNS"
              />
              <p className="text-xs text-muted-foreground">
                Check your registrar or look for “DNS”, “Nameservers” in your domain account (manual check).
              </p>
            </div>

            <fieldset>
              <legend className="text-sm font-medium">Have you saved a screenshot of current settings? (manual)</legend>
              <RadioGroup
                value={planning?.screenshotSaved ?? "unsure"}
                onValueChange={(v) => updateDnsPlanningField("screenshotSaved", v as never)}
                className="mt-3 gap-2 sm:grid-cols-3"
              >
                {[
                  { v: "yes", l: "Yes — saved" },
                  { v: "not_yet", l: "Not yet" },
                  { v: "unsure", l: "Not sure" },
                ].map((o) => (
                  <Label
                    key={o.v}
                    htmlFor={`screen-${o.v}`}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm font-medium",
                      (planning?.screenshotSaved ?? "unsure") === o.v
                        ? "border-primary bg-primary-soft"
                        : "border-border hover:bg-muted",
                    )}
                  >
                    <RadioGroupItem id={`screen-${o.v}`} value={o.v} />
                    {o.l}
                  </Label>
                ))}
              </RadioGroup>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-medium">Do you have the exact records from your website provider? (manual)</legend>
              <RadioGroup
                value={planning?.hasExactRecords ?? "not_yet"}
                onValueChange={(v) => updateDnsPlanningField("hasExactRecords", v as never)}
                className="mt-3 gap-2 sm:grid-cols-3"
              >
                {[
                  { v: "yes", l: "Yes — exact values" },
                  { v: "preset", l: "Only a starting example" },
                  { v: "not_yet", l: "Not yet" },
                ].map((o) => (
                  <Label
                    key={o.v}
                    htmlFor={`exact-${o.v}`}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm font-medium",
                      (planning?.hasExactRecords ?? "not_yet") === o.v
                        ? "border-primary bg-primary-soft"
                        : "border-border hover:bg-muted",
                    )}
                  >
                    <RadioGroupItem id={`exact-${o.v}`} value={o.v} />
                    {o.l}
                  </Label>
                ))}
              </RadioGroup>
            </fieldset>

            {state.business.ownedDomain || state.business.preferredDomain ? (
              <p className="text-xs text-muted-foreground">
                Prefilled from your saved business details — update if anything changed: domain{" "}
                <span className="font-mono">{domain}</span>, email need: {state.business.needsBusinessEmail || state.business.usesBusinessEmail || "unsure"}, existing site: {state.business.existingWebsitePresent || "unsure"} (manual verification required).
              </p>
            ) : null}
          </div>

          <DnsImpactPreviewCard preview={preview} />

          {preview.emailAtRisk ? (
            <Callout tone="warning" title="Protect your email — manual safeguard">
              Website settings and email settings live in the same place but are not interchangeable. Keep your
              mail-related records unless you are intentionally changing email providers. Do not delete mail-related
              records (MX, SPF, DKIM, DMARC) — these settings help your business receive email and prove messages come
              from you.
            </Callout>
          ) : null}
        </section>

        {/* 2. Back up */}
        <section aria-labelledby="step2" className="surface-panel p-5 sm:p-6 space-y-4">
          <h2 id="step2" className="font-display text-xl font-bold">2. Back up — save what you have</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Before changing these settings, take a screenshot of what is already there (manual). Save the current
            records, provider names, and renewal dates. This lets you undo mistakes in a minute.
          </p>
          <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
            <li>Open your DNS manager (see step 3) and screenshot every record — especially MX and TXT (manual).</li>
            <li>Note the domain registrar and expiry date (manual).</li>
          </ul>
          <DnsPreChangeChecklist />
          <p className="text-xs text-muted-foreground">
            Manual checks only — this app does not write or change DNS for you.
          </p>
        </section>

        {/* 3. Confirm provider */}
        <section aria-labelledby="step3" className="surface-panel p-5 sm:p-6 space-y-4">
          <h2 id="step3" className="font-display text-xl font-bold">3. Confirm provider — where DNS is managed</h2>
          <p className="text-sm text-muted-foreground">
            Sign in where your web address is registered
            {planning?.dnsProviderLocation ? ` (${planning.dnsProviderLocation})` : ""}. Look for “DNS”, “Domain settings”, “Manage
            DNS” or “Advanced settings” (manual).
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="provider-confirm">DNS provider / registrar (manual)</Label>
              <Input
                id="provider-confirm"
                value={planning?.dnsProviderLocation ?? ""}
                onChange={(e) => updateDnsPlanningField("dnsProviderLocation", e.target.value)}
                placeholder="e.g. Porkbun, Namecheap, GoDaddy, Cloudflare"
              />
              {!providerKnown ? (
                <p className="text-xs text-warning-foreground">
                  Confirm where DNS is managed before continuing — check your registrar account or nameservers (manual).
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="hostp">Your website platform or host</Label>
              <select
                id="hostp"
                value={selectedPresetId}
                onChange={(e) => setSelectedPresetId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {WEBSITE_HOST_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">Use the exact values your website provider gives you — the preset below is a starting point only.</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            If your domain uses an external DNS host (e.g., Cloudflare), edit records there — not just at the registrar (manual verification).
          </p>
        </section>

        {/* 4. Review website records */}
        <section aria-labelledby="step4" className="surface-panel p-5 sm:p-6 space-y-3">
          <h2 id="step4" className="font-display text-xl font-bold">4. Review website records — what points to your site</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Website routing uses <GlossaryTooltip term="A record">A record</GlossaryTooltip> and{" "}
            <GlossaryTooltip term="CNAME">CNAME</GlossaryTooltip> entries for your root domain and www. Review them
            here before adding — keep anything you do not recognise.
          </p>
          <p className="text-xs font-medium">
            Use these as a starting point only — always use the exact values your website provider gives you.
          </p>
          {preview.existingWebsiteAtRisk ? (
            <Callout tone="warning" title="Existing website at risk">
              You are replacing an existing website. Keep existing A/CNAME records backed up — changing them will
              replace where visitors are sent.
            </Callout>
          ) : null}
        </section>

        {/* 5. Preserve email */}
        <section aria-labelledby="step5" className="surface-panel p-5 sm:p-6 space-y-3">
          <h2 id="step5" className="font-display text-xl font-bold">5. Preserve email — protect mail records</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            These settings help your business receive email and prove messages come from you. Do not delete
            mail-related records (MX, SPF, DKIM, DMARC) unless your email provider specifically tells you to.
          </p>
          {preview.recordsToPreserve.length > 0 ? (
            <ul className="list-disc space-y-1 pl-4 text-sm">
              {preview.recordsToPreserve.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          ) : null}
          <Callout tone="info" title="How to keep email safe (manual)">
            Keep MX, SPF, DKIM and DMARC records separate from website records. Website records are A/CNAME; email
            records are MX/TXT. They live together — do not delete one to add the other. Verify manually in your DNS
            manager.
          </Callout>
          <Button asChild variant="outline" size="sm">
            <Link to="/business-email">Plan business email records →</Link>
          </Button>
        </section>

        {/* 6. Add records */}
        <section aria-labelledby="step6" className="space-y-3">
          <h2 id="step6" className="font-display text-xl font-bold">6. Add records — your settings for {domain}</h2>
          <p className="text-sm text-muted-foreground">
            Use these as a starting point only — always use the exact values your website provider gives you. Each
            record is marked as Website routing, Verification, Email, or Redirect. Manually add each row exactly as
            your provider specified — this app does not change DNS for you.
          </p>

          <div className="surface-panel overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Host / Name</TableHead>
                  <TableHead>Value / Target</TableHead>
                  <TableHead className="hidden lg:table-cell">Purpose</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Done (manual)</TableHead>
                  <TableHead className="text-right">Copy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r) => (
                  <TableRow key={r.id} className={cn(added.includes(r.id) && "bg-success-soft/50")}>
                    <TableCell className="font-medium">{r.type}</TableCell>
                    <TableCell className="font-mono text-sm">{r.host}</TableCell>
                    <TableCell className="max-w-xs font-mono text-sm break-words">{r.value}</TableCell>
                    <TableCell className="hidden max-w-xs text-sm text-muted-foreground lg:table-cell">
                      {r.purpose}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[11px]">
                        {r.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={added.includes(r.id)}
                        onCheckedChange={() =>
                          setAdded((a) => (a.includes(r.id) ? a.filter((x) => x !== r.id) : [...a, r.id]))
                        }
                        aria-label={`Manually confirm I added the ${r.type} record`}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => copy(r.value)}>
                        <Copy className="size-4" aria-hidden="true" />
                        <span className="sr-only">Copy {r.type} value</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-muted-foreground">
            Manual step — copy each value exactly; trailing spaces or duplicated host names cause failures. This app
            does not write DNS records automatically.
          </p>

          <Accordion type="single" collapsible className="surface-panel px-5">
            <AccordionItem value="where">
              <AccordionTrigger className="font-display font-semibold">Where do I add these? (manual)</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                Sign in to the company where your web address is registered
                {planning?.dnsProviderLocation ? ` (${planning.dnsProviderLocation})` : ""}. Look for “DNS”, “Domain settings”, “Manage
                DNS” or “Advanced settings”. You will see a list of existing entries and a button to add a new one.
                Add each row above exactly as written, then save (manual).
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="wrong">
              <AccordionTrigger className="font-display font-semibold">What could go wrong?</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                The most common problems are typing the value with a trailing space, entering the host as your full
                domain when the provider only wants “@”, and deleting an existing mail record. Your screenshot lets you
                undo any of these in a minute (manual verification).
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* 7. Propagation */}
        <section aria-labelledby="step7" className="surface-panel p-5 sm:p-6 space-y-3">
          <h2 id="step7" className="font-display text-xl font-bold">7. Propagation — wait for changes to spread</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Updates to these settings can take time to appear — sometimes minutes, sometimes many hours. Make one
            change at a time where possible and write down what you changed and when (manual).
          </p>
          <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
            <li>Do not keep re-saving — wait at least 15–30 minutes.</li>
            <li>Test on a different device or mobile data to avoid cached results.</li>
            <li>If email stops, restore MX/SPF from your screenshot immediately.</li>
          </ul>
        </section>

        {/* 8. Verify */}
        <section aria-labelledby="step8" className="space-y-3">
          <h2 id="step8" className="font-display text-xl font-bold">
            8. Verify — confirm your site and email still work
          </h2>
          <div className="flex items-center gap-2">
            <Activity className="size-5 text-primary" />
            <p className="text-sm text-muted-foreground">
              Use live DNS propagation check (manual verification) — worldwide resolvers confirm if records are active.
            </p>
          </div>
          <LiveDnsChecker initialDomain={domain} className="border-none shadow-none p-0 bg-transparent" />
          <p className="text-xs text-muted-foreground">
            Verification is manual — compare live results to what your provider gave you. No automatic fix is performed.
          </p>
        </section>

        <section aria-labelledby="trouble">
          <h2 id="trouble" className="font-display text-xl font-bold">Troubleshooting</h2>
          <Accordion type="single" collapsible className="surface-panel mt-4 px-5">
            {TROUBLESHOOTING.map((t) => (
              <AccordionItem key={t.q} value={t.q}>
                <AccordionTrigger className="text-left font-display font-semibold">{t.q}</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{t.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
    </AppShell>
  );
}
