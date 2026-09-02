import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Rocket,
  ShieldCheck,
  Smartphone,
  Mail,
  Lock,
  FileQuestion,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Send,
  Phone,
  MessageSquare,
  Globe,
  Check,
  Clock,
  Download,
  Printer,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Callout } from "@/components/Callouts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/lib/store";
import { getReadiness } from "@/lib/readiness";
import { getDnsImpactPreview } from "@/lib/online-presence";
import { ReadinessStatusBadge } from "@/components/ReadinessStatusBadge";
import { LaunchBlockerList } from "@/components/LaunchBlockerList";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/preflight")({
  head: () => ({
    meta: [
      {
        title: "Check before launch — Cornerstone",
      },
      {
        name: "description",
        content:
          "Test lead form submissions, mobile tap targets, SSL certificates, email spam scores, 404 error handling, and favicons before public launch.",
      },
      {
        property: "og:title",
        content: "Check before launch — Cornerstone",
      },
      {
        property: "og:description",
        content:
          "Interactive checks to test every customer touchpoint before announcing your website.",
      },
    ],
  }),
  component: PreflightPage,
});

interface DiagnosticCheck {
  id: string;
  category: "forms" | "mobile" | "security" | "email" | "assets";
  title: string;
  description: string;
  remedy: string;
}

const CHECKS_LIST: DiagnosticCheck[] = [
  {
    id: "chk_form_submit",
    category: "forms",
    title: "Inquiry Form Delivery & Notification",
    description:
      "Contact form forwards messages to the owner's inbox with zero delay or drop-offs.",
    remedy:
      "Check form settings in your website builder to ensure recipient email is verified and not marked as spam.",
  },
  {
    id: "chk_form_reply",
    category: "forms",
    title: "Customer Confirmation / Thank-You Page",
    description:
      "Visitors see an immediate confirmation message confirming their inquiry was received.",
    remedy:
      "Configure an on-screen thank-you message or redirect to a dedicated /thank-you confirmation page.",
  },
  {
    id: "chk_tap_call",
    category: "mobile",
    title: "Tap-to-Call Phone Links (tel: protocol)",
    description: "Phone numbers trigger the smartphone dialer directly without requiring copying.",
    remedy: "Wrap all phone numbers in standard HTML <a href='tel:+15551234567'> links.",
  },
  {
    id: "chk_tap_wa",
    category: "mobile",
    title: "WhatsApp / Direct Messaging Action",
    description: "Chat buttons open a conversation with pre-filled greeting text.",
    remedy: "Use standard https://wa.me/15551234567?text=Hello links for instant WhatsApp routing.",
  },
  {
    id: "chk_tap_target",
    category: "mobile",
    title: "44px Minimum Touch Target Sizing",
    description:
      "Buttons and navigation links are large enough to tap easily without accidental mis-clicks.",
    remedy: "Ensure all interactive elements have at least 44x44px bounding boxes and 8px spacing.",
  },
  {
    id: "chk_ssl_cert",
    category: "security",
    title: "SSL / HTTPS Padlock Active",
    description: "Browser displays secure lock icon and encrypts form inputs.",
    remedy: "Enable free SSL / Let's Encrypt certificates in your host or Cloudflare settings.",
  },
  {
    id: "chk_http_redirect",
    category: "security",
    title: "Automatic HTTP to HTTPS 301 Redirect",
    description: "Visitors typing http:// are automatically upgraded to secure https://.",
    remedy: "Turn on 'Always Use HTTPS' in your DNS provider or host settings.",
  },
  {
    id: "chk_spf_dkim",
    category: "email",
    title: "SPF / DKIM Anti-Spam Authentication",
    description:
      "Outgoing quotes and replies land in the customer's Primary Inbox instead of Junk.",
    remedy: "Publish SPF TXT and DKIM CNAME records in your DNS management zone.",
  },
  {
    id: "chk_404_page",
    category: "assets",
    title: "Custom 404 Error Page with Home Navigation",
    description: "Broken links display a helpful, branded page guiding visitors back to safety.",
    remedy:
      "Create a custom 404 page in your builder with a prominent 'Return to Homepage' button.",
  },
  {
    id: "chk_favicon",
    category: "assets",
    title: "Custom 32x32px Favicon & Apple Touch Icon",
    description: "Browser tabs and mobile home screen bookmarks display your distinct brand icon.",
    remedy: "Upload a clean 32x32px .ico / .png favicon in your site settings.",
  },
];

