import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ContentPageLayout, ComingSoonCard } from "@/components/ContentPage";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/create-account")({
  head: () => ({
    meta: [
      { title: "Create your account — Launch My Business Online" },
      {
        name: "description",
        content: "Name your launch plan so it is easy to pick up again. No card details, no spam, delete any time.",
      },
      { property: "og:title", content: "Create your account" },
      { property: "og:description", content: "Save and label your launch plan in seconds." },
    ],
  }),
  component: CreateAccountPage,
});

function CreateAccountPage() {
  const { signIn } = useStore();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  return (
    <ContentPageLayout
      eyebrow="Accounts"
      title="Create your account"
      description="Label the plan on this device with your name so it is easy to recognise. No payment details required."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="surface-panel space-y-4 p-5 sm:p-6">
          <form
            className="space-y-4"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (!fullName.trim()) {
                toast.error("Please enter your name.");
                return;
              }
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
                toast.error("Enter a valid email address.");
                return;
              }
              if (password.length < 8) {
                toast.error("Use at least 8 characters for your password.");
                return;
              }
              if (!agreed) {
                toast.error("Please accept the terms and privacy notice.");
                return;
              }
              signIn(fullName.trim(), email.trim());
              toast.success("Your plan is now labelled with your details.");
              navigate({ to: "/dashboard" });
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="ca-name">Your name</Label>
              <Input id="ca-name" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ca-email">Email address</Label>
              <Input
                id="ca-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ca-password">Password</Label>
              <Input
                id="ca-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-describedby="ca-password-hint"
              />
              <p id="ca-password-hint" className="text-xs text-muted-foreground">
                At least 8 characters. Three unrelated words work well.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox
                id="ca-terms"
                checked={agreed}
                onCheckedChange={(v) => setAgreed(v === true)}
                className="mt-0.5"
              />
              <Label htmlFor="ca-terms" className="text-sm leading-relaxed font-normal text-muted-foreground">
                I agree to the <Link to="/terms" className="text-primary underline">terms of use</Link> and the{" "}
                <Link to="/privacy" className="text-primary underline">privacy notice</Link>.
              </Label>
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              Create account
            </Button>
          </form>
          <p className="text-sm text-muted-foreground">
            Already started? <Link to="/sign-in" className="text-primary underline">Sign in</Link>
          </p>
        </section>

        <aside className="space-y-4">
          <div className="surface-panel space-y-2 p-5">
            <h2 className="font-display text-base font-semibold">What you get</h2>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>• A personalised roadmap for your business.</li>
              <li>• Progress saved as you tick tasks off.</li>
              <li>• Content drafts and your ownership record in one place.</li>
              <li>• Export or delete everything whenever you like.</li>
            </ul>
          </div>
          <ComingSoonCard
            title="Cross-device sync is coming"
            description="Right now your plan is stored in this browser. Creating an account labels it with your name; syncing between devices arrives with account support."
            note="No card details are ever requested."
          />
        </aside>
      </div>
    </ContentPageLayout>
  );
}
