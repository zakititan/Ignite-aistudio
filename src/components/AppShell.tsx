import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Globe,
  Blocks,
  Network,
  ListChecks,
  FileText,
  Mail,
  Search,
  Wrench,
  BookOpen,
  Settings,
  UserRound,
  Menu,
  Rocket,
  ShieldCheck,
  LifeBuoy,
  Building2,
  ClipboardCheck,
  Calculator,
  Star,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeMenu, ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/launch-wizard", label: "Launch Track Wizard", icon: Rocket },
  { to: "/preflight", label: "Pre-Flight Simulator", icon: ShieldCheck },
  { to: "/cost-calculator", label: "3-Yr Cost Calculator", icon: Calculator },
  { to: "/email-signature", label: "Email Signature Generator", icon: Mail },
  { to: "/review-kit", label: "Google Review QR Kit", icon: Star },
  { to: "/domains", label: "Domain finder", icon: Globe },
  { to: "/platform-matcher", label: "Website & hosting", icon: Blocks },
  { to: "/connect-domain", label: "Connect domain", icon: Network },
  { to: "/checklist", label: "Launch checklist", icon: ListChecks },
  { to: "/content", label: "Content builder", icon: FileText },
  { to: "/business-email", label: "Business email", icon: Mail },
  { to: "/get-found", label: "Get found", icon: Search },
  { to: "/launch-dossier", label: "Launch dossier", icon: FileText },
  { to: "/security-drill", label: "Security & Recovery", icon: ShieldAlert },
  { to: "/maintenance", label: "Maintenance", icon: Wrench },
  { to: "/learn", label: "Learning library", icon: BookOpen },
  { to: "/ownership-record", label: "Ownership record", icon: ShieldCheck },
  { to: "/help", label: "Help centre", icon: LifeBuoy },
  { to: "/account", label: "My plan", icon: UserRound },
  { to: "/settings", label: "Settings & privacy", icon: Settings },
] as const;

const MOBILE_NAV = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/checklist", label: "Checklist", icon: ListChecks },
  { to: "/domains", label: "Domain", icon: Globe },
  { to: "/learn", label: "Learn", icon: BookOpen },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav aria-label="Main" className="space-y-1">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/60",
            )}
          >
            <Icon className="size-4.5 shrink-0" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto flex w-full max-w-[1400px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 overflow-y-auto border-r border-sidebar-border bg-sidebar px-4 py-6 lg:flex">
          <Link to="/" className="flex items-center gap-2 px-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Rocket className="size-4.5" aria-hidden="true" />
            </span>
            <span className="font-display text-sm leading-tight font-bold">
              Launch My
              <br />
              Business Online
            </span>
          </Link>
          <NavLinks />
          <div
            aria-label="Quick actions"
            className="rounded-xl border border-sidebar-border bg-sidebar-accent/20 p-2"
          >
            <p className="px-2 pb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              Quick actions
            </p>
            <Link
              to="/business-profile"
              className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/60"
            >
              <Building2 className="size-4" aria-hidden="true" />
              Business profile
            </Link>
            <Link
              to="/customer-journey"
              className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/60"
            >
              <ClipboardCheck className="size-4" aria-hidden="true" />
              Journey tester
            </Link>
            <p className="px-2 pt-1 text-[11px] leading-relaxed text-muted-foreground">
              Also in Dashboard quick tools.
            </p>
          </div>
          <ThemeMenu className="mt-auto" />
          <p className=" px-2 text-xs text-muted-foreground">
            Educational guidance only. Pricing, eligibility and provider features vary.
          </p>
        </aside>

        <div className="min-w-0 flex-1 pb-24 lg:pb-0">
          <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
            <div className="flex items-center gap-3 px-4 py-4 sm:px-6">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    aria-label="Open navigation menu"
                  >
                    <Menu className="size-5" aria-hidden="true" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 overflow-y-auto bg-sidebar p-4">
                  <SheetTitle className="px-3 pb-4 font-display">
                    Launch My Business Online
                  </SheetTitle>
                  <NavLinks onNavigate={() => setOpen(false)} />
                  <div className="mt-4 rounded-xl border border-sidebar-border bg-sidebar-accent/20 p-2">
                    <p className="px-2 pb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                      Quick actions
                    </p>
                    <Link
                      to="/business-profile"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium"
                    >
                      <Building2 className="size-4" aria-hidden="true" />
                      Business profile
                    </Link>
                    <Link
                      to="/customer-journey"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium"
                    >
                      <ClipboardCheck className="size-4" aria-hidden="true" />
                      Journey tester
                    </Link>
                  </div>
                  <ThemeMenu className="mt-6" />
                </SheetContent>
              </Sheet>
              <div className="min-w-0 flex-1">
                <h1 className="truncate font-display text-xl font-bold sm:text-2xl">{title}</h1>
                {description ? (
                  <p className="truncate text-sm text-muted-foreground">{description}</p>
                ) : null}
              </div>
              <ThemeToggle />
              {actions}
            </div>
          </header>
          <main className="px-4 py-6 sm:px-6 lg:py-8">{children}</main>
        </div>
      </div>

      <nav
        aria-label="Quick navigation"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-background/95 backdrop-blur lg:hidden"
      >
        {MOBILE_NAV.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-xs font-medium",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
