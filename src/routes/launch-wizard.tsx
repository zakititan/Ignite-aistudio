import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  ArrowLeft,
  Globe,
  Mail,
  Blocks,
  Network,
  MapPin,
  Rocket,
  ExternalLink,
  Clock,
  Sparkles,
  ShieldCheck,
  FileText,
  AlertCircle,
  Check,
  ChevronRight,
  RotateCcw,
  Printer,
  Download,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Callout } from "@/components/Callouts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/launch-wizard")({
  head: () => ({
    meta: [
      {
        title: "Launch Step-by-Step Setup Wizard — Linear Launch Track",
      },
      {
        name: "description",
        content:
          "Follow the sequential 6-step roadmap from securing your domain to professional email, website building, DNS connection, Google Business setup, and pre-flight verification.",
      },
      {
        property: "og:title",
        content: "Guided Step-by-Step Launch Wizard",
      },
      {
        property: "og:description",
        content:
          "A structured, sequential track to take your business from idea to a verified live website.",
      },
    ],
  }),
  component: LaunchWizardPage,
});

interface WizardStep {
  id: number;
  title: string;
  shortTitle: string;
  tagline: string;
  estTime: string;
  icon: typeof Globe;
  toolUrl: string;
  toolLabel: string;
  description: string;
  whyItMatters: string;
  tasks: {
    id: string;
    title: string;
    description: string;
    critical?: boolean;
    helpTip?: string;
  }[];
  proTips: string[];
  commonMistakes: string[];
}

