import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  Clock,
  HelpCircle,
  ListChecks,
  Globe,
  Network,
  FileText,
  Rocket,
  BookOpen,
  ClipboardCheck,
  Building2,
  Calculator,
  Mail,
  Star,
  ShieldAlert,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ProgressRing } from "@/components/ProgressRing";
import { EmptyState } from "@/components/EmptyState";
import { OwnershipWarningCard } from "@/components/Callouts";
import { LaunchTaskCard } from "@/components/TaskCards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useStore } from "@/lib/store";
import { PHASES, currentStage, progressPercent } from "@/lib/plan";
import { getReadiness } from "@/lib/readiness";
import { LaunchReadinessCard } from "@/components/LaunchReadinessCard";
import { ARTICLES } from "@/lib/library";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your launch dashboard — Cornerstone" },
      {
        name: "description",
        content:
          "See your progress, your next best action and your seven-phase roadmap from planning to a live, maintained website.",
      },
      { property: "og:title", content: "Your personalized launch dashboard" },
      {
        property: "og:description",
        content: "Progress, next steps and a phased roadmap for getting your business online.",
      },
    ],
  }),
  component: Dashboard,
});

const QUICK_TOOLS = [
  { to: "/launch-wizard", label: "Launch track wizard", icon: Rocket },
  { to: "/preflight", label: "Post-launch site audit", icon: ClipboardCheck },
  { to: "/cost-calculator", label: "3-Yr budget calculator", icon: Calculator },
  { to: "/email-signature", label: "Email signature", icon: Mail },
  { to: "/review-kit", label: "Review QR kit", icon: Star },
  { to: "/security-drill", label: "Security & recovery", icon: ShieldAlert },
  { to: "/domains", label: "Domain finder", icon: Globe },
  { to: "/business-profile", label: "Business profile", icon: Building2 },
  { to: "/content", label: "Content builder", icon: FileText },
  { to: "/connect-domain", label: "Connect domain", icon: Network },
  { to: "/checklist", label: "Launch checklist", icon: ListChecks },
  { to: "/launch-dossier", label: "Launch dossier", icon: FileText },
];

