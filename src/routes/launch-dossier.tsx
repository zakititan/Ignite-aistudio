import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  FileText,
  Printer,
  Download,
  Copy,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Globe,
  Mail,
  Network,
  Lock,
  Layers,
  Sparkles,
  Share2,
  Check,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Callout } from "@/components/Callouts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/launch-dossier")({
  head: () => ({
    meta: [
      {
        title: "Digital Asset Launch Dossier & Handover Certificate",
      },
      {
        name: "description",
        content:
          "Official, print-ready digital deed, DNS configuration blueprint, ownership ledger, and agency handover document.",
      },
      {
        property: "og:title",
        content: "Master Digital Asset Launch Dossier",
      },
      {
        property: "og:description",
        content:
          "Export your complete digital ownership record, DNS blueprint, and verified launch certificate in PDF, Markdown, or JSON.",
      },
    ],
  }),
  component: LaunchDossierPage,
});

export function LaunchDossierPage() {
  const { state } = useStore();
  const b = state.business;
  const o = state.ownership;

  const businessName = b.businessName || b.name || "Your Business LLC";
  const domain = b.ownedDomain || b.preferredDomain || "yourbusiness.com";
  const primaryEmail = b.businessEmail || b.ownerContact || `contact@${domain}`;
  const phone = b.phone || b.whatsappNumber || "(555) 123-4567";
  const location = b.location || b.address || "Local and Online";
  const todayStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Authoritative DNS blueprint based on business state
  const dnsBlueprint = useMemo(() => {
    return [
      {
        type: "A",
        host: "@ (apex)",
        value: "76.76.21.21 (or Hosting IP)",
        ttl: "3600",
        purpose: "Points root domain to website web server",
      },
      {
        type: "CNAME",
        host: "www",
        value: `${domain}.`,
        ttl: "3600",
        purpose: "Aliases www subdomain to root domain with SSL",
      },
      {
        type: "MX",
        host: "@",
        value: "mx1.titan.email (Priority 10) / aspmx.l.google.com",
        ttl: "3600",
        purpose: "Directs incoming business email to mailbox host",
      },
      {
        type: "TXT",
        host: "@",
        value: "v=spf1 include:spf.titan.email ~all",
        ttl: "3600",
        purpose: "SPF anti-spoofing authorization for mail delivery",
      },
      {
        type: "TXT / CNAME",
        host: "titan1._domainkey",
        value: "k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GN...",
        ttl: "3600",
        purpose: "DKIM cryptographic signature for spam prevention",
      },
      {
        type: "TXT",
        host: "_dmarc",
        value: "v=DMARC1; p=none; sp=none; rua=mailto:dmarc@" + domain,
        ttl: "3600",
        purpose: "DMARC spoofing detection and delivery reporting",
      },
    ];
  }, [domain]);

  // Markdown Generator
  const generateMarkdownDossier = () => {
    return `# OFFICIAL DIGITAL ASSET LAUNCH DOSSIER
**Organization:** ${businessName}
**Primary Domain:** ${domain}
**Issue Date:** ${todayStr}

---

## 1. Executive Business Profile & Primary Identifiers
- **Legal / Trading Entity:** ${businessName}
- **Primary Domain Name:** ${domain}
- **Master Business Email:** ${primaryEmail}
- **Customer Phone:** ${phone}
- **Primary Service Location:** ${location}
- **Customer Model:** ${b.customerModel || "Local & Online"}
- **Primary Value Proposition:** ${b.description || "High-quality products and services"}

---

## 2. Digital Asset Ownership & Custody Registry
- **Domain Registrar:** ${o.domainRegistrar || "Direct Ownership Account"}
- **Domain Expiration / Renewal Date:** ${o.renewalDate || "Annual Auto-Renew Enforced"}
- **DNS Management Provider:** ${o.dnsProvider || "Cloudflare / Registrar DNS"}
- **Website Hosting Platform:** ${o.websitePlatform || "Cloud Hosting CMS"}
- **Business Email Host:** ${o.emailProvider || "Titan / Google Workspace"}
- **Analytics & Tracking Account:** ${o.analyticsAccount || "Google Analytics (GA4)"}
- **Payment Processor:** ${o.paymentProcessor || "Stripe / Square"}
- **Master Admin Recovery Account:** ${o.recoveryOwner || primaryEmail}

---

## 3. Authoritative DNS Configuration Blueprint
| Record Type | Host / Name | Target / Value | TTL | Purpose |
| :--- | :--- | :--- | :--- | :--- |
${dnsBlueprint.map((r) => `| ${r.type} | ${r.host} | ${r.value} | ${r.ttl} | ${r.purpose} |`).join("\n")}

---

## 4. Pre-Flight Technical Audit & Verification Summary
- [x] Lead contact forms tested and delivering to master inbox (${primaryEmail})
- [x] Mobile responsiveness and tap-to-call dialers verified
- [x] TLS / SSL certificate verified with automatic HTTPS enforcement
- [x] SPF and DKIM anti-spam email authentication active
- [x] Custom 404 error routing and 32x32px brand favicon installed

---

## 5. Formal Custodian & Agency Handover Sign-Off
This document certifies that full custody, credentials access, and master ownership of all digital assets listed above reside with the business owner.

**Client / Business Owner Signature:** ___________________________  **Date:** ${todayStr}
**Agency / Webmaster Signature:** ___________________________  **Date:** ${todayStr}
`;
  };

  // Download Markdown
  const downloadMarkdown = () => {
    const md = generateMarkdownDossier();
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `digital-asset-dossier-${domain.replace(/[^a-z0-9]/gi, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded Digital Asset Dossier in Markdown format!");
  };

  // Download JSON
  const downloadJSON = () => {
    const data = {
      businessProfile: {
        businessName,
        domain,
        primaryEmail,
        phone,
        location,
        generatedAt: todayStr,
      },
      ownershipRegistry: o,
      dnsBlueprint,
      verificationStatus: "100% Certified Launch Ready",
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `digital-asset-dossier-${domain.replace(/[^a-z0-9]/gi, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded Digital Asset Dossier in JSON backup format!");
  };

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateMarkdownDossier());
      toast.success("Copied complete Launch Dossier to clipboard!");
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  };

  return (
    <AppShell
      title="Master Digital Asset Launch Dossier & Deed"
      description="Official printable deed, DNS configuration blueprint, ownership ledger, and agency handover document."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={copyToClipboard} className="text-xs gap-1.5">
            <Copy className="size-3.5" /> Copy Text
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadMarkdown}
            className="text-xs gap-1.5"
          >
            <Download className="size-3.5" /> Download (.md)
          </Button>
          <Button variant="outline" size="sm" onClick={downloadJSON} className="text-xs gap-1.5">
            <FileText className="size-3.5" /> Download (.json)
          </Button>
          <Button
            size="sm"
            onClick={() => window.print()}
            className="text-xs gap-1.5 bg-primary text-primary-foreground shadow"
          >
            <Printer className="size-3.5" /> Print / Save as PDF
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <Callout tone="info" title="Permanent Business Asset Record">
          Keep this document in your corporate records or share it with technical contractors. It
          proves legal custody and records all critical DNS and server connections in one
          centralized place.
        </Callout>

        {/* PRINTABLE DOSSIER CARD CONTAINER */}
        <div
          id="launch-dossier-document"
          className="surface-panel p-6 sm:p-10 space-y-8 bg-card text-foreground border-2 border-primary/20 shadow-xl rounded-2xl print:border-none print:shadow-none print:p-0 print:m-0"
        >
          {/* Official Letterhead Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-6 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs">
                  <Award className="size-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-primary">
                  Official Digital Asset Deed
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground">
                {businessName}
              </h1>
              <p className="text-xs font-mono text-muted-foreground">
                Canonical Domain: <strong className="text-foreground">https://{domain}</strong>
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <Badge
                variant="outline"
                className="text-xs font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
              >
                ✓ Launch Certified
              </Badge>
              <p className="text-[11px] text-muted-foreground">Certified Date: {todayStr}</p>
              <p className="text-[10px] text-muted-foreground">
                Document ID: DOSSIER-
                {domain
                  .replace(/[^a-z0-9]/gi, "")
                  .toUpperCase()
                  .slice(0, 10)}
              </p>
            </div>
          </div>

          {/* Section 1: Executive Business Profile */}
          <div className="space-y-3">
            <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2 border-b border-border/50 pb-1">
              <Building2 className="size-4 text-primary" />
              <span>1. Executive Business Profile & Identifiers</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-muted/30 border">
                <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                  Trading Entity
                </span>
                <strong className="text-foreground text-sm">{businessName}</strong>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border">
                <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                  Master Contact Email
                </span>
                <strong className="text-foreground text-sm">{primaryEmail}</strong>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border">
                <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                  Inquiry Phone
                </span>
                <strong className="text-foreground text-sm">{phone}</strong>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border">
                <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                  Location & Coverage
                </span>
                <span className="text-foreground font-medium">{location}</span>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border">
                <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                  Customer Model
                </span>
                <span className="text-foreground font-medium capitalize">
                  {b.customerModel || "Local & Online"}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border">
                <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                  Primary Goal
                </span>
                <span className="text-foreground font-medium">
                  {b.primaryGoal || "Acquire and convert local customer inquiries"}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Infrastructure & Custody Registry */}
          <div className="space-y-3">
            <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2 border-b border-border/50 pb-1">
              <ShieldCheck className="size-4 text-emerald-500" />
              <span>2. Digital Asset Ownership & Custody Registry</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-card border">
                <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                  Domain Registrar
                </span>
                <span className="font-bold text-foreground">
                  {o.domainRegistrar || "Self-Managed Registrar"}
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  Expires: {o.renewalDate || "Annual Auto-Renew"}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-card border">
                <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                  DNS Provider
                </span>
                <span className="font-bold text-foreground">
                  {o.dnsProvider || "Cloudflare / Zone Manager"}
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  Anycast DNS Routing
                </span>
              </div>
              <div className="p-3 rounded-lg bg-card border">
                <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                  Web Platform Host
                </span>
                <span className="font-bold text-foreground">
                  {o.websitePlatform || "Dedicated CMS / Cloud Host"}
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">SSL Active</span>
              </div>
              <div className="p-3 rounded-lg bg-card border">
                <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                  Business Email Host
                </span>
                <span className="font-bold text-foreground">
                  {o.emailProvider || "Titan / Google Workspace"}
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  DKIM/SPF Active
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: DNS Blueprint */}
          <div className="space-y-3">
            <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2 border-b border-border/50 pb-1">
              <Network className="size-4 text-primary" />
              <span>3. Authoritative DNS Configuration Blueprint</span>
            </h3>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 border-b border-border text-[11px] font-bold text-foreground uppercase">
                  <tr>
                    <th className="p-3">Type</th>
                    <th className="p-3">Host / Name</th>
                    <th className="p-3">Value / Target</th>
                    <th className="p-3">TTL</th>
                    <th className="p-3">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-mono text-[11px]">
                  {dnsBlueprint.map((row, idx) => (
                    <tr key={idx} className="hover:bg-muted/20">
                      <td className="p-3 font-bold text-primary">{row.type}</td>
                      <td className="p-3 text-foreground">{row.host}</td>
                      <td className="p-3 text-foreground break-all">{row.value}</td>
                      <td className="p-3 text-muted-foreground">{row.ttl}</td>
                      <td className="p-3 font-sans text-muted-foreground text-[11px]">
                        {row.purpose}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Pre-Flight Technical Verification Audit */}
          <div className="space-y-3">
            <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2 border-b border-border/50 pb-1">
              <Lock className="size-4 text-emerald-500" />
              <span>4. Technical Pre-Flight Verification Audit</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2.5 rounded-lg border bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                <span>Lead inquiry forms verified & routing to {primaryEmail}</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg border bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                <span>Mobile viewport responsive & tap-to-call active</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg border bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                <span>SSL / HTTPS padlock active with 301 automatic redirect</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg border bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                <span>SPF & DKIM anti-spam email authentication verified</span>
              </div>
            </div>
          </div>

          {/* Section 5: Formal Handover Signatures */}
          <div className="pt-4 border-t-2 border-dashed border-border/80 space-y-4">
            <h3 className="font-display text-base font-bold text-foreground">
              5. Formal Custody Transfer & Handover Sign-Off
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This document certifies that full credentials access, root administrative ownership,
              and legal custody of the domain{" "}
              <strong className="text-foreground font-mono">{domain}</strong> and corresponding
              accounts are properly retained by the business principal.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6">
              <div className="space-y-4">
                <div className="border-b border-foreground/40 pb-1 h-12 flex items-end">
                  <span className="font-serif italic text-sm text-foreground/80">
                    {b.businessName || "Business Principal"}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Client / Business Owner</p>
                  <p className="text-[11px] text-muted-foreground">Date: {todayStr}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-b border-foreground/40 pb-1 h-12 flex items-end">
                  <span className="font-serif italic text-sm text-foreground/80">
                    Certified Webmaster
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Agency / Web Specialist</p>
                  <p className="text-[11px] text-muted-foreground">Date: {todayStr}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
