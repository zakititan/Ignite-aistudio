import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Phone,
  MessageCircle,
  Mail,
  CalendarCheck,
  ShoppingCart,
  MapPin,
  MailOpen,
  Pencil,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  ClipboardCheck,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/lib/store";
import { getReadiness } from "@/lib/readiness";
import type {
  CustomerJourneyType,
  CustomerJourneyStepResult,
  JourneyStepStatus,
} from "@/lib/types";
import { JOURNEY_DEFINITIONS, inferDefaultJourney, journeyLabel } from "@/lib/customer-journey";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/customer-journey")({
  head: () => ({
    meta: [
      { title: "Test your customer journey — Launch My Business Online" },
      {
        name: "description",
        content:
          "Pick your main customer action, walk through tailored steps on a real phone, and record what worked and what needs fixing.",
      },
      { property: "og:title", content: "Customer journey tester" },
      {
        property: "og:description",
        content: "Five plain-English steps to test your primary customer action end to end.",
      },
    ],
  }),
  component: CustomerJourneyPage,
});

const JOURNEY_ICONS: Record<CustomerJourneyType, typeof Phone> = {
  phone_call: Phone,
  whatsapp_message: MessageCircle,
  contact_form: Mail,
  booking: CalendarCheck,
  online_purchase: ShoppingCart,
  visit_location: MapPin,
  newsletter_signup: MailOpen,
  custom: Pencil,
};

const STATUS_OPTIONS: { value: JourneyStepStatus; label: string; hint: string }[] = [
  { value: "not_tested", label: "Not tested", hint: "You have not tried this step yet" },
  { value: "passed", label: "Passed", hint: "Worked as a customer would expect" },
  { value: "needs_improvement", label: "Needs improvement", hint: "Worked, but confusing or slow" },
  { value: "blocked", label: "Blocked", hint: "Customer could not complete this step" },
];

function buildSteps(type: CustomerJourneyType, customLabel?: string): CustomerJourneyStepResult[] {
  const def = JOURNEY_DEFINITIONS[type];
  const labels = def.steps;
  return labels.map((label, i) => ({
    id: `${type}-${i + 1}`,
    label,
    status: "not_tested" as JourneyStepStatus,
    note: "",
  }));
}

