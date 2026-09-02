import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy, Globe, Search, ShieldCheck, Download, Building2, Server, Route as RouteIcon, Lock } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Callout } from "@/components/Callouts";
import { GlossaryTooltip } from "@/components/GlossaryTooltip";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/domains")({
  head: () => ({
    meta: [
      { title: "Domain finder and domain basics — Launch My Business Online" },
      {
        name: "description",
        content:
          "Generate web address ideas for your business, score them for clarity and memorability, and learn how domains, hosting and DNS fit together.",
      },
      { property: "og:title", content: "Find a web address your customers can remember" },
      {
        property: "og:description",
        content: "Domain name ideas, a plain-English scoring card, and a safety checklist so the address stays yours.",
      },
    ],
  }),
  component: DomainsPage,
});

interface Suggestion {
  domain: string;
  why: string;
  bestFor: string;
  status: "Check availability" | "Likely format" | "Alternative idea";
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 28);

function buildSuggestions(name: string, category: string, city: string): Suggestion[] {
  const base = slug(name);
  if (!base) return [];
  const short = base.length > 14 ? base.slice(0, 14) : base;
  const loc = slug(city.split(",")[0] ?? "");
  const trade = category.toLowerCase().includes("bakery")
    ? "bakery"
    : category.toLowerCase().includes("trades")
      ? "services"
      : category.toLowerCase().includes("salon")
        ? "studio"
        : category.toLowerCase().includes("clinic")
          ? "clinic"
          : category.toLowerCase().includes("retail")
            ? "shop"
            : "co";

  const out: Suggestion[] = [
    {
      domain: `${base}.com`,
      why: "Exact business name. Easiest to say on the phone and print on a card.",
      bestFor: "Any business that already uses this name",
      status: "Check availability",
    },
    {
      domain: `${short}${trade}.com`,
      why: "Adds what you do, which helps people guess your address correctly.",
      bestFor: "Businesses with a common or abstract name",
      status: "Check availability",
    },
  ];
  if (loc)
    out.push({
      domain: `${short}${loc}.com`,
      why: "A location word can help when you serve one town or neighbourhood.",
      bestFor: "Local service businesses",
      status: "Likely format",
    });
  out.push(
    {
      domain: `${base}.co`,
      why: "A shorter alternative if the .com is taken. Still widely recognised.",
      bestFor: "Modern brands comfortable with a shorter ending",
      status: "Alternative idea",
    },
    {
      domain: `get${short}.com`,
      why: "An action word can rescue a taken name without hyphens or numbers.",
      bestFor: "Product or service brands",
      status: "Alternative idea",
    },
    {
      domain: `${short}${trade}.${loc ? "in" : "net"}`,
      why: "A country or general ending, useful when you mainly serve one market.",
      bestFor: "Businesses serving a single country",
      status: "Alternative idea",
    },
  );
  return out;
}

function scoreDomain(domain: string, city: string) {
  const name = domain.split(".")[0] ?? "";
  const len = name.length;
  const hasHyphenOrNumber = /[-0-9]/.test(name);
  const loc = slug(city.split(",")[0] ?? "");
  const clarity = Math.max(2, Math.min(10, 12 - Math.floor(len / 3)));
  const memorability = Math.max(2, Math.min(10, 11 - Math.floor(len / 3) - (hasHyphenOrNumber ? 3 : 0)));
  const spelling = hasHyphenOrNumber ? 4 : /(ph|kn|qu|xx|zz)/.test(name) ? 6 : 9;
  const local = loc && name.includes(loc) ? 9 : 5;
  const flexibility = /shop|store|cakes|plumb/.test(name) ? 5 : 8;
  const confusion = hasHyphenOrNumber ? 4 : len > 20 ? 5 : 9;
  return [
    { label: "Clarity", value: clarity, hint: "Can someone guess what your business does or is called?" },
    { label: "Memorability", value: memorability, hint: "Will a customer still remember it tomorrow?" },
    { label: "Ease of spelling", value: spelling, hint: "Can you say it once on the phone and be typed correctly?" },
    { label: "Local relevance", value: local, hint: "Does it signal the area you serve, when that helps?" },
    { label: "Brand flexibility", value: flexibility, hint: "Will it still fit if you add services later?" },
    { label: "Low confusion risk", value: confusion, hint: "Is it easy to mix up with another business or spelling?" },
  ];
}

const BASICS = [
  { icon: Globe, term: "Domain", text: "Your web address, like yourbusiness.com." },
  { icon: Building2, term: "Website", text: "The pages visitors actually see and read." },
  { icon: Server, term: "Hosting", text: "The service that stores your site and delivers it." },
  { icon: RouteIcon, term: "DNS", text: "The settings that direct your address to the right services." },
  { icon: ShieldCheck, term: "Registrar", text: "The company where you register and renew your address." },
  { icon: Lock, term: "HTTPS", text: "The padlock that protects the connection to your site." },
];

