import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import {
  Download,
  Printer,
  FileSpreadsheet,
  FileCode,
  Copy,
  Upload,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Award,
  Sparkles,
  ExternalLink,
  Info,
  Calendar,
  Eye,
  FileText,
  HardDrive,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { OwnershipWarningCard } from "@/components/Callouts";
import { SafetyWarningBanner } from "@/components/ContentPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store";
import type { OwnershipRecord } from "@/lib/types";
import { getOwnershipHealth } from "@/lib/ownership";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ownership-record")({
  head: () => ({
    meta: [
      { title: "Digital Asset Ownership Ledger & Deed — Protect Your Business Assets" },
      {
        name: "description",
        content:
          "Export a formal Digital Asset Ownership Ledger and Deed (PDF, CSV, JSON). Record registrar, renewal dates, DNS, website hosting, and business email custody.",
      },
      { property: "og:title", content: "Digital Asset Ownership Ledger & Deed" },
      {
        property: "og:description",
        content:
          "Exportable, printable digital deed and ledger proving full ownership of your domain, website, email, and analytics.",
      },
    ],
  }),
  component: OwnershipRecordPage,
});

interface FieldDef {
  key: keyof OwnershipRecord;
  label: string;
  category: "Domain & DNS" | "Website & Content" | "Email & Identity" | "Finance & Recovery";
  hint: string;
  placeholder?: string;
  critical?: boolean;
}

const FIELDS: FieldDef[] = [
  {
    key: "domainRegistrar",
    label: "Domain Registrar",
    category: "Domain & DNS",
    hint: "The company where your domain name is registered and renewed.",
    placeholder: "e.g. Porkbun, Namecheap, Cloudflare, GoDaddy",
    critical: true,
  },
  {
    key: "renewalDate",
    label: "Domain Renewal / Expiry Date",
    category: "Domain & DNS",
    hint: "The annual date the domain must be renewed by to prevent expiry.",
    placeholder: "e.g. 2026-11-15",
    critical: true,
  },
  {
    key: "dnsProvider",
    label: "DNS Nameserver Host",
    category: "Domain & DNS",
    hint: "Where active DNS records (A, CNAME, MX, TXT) are managed.",
    placeholder: "e.g. Cloudflare DNS, Registrar Default DNS",
  },
  {
    key: "websitePlatform",
    label: "Website Platform or Host",
    category: "Website & Content",
    hint: "Where the site files/code live and pages are published.",
    placeholder: "e.g. Shopify, Squarespace, WordPress, Vercel",
    critical: true,
  },
  {
    key: "emailProvider",
    label: "Business Email Host",
    category: "Email & Identity",
    hint: "Who operates your @yourdomain mailboxes and storage.",
    placeholder: "e.g. Titan Mail, Google Workspace, Microsoft 365, Zoho",
    critical: true,
  },
  {
    key: "analyticsAccount",
    label: "Analytics & Search Console Custodian",
    category: "Website & Content",
    hint: "Which master account owns the visitor statistics and search indexing.",
    placeholder: "e.g. admin@yourdomain.com (Google Analytics 4)",
  },
  {
    key: "paymentProcessor",
    label: "Payment Processor / Merchant Account",
    category: "Finance & Recovery",
    hint: "Who handles customer transactions, payouts, and chargebacks.",
    placeholder: "e.g. Stripe, Square, PayPal Merchant, Shopify Payments",
  },
  {
    key: "socialOwners",
    label: "Social Media & Brand Handle Owners",
    category: "Email & Identity",
    hint: "Who holds the master admin logins for Instagram, LinkedIn, X, Facebook.",
    placeholder: "e.g. Founder master email / Company 1Password vault",
  },
  {
    key: "recoveryOwner",
    label: "Master Account Recovery Contact",
    category: "Finance & Recovery",
    hint: "The emergency recovery email and phone number used to rescue accounts.",
    placeholder: "e.g. founder-personal@gmail.com / +1 (555) 019-2831",
    critical: true,
  },
  {
    key: "registrarAccountEmail",
    label: "Registrar Account Email",
    category: "Domain & DNS",
    hint: "The email address that owns the registrar login — used for recovery and renewal notices.",
    placeholder: "e.g. admin@yourdomain.com",
    critical: true,
  },
  {
    key: "lastReviewedAt",
    label: "Last Reviewed Date",
    category: "Finance & Recovery",
    hint: "When you last verified custody, recovery access and renewal (YYYY-MM-DD). Review every 90 days.",
    placeholder: "e.g. 2026-09-03",
  },
];

