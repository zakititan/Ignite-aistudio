import { Link } from "@tanstack/react-router";
import { ArrowRight, Globe, Mail, Blocks, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PresenceStatusArea } from "@/lib/types";
import { cn } from "@/lib/utils";

function connectionLabel(domain: PresenceStatusArea | undefined, target: PresenceStatusArea | undefined, dns: PresenceStatusArea | undefined, kind: "website" | "email"): { label: string; tone: "success" | "warning" | "muted" | "destructive" } {
  if (kind === "website") {
    if (!domain || domain.status === "not_started") return { label: "Domain not started", tone: "muted" };
    if (target?.status === "complete" && dns?.status === "complete") return { label: "Connected", tone: "success" };
    if (dns?.status === "needs_attention" || target?.status === "needs_attention") return { label: "Needs attention", tone: "destructive" };
    if (
      dns?.status === "in_progress" ||
      dns?.status === "ready_for_review" ||
      target?.status === "in_progress" ||
      target?.status === "ready_for_review" ||
      target?.status === "planned"
    )
      return { label: "In progress", tone: "warning" };
    if (dns?.status === "not_started" || target?.status === "not_started") return { label: "Not connected", tone: "muted" };
    return { label: dns?.statusLabel ?? "Planned", tone: "warning" };
  } else {
    // email
    if (!domain || domain.status === "not_started") return { label: "Domain not started", tone: "muted" };
    if (target?.status === "complete") return { label: target.statusLabel === "Complete" && target.summary.includes("not needed") ? "Not needed" : "Connected", tone: "success" };
    if (target?.status === "needs_attention") return { label: "Needs attention", tone: "destructive" };
    if (target?.status === "in_progress" || target?.status === "ready_for_review" || target?.status === "planned")
      return { label: target.statusLabel, tone: "warning" };
    return { label: target?.statusLabel ?? "Not connected", tone: "muted" };
  }
}

export function SetupMapPreview({ areas }: { areas: PresenceStatusArea[] }) {
  const domain = areas.find((a) => a.id === "domain");
  const website = areas.find((a) => a.id === "website");
  const email = areas.find((a) => a.id === "email");
  const dns = areas.find((a) => a.id === "dns");

  const websiteConn = connectionLabel(domain, website, dns, "website");
  const emailConn = connectionLabel(domain, email, dns, "email");

  const toneClasses: Record<string, string> = {
    success: "border-success/20 bg-success-soft text-success",
    warning: "border-warning/30 bg-warning-soft text-warning-foreground",
    muted: "border-border bg-muted text-muted-foreground",
    destructive: "border-destructive/20 bg-destructive-soft text-destructive",
  };

  return (
    <section aria-labelledby="setup-map-title" className="surface-panel p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="setup-map-title" className="font-display text-lg font-bold">
            Setup map preview
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            How your domain connects to your website and business email.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/online-setup">View setup map <ArrowRight className="size-4" aria-hidden="true" /></Link>
        </Button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {/* Domain -> Website */}
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <Globe className="size-4" aria-hidden="true" />
            </span>
            <span>Domain</span>
            <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <Blocks className="size-4" aria-hidden="true" />
            </span>
            <span>Website</span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={cn("text-xs", toneClasses[websiteConn.tone])}>
              <Network className="mr-1 size-3" aria-hidden="true" />
              {websiteConn.label}
            </Badge>
            <span className="text-xs text-muted-foreground">
              DNS: {dns?.statusLabel ?? "—"} · Website: {website?.statusLabel ?? "—"}
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">
            {dns?.summary ?? website?.summary ?? "Add your domain and website to see connection steps."}
          </p>
        </div>

        {/* Domain -> Business email */}
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <Globe className="size-4" aria-hidden="true" />
            </span>
            <span>Domain</span>
            <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <Mail className="size-4" aria-hidden="true" />
            </span>
            <span>Business email</span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={cn("text-xs", toneClasses[emailConn.tone])}>
              <Mail className="mr-1 size-3" aria-hidden="true" />
              {emailConn.label}
            </Badge>
            <span className="text-xs text-muted-foreground">Email: {email?.statusLabel ?? "—"}</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">
            {email?.summary ?? "Business email uses your domain but stays separate from website records."}
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Connecting your website changes domain settings. It should not require deleting your email settings.
      </p>
    </section>
  );
}
