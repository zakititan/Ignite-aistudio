import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  LifeBuoy,
  RefreshCw,
  Lock,
  KeyRound,
  Download,
  Copy,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Server,
  Globe,
  Mail,
  ShieldCheck,
  FileCode,
  Layers,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Callout } from "@/components/Callouts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/security-drill")({
  head: () => ({
    meta: [
      {
        title: "Protect your website access — Cornerstone",
      },
      {
        name: "description",
        content:
          "Keep access safe, prevent lockouts, audit account security, and keep a backup of your DNS.",
      },
      {
        property: "og:title",
        content: "Protect your website access — Cornerstone",
      },
      {
        property: "og:description",
        content:
          "Emergency diagnostic flowchart, account security checklist, and DNS backup vault for small business websites.",
      },
    ],
  }),
  component: SecurityDrillPage,
});

// 2FA Security Checklist items
interface SecurityCheckItem {
  id: string;
  category: "registrar" | "dns" | "hosting" | "email" | "custody";
  title: string;
  description: string;
  risk: "Critical" | "High" | "Medium";
  howTo: string;
}

const SECURITY_CHECKS: SecurityCheckItem[] = [
  {
    id: "sec_reg_2fa",
    category: "registrar",
    title: "Domain Registrar 2FA (Authenticator App)",
    description: "Hardware or app-based 2-factor authentication enabled on domain registrar login.",
    risk: "Critical",
    howTo:
      "Open your registrar security settings and link Google Authenticator or 1Password. Avoid SMS 2FA where possible.",
  },
  {
    id: "sec_reg_lock",
    category: "registrar",
    title: "Registrar Lock / Transfer Lock Active",
    description: "Prevents unauthorized domain transfer requests from hijacking your web address.",
    risk: "Critical",
    howTo:
      "Toggle 'Registrar Lock' or 'Domain Transfer Lock' to ON in your domain management dashboard.",
  },
  {
    id: "sec_dns_backup",
    category: "dns",
    title: "Authoritative DNS Zone Backup Stored Locally",
    description:
      "Exported copy of all A, CNAME, MX, and TXT records stored offline in case of accidental record deletion.",
    risk: "High",
    howTo:
      "Click the 'Export DNS Snapshot' button in the Backup Vault tab below and store on your computer.",
  },
  {
    id: "sec_email_admin",
    category: "email",
    title: "Dedicated Master Admin Account with 2FA",
    description: "Super Admin email account protected with 2FA and not shared with general staff.",
    risk: "Critical",
    howTo: "Ensure you have a separate admin@ account or protected owner login with MFA enabled.",
  },
  {
    id: "sec_host_backup",
    category: "hosting",
    title: "Automated Weekly Website Content Backup",
    description: "Web host or CMS automatically snapshots site pages, assets, and databases.",
    risk: "High",
    howTo: "Check hosting settings to ensure 30-day automated rolling backups are active.",
  },
  {
    id: "sec_custody_owner",
    category: "custody",
    title: "Owner Holds Root Billing & Primary Email Access",
    description:
      "The business founder owns the credit card on file and master login—not a third-party freelancer.",
    risk: "Critical",
    howTo:
      "Verify that all root accounts are registered under your primary corporate email address.",
  },
];

