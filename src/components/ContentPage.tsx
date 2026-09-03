import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, Clock, type LucideIcon } from "lucide-react";
import { MarketingNavbar } from "@/components/MarketingNavbar";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string | undefined;
  title: string;
  description?: string | undefined;
  children?: ReactNode;
}) {
  return (
    <section className="bg-hero-wash border-b border-border">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        {eyebrow ? (
          <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
        {children ? <div className="mt-6 flex flex-wrap gap-3">{children}</div> : null}
      </div>
    </section>
  );
}

export function ContentPageLayout({
  eyebrow,
  title,
  description,
  heroActions,
  children,
  aside,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  heroActions?: ReactNode;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingNavbar />
      <main className="flex-1">
        <PageHero eyebrow={eyebrow} title={title} description={description}>
          {heroActions}
        </PageHero>
        <div
          className={cn(
            "mx-auto w-full max-w-5xl gap-10 px-4 py-10 sm:px-6 sm:py-14",
            aside ? "lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]" : "",
          )}
        >
          {aside ? <div className="mb-8 lg:mb-0">{aside}</div> : null}
          <div className="min-w-0 space-y-8">{children}</div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

export function ContentSection({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="surface-panel scroll-mt-24 space-y-3 p-5 sm:p-6">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

export function InPageTableOfContents({ items }: { items: { id: string; label: string }[] }) {
  return (
    <nav aria-label="On this page" className="lg:sticky lg:top-24">
      <p className="px-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        On this page
      </p>
      <ul className="mt-2 space-y-0.5">
        {items.map((i) => (
          <li key={i.id}>
            <a
              href={`#${i.id}`}
              className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {i.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SafetyWarningBanner({
  title = "Before you change anything",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div role="note" className="rounded-xl border border-warning/40 bg-warning-soft p-4 sm:p-5">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
        <div className="space-y-1.5">
          <p className="font-semibold">{title}</p>
          <div className="text-sm leading-relaxed text-muted-foreground">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function ComingSoonCard({
  title,
  description,
  note,
  children,
}: {
  title: string;
  description: string;
  note?: string;
  children?: ReactNode;
}) {
  return (
    <div className="surface-panel space-y-3 border-dashed p-5 sm:p-6">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">
        <Clock className="size-3.5" aria-hidden="true" />
        Not connected yet
      </span>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      {children}
      {note ? <p className="text-xs text-muted-foreground">{note}</p> : null}
    </div>
  );
}

export function LinkCard({
  icon: Icon,
  title,
  description,
  to,
  cta = "Open",
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
  to: string;
  cta?: string;
}) {
  return (
    <div className="surface-panel flex flex-col gap-2 p-5">
      {Icon ? (
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      ) : null}
      <h3 className="font-display text-base font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      <Button asChild variant="link" className="mt-auto h-auto justify-start p-0">
        <Link to={to}>
          {cta}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}
