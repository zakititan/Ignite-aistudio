import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Printer } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { OwnershipWarningCard } from "@/components/Callouts";
import { SafetyWarningBanner } from "@/components/ContentPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import type { OwnershipRecord } from "@/lib/types";

export const Route = createFileRoute("/ownership-record")({
  head: () => ({
    meta: [
      { title: "Ownership record — know who controls what" },
      {
        name: "description",
        content:
          "Record which company holds your domain, DNS, website, email and analytics, and who can recover each account.",
      },
      { property: "og:title", content: "Your ownership record" },
      { property: "og:description", content: "One page that proves your business controls its own online accounts." },
    ],
  }),
  component: OwnershipRecordPage,
});

const FIELDS: { key: keyof OwnershipRecord; label: string; hint: string }[] = [
  { key: "domainRegistrar", label: "Domain registrar", hint: "Where the web address is registered and renewed." },
  { key: "renewalDate", label: "Domain renewal date", hint: "The date the domain must be renewed by." },
  { key: "dnsProvider", label: "DNS provider", hint: "Where the records that point your domain are edited." },
  { key: "websitePlatform", label: "Website platform or host", hint: "Where the site itself is built and published." },
  { key: "emailProvider", label: "Business email provider", hint: "Who runs your @yourbusiness mailboxes." },
  { key: "analyticsAccount", label: "Analytics account owner", hint: "Which account owns the visitor statistics." },
  { key: "paymentProcessor", label: "Payment processor", hint: "Who processes card or online payments." },
  { key: "socialOwners", label: "Social account owners", hint: "Who holds the login for each social profile." },
  { key: "recoveryOwner", label: "Recovery contact", hint: "The email or phone used to recover these accounts." },
];

function OwnershipRecordPage() {
  const { state, setOwnership } = useStore();
  const record = state.ownership;

  const download = () => {
    const lines = [
      "OWNERSHIP RECORD",
      "",
      ...FIELDS.map((f) => `${f.label}: ${record[f.key] || "(not recorded)"}`),
      "",
      `Notes: ${record.notes || "(none)"}`,
      "",
      "Keep this somewhere safe. Never store passwords in this file.",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ownership-record.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Ownership record downloaded.");
  };

  const filled = FIELDS.filter((f) => (record[f.key] || "").toString().trim().length > 0).length;

  return (
    <AppShell
      title="Ownership record"
      description="Who controls each part of your online presence."
      actions={
        <div className="hidden gap-2 sm:flex">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="size-4" aria-hidden="true" />
            Print
          </Button>
          <Button onClick={download}>
            <Download className="size-4" aria-hidden="true" />
            Download
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <OwnershipWarningCard />

        <SafetyWarningBanner title="Never write passwords here">
          This record names the companies and people involved — not credentials. Store passwords in a password
          manager, and keep two-step verification switched on for the registrar and recovery email.
        </SafetyWarningBanner>

        <section className="surface-panel space-y-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-xl font-bold">Your record</h2>
            <p className="text-sm text-muted-foreground">
              {filled} of {FIELDS.length} details recorded
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {FIELDS.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <Label htmlFor={`own-${f.key}`}>{f.label}</Label>
                <Input
                  id={`own-${f.key}`}
                  value={(record[f.key] as string) ?? ""}
                  onChange={(e) => setOwnership({ [f.key]: e.target.value } as Partial<OwnershipRecord>)}
                  aria-describedby={`own-${f.key}-hint`}
                />
                <p id={`own-${f.key}-hint`} className="text-xs text-muted-foreground">
                  {f.hint}
                </p>
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="own-notes">Notes</Label>
            <Textarea
              id="own-notes"
              rows={4}
              value={record.notes}
              onChange={(e) => setOwnership({ notes: e.target.value })}
              placeholder="Anything a future you, or an accountant, would need to know."
            />
          </div>
          <p className="text-xs text-muted-foreground">Changes save to this device as you type.</p>
        </section>

        <section className="surface-panel space-y-3 p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold">Why this matters</h2>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>• If a helper registers the domain in their own name, they control your address, not you.</li>
            <li>• A lapsed renewal can take your website and email offline the same day.</li>
            <li>• A recovery email you no longer control makes every account harder to rescue.</li>
          </ul>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button asChild variant="outline" size="sm">
              <Link to="/domains">Domain finder</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/maintenance">Maintenance reminders</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/hire-help">Working with paid help</Link>
            </Button>
          </div>
        </section>

        <div className="flex gap-2 sm:hidden">
          <Button className="flex-1" onClick={download}>
            <Download className="size-4" aria-hidden="true" />
            Download
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => window.print()}>
            <Printer className="size-4" aria-hidden="true" />
            Print
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
