import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Calculator,
  DollarSign,
  TrendingDown,
  AlertTriangle,
  HelpCircle,
  Download,
  Printer,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Layers,
  CreditCard,
  Mail,
  Globe,
  Server,
  Info,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Callout } from "@/components/Callouts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cost-calculator")({
  head: () => ({
    meta: [
      {
        title: "3-Year Website Total Cost of Ownership (TCO) & Budget Calculator",
      },
      {
        name: "description",
        content:
          "Calculate true 1, 2, and 3-year running costs for domains, business email, website platforms, and payment gateways. Avoid promotional price hikes.",
      },
      {
        property: "og:title",
        content: "3-Year Website & Tech Budget Calculator",
      },
      {
        property: "og:description",
        content:
          "Transparent total cost of ownership calculator for small business websites with hidden renewal fee detection.",
      },
    ],
  }),
  component: CostCalculatorPage,
});

// Registrar options and renewal estimates
const REGISTRAR_OPTIONS = [
  {
    id: "porkbun",
    name: "Porkbun / Cloudflare (Wholesale Transparent)",
    yr1: 10.37,
    renewYr: 10.37,
    whoisFee: 0,
    trap: "None. Direct ICANN cost pricing with free WHOIS privacy forever.",
  },
  {
    id: "namecheap",
    name: "Namecheap (Standard Value)",
    yr1: 9.98,
    renewYr: 14.58,
    whoisFee: 0,
    trap: "Introductory promo jumps by ~45% upon Year 2 renewal.",
  },
  {
    id: "godaddy",
    name: "Legacy Registrar (e.g. GoDaddy / Network Solutions)",
    yr1: 1.99,
    renewYr: 24.99,
    whoisFee: 9.99,
    trap: "$1.99 teaser rate jumps to $25/yr + $9.99/yr privacy add-on (Total ~$35/yr).",
  },
  {
    id: "builder_included",
    name: "Included in All-in-One Builder (Squarespace/Wix)",
    yr1: 0,
    renewYr: 20.0,
    whoisFee: 0,
    trap: "Free Year 1 domain tied to active annual website subscription ($20/yr thereafter).",
  },
];

// Email stack options
const EMAIL_OPTIONS = [
  {
    id: "titan",
    name: "Titan Business Email (Professional Value)",
    perUserMonth: 2.0,
    storage: "10GB - 50GB",
    features: "Read receipts, email templates, follow-up reminders, shareable contacts",
    bestFor: "Clean business presence without overpaying for enterprise office suites",
  },
  {
    id: "google",
    name: "Google Workspace Business Starter",
    perUserMonth: 6.0,
    storage: "30GB pooled",
    features: "Gmail interface, Google Drive, Docs, Meet video conferencing",
    bestFor: "Teams requiring collaborative cloud docs and Google Drive storage",
  },
  {
    id: "microsoft",
    name: "Microsoft 365 Business Basic",
    perUserMonth: 6.0,
    storage: "50GB mailbox + 1TB OneDrive",
    features: "Outlook web, Teams, Word/Excel web apps",
    bestFor: "Businesses requiring tight Microsoft Excel/Teams integration",
  },
  {
    id: "forwarding",
    name: "Free Email Forwarding + Personal Gmail",
    perUserMonth: 0.0,
    storage: "Shared with personal inbox",
    features: "Incoming forwards only (Sending as domain requires SMTP config)",
    bestFor: "Solo founders starting at literal $0 budget (higher spam risk)",
  },
];