export function SecurityDrillPage() {
  const { state } = useStore();
  const b = state.business;
  const o = state.ownership;

  const domain = b.ownedDomain || b.preferredDomain || "apexcraft.com";
  const businessName = b.businessName || b.name || "Apex Craft Services";
  const primaryEmail = b.businessEmail || b.ownerContact || `hello@${domain}`;

  // 2FA checklist state stored in localStorage
  const [securityDone, setSecurityDone] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem("lmbo.security.drill.v1");
      return raw ? JSON.parse(raw) : { sec_reg_lock: true, sec_custody_owner: true };
    } catch {
      return { sec_reg_lock: true, sec_custody_owner: true };
    }
  });

  const toggleSecurityItem = (id: string) => {
    setSecurityDone((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem("lmbo.security.drill.v1", JSON.stringify(next));
      return next;
    });
  };

  // --- EMERGENCY TRIAGE SIMULATOR ---
  const [triageSymptom, setTriageSymptom] = useState<string | null>(null);

  const triageDiagnostics = useMemo(() => {
    if (triageSymptom === "browser_red_warning") {
      return {
        title: "🚨 Red Browser Warning ('Your connection is not private / SSL Expired')",
        probableCause: "Expired or mismatched TLS/SSL certificate, or HTTP to HTTPS redirect loop.",
        immediateSteps: [
          "1. Log into your web host or Cloudflare dashboard.",
          "2. Check 'SSL/TLS' settings: Ensure SSL mode is set to 'Full' or 'Automatic'.",
          "3. Re-issue free Let's Encrypt / DigiCert certificate with 1 click.",
          "4. Verify that your DNS A record points directly to the correct hosting IP address.",
        ],
        supportTicketSnippet: `Subject: URGENT: SSL Certificate Validation Failure on https://${domain}\n\nHello Support Team,\n\nOur domain https://${domain} is throwing a browser security warning (NET::ERR_CERT_COMMON_NAME_INVALID or Expired). Please verify that the automated SSL certificate is re-provisioned and bound to both apex (${domain}) and www.${domain}.\n\nThank you!`,
      };
    }

    if (triageSymptom === "domain_not_found") {
      return {
        title: "🚨 Server Not Found / DNS_PROBE_FINISHED_NXDOMAIN",
        probableCause:
          "Domain registration expired, nameservers misconfigured, or apex A record missing.",
        immediateSteps: [
          "1. Log into your domain registrar (e.g. Porkbun, Namecheap, GoDaddy).",
          "2. Verify domain status: Is your annual renewal payment overdue? Renew immediately if lapsed.",
          "3. Check Nameservers: Ensure they match your active DNS provider (e.g. ns1.cloudflare.com).",
          "4. Check DNS Zone: Verify an @ A record exists pointing to your web host IP.",
        ],
        supportTicketSnippet: `Subject: URGENT: NXDOMAIN / DNS Resolution Outage on ${domain}\n\nHello Support,\n\nOur domain ${domain} is failing to resolve globally (NXDOMAIN). Can you please verify if the domain is active, unlocked, and that our authoritative nameservers are responding correctly?\n\nDomain: ${domain}`,
      };
    }

    if (triageSymptom === "error_500_502") {
      return {
        title: "🚨 500 Internal Server Error / 502 Bad Gateway",
        probableCause:
          "Web hosting server crash, plugin conflict (WordPress), or database connection timeout.",
        immediateSteps: [
          "1. Log into your web hosting control panel (cPanel, Hostinger, Vercel, Shopify).",
          "2. Check Server Status: Restart web service or PHP/Node workers.",
          "3. If using WordPress: Temporarily rename the /wp-content/plugins folder via File Manager to isolate faulty plugins.",
          "4. Restore from the most recent automatic 24-hour backup snapshot.",
        ],
        supportTicketSnippet: `Subject: URGENT: 502 Bad Gateway / Web Server Unresponsive on https://${domain}\n\nHello Host Support,\n\nOur production website at https://${domain} is returning HTTP 500/502 server errors. Please check the backend server processes and error logs immediately to restore connectivity.\n\nAccount Domain: ${domain}`,
      };
    }

    if (triageSymptom === "mail_bouncing") {
      return {
        title: "🚨 Business Email Not Receiving / Not Sending / Bouncing",
        probableCause:
          "Missing or overwritten MX records, missing SPF/DKIM, or DMARC reject policy misconfiguration. Email not receiving = inbound MX missing; not sending/bouncing = SPF/DKIM failing.",
        immediateSteps: [
          "1. Check inbound (not receiving): Verify MX records still list your email provider (e.g. mx1.titan.email). Compare with provider's setup guide.",
          "2. Check outbound (not sending/bouncing): Ensure TXT @ contains 'v=spf1 include:spf.yourprovider.com ~all'.",
          "3. Check DKIM: Verify the CNAME or TXT selector provided by your email host is published.",
          "4. Send a test email to https://mail-tester.com and reply from outside to confirm both directions.",
        ],
        supportTicketSnippet: `Subject: Business Email Not Receiving / Not Sending for ${domain}\n\nHello Mail Support,\n\nEmails on ${domain} are not receiving (inbound) and/or bouncing when sending from ${primaryEmail}. Please confirm the authoritative MX, SPF, and DKIM DNS records required for our mailbox setup.\n\nDomain: ${domain}`,
      };
    }

    if (triageSymptom === "site_unavailable") {
      return {
        title: "🚨 Website Unavailable — Site Not Loading (No Specific Error)",
        probableCause:
          "Domain expired, DNS propagation delay after recent change, or website platform shows site as draft/unpublished.",
        immediateSteps: [
          "1. Check the address for typos, including http:// vs https://. Try on mobile data as well as Wi-Fi.",
          "2. Sign in to your registrar and confirm the domain has not expired (renew immediately if lapsed).",
          "3. Confirm your website platform shows the site as Published, not Draft.",
          "4. If you changed DNS in the last 48 hours, wait and re-check in a private/incognito window.",
        ],
        supportTicketSnippet: `Subject: URGENT: Website Unavailable on https://${domain}\n\nHello Support Team,\n\nOur website https://${domain} is unavailable / not loading for visitors (no specific error code). Please verify the domain is active, DNS is correctly pointed, and the hosting platform shows the site as published.\n\nDomain: ${domain}`,
      };
    }

    if (triageSymptom === "account_lockout") {
      return {
        title: "🚨 Account Access Loss — Cannot Sign In to Domain / Registrar / Hosting",
        probableCause:
          "Account uses an old email, password reset failing, or ownership held by former contractor/agency.",
        immediateSteps: [
          "1. Search your email for renewal receipts to identify the registrar/hosting provider.",
          "2. Use the provider's Account Recovery (not repeated password guesses) and check spam for reset links.",
          "3. If a former contractor set it up, request a formal transfer/auth-code in writing and update the account email to your business-controlled address.",
          "4. Once recovered, enable 2FA (authenticator app), store recovery codes offline, and enable Registrar Lock.",
        ],
        supportTicketSnippet: `Subject: URGENT: Account Access Recovery for ${domain}\n\nHello Support Team,\n\nWe have lost access to the registrar/hosting account managing ${domain}. The account may be under a previous contractor's email. Please advise the verified recovery and transfer process to restore ownership to ${primaryEmail}.\n\nDomain: ${domain}\nRequesting contact: ${primaryEmail}`,
      };
    }

    return null;
  }, [triageSymptom, domain, primaryEmail]);

  // DNS Zone snapshot generator
  const zoneFileContent = useMemo(() => {
    return `; ===================================================
; AUTHORITATIVE DNS ZONE BACKUP SNAPSHOT
; Domain: ${domain}
; Exported: ${new Date().toISOString()}
; Organization: ${businessName}
; ===================================================
$ORIGIN ${domain}.
$TTL 3600

; SOA & Nameservers
@   IN  SOA ns1.cloudflare.com. admin.${domain}. (
        ${new Date().getFullYear()}010101 ; Serial
        7200       ; Refresh
        3600       ; Retry
        1209600    ; Expire
        3600 )     ; Minimum TTL

; Web Server Records
@       IN  A       76.76.21.21
www     IN  CNAME   ${domain}.

; Mail Exchange (MX) Records
@       IN  MX  10  mx1.titan.email.
@       IN  MX  20  mx2.titan.email.

; Security & Anti-Spam (SPF, DKIM, DMARC)
@       IN  TXT     "v=spf1 include:spf.titan.email ~all"
titan1._domainkey IN TXT "k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC..."
_dmarc  IN  TXT     "v=DMARC1; p=none; sp=none; rua=mailto:dmarc@${domain}"
`;
  }, [domain, businessName]);

  const downloadZoneSnapshot = () => {
    const blob = new Blob([zoneFileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dns-zone-backup-${domain}-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded DNS Zone backup snapshot (.txt)!");
  };

  const copyTicket = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied emergency support ticket to clipboard!");
  };

  const securityScore = Math.round(
    (SECURITY_CHECKS.filter((c) => securityDone[c.id]).length / SECURITY_CHECKS.length) * 100,
  );

  return (
    <AppShell
      title="Protect your website access"
      description="Keep access safe, prevent lockouts, audit account security, and keep a backup of your DNS."
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={downloadZoneSnapshot}
            className="text-xs gap-1.5"
          >
            <Download className="size-3.5" /> Export DNS Zone Backup
          </Button>
          <Button
            asChild
            size="sm"
            className="text-xs gap-1.5 bg-primary text-primary-foreground shadow"
          >
            <Link to="/launch-dossier">
              <ShieldCheck className="size-3.5" /> View Launch Dossier
            </Link>
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Security Score Health Card */}
        <div className="surface-panel p-5 sm:p-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Domain & Infrastructure Fortress Score
                </span>
                <Badge
                  variant={securityScore >= 80 ? "default" : "secondary"}
                  className={cn(
                    "text-xs font-bold",
                    securityScore >= 80 && "bg-emerald-600 text-white",
                  )}
                >
                  {securityScore}% Hardened
                </Badge>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                Security & Continuity Shield for <span className="text-primary">{domain}</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Prevent domain theft, lockout from ex-contractors, and unexpected website outages.
              </p>
            </div>

            <div className="w-28 sm:w-36">
              <Progress value={securityScore} className="h-3" />
            </div>
          </div>
        </div>

        {/* 3 Main Tabs: Emergency Triage, 2FA Fortress, and DNS Backup Vault */}
        <Tabs defaultValue="triage" className="space-y-6">
          <TabsList className="grid grid-cols-3 p-1 max-w-lg">
            <TabsTrigger value="triage" className="text-xs font-bold gap-1.5">
              <ShieldAlert className="size-3.5 text-red-500" /> Outage Triage
            </TabsTrigger>
            <TabsTrigger value="fortress" className="text-xs font-bold gap-1.5">
              <KeyRound className="size-3.5 text-primary" /> 2FA & Custody
            </TabsTrigger>
            <TabsTrigger value="backup" className="text-xs font-bold gap-1.5">
              <FileCode className="size-3.5 text-emerald-500" /> DNS Vault
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: EMERGENCY OUTAGE TRIAGE */}
          <TabsContent value="triage" className="space-y-6">
            <div className="surface-panel p-5 sm:p-6 space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-red-500 flex items-center gap-1.5">
                  <AlertTriangle className="size-4" /> &quot;My Site or Email is Down&quot;
                  Emergency Triage
                </span>
                <h3 className="font-display text-lg font-bold text-foreground">
                  Select the exact symptom your visitors are seeing:
                </h3>
              </div>

              <Callout tone="warning" title="Do not delete unknown DNS records">
                Website records (A, CNAME) and mail records (MX, TXT for SPF/DKIM/DMARC) are separate. Changing website records should never require deleting mail records. If you don't recognise a record, leave it — it may be essential for email.
              </Callout>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  {
                    id: "site_unavailable",
                    title: "Website Unavailable",
                    desc: "Site simply won't load or shows blank — no HTTPS or DNS error details.",
                  },
                  {
                    id: "browser_red_warning",
                    title: "HTTPS Warning / SSL Error",
                    desc: "Browser blocks site with 'Your connection is not private' or certificate expired.",
                  },
                  {
                    id: "domain_not_found",
                    title: "DNS Error / NXDOMAIN",
                    desc: "Browser says 'This site can't be reached' or domain fails to resolve.",
                  },
                  {
                    id: "error_500_502",
                    title: "Hosting Error 500 / 502",
                    desc: "White screen or server error message while domain resolves fine.",
                  },
                  {
                    id: "mail_bouncing",
                    title: "Email Not Receiving / Sending",
                    desc: "Inbound mail missing, outbound bouncing, or messages land in Junk/Spam.",
                  },
                  {
                    id: "account_lockout",
                    title: "Account Access Loss",
                    desc: "Can't sign in to registrar, DNS, hosting, or business email account.",
                  },
                ].map((sym) => (
                  <button
                    key={sym.id}
                    type="button"
                    onClick={() => setTriageSymptom(sym.id)}
                    className={cn(
                      "p-4 rounded-xl border text-left transition-all space-y-1",
                      triageSymptom === sym.id
                        ? "border-red-500 bg-red-500/10 text-foreground font-bold shadow-sm"
                        : "border-border bg-card text-muted-foreground hover:border-primary/50",
                    )}
                  >
                    <div className="font-bold text-sm text-foreground">{sym.title}</div>
                    <div className="text-xs text-muted-foreground">{sym.desc}</div>
                  </button>
                ))}
              </div>

              {/* Triage Diagnostic Results & Ticket */}
              {triageDiagnostics && (
                <div className="rounded-xl border border-red-500/30 bg-card p-5 space-y-4 mt-4 shadow-sm animate-in fade-in-50">
                  <div className="space-y-1">
                    <Badge variant="destructive" className="text-xs font-bold">
                      Diagnostic Resolution Plan
                    </Badge>
                    <h4 className="font-display text-base font-bold text-foreground">
                      {triageDiagnostics.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      <strong>Root Cause:</strong> {triageDiagnostics.probableCause}
                    </p>
                  </div>

                  <div className="space-y-2 rounded-lg bg-muted/40 p-3.5 text-xs text-muted-foreground">
                    <strong className="text-foreground block font-bold">
                      Recommended Immediate Actions:
                    </strong>
                    {triageDiagnostics.immediateSteps.map((step, idx) => (
                      <div key={idx} className="text-foreground font-medium">
                        {step}
                      </div>
                    ))}
                  </div>

                  {/* Copyable Support Ticket */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">
                        Emergency Host / Registrar Support Ticket (Copy & Paste):
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyTicket(triageDiagnostics.supportTicketSnippet)}
                        className="text-[11px] h-7 gap-1"
                      >
                        <Copy className="size-3" /> Copy Ticket
                      </Button>
                    </div>
                    <pre className="text-[11px] text-muted-foreground bg-muted/30 p-3 rounded-lg font-mono whitespace-pre-wrap leading-relaxed border">
                      {triageDiagnostics.supportTicketSnippet}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB 2: 2FA & ACCOUNT FORTRESS AUDIT */}
          <TabsContent value="fortress" className="space-y-6">
            <div className="surface-panel p-5 sm:p-6 space-y-4">
              <Callout tone="warning" title="Registrar Lock reminder">
                Keep Registrar Lock / Transfer Lock ON at all times except during an intentional transfer. An unlocked domain can be hijacked with a single approval email.
              </Callout>
              <div className="rounded-xl border border-primary/20 bg-primary-soft/30 p-4 space-y-2">
                <h4 className="font-display text-sm font-bold flex items-center gap-1.5"><ShieldCheck className="size-4 text-primary" /> Domain Access & Recovery Checklist</h4>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-5">
                  <li>Registrar account uses a business-controlled email (not personal/freelancer) and recovery phone is current.</li>
                  <li>2FA set with authenticator app; backup recovery codes stored offline (not in this ledger).</li>
                  <li>Ownership record documents who holds registrar, DNS, hosting, email, and billing (see Ownership Record).</li>
                  <li>If access is lost: use provider Account Recovery, never brute-force passwords — then re-enable 2FA and Registrar Lock.</li>
                </ul>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">
                    Domain & Account Fortress Checklist
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Lock down your accounts to guarantee you never lose access to your website or
                    business email.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const all: Record<string, boolean> = {};
                    SECURITY_CHECKS.forEach((c) => (all[c.id] = true));
                    setSecurityDone(all);
                    localStorage.setItem("lmbo.security.drill.v1", JSON.stringify(all));
                    toast.success("All security items marked complete!");
                  }}
                  className="text-xs gap-1"
                >
                  <CheckCircle2 className="size-3.5 text-emerald-500" /> Mark All Hardened
                </Button>
              </div>

              <div className="space-y-3">
                {SECURITY_CHECKS.map((chk) => {
                  const isDone = !!securityDone[chk.id];
                  return (
                    <div
                      key={chk.id}
                      onClick={() => toggleSecurityItem(chk.id)}
                      className={cn(
                        "group flex items-start gap-3.5 rounded-xl border p-4 cursor-pointer transition-all",
                        isDone
                          ? "border-emerald-500/30 bg-emerald-500/5"
                          : "border-border bg-card hover:border-primary/50 hover:bg-muted/30",
                      )}
                    >
                      <button
                        type="button"
                        aria-label={isDone ? "Mark incomplete" : "Mark complete"}
                        className={cn(
                          "mt-0.5 flex size-5.5 shrink-0 items-center justify-center rounded-lg border transition-colors",
                          isDone
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-muted-foreground/40 bg-card group-hover:border-primary",
                        )}
                      >
                        {isDone ? <CheckCircle2 className="size-3.5 text-white" /> : null}
                      </button>

                      <div className="space-y-1 flex-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-foreground">{chk.title}</span>
                          <Badge
                            variant={chk.risk === "Critical" ? "destructive" : "outline"}
                            className="text-[10px]"
                          >
                            {chk.risk} Priority
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">{chk.description}</p>
                        <p className="text-primary font-medium text-[11px] mt-1">
                          Action: {chk.howTo}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: DNS BACKUP SNAPSHOT VAULT */}
          <TabsContent value="backup" className="space-y-6">
            <div className="surface-panel p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">
                    Authoritative DNS Zone Backup File
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Standard BIND zone file snapshot. If DNS records are ever accidentally erased,
                    import this file into Cloudflare or your registrar to restore everything
                    instantly. Guidance only — we never change your DNS automatically.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(zoneFileContent);
                      toast.success("Copied zone file text!");
                    }}
                    className="text-xs gap-1.5"
                  >
                    <Copy className="size-3.5" /> Copy Text
                  </Button>
                  <Button
                    size="sm"
                    onClick={downloadZoneSnapshot}
                    className="text-xs gap-1.5 bg-primary text-primary-foreground shadow"
                  >
                    <Download className="size-3.5" /> Download (.txt)
                  </Button>
                </div>
              </div>

              <Callout tone="info" title="DNS export guidance — no auto changes">
                Copy or download this file and store it offline before any DNS edits. To restore: paste the contents into your DNS provider's import / zone file feature. This app does not modify DNS for you — you control when and where to apply it.
              </Callout>

              <div className="rounded-xl border border-border bg-muted/40 p-4 font-mono text-[11px] text-foreground overflow-x-auto">
                <pre className="whitespace-pre">{zoneFileContent}</pre>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
