import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { MarketingNavbar } from "@/components/MarketingNavbar";
import { OnlinePresenceMap } from "@/components/OnlinePresenceMap";
import { Callout } from "@/components/Callouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useStore } from "@/lib/store";
import { CATEGORIES, GOALS, START_POINTS, WEBSITE_NEEDS, demoBusiness } from "@/lib/plan";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Build my launch plan — Cornerstone" },
      {
        name: "description",
        content:
          "Answer seven short steps about your business and get a personalized website launch roadmap with clear, jargon-free tasks.",
      },
      { property: "og:title", content: "Build your personalized launch plan" },
      {
        property: "og:description",
        content:
          "Seven short steps. No technical questions. Your answers save automatically in this browser.",
      },
    ],
  }),
  component: Onboarding,
});

const STEP_TITLES = [
  "Business basics",
  "Your main goal",
  "Your domain, website and email",
  "What your website needs",
  "Budget and timeline",
  "Skills and preferences",
  "Your plan",
];

const YES_NO_UNSURE = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unsure", label: "Not sure" },
];

type FieldErrors = Partial<
  Record<
    | "businessName"
    | "category"
    | "location"
    | "customerModel"
    | "primaryGoal"
    | "currentStatus"
    | "ownedDomain"
    | "needs"
    | "timeline"
    | "techComfort",
    string
  >
>;