// Website platform options
const WEBSITE_OPTIONS = [
  {
    id: "squarespace",
    name: "Squarespace Business Plan",
    monthlyBilledAnnual: 23.0,
    monthlyBilledMonthly: 33.0,
    type: "All-in-One Builder",
    maintenanceCost: 0,
    notes: "Hosting, security, templates & SSL included in flat subscription.",
  },
  {
    id: "wix",
    name: "Wix Core / Light Plan",
    monthlyBilledAnnual: 17.0,
    monthlyBilledMonthly: 23.0,
    type: "All-in-One Builder",
    maintenanceCost: 0,
    notes: "Visual drag-and-drop builder with managed cloud hosting & SSL.",
  },
  {
    id: "wordpress_managed",
    name: "Managed WordPress (Hostinger / SiteGround)",
    monthlyBilledAnnual: 4.99,
    monthlyBilledMonthly: 12.99,
    promoMultiplierYr2: 2.6, // Renews at higher rate
    type: "Self-Hosted CMS",
    maintenanceCost: 15.0, // Avg plugins / security maintenance
    notes: "Low intro teaser rate ($4.99/mo) renews at $12.99/mo after Year 1.",
  },
  {
    id: "shopify",
    name: "Shopify Basic (Ecommerce Focus)",
    monthlyBilledAnnual: 29.0,
    monthlyBilledMonthly: 39.0,
    type: "Ecommerce Platform",
    maintenanceCost: 0,
    notes: "Dedicated online store with inventory & cart checkout.",
  },
  {
    id: "static_custom",
    name: "Custom Static / Jamstack (Cloudflare Pages / Vercel)",
    monthlyBilledAnnual: 0.0,
    monthlyBilledMonthly: 0.0,
    type: "Modern Developer Stack",
    maintenanceCost: 0,
    notes: "Zero monthly hosting fees for static landing pages with free SSL.",
  },
];

