import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ContentPageLayout, ComingSoonCard, SafetyWarningBanner } from "@/components/ContentPage";
import { Callout } from "@/components/Callouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Choose a new password — Launch My Business Online" },
      {
        name: "description",
        content: "Set a new password for your launch plan account, with guidance on strong passphrases.",
      },
      { property: "og:title", content: "Choose a new password" },
      { property: "og:description", content: "Set a strong new password and get back to your launch plan." },
    ],
  }),
  component: ResetPasswordPage,
});

function strengthOf(pw: string) {
  let score = 0;
  if (pw.length >= 12) score += 2;
  else if (pw.length >= 8) score += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  if (score <= 2) return { label: "Weak", tone: "text-destructive" as const };
  if (score <= 4) return { label: "Reasonable", tone: "text-warning-foreground" as const };
  return { label: "Strong", tone: "text-success-foreground" as const };
}

function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const strength = strengthOf(password);

  return (
    <ContentPageLayout
      eyebrow="Accounts"
      title="Choose a new password"
      description="Pick something long and memorable. Length matters far more than odd symbols."
    >
      {done ? (
        <Callout tone="success" title="Password updated (demo)">
          Accounts are not connected yet, so nothing was changed on a server. When account sync launches you will be
          returned to sign in automatically.
          <div className="mt-3">
            <Button asChild size="sm">
              <Link to="/sign-in">Go to sign in</Link>
            </Button>
          </div>
        </Callout>
      ) : (
        <section className="surface-panel space-y-4 p-5 sm:p-6">
          <form
            className="space-y-4"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (password.length < 8) {
                toast.error("Use at least 8 characters — 12 or more is better.");
                return;
              }
              if (password !== confirm) {
                toast.error("The two passwords do not match.");
                return;
              }
              setDone(true);
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="rp-password">New password</Label>
              <Input
                id="rp-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-describedby="rp-strength"
              />
              <p id="rp-strength" className="text-sm text-muted-foreground" aria-live="polite">
                Strength: <span className={strength.tone}>{password ? strength.label : "—"}</span>
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rp-confirm">Confirm new password</Label>
              <Input
                id="rp-confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <Button type="submit">Update password</Button>
          </form>
        </section>
      )}

      <SafetyWarningBanner title="Password tips that actually help">
        Use three or four unrelated words, never reuse the password from your email or registrar account, and turn on
        two-step verification wherever it is offered. A password manager is the easiest way to keep this simple.
      </SafetyWarningBanner>

      <ComingSoonCard
        title="Reset links are not live yet"
        description="This page normally opens from a one-time link in your email. Until account sync launches, your plan lives only on this device."
      >
        <Button asChild variant="outline" size="sm">
          <Link to="/forgot-password">Back to password reset</Link>
        </Button>
      </ComingSoonCard>
    </ContentPageLayout>
  );
}
