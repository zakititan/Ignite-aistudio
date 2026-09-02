import { AlertTriangle, ShieldCheck, CheckCircle2, Mail, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DnsImpactPreview } from "@/lib/types";

interface Props {
  preview: DnsImpactPreview;
}

export function DnsImpactPreviewCard({ preview }: Props) {
  const level = preview.level;

  const tone =
    level === "high"
      ? "border-destructive/40 bg-destructive-soft"
      : level === "medium"
        ? "border-warning/40 bg-warning-soft"
        : "border-success/40 bg-success-soft";

  const Icon = level === "high" ? AlertTriangle : level === "medium" ? ShieldCheck : CheckCircle2;
  const iconClass =
    level === "high"
      ? "text-destructive"
      : level === "medium"
        ? "text-warning-foreground"
        : "text-success";

  return (
    <div
      className={cn("rounded-xl border p-5 sm:p-6", tone)}
      role="status"
      aria-label="DNS impact preview"
    >
      <div className="flex gap-3">
        <Icon className={cn("mt-0.5 size-6 shrink-0", iconClass)} aria-hidden="true" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-lg font-bold leading-tight">{preview.title}</h3>
            <Badge
              variant="outline"
              className={cn(
                "capitalize text-xs",
                level === "high"
                  ? "border-destructive/30 bg-destructive text-destructive-foreground"
                  : level === "medium"
                    ? "border-warning/30 bg-warning text-warning-foreground"
                    : "border-success/30 bg-success text-success-foreground",
              )}
            >
              DNS impact: {level} risk
            </Badge>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">{preview.summary}</p>

          <div className="flex flex-wrap gap-2 text-xs">
            <Badge
              variant="outline"
              className={cn(preview.emailAtRisk ? "border-warning/30 bg-warning-soft" : "bg-muted")}
            >
              <Mail className="mr-1 size-3" />
              {preview.emailAtRisk ? "Business email may be affected" : "No business email at risk"}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                preview.existingWebsiteAtRisk ? "border-warning/30 bg-warning-soft" : "bg-muted",
              )}
            >
              <Globe className="mr-1 size-3" />
              {preview.existingWebsiteAtRisk
                ? "Existing website at risk"
                : "No existing website at risk"}
            </Badge>
          </div>

          {preview.requiredBeforeChange.length > 0 ? (
            <div className="rounded-lg border border-border bg-card/60 p-3">
              <p className="text-xs font-semibold">Required before you change anything:</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs leading-relaxed text-muted-foreground">
                {preview.requiredBeforeChange.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {preview.recordsToPreserve.length > 0 ? (
            <div className="rounded-lg border border-border bg-card/60 p-3">
              <p className="text-xs font-semibold">Records to preserve (do not delete):</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs leading-relaxed text-muted-foreground">
                {preview.recordsToPreserve.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
              {preview.emailAtRisk ||
              preview.recordsToPreserve.some(
                (r) => r.toLowerCase().includes("mx") || r.toLowerCase().includes("spf"),
              ) ? (
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  These settings help your business receive email and prove messages come from you.
                  Do not delete mail-related records (MX, SPF, DKIM, DMARC) unless your email
                  provider specifically tells you to. Keep them separate from website records.
                </p>
              ) : null}
            </div>
          ) : null}

          <p className="text-xs text-muted-foreground">
            Manual check required — verify each item yourself before editing DNS. This app does not
            change DNS for you.
          </p>
        </div>
      </div>
    </div>
  );
}