const WIZARD_STEPS: WizardStep[] = [
  {
    id: 1,
    title: "1. Secure & Own Your Domain",
    shortTitle: "1. Secure Domain",
    tagline: "Register your brand address in your name with transfer locks and privacy.",
    estTime: "10-15 mins",
    icon: Globe,
    toolUrl: "/domains",
    toolLabel: "Open Domain Finder",
    description:
      "Your domain name is your primary digital real estate. Ensuring that YOU—not an agency, contractor, or third party—own the master account is the single most critical foundation.",
    whyItMatters:
      "Losing custody of your domain or having it locked in a third-party account can paralyze your website, email, and brand reputation.",
    tasks: [
      {
        id: "s1_choose",
        title: "Select a clear, memorable domain name",
        description:
          "Prioritize .com or your local country code (.co.uk, .ca, .com.au) without confusing hyphens or spelling tricks.",
        helpTip:
          "Use our Domain Finder tool to evaluate clarity, pronunciation, and spelling scores.",
      },
      {
        id: "s1_register",
        title: "Register domain directly under your own personal/business email",
        description:
          "Use a reputable registrar (Namecheap, Porkbun, Cloudflare, Google Domains/Squarespace) using an email you always control.",
        critical: true,
      },
      {
        id: "s1_privacy",
        title: "Enable WHOIS / ID Privacy protection",
        description:
          "Keeps your personal phone number, home address, and personal email off public spam databases (usually free).",
      },
      {
        id: "s1_lock",
        title: "Turn on Registrar Transfer Lock & Auto-Renewal",
        description:
          "Prevents unauthorized domain transfers and safeguards against accidental expiration.",
      },
      {
        id: "s1_verify",
        title: "Click the ICANN Registrant Verification email",
        description:
          "Check your inbox immediately after purchase to verify contact info, or registrars will suspend the domain within 15 days.",
        critical: true,
      },
    ],
    proTips: [
      "Always pay using a primary business credit card with auto-renewal enabled.",
      "Never let a web designer or agency register the domain in their own account.",
    ],
    commonMistakes: [
      "Buying expensive bundled web hosting before knowing what platform you need.",
      "Missing the ICANN verification email leading to temporary domain suspension.",
    ],
  },
  {
    id: 2,
    title: "2. Set Up Professional Business Email",
    shortTitle: "2. Business Email",
    tagline: "Establish trust with you@yourdomain.com instead of generic free webmail.",
    estTime: "15-20 mins",
    icon: Mail,
    toolUrl: "/business-email",
    toolLabel: "Open Email Guide & DNS Generator",
    description:
      "Customers trust businesses with matching custom domain emails 9x more than @gmail.com or @yahoo.com addresses. Set up your inbox before launching marketing.",
    whyItMatters:
      "A custom domain email prevents supplier skepticism, builds instant authority, and keeps your customer communications separate from personal mail.",
    tasks: [
      {
        id: "s2_provider",
        title: "Choose an email provider (Titan, Google Workspace, or Microsoft 365)",
        description:
          "Titan offers lightweight business mail; Google Workspace and M365 provide full office suites.",
      },
      {
        id: "s2_account",
        title: "Create your primary business mailbox",
        description: "Choose hello@, info@, contact@, or firstname@yourdomain.com.",
      },
      {
        id: "s2_mx",
        title: "Add authoritative MX records to your DNS",
        description: "Points incoming mail traffic to your email hosting server.",
        critical: true,
      },
      {
        id: "s2_spf",
        title: "Configure SPF anti-spoofing TXT record",
        description:
          "Authorizes your email provider to send mail on behalf of your domain without getting marked as spam.",
        critical: true,
      },
      {
        id: "s2_dkim",
        title: "Generate and publish DKIM cryptographic keys",
        description:
          "Signs your emails with a digital signature to guarantee they weren't altered in transit.",
      },
      {
        id: "s2_test",
        title: "Send a bidirectional test email (Inbox & Outbox)",
        description:
          "Verify that incoming inquiries land in your inbox and replies reach external recipients.",
      },
    ],
    proTips: [
      "Create email aliases (like billing@ or support@) that route to your main inbox for free.",
      "Never send marketing newsletters from your primary transactional inbox without a dedicated sender like Mailchimp or Brevo.",
    ],
    commonMistakes: [
      "Adding multiple conflicting SPF records instead of merging them into one single TXT record.",
      "Forgetting to verify MX priority values (e.g. Priority 10 vs 20).",
    ],
  },
  {
    id: 3,
    title: "3. Choose & Build Your Website",
    shortTitle: "3. Build Website",
    tagline: "Select the right platform and assemble core high-converting pages.",
    estTime: "1-3 days",
    icon: Blocks,
    toolUrl: "/platform-matcher",
    toolLabel: "Open Platform Matcher & Content Builder",
    description:
      "Match your business model with the right tool (Shopify for ecommerce, Squarespace/Wix for service bookings, WordPress for custom control) and draft essential copy.",
    whyItMatters:
      "Picking the wrong CMS architecture early can lead to expensive migrations or technical dead-ends later.",
    tasks: [
      {
        id: "s3_platform",
        title: "Match your business model with the right CMS",
        description:
          "Use our Platform Matcher to evaluate budget, maintenance tolerance, and functional needs.",
      },
      {
        id: "s3_copy",
        title: "Draft copy for 5 core pages (Home, About, Services, Contact, FAQ)",
        description: "Use plain, human language emphasizing how you solve customer problems.",
      },
      {
        id: "s3_legal",
        title: "Publish Privacy Policy and Terms of Service",
        description:
          "Required for customer trust, cookie laws, advertising platforms, and payment processors.",
        critical: true,
      },
      {
        id: "s3_brand",
        title: "Upload high-res logo, favicon, and brand photography",
        description:
          "Clear visuals and real photos of your team or work convert significantly better than generic stock images.",
      },
      {
        id: "s3_cta",
        title: "Configure one clear Primary Call-to-Action (CTA)",
        description:
          "Make sure every page leads to a single direct action (Book Appointment, Call Now, Buy Product, Get Quote).",
        critical: true,
      },
    ],
    proTips: [
      "Keep navigation concise: 4 to 6 items maximum in your main top header.",
      "Ensure all buttons have sufficient color contrast against backgrounds.",
    ],
    commonMistakes: [
      "Using complex jargon instead of clearly stating what you do and where you do it.",
      "Forgetting to upload a 32x32px custom favicon.",
    ],
  },
  {
    id: 4,
    title: "4. Connect Domain & DNS to Web Host",
    shortTitle: "4. Connect Domain",
    tagline: "Point your custom domain to your website host and verify SSL encryption.",
    estTime: "20-30 mins",
    icon: Network,
    toolUrl: "/connect-domain",
    toolLabel: "Open Connect Domain & DNS Checker",
    description:
      "Link your registered domain to your web builder using authoritative A records and CNAME aliases, and ensure HTTPS / SSL certificates are issued.",
    whyItMatters:
      "Improper DNS records cause 'Site Not Found' errors, broken links, or insecure browser warnings that scare away visitors.",
    tasks: [
      {
        id: "s4_records",
        title: "Copy exact A & CNAME records from your website builder",
        description:
          "Every host (Shopify, Squarespace, Wix, etc.) provides specific IP addresses and alias hosts.",
      },
      {
        id: "s4_dns",
        title: "Publish records in your DNS management zone",
        description:
          "Add Root (@) A-Record and WWW CNAME record without deleting your existing MX email records.",
        critical: true,
      },
      {
        id: "s4_ssl",
        title: "Verify SSL / HTTPS certificate status",
        description:
          "Ensure the padlock icon appears and traffic automatically redirects from http:// to https://.",
        critical: true,
      },
      {
        id: "s4_routing",
        title: "Set Primary Domain redirect (www vs non-www)",
        description:
          "Choose one canonical version and ensure the other automatically redirects to prevent duplicate SEO penalties.",
      },
      {
        id: "s4_prop",
        title: "Run Live DNS Propagation check",
        description: "Verify that global resolvers return consistent IP responses for your domain.",
      },
    ],
    proTips: [
      "Lower your DNS TTL to 300 seconds (5 mins) before making changes, then raise back to 3600 after verifying.",
      "Never delete MX or TXT records when configuring website A-records.",
    ],
    commonMistakes: [
      "Leaving old registrar parking page A-records active alongside new hosting records.",
      "Failing to wait for SSL certificate provisioning (which can take 15 to 60 minutes).",
    ],
  },
  {
    id: 5,
    title: "5. Setup Google Business & Local Presence",
    shortTitle: "5. Local Presence",
    tagline:
      "Claim your Google Maps listing, set up NAP consistency, and prepare for local reviews.",
    estTime: "30-45 mins",
    icon: MapPin,
    toolUrl: "/get-found",
    toolLabel: "Open Local SEO & Search Guide",
    description:
      "For local businesses, Google Business Profile (formerly GMB) drives up to 70% of inbound calls and map directions. Set up your verified listing alongside your website.",
    whyItMatters:
      "A website without local search visibility is invisible to customers searching 'near me' for your services.",
    tasks: [
      {
        id: "s5_gbp",
        title: "Claim or create Google Business Profile listing",
        description: "Complete postal address or service-area radius verification via Google.",
        critical: true,
      },
      {
        id: "s5_nap",
        title: "Standardize Name, Address, and Phone (NAP)",
        description:
          "Ensure exact spelling and format match across your website footer, Google Profile, and social accounts.",
      },
      {
        id: "s5_hours",
        title: "Set accurate business hours & holiday schedules",
        description: "Outdated hours lead to frustrated customers and negative reviews.",
      },
      {
        id: "s5_reviews",
        title: "Generate short Google Review link",
        description:
          "Prepare a direct one-click review URL to send to happy clients immediately following service.",
      },
      {
        id: "s5_analytics",
        title: "Install Google Analytics / Search Console",
        description: "Submit your sitemap.xml to index your new website in Google search results.",
      },
    ],
    proTips: [
      "Add 5 to 10 high-quality photos of your storefront, team, and recent projects to your Google listing.",
      "Respond to all reviews within 24 to 48 hours to boost search ranking signals.",
    ],
    commonMistakes: [
      "Using inconsistent abbreviations in your address (e.g. 'St.' vs 'Street' vs 'Suite 4').",
      "Selecting too many irrelevant secondary business categories.",
    ],
  },
  {
    id: 6,
    title: "6. Pre-Flight Simulator & Public Launch",
    shortTitle: "6. Pre-Flight & Launch",
    tagline: "Test forms, mobile tap targets, email delivery, and announce your website.",
    estTime: "20-30 mins",
    icon: Rocket,
    toolUrl: "/preflight",
    toolLabel: "Open Pre-Flight Sandbox Simulator",
    description:
      "Before announcing your website to the world, run through the complete customer journey to ensure every link, form, button, and contact channel works flawlessly.",
    whyItMatters:
      "Launching with a broken contact form or broken mobile checkout wastes your initial launch buzz and burns customer goodwill.",
    tasks: [
      {
        id: "s6_forms",
        title: "Run live lead form submission test",
        description:
          "Fill out your contact form as a customer and confirm notification emails land in your inbox.",
        critical: true,
      },
      {
        id: "s6_mobile",
        title: "Perform mobile smartphone tap test",
        description:
          "Test on iOS and Android: check tap-to-call, tap-to-email, hamburger menus, and horizontal scrolling.",
        critical: true,
      },
      {
        id: "s6_spam",
        title: "Verify SPF / DKIM email authentication score",
        description: "Ensure outgoing quotes and replies don't land in client spam folders.",
      },
      {
        id: "s6_404",
        title: "Test custom 404 error page and favicon",
        description:
          "Ensure typos redirect to a helpful error page with links back to your homepage.",
      },
      {
        id: "s6_dossier",
        title: "Generate and save your Master Launch Dossier",
        description:
          "Export your digital deed, DNS records, and credentials handover summary for your records.",
      },
      {
        id: "s6_announce",
        title: "Announce launch on social media, email lists, and local networks",
        description:
          "Share your new website URL with existing clients, partners, and community groups.",
      },
    ],
    proTips: [
      "Ask 2 friends or family members to browse your website on their phones and place a test inquiry.",
      "Keep a clean printout of your Launch Dossier in your company records.",
    ],
    commonMistakes: [
      "Testing only on a desktop monitor and ignoring mobile smartphone layout bugs.",
      "Leaving 'Lorem Ipsum' placeholder text in secondary footer or policy pages.",
    ],
  },
];

