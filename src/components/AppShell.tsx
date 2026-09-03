import { Link, useRouterState } from "@tanstack/react-router";
import { useState, useEffect, useMemo, type ReactNode } from "react";
import {
  Menu,
  Rocket,
  ChevronDown,
  ArrowRight,
  Clock,
  HardDrive,
  Sparkles,
  LayoutDashboard,
  ListChecks,
  Globe,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeMenu, ThemeToggle } from "@/components/ThemeToggle";
import { CommandSearch } from "@/components/CommandSearch";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useStore } from "@/lib/store";
import { NAV_GROUPS, ROUTE_HIERARCHY, getNextBestStep, type NavGroup } from "@/lib/navigation-data";
import { getRecentTools, recordVisitedTool, type RecentTool } from "@/lib/recent-tools";
import { cn } from "@/lib/utils";

function GroupedNavLinks({
  openGroups,
  onToggleGroup,
  onNavigate,
}: {
  openGroups: Record<string, boolean>;
  onToggleGroup: (id: string) => void;
  onNavigate?: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav aria-label="Main" className="space-y-3">
      {NAV_GROUPS.map((group) => {
        const isOpen = !!openGroups[group.id];
        const hasActiveChild = group.items.some((item) => item.to === pathname);

        return (
          <Collapsible
            key={group.id}
            open={isOpen}
            onOpenChange={() => onToggleGroup(group.id)}
            className="space-y-1"
          >
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors",
                  hasActiveChild
                    ? "text-primary hover:bg-sidebar-accent/50"
                    : "text-muted-foreground hover:bg-sidebar-accent/40 hover:text-sidebar-foreground",
                )}
              >
                <span>{group.title}</span>
                <ChevronDown
                  className={cn(
                    "size-3.5 shrink-0 transition-transform duration-200",
                    isOpen && "rotate-180",
                  )}
                  aria-hidden="true"
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-0.5 pt-0.5">
              {group.items.map(({ to, label, icon: Icon }) => {
                const active = pathname === to;
                return (
                  <Link
                    key={to}
                    to={to as never}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/60",
                    )}
                  >
                    <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="truncate">{label}</span>
                  </Link>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { state, lastSavedAt } = useStore();

  // Next best step
  const nextStep = useMemo(() => getNextBestStep(state), [state]);

  // Current active group for default expansion
  const currentGroupId = useMemo(() => {
    return NAV_GROUPS.find((g) => g.items.some((i) => i.to === pathname))?.id ?? "plan";
  }, [pathname]);

  // Collapsible groups state: only current group expanded by default
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => ({
    [currentGroupId]: true,
  }));

  // Auto-expand current group when route changes, keep others collapsed unless toggled
  useEffect(() => {
    setOpenGroups({ [currentGroupId]: true });
  }, [currentGroupId]);

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Recently used tools
  const [recentTools, setRecentTools] = useState<RecentTool[]>([]);

  useEffect(() => {
    recordVisitedTool(pathname);
    setRecentTools(getRecentTools());
    const handler = () => setRecentTools(getRecentTools());
    window.addEventListener("cornerstone:recent-tools-updated", handler);
    return () => window.removeEventListener("cornerstone:recent-tools-updated", handler);
  }, [pathname]);

  // Contextual breadcrumb & return path
  const hierarchy = ROUTE_HIERARCHY[pathname];
  const isDashboard = pathname === "/dashboard" || pathname === "/" || pathname === "/onboarding";

  // Mobile navigation intent states
  const isHomeActive = pathname === "/dashboard";
  const isPlanActive =
    pathname === "/checklist" || pathname === "/business-profile" || pathname === "/account";
  const isBuildActive = NAV_GROUPS.find((g) => g.id === "build")?.items.some(
    (i) => i.to === pathname,
  );
  const isGrowActive = NAV_GROUPS.find((g) => g.id === "grow")?.items.some(
    (i) => i.to === pathname,
  );

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto flex w-full max-w-[1440px]">
        {/* Desktop Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-4 overflow-y-auto border-r border-sidebar-border bg-sidebar px-4 py-5 lg:flex">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-2"
            aria-label="Cornerstone, back to homepage"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <Rocket className="size-4.5" aria-hidden="true" />
            </span>
            <div>
              <span className="font-display text-base leading-tight font-bold text-foreground">
                Cornerstone
              </span>
              <span className="block text-[10px] text-muted-foreground">Launch Readiness</span>
            </div>
          </Link>

          {/* Persistent "Continue: [task name]" Primary Action in Sidebar */}
          <div className="rounded-xl border border-primary/25 bg-primary/5 p-3">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-primary">
              <span>Next best step</span>
              <Sparkles className="size-3" />
            </div>
            <p className="mt-1 line-clamp-1 text-xs font-semibold text-foreground">
              {nextStep.name}
            </p>
            <Button
              asChild
              size="sm"
              className="mt-2.5 w-full justify-between gap-1 text-xs font-semibold shadow-xs"
            >
              <Link to={nextStep.route as never}>
                <span className="truncate">Continue: {nextStep.name}</span>
                <ArrowRight className="size-3.5 shrink-0" />
              </Link>
            </Button>
          </div>

          {/* 5 Grouped Collapsible Nav Sections */}
          <div className="flex-1 overflow-y-auto pr-1">
            <GroupedNavLinks openGroups={openGroups} onToggleGroup={toggleGroup} />

            {/* Lightweight Recently Used Section in Sidebar */}
            {recentTools.length > 0 && (
              <div className="mt-5 rounded-xl border border-sidebar-border bg-sidebar-accent/15 p-2.5">
                <div className="flex items-center gap-1.5 px-1 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <Clock className="size-3" />
                  <span>Recently used</span>
                </div>
                <div className="space-y-0.5">
                  {recentTools.map((tool) => (
                    <Link
                      key={tool.path}
                      to={tool.path as never}
                      className="flex items-center justify-between rounded-md px-2 py-1.5 text-xs font-medium text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors"
                    >
                      <span className="truncate">{tool.label}</span>
                      <span className="text-[10px] text-muted-foreground/80 shrink-0">
                        {tool.group.split(" ")[0]}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-auto space-y-3 pt-2 border-t border-sidebar-border/60">
            <ThemeMenu />
            <p className="px-2 text-[11px] leading-relaxed text-muted-foreground">
              Educational guidance only. All data stays saved in your browser.
            </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="min-w-0 flex-1 pb-32 lg:pb-10">
          <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
            <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
              <div className="flex items-center gap-2 lg:hidden">
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Open navigation menu">
                      <Menu className="size-5" aria-hidden="true" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 overflow-y-auto bg-sidebar p-4">
                    <SheetTitle asChild className="px-2 pb-3 font-display text-lg">
                      <Link
                        to="/"
                        onClick={() => setMobileMenuOpen(false)}
                        className="inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
                        aria-label="Cornerstone, back to homepage"
                      >
                        <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                          <Rocket className="size-3.5" aria-hidden="true" />
                        </span>
                        <span>Cornerstone</span>
                      </Link>
                    </SheetTitle>

                    {/* Next step inside mobile menu */}
                    <div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                        Next step
                      </p>
                      <p className="text-xs font-semibold text-foreground mt-0.5">
                        {nextStep.name}
                      </p>
                      <Button
                        asChild
                        size="sm"
                        className="mt-2 w-full text-xs font-semibold"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Link to={nextStep.route as never}>
                          Continue: {nextStep.name} <ArrowRight className="size-3.5 ml-1" />
                        </Link>
                      </Button>
                    </div>

                    <GroupedNavLinks
                      openGroups={openGroups}
                      onToggleGroup={toggleGroup}
                      onNavigate={() => setMobileMenuOpen(false)}
                    />

                    {recentTools.length > 0 && (
                      <div className="mt-4 rounded-xl border border-sidebar-border bg-sidebar-accent/15 p-2.5">
                        <p className="px-1 pb-1 text-[11px] font-semibold uppercase text-muted-foreground">
                          Recently used
                        </p>
                        {recentTools.map((t) => (
                          <Link
                            key={t.path}
                            to={t.path as never}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block rounded px-2 py-1 text-xs text-sidebar-foreground hover:bg-sidebar-accent"
                          >
                            {t.label}
                          </Link>
                        ))}
                      </div>
                    )}

                    <ThemeMenu className="mt-6" />
                  </SheetContent>
                </Sheet>

                <Link
                  to="/"
                  className="font-display text-sm font-bold tracking-tight hover:opacity-90 transition-opacity"
                  aria-label="Cornerstone, back to homepage"
                >
                  Cornerstone
                </Link>
              </div>

              {/* Universal "Find a tool or answer" Search */}
              <div className="flex-1 max-w-md">
                <CommandSearch />
              </div>

              <div className="flex items-center gap-2.5">
                {/* Save-State Feedback Pill */}
                <div className="hidden xl:flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/35 px-2.5 py-1 text-[11px] text-muted-foreground">
                  <HardDrive className="size-3 text-success" />
                  <span>Data saved on this device</span>
                  {lastSavedAt && (
                    <span className="text-muted-foreground/80 font-mono">
                      · Saved{" "}
                      {lastSavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                </div>

                <ThemeToggle />
                {actions}
              </div>
            </div>
          </header>

          <main className="px-4 py-5 sm:px-6 lg:py-6">
            {/* Contextual Breadcrumbs and Return Path */}
            {!isDashboard && hierarchy && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link to="/dashboard">My plan</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <span className="text-muted-foreground">{hierarchy.group}</span>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="font-semibold text-foreground">
                        {hierarchy.label}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>

                <Link
                  to={nextStep.route as never}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 font-medium text-primary hover:bg-primary/20 transition-colors"
                >
                  <ArrowRight className="size-3.5 rotate-180" />
                  <span className="truncate">Back to my next step: {nextStep.name}</span>
                </Link>
              </div>
            )}

            {/* Page Header */}
            <div className="mb-6">
              <h1 className="font-display text-2xl font-bold sm:text-3xl text-foreground">
                {title}
              </h1>
              {description ? (
                <p className="mt-1 text-sm text-muted-foreground max-w-3xl">{description}</p>
              ) : null}
            </div>

            {children}
          </main>
        </div>
      </div>

      {/* Persistent "Continue: [task name]" Primary Navigation Bar on Mobile */}
      <div className="fixed inset-x-0 bottom-14 z-40 border-t border-primary/25 bg-background/95 p-2 backdrop-blur lg:hidden shadow-lg">
        <Button
          asChild
          size="sm"
          className="w-full justify-between text-xs font-semibold bg-primary text-primary-foreground shadow-sm"
        >
          <Link to={nextStep.route as never}>
            <div className="flex items-center gap-2 truncate">
              <span className="rounded bg-primary-foreground/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                Next step
              </span>
              <span className="truncate">Continue: {nextStep.name}</span>
            </div>
            <ArrowRight className="size-3.5 shrink-0 ml-1" />
          </Link>
        </Button>
      </div>

      {/* Redesigned Mobile Bottom Bar: Intent-based (Home, My plan, Build, Grow, Menu) */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-background/95 backdrop-blur lg:hidden h-14"
      >
        <Link
          to="/dashboard"
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors",
            isHomeActive ? "text-primary font-bold" : "text-muted-foreground",
          )}
        >
          <LayoutDashboard className="size-4.5" aria-hidden="true" />
          <span>Home</span>
        </Link>

        <Link
          to="/checklist"
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors",
            isPlanActive ? "text-primary font-bold" : "text-muted-foreground",
          )}
        >
          <ListChecks className="size-4.5" aria-hidden="true" />
          <span>My plan</span>
        </Link>

        <Link
          to="/domains"
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors",
            isBuildActive ? "text-primary font-bold" : "text-muted-foreground",
          )}
        >
          <Globe className="size-4.5" aria-hidden="true" />
          <span>Build</span>
        </Link>

        <Link
          to="/get-found"
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors",
            isGrowActive ? "text-primary font-bold" : "text-muted-foreground",
          )}
        >
          <TrendingUp className="size-4.5" aria-hidden="true" />
          <span>Grow</span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-muted-foreground hover:text-foreground"
        >
          <Menu className="size-4.5" aria-hidden="true" />
          <span>Menu</span>
        </button>
      </nav>
    </div>
  );
}