function Dashboard() {
  const { state, hydrated, hasPlan, setTaskStatus, updateTask, loadDemo } = useStore();
  const [openPhase, setOpenPhase] = useState<string | null>(null);

  const tasks = state.tasks;
  const percent = progressPercent(tasks);
  const stage = currentStage(tasks);
  const readiness = useMemo(
    () => getReadiness(tasks, state.business, state.ownership, state.customerJourneyTest),
    [tasks, state.business, state.ownership, state.customerJourneyTest],
  );
  const nextTask = useMemo(
    () =>
      tasks.find((t) => t.status === "in_progress") ?? tasks.find((t) => t.status !== "complete"),
    [tasks],
  );
  const recent = useMemo(
    () =>
      tasks
        .filter((t) => t.completedAt)
        .sort((a, b) => (a.completedAt! < b.completedAt! ? 1 : -1))
        .slice(0, 4),
    [tasks],
  );

  if (!hydrated) {
    return (
      <AppShell title="Loading your plan…">
        <div className="grid gap-4 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </AppShell>
    );
  }

  if (!hasPlan) {
    return (
      <AppShell
        title="Your dashboard"
        description="Build a plan to unlock your personalized roadmap."
      >
        <EmptyState
          icon={Rocket}
          title="No launch plan yet"
          description="Answer seven short questions about your business and we will build your roadmap. Or explore with a demo bakery first."
          actionLabel="Create my free plan"
          actionTo="/onboarding"
        />
        <div className="mt-4 text-center">
          <Button variant="ghost" onClick={loadDemo}>
            Load the Harbor &amp; Hearth Bakery demo
          </Button>
        </div>
      </AppShell>
    );
  }

  const stageLabel = PHASES.find((p) => p.key === stage)?.title ?? "Plan";
  const completed = tasks.filter((t) => t.status === "complete").length;

  return (
    <AppShell
      title={`Welcome back, ${state.business.businessName || "there"}`}
      description={`You are ${percent}% of the way to launching your business online.`}
      actions={
        <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
          <Link to="/learn">
            <HelpCircle className="size-4" aria-hidden="true" />
            Need help?
          </Link>
        </Button>
      }
    >
      <div className="space-y-8">
        {/* Widgets */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="surface-panel flex items-center gap-4 p-5">
            <ProgressRing value={percent} size={96} label="complete" />
            <div>
              <p className="font-display font-semibold">Overall progress</p>
              <p className="text-sm text-muted-foreground">
                {completed} of {tasks.length} tasks done
              </p>
            </div>
          </div>

          <div className="surface-panel p-5">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Your next step
            </p>
            <p className="mt-2 font-display text-lg font-semibold">
              {nextTask?.title ?? "You're all caught up"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {nextTask?.description ?? "Review your maintenance calendar to keep things healthy."}
            </p>
            <Button asChild size="sm" className="mt-3">
              <Link to="/checklist">
                Continue <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <div className="surface-panel p-5">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Current stage
            </p>
            <p className="mt-2 font-display text-lg font-semibold">{stageLabel}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {PHASES.map((p) => (
                <span
                  key={p.key}
                  aria-hidden="true"
                  className={cn(
                    "h-1.5 w-6 rounded-full",
                    tasks.filter((t) => t.phase === p.key).every((t) => t.status === "complete") &&
                      tasks.some((t) => t.phase === p.key)
                      ? "bg-success"
                      : p.key === stage
                        ? "bg-primary"
                        : "bg-muted",
                  )}
                />
              ))}
            </div>
          </div>

          <div className="surface-panel p-5">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Target timeline
            </p>
            <p className="mt-2 font-display text-lg font-semibold">
              {state.business.timeline || "flexible"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {readiness.completedRequiredTasks} of {readiness.totalRequiredTasks} required done
            </p>
          </div>
        </div>

        <div className="surface-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between border-primary/30 bg-primary-soft/20">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
              Linear 6-Step Roadmap
            </span>
            <p className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <Rocket className="size-4.5 text-primary" aria-hidden="true" /> Guided Launch Setup
              Wizard
            </p>
            <p className="text-xs text-muted-foreground">
              Sequential track: 1. Secure Domain → 2. Business Email → 3. Build Site → 4. Connect
              DNS → 5. Google Business → 6. Pre-Flight Test.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button asChild size="sm" className="gap-1.5 shadow">
              <Link to="/launch-wizard">
                Open Launch Wizard <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link to="/preflight">Post-launch site audit</Link>
            </Button>
          </div>
        </div>

        <LaunchReadinessCard readiness={readiness} />

        <div className="surface-panel flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-sm font-semibold flex items-center gap-2">
              <ClipboardCheck className="size-4 text-primary" aria-hidden="true" /> Test your main
              customer action
            </p>
            <p className="text-sm text-muted-foreground">
              Walk through your primary journey on a real phone — phone, WhatsApp, form, booking,
              purchase, visit or newsletter — and record what happens.
            </p>
          </div>
          <Button asChild size="sm" className="shrink-0">
            <Link to="/customer-journey">
              Open journey tester <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        {/* Growth & Operations Toolkit */}
        <section aria-labelledby="growth-toolkit" className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="growth-toolkit" className="font-display text-xl font-bold">
                Launch & Growth Toolkit
              </h2>
              <p className="text-xs text-muted-foreground">
                Specialized utilities to protect your budget, brand outgoing emails, get 5-star
                reviews, and safeguard your domain.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link
              to="/cost-calculator"
              className="group surface-panel p-4 space-y-2 hover:border-primary/50 transition-all block"
            >
              <div className="flex items-center justify-between">
                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Calculator className="size-4" />
                </div>
                <Badge variant="outline" className="text-[10px]">
                  3-Year TCO
                </Badge>
              </div>
              <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                Budget & Cost Calculator
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Calculate true 3-year running costs across domain, email, hosting & payment
                processing without renewal traps.
              </p>
            </Link>

            <Link
              to="/email-signature"
              className="group surface-panel p-4 space-y-2 hover:border-primary/50 transition-all block"
            >
              <div className="flex items-center justify-between">
                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Mail className="size-4" />
                </div>
                <Badge variant="outline" className="text-[10px]">
                  Client-Safe
                </Badge>
              </div>
              <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                Email Signature Generator
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Generate responsive HTML email signatures with tap-to-call, monogram, and Google
                Review links for Gmail & Outlook.
              </p>
            </Link>

            <Link
              to="/review-kit"
              className="group surface-panel p-4 space-y-2 hover:border-primary/50 transition-all block"
            >
              <div className="flex items-center justify-between">
                <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Star className="size-4 fill-amber-500" />
                </div>
                <Badge variant="outline" className="text-[10px]">
                  Printable QR
                </Badge>
              </div>
              <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                Google Review Kit
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Print 5-star tabletop QR counter stands, receipt slips, and copy post-service SMS
                follow-up templates.
              </p>
            </Link>

            <Link
              to="/security-drill"
              className="group surface-panel p-4 space-y-2 hover:border-primary/50 transition-all block"
            >
              <div className="flex items-center justify-between">
                <div className="size-8 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
                  <ShieldAlert className="size-4" />
                </div>
                <Badge variant="outline" className="text-[10px]">
                  Outage Triage
                </Badge>
              </div>
              <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                Security & Recovery Drill
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Interactive outage triage flowchart, 2FA fortress checklist, and 1-click DNS zone
                backup snapshot vault.
              </p>
            </Link>
          </div>
        </section>

        {/* Next step detail */}
        {nextTask ? (
          <section aria-labelledby="next-step">
            <h2 id="next-step" className="font-display text-xl font-bold">
              Your next step
            </h2>
            <div className="mt-3">
              <LaunchTaskCard
                task={nextTask}
                onStatus={(s) => setTaskStatus(nextTask.id, s)}
                onUpdate={(p) => updateTask(nextTask.id, p)}
              />
            </div>
          </section>
        ) : null}

        {/* Roadmap */}
        <section aria-labelledby="roadmap">
          <h2 id="roadmap" className="font-display text-xl font-bold">
            Your launch roadmap
          </h2>
          <ol className="mt-3 space-y-3">
            {PHASES.map((phase) => {
              const phaseTasks = tasks.filter((t) => t.phase === phase.key);
              const done = phaseTasks.filter((t) => t.status === "complete").length;
              const minutes = phaseTasks.reduce((s, t) => s + t.estimatedMinutes, 0);
              const isDone = phaseTasks.length > 0 && done === phaseTasks.length;
              const open = openPhase === phase.key;
              return (
                <li key={phase.key} className="surface-panel overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenPhase(open ? null : phase.key)}
                    aria-expanded={open}
                    className="flex w-full items-start gap-4 p-5 text-left transition-colors hover:bg-muted/50"
                  >
                    <span
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-xl font-display font-bold",
                        isDone
                          ? "bg-success text-success-foreground"
                          : phase.key === stage
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {phase.number}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-lg font-semibold">{phase.title}</h3>
                        {isDone ? (
                          <Badge className="bg-success-soft text-success">Complete</Badge>
                        ) : phase.key === stage ? (
                          <Badge className="bg-primary-soft text-primary">In progress</Badge>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{phase.why}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {done}/{phaseTasks.length} tasks · about {Math.round(minutes / 60) || 1}{" "}
                        hour
                        {Math.round(minutes / 60) === 1 ? "" : "s"}
                      </p>
                    </div>
                    <ChevronDown
                      className={cn(
                        "mt-1 size-5 shrink-0 transition-transform",
                        open && "rotate-180",
                      )}
                      aria-hidden="true"
                    />
                  </button>
                  {open ? (
                    <div className="space-y-3 border-t border-border bg-muted/30 p-4">
                      {phaseTasks.length ? (
                        phaseTasks.map((t) => (
                          <LaunchTaskCard
                            key={t.id}
                            task={t}
                            onStatus={(s) => setTaskStatus(t.id, s)}
                            onUpdate={(p) => updateTask(t.id, p)}
                          />
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No tasks in this phase for your current answers.
                        </p>
                      )}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Snapshot */}
          <section aria-labelledby="snapshot" className="surface-panel p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 id="snapshot" className="font-display text-lg font-bold">
                Your business snapshot
              </h2>
              <Button asChild variant="ghost" size="sm">
                <Link to="/business-profile">Business profile →</Link>
              </Button>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                ["Business", state.business.businessName],
                ["Category", state.business.category],
                ["Location", state.business.location || state.business.address],
                ["Main goal", state.business.primaryGoal],
                [
                  "Customer action",
                  state.business.primaryCustomerAction ? state.business.primaryCustomerAction : "—",
                ],
                ["Website needs", state.business.needs.join(", ")],
                [
                  "Contact",
                  state.business.phone ||
                    state.business.businessEmail ||
                    state.business.contactFormUrl ||
                    "—",
                ],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex flex-wrap justify-between gap-2 border-b border-border pb-2"
                >
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="max-w-[60%] text-right font-medium">{v || "—"}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/business-profile">Edit in Business profile</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/account">My plan & ownership</Link>
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Business profile feeds greetings, content builder, journey tester and get-found.
            </p>
          </section>

          {/* Recent activity */}
          <section aria-labelledby="activity" className="surface-panel p-5">
            <h2 id="activity" className="font-display text-lg font-bold">
              Recent activity
            </h2>
            {recent.length ? (
              <ul className="mt-4 space-y-3">
                {recent.map((t) => (
                  <li key={t.id} className="flex items-start gap-3 text-sm">
                    <Clock className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                    <div>
                      <p className="font-medium">{t.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Completed {new Date(t.completedAt!).toLocaleDateString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Nothing completed yet. Your first finished task will appear here.
              </p>
            )}
          </section>
        </div>

        <OwnershipWarningCard />

        {/* Quick tools + learning */}
        <div className="grid gap-6 lg:grid-cols-2">
          <section aria-labelledby="tools" className="surface-panel p-5">
            <h2 id="tools" className="font-display text-lg font-bold">
              Quick tools
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {QUICK_TOOLS.map((t) => (
                <Link
                  key={t.to}
                  to={t.to}
                  className="flex items-center gap-3 rounded-xl border border-border p-3.5 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <t.icon className="size-4.5 text-primary" aria-hidden="true" />
                  {t.label}
                </Link>
              ))}
            </div>
          </section>

          <section aria-labelledby="learning" className="surface-panel p-5">
            <h2 id="learning" className="font-display text-lg font-bold">
              Recommended reading
            </h2>
            <ul className="mt-4 space-y-3">
              {ARTICLES.slice(0, 3).map((a) => (
                <li key={a.slug}>
                  <Link to="/learn" className="flex items-start gap-3 text-sm hover:underline">
                    <BookOpen className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>
                      <span className="font-medium">{a.title}</span>
                      <span className="block text-xs text-muted-foreground">
                        {a.minutes} min read
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