export function LaunchWizardPage() {
  const { state } = useStore();
  const [activeStepId, setActiveStepId] = useState<number>(1);

  // Track completed task IDs in local storage
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem("lmbo.wizard.completed.v1");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => {
      const next = { ...prev, [taskId]: !prev[taskId] };
      localStorage.setItem("lmbo.wizard.completed.v1", JSON.stringify(next));
      if (next[taskId]) {
        toast.success("Task marked complete!");
      }
      return next;
    });
  };

  const currentStep = WIZARD_STEPS.find((s) => s.id === activeStepId) || WIZARD_STEPS[0];

  // Calculate overall metrics
  const totalTasksCount = useMemo(() => {
    return WIZARD_STEPS.reduce((acc, s) => acc + s.tasks.length, 0);
  }, []);

  const totalCompletedCount = useMemo(() => {
    return Object.values(completedTasks).filter(Boolean).length;
  }, [completedTasks]);

  const overallProgressPercent = Math.round(
    (totalCompletedCount / Math.max(1, totalTasksCount)) * 100,
  );

  // Per-step completion calculation
  const stepProgress = (step: WizardStep) => {
    const done = step.tasks.filter((t) => completedTasks[t.id]).length;
    return {
      done,
      total: step.tasks.length,
      percent: Math.round((done / step.tasks.length) * 100),
      isComplete: done === step.tasks.length,
    };
  };

  const businessName = state.business.businessName || state.business.name || "Your Business";
  const domain = state.business.ownedDomain || state.business.preferredDomain || "yourdomain.com";

  return (
    <AppShell
      title="Linear Launch Track & Step-by-Step Setup Wizard"
      description="A structured, sequential 6-step roadmap walking beginners from buying a domain to professional email, website build, DNS setup, and pre-flight launch."
      actions={
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="text-xs gap-1.5">
            <Link to="/launch-dossier">
              <Download className="size-3.5" /> Export Launch Dossier
            </Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="text-xs gap-1.5 bg-primary text-primary-foreground shadow"
          >
            <Link to="/preflight">
              <Rocket className="size-3.5" /> Pre-Flight Simulator
            </Link>
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Progress & Overview Banner */}
        <div className="surface-panel p-5 sm:p-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Master Roadmap Track
                </span>
                <Badge
                  variant={overallProgressPercent === 100 ? "default" : "secondary"}
                  className="text-[11px]"
                >
                  {overallProgressPercent === 100
                    ? "🎉 Ready for Launch!"
                    : `${overallProgressPercent}% Complete`}
                </Badge>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                Launch Progress for <span className="text-primary">{businessName}</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                {totalCompletedCount} of {totalTasksCount} critical launch milestones checked.
                Target domain: <strong className="font-mono text-foreground">{domain}</strong>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-foreground">Step {currentStep.id} of 6</p>
                <p className="text-[11px] text-muted-foreground">{currentStep.estTime} est.</p>
              </div>
              <div className="w-24 sm:w-32">
                <Progress value={overallProgressPercent} className="h-3" />
              </div>
            </div>
          </div>

          {/* Stepper Navigation Track */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 pt-2">
            {WIZARD_STEPS.map((step) => {
              const { done, total, isComplete } = stepProgress(step);
              const isActive = step.id === activeStepId;
              const StepIcon = step.icon;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveStepId(step.id)}
                  className={cn(
                    "flex flex-col justify-between rounded-xl border p-3 text-left transition-all relative overflow-hidden",
                    isActive
                      ? "border-primary bg-primary-soft/30 shadow-sm ring-1 ring-primary/40"
                      : isComplete
                        ? "border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500/60"
                        : "border-border bg-card hover:border-border/80 hover:bg-muted/40",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "flex size-7 items-center justify-center rounded-lg text-xs font-bold",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : isComplete
                            ? "bg-emerald-500 text-white"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {isComplete ? <Check className="size-4" /> : step.id}
                    </span>
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      {done}/{total}
                    </span>
                  </div>

                  <div className="mt-2.5">
                    <p
                      className={cn(
                        "font-display text-xs font-bold line-clamp-1",
                        isActive ? "text-primary" : "text-foreground",
                      )}
                    >
                      {step.shortTitle.split(". ")[1]}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{step.estTime}</p>
                  </div>

                  {isActive && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Active Step Workspace */}
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Main Step Content & Tasks (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Step Header */}
            <div className="surface-panel p-6 space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-mono">
                      Step {currentStep.id} of 6
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="size-3" /> {currentStep.estTime}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground">
                    {currentStep.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{currentStep.tagline}</p>
                </div>

                <Button asChild size="sm" className="gap-1.5 shrink-0 text-xs shadow">
                  <Link to={currentStep.toolUrl}>
                    {currentStep.toolLabel} <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </div>

              <div className="rounded-xl border border-border/80 bg-muted/30 p-4 text-xs text-muted-foreground space-y-2 leading-relaxed">
                <p>{currentStep.description}</p>
                <p className="font-medium text-foreground">
                  <span className="text-primary font-bold">Why it matters: </span>
                  {currentStep.whyItMatters}
                </p>
              </div>
            </div>

            {/* Checklist Tasks */}
            <div className="surface-panel p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-display text-lg font-bold text-foreground">
                  Required Milestones & Actions
                </h4>
                <span className="text-xs text-muted-foreground">
                  Click checkmark to toggle complete
                </span>
              </div>

              <div className="space-y-3">
                {currentStep.tasks.map((task) => {
                  const isDone = !!completedTasks[task.id];
                  return (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
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
                        {isDone ? <Check className="size-3.5" /> : null}
                      </button>

                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              "font-display text-sm font-bold leading-tight",
                              isDone ? "text-muted-foreground line-through" : "text-foreground",
                            )}
                          >
                            {task.title}
                          </span>
                          {task.critical && (
                            <Badge
                              variant="destructive"
                              className="text-[10px] px-1.5 py-0 h-4 uppercase font-bold"
                            >
                              Critical
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {task.description}
                        </p>
                        {task.helpTip && (
                          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-primary font-medium">
                            <Sparkles className="size-3 shrink-0" />
                            <span>Tip: {task.helpTip}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step Navigation Controls */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveStepId((prev) => Math.max(1, prev - 1))}
                disabled={activeStepId === 1}
                className="gap-1.5 text-xs"
              >
                <ArrowLeft className="size-3.5" /> Previous Step
              </Button>

              {activeStepId < 6 ? (
                <Button
                  size="sm"
                  onClick={() => setActiveStepId((prev) => Math.min(6, prev + 1))}
                  className="gap-1.5 text-xs bg-primary text-primary-foreground shadow"
                >
                  Next Step: {WIZARD_STEPS[activeStepId]?.shortTitle.split(". ")[1]}
                  <ArrowRight className="size-3.5" />
                </Button>
              ) : (
                <Button
                  asChild
                  size="sm"
                  className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow"
                >
                  <Link to="/preflight">
                    Launch Pre-Flight Simulator <Rocket className="size-3.5" />
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Right Sidebar: Expert Guidance & Common Pitfalls (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Quick Deep Link to Dedicated Tool */}
            <div className="surface-panel p-5 space-y-3 bg-primary-soft/20 border-primary/30">
              <div className="flex items-center gap-2 text-primary font-display font-bold text-sm">
                <Sparkles className="size-4" />
                <span>Dedicated Interactive Tool</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Need specialized assistance for this step? Jump directly into our dedicated utility:
              </p>
              <Button asChild className="w-full text-xs gap-1.5 shadow">
                <Link to={currentStep.toolUrl}>
                  {currentStep.toolLabel} <ExternalLink className="size-3.5" />
                </Link>
              </Button>
            </div>

            {/* Pro Tips Box */}
            <div className="surface-panel p-5 space-y-3">
              <h4 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-500" />
                <span>Pro Tips for Step {currentStep.id}</span>
              </h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {currentStep.proTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Common Mistakes to Avoid */}
            <div className="surface-panel p-5 space-y-3 border-amber-500/30 bg-amber-500/5">
              <h4 className="font-display text-sm font-bold text-amber-700 dark:text-amber-300 flex items-center gap-2">
                <AlertCircle className="size-4 text-amber-500" />
                <span>Avoid These Beginner Traps</span>
              </h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {currentStep.commonMistakes.map((mistake, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Summary of All 6 Steps */}
            <div className="surface-panel p-5 space-y-3">
              <h4 className="font-display text-sm font-bold text-foreground">
                The 6 Launch Phases
              </h4>
              <div className="space-y-2 text-xs">
                {WIZARD_STEPS.map((s) => {
                  const { isComplete } = stepProgress(s);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setActiveStepId(s.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors",
                        s.id === activeStepId
                          ? "bg-primary text-primary-foreground font-bold"
                          : "hover:bg-muted text-muted-foreground",
                      )}
                    >
                      <span className="truncate">{s.shortTitle}</span>
                      {isComplete ? (
                        <CheckCircle2
                          className={cn(
                            "size-3.5 shrink-0",
                            s.id === activeStepId ? "text-primary-foreground" : "text-emerald-500",
                          )}
                        />
                      ) : (
                        <ChevronRight className="size-3.5 shrink-0 opacity-60" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