function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
  htmlFor?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-base">
        {label}
      </Label>
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
      {children}
      {error ? (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ChoiceList({
  name,
  options,
  value,
  onChange,
  columns = 1,
}: {
  name: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  columns?: number;
}) {
  return (
    <RadioGroup
      value={value}
      onValueChange={onChange}
      className={cn("gap-2", columns === 2 && "sm:grid-cols-2")}
    >
      {options.map((opt) => (
        <Label
          key={opt}
          htmlFor={`${name}-${opt}`}
          className={cn(
            "flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm font-medium transition-colors",
            value === opt
              ? "border-primary bg-primary-soft"
              : "border-border bg-card hover:bg-muted",
          )}
        >
          <RadioGroupItem id={`${name}-${opt}`} value={opt} />
          {opt}
        </Label>
      ))}
    </RadioGroup>
  );
}

function Onboarding() {
  const navigate = useNavigate();
  const { state, hydrated, setBusiness, setOnboardingStep, generatePlan, loadDemo } = useStore();
  const b = state.business;
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (hydrated && state.onboardingStep) setStep(Math.min(state.onboardingStep, 6));
  }, [hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  const go = (next: number) => {
    setStep(next);
    setOnboardingStep(next);
    setErrors({});
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  function validate(current: number) {
    const e: FieldErrors = {};
    if (current === 0) {
      if (!b.businessName.trim())
        e.businessName = "Please tell us your business name so we can personalize your plan.";
      if (!b.category) e.category = "Choose the closest category. You can change it later.";
      if (!b.location.trim())
        e.location = "Add at least a city or region so we can tailor local guidance.";
      if (!b.customerModel)
        e.customerModel = "Let us know whether you serve customers locally, online, or both.";
    }
    if (current === 1 && !b.primaryGoal) {
      e.primaryGoal = "Please choose at least one main website goal so we can tailor your plan.";
    }
    if (current === 2) {
      if (!b.currentStatus) e.currentStatus = "Pick the option closest to your situation.";
      if (b.currentStatus === "I already own a domain") {
        if (!b.ownedDomain.trim())
          e.ownedDomain = "Enter your web address so we can include it in your plan.";
        else if (!/^[a-z0-9][a-z0-9-]*(\.[a-z0-9-]+)+$/i.test(b.ownedDomain.trim()))
          e.ownedDomain =
            "That does not look like a valid domain format. Try something like yourbusiness.com.";
      }
    }
    if (current === 3 && b.needs.length === 0) {
      e.needs = "Choose at least one thing your website needs to do.";
    }
    if (current === 4) {
      if (!b.timeline) e.timeline = "Choose a timeline, even a rough one.";
    }
    if (current === 5 && !b.techComfort) {
      e.techComfort =
        "Tell us how comfortable you feel with technology so we can pitch the guidance correctly.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const handleNext = () => {
    if (!validate(step)) {
      toast.error("A few answers are missing. We highlighted them below.");
      return;
    }
    toast.success("Saved. You can leave and come back any time.");
    go(step + 1);
  };

  const handleGenerate = () => {
    setGenerating(true);
    window.setTimeout(() => {
      generatePlan();
      setGenerating(false);
      toast.success("Your launch roadmap is ready.");
      navigate({ to: "/dashboard" });
    }, 1600);
  };

  const toggleNeed = (need: string) =>
    setBusiness({
      needs: b.needs.includes(need) ? b.needs.filter((n) => n !== need) : [...b.needs, need],
    });

  const percent = Math.round(((step + 1) / 7) * 100);

  return (
    <div className="min-h-screen bg-surface">
      <MarketingNavbar />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="mb-8">
          <div className="flex items-baseline justify-between gap-4">
            <h1 className="font-display text-2xl font-bold sm:text-3xl">{STEP_TITLES[step]}</h1>
            <p className="text-sm font-medium text-muted-foreground">Step {step + 1} of 7</p>
          </div>
          <Progress
            value={percent}
            className="mt-3"
            aria-label={`Onboarding ${percent}% complete`}
          />
          <p className="mt-2 text-sm text-muted-foreground">
            Your answers save automatically in this browser. You do not need to finish today.
          </p>
        </div>

        <div className="surface-panel space-y-7 p-5 sm:p-7">
          {step === 0 && (
            <>
              <Field label="Business name" error={errors.businessName} htmlFor="businessName">
                <Input
                  id="businessName"
                  value={b.businessName}
                  onChange={(e) => setBusiness({ businessName: e.target.value })}
                  placeholder="Harbor & Hearth Bakery"
                  aria-invalid={Boolean(errors.businessName)}
                />
              </Field>
              <Field label="Business category" error={errors.category}>
                <Select value={b.category} onValueChange={(v) => setBusiness({ category: v })}>
                  <SelectTrigger aria-label="Business category">
                    <SelectValue placeholder="Choose the closest match" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field
                label="Describe what you sell or offer"
                hint="One or two sentences in your own words is plenty."
                htmlFor="description"
              >
                <Textarea
                  id="description"
                  rows={3}
                  value={b.description}
                  onChange={(e) => setBusiness({ description: e.target.value })}
                  placeholder="Fresh breads, pastries and custom celebration cakes made to order."
                />
              </Field>
              <Field label="City, region or country" error={errors.location} htmlFor="location">
                <Input
                  id="location"
                  value={b.location}
                  onChange={(e) => setBusiness({ location: e.target.value })}
                  placeholder="Mumbai, India"
                  aria-invalid={Boolean(errors.location)}
                />
              </Field>
              <Field label="Is your business online, local, or both?" error={errors.customerModel}>
                <ChoiceList
                  name="model"
                  options={["local", "online", "both"]}
                  value={b.customerModel}
                  onChange={(v) => setBusiness({ customerModel: v as typeof b.customerModel })}
                  columns={2}
                />
              </Field>
              <div className="space-y-3 rounded-xl border border-border bg-muted/40 p-4">
                {[
                  { key: "hasPhysicalLocation", label: "Customers visit a physical location" },
                  {
                    key: "servesAtCustomerLocation",
                    label: "You serve customers at their location",
                  },
                  { key: "hasBusinessHours", label: "You have set business hours" },
                ].map((row) => (
                  <div key={row.key} className="flex items-center justify-between gap-4">
                    <Label htmlFor={row.key} className="text-sm font-normal">
                      {row.label}
                    </Label>
                    <Switch
                      id={row.key}
                      checked={Boolean(b[row.key as keyof typeof b])}
                      onCheckedChange={(checked) => setBusiness({ [row.key]: checked } as never)}
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 1 && (
            <Field
              label="What is the single most important thing your website should achieve?"
              hint="Pick one. Everything else can still be included later."
              error={errors.primaryGoal}
            >
              <ChoiceList
                name="goal"
                options={GOALS}
                value={b.primaryGoal}
                onChange={(v) => setBusiness({ primaryGoal: v })}
              />
            </Field>
          )}

          {step === 2 && (
            <>
              <OnlinePresenceMap showActions={false} />
              <Field label="Where are you starting from?" error={errors.currentStatus}>
                <ChoiceList
                  name="status"
                  options={START_POINTS}
                  value={b.currentStatus}
                  onChange={(v) => setBusiness({ currentStatus: v })}
                />
              </Field>

              {b.currentStatus === "I already own a domain" && (
                <div className="space-y-6 rounded-xl border border-primary/25 bg-primary-soft/40 p-5">
                  <Field
                    label="Your web address (domain)"
                    error={errors.ownedDomain}
                    htmlFor="ownedDomain"
                  >
                    <Input
                      id="ownedDomain"
                      value={b.ownedDomain}
                      onChange={(e) => setBusiness({ ownedDomain: e.target.value })}
                      placeholder="yourbusiness.com"
                      aria-invalid={Boolean(errors.ownedDomain)}
                    />
                  </Field>
                  <Field label="Where did you buy it? (optional)" htmlFor="registrar">
                    <Input
                      id="registrar"
                      value={b.registrarName}
                      onChange={(e) => setBusiness({ registrarName: e.target.value })}
                      placeholder="The company you pay for it each year"
                    />
                  </Field>
                  <Field label="Do you have login access to that account?">
                    <ChoiceList
                      name="access"
                      options={YES_NO_UNSURE.map((o) => o.label)}
                      value={
                        YES_NO_UNSURE.find((o) => o.value === b.hasRegistrarAccess)?.label ?? ""
                      }
                      onChange={(v) =>
                        setBusiness({
                          hasRegistrarAccess: YES_NO_UNSURE.find((o) => o.label === v)
                            ?.value as never,
                        })
                      }
                      columns={2}
                    />
                  </Field>
                  <Field label="Do you have access to the email used for that account?">
                    <ChoiceList
                      name="recovery"
                      options={YES_NO_UNSURE.map((o) => o.label)}
                      value={
                        YES_NO_UNSURE.find((o) => o.value === b.hasRecoveryEmailAccess)?.label ?? ""
                      }
                      onChange={(v) =>
                        setBusiness({
                          hasRecoveryEmailAccess: YES_NO_UNSURE.find((o) => o.label === v)
                            ?.value as never,
                        })
                      }
                      columns={2}
                    />
                  </Field>
                </div>
              )}

              {b.currentStatus === "Someone else manages my website/domain" && (
                <Callout tone="warning" title="Confirm ownership before making changes">
                  Before making changes, confirm who owns the domain, hosting account, website
                  platform account and business email account. Your plan will include a recovery and
                  access checklist.
                </Callout>
              )}
            </>
          )}

          {step === 3 && (
            <Field
              label="What does your website need to do?"
              hint="Choose everything that applies. You can change this later."
              error={errors.needs}
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {WEBSITE_NEEDS.map((need) => (
                  <Label
                    key={need}
                    htmlFor={`need-${need}`}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 text-sm font-medium transition-colors",
                      b.needs.includes(need)
                        ? "border-primary bg-primary-soft"
                        : "border-border bg-card hover:bg-muted",
                    )}
                  >
                    <Checkbox
                      id={`need-${need}`}
                      checked={b.needs.includes(need)}
                      onCheckedChange={() => toggleNeed(need)}
                    />
                    {need}
                  </Label>
                ))}
              </div>
            </Field>
          )}

          {step === 4 && (
            <>
              <Field
                label="One-time setup budget"
                hint="A rough range is fine. Currency is up to you."
              >
                <ChoiceList
                  name="setupBudget"
                  options={[
                    "Under 10,000",
                    "10,000 – 40,000",
                    "40,000 – 100,000",
                    "Over 100,000",
                    "Not sure yet",
                  ]}
                  value={b.setupBudget}
                  onChange={(v) => setBusiness({ setupBudget: v })}
                  columns={2}
                />
              </Field>
              <Field label="Comfortable ongoing monthly cost">
                <ChoiceList
                  name="monthlyBudget"
                  options={[
                    "Under 1,000 per month",
                    "1,000 – 3,000 per month",
                    "3,000+ per month",
                    "Not sure yet",
                  ]}
                  value={b.monthlyBudget}
                  onChange={(v) => setBusiness({ monthlyBudget: v })}
                  columns={2}
                />
              </Field>
              <Field label="When do you want to be live?" error={errors.timeline}>
                <ChoiceList
                  name="timeline"
                  options={["Today", "This week", "This month", "Flexible"]}
                  value={b.timeline}
                  onChange={(v) => setBusiness({ timeline: v })}
                  columns={2}
                />
              </Field>
              <Field label="How would you prefer to build it?">
                <ChoiceList
                  name="buildPreference"
                  options={["Do it myself", "Do it myself with guidance", "Hire someone to do it"]}
                  value={b.buildPreference}
                  onChange={(v) => setBusiness({ buildPreference: v })}
                />
              </Field>
            </>
          )}

          {step === 5 && (
            <>
              <Field label="How comfortable are you with technology?" error={errors.techComfort}>
                <ChoiceList
                  name="comfort"
                  options={["beginner", "comfortable", "confident"]}
                  value={b.techComfort}
                  onChange={(v) => setBusiness({ techComfort: v as typeof b.techComfort })}
                  columns={2}
                />
              </Field>
              <Field label="Do you want to update the website yourself?">
                <ChoiceList
                  name="selfUpdate"
                  options={YES_NO_UNSURE.map((o) => o.label)}
                  value={YES_NO_UNSURE.find((o) => o.value === b.wantsSelfUpdate)?.label ?? ""}
                  onChange={(v) =>
                    setBusiness({
                      wantsSelfUpdate: YES_NO_UNSURE.find((o) => o.label === v)?.value as never,
                    })
                  }
                  columns={2}
                />
              </Field>
              <Field label="What brand materials do you already have?">
                <div className="grid gap-2 sm:grid-cols-2">
                  {["Logo", "Brand colors", "Photos", "None yet"].map((asset) => (
                    <Label
                      key={asset}
                      htmlFor={`asset-${asset}`}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 text-sm font-medium",
                        b.brandAssets.includes(asset)
                          ? "border-primary bg-primary-soft"
                          : "border-border bg-card hover:bg-muted",
                      )}
                    >
                      <Checkbox
                        id={`asset-${asset}`}
                        checked={b.brandAssets.includes(asset)}
                        onCheckedChange={() =>
                          setBusiness({
                            brandAssets: b.brandAssets.includes(asset)
                              ? b.brandAssets.filter((a) => a !== asset)
                              : [...b.brandAssets, asset],
                          })
                        }
                      />
                      {asset}
                    </Label>
                  ))}
                </div>
              </Field>
              <Field label="Do you need help writing website content?">
                <ChoiceList
                  name="contentHelp"
                  options={["Yes", "No"]}
                  value={
                    b.needsContentHelp === "yes" ? "Yes" : b.needsContentHelp === "no" ? "No" : ""
                  }
                  onChange={(v) => setBusiness({ needsContentHelp: v === "Yes" ? "yes" : "no" })}
                  columns={2}
                />
              </Field>
              <Field label="Do you need a business email address?">
                <ChoiceList
                  name="emailNeed"
                  options={YES_NO_UNSURE.map((o) => o.label)}
                  value={YES_NO_UNSURE.find((o) => o.value === b.needsBusinessEmail)?.label ?? ""}
                  onChange={(v) =>
                    setBusiness({
                      needsBusinessEmail: YES_NO_UNSURE.find((o) => o.label === v)?.value as never,
                    })
                  }
                  columns={2}
                />
              </Field>
            </>
          )}

          {step === 6 && (
            <div className="space-y-6">
              {generating ? (
                <div className="flex flex-col items-center gap-4 py-14 text-center">
                  <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
                  <p className="font-display text-xl font-semibold">
                    Creating your personalized launch roadmap…
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Matching your goal, budget, timeline and comfort level to the right tasks.
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="font-display text-xl font-semibold">Check your answers</h2>
                  <dl className="grid gap-3 sm:grid-cols-2">
                    {[
                      ["Business", b.businessName || "—"],
                      ["Category", b.category || "—"],
                      ["Location", b.location || "—"],
                      ["Customer model", b.customerModel || "—"],
                      ["Main goal", b.primaryGoal || "—"],
                      ["Starting point", b.currentStatus || "—"],
                      ["Timeline", b.timeline || "—"],
                      ["Tech comfort", b.techComfort || "—"],
                      ["Website needs", b.needs.join(", ") || "—"],
                    ].map(([k, v]) => (
                      <div key={k} className="rounded-xl border border-border bg-muted/40 p-4">
                        <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                          {k}
                        </dt>
                        <dd className="mt-1 text-sm font-medium">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <Button size="lg" className="w-full" onClick={handleGenerate}>
                    <Sparkles className="size-4" aria-hidden="true" />
                    Generate my launch roadmap
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Your roadmap is general educational guidance. Review provider documentation and
                    seek qualified professional advice when needed.
                  </p>
                  <div className="rounded-xl border border-border bg-muted/30 p-3 text-sm">
                    <p className="font-medium">Next: fine-tune your business profile</p>
                    <p className="text-muted-foreground">
                      After generation you can refine everything in one place — basics, location,
                      contact, brand and online setup — and it stays in sync with content, journey
                      and handoff.
                    </p>
                    <p className="mt-1">
                      <Link
                        to="/business-profile"
                        className="font-medium text-primary underline underline-offset-4"
                      >
                        Open business profile →
                      </Link>
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {!generating && (
            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
              {step > 0 ? (
                <Button variant="outline" onClick={() => go(step - 1)}>
                  <ArrowLeft className="size-4" aria-hidden="true" /> Back
                </Button>
              ) : null}
              {step < 6 ? (
                <Button onClick={handleNext} className="ml-auto">
                  Save and continue <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              ) : null}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
          <Button
            variant="ghost"
            onClick={() => {
              setBusiness(demoBusiness);
              loadDemo();
              toast.success("Loaded the Harbor & Hearth Bakery demo.");
              navigate({ to: "/dashboard" });
            }}
          >
            Try it with a demo business instead
          </Button>
          <Link to="/" className="text-muted-foreground underline underline-offset-4">
            Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
