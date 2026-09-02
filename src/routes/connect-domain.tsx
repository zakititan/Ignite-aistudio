import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Callout } from "@/components/Callouts";
import { GlossaryTooltip } from "@/components/GlossaryTooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/connect-domain")({
  head: () => ({
    meta: [
      { title: "Connect your domain to your website — DNS guide" },
      {
        name: "description",
        content:
          "A careful, plain-English walkthrough for pointing your web address at your website without breaking your business email.",
      },
      { property: "og:title", content: "Connect your domain to your website" },
      {
        property: "og:description",
        content: "Guided DNS records, safeguards before you change anything, and troubleshooting in plain English.",
      },
    ],
  }),
  component: ConnectDomain,
});

interface RecordRow {
  id: string;
  type: string;
  host: string;
  value: string;
  purpose: string;
}

const BEFORE = [
  "Screenshot your existing domain settings",
  "Identify which services currently run your website and email",
  "Do not delete records you do not recognise",
  "Confirm the exact target values from your website provider",
  "Make one change at a time where possible",
  "Write down what you changed and when",
];

const TROUBLESHOOTING = [
  {
    q: "My website is not loading",
    a: "Updates to these settings can take time to appear — sometimes minutes, sometimes many hours. Confirm the values match exactly what your provider gave you, then wait before changing anything else.",
  },
  {
    q: "I see a parking page",
    a: "That usually means your address is still pointing at your registrar's default page. Check that the record for the main address was saved, not just the www version.",
  },
  {
    q: "My old website still appears",
    a: "Your browser or network may be remembering the old answer. Try a different device or mobile data before assuming the change failed.",
  },
  {
    q: "My business email stopped working",
    a: "Restore the mail-related records you had before, using your screenshot. Mail records are separate from website records and should usually be left alone.",
  },
  {
    q: "HTTPS is not active",
    a: "Most platforms issue the security certificate automatically once the address points at them correctly. It can take a while after the records are right. Check your platform's domain settings page for status.",
  },
  {
    q: "Verification is failing",
    a: "Verification usually uses a TXT record. Check for extra spaces, a missing quote, or a host field that your provider auto-completed with your domain name twice.",
  },
  {
    q: "I am unsure which record to change",
    a: "Stop and ask your website provider's support for the exact record type, host and value. Do not guess, and do not delete anything to 'clean up'.",
  },
];

