import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ContentPageLayout, ComingSoonCard, SafetyWarningBanner } from "@/components/ContentPage";
import { Callout } from "@/components/Callouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — Launch My Business Online" },
      {
        name: "description",
        content:
          "Request a password reset link, and learn how to recover access to your registrar or email accounts.",
      },
      { property: "og:title", content: "Forgot your password?" },
      { property: "og:description", content: "Request a reset link and recover access safely." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <ContentPageLayout
      eyebrow="Accounts"
      title="Forgot your password?"
      description="Enter the email address on your plan and we will send a reset link when account sync is switched on."
    >
      {sent ? (
        <Callout tone="success" title="If that address has an account, a reset link is on its way">
          For your security we show the same message whether or not the address is registered. Check
          your inbox and spam folder. Accounts are not connected yet, so no email was actually sent.
        </Callout>
      ) : (
        <section className="surface-panel space-y-4 p-5 sm:p-6">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
                toast.error("Enter a valid email address.");
                return;
              }
              setSent(true);
            }}
            noValidate
          >
            <div className="space-y-1.5">
              <Label htmlFor="fp-email">Email address</Label>
              <Input
                id="fp-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourbusiness.com"
              />
            </div>
            <Button type="submit">Send reset link</Button>
          </form>
          <p className="text-sm text-muted-foreground">
            Remembered it?{" "}
            <Link to="/sign-in" className="text-primary underline">
              Back to sign in
            </Link>
          </p>
        </section>
      )}

      <SafetyWarningBanner title="Stay safe while recovering access">
        We will never ask for your password, recovery codes, or your registrar or DNS logins. If a
        message claiming to be from us asks for those, it is not from us.
      </SafetyWarningBanner>

      <ComingSoonCard
        title="Account sync is not live yet"
        description="Your plan is currently stored on this device only, so there is nothing to lock you out of. When accounts launch, this page will send a real reset link that expires after a short time."
        note="Until then, export your plan from Settings to keep a backup."
      >
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/settings">Export my plan</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/help">Visit the help centre</Link>
          </Button>
        </div>
      </ComingSoonCard>
    </ContentPageLayout>
  );
}
