import type { ReactNode } from "react";
import { AlertTriangle, Info, ShieldCheck, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "info" | "warning" | "success" | "danger";

const toneStyles: Record<Tone, { wrap: string; icon: typeof Info; iconClass: string }> = {
  info: { wrap: "bg-primary-soft/60 border-primary/25", icon: Info, iconClass: "text-primary" },
  warning: {
    wrap: "bg-warning-soft border-warning/40",
    icon: AlertTriangle,
    iconClass: "text-warning",
  },
  success: {
    wrap: "bg-success-soft border-success/35",
    icon: CheckCircle2,
    iconClass: "text-success",
  },
  danger: {
    wrap: "bg-destructive-soft border-destructive/35",
    icon: AlertTriangle,
    iconClass: "text-destructive",
  },
};

export function Callout({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: Tone;
  title: string;
  children?: ReactNode;
  className?: string;
}) {
  const t = toneStyles[tone];
  const Icon = t.icon;
  return (
    <div className={cn("rounded-xl border p-4", t.wrap, className)} role="note">
      <div className="flex gap-3">
        <Icon className={cn("mt-0.5 size-5 shrink-0", t.iconClass)} aria-hidden="true" />
        <div className="space-y-1">
          <p className="font-semibold">{title}</p>
          {children ? (
            <div className="text-sm leading-relaxed text-muted-foreground">{children}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function OwnershipWarningCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-warning/40 bg-warning-soft p-5", className)}>
      <div className="flex gap-3">
        <ShieldCheck className="mt-0.5 size-6 shrink-0 text-warning" aria-hidden="true" />
        <div className="space-y-2">
          <p className="font-display text-lg font-semibold">
            Important: keep ownership in your name
          </p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>Register your web address in an account you personally or jointly control.</li>
            <li>Use a business-controlled email address on every critical account.</li>
            <li>Turn on two-step sign-in and store recovery codes offline.</li>
            <li>
              Keep a written record of who can access domain, hosting, email, billing and analytics.
            </li>
            <li>Never let an agency, freelancer or former employee be the only owner.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