export function CostCalculatorPage() {
  const { state } = useStore();
  const domain = state.business.ownedDomain || state.business.preferredDomain || "yourbusiness.com";

  // Configuration States
  const [selectedRegistrar, setSelectedRegistrar] = useState("porkbun");
  const [selectedEmail, setSelectedEmail] = useState("titan");
  const [emailSeats, setEmailSeats] = useState(1);
  const [selectedWebsite, setSelectedWebsite] = useState("squarespace");
  const [billingCycle, setBillingCycle] = useState<"annual" | "monthly">("annual");

  // Payment Processing Volume
  const [monthlyRevenue, setMonthlyRevenue] = useState(3000);
  const [onlineCardPercent, setOnlineCardPercent] = useState(60);

  // Calculations
  const calculations = useMemo(() => {
    const reg = REGISTRAR_OPTIONS.find((r) => r.id === selectedRegistrar) || REGISTRAR_OPTIONS[0];
    const em = EMAIL_OPTIONS.find((e) => e.id === selectedEmail) || EMAIL_OPTIONS[0];
    const web = WEBSITE_OPTIONS.find((w) => w.id === selectedWebsite) || WEBSITE_OPTIONS[0];

    // Domain Costs
    const domainYr1 = reg.yr1 + reg.whoisFee;
    const domainYr2 = reg.renewYr + reg.whoisFee;
    const domainYr3 = reg.renewYr + reg.whoisFee;
    const domain3YrTotal = domainYr1 + domainYr2 + domainYr3;

    // Email Costs
    const emailMonthlyTotal = em.perUserMonth * emailSeats;
    const emailYr1 = emailMonthlyTotal * 12;
    const emailYr2 = emailMonthlyTotal * 12;
    const emailYr3 = emailMonthlyTotal * 12;
    const email3YrTotal = emailYr1 + emailYr2 + emailYr3;

    // Website Platform Costs
    const webMonthlyRateYr1 =
      billingCycle === "annual" ? web.monthlyBilledAnnual : web.monthlyBilledMonthly;
    let webMonthlyRateYr2_3 = webMonthlyRateYr1;

    // Handle WordPress / promo hosts that hike after year 1
    if (web.promoMultiplierYr2 && billingCycle === "annual") {
      webMonthlyRateYr2_3 = web.monthlyBilledAnnual * web.promoMultiplierYr2;
    }

    const webYr1 = (webMonthlyRateYr1 + web.maintenanceCost) * 12;
    const webYr2 = (webMonthlyRateYr2_3 + web.maintenanceCost) * 12;
    const webYr3 = (webMonthlyRateYr2_3 + web.maintenanceCost) * 12;
    const web3YrTotal = webYr1 + webYr2 + webYr3;

    // Payment Processing Fees (Stripe standard: 2.9% + $0.30 per transaction, assuming avg $60 transaction)
    const onlineMonthlyVolume = (monthlyRevenue * onlineCardPercent) / 100;
    const avgTicket = 60;
    const txCount = onlineMonthlyVolume > 0 ? onlineMonthlyVolume / avgTicket : 0;
    const monthlyGatewayFee = onlineMonthlyVolume * 0.029 + txCount * 0.3;
    const paymentGatewayYr1 = monthlyGatewayFee * 12;
    const paymentGateway3YrTotal = paymentGatewayYr1 * 3;

    // Yearly Tech Stack Subtotals (Excluding payment processing which scales with revenue)
    const techYr1 = domainYr1 + emailYr1 + webYr1;
    const techYr2 = domainYr2 + emailYr2 + webYr2;
    const techYr3 = domainYr3 + emailYr3 + webYr3;
    const tech3YrTotal = techYr1 + techYr2 + techYr3;
    const techMonthlyAvg = tech3YrTotal / 36;

    // Grand Total including processing
    const grand3YrTotal = tech3YrTotal + paymentGateway3YrTotal;

    // Renewal Shock delta
    const renewalShockPercent = Math.round(((techYr2 - techYr1) / techYr1) * 100);

    return {
      reg,
      em,
      web,
      domainYr1,
      domainYr2,
      domainYr3,
      domain3YrTotal,
      emailYr1,
      emailYr2,
      emailYr3,
      email3YrTotal,
      webYr1,
      webYr2,
      webYr3,
      web3YrTotal,
      techYr1,
      techYr2,
      techYr3,
      tech3YrTotal,
      techMonthlyAvg,
      paymentGatewayYr1,
      paymentGateway3YrTotal,
      grand3YrTotal,
      renewalShockPercent,
    };
  }, [
    selectedRegistrar,
    selectedEmail,
    emailSeats,
    selectedWebsite,
    billingCycle,
    monthlyRevenue,
    onlineCardPercent,
  ]);

  // Export CSV
  const exportBudgetCSV = () => {
    const rows = [
      ["Expense Category", "Year 1 Cost", "Year 2 Cost", "Year 3 Cost", "3-Year Total"],
      [
        "Domain Registration & Privacy",
        calculations.domainYr1.toFixed(2),
        calculations.domainYr2.toFixed(2),
        calculations.domainYr3.toFixed(2),
        calculations.domain3YrTotal.toFixed(2),
      ],
      [
        `Business Email (${emailSeats} seats)`,
        calculations.emailYr1.toFixed(2),
        calculations.emailYr2.toFixed(2),
        calculations.emailYr3.toFixed(2),
        calculations.email3YrTotal.toFixed(2),
      ],
      [
        "Website Hosting & CMS",
        calculations.webYr1.toFixed(2),
        calculations.webYr2.toFixed(2),
        calculations.webYr3.toFixed(2),
        calculations.web3YrTotal.toFixed(2),
      ],
      [
        "Total Core Digital Stack",
        calculations.techYr1.toFixed(2),
        calculations.techYr2.toFixed(2),
        calculations.techYr3.toFixed(2),
        calculations.tech3YrTotal.toFixed(2),
      ],
      [
        "Estimated Payment Processing (2.9% + 30¢)",
        calculations.paymentGatewayYr1.toFixed(2),
        calculations.paymentGatewayYr1.toFixed(2),
        calculations.paymentGatewayYr1.toFixed(2),
        calculations.paymentGateway3YrTotal.toFixed(2),
      ],
      [
        "Grand Total (Stack + Processing)",
        (calculations.techYr1 + calculations.paymentGatewayYr1).toFixed(2),
        (calculations.techYr2 + calculations.paymentGatewayYr1).toFixed(2),
        (calculations.techYr3 + calculations.paymentGatewayYr1).toFixed(2),
        calculations.grand3YrTotal.toFixed(2),
      ],
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `3-year-tech-budget-${domain}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Downloaded 3-Year Tech Budget spreadsheet (CSV)!");
  };

  return (
    <AppShell
      title="3-Year Website Total Cost of Ownership (TCO) Calculator"
      description="Forecast your true ongoing software, domain, email, and hosting costs with zero hidden renewal traps."
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportBudgetCSV} className="text-xs gap-1.5">
            <Download className="size-3.5" /> Export Budget (CSV)
          </Button>
          <Button
            size="sm"
            onClick={() => window.print()}
            className="text-xs gap-1.5 bg-primary text-primary-foreground shadow"
          >
            <Printer className="size-3.5" /> Print / Save PDF
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Executive Overview Card */}
        <div className="surface-panel p-5 sm:p-6 space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                36-Month Budget Forecast
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                3-Year Core Tech Stack:{" "}
                <span className="text-primary">${calculations.tech3YrTotal.toFixed(2)}</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Equivalent to{" "}
                <strong className="text-foreground font-mono">
                  ${calculations.techMonthlyAvg.toFixed(2)}/month
                </strong>{" "}
                all-in for domain, professional email ({emailSeats} mailbox), and hosting.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border bg-card p-3 text-center">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Year 1
                </span>
                <span className="text-base sm:text-lg font-bold text-foreground font-mono">
                  ${calculations.techYr1.toFixed(2)}
                </span>
                <span className="text-[9px] text-muted-foreground block">Upfront / Setup</span>
              </div>
              <div className="rounded-xl border border-border bg-card p-3 text-center">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Year 2
                </span>
                <span className="text-base sm:text-lg font-bold text-foreground font-mono">
                  ${calculations.techYr2.toFixed(2)}
                </span>
                <span className="text-[9px] text-muted-foreground block">Renewal</span>
              </div>
              <div className="rounded-xl border border-border bg-card p-3 text-center">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Year 3
                </span>
                <span className="text-base sm:text-lg font-bold text-foreground font-mono">
                  ${calculations.techYr3.toFixed(2)}
                </span>
                <span className="text-[9px] text-muted-foreground block">Renewal</span>
              </div>
            </div>
          </div>

          {/* Renewal Shock Warning Callout */}
          {calculations.renewalShockPercent > 15 ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 flex items-start gap-3">
              <AlertTriangle className="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="space-y-0.5 text-xs">
                <strong className="text-amber-800 dark:text-amber-300 font-bold block">
                  Renewal Price Shock Warning (+{calculations.renewalShockPercent}% in Year 2)
                </strong>
                <p className="text-muted-foreground">
                  Your selected combination contains promotional introductory pricing that increases
                  significantly after Year 1 ({calculations.reg.trap}). Consider switching to a
                  transparent wholesale registrar or annual billing lock to stabilize your cash
                  flow.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>
                <strong>Predictable Pricing:</strong> Zero hidden renewal traps detected. Your
                year-over-year cost remains stable.
              </span>
            </div>
          )}
        </div>

        {/* 2-Column Calculator Builder */}
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* LEFT COLUMN: Controls & Stack Selection (7 cols) */}
          <div className="space-y-5 lg:col-span-7">
            {/* 1. Domain Registrar */}
            <div className="surface-panel p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded bg-primary text-primary-foreground text-xs font-bold">
                    1
                  </span>
                  <h3 className="font-display text-sm font-bold text-foreground">
                    Domain Registrar & WHOIS Privacy
                  </h3>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  Annual Renewal
                </Badge>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Select Registration Strategy
                </Label>
                <Select value={selectedRegistrar} onValueChange={setSelectedRegistrar}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REGISTRAR_OPTIONS.map((r) => (
                      <SelectItem key={r.id} value={r.id} className="text-xs">
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground italic">
                  💡 {calculations.reg.trap}
                </p>
              </div>
            </div>

            {/* 2. Business Email Stack */}
            <div className="surface-panel p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded bg-primary text-primary-foreground text-xs font-bold">
                    2
                  </span>
                  <h3 className="font-display text-sm font-bold text-foreground">
                    Business Email Hosting
                  </h3>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  Per User / Mo
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Email Service Provider</Label>
                  <Select value={selectedEmail} onValueChange={setSelectedEmail}>
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EMAIL_OPTIONS.map((e) => (
                        <SelectItem key={e.id} value={e.id} className="text-xs">
                          {e.name} (${e.perUserMonth.toFixed(2)}/user/mo)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">
                      Number of Custom Mailboxes:
                    </span>
                    <strong className="text-foreground font-mono">
                      {emailSeats} {emailSeats === 1 ? "seat" : "seats"} ($
                      {(calculations.em.perUserMonth * emailSeats).toFixed(2)}/mo)
                    </strong>
                  </div>
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[emailSeats]}
                    onValueChange={(val) => setEmailSeats(val[0])}
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>1 (Solo owner)</span>
                    <span>5 (Small team)</span>
                    <span>10 (Growing staff)</span>
                  </div>
                </div>

                <div className="rounded-lg bg-muted/40 p-2.5 text-[11px] text-muted-foreground space-y-1">
                  <p>
                    <strong>Storage:</strong> {calculations.em.storage}
                  </p>
                  <p>
                    <strong>Best for:</strong> {calculations.em.bestFor}
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Website Platform & Hosting */}
            <div className="surface-panel p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded bg-primary text-primary-foreground text-xs font-bold">
                    3
                  </span>
                  <h3 className="font-display text-sm font-bold text-foreground">
                    Website Platform & CMS Hosting
                  </h3>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  Cloud Hosted
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Website Platform Architecture
                  </Label>
                  <Select value={selectedWebsite} onValueChange={setSelectedWebsite}>
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WEBSITE_OPTIONS.map((w) => (
                        <SelectItem key={w.id} value={w.id} className="text-xs">
                          {w.name} ({w.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Billing Commitment</Label>
                  <RadioGroup
                    value={billingCycle}
                    onValueChange={(val: "annual" | "monthly") => setBillingCycle(val)}
                    className="grid grid-cols-2 gap-2"
                  >
                    <label
                      htmlFor="cycle-annual"
                      className={cn(
                        "flex items-center justify-between rounded-lg border p-3 cursor-pointer text-xs transition-all",
                        billingCycle === "annual"
                          ? "border-primary bg-primary-soft/20 text-foreground font-bold"
                          : "border-border bg-card text-muted-foreground",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="annual" id="cycle-annual" />
                        <span>Annual (Save 20-30%)</span>
                      </div>
                    </label>

                    <label
                      htmlFor="cycle-monthly"
                      className={cn(
                        "flex items-center justify-between rounded-lg border p-3 cursor-pointer text-xs transition-all",
                        billingCycle === "monthly"
                          ? "border-primary bg-primary-soft/20 text-foreground font-bold"
                          : "border-border bg-card text-muted-foreground",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="monthly" id="cycle-monthly" />
                        <span>Monthly Flexible</span>
                      </div>
                    </label>
                  </RadioGroup>
                </div>

                <p className="text-[11px] text-muted-foreground">💡 {calculations.web.notes}</p>
              </div>
            </div>

            {/* 4. Payment Gateway Volume (Optional / Ecommerce) */}
            <div className="surface-panel p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="size-4 text-primary" />
                  <h3 className="font-display text-sm font-bold text-foreground">
                    Payment Gateway & Transaction Fees (Stripe / Square)
                  </h3>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  2.9% + 30¢
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Estimated Monthly Sales Volume:</span>
                    <strong className="text-foreground font-mono">
                      ${monthlyRevenue.toLocaleString()} / mo
                    </strong>
                  </div>
                  <Slider
                    min={0}
                    max={25000}
                    step={500}
                    value={[monthlyRevenue]}
                    onValueChange={(val) => setMonthlyRevenue(val[0])}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Credit Card Processing Cost:</span>
                  <strong className="text-foreground font-mono">
                    ~${(calculations.paymentGatewayYr1 / 12).toFixed(2)}/mo ($
                    {calculations.paymentGatewayYr1.toFixed(2)}/yr)
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive 3-Year Breakdown Table & Comparison (5 cols) */}
          <div className="space-y-5 lg:col-span-5">
            <div className="surface-panel p-5 sm:p-6 space-y-5 sticky top-6">
              <h3 className="font-display text-lg font-bold text-foreground border-b border-border/80 pb-3 flex items-center justify-between">
                <span>Itemized 3-Year Ledger</span>
                <Badge className="bg-primary text-primary-foreground text-[10px]">36 Months</Badge>
              </h3>

              <div className="space-y-4 text-xs">
                {/* 1. Domain */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">1. Domain ({domain})</span>
                    <span className="font-mono font-bold text-foreground">
                      ${calculations.domain3YrTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>Yr 1: ${calculations.domainYr1.toFixed(2)}</span>
                    <span>Yr 2: ${calculations.domainYr2.toFixed(2)}</span>
                    <span>Yr 3: ${calculations.domainYr3.toFixed(2)}</span>
                  </div>
                </div>

                {/* 2. Business Email */}
                <div className="space-y-1 border-t border-border/50 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">
                      2. Email ({emailSeats} {emailSeats === 1 ? "seat" : "seats"})
                    </span>
                    <span className="font-mono font-bold text-foreground">
                      ${calculations.email3YrTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>Yr 1: ${calculations.emailYr1.toFixed(2)}</span>
                    <span>Yr 2: ${calculations.emailYr2.toFixed(2)}</span>
                    <span>Yr 3: ${calculations.emailYr3.toFixed(2)}</span>
                  </div>
                </div>

                {/* 3. Website Hosting */}
                <div className="space-y-1 border-t border-border/50 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">3. Website Platform</span>
                    <span className="font-mono font-bold text-foreground">
                      ${calculations.web3YrTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>Yr 1: ${calculations.webYr1.toFixed(2)}</span>
                    <span>Yr 2: ${calculations.webYr2.toFixed(2)}</span>
                    <span>Yr 3: ${calculations.webYr3.toFixed(2)}</span>
                  </div>
                </div>

                {/* Subtotal Core Tech */}
                <div className="rounded-xl border border-primary/20 bg-primary-soft/10 p-3.5 space-y-1.5 border-t">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground text-sm">
                      3-Year Core Tech Total
                    </span>
                    <span className="font-mono text-base font-bold text-primary">
                      ${calculations.tech3YrTotal.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Fixed digital infrastructure needed to keep your website, domain, and email
                    alive.
                  </p>
                </div>

                {/* 4. Payment Processing (Variable) */}
                {monthlyRevenue > 0 && (
                  <div className="space-y-1 border-t border-border/50 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-muted-foreground">
                        Est. 3-Yr Merchant Processing
                      </span>
                      <span className="font-mono text-muted-foreground">
                        ${calculations.paymentGateway3YrTotal.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Based on ${(monthlyRevenue * 12).toLocaleString()}/year processed card volume.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <Button asChild className="w-full text-xs font-bold gap-1.5 shadow">
                  <Link to="/platform-matcher">
                    Explore Recommended Platforms <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full text-xs gap-1.5">
                  <Link to="/launch-wizard">Return to Launch Wizard</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
