import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Callout } from "@/components/Callouts";

export interface ChecklistItem {
  id: string;
  label: string;
}

const ITEMS: ChecklistItem[] = [
  { id: "screenshot", label: "I have saved a screenshot of my current domain settings (manual)" },
  { id: "knows-email", label: "I know whether business email is active on this domain (manual)" },
  {
    id: "knows-website",
    label: "I know whether an old website is still live on this domain (manual)",
  },
  { id: "exact-records", label: "I have the exact records from my website provider (manual)" },
  { id: "not-delete-unknown", label: "I will not delete any record I do not recognise (manual)" },
  {
    id: "recorded-owner",
    label: "I have recorded who owns the domain and where DNS is managed (manual)",
  },
];

interface Props {
  onChange?: (checked: string[]) => void;
}

export function DnsPreChangeChecklist({ onChange }: Props) {
  const [checked, setChecked] = useState<string[]>([]);

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      onChange?.(next);
      return next;
    });
  };

  const criticalIds = ["screenshot", "knows-email", "exact-records"];
  const criticalComplete = criticalIds.every((id) => checked.includes(id));
  const allComplete = checked.length === ITEMS.length;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-display text-lg font-bold">
          Before you change anything — manual checklist
        </h3>
        <p className="text-xs text-muted-foreground">
          All items are manual checks — confirm each yourself. No automatic DNS changes are made by
          this app.
        </p>
      </div>

      <ul className="space-y-2.5">
        {ITEMS.map((item) => (
          <li key={item.id} className="flex items-start gap-3 rounded-lg border bg-card p-3">
            <Checkbox
              id={`dns-check-${item.id}`}
              checked={checked.includes(item.id)}
              onCheckedChange={() => toggle(item.id)}
              className="mt-0.5"
            />
            <Label htmlFor={`dns-check-${item.id}`} className="text-sm font-normal leading-relaxed">
              {item.label}
            </Label>
          </li>
        ))}
      </ul>

      {!criticalComplete ? (
        <Callout tone="warning" title="Not ready to edit DNS yet">
          Complete the critical items (screenshot, email status, and exact provider records) before
          you edit DNS. You can still continue reading the guidance below, but do not change
          settings yet.
        </Callout>
      ) : !allComplete ? (
        <Callout tone="info" title="Almost ready — finish the remaining checks">
          Critical safeguards are saved. Finish the remaining manual checks, then proceed step by
          step.
        </Callout>
      ) : (
        <Callout tone="success" title="Manual safeguards acknowledged — proceed with care">
          You have confirmed the manual safeguards. Continue to the records below and copy values
          exactly as your provider gave them.
        </Callout>
      )}

      <p className="text-xs text-muted-foreground">
        Guidance remains visible even when checks are incomplete — you can review all steps before
        making changes.
      </p>
    </div>
  );
}

// Export items for external verification if needed
export const DNS_PRE_CHANGE_ITEMS = ITEMS;