function OwnershipRecordPage() {
  const { state, setOwnership } = useStore();
  const record = state.ownership;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deedModalOpen, setDeedModalOpen] = useState(false);

  // Sync with business profile if empty
  const syncFromProfile = () => {
    const updates: Partial<OwnershipRecord> = {};
    if (!record.domainRegistrar && state.business.registrarName) {
      updates.domainRegistrar = state.business.registrarName;
    }
    if (!record.websitePlatform && state.business.websitePlatform) {
      updates.websitePlatform = state.business.websitePlatform;
    }
    if (!record.emailProvider && state.business.emailProvider) {
      updates.emailProvider = state.business.emailProvider;
    }
    if (!record.recoveryOwner && state.business.ownerContact) {
      updates.recoveryOwner = state.business.ownerContact;
    }

    if (Object.keys(updates).length > 0) {
      setOwnership(updates);
      toast.success("Synchronized existing details from your Business Profile!");
    } else {
      toast.info("Your record already matches your business profile.");
    }
  };

  const businessName = state.business.name || "Your Business";
  const domain = state.business.ownedDomain || state.business.preferredDomain || "yourdomain.com";

  // 1. Export as Formatted Text
  const exportText = () => {
    const lines = [
      `=============================================================`,
      `DIGITAL ASSET OWNERSHIP LEDGER & CUSTODY RECORD`,
      `=============================================================`,
      `Business Entity: ${businessName}`,
      `Primary Domain:  ${domain}`,
      `Generated Date:  ${new Date().toLocaleDateString()}`,
      ``,
      `ASSET INVENTORY & CUSTODY:`,
      `-------------------------------------------------------------`,
      ...FIELDS.map((f) => `${f.label.padEnd(35, " ")}: ${record[f.key] || "(Not Recorded)"}`),
      ``,
      `INTERNAL NOTES & RECOVERY GUIDANCE:`,
      `-------------------------------------------------------------`,
      record.notes || "None recorded.",
      ``,
      `SECURITY REMINDER: Never record account passwords in this file.`,
      `Store passwords in an encrypted password manager with 2FA enabled.`,
      `=============================================================`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ownership-ledger-${domain.replace(/[^a-z0-9]/gi, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Text ledger downloaded.");
  };

  // 2. Export as CSV
  const exportCsv = () => {
    const rows = [
      ["Category", "Asset / Role", "Provider / Value", "Critical Asset", "Technical Guidance"],
      ...FIELDS.map((f) => [
        `"${f.category}"`,
        `"${f.label}"`,
        `"${(record[f.key] || "").toString().replace(/"/g, '""')}"`,
        f.critical ? '"Yes"' : '"No"',
        `"${f.hint.replace(/"/g, '""')}"`,
      ]),
      [
        "Notes",
        "Additional Custodian Notes",
        `"${(record.notes || "").replace(/"/g, '""')}"`,
        "",
        "",
      ],
      ["Metadata", "Business Entity", `"${businessName}"`, "", ""],
      ["Metadata", "Primary Domain", `"${domain}"`, "", ""],
      ["Metadata", "Export Timestamp", `"${new Date().toISOString()}"`, "", ""],
    ];

    const csvContent = "\uFEFF" + rows.map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `digital-asset-ledger-${domain.replace(/[^a-z0-9]/gi, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV Ledger exported successfully.");
  };

  // 3. Export as JSON Backup
  const exportJson = () => {
    const payload = {
      schema: "https://online-presence-assistant/schemas/digital-asset-ownership-v1.json",
      exportedAt: new Date().toISOString(),
      business: {
        name: businessName,
        domain: domain,
        type: state.business.businessType,
      },
      ownershipRecord: record,
      custodyChecklist: {
        domainRegistrarAssigned: !!record.domainRegistrar,
        recoveryContactAssigned: !!record.recoveryOwner,
        emailProviderAssigned: !!record.emailProvider,
        websitePlatformAssigned: !!record.websitePlatform,
      },
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `digital-asset-backup-${domain.replace(/[^a-z0-9]/gi, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("JSON backup generated and downloaded.");
  };

  // 4. Import from JSON Backup
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && typeof parsed === "object") {
          const importedRecord = parsed.ownershipRecord || parsed;
          const cleanRecord: Partial<OwnershipRecord> = {};

          for (const f of FIELDS) {
            if (typeof importedRecord[f.key] === "string") {
              cleanRecord[f.key] = importedRecord[f.key];
            }
          }
          if (typeof importedRecord.notes === "string") {
            cleanRecord.notes = importedRecord.notes;
          }

          setOwnership(cleanRecord);
          toast.success("Ownership ledger restored from backup file!");
        }
      } catch {
        toast.error("Failed to parse JSON file. Please ensure it is a valid backup.");
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = "";
  };

  // 5. Copy Markdown Summary
  const copyMarkdown = async () => {
    const lines = [
      `# Digital Asset Ownership Ledger — ${businessName}`,
      `**Primary Domain:** \`${domain}\`  `,
      `**Last Updated:** ${new Date().toLocaleDateString()}  `,
      ``,
      `| Asset Category | Property | Value / Custodian |`,
      `| :--- | :--- | :--- |`,
      ...FIELDS.map((f) => `| ${f.category} | ${f.label} | ${record[f.key] || "*Not recorded*"} |`),
      ``,
      `### Custodian & Recovery Notes`,
      record.notes ? `> ${record.notes.replace(/\n/g, "\n> ")}` : "*No notes recorded.*",
      ``,
      `---`,
      `*Generated with Online Presence Setup Assistant. Store credentials separately in a secure password manager.*`,
    ];

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      toast.success("Formatted Markdown copied to clipboard!");
    } catch {
      toast.error("Could not copy markdown.");
    }
  };

  const filledCount = FIELDS.filter(
    (f) => (record[f.key] || "").toString().trim().length > 0,
  ).length;
  const criticalCount = FIELDS.filter((f) => f.critical).length;
  const criticalFilled = FIELDS.filter(
    (f) => f.critical && (record[f.key] || "").toString().trim().length > 0,
  ).length;
  const ownershipHealth = getOwnershipHealth(record);

  return (
    <AppShell
      title="Digital Asset Ownership Ledger & Deed"
      description="Tangible proof of custody over your domain, website, business email, and recovery channels."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeedModalOpen(true)}
            className="gap-1.5"
          >
            <Award className="size-4 text-amber-500" />
            View Digital Deed
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="hidden sm:inline-flex gap-1.5"
          >
            <Printer className="size-4" />
            Print
          </Button>

          <Button size="sm" onClick={exportCsv} className="gap-1.5">
            <Download className="size-4" />
            Export CSV
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/80 bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <HardDrive className="size-4 text-primary" aria-hidden="true" />
            <span>
              <strong className="text-foreground">Data is saved on this device.</strong> Ownership
              records are stored securely in local storage.
            </span>
          </div>
          <Badge variant="outline" className="text-[11px] font-normal">
            Auto-save active
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/20 bg-primary-soft/30 px-3 py-2 text-sm">
          <Link
            to="/online-setup"
            className="inline-flex items-center gap-1.5 font-medium text-primary underline-offset-4 hover:underline"
          >
            View setup map — see domain, website & email dependencies before changes
          </Link>
          <span className="text-xs text-muted-foreground">Context workflow</span>
        </div>
        <OwnershipWarningCard />

        <SafetyWarningBanner title="Security Protocol: Record Custody, Never Passwords">
          This ledger records which vendors, platforms, and primary accounts hold custody of your
          online identity. <strong>Never write passwords or API secret keys here.</strong> Store
          passwords exclusively in a secure password manager and enforce Two-Factor Authentication
          (2FA) on your registrar and recovery email.
        </SafetyWarningBanner>

        {/* Top Custody Status & Quick Actions Bar */}
        <div className="surface-panel p-5 sm:p-6 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Badge
                  className={cn(
                    "text-xs font-semibold",
                    criticalFilled === criticalCount
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                  )}
                >
                  <ShieldCheck className="mr-1 size-3.5" />
                  {criticalFilled === criticalCount
                    ? "Critical Assets Secured"
                    : `${criticalFilled}/${criticalCount} Critical Assets Recorded`}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {filledCount} of {FIELDS.length} total fields complete
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mt-1">
                {businessName} Digital Asset Ledger
              </h3>
              <p className="text-xs text-muted-foreground">
                Domain: <span className="font-mono text-foreground font-semibold">{domain}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={syncFromProfile}
                className="text-xs gap-1.5"
              >
                <Sparkles className="size-3.5 text-primary" /> Auto-Fill from Profile
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs gap-1.5"
              >
                <Upload className="size-3.5" /> Import JSON Backup
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportJson}
                className="hidden"
              />
            </div>
          </div>

          {/* Ownership Health View — 4 states: At risk / Needs attention / Documented / Review due */}
          <div
            className={cn(
              "flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3",
              ownershipHealth.health === "at_risk" &&
                "border-destructive/30 bg-destructive-soft/40",
              ownershipHealth.health === "needs_attention" &&
                "border-amber-500/30 bg-amber-500/10",
              ownershipHealth.health === "review_due" &&
                "border-amber-500/30 bg-amber-500/10",
              ownershipHealth.health === "documented" &&
                "border-emerald-500/30 bg-emerald-500/10",
            )}
          >
            <div className="flex items-center gap-2">
              {ownershipHealth.health === "at_risk" && (
                <AlertTriangle className="size-4 text-destructive" aria-hidden="true" />
              )}
              {ownershipHealth.health === "needs_attention" && (
                <AlertTriangle className="size-4 text-amber-600" aria-hidden="true" />
              )}
              {ownershipHealth.health === "review_due" && (
                <Calendar className="size-4 text-amber-600" aria-hidden="true" />
              )}
              {ownershipHealth.health === "documented" && (
                <CheckCircle2 className="size-4 text-emerald-600" aria-hidden="true" />
              )}
              <div>
                <span className="text-sm font-semibold">Ownership health: {ownershipHealth.label}</span>
                <p className="text-xs text-muted-foreground">{ownershipHealth.summary}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "text-xs font-semibold",
                  ownershipHealth.health === "at_risk" && "bg-destructive text-destructive-foreground",
                  ownershipHealth.health === "needs_attention" && "bg-amber-500 text-white",
                  ownershipHealth.health === "review_due" && "bg-amber-500 text-white",
                  ownershipHealth.health === "documented" && "bg-emerald-500 text-white",
                )}
              >
                {ownershipHealth.label}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => {
                  const today = new Date().toISOString().slice(0, 10);
                  setOwnership({ lastReviewedAt: today } as Partial<OwnershipRecord>);
                  toast.success(`Marked as reviewed today (${today}).`);
                }}
              >
                <CheckCircle2 className="size-3.5" />
                Mark reviewed today
              </Button>
            </div>
          </div>

          {/* Export Formats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-border/60">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeedModalOpen(true)}
              className="justify-start gap-2 h-auto py-2 px-3 text-left"
            >
              <Award className="size-4 text-amber-500 shrink-0" />
              <div>
                <span className="font-semibold block text-xs">Printable Deed</span>
                <span className="text-[10px] text-muted-foreground">Official PDF Layout</span>
              </div>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={exportCsv}
              className="justify-start gap-2 h-auto py-2 px-3 text-left"
            >
              <FileSpreadsheet className="size-4 text-emerald-500 shrink-0" />
              <div>
                <span className="font-semibold block text-xs">Spreadsheet (CSV)</span>
                <span className="text-[10px] text-muted-foreground">Excel / Google Sheets</span>
              </div>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={exportJson}
              className="justify-start gap-2 h-auto py-2 px-3 text-left"
            >
              <FileCode className="size-4 text-blue-500 shrink-0" />
              <div>
                <span className="font-semibold block text-xs">JSON Backup</span>
                <span className="text-[10px] text-muted-foreground">Encrypted Vault Ready</span>
              </div>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={copyMarkdown}
              className="justify-start gap-2 h-auto py-2 px-3 text-left"
            >
              <Copy className="size-4 text-purple-500 shrink-0" />
              <div>
                <span className="font-semibold block text-xs">Copy Markdown</span>
                <span className="text-[10px] text-muted-foreground">For Notion / Docs / Wiki</span>
              </div>
            </Button>
          </div>
        </div>

        {/* Ledger Form Fields Grouped By Category */}
        <section className="surface-panel space-y-6 p-5 sm:p-7">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h2 className="font-display text-xl font-bold">Asset Custody Ledger</h2>
              <p className="text-xs text-muted-foreground">
                Document who holds the keys to each piece of digital infrastructure.
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              Saves automatically
            </Badge>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {FIELDS.map((f) => (
              <div
                key={f.key}
                className={cn(
                  "rounded-xl border p-4 transition-all space-y-1.5",
                  f.critical && !(record[f.key] || "").toString().trim()
                    ? "border-amber-500/30 bg-amber-500/5"
                    : "border-border bg-card",
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor={`own-${f.key}`} className="font-semibold text-sm">
                      {f.label}
                    </Label>
                    {f.critical && (
                      <span className="text-amber-500 text-xs font-bold" title="Critical Asset">
                        *
                      </span>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-mono">
                    {f.category}
                  </Badge>
                </div>

                <Input
                  id={`own-${f.key}`}
                  value={(record[f.key] as string) ?? ""}
                  placeholder={f.placeholder}
                  onChange={(e) =>
                    setOwnership({ [f.key]: e.target.value } as Partial<OwnershipRecord>)
                  }
                  className="font-medium text-sm"
                  aria-describedby={`own-${f.key}-hint`}
                />
                <p id={`own-${f.key}-hint`} className="text-[11px] text-muted-foreground">
                  {f.hint}
                </p>
              </div>
            ))}
          </div>

          {/* Notes and Recovery Details */}
          <div className="space-y-2 pt-2 border-t border-border/60">
            <Label htmlFor="own-notes" className="font-semibold text-sm">
              Custodian Notes & Contingency Instructions
            </Label>
            <Textarea
              id="own-notes"
              rows={4}
              value={record.notes}
              onChange={(e) => setOwnership({ notes: e.target.value })}
              placeholder="e.g. Master credentials stored in Company 1Password vault. Co-founder has secondary emergency access. Domain auto-renew is funded via Chase Operating Card ending in 4102."
              className="text-sm leading-relaxed"
            />
            <p className="text-xs text-muted-foreground">
              Essential instructions for future business audits, co-founders, or executive
              succession.
            </p>
          </div>
        </section>

        {/* Why Ownership Matters Section */}
        <section className="surface-panel space-y-4 p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold">The Golden Rules of Digital Custody</h2>
          <div className="grid gap-3 sm:grid-cols-3 text-xs leading-relaxed text-muted-foreground">
            <div className="rounded-lg border border-border/80 p-3.5 bg-muted/20 space-y-1">
              <strong className="text-foreground block font-semibold">
                1. Always Hold Primary Registrant Status
              </strong>
              Never let an outside web agency or freelance contractor register your domain under
              their personal name or credit card. If you part ways, you could lose your domain.
            </div>
            <div className="rounded-lg border border-border/80 p-3.5 bg-muted/20 space-y-1">
              <strong className="text-foreground block font-semibold">
                2. Set Calendar Alerts for Renewal
              </strong>
              Expired domains immediately disable business email and websites, and can be snapped up
              by domain squatters within 30 to 45 days.
            </div>
            <div className="rounded-lg border border-border/80 p-3.5 bg-muted/20 space-y-1">
              <strong className="text-foreground block font-semibold">
                3. Dedicated Recovery Phone & Email
              </strong>
              Ensure account recovery isn't tied to an employee's personal device who might leave
              the company.
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/domains">Domain Finder</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/business-profile">Business Profile</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/maintenance">Maintenance Reminders</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/hire-help">Working with Paid Help</Link>
            </Button>
          </div>
        </section>

        {/* Mobile Action Bar */}
        <div className="flex flex-wrap gap-2 sm:hidden">
          <Button
            className="flex-1 gap-1.5"
            onClick={() => setDeedModalOpen(true)}
            variant="default"
          >
            <Award className="size-4 text-amber-300" />
            Digital Deed
          </Button>
          <Button variant="outline" className="flex-1 gap-1.5" onClick={exportCsv}>
            <Download className="size-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Formal Digital Deed Modal & Printable Sheet */}
      <Dialog open={deedModalOpen} onValueChange={setDeedModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-8">
          <DialogHeader className="print:hidden">
            <DialogTitle className="flex items-center gap-2 font-display text-xl">
              <Award className="size-5 text-amber-500" />
              Digital Asset Custody Deed
            </DialogTitle>
            <DialogDescription>
              A formal, printable certificate verifying the custodian records for {businessName}.
            </DialogDescription>
          </DialogHeader>

          {/* Certificate Container */}
          <div
            id="printable-digital-deed"
            className="rounded-2xl border-4 border-double border-amber-500/40 bg-card p-6 sm:p-10 space-y-6 shadow-xl"
          >
            {/* Deed Header */}
            <div className="text-center space-y-2 border-b-2 border-amber-500/30 pb-6">
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-1">
                <ShieldCheck className="size-8" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 block">
                Official Declaration & Custody Ledger
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-foreground uppercase">
                Certificate of Digital Asset Ownership
              </h1>
              <p className="text-sm font-serif italic text-muted-foreground">
                This document certifies the recorded custody, authoritative infrastructure, and
                recovery contacts for the online business entity specified herein.
              </p>
            </div>

            {/* Entity Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-xl bg-muted/40 p-4 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Business Entity
                </span>
                <span className="font-bold text-foreground text-sm">{businessName}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Primary Domain
                </span>
                <span className="font-mono font-bold text-foreground text-sm">{domain}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Issue & Verification Date
                </span>
                <span className="font-medium text-foreground">
                  {new Date().toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Structured Table */}
            <div className="space-y-2">
              <h3 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Recorded Digital Infrastructure
              </h3>
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/60 text-muted-foreground">
                    <tr>
                      <th className="p-2.5 font-semibold">Asset Category</th>
                      <th className="p-2.5 font-semibold">Infrastructure Component</th>
                      <th className="p-2.5 font-semibold">Assigned Host / Account</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {FIELDS.map((f) => (
                      <tr key={f.key} className="hover:bg-muted/20">
                        <td className="p-2.5 font-mono text-[11px] text-muted-foreground">
                          {f.category}
                        </td>
                        <td className="p-2.5 font-medium text-foreground">{f.label}</td>
                        <td className="p-2.5 font-mono text-foreground font-semibold">
                          {record[f.key] ? (
                            record[f.key]
                          ) : (
                            <span className="text-muted-foreground italic font-normal">
                              (Not Recorded)
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notes & Attestation */}
            {record.notes && (
              <div className="space-y-1 text-xs">
                <span className="font-semibold text-foreground">Custodian Notes:</span>
                <p className="rounded-lg border border-border/80 bg-muted/20 p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
                  {record.notes}
                </p>
              </div>
            )}

            {/* Formal Sign-off Block */}
            <div className="pt-4 border-t border-border/80 grid grid-cols-2 gap-8 text-xs">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block font-semibold">
                  Authorized Signatory / Custodian
                </span>
                <div className="h-10 border-b border-border flex items-end font-serif italic text-base">
                  {record.recoveryOwner || businessName}
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 block">
                  Signature & Date
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block font-semibold">
                  Custody Verification Status
                </span>
                <div className="h-10 border-b border-border flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="size-4" /> Self-Certified by Domain Owner
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 block">
                  Keep copy in company safe / records
                </span>
              </div>
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t print:hidden">
            <p className="text-xs text-muted-foreground">
              Tip: Choose &quot;Save as PDF&quot; in the print dialog.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setDeedModalOpen(false)}>
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => window.print()}
                className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Printer className="size-4" /> Print / Save as PDF
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