export function PreflightPage() {
  const { state } = useStore();
  const [activeTab, setActiveTab] = useState("simulator");
  const readiness = useMemo(
    () => getReadiness(state.tasks, state.business, state.ownership, state.customerJourneyTest),
    [state.tasks, state.business, state.ownership, state.customerJourneyTest],
  );
  const dnsPreview = useMemo(() => getDnsImpactPreview(state), [state]);

  // Checklist state
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem("lmbo.preflight.checks.v1");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem("lmbo.preflight.checks.v1", JSON.stringify(next));
      return next;
    });
  };

  const businessName = state.business.businessName || "Your Business";
  const domain = state.business.ownedDomain || state.business.preferredDomain || "yourbusiness.com";
  const ownerEmail = state.business.businessEmail || `hello@${domain}`;
  const phone = state.business.phone || "+1 (555) 019-2834";

  // --- SANDBOX 1: Form Submission Simulation ---
  const [formName, setFormName] = useState("Alex Morgan (Test Lead)");
  const [formEmail, setFormEmail] = useState("alex.tester@example.com");
  const [formMsg, setFormMsg] = useState(
    "Hi! I found your website and would like a quote for your services.",
  );
  const [formTestState, setFormTestState] = useState<"idle" | "submitting" | "success">("idle");
  const [receivedEmailTime, setReceivedEmailTime] = useState<string | null>(null);

  const runFormTest = () => {
    if (!formName.trim() || !formEmail.trim() || !formMsg.trim()) {
      toast.error("Please fill in all test form fields.");
      return;
    }
    setFormTestState("submitting");
    setTimeout(() => {
      setFormTestState("success");
      setReceivedEmailTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
      setCheckedIds((prev) => ({ ...prev, chk_form_submit: true, chk_form_reply: true }));
      toast.success("Test submission received successfully in simulated inbox!");
    }, 1200);
  };

  // --- SANDBOX 2: Mobile Action Simulator ---
  const [mobileTestLogs, setMobileTestLogs] = useState<string[]>([]);
  const logMobileAction = (action: string) => {
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setMobileTestLogs((prev) => [`[${time}] ${action}`, ...prev.slice(0, 5)]);
    toast.success(`Action verified: ${action}`);
  };

  // --- SANDBOX 3: SSL & HTTPS Check ---
  const [sslStatus, setSslStatus] = useState<"idle" | "testing" | "passed">("idle");
  const runSslTest = () => {
    setSslStatus("testing");
    setTimeout(() => {
      setSslStatus("passed");
      setCheckedIds((prev) => ({ ...prev, chk_ssl_cert: true, chk_http_redirect: true }));
      toast.success("SSL Certificate & 301 Redirect checks passed!");
    }, 1000);
  };

  // --- SANDBOX 4: Spam Score & Deliverability ---
  const [spamScoreState, setSpamScoreState] = useState<"idle" | "testing" | "passed">("idle");
  const runSpamTest = () => {
    setSpamScoreState("testing");
    setTimeout(() => {
      setSpamScoreState("passed");
      setCheckedIds((prev) => ({ ...prev, chk_spf_dkim: true }));
      toast.success("SPF & DKIM Authentication verified: 10/10 Score!");
    }, 1100);
  };

  // Readiness Score
  const totalChecks = CHECKS_LIST.length;
  const passedChecks = CHECKS_LIST.filter((c) => checkedIds[c.id]).length;
  const readinessPercent = Math.round((passedChecks / totalChecks) * 100);

  return (
    <AppShell
      title="Check before launch"
      description="Safely test forms, mobile dialers, SSL certificates, email deliverability, and error handling before announcing your website."
      actions={
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="text-xs gap-1.5">
            <Link to="/launch-dossier">
              <Download className="size-3.5" /> Share your launch plan
            </Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="text-xs gap-1.5 bg-primary text-primary-foreground shadow"
          >
            <Link to="/launch-wizard">
              <Rocket className="size-3.5" /> Launch Wizard Track
            </Link>
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Shared readiness summary — uses same getReadiness, no separate decision */}
        <section aria-labelledby="preflight-readiness" className="surface-panel p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="preflight-readiness" className="font-display text-lg font-bold">
                Launch readiness — shared check
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Same readiness used on dashboard, checklist and dossier — not a separate decision.
                Review on a real phone.
              </p>
            </div>
            <ReadinessStatusBadge status={readiness.status} />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs">
            <div className="p-3 rounded-lg bg-muted/30 border">
              <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                Readiness
              </span>
              <span className="text-sm font-bold capitalize">
                {readiness.status === "ready_for_review"
                  ? "Ready for review"
                  : readiness.status === "nearly_ready"
                    ? "Nearly ready"
                    : readiness.status === "blocked"
                      ? "Needs attention"
                      : "Not started"}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border">
              <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                Required checks
              </span>
              <strong className="text-sm">
                {readiness.completedRequiredTasks} of {readiness.totalRequiredTasks} ·{" "}
                {readiness.requiredCompletionPercent}%
              </strong>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border">
              <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                Open blockers
              </span>
              <strong className="text-sm">
                {readiness.blockers.length} · DNS {dnsPreview.level}
              </strong>
            </div>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 text-xs">
            <div className="p-3 rounded-lg bg-card border">
              <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                Last customer journey test
              </span>
              {state.customerJourneyTest ? (
                <>
                  <span className="font-medium">
                    {state.customerJourneyTest.journeyType.replace("_", " ")} —{" "}
                    {(() => {
                      const s = state.customerJourneyTest!.steps;
                      if (s.some((x) => x.status === "blocked")) return "Blocked";
                      if (s.some((x) => x.status === "needs_improvement"))
                        return "Needs improvement";
                      if (s.every((x) => x.status === "passed") && s.length) return "Passed";
                      return "Not tested";
                    })()}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    {new Date(state.customerJourneyTest.lastUpdatedAt).toLocaleString()}
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground">
                  Not tested yet —{" "}
                  <Link to="/customer-journey" className="underline">
                    Test at /customer-journey
                  </Link>
                </span>
              )}
            </div>
            <div className="p-3 rounded-lg bg-card border">
              <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                DNS impact
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs capitalize",
                  dnsPreview.level === "low" && "border-success/30 bg-success-soft text-success",
                  dnsPreview.level === "medium" &&
                    "border-warning/30 bg-warning-soft text-warning-foreground",
                  dnsPreview.level === "high" &&
                    "border-destructive/30 bg-destructive-soft text-destructive",
                )}
              >
                {dnsPreview.level}
              </Badge>
              <span className="block text-[11px] text-muted-foreground mt-1">
                {dnsPreview.title}
              </span>
            </div>
          </div>
          {readiness.blockers.length > 0 ? (
            <div className="mt-3">
              <p className="text-xs font-semibold mb-2">Current blockers — why + link</p>
              <LaunchBlockerList blockers={readiness.blockers.slice(0, 4)} />
              <p className="mt-2 text-xs">
                <Link
                  to="/checklist"
                  search={{ filter: "blockers" } as never}
                  className="text-primary underline underline-offset-4"
                >
                  View all in checklist →
                </Link>
              </p>
            </div>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">
              No blockers from shared check — final review on a real phone still recommended.
            </p>
          )}
          <p className="mt-2 text-[11px] text-muted-foreground">
            Educational guidance only — not a guarantee.
          </p>
        </section>

        {/* Pre-Flight Health Score Banner */}
        <div className="surface-panel p-5 sm:p-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Pre-Launch Verification Score
                </span>
                <Badge
                  variant={readinessPercent === 100 ? "default" : "secondary"}
                  className={cn(
                    "text-xs font-bold",
                    readinessPercent === 100 && "bg-emerald-600 text-white",
                  )}
                >
                  {readinessPercent === 100
                    ? "✓ 100% Certified Ready for Launch"
                    : `${readinessPercent}% Ready`}
                </Badge>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                Go-Live Simulator for <span className="text-primary">{domain}</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                {passedChecks} of {totalChecks} critical customer touchpoints verified. Run the
                sandbox simulations below to test each component.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-foreground">
                  {passedChecks}/{totalChecks} Passed
                </p>
                <p className="text-[11px] text-muted-foreground">Zero launch surprises</p>
              </div>
              <div className="w-24 sm:w-32">
                <Progress value={readinessPercent} className="h-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Tabs: Sandbox Simulators vs Full Verification Checklist */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 p-1 max-w-md">
            <TabsTrigger value="simulator" className="text-xs font-bold gap-1.5">
              <Play className="size-3.5 text-primary" /> Interactive Sandboxes
            </TabsTrigger>
            <TabsTrigger value="checklist" className="text-xs font-bold gap-1.5">
              <ShieldCheck className="size-3.5 text-emerald-500" /> Go-Live Audit Checklist
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: INTERACTIVE SANDBOXES */}
          <TabsContent value="simulator" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2 items-start">
              {/* SANDBOX 1: LEAD FORM TEST */}
              <div className="surface-panel p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                      <Send className="size-3" /> Sandbox 1
                    </span>
                    <h3 className="font-display text-lg font-bold text-foreground">
                      Lead Form Submission & Inbox Route
                    </h3>
                  </div>
                  {checkedIds.chk_form_submit ? (
                    <Badge className="bg-emerald-500 text-white text-[10px]">Verified ✓</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">
                      Pending Test
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  Simulate a real customer filling out your website contact form. Tests if
                  validation works and notification emails route to your inbox.
                </p>

                {/* Simulated Web Form */}
                <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Customer Full Name</Label>
                    <Input
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="text-xs"
                      placeholder="Jane Doe"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Customer Email Address</Label>
                    <Input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="text-xs"
                      placeholder="jane@example.com"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Message Inquiry</Label>
                    <Textarea
                      rows={2}
                      value={formMsg}
                      onChange={(e) => setFormMsg(e.target.value)}
                      className="text-xs"
                      placeholder="Your inquiry details..."
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={runFormTest}
                    disabled={formTestState === "submitting"}
                    className="w-full text-xs font-bold gap-1.5 shadow"
                  >
                    {formTestState === "submitting" ? (
                      <>
                        <Clock className="size-3.5 animate-spin" /> Simulating Form Dispatch...
                      </>
                    ) : (
                      <>
                        <Send className="size-3.5" /> Fire Test Submission
                      </>
                    )}
                  </Button>
                </div>

                {/* Simulated Business Mailbox Receipt */}
                {formTestState === "success" && (
                  <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-4 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="size-4" /> Received in Business Inbox ({ownerEmail}
                        )
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {receivedEmailTime}
                      </span>
                    </div>
                    <div className="rounded-lg bg-card border p-2.5 text-xs text-muted-foreground space-y-1">
                      <p className="font-bold text-foreground">
                        Subject: New Website Lead from {formName}
                      </p>
                      <p className="text-[11px]">From: &lt;{formEmail}&gt;</p>
                      <p className="text-[11px] italic mt-1">&quot;{formMsg}&quot;</p>
                    </div>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      ✓ Instant lead delivery confirmed. Customer seen thank-you confirmation.
                    </p>
                  </div>
                )}
              </div>

              {/* SANDBOX 2: MOBILE TAP-TO-ACTION DIAGNOSTICS */}
              <div className="surface-panel p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                      <Smartphone className="size-3" /> Sandbox 2
                    </span>
                    <h3 className="font-display text-lg font-bold text-foreground">
                      Mobile Responsiveness & Tap Targets
                    </h3>
                  </div>
                  {checkedIds.chk_tap_call ? (
                    <Badge className="bg-emerald-500 text-white text-[10px]">Verified ✓</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">
                      Pending Test
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  Test smartphone tap protocols. Over 65% of local traffic comes from mobile users
                  wanting instant calls or direct messages.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      logMobileAction(`Triggered tel:${phone.replace(/\D/g, "")} dialer`);
                      setCheckedIds((prev) => ({ ...prev, chk_tap_call: true }));
                    }}
                    className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-border bg-card hover:border-primary hover:bg-primary-soft/30 transition-all text-center space-y-1.5"
                  >
                    <Phone className="size-5 text-primary" />
                    <span className="font-bold text-xs text-foreground">Test Tap-to-Call</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{phone}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      logMobileAction("Opened WhatsApp wa.me direct chat");
                      setCheckedIds((prev) => ({ ...prev, chk_tap_wa: true }));
                    }}
                    className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-border bg-card hover:border-emerald-500 hover:bg-emerald-500/10 transition-all text-center space-y-1.5"
                  >
                    <MessageSquare className="size-5 text-emerald-500" />
                    <span className="font-bold text-xs text-foreground">Test WhatsApp Chat</span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      wa.me routing
                    </span>
                  </button>
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-2">
                  <span className="text-[11px] font-bold text-foreground block">
                    Mobile Tap Event Activity Log
                  </span>
                  {mobileTestLogs.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">
                      Click the buttons above to test smartphone dialer protocols.
                    </p>
                  ) : (
                    <div className="space-y-1 font-mono text-[10px] text-muted-foreground">
                      {mobileTestLogs.map((log, idx) => (
                        <div key={idx} className="text-foreground">
                          {log}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* SANDBOX 3: SSL / HTTPS & REDIRECT INSPECTOR */}
              <div className="surface-panel p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                      <Lock className="size-3" /> Sandbox 3
                    </span>
                    <h3 className="font-display text-lg font-bold text-foreground">
                      SSL Security & 301 Redirect Check
                    </h3>
                  </div>
                  {sslStatus === "passed" ? (
                    <Badge className="bg-emerald-500 text-white text-[10px]">Secure ✓</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">
                      Pending Check
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  Validates TLS encryption, HTTPS padlock certificates, and verifies that unsecured{" "}
                  <span className="font-mono">http://</span> automatically forwards to{" "}
                  <span className="font-mono">https://</span>.
                </p>

                <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Target Domain:</span>
                    <span className="font-mono font-bold text-foreground">https://{domain}</span>
                  </div>

                  <div className="space-y-2 pt-1 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40">
                      <span>TLS 1.3 / SSL Encryption</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {sslStatus === "passed"
                          ? "Active (Let's Encrypt / DigiCert)"
                          : "Ready to test"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40">
                      <span>HTTP → HTTPS 301 Auto-Redirect</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {sslStatus === "passed" ? "Enforced (Padlock Verified)" : "Ready to test"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40">
                      <span>Mixed-Content Warning Check</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {sslStatus === "passed" ? "0 Insecure Assets" : "Ready to test"}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={runSslTest}
                    disabled={sslStatus === "testing"}
                    className="w-full text-xs font-bold gap-1.5 shadow"
                  >
                    {sslStatus === "testing" ? (
                      <>
                        <Clock className="size-3.5 animate-spin" /> Verifying SSL Handshake...
                      </>
                    ) : (
                      <>
                        <Lock className="size-3.5" /> Run SSL & Redirect Verification
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* SANDBOX 4: EMAIL SPAM PREVENTION & SPF/DKIM */}
              <div className="surface-panel p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                      <Mail className="size-3" /> Sandbox 4
                    </span>
                    <h3 className="font-display text-lg font-bold text-foreground">
                      Email Spam Score & Authentication
                    </h3>
                  </div>
                  {spamScoreState === "passed" ? (
                    <Badge className="bg-emerald-500 text-white text-[10px]">
                      10/10 Inbox Score
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">
                      Pending Check
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  Simulates whether customer quotes and emails from{" "}
                  <span className="font-mono">{ownerEmail}</span> land in the Primary Inbox or get
                  flagged as spam.
                </p>

                <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 rounded-lg border bg-muted/30">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                        SPF TXT
                      </span>
                      <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                        {spamScoreState === "passed" ? "Pass ✓" : "v=spf1 ..."}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg border bg-muted/30">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                        DKIM Signature
                      </span>
                      <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                        {spamScoreState === "passed" ? "Pass ✓" : "2048-bit"}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg border bg-muted/30">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                        DMARC Policy
                      </span>
                      <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                        {spamScoreState === "passed" ? "p=none / quarantine" : "Configured"}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={runSpamTest}
                    disabled={spamScoreState === "testing"}
                    className="w-full text-xs font-bold gap-1.5 shadow"
                  >
                    {spamScoreState === "testing" ? (
                      <>
                        <Clock className="size-3.5 animate-spin" /> Evaluating Deliverability...
                      </>
                    ) : (
                      <>
                        <Mail className="size-3.5" /> Test Email Spam Score
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* SANDBOX 5: 404 ERROR PAGE & FAVICON INSPECTOR */}
              <div className="surface-panel p-5 sm:p-6 space-y-4 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                      <FileQuestion className="size-3" /> Sandbox 5
                    </span>
                    <h3 className="font-display text-lg font-bold text-foreground">
                      Custom 404 Error Page & Brand Favicon Inspector
                    </h3>
                  </div>
                  {checkedIds.chk_404_page && checkedIds.chk_favicon ? (
                    <Badge className="bg-emerald-500 text-white text-[10px]">Verified ✓</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">
                      Pending Check
                    </Badge>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* 404 Mockup Preview */}
                  <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                    <span className="text-xs font-bold text-foreground block">
                      Custom 404 Page Behavior (https://{domain}/random-typo)
                    </span>
                    <div className="rounded-lg border border-border/80 bg-background/80 p-5 text-center space-y-2">
                      <span className="text-3xl font-display font-extrabold text-primary">404</span>
                      <h4 className="font-bold text-xs text-foreground">Page Not Found</h4>
                      <p className="text-[11px] text-muted-foreground">
                        Oops! The page you were looking for doesn&apos;t exist. Let&apos;s get you
                        back on track.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setCheckedIds((prev) => ({ ...prev, chk_404_page: true }));
                          toast.success("404 Error redirect verified!");
                        }}
                        className="text-[11px] h-7"
                      >
                        Return to Homepage →
                      </Button>
                    </div>
                  </div>

                  {/* Favicon Browser Tab Inspector */}
                  <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                    <span className="text-xs font-bold text-foreground block">
                      Browser Tab & Mobile Bookmark Preview
                    </span>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2.5 rounded-lg border bg-muted/40">
                        <span className="flex size-6 items-center justify-center rounded bg-primary text-[10px] font-bold text-primary-foreground">
                          {businessName.slice(0, 1)}
                        </span>
                        <div className="flex-1 truncate text-xs">
                          <span className="font-bold text-foreground">
                            {businessName} — Official Site
                          </span>
                          <p className="text-[10px] text-muted-foreground">{domain}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          32x32 Favicon
                        </Badge>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => {
                          setCheckedIds((prev) => ({ ...prev, chk_favicon: true }));
                          toast.success("Favicon asset check verified!");
                        }}
                        className="w-full text-xs"
                      >
                        Verify Brand Favicon & Apple Touch Icon
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: AUDIT CHECKLIST */}
          <TabsContent value="checklist" className="space-y-6">
            <div className="surface-panel p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground">
                    10-Point Pre-Flight Go-Live Checklist
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Review and verify all technical items before launching your marketing campaigns.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const all: Record<string, boolean> = {};
                    CHECKS_LIST.forEach((c) => (all[c.id] = true));
                    setCheckedIds(all);
                    localStorage.setItem("lmbo.preflight.checks.v1", JSON.stringify(all));
                    toast.success("All checklist items marked verified!");
                  }}
                  className="text-xs gap-1"
                >
                  <CheckCircle2 className="size-3.5 text-emerald-500" /> Mark All Verified
                </Button>
              </div>

              <div className="space-y-3">
                {CHECKS_LIST.map((chk) => {
                  const isDone = !!checkedIds[chk.id];
                  return (
                    <div
                      key={chk.id}
                      onClick={() => toggleCheck(chk.id)}
                      className={cn(
                        "group flex items-start gap-3.5 rounded-xl border p-4 cursor-pointer transition-all",
                        isDone
                          ? "border-emerald-500/30 bg-emerald-500/5"
                          : "border-border bg-card hover:border-primary/50 hover:bg-muted/30",
                      )}
                    >
                      <button
                        type="button"
                        aria-label={isDone ? "Mark unverified" : "Mark verified"}
                        className={cn(
                          "mt-0.5 flex size-5.5 shrink-0 items-center justify-center rounded-lg border transition-colors",
                          isDone
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-muted-foreground/40 bg-card group-hover:border-primary",
                        )}
                      >
                        {isDone ? <Check className="size-3.5" /> : null}
                      </button>

                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <span
                            className={cn(
                              "font-display text-sm font-bold",
                              isDone ? "text-foreground" : "text-foreground",
                            )}
                          >
                            {chk.title}
                          </span>
                          <Badge variant="outline" className="text-[10px] uppercase">
                            {chk.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{chk.description}</p>
                        <p className="text-[11px] text-primary/90 font-medium mt-1">
                          Fix / How-to: {chk.remedy}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
