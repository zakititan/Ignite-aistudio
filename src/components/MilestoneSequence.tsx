import { Link } from "@tanstack/react-router";
import { CheckCircle2, ArrowRight, Circle, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export interface Milestone {
  id: string;
  stepNumber: number;
  title: string;
  isComplete: boolean;
  status: "complete" | "in_progress" | "up_next";
  completedSentence: string;
  actionSentence: string;
  actionLabel: string;
  actionRoute: string;
}

export function MilestoneSequence() {
  const { state } = useStore();

  // Milestone 1: Set up the business basics
  const m1Complete =
    state.business.businessName.trim().length > 0 &&
    (!!state.business.category || !!state.business.primaryGoal || state.onboardingComplete);

  // Milestone 2: Secure your domain
  const m2Complete =
    !!state.business.ownedDomain ||
    !!state.business.registeredDomain ||
    !!state.ownership.domainRegistrar ||
    state.savedDomainIdeas.some((d) => d.status === "registered" || d.status === "preferred") ||
    state.tasks.some((t) => t.phase === "domain" && t.status === "complete");

  // Milestone 3: Build key pages
  const m3Complete =
    Object.keys(state.drafts).length >= 1 ||
    !!state.business.preferredPlatform ||
    state.tasks.some((t) => t.phase === "content" && t.status === "complete");

  // Milestone 4: Connect and test
  const m4Complete =
    (!!state.ownership.dnsProvider ||
      state.tasks.some((t) => t.phase === "dns" && t.status === "complete")) &&
    (state.customerJourneyTest?.steps?.every((s) => s.status === "passed") || false);

  // Milestone 5: Launch and grow
  const m5Complete =
    state.tasks.length > 0 &&
    state.tasks
      .filter((t) => t.phase === "review" || t.phase === "growth")
      .every((t) => t.status === "complete") &&
    state.tasks.some((t) => t.phase === "growth");

  const completionArray = [m1Complete, m2Complete, m3Complete, m4Complete, m5Complete];
  const firstIncompleteIndex = completionArray.findIndex((c) => !c);

  const milestones: Milestone[] = [
    {
      id: "basics",
      stepNumber: 1,
      title: "Set up the business basics",
      isComplete: m1Complete,
      status: m1Complete ? "complete" : firstIncompleteIndex === 0 ? "in_progress" : "up_next",
      completedSentence: "Business name, services, and customer goals are defined and saved.",
      actionSentence: "Define your business name, primary service, and customer goal.",
      actionLabel: m1Complete ? "Review business profile" : "Complete business profile",
      actionRoute: "/business-profile",
    },
    {
      id: "domain",
      stepNumber: 2,
      title: "Secure your domain",
      isComplete: m2Complete,
      status: m2Complete ? "complete" : firstIncompleteIndex === 1 ? "in_progress" : "up_next",
      completedSentence:
        "Domain address chosen and registered directly under your direct ownership.",
      actionSentence: "Shortlist candidate names and check availability to secure your address.",
      actionLabel: m2Complete ? "Manage domain shortlist" : "Find and secure domain",
      actionRoute: "/domains",
    },
    {
      id: "content",
      stepNumber: 3,
      title: "Build key pages",
      isComplete: m3Complete,
      status: m3Complete ? "complete" : firstIncompleteIndex === 2 ? "in_progress" : "up_next",
      completedSentence:
        "Website platform selected and essential pages (Home, About, Contact) drafted.",
      actionSentence: "Select your website platform and draft the 3 core pages visitors need.",
      actionLabel: m3Complete ? "View drafted content" : "Draft page content",
      actionRoute: "/content",
    },
    {
      id: "connect_test",
      stepNumber: 4,
      title: "Connect and test",
      isComplete: m4Complete,
      status: m4Complete ? "complete" : firstIncompleteIndex === 3 ? "in_progress" : "up_next",
      completedSentence:
        "Domain DNS is connected with SSL, and the mobile customer test has passed.",
      actionSentence: "Point your domain records and test the customer journey on a phone.",
      actionLabel: m4Complete ? "Review DNS & journey" : "Connect domain & test",
      actionRoute: "/connect-domain",
    },
    {
      id: "launch_grow",
      stepNumber: 5,
      title: "Launch and grow",
      isComplete: m5Complete,
      status: m5Complete ? "complete" : firstIncompleteIndex === 4 ? "in_progress" : "up_next",
      completedSentence: "Public launch simulated, Google profile claimed, and review kit ready.",
      actionSentence: "Run pre-flight check before launch, then set up reviews and local search.",
      actionLabel: m5Complete ? "View growth tools" : "Check before launch",
      actionRoute: "/preflight",
    },
  ];

  const completedCount = milestones.filter((m) => m.isComplete).length;

  return (
    <section aria-labelledby="milestones-heading" className="surface-panel p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
              Milestone Roadmap
            </p>
            <Badge variant="outline" className="text-xs font-normal">
              {completedCount} of 5 milestones reached
            </Badge>
          </div>
          <h2 id="milestones-heading" className="mt-1 font-display text-xl font-bold">
            Your 5-Step Launch Journey
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A clear sequence from first idea to public launch. Focus on one milestone at a time.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-5">
        {milestones.map((m) => {
          const isCurrent = m.status === "in_progress";
          const isDone = m.status === "complete";

          return (
            <div
              key={m.id}
              className={cn(
                "relative flex flex-col justify-between rounded-xl border p-4 transition-all",
                isDone
                  ? "border-success/30 bg-success-soft/20 text-foreground"
                  : isCurrent
                    ? "border-primary bg-primary-soft/30 shadow-sm ring-1 ring-primary/20"
                    : "border-border bg-card/60 text-muted-foreground",
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      isDone
                        ? "bg-success text-success-foreground"
                        : isCurrent
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {isDone ? <CheckCircle2 className="size-4" /> : m.stepNumber}
                  </span>
                  <Badge
                    variant={isDone ? "default" : isCurrent ? "default" : "outline"}
                    className={cn(
                      "text-[10px] px-1.5 py-0 font-medium",
                      isDone && "bg-success text-success-foreground",
                      isCurrent && "bg-primary text-primary-foreground",
                    )}
                  >
                    {isDone ? "Complete" : isCurrent ? "In progress" : "Up next"}
                  </Badge>
                </div>

                <h3 className="mt-2.5 font-display text-sm font-bold text-foreground">{m.title}</h3>

                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {isDone ? m.completedSentence : m.actionSentence}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/60">
                <Button
                  asChild
                  size="sm"
                  variant={isCurrent ? "default" : "outline"}
                  className="w-full justify-between text-xs h-8"
                >
                  <Link to={m.actionRoute as never}>
                    <span className="truncate">{m.actionLabel}</span>
                    <ArrowRight className="size-3.5 shrink-0 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
