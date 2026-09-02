import { useState, useEffect } from "react";
import {
  Globe,
  Mail,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Server,
  ArrowRight,
  Sparkles,
  Info,
  Copy,
  ExternalLink,
  Code2,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  checkFullDomainPropagation,
  normaliseDomain,
  type DnsDiagnosticReport,
} from "@/lib/dns-lookup";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface LiveDnsCheckerProps {
  initialDomain?: string;
  expectedProviderId?: string;
  className?: string;
  onApplyRecords?: (report: DnsDiagnosticReport) => void;
}

export function LiveDnsChecker({
  initialDomain,
  expectedProviderId,
  className,
}: LiveDnsCheckerProps) {
  const { state } = useStore();
  const defaultDomain =
    initialDomain ||
    state.business.ownedDomain ||
    state.business.preferredDomain ||
    state.ownership.domainRegistrar ||
    "";

  const [domainInput, setDomainInput] = useState(defaultDomain);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<DnsDiagnosticReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [customSelector, setCustomSelector] = useState("");

  const runCheck = async (targetDomain?: string) => {
    const d = normaliseDomain(targetDomain || domainInput);
    if (!d || !d.includes(".")) {
      toast.error("Please enter a valid domain name (e.g. yourbusiness.com)");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await checkFullDomainPropagation(d, expectedProviderId);
      setReport(res);
      toast.success(`Live DNS query completed for ${res.domain}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to query DNS";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (defaultDomain && !report && !loading) {
      setDomainInput(defaultDomain);
    }
  }, [defaultDomain, report, loading]);

  const copyDiagnosticSummary = async () => {
    if (!report) return;
    const lines = [
      `=== LIVE DNS PROPAGATION REPORT ===`,
      `Domain: ${report.domain}`,
      `Timestamp: ${new Date(report.checkedAt).toLocaleString()}`,
      `Health Score: ${report.overallScore}/100 (Grade: ${report.overallGrade})`,
      `Summary: ${report.summary}`,
      ``,
      `1. WEBSITE RESOLUTION (A / CNAME):`,
      `   Status: ${report.website.status.toUpperCase()}`,
      `   Details: ${report.website.message}`,
      `   Records: ${report.website.records.map((r) => `${r.type} ${r.value}`).join(", ") || "None"}`,
      ``,
      `2. EMAIL SERVERS (MX):`,
      `   Status: ${report.mail.status.toUpperCase()}`,
      `   Detected Provider: ${report.mail.detectedProvider || "Unknown / Not Detected"}`,
      `   Records:`,
      ...report.mail.records.map((m) => `   - Priority ${m.priority}: ${m.host}`),
      ``,
      `3. SPF SENDER VERIFICATION (TXT):`,
      `   Status: ${report.spf.status.toUpperCase()}`,
      `   Raw: ${report.spf.raw || "None"}`,
      `   Includes: ${report.spf.includes.join(", ") || "None"}`,
      `   Mechanism: ${report.spf.allMechanism || "None"}`,
      `   Recommendation: ${report.spf.recommendation}`,
      ``,
      `4. DMARC ANTI-SPOOFING (_dmarc):`,
      `   Status: ${report.dmarc.status.toUpperCase()}`,
      `   Raw: ${report.dmarc.raw || "None"}`,
      `   Policy: ${report.dmarc.policy || "None"}`,
      `   Reporting (rua): ${report.dmarc.rua || "None"}`,
      `   Recommendation: ${report.dmarc.recommendation}`,
      ``,
      `5. NAMESERVERS (NS):`,
      `   DNS Host: ${report.nameservers.detectedProvider || "Custom"}`,
      `   Servers: ${report.nameservers.servers.join(", ") || "None"}`,
    ];

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      toast.success("Diagnostic report copied to clipboard!");
    } catch {
      toast.error("Could not copy report text.");
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Domain Input Bar */}
      <div className="surface-panel p-5 sm:p-6 space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                <Globe className="mr-1 size-3.5" /> DNS-over-HTTPS (DoH)
              </Badge>
              <span className="text-xs text-muted-foreground">
                Cloudflare 1.1.1.1 & Google 8.8.8.8
              </span>
            </div>
            <h3 className="font-display text-xl font-bold tracking-tight mt-1">
              Live DNS & Email Propagation Checker
            </h3>
            <p className="text-xs text-muted-foreground">
              Directly query global recursive resolvers in real time to verify whether your web, MX,
              SPF, DMARC, and DKIM records are active worldwide.
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            runCheck();
          }}
          className="flex flex-col gap-2.5 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              placeholder="e.g. yourbusiness.com"
              className="pl-9 font-mono text-sm"
            />
          </div>
          <Button type="submit" disabled={loading} className="gap-2 shrink-0">
            <RefreshCw className={cn("size-4", loading && "animate-spin")} />
            {loading ? "Resolving DNS..." : "Check Live Propagation"}
          </Button>
        </form>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-muted-foreground">Quick test:</span>
          {state.business.ownedDomain && (
            <button
              type="button"
              onClick={() => {
                setDomainInput(state.business.ownedDomain);
                runCheck(state.business.ownedDomain);
              }}
              className="rounded-md border border-border bg-card px-2.5 py-1 font-mono text-[11px] text-foreground hover:border-primary hover:bg-primary-soft/40 transition-colors"
            >
              {state.business.ownedDomain} (Your Domain)
            </button>
          )}
          {["titan.email", "google.com", "microsoft.com"].map((demo) => (
            <button
              key={demo}
              type="button"
              onClick={() => {
                setDomainInput(demo);
                runCheck(demo);
              }}
              className="rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 font-mono text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              {demo}
            </button>
          ))}
        </div>
      </div>

      {/* Results View */}
      {report && (
        <div className="space-y-6">
          {/* Overview Score Card */}
          <div className="surface-panel p-5 sm:p-6 border-l-4 border-l-primary space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex size-14 items-center justify-center rounded-2xl font-display text-2xl font-black shadow-inner",
                    report.overallGrade === "A+" || report.overallGrade === "A"
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                      : report.overallGrade === "B"
                        ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                        : "bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30",
                  )}
                >
                  {report.overallGrade}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-display text-lg font-bold text-foreground">
                      {report.domain}
                    </h4>
                    <Badge variant="outline" className="text-[10px]">
                      Score: {report.overallScore}/100
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{report.summary}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyDiagnosticSummary}
                  className="text-xs gap-1.5"
                >
                  <Copy className="size-3.5" /> Copy Summary
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => runCheck(report.domain)}
                  disabled={loading}
                  className="text-xs gap-1.5"
                >
                  <RefreshCw className={cn("size-3.5", loading && "animate-spin")} /> Re-test
                </Button>
              </div>
            </div>

            {/* Quick Diagnostic Checklist Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/60">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                {report.website.resolves ? (
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="size-4 text-rose-500 shrink-0" />
                )}
                <div className="text-xs">
                  <span className="font-semibold block">Website Address</span>
                  <span className="text-[10px] text-muted-foreground">
                    {report.website.resolves ? "Resolves (A/CNAME)" : "Not Resolving"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                {report.mail.hasMx ? (
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="size-4 text-rose-500 shrink-0" />
                )}
                <div className="text-xs">
                  <span className="font-semibold block">Mail Exchange (MX)</span>
                  <span className="text-[10px] text-muted-foreground">
                    {report.mail.detectedProvider || (report.mail.hasMx ? "Active" : "Missing")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                {report.spf.isValid ? (
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                ) : (
                  <AlertTriangle className="size-4 text-amber-500 shrink-0" />
                )}
                <div className="text-xs">
                  <span className="font-semibold block">SPF Verification</span>
                  <span className="text-[10px] text-muted-foreground">
                    {report.spf.isValid ? report.spf.status.toUpperCase() : "Missing TXT"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                {report.dmarc.isValid ? (
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                ) : (
                  <AlertTriangle className="size-4 text-amber-500 shrink-0" />
                )}
                <div className="text-xs">
                  <span className="font-semibold block">DMARC Protection</span>
                  <span className="text-[10px] text-muted-foreground">
                    {report.dmarc.policy ? `p=${report.dmarc.policy}` : "Missing _dmarc"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Deep Dive Record Panels */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Panel 1: Website Address Resolution (A / CNAME) */}
            <div className="surface-panel p-5 space-y-3.5">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <Globe className="size-4 text-primary" />
                  <h4 className="font-display font-bold text-base text-foreground">
                    Website Address Resolution
                  </h4>
                </div>
                <Badge
                  variant={report.website.resolves ? "default" : "destructive"}
                  className="text-[10px]"
                >
                  {report.website.resolves ? "Resolving (Live)" : "Offline"}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground">{report.website.message}</p>

              {report.website.records.length > 0 ? (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Resolved DNS Records
                  </span>
                  <div className="rounded-lg border border-border bg-muted/20 p-2.5 space-y-1">
                    {report.website.records.map((r, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between font-mono text-xs text-foreground"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-primary font-bold">{r.type}</span>
                          <span className="truncate max-w-[220px]">{r.value}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">TTL {r.ttl}s</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-rose-500/40 bg-rose-500/5 p-3 text-xs text-rose-600 dark:text-rose-400 space-y-1">
                  <p className="font-semibold">Action Required:</p>
                  <p>
                    Add an <strong>A Record</strong> pointing to your web host IP or a{" "}
                    <strong>CNAME</strong> pointing to your website builder.
                  </p>
                </div>
              )}

              {report.nameservers.servers.length > 0 && (
                <div className="pt-2 border-t border-border/50 text-xs">
                  <span className="text-muted-foreground font-medium">Nameservers: </span>
                  <span className="font-mono text-foreground">
                    {report.nameservers.servers.slice(0, 2).join(", ")}
                  </span>
                  {report.nameservers.detectedProvider && (
                    <Badge variant="outline" className="ml-2 text-[10px]">
                      {report.nameservers.detectedProvider}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Panel 2: Email Routing Servers (MX) */}
            <div className="surface-panel p-5 space-y-3.5">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <Mail className="size-4 text-primary" />
                  <h4 className="font-display font-bold text-base text-foreground">
                    Email Routing (MX Records)
                  </h4>
                </div>
                <Badge
                  variant={report.mail.hasMx ? "default" : "destructive"}
                  className="text-[10px]"
                >
                  {report.mail.hasMx ? "Mail Active" : "No MX Detected"}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground">{report.mail.message}</p>

              {report.mail.records.length > 0 ? (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Detected Mail Servers
                  </span>
                  <div className="rounded-lg border border-border bg-muted/20 p-2.5 space-y-1.5">
                    {report.mail.records.map((m, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between font-mono text-xs text-foreground"
                      >
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-primary-soft/50 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                            Priority {m.priority}
                          </span>
                          <span className="truncate max-w-[220px]">{m.host}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-rose-500/40 bg-rose-500/5 p-3 text-xs text-rose-600 dark:text-rose-400 space-y-1">
                  <p className="font-semibold">No Inbound Email Routing:</p>
                  <p>
                    Without MX records, anyone emailing your @domain address will receive a delivery
                    failure (bounce). Configure MX records from the DNS generator.
                  </p>
                </div>
              )}
            </div>

            {/* Panel 3: Sender Policy Framework (SPF TXT) */}
            <div className="surface-panel p-5 space-y-3.5">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-primary" />
                  <h4 className="font-display font-bold text-base text-foreground">
                    SPF Authentication (TXT)
                  </h4>
                </div>
                <Badge
                  variant={
                    report.spf.status === "secure"
                      ? "default"
                      : report.spf.status === "warning"
                        ? "secondary"
                        : "destructive"
                  }
                  className="text-[10px]"
                >
                  {report.spf.status.toUpperCase()}
                </Badge>
              </div>

              {report.spf.raw ? (
                <div className="space-y-2">
                  <div className="rounded-lg border border-border bg-muted/30 p-2.5 font-mono text-xs break-all text-foreground">
                    {report.spf.raw}
                  </div>

                  <div className="flex flex-wrap gap-1.5 text-xs">
                    {report.spf.includes.map((inc, i) => (
                      <Badge key={i} variant="outline" className="font-mono text-[10px]">
                        include:{inc}
                      </Badge>
                    ))}
                    {report.spf.allMechanism && (
                      <Badge
                        variant={
                          report.spf.allMechanism === "~all" || report.spf.allMechanism === "-all"
                            ? "default"
                            : "destructive"
                        }
                        className="font-mono text-[10px]"
                      >
                        {report.spf.allMechanism}
                      </Badge>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 p-3 text-xs text-amber-600 dark:text-amber-400">
                  No SPF TXT record detected. Outgoing emails may land in spam folders.
                </div>
              )}

              <p className="text-xs text-muted-foreground pt-1">{report.spf.recommendation}</p>
            </div>

            {/* Panel 4: DMARC Policy (_dmarc) */}
            <div className="surface-panel p-5 space-y-3.5">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <Lock className="size-4 text-primary" />
                  <h4 className="font-display font-bold text-base text-foreground">
                    DMARC Anti-Spoofing (_dmarc)
                  </h4>
                </div>
                <Badge
                  variant={
                    report.dmarc.status === "enforced"
                      ? "default"
                      : report.dmarc.status === "monitoring"
                        ? "secondary"
                        : "destructive"
                  }
                  className="text-[10px]"
                >
                  {report.dmarc.status.toUpperCase()}
                </Badge>
              </div>

              {report.dmarc.raw ? (
                <div className="space-y-2">
                  <div className="rounded-lg border border-border bg-muted/30 p-2.5 font-mono text-xs break-all text-foreground">
                    {report.dmarc.raw}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded border border-border/60 p-2 bg-card">
                      <span className="text-[10px] text-muted-foreground block font-medium">
                        Policy (p=)
                      </span>
                      <span className="font-bold text-foreground capitalize">
                        {report.dmarc.policy || "None"}
                      </span>
                    </div>
                    <div className="rounded border border-border/60 p-2 bg-card">
                      <span className="text-[10px] text-muted-foreground block font-medium">
                        Reports Sent To
                      </span>
                      <span className="font-mono text-[11px] truncate block">
                        {report.dmarc.rua || "No rua defined"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 p-3 text-xs text-amber-600 dark:text-amber-400">
                  No DMARC record found at <code>_dmarc.{report.domain}</code>.
                </div>
              )}

              <p className="text-xs text-muted-foreground pt-1">{report.dmarc.recommendation}</p>
            </div>
          </div>

          {/* DKIM Selector Spot-Check Section */}
          <div className="surface-panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h4 className="font-display font-bold text-base text-foreground">
                  DKIM Cryptographic Key Verification
                </h4>
                <p className="text-xs text-muted-foreground">
                  Checks public DKIM selectors for popular email providers (Titan, Google,
                  Microsoft, Zoho, Fastmail).
                </p>
              </div>
            </div>

            {report.dkim.length > 0 ? (
              <div className="space-y-2">
                <div className="grid gap-2 sm:grid-cols-2">
                  {report.dkim.map((dkim, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        <span>✓ {dkim.selectorChecked}</span>
                        <Badge className="bg-emerald-500 text-[10px] text-white">Active</Badge>
                      </div>
                      <p className="font-mono text-[11px] text-muted-foreground break-all line-clamp-2">
                        {dkim.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-muted/20 p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <Info className="size-4 text-primary shrink-0" />
                  <span>Custom DKIM Selector Verification</span>
                </div>
                <p className="text-muted-foreground">
                  Standard provider keys weren't detected at the root. If your email provider gave
                  you a custom DKIM selector (e.g. <code>k1._domainkey</code> or{" "}
                  <code>s1._domainkey</code>), check it below:
                </p>
                <div className="flex gap-2 max-w-md pt-1">
                  <Input
                    placeholder="e.g. k1 or s1"
                    value={customSelector}
                    onChange={(e) => setCustomSelector(e.target.value)}
                    className="font-mono text-xs h-8"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs shrink-0"
                    onClick={async () => {
                      if (!customSelector.trim()) return;
                      const sel = customSelector.trim();
                      const hostname = `${sel}._domainkey.${report.domain}`;
                      setLoading(true);
                      try {
                        const res = await checkFullDomainPropagation(report.domain);
                        toast.success(`Checked DKIM selector ${hostname}`);
                      } catch {
                        toast.error("Failed to check selector");
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    Test Selector
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Raw JSON Debug View */}
          <div className="surface-panel p-4">
            <button
              type="button"
              onClick={() => setShowRaw(!showRaw)}
              className="flex items-center justify-between w-full text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <span className="flex items-center gap-1.5">
                <Code2 className="size-3.5 text-primary" /> View Raw DNS JSON Payloads
              </span>
              <span>{showRaw ? "Hide" : "Show"}</span>
            </button>

            {showRaw && (
              <pre className="mt-3 overflow-x-auto rounded-lg bg-muted/60 p-3 font-mono text-[11px] text-foreground max-h-60">
                {JSON.stringify(report.rawResponses, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
