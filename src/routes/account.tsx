import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UserRound } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Callout, OwnershipWarningCard } from "@/components/Callouts";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/lib/store";
import { PHASES, currentStage, progressPercent, remainingEffort } from "@/lib/plan";
import type { OwnershipRecord } from "@/lib/types";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My plan — your progress and your ownership record" },
      {
        name: "description",
        content:
          "Review your launch plan, your business details, and the record of who owns every account behind your online presence.",
      },
      { property: "og:title", content: "My launch plan" },
      {
        property: "og:description",
        content:
          "Progress, business details, and a written record of account ownership you can rely on.",
      },
    ],
  }),
  component: Account,
});

const OWNERSHIP_FIELDS: {
  id: keyof OwnershipRecord;
  label: string;
  help: string;
  long?: boolean;
}[] = [
  {
    id: "domainRegistrar",
    label: "Where is your domain registered?",
    help: "The company you pay each year.",
  },
  { id: "renewalDate", label: "When does it renew?", help: "Put a reminder in your calendar too." },
  {
    id: "dnsProvider",
    label: "Who manages your domain settings?",
    help: "Often the registrar, sometimes your host.",
  },
  {
    id: "websitePlatform",
    label: "What is your website built on?",
    help: "The builder, platform or agency.",
  },
  {
    id: "emailProvider",
    label: "Who provides your business email?",
    help: "Where your mailboxes live.",
  },
  {
    id: "analyticsAccount",
    label: "Whose account holds your analytics?",
    help: "It should be an account you control.",
  },
  {
    id: "paymentProcessor",
    label: "Who processes your payments?",
    help: "Registered in your business name.",
  },
  {
    id: "socialOwners",
    label: "Who has admin on your social profiles?",
    help: "List names, not just roles.",
  },
  {
    id: "recoveryOwner",
    label: "Which email recovers these accounts?",
    help: "It must be an address you can access.",
  },
  {
    id: "notes",
    label: "Anything else worth recording",
    help: "Contractor names, contract end dates, passwords manager used.",
    long: true,
  },
];

function Account() {
  const { state, hasPlan, setOwnership, signIn, signOut } = useStore();
  const [name, setName] = useState(state.account.fullName);
  const [email, setEmail] = useState(state.account.email);

  if (!hasPlan) {
    return (
      <AppShell title="My plan">
        <EmptyState
          icon={UserRound}
          title="No plan yet"
          description="Answer a few questions about your business and we will build your personalised launch plan."
          actionLabel="Create my free plan"
          actionTo="/onboarding"
        />
      </AppShell>
    );
  }

  const percent = progressPercent(state.tasks);
  const stage = PHASES.find((p) => p.key === currentStage(state.tasks));

  return (
    <AppShell title="My plan" description="Your progress, your details, and who owns what.">
      <div className="space-y-6">
        <section className="surface-panel p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold">
                {state.business.businessName || "Your business"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {state.business.category || "Uncategorised"}
                {state.business.location ? ` · ${state.business.location}` : ""}
              </p>
            </div>
            <Badge className="bg-primary-soft text-primary">{percent}% ready to launch</Badge>
          </div>
          <Progress value={percent} className="mt-4" />
          <dl className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <dt className="text-xs font-semibold text-muted-foreground uppercase">
                Current phase
              </dt>
              <dd className="mt-1 font-medium">
                {stage ? `${stage.number}. ${stage.title}` : "Getting started"}
              </dd>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <dt className="text-xs font-semibold text-muted-foreground uppercase">
                Steps remaining
              </dt>
              <dd className="mt-1 font-medium">
                {state.tasks.filter((t) => t.status !== "complete").length}
              </dd>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <dt className="text-xs font-semibold text-muted-foreground uppercase">
                Time left, roughly
              </dt>
              <dd className="mt-1 font-medium">{remainingEffort(state.tasks)}</dd>
            </div>
          </dl>
        </section>

        <section className="surface-panel space-y-4 p-5 sm:p-6">
          <h2 className="font-display text-xl font-bold">Save your progress</h2>
          {state.account.signedIn ? (
            <>
              <p className="text-sm text-muted-foreground">
                Signed in as {state.account.fullName || "you"} ({state.account.email}).
              </p>
              <Button variant="outline" onClick={signOut}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Callout tone="info" title="Your plan already saves to this device">
                Adding your name and email lets us show your plan back to you here. Accounts are
                stored locally in this demo.
              </Callout>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="acc-name">Your name</Label>
                  <Input
                    id="acc-name"
                    value={name}
                    maxLength={100}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="acc-email">Your email</Label>
                  <Input
                    id="acc-email"
                    type="email"
                    value={email}
                    maxLength={255}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <Button
                onClick={() => {
                  const trimmed = email.trim();
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
                    toast.error("Please enter a valid email address.");
                    return;
                  }
                  signIn(name.trim().slice(0, 100), trimmed.slice(0, 255));
                  toast.success("Saved. Your plan is linked to this device.");
                }}
              >
                Save my details
              </Button>
            </>
          )}
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="font-display text-xl font-bold">Your ownership record</h2>
            <p className="text-sm text-muted-foreground">
              If you ever change web designers, this page is what protects you.
            </p>
          </div>
          <OwnershipWarningCard />
          <div className="surface-panel grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
            {OWNERSHIP_FIELDS.map((f) => (
              <div key={f.id} className={f.long ? "space-y-1.5 sm:col-span-2" : "space-y-1.5"}>
                <Label htmlFor={`own-${f.id}`}>{f.label}</Label>
                {f.long ? (
                  <Textarea
                    id={`own-${f.id}`}
                    rows={3}
                    maxLength={1000}
                    value={state.ownership[f.id]}
                    onChange={(e) => setOwnership({ [f.id]: e.target.value.slice(0, 1000) })}
                  />
                ) : (
                  <Input
                    id={`own-${f.id}`}
                    maxLength={200}
                    value={state.ownership[f.id]}
                    onChange={(e) => setOwnership({ [f.id]: e.target.value.slice(0, 200) })}
                  />
                )}
                <p className="text-xs text-muted-foreground">{f.help}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Saved automatically as you type. Never store passwords here — use a password manager.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