const SAFETY = [
  "Register the domain in an account you personally or jointly control",
  "Use a business-controlled email address on the account",
  "Turn on two-step sign-in (2FA)",
  "Add a backup recovery method",
  "Turn on renewal reminders or auto-renewal",
  "Record the registrar, renewal date, login owner and recovery email",
  "Keep a second trusted owner or administrator with documented access",
  "Never share passwords through unsecured messages",
  "Review who has access before engaging a contractor",
];

function DomainsPage() {
  const { state, setBusiness, setOwnership } = useStore();
  const b = state.business;
  const [query, setQuery] = useState(b.businessName);
  const [submitted, setSubmitted] = useState(b.businessName);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState<string[]>([]);
  const [scoreInput, setScoreInput] = useState(b.businessName ? `${slug(b.businessName)}.com` : "");

  const suggestions = useMemo(
    () => buildSuggestions(submitted, b.category, b.location),
    [submitted, b.category, b.location],
  );
  const scores = useMemo(() => scoreDomain(scoreInput, b.location), [scoreInput, b.location]);

  const runSearch = () => {
    if (!query.trim()) {
      toast.error("Enter your business name or idea to see suggestions.");
      return;
    }
    setLoading(true);
    window.setTimeout(() => {
      setSubmitted(query);
      setScoreInput(`${slug(query)}.com`);
      setLoading(false);
    }, 700);
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Copied ${text}`);
    } catch {
      toast.error("We could not copy that just now. You can select and copy it manually.");
    }
  };

  return (
    <AppShell
      title="Your web address"
      description="Find a name customers can remember — and keep it in your own name."
    >
      <Tabs defaultValue="find" className="space-y-6">
        <TabsList>
          <TabsTrigger value="find">Find a domain</TabsTrigger>
          <TabsTrigger value="own">I already own a domain</TabsTrigger>
        </TabsList>

        <TabsContent value="find" className="space-y-8">
          <section className="surface-panel p-5 sm:p-6">
            <Label htmlFor="domain-query" className="text-base">
              What is your business name or idea?
            </Label>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Input
                id="domain-query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runSearch()}
                placeholder="Harbor & Hearth Bakery"
              />
              <Button onClick={runSearch}>
                <Search className="size-4" aria-hidden="true" />
                Show ideas
              </Button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              We suggest formats only. Availability and pricing are confirmed by a{" "}
              <GlossaryTooltip term="Registrar" />, not here.
            </p>
          </section>

          <Callout tone="warning" title="Check you are entitled to the name">
            Before registering, make sure using this name does not conflict with another business or trademark
            in your country. We cannot check that for you.
          </Callout>

          <section aria-labelledby="ideas">
            <h2 id="ideas" className="font-display text-xl font-bold">
              Domain ideas
            </h2>
            {loading ? (
              <div className="mt-4 space-y-3">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 rounded-xl" />
                ))}
              </div>
            ) : suggestions.length ? (
              <div className="surface-panel mt-4 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Domain idea</TableHead>
                      <TableHead className="hidden md:table-cell">Why it works</TableHead>
                      <TableHead className="hidden lg:table-cell">Best for</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suggestions.map((s) => (
                      <TableRow key={s.domain}>
                        <TableCell className="font-medium">{s.domain}</TableCell>
                        <TableCell className="hidden max-w-xs text-sm text-muted-foreground md:table-cell">
                          {s.why}
                        </TableCell>
                        <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                          {s.bestFor}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{s.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <Button size="sm" variant="ghost" onClick={() => copy(s.domain)}>
                            <Copy className="size-4" aria-hidden="true" />
                            <span className="sr-only sm:not-sr-only">Copy</span>
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setScoreInput(s.domain)}>
                            Score it
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="mt-4">
                <EmptyState
                  icon={Search}
                  title="No results yet"
                  description="Try a shorter business name or add your category in Settings so we can tailor the ideas."
                />
              </div>
            )}
          </section>

          <section aria-labelledby="score" className="surface-panel p-5 sm:p-6">
            <h2 id="score" className="font-display text-xl font-bold">
              Domain name score
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              A guide, not a verdict. Hover any label for a plain-English explanation.
            </p>
            <div className="mt-4 max-w-sm">
              <Label htmlFor="score-input">Domain to score</Label>
              <Input
                id="score-input"
                className="mt-1.5"
                value={scoreInput}
                onChange={(e) => setScoreInput(e.target.value)}
                placeholder="yourbusiness.com"
              />
            </div>
            <TooltipProvider delayDuration={150}>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {scores.map((s) => (
                  <li key={s.label}>
                    <div className="flex items-center justify-between text-sm">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="cursor-help font-medium underline decoration-dotted underline-offset-4"
                          >
                            {s.label}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">{s.hint}</TooltipContent>
                      </Tooltip>
                      <span className="font-semibold">{s.value}/10</span>
                    </div>
                    <Progress value={s.value * 10} className="mt-1.5" aria-label={`${s.label} ${s.value} out of 10`} />
                  </li>
                ))}
              </ul>
            </TooltipProvider>
          </section>

          <section aria-labelledby="basics">
            <h2 id="basics" className="font-display text-xl font-bold">
              The six words worth knowing
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {BASICS.map((c) => (
                <div key={c.term} className="surface-panel p-5">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <c.icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-3 font-display text-base font-semibold">{c.term}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{c.text}</p>
                </div>
              ))}
            </div>
            <Callout tone="info" title="A simple way to picture it" className="mt-4">
              Your domain is your street address. Hosting is the building. DNS is the directory that tells
              visitors where to go.
            </Callout>
          </section>

          <section aria-labelledby="safety" className="surface-panel p-5 sm:p-6">
            <h2 id="safety" className="font-display text-xl font-bold">
              Domain safety checklist
            </h2>
            <ul className="mt-4 space-y-2.5">
              {SAFETY.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Checkbox
                    id={`safety-${item}`}
                    checked={checked.includes(item)}
                    onCheckedChange={() =>
                      setChecked((c) => (c.includes(item) ? c.filter((x) => x !== item) : [...c, item]))
                    }
                    className="mt-0.5"
                  />
                  <Label htmlFor={`safety-${item}`} className="text-sm font-normal">
                    {item}
                  </Label>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              {checked.length} of {SAFETY.length} complete. Keep this account in your control — it is part of
              your business infrastructure.
            </p>
          </section>

          <OwnershipRecordCard />
        </TabsContent>

        <TabsContent value="own" className="space-y-6">
          <Callout tone="info" title="Good news — the hardest purchase decision is behind you">
            The focus now is confirming you control the account, protecting it, and pointing it at your new
            website without breaking email.
          </Callout>
          <section className="surface-panel space-y-5 p-5 sm:p-6">
            <div className="space-y-2">
              <Label htmlFor="owned">Your web address</Label>
              <Input
                id="owned"
                value={b.ownedDomain}
                onChange={(e) => setBusiness({ ownedDomain: e.target.value })}
                placeholder="yourbusiness.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg">Where did you buy it?</Label>
              <Input
                id="reg"
                value={b.registrarName}
                onChange={(e) => {
                  setBusiness({ registrarName: e.target.value });
                  setOwnership({ domainRegistrar: e.target.value });
                }}
                placeholder="The company you pay each year"
              />
            </div>
            <Button
              onClick={() => toast.success("Saved to your plan.")}
              disabled={!b.ownedDomain.trim()}
            >
              Save domain details
            </Button>
          </section>
          <OwnershipRecordCard />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function OwnershipRecordCard() {
  const { state, setOwnership } = useStore();
  const o = state.ownership;
  const fields: [keyof typeof o, string][] = [
    ["domainRegistrar", "Domain registrar"],
    ["renewalDate", "Domain renewal date"],
    ["dnsProvider", "DNS provider"],
    ["websitePlatform", "Website platform / hosting"],
    ["emailProvider", "Email provider"],
    ["analyticsAccount", "Analytics account"],
    ["paymentProcessor", "Payment processor"],
    ["socialOwners", "Social-media account owners"],
    ["recoveryOwner", "Login / recovery owner"],
  ];

  return (
    <section aria-labelledby="record" className="surface-panel p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="record" className="font-display text-xl font-bold">
            Business digital ownership record
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Never store passwords or recovery codes here. Record who owns what, not how to get in.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            window.print();
            toast.success("Opening a print-friendly copy.");
          }}
        >
          <Download className="size-4" aria-hidden="true" />
          Print / save as PDF
        </Button>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {fields.map(([key, label]) => (
          <div key={key} className="space-y-1.5">
            <Label htmlFor={`own-${key}`}>{label}</Label>
            <Input
              id={`own-${key}`}
              value={o[key]}
              onChange={(e) => setOwnership({ [key]: e.target.value } as never)}
              placeholder="—"
            />
          </div>
        ))}
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="own-notes">Notes</Label>
          <Textarea
            id="own-notes"
            rows={3}
            value={o.notes}
            onChange={(e) => setOwnership({ notes: e.target.value })}
            placeholder="Who to contact, where the record is stored, and when it was last reviewed."
          />
        </div>
      </div>
      <Button className="mt-4" onClick={() => toast.success("Ownership record saved.")}>
        Save record
      </Button>
    </section>
  );
}
