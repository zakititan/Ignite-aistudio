import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Rocket } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteFooter } from "@/components/SiteFooter";
import { MarketingNavbar } from "@/components/MarketingNavbar";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/sign-in")({
  head: () => ({
    meta: [
      { title: "Sign in — Cornerstone" },
      {
        name: "description",
        content: "Come back to your saved launch plan and pick up where you left off.",
      },
      { property: "og:title", content: "Sign in to your launch plan" },
      {
        property: "og:description",
        content: "Return to your personalised roadmap for getting your business online.",
      },
    ],
  }),
  component: SignIn,
});

function SignIn() {
  const { signIn } = useStore();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <MarketingNavbar />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="surface-panel w-full max-w-md p-6 sm:p-8">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Rocket className="size-5" aria-hidden="true" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your plan is saved on this device. Add your details to label it as yours.
          </p>

          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const trimmed = email.trim();
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
                toast.error("Please enter a valid email address.");
                return;
              }
              signIn(name.trim().slice(0, 100), trimmed.slice(0, 255));
              toast.success("You're signed in.");
              navigate({ to: "/dashboard" });
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="si-name">Your name</Label>
              <Input
                id="si-name"
                value={name}
                maxLength={100}
                onChange={(e) => setName(e.target.value)}
                placeholder="Maya Ellison"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="si-email">Your email</Label>
              <Input
                id="si-email"
                type="email"
                required
                maxLength={255}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourbusiness.com"
              />
            </div>
            <Button type="submit" className="w-full">
              Continue to my plan
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground">
            No plan yet?{" "}
            <Link
              to="/onboarding"
              className="font-medium text-primary underline underline-offset-4"
            >
              Create your free plan
            </Link>
            .
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