function CustomerJourneyPage() {
  const { state, hasPlan, setCustomerJourneyTest } = useStore();

  const inferred = useMemo(() => inferDefaultJourney(state.business), [state.business]);

  const existing = state.customerJourneyTest;

  const [flowStep, setFlowStep] = useState(1);
  const [journeyType, setJourneyType] = useState<CustomerJourneyType>(
    existing?.journeyType ?? inferred,
  );
  const [customLabel, setCustomLabel] = useState(existing?.customJourneyLabel ?? "");
  const [steps, setSteps] = useState<CustomerJourneyStepResult[]>(
    () =>
      existing?.steps ??
      buildSteps(existing?.journeyType ?? inferred, existing?.customJourneyLabel),
  );

  // Sync when type changes and no existing or user explicitly changes
  useEffect(() => {
    // If existing type differs from inferred and user hasn't yet changed, keep existing.
    // Only regenerate when journeyType changes and user is on step 1.
  }, []);

  const handleSelectType = (type: CustomerJourneyType) => {
    setJourneyType(type);
    if (type !== "custom") setCustomLabel("");
    setSteps(buildSteps(type, type === "custom" ? customLabel : undefined));
  };

  const handleCustomLabelChange = (v: string) => {
    const sliced = v.slice(0, 80);
    setCustomLabel(sliced);
  };

  const updateStep = (id: string, patch: Partial<CustomerJourneyStepResult>) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const counts = useMemo(() => {
    const c = { passed: 0, needs_improvement: 0, blocked: 0, not_tested: 0 };
    for (const s of steps) c[s.status] += 1;
    return c;
  }, [steps]);

  const allPassed = steps.length > 0 && steps.every((s) => s.status === "passed");
  const hasBlocked = counts.blocked > 0;
  const hasNeeds = counts.needs_improvement > 0;
  const hasNotTested = counts.not_tested > 0;

  const readiness = useMemo(
    () =>
      getReadiness(state.tasks, state.business, state.ownership, {
        journeyType,
        customJourneyLabel: customLabel || undefined,
        steps,
        lastUpdatedAt: new Date().toISOString(),
        completedAt: allPassed ? new Date().toISOString() : null,
      }),
    [state.tasks, state.business, state.ownership, journeyType, customLabel, steps, allPassed],
  );

  const save = (showToast = true) => {
    const now = new Date().toISOString();
    const completedAt = allPassed ? now : null;
    setCustomerJourneyTest({
      journeyType,
      customJourneyLabel: journeyType === "custom" ? customLabel.trim() || undefined : undefined,
      steps,
      lastUpdatedAt: now,
      completedAt,
    });
    if (showToast)
      toast.success("Journey saved. Readiness will reflect blocked or needs-improvement steps.");
  };

  const canGoNext = () => {
    if (flowStep === 1) {
      if (journeyType === "custom" && !customLabel.trim()) return false;
      return true;
    }
    if (flowStep === 4) {
      // Allow saving even if not all tested, but warn
      return true;
    }
    return true;
  };

  const next = () => {
    if (flowStep < 5) setFlowStep((s) => s + 1);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const back = () => {
    if (flowStep > 1) setFlowStep((s) => s - 1);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const def = JOURNEY_DEFINITIONS[journeyType];
  const displayLabel = journeyLabel(journeyType, customLabel);

  const flowProgress = Math.round((flowStep / 5) * 100);

  if (!hasPlan) {
    return (
      <AppShell
        title="Customer journey tester"
        description="Test the one action you most want customers to take — before you invite them."
      >
        <div className="surface-panel p-6 text-center">
          <p className="font-display text-lg font-semibold">Create a plan first</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Answer seven short questions and we will suggest the journey that matches your main
            goal. You can change it any time.
          </p>
          <Button asChild className="mt-4">
            <Link to="/onboarding">Create my plan</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Test your customer journey"
      description="Five steps — pick a goal, prepare, walk through it on a real phone, record what happened, and see what to fix."
    >
      <div className="space-y-6">
        {/* Stepper header */}
        <div className="surface-panel p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold">
              Step {flowStep} of 5{" "}
              <span className="font-normal text-muted-foreground">
                {flowStep === 1 && "— Choose your goal"}
                {flowStep === 2 && "— Prepare"}
                {flowStep === 3 && "— Tailored steps"}
                {flowStep === 4 && "— Record outcome"}
                {flowStep === 5 && "— Summary"}
              </span>
            </p>
            <Badge variant="outline" className="font-medium">
              {displayLabel}
            </Badge>
          </div>
          <Progress
            value={flowProgress}
            className="mt-3"
            aria-label={`Progress ${flowProgress} percent`}
          />
          <ol className="mt-3 flex flex-wrap gap-1.5" aria-label="Progress steps">
            {[1, 2, 3, 4, 5].map((s) => (
              <li key={s} className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full text-xs font-bold",
                    s === flowStep
                      ? "bg-primary text-primary-foreground"
                      : s < flowStep
                        ? "bg-success text-success-foreground"
                        : "bg-muted text-muted-foreground",
                  )}
                  aria-current={s === flowStep ? "step" : undefined}
                >
                  {s}
                </span>
                {s < 5 ? <span aria-hidden="true" className="h-0.5 w-4 rounded bg-muted" /> : null}
              </li>
            ))}
          </ol>
          {existing ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Last saved {new Date(existing.lastUpdatedAt).toLocaleString()} — suggested goal was{" "}
              <span className="font-medium">{journeyLabel(inferred)}</span> based on your onboarding
              answers. You can change it below.
            </p>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">
              Suggested goal: <span className="font-medium">{journeyLabel(inferred)}</span> based on
              your main goal “{state.business.primaryGoal || "—"}” and needs:{" "}
              {state.business.needs.join(", ") || "—"}. You can keep it or pick another.
            </p>
          )}
        </div>

        {/* Step 1: Select goal */}
        {flowStep === 1 && (
          <section aria-labelledby="goal-title" className="space-y-4">
            <div className="surface-panel p-5">
              <h2 id="goal-title" className="font-display text-xl font-bold">
                What is the one action you most want a customer to take?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick the closest match. Each choice gives you 5–6 plain-English steps to try on a
                real phone.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(Object.keys(JOURNEY_DEFINITIONS) as CustomerJourneyType[]).map((type) => {
                const d = JOURNEY_DEFINITIONS[type];
                const Icon = JOURNEY_ICONS[type];
                const active = journeyType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleSelectType(type)}
                    aria-pressed={active}
                    aria-label={`Select ${d.label}: ${d.description}`}
                    className={cn(
                      "surface-panel flex flex-col gap-2 p-4 text-left transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring",
                      active && "border-primary bg-primary-soft/40 ring-1 ring-primary",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-9 items-center justify-center rounded-xl",
                        active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                      )}
                    >
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="font-display text-sm font-semibold">{d.label}</span>
                    <span className="text-xs leading-relaxed text-muted-foreground wrap-break-word">
                      {d.description}
                    </span>
                    {type === inferred ? (
                      <Badge variant="outline" className="w-fit text-[11px]">
                        Suggested
                      </Badge>
                    ) : null}
                    {active ? (
                      <span className="text-xs font-medium text-primary">Selected</span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {journeyType === "custom" && (
              <div className="surface-panel space-y-2 p-5">
                <Label htmlFor="custom-label">Name your custom journey</Label>
                <Input
                  id="custom-label"
                  value={customLabel}
                  onChange={(e) => handleCustomLabelChange(e.target.value)}
                  placeholder="e.g., Request a quote for garden work"
                  maxLength={80}
                  aria-describedby="custom-help"
                />
                <p id="custom-help" className="text-xs text-muted-foreground">
                  Keep it short — this label appears in your readiness blockers and summary.
                </p>
              </div>
            )}
          </section>
        )}

        {/* Step 2: Prepare checklist */}
        {flowStep === 2 && (
          <section aria-labelledby="prepare-title" className="space-y-4">
            <div className="surface-panel p-5">
              <h2 id="prepare-title" className="font-display text-xl font-bold">
                Prepare to test “{displayLabel}”
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Do this on a real phone, ideally not on your usual Wi-Fi. Use a personal number or
                email so you see exactly what a new customer sees.
              </p>
            </div>

            <div className="surface-panel p-5">
              <h3 className="font-display text-base font-semibold">Before you start</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                <li>Use a phone with mobile data if you can — many customers are on mobile.</li>
                <li>Open your website as a stranger would — do not stay signed in as the owner.</li>
                <li>Have a personal email or phone ready to receive test confirmations.</li>
                <li>Keep a note app open to copy any confusing wording you see.</li>
              </ul>
            </div>

            <div className="surface-panel p-5">
              <h3 className="font-display text-base font-semibold flex items-center gap-2">
                <ClipboardCheck className="size-5 text-primary" aria-hidden="true" />
                You will check these {steps.length} steps for “{def.label}”
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{def.description}</p>
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm">
                {steps.map((s) => (
                  <li key={s.id} className="wrap-break-word leading-relaxed">
                    {s.label}
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-xs text-muted-foreground">
                Tip: In the next step you will see the same steps with plain-English guidance. Then
                you will record Passed, Needs improvement, Blocked or Not tested for each one.
              </p>
            </div>
          </section>
        )}

        {/* Step 3: Tailored steps */}
        {flowStep === 3 && (
          <section aria-labelledby="steps-title" className="space-y-4">
            <div className="surface-panel p-5">
              <h2 id="steps-title" className="font-display text-xl font-bold">
                Tailored steps for “{displayLabel}”
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Walk through each step on your phone now. Take your time — customers will do the
                same.
              </p>
            </div>

            <ol className="space-y-3" aria-label="Tailored journey steps">
              {steps.map((s, idx) => (
                <li key={s.id} className="surface-panel p-5">
                  <div className="flex gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-sm font-semibold wrap-break-word">
                        {s.label}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground wrap-break-word">
                        {getStepHint(journeyType, idx)}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        What to watch: Does a customer know what to do next without help? Is the
                        wording plain English? Is the button easy to tap?
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>

            <div className="surface-panel border-info/20 bg-info-soft/30 p-4">
              <p className="flex gap-2 text-sm">
                <Info className="size-4 shrink-0 text-primary" aria-hidden="true" />
                <span>
                  When you have tried each step, continue to record what happened. Be honest —
                  “blocked” is useful because it creates a critical blocker in your launch readiness
                  so you do not forget it.
                </span>
              </p>
            </div>
          </section>
        )}

        {/* Step 4: Record outcome */}
        {flowStep === 4 && (
          <section aria-labelledby="record-title" className="space-y-4">
            <div className="surface-panel p-5">
              <h2 id="record-title" className="font-display text-xl font-bold">
                Record what happened
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                For each step, choose one status and add a short note if helpful. Long descriptions
                will wrap. Everything is keyboard operable.
              </p>
            </div>

            <div className="space-y-4">
              {steps.map((step) => (
                <div key={step.id} className="surface-panel space-y-3 p-5">
                  <div>
                    <h3 className="font-display text-sm font-semibold wrap-break-word">
                      {step.label}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Step {steps.indexOf(step) + 1} of {steps.length}
                    </p>
                  </div>

                  <fieldset className="space-y-2">
                    <legend className="text-sm font-medium">Outcome</legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {STATUS_OPTIONS.map((opt) => {
                        const active = step.status === opt.value;
                        return (
                          <label
                            key={opt.value}
                            className={cn(
                              "flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition-colors focus-within:ring-2 focus-within:ring-ring",
                              active
                                ? "border-primary bg-primary-soft/50"
                                : "border-border bg-card hover:bg-muted/50",
                            )}
                          >
                            <input
                              type="radio"
                              name={`status-${step.id}`}
                              value={opt.value}
                              checked={active}
                              onChange={() =>
                                updateStep(step.id, { status: opt.value as JourneyStepStatus })
                              }
                              className="mt-0.5"
                              aria-label={`${opt.label} for ${step.label}`}
                            />
                            <span className="flex-1">
                              <span className="font-medium">{opt.label}</span>
                              <span className="block text-xs text-muted-foreground wrap-break-word">
                                {opt.hint}
                              </span>
                            </span>
                            {active ? (
                              <CheckCircle2
                                className="size-4 shrink-0 text-primary"
                                aria-hidden="true"
                              />
                            ) : null}
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>

                  <div className="space-y-1.5">
                    <Label htmlFor={`note-${step.id}`}>Note (optional)</Label>
                    <Textarea
                      id={`note-${step.id}`}
                      value={step.note ?? ""}
                      onChange={(e) => updateStep(step.id, { note: e.target.value.slice(0, 500) })}
                      placeholder="What did you see? e.g., Button was hard to find on mobile, confirmation was slow…"
                      rows={2}
                      maxLength={500}
                      aria-label={`Note for ${step.label}`}
                    />
                    <p className="text-xs text-muted-foreground">{(step.note ?? "").length}/500</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="surface-panel flex flex-wrap items-center gap-3 p-4">
              <Button
                variant="outline"
                onClick={() => {
                  setSteps((prev) =>
                    prev.map((s) => ({ ...s, status: "passed" as JourneyStepStatus })),
                  );
                  toast.success("Marked all steps as Passed — adjust any that were not.");
                }}
              >
                <CheckCircle2 className="size-4" aria-hidden="true" /> Mark all passed
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setSteps((prev) =>
                    prev.map((s) => ({
                      ...s,
                      status: "not_tested" as JourneyStepStatus,
                      note: "",
                    })),
                  );
                  toast.success("Reset to Not tested.");
                }}
              >
                <RotateCcw className="size-4" aria-hidden="true" /> Reset
              </Button>
            </div>
          </section>
        )}

        {/* Step 5: Summary */}
        {flowStep === 5 && (
          <section aria-labelledby="summary-title" className="space-y-4">
            <div className="surface-panel p-5">
              <h2 id="summary-title" className="font-display text-xl font-bold">
                Summary for “{displayLabel}”
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your counts and what they mean for launch readiness. Blocked steps appear as a
                critical blocker; needs improvement appears as an important item.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <div className="surface-panel p-4 text-center">
                <p className="text-2xl font-bold text-success">{counts.passed}</p>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Passed
                </p>
              </div>
              <div className="surface-panel p-4 text-center border-warning/30">
                <p className="text-2xl font-bold text-warning-foreground">
                  {counts.needs_improvement}
                </p>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Needs improvement
                </p>
              </div>
              <div className="surface-panel p-4 text-center border-destructive/30">
                <p className="text-2xl font-bold text-destructive">{counts.blocked}</p>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Blocked
                </p>
              </div>
              <div className="surface-panel p-4 text-center">
                <p className="text-2xl font-bold">{counts.not_tested}</p>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Not tested
                </p>
              </div>
            </div>

            <div className="surface-panel p-5">
              <h3 className="font-display text-base font-semibold">Impact on launch readiness</h3>
              {hasBlocked ? (
                <p className="mt-2 flex gap-2 rounded-xl border border-destructive/25 bg-destructive-soft/40 p-3 text-sm">
                  <AlertTriangle className="size-4 shrink-0 text-destructive" aria-hidden="true" />
                  <span>
                    <span className="font-semibold">Critical blocker:</span> {counts.blocked}{" "}
                    blocked step{counts.blocked > 1 ? "s" : ""}. Customers cannot complete “
                    {displayLabel}”. Fix this before inviting customers.
                    {counts.blocked
                      ? ` Blocked: ${steps
                          .filter((s) => s.status === "blocked")
                          .map((s) => s.label)
                          .join("; ")}.`
                      : ""}
                  </span>
                </p>
              ) : hasNeeds ? (
                <p className="mt-2 flex gap-2 rounded-xl border border-warning/25 bg-warning-soft/50 p-3 text-sm">
                  <Info className="size-4 shrink-0 text-warning-foreground" aria-hidden="true" />
                  <span>
                    <span className="font-semibold">Important:</span> {counts.needs_improvement}{" "}
                    step{counts.needs_improvement > 1 ? "s" : ""} need improvement. Customers can
                    finish, but the experience is rough.
                    {` Details: ${steps
                      .filter((s) => s.status === "needs_improvement")
                      .map((s) => s.label)
                      .join("; ")}.`}
                  </span>
                </p>
              ) : allPassed ? (
                <p className="mt-2 flex gap-2 rounded-xl border border-success/20 bg-success-soft/40 p-3 text-sm">
                  <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden="true" />
                  <span>
                    <span className="font-semibold">All passed:</span> Your primary action looks
                    ready. It satisfies the “Test your primary customer action” readiness check.
                  </span>
                </p>
              ) : hasNotTested ? (
                <p className="mt-2 flex gap-2 rounded-xl border border-info/20 bg-info-soft/30 p-3 text-sm">
                  <Info className="size-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>
                    <span className="font-semibold">Incomplete:</span> {counts.not_tested} step
                    {counts.not_tested > 1 ? "s" : ""} still not tested. Finish testing to clear the
                    readiness blocker.
                  </span>
                </p>
              ) : null}
              <p className="mt-3 text-xs text-muted-foreground">
                Next action: {readiness.nextRecommendedAction ?? "Review checklist"} · Status:{" "}
                {readiness.status}
              </p>
            </div>

            <div className="surface-panel p-5">
              <h3 className="font-display text-base font-semibold">Your notes</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {steps.map((s) => (
                  <li key={s.id} className="flex flex-wrap gap-2 border-b border-border py-2">
                    <span className="font-medium wrap-break-word">{s.label}:</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        s.status === "passed" && "border-success/30 text-success",
                        s.status === "blocked" && "border-destructive/30 text-destructive",
                        s.status === "needs_improvement" &&
                          "border-warning/30 text-warning-foreground",
                      )}
                    >
                      {s.status.replace("_", " ")}
                    </Badge>
                    <span className="w-full text-muted-foreground wrap-break-word">
                      {s.note?.trim() || "— no note"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="surface-panel flex flex-wrap gap-2 p-5">
              <Button asChild variant="outline" size="sm">
                <Link to="/checklist">Go to checklist</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/hire-help">Hire help brief</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/troubleshooting">Troubleshooting guide</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/help">Help centre</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/checklist" search={{ filter: "blockers" } as never}>
                  View launch blockers →
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/dashboard">Back to dashboard</Link>
              </Button>
            </div>
          </section>
        )}

        {/* Navigation */}
        <div className="surface-panel flex flex-wrap items-center justify-between gap-3 p-4">
          <Button
            variant="outline"
            onClick={back}
            disabled={flowStep === 1}
            aria-label="Go to previous step"
          >
            <ArrowLeft className="size-4" aria-hidden="true" /> Back
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            {flowStep === 5 ? (
              <>
                <Button variant="outline" onClick={() => setFlowStep(1)}>
                  Test another journey
                </Button>
                <Button
                  onClick={() => {
                    save(true);
                    toast.success("Journey saved. Check dashboard readiness.");
                  }}
                >
                  Save journey
                </Button>
              </>
            ) : flowStep === 4 ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    save(false);
                    toast.success("Progress saved.");
                  }}
                >
                  Save progress
                </Button>
                <Button
                  onClick={() => {
                    save(false);
                    next();
                  }}
                  disabled={!canGoNext()}
                >
                  View summary <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              </>
            ) : (
              <Button onClick={next} disabled={!canGoNext()} aria-label="Go to next step">
                Continue <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>

        <div className="surface-panel p-4">
          <p className="text-xs text-muted-foreground">
            Educational guidance only. Testing on your own device does not guarantee every customer
            device will behave the same — review on a real phone and, if possible, ask one other
            person to try.
          </p>
          <p className="mt-2">
            <Link
              to="/checklist"
              className="text-xs font-medium text-primary underline underline-offset-4"
            >
              Back to checklist
            </Link>{" "}
            <span className="text-xs text-muted-foreground">·</span>{" "}
            <Link
              to="/dashboard"
              className="text-xs font-medium text-primary underline underline-offset-4"
            >
              Back to dashboard <ExternalLink className="inline size-3" aria-hidden="true" />
            </Link>
          </p>
        </div>
      </div>
    </AppShell>
  );
}

function getStepHint(type: CustomerJourneyType, idx: number): string {
  const hints: Record<CustomerJourneyType, string[]> = {
    phone_call: [
      "Open your site on mobile data. Can you spot the number without scrolling too much?",
      "iPhone and Android should offer to call. If not, the link may be plain text.",
      "Does the right number ring? Check business hours — should customers know when you answer?",
      "Audio should be clear. Background noise on either end loses trust quickly.",
      "If you use call tracking or a shared inbox, check the test appears where staff will see it.",
      "Most customers decide in under 30 seconds whether calling was easy.",
    ],
    whatsapp_message: [
      "The button should be easy to reach — often near the top or floating on mobile.",
      "WhatsApp should open to the correct number with a short, human pre-filled message.",
      "The message should not look spammy. Use first person and mention your business name.",
      "Send from a number that is not your business phone to simulate a real customer.",
      "Staff should see the message in the same place they normally reply.",
      "Reply promptly and check the wording is warm and actionable.",
    ],
    contact_form: [
      "The form should be reachable from every page via a clear label like Contact or Get in touch.",
      "Labels should be plain English. Mark only truly required fields as required.",
      "Use a personal email you control — not the business one — to simulate a customer.",
      "Success message should tell the customer what happens next and when you will reply.",
      "Check spam or junk folders. Many form emails land there without SPF or DMARC setup.",
      "Reply from the business inbox and confirm the customer email receives it.",
    ],
    booking: [
      "A Book now or Check availability button should be obvious on mobile.",
      "Calendar should load fast and show real availability, including blocked dates.",
      "Ask only what you need to deliver the service. Extra fields reduce completions.",
      "Confirmation page should repeat the date, time and what happens next.",
      "Email or SMS should arrive within a minute and match the page details.",
      "Customers often need to reschedule — check that edit or cancel is straightforward.",
    ],
    online_purchase: [
      "Product photos should load fast and show the real item, not a placeholder.",
      "Price, tax, delivery and returns should be unambiguous before checkout.",
      "Cart should show clearly and update without page errors.",
      "Checkout should work with autofill and show trust signals like padlock and returns link.",
      "Success page should show order number and what the customer should expect.",
      "Order should appear in your admin and the customer should get a correct email.",
    ],
    visit_location: [
      "Address and hours should be visible without endless scrolling.",
      "Tapping address should open Apple Maps or Google Maps with the correct pin.",
      "Mention parking, entrance or landmarks — customers in a rush need this.",
      "Photos should match reality so first-time visitors recognise you.",
      "Check that hours on the website match hours on the door and on your maps listing.",
      "A friend unfamiliar with the area is the best test for clarity.",
    ],
    newsletter_signup: [
      "Signup is often in the footer — make sure mobile users can actually find it.",
      "Say what you will send and how often. Vague promises reduce signups.",
      "Use a real personal address to test the full flow.",
      "The page after signup should confirm success and set inbox expectations.",
      "Welcome email should arrive within minutes and stand out from promotions.",
      "Unsubscribe should be one click and clearly honour the request.",
    ],
    custom: [
      "Start where a customer naturally starts — home page, maps listing or social link.",
      "The page should answer who you are, what you offer and what happens next.",
      "Follow the exact path a customer would, without using owner shortcuts.",
      "Look for a thank-you page, email or visual confirmation.",
      "The business should get a notification in the place staff actually check.",
      "A neutral tester quickly reveals confusing labels or hidden steps.",
    ],
  };
  return (
    hints[type]?.[idx] ?? "Try this on a phone and note anything a customer would find confusing."
  );
}