function ConnectDomain() {
  const { state } = useStore();
  const [registrar, setRegistrar] = useState(state.business.registrarName);
  const [host, setHost] = useState("");
  const [usesEmail, setUsesEmail] = useState<string>("");
  const [migrating, setMigrating] = useState<string>("");
  const [added, setAdded] = useState<string[]>([]);
  const [checkedBefore, setCheckedBefore] = useState<string[]>([]);

  const domain = state.business.ownedDomain || "yourbusiness.com";

  const records: RecordRow[] = useMemo(() => {
    const rows: RecordRow[] = [
      {
        id: "a",
        type: "A",
        host: "@",
        value: "203.0.113.10 (use the address your provider gives you)",
        purpose: "Sends visitors typing your bare web address to your website.",
      },
      {
        id: "cname",
        type: "CNAME",
        host: "www",
        value: "your-site.example-platform.com",
        purpose: "Sends visitors typing www to the same website.",
      },
      {
        id: "txt",
        type: "TXT",
        host: "@",
        value: "platform-verification=example-token",
        purpose: "Proves to your website platform that you control this address.",
      },
    ];
    if (usesEmail === "yes") {
      rows.push({
        id: "mx",
        type: "MX",
        host: "@",
        value: "Leave your existing mail values exactly as they are",
        purpose: "Delivers your business email. Do not remove unless your email provider tells you to.",
      });
      rows.push({
        id: "spf",
        type: "TXT",
        host: "@",
        value: "v=spf1 include:your-email-provider.example ~all",
        purpose: "Lists who may send email using your address, which helps mail reach inboxes.",
      });
    }
    if (migrating === "moving") {
      rows.push({
        id: "redirect",
        type: "Redirect",
        host: "old pages",
        value: "Map each old page to its new page",
        purpose: "Keeps existing links and search results working after the move.",
      });
    }
    return rows;
  }, [usesEmail, migrating]);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to your clipboard.");
    } catch {
      toast.error("We could not copy that just now. Select the text and copy it manually.");
    }
  };

  const canShowRecords = usesEmail !== "";

  return (
    <AppShell
      title="Connect your domain to your website"
      description="Your domain is registered. Now tell it where your website lives."
    >
      <div className="space-y-8">
        <Callout tone="warning" title="Read this before you change anything">
          Changes to these settings can affect your website <em>and</em> your business email. If your domain
          already receives email, do not remove mail records unless your email provider specifically tells you
          to.
        </Callout>

        <section className="surface-panel space-y-6 p-5 sm:p-6">
          <h2 className="font-display text-xl font-bold">A few quick questions</h2>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="reg">Where is your domain registered?</Label>
              <Input
                id="reg"
                value={registrar}
                onChange={(e) => setRegistrar(e.target.value)}
                placeholder="The company you pay each year"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hostp">Where is your website being built or hosted?</Label>
              <Input
                id="hostp"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="Your website builder or hosting provider"
              />
            </div>
          </div>

          <fieldset>
            <legend className="text-base font-medium">
              Do you use business email on this address today?
            </legend>
            <RadioGroup value={usesEmail} onValueChange={setUsesEmail} className="mt-3 gap-2 sm:grid-cols-3">
              {[
                { v: "yes", l: "Yes" },
                { v: "no", l: "No" },
                { v: "unsure", l: "Not sure" },
              ].map((o) => (
                <Label
                  key={o.v}
                  htmlFor={`email-${o.v}`}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm font-medium",
                    usesEmail === o.v ? "border-primary bg-primary-soft" : "border-border hover:bg-muted",
                  )}
                >
                  <RadioGroupItem id={`email-${o.v}`} value={o.v} />
                  {o.l}
                </Label>
              ))}
            </RadioGroup>
          </fieldset>

          <fieldset>
            <legend className="text-base font-medium">Are you moving an existing website or starting fresh?</legend>
            <RadioGroup value={migrating} onValueChange={setMigrating} className="mt-3 gap-2 sm:grid-cols-2">
              {[
                { v: "fresh", l: "Starting fresh" },
                { v: "moving", l: "Moving an existing website" },
              ].map((o) => (
                <Label
                  key={o.v}
                  htmlFor={`mig-${o.v}`}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm font-medium",
                    migrating === o.v ? "border-primary bg-primary-soft" : "border-border hover:bg-muted",
                  )}
                >
                  <RadioGroupItem id={`mig-${o.v}`} value={o.v} />
                  {o.l}
                </Label>
              ))}
            </RadioGroup>
          </fieldset>
        </section>

        {usesEmail === "yes" ? (
          <Callout tone="warning" title="Protect your email">
            Website settings and email settings live in the same place but are not interchangeable. Keep your
            mail-related records unless you are intentionally changing email providers.
          </Callout>
        ) : usesEmail === "unsure" ? (
          <Callout tone="danger" title="Let's check your email first">
            We need to know whether you currently use email on this domain before showing instructions. Send a
            test message to an address on your domain, or ask whoever set it up.
          </Callout>
        ) : null}

        <section className="surface-panel p-5 sm:p-6">
          <h2 className="font-display text-xl font-bold">Before you change anything</h2>
          <ul className="mt-4 space-y-2.5">
            {BEFORE.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <Checkbox
                  id={`before-${b}`}
                  checked={checkedBefore.includes(b)}
                  onCheckedChange={() =>
                    setCheckedBefore((c) => (c.includes(b) ? c.filter((x) => x !== b) : [...c, b]))
                  }
                  className="mt-0.5"
                />
                <Label htmlFor={`before-${b}`} className="text-sm font-normal">
                  {b}
                </Label>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            Before changing these settings, take a screenshot of what is already there.
          </p>
        </section>

        <section aria-labelledby="records">
          <h2 id="records" className="font-display text-xl font-bold">
            Your settings for {domain}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            These are generic examples. Always use the exact values your website provider gives you. Learn what{" "}
            <GlossaryTooltip term="A record" /> and <GlossaryTooltip term="CNAME" /> mean.
          </p>

          {canShowRecords ? (
            <div className="surface-panel mt-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Host / Name</TableHead>
                    <TableHead>Value / Target</TableHead>
                    <TableHead className="hidden lg:table-cell">Purpose</TableHead>
                    <TableHead>Done</TableHead>
                    <TableHead className="text-right">Copy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((r) => (
                    <TableRow key={r.id} className={cn(added.includes(r.id) && "bg-success-soft/50")}>
                      <TableCell className="font-medium">{r.type}</TableCell>
                      <TableCell className="font-mono text-sm">{r.host}</TableCell>
                      <TableCell className="max-w-xs font-mono text-sm break-words">{r.value}</TableCell>
                      <TableCell className="hidden max-w-xs text-sm text-muted-foreground lg:table-cell">
                        {r.purpose}
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={added.includes(r.id)}
                          onCheckedChange={() =>
                            setAdded((a) => (a.includes(r.id) ? a.filter((x) => x !== r.id) : [...a, r.id]))
                          }
                          aria-label={`I added the ${r.type} record`}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => copy(r.value)}>
                          <Copy className="size-4" aria-hidden="true" />
                          <span className="sr-only">Copy {r.type} value</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="surface-panel mt-4 p-6 text-sm text-muted-foreground">
              Answer the email question above and your record list will appear here.
            </p>
          )}

          <Accordion type="single" collapsible className="surface-panel mt-4 px-5">
            <AccordionItem value="where">
              <AccordionTrigger className="font-display font-semibold">
                Where do I add these?
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                Sign in to the company where your web address is registered
                {registrar ? ` (${registrar})` : ""}. Look for “DNS”, “Domain settings”, “Manage DNS” or “Advanced
                settings”. You will see a list of existing entries and a button to add a new one. Add each row
                above exactly as written, then save.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="wrong">
              <AccordionTrigger className="font-display font-semibold">What could go wrong?</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                The most common problems are typing the value with a trailing space, entering the host as your
                full domain when the provider only wants “@”, and deleting an existing mail record. Your
                screenshot lets you undo any of these in a minute.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        <section aria-labelledby="trouble">
          <h2 id="trouble" className="font-display text-xl font-bold">
            Troubleshooting
          </h2>
          <Accordion type="single" collapsible className="surface-panel mt-4 px-5">
            {TROUBLESHOOTING.map((t) => (
              <AccordionItem key={t.q} value={t.q}>
                <AccordionTrigger className="text-left font-display font-semibold">{t.q}</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {t.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
    </AppShell>
  );
}
