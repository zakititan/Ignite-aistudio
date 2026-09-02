import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeMenu, ThemeToggle } from "@/components/ThemeToggle";

const LINKS = [
  { to: "/how-it-works", label: "How It Works" },
  { to: "/onboarding", label: "Build My Plan" },
  { to: "/learn", label: "Learn" },
  { to: "/help", label: "Help" },
] as const;

export function MarketingNavbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3.5 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5" aria-label="Cornerstone, home">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Rocket className="size-4.5" aria-hidden="true" />
          </span>
          <span className="font-display text-base font-bold tracking-tight">Cornerstone</span>
        </Link>

        <nav aria-label="Primary" className="ml-auto hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeProps={{ className: "bg-muted text-foreground" }}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-2">
          <ThemeToggle />
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link to="/sign-in">Sign In</Link>
          </Button>
          <Button asChild className="hidden sm:inline-flex">
            <Link to="/create-account">Create Account</Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="min-h-11 min-w-11 md:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 overflow-y-auto p-6">
              <SheetTitle className="font-display">Menu</SheetTitle>
              <nav aria-label="Mobile" className="mt-6 flex flex-col gap-1">
                {LINKS.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                  >
                    {l.label}
                  </Link>
                ))}
                <Link
                  to="/checklist"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                >
                  Launch Checklist
                </Link>
                <Link
                  to="/sign-in"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                >
                  Sign In
                </Link>
              </nav>
              <ThemeMenu className="mt-6" />
              <Button asChild className="mt-6 w-full">
                <Link to="/create-account" onClick={() => setOpen(false)}>
                  Create My Free Plan
                </Link>
              </Button>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
