import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Link2,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Search,
  TrendingUp,
  ShieldCheck,
  Mail,
  Star,
  Wrench,
  FileText,
  BarChart3,
  Globe,
  Smartphone,
  MousePointer2,
  Info,
  Download,
  Lightbulb,
  Network,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Callout } from "@/components/Callouts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/growth-toolkit")({
  head: () => ({
    meta: [
      { title: "Growth Toolkit — UTM Builder, Health Checks & SEO Handrails" },
      {
        name: "description",
        content:
          "UTM campaign link builder, repeatable health checklists, SEO and conversion handrails, provider shortcuts and related internal actions for steady growth.",
      },
      { property: "og:title", content: "Growth Toolkit — Keep Your Site Growing" },
      {
        property: "og:description",
        content:
          "Build trackable links, run repeatable health checks, follow SEO handrails and jump to the right Cornerstone tools.",
      },
    ],
  }),
  component: GrowthToolkit,
});

function buildUtmUrl(
  base: string,
  source: string,
  medium: string,
  campaign: string,
  content: string,
  term: string,
) {
  if (!base.trim()) return "";
  let url: URL;
  try {
    const withProto = base.match(/^https?:\/\//) ? base : `https://${base.trim()}`;
    url = new URL(withProto);
  } catch {
    return "";
  }
  if (source.trim()) url.searchParams.set("utm_source", source.trim().toLowerCase().replace(/\s+/g, "_"));
  if (medium.trim()) url.searchParams.set("utm_medium", medium.trim().toLowerCase().replace(/\s+/g, "_"));
  if (campaign.trim()) url.searchParams.set("utm_campaign", campaign.trim().toLowerCase().replace(/\s+/g, "_"));
  if (content.trim()) url.searchParams.set("utm_content", content.trim().toLowerCase().replace(/\s+/g, "_"));
  if (term.trim()) url.searchParams.set("utm_term", term.trim().toLowerCase().replace(/\s+/g, "_"));
  return url.toString();
}

const HEALTH_CHECKLISTS: {
  id: string;
  cadence: "weekly" | "monthly" | "quarterly";
  title: string;
  items: { id: string; label: string; why: string }[];
}[] = [
  {
    id: "weekly",
    cadence: "weekly",
    title: "Weekly — 10 minutes",
    items: [
      { id: "w1", label: "Check enquiries reached your inbox/phone", why: "A silent broken form loses customers every day." },
      { id: "w2", label: "Scan homepage on your phone for cut-off text & buttons", why: "Most local visitors are on mobile." },
      { id: "w3", label: "Reply to new Google reviews & messages", why: "Recent replies boost trust and local ranking." },
    ],
  },
  {
    id: "monthly",
    cadence: "monthly",
    title: "Monthly — 30 minutes",
    items: [
      { id: "m1", label: "Update hours, prices & seasonal offers", why: "Stale details cost trust instantly." },
      { id: "m2", label: "Test contact/booking form end-to-end", why: "Confirm notifications still arrive to the right inbox." },
      { id: "m3", label: "Review analytics: top pages & traffic sources", why: "See what content earns attention; do more of it." },
      { id: "m4", label: "Check for broken links & images with alt text", why: "Broken links hurt SEO and accessibility." },
    ],
  },
  {
    id: "quarterly",
    cadence: "quarterly",
    title: "Quarterly — 60 minutes",
    items: [
      { id: "q1", label: "Refresh hero photo & 1-2 testimonials", why: "Fresh proof keeps conversion rates healthy." },
      { id: "q2", label: "Review who has access to domain, hosting & email", why: "Remove ex-staff/agency access before it becomes a lockout." },
      { id: "q3", label: "Run a full customer-journey test (phone + form + booking)", why: "Catches friction before customers do." },
      { id: "q4", label: "Audit page titles & descriptions for clarity", why: "Clear titles win clicks in search results." },
    ],
  },
];

const SEO_HANDRAILS = [
  { title: "One clear title per page (50–60 chars)", detail: "Include what you do + where: 'Emergency plumber in Austin — Miller Plumbing'. Avoid stuffing keywords; write for humans first.", check: "Every page has a unique, plain-English title." },
  { title: "Meta description that earns the click", detail: "1–2 sentences of what the page offers and the next step. Not a ranking trick — it improves click-through.", check: "Each page has a readable description." },
  { title: "Headings in order (H1 → H2 → H3)", detail: "One H1 per page, descriptive H2s. Search engines and screen readers rely on hierarchy.", check: "No skipped levels or multiple H1s." },
  { title: "Images have useful alt text", detail: "Describe what’s visible + context. 'Sourdough loaf on Harbor & Hearth counter, Portland' — not 'IMG_1234.jpg'.", check: "All meaningful images have alt text." },
  { title: "Internal links to the next step", detail: "Every page links to Contact/Booking — don’t make visitors hunt for how to reach you.", check: "CTA reachable within one tap." },
];

const CONVERSION_HANDRAILS = [
  { title: "One primary CTA per page", detail: "Verb-first button: 'Call (555) 0134' or 'Book a tasting'. Extra buttons dilute decisions.", check: "Primary CTA is single and visually dominant." },
  { title: "Tap-to-call & WhatsApp on mobile", detail: "Phone number is tappable (tel:) and sticky if possible. 60%+ of local actions are calls.", check: "Can you call/WhatsApp in one tap?" },
  { title: "Short proof near the CTA", detail: "2–3 words of credibility right by button: '4.9★ Google · 400+ reviews'. Removes last-second doubt.", check: "Social proof visible near conversion point." },
  { title: "Form friction ≤ 4 fields", detail: "Name, phone/email, message is often enough. Every extra field drops completions.", check: "Form has essential fields only?" },
  { title: "Response promise with timeframe", detail: "'We reply within 1 business day' beats silence. Sets expectation and builds trust.", check: "Reply time stated near form/phone?" },
];

const PROVIDER_SHORTCUTS = [
  { label: "Google Search Console", href: "https://search.google.com/search-console", desc: "See how Google finds & indexes your pages.", icon: Search },
  { label: "Google Analytics", href: "https://analytics.google.com", desc: "Traffic, sources & which pages convert.", icon: BarChart3 },
  { label: "Google Business Profile", href: "https://business.google.com", desc: "Hours, photos & reviews that show on Maps.", icon: Globe },
  { label: "Bing Places", href: "https://www.bingplaces.com", desc: "Microsoft’s local listing — same NAP as Google.", icon: Globe },
  { label: "Cloudflare / Domain Registrar", href: "https://dash.cloudflare.com", desc: "DNS & renewal home — confirm auto-renew is on.", icon: Network },
  { label: "PageSpeed Insights", href: "https://pagespeed.web.dev", desc: "Check load speed & mobile tap targets.", icon: Smartphone },
];

const RELATED_ACTIONS = [
  { to: "/get-found", label: "Get found — local SEO basics", desc: "Listing, titles & review habits", icon: Search },
  { to: "/review-kit", label: "Google Review Request Kit", desc: "QR stand, pocket card & SMS/email templates", icon: Star },
  { to: "/email-signature", label: "Branded Email Signature", desc: "Tap-to-call + review link for every email", icon: Mail },
  { to: "/maintenance", label: "Maintenance Center", desc: "Weekly / monthly / quarterly reminders", icon: Wrench },
  { to: "/content", label: "Content Builder", desc: "Draft page copy & alt text", icon: FileText },
  { to: "/customer-journey", label: "Customer Journey Test", desc: "Verify call/form/booking on a real phone", icon: Smartphone },
];

function GrowthToolkit() {
  const { state } = useStore();
  const b = state.business;
  const defaultWebsite = b.websiteUrl || (b.ownedDomain ? `https://${b.ownedDomain}` : b.preferredDomain ? `https://${b.preferredDomain}` : "https://example.com");

  const [websiteUrl, setWebsiteUrl] = useState(defaultWebsite);
  const [source, setSource] = useState("instagram");
  const [medium, setMedium] = useState("social");
  const [campaign, setCampaign] = useState("spring_offer");
  const [content, setContent] = useState("");
  const [term, setTerm] = useState("");
  const [copiedUtm, setCopiedUtm] = useState(false);
  const [checkState, setCheckState] = useState<Record<string, boolean>>({});

  const utmUrl = useMemo(() => buildUtmUrl(websiteUrl, source, medium, campaign, content, term), [websiteUrl, source, medium, campaign, content, term]);

  const hasRequired = source.trim() && medium.trim() && campaign.trim() && websiteUrl.trim() && !!utmUrl;
  const missingFields = !source.trim() || !medium.trim() || !campaign.trim();

  const toggleCheck = (id: string) => setCheckState((p) => ({ ...p, [id]: !p[id] }));

  const copyUtm = async () => {
    if (!utmUrl) return;
    await navigator.clipboard.writeText(utmUrl);
    setCopiedUtm(true);
    setTimeout(() => setCopiedUtm(false), 2000);
    toast.success("Copied UTM link — paste into your post, email or QR!");
  };

  const copyPlain = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard!`);
  };

  return (
    <AppShell
      title="Growth Toolkit"
      description="Trackable links, repeatable checklists and practical handrails — without hype or guesswork."
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="text-xs gap-1.5">
            <Link to="/maintenance">
              <Wrench className="size-3.5" /> Maintenance →
            </Link>
          </Button>
          <Button size="sm" asChild className="text-xs gap-1.5 bg-primary text-primary-foreground shadow">
            <Link to="/get-found">
              <Search className="size-3.5" /> Get Found Guide
            </Link>
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <Callout tone="info" title="Grow steadily — measure what matters">
          Paid hype fades. The habits that compound are: a trackable link for every campaign, a short health check you actually run, and page handrails that prevent small errors from losing enquiries.
        </Callout>

        <section className="surface-panel p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Link2 className="size-3.5" /> UTM Campaign Link Builder
              </span>
              <h2 className="font-display text-lg font-bold text-foreground">Build a trackable link for any campaign</h2>
              <p className="text-xs text-muted-foreground max-w-2xl">
                UTM parameters are tiny tags added to a URL so analytics can tell you <em>where</em> a visitor came from — e.g. “Instagram bio spring offer” vs “Google ad”. Paste the tagged link wherever you share it.
              </p>
            </div>
            <Badge variant="outline" className="text-[10px]">Plain-English • No sign-up</Badge>
          </div>

          <div className="grid gap-4 lg:grid-cols-12">
            <div className="space-y-3 lg:col-span-6">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Website URL *</Label>
                <Input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://yourbusiness.com/offers" className="text-xs font-mono h-9" />
                <p className="text-[11px] text-muted-foreground">Start with your page link — e.g. homepage, booking page or offer page.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Source *</Label>
                  <Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="google, instagram, newsletter" className="text-xs h-9" />
                  <p className="text-[11px] text-muted-foreground">Where the click came from.</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Medium *</Label>
                  <Input value={medium} onChange={(e) => setMedium(e.target.value)} placeholder="cpc, social, email, qr" className="text-xs h-9" />
                  <p className="text-[11px] text-muted-foreground">The channel type.</p>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Campaign *</Label>
                <Input value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="spring_offer, launch_2026" className="text-xs h-9" />
                <p className="text-[11px] text-muted-foreground">Your campaign name — keep it short, lowercase with underscores.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Content <span className="font-normal text-muted-foreground">(optional)</span></Label>
                  <Input value={content} onChange={(e) => setContent(e.target.value)} placeholder="header_banner, qr_counter" className="text-xs h-9" />
                  <p className="text-[11px] text-muted-foreground">Which variant or placement.</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Term <span className="font-normal text-muted-foreground">(optional)</span></Label>
                  <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="running_shoes, plumber_austin" className="text-xs h-9" />
                  <p className="text-[11px] text-muted-foreground">Paid keyword (search ads) — leave blank otherwise.</p>
                </div>
              </div>

              {missingFields ? (
                <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Info className="size-3.5" /> Source, medium and campaign are required — they appear in every analytics report.
                </p>
              ) : null}
            </div>

            <div className="space-y-3 lg:col-span-6">
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">Your tagged URL</span>
                  <Badge variant="outline" className={cn("text-[10px]", hasRequired ? "border-success/40 bg-success-soft text-success" : "border-amber-500/30 bg-amber-500/10")}>{hasRequired ? "Ready to share" : "Add source/medium/campaign"}</Badge>
                </div>

                <div className="rounded-lg bg-muted/60 border border-border p-3 font-mono text-xs break-all min-h-[56px] flex items-center">
                  {utmUrl ? <span data-testid="utm-result">{utmUrl}</span> : <span className="text-muted-foreground">Enter a valid website URL + required UTM fields…</span>}
                </div>

                <div className="flex gap-2">
                  <Button size="sm" onClick={copyUtm} disabled={!hasRequired} className="text-xs gap-1.5 flex-1">
                    {copiedUtm ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    {copiedUtm ? "Copied!" : "Copy tagged link"}
                  </Button>
                  <Button size="sm" variant="outline" disabled={!hasRequired} onClick={() => copyPlain(utmUrl, "UTM link")} className="text-xs gap-1.5">
                    <Copy className="size-3.5" /> Copy plain
                  </Button>
                </div>

                <div className="rounded-lg bg-primary-soft/20 border border-primary/15 p-3 space-y-1.5">
                  <p className="text-xs font-semibold text-foreground flex items-center gap-1.5"><Lightbulb className="size-3.5 text-primary" /> Plain explanation</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    UTM = “Urchin Tracking Module” — just five optional labels you append to a URL with <code className="font-mono bg-muted px-1 rounded">?utm_source=…</code>. Your analytics (Google Analytics, Plausible, etc.) reads them and groups visits as “source / medium / campaign” so you know which flyer, QR or post actually drove bookings — not by guessing, by data.
                  </p>
                  <ul className="text-[11px] text-muted-foreground space-y-1 list-disc pl-4">
                    <li><strong className="text-foreground">utm_source</strong> = the site/app (e.g. instagram, google, newsletter)</li>
                    <li><strong className="text-foreground">utm_medium</strong> = channel type (social, email, cpc, qr)</li>
                    <li><strong className="text-foreground">utm_campaign</strong> = your campaign name (spring_offer)</li>
                    <li><strong className="text-foreground">utm_content</strong> = optional variant (banner_a vs flyer)</li>
                    <li><strong className="text-foreground">utm_term</strong> = optional paid keyword</li>
                  </ul>
                  <p className="text-[11px] text-muted-foreground">Tip: keep them lowercase, no spaces — use <code className="font-mono">_</code> instead of spaces. Same link without tags = “Direct” traffic (untracked).</p>
                </div>
              </div>

              <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 space-y-2">
                <p className="text-xs font-semibold text-foreground">Example workflow</p>
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal pl-4">
                  <li>Build the link above (e.g. source=instagram, medium=social, campaign=spring_offer).</li>
                  <li>Paste it into your Instagram bio, QR poster or WhatsApp broadcast.</li>
                  <li>In analytics, filter by campaign = spring_offer to see visits & conversions from that post alone.</li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        <section className="surface-panel p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Repeatable Health Checklists</span>
              <h2 className="font-display text-lg font-bold text-foreground">Small habits that prevent silent failures</h2>
              <p className="text-xs text-muted-foreground">Tick them off each cycle. State stays in this browser — export from Maintenance when you need it.</p>
            </div>
            <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => { setCheckState({}); toast.success("Checklists reset for this session."); }}>
              <Wrench className="size-3.5" /> Reset checks
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {HEALTH_CHECKLISTS.map((group) => (
              <div key={group.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div>
                  <Badge variant="outline" className="text-[10px]">{group.cadence}</Badge>
                  <h3 className="mt-2 font-semibold text-sm text-foreground">{group.title}</h3>
                </div>
                <ul className="space-y-2.5">
                  {group.items.map((item) => (
                    <li key={item.id} className="flex gap-2.5 text-xs">
                      <Checkbox id={`hc-${item.id}`} checked={!!checkState[item.id]} onCheckedChange={() => toggleCheck(item.id)} className="mt-0.5" />
                      <label htmlFor={`hc-${item.id}`} className={cn("flex-1 leading-relaxed cursor-pointer", checkState[item.id] && "line-through opacity-70")}>
                        <span className="font-medium text-foreground">{item.label}</span>
                        <span className="block text-[11px] text-muted-foreground">{item.why}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm" className="text-xs">
              <Link to="/maintenance">Open full Maintenance center →</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link to="/customer-journey">Run customer-journey test →</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="surface-panel p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Search className="size-4 text-primary" />
              <h2 className="font-display text-sm font-bold text-foreground">SEO handrails — be findable</h2>
            </div>
            <p className="text-xs text-muted-foreground">Guardrails, not tricks. Each card is a quick check before you publish or edit.</p>
            <ul className="space-y-3">
              {SEO_HANDRAILS.map((h) => (
                <li key={h.title} className="rounded-lg border border-border/70 bg-card p-3 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-foreground">{h.title}</span>
                    <ShieldCheck className="size-3.5 text-success shrink-0 mt-0.5" />
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{h.detail}</p>
                  <p className="text-[11px] font-medium text-primary flex items-center gap-1"><Check className="size-3" /> {h.check}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="surface-panel p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2">
              <MousePointer2 className="size-4 text-primary" />
              <h2 className="font-display text-sm font-bold text-foreground">Conversion handrails — turn visits into enquiries</h2>
            </div>
            <p className="text-xs text-muted-foreground">The smallest fixes near the action button often beat redesigns.</p>
            <ul className="space-y-3">
              {CONVERSION_HANDRAILS.map((h) => (
                <li key={h.title} className="rounded-lg border border-border/70 bg-card p-3 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-foreground">{h.title}</span>
                    <TrendingUp className="size-3.5 text-primary shrink-0 mt-0.5" />
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{h.detail}</p>
                  <p className="text-[11px] font-medium text-primary flex items-center gap-1"><Check className="size-3" /> {h.check}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="surface-panel p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <Network className="size-4 text-primary" /> Provider shortcuts
            </h2>
            <Badge variant="outline" className="text-[10px]">External — opens in new tab</Badge>
          </div>
          <p className="text-xs text-muted-foreground">Jump straight to where the setting lives. No affiliate links — just the provider.</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PROVIDER_SHORTCUTS.map((p) => {
              const Icon = p.icon;
              return (
                <a key={p.label} href={p.href} target="_blank" rel="noreferrer" className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:bg-muted/30 transition-colors">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <Icon className="size-4.5" />
                  </span>
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-foreground flex items-center gap-1">{p.label} <ExternalLink className="size-3 text-muted-foreground" /></span>
                    <span className="text-xs text-muted-foreground leading-relaxed">{p.desc}</span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        <section className="surface-panel p-5 sm:p-6 space-y-3">
          <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
            <Sparkles className="size-4 text-primary" /> Related internal actions
          </h2>
          <p className="text-xs text-muted-foreground">Continue in Cornerstone — every link stays inside your plan and pre-fills from Business profile where possible.</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {RELATED_ACTIONS.map((a) => {
              const Icon = a.icon;
              return (
                <Link key={a.to} to={a.to as never} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:bg-muted/30 transition-colors">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                    <Icon className="size-4.5" />
                  </span>
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-foreground">{a.label}</span>
                    <span className="block text-xs text-muted-foreground leading-relaxed">{a.desc}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
