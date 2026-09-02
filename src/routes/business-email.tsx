import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Callout } from "@/components/Callouts";
import { GlossaryTooltip } from "@/components/GlossaryTooltip";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/business-email")({
  head: () => ({
    meta: [
      { title: "Business email setup — look professional at your own address" },
      {
        name: "description",
        content:
          "Why hello@yourbusiness.com matters, how to set it up, and how to avoid breaking your website while you do it.",
      },
      { property: "og:title", content: "Set up business email" },
      {
        property: "og:description",
        content: "Plain-English guidance on professional email addresses, naming, and mail deliverability.",
      },
    ],
  }),
  component: BusinessEmail,
});

const NAMING = [
  { name: "hello@", use: "Friendly general enquiries. A good default for most small businesses." },
  { name: "info@", use: "Traditional and neutral. Fine, but slightly impersonal." },
  { name: "yourname@", use: "Personal service businesses where customers deal with you directly." },
  { name: "bookings@", use: "When appointments are the main thing you handle." },
  { name: "orders@", use: "When you sell products and need order mail separated." },
  { name: "accounts@", use: "Invoices and suppliers, kept away from customer mail." },
];

const STEPS = [
  {
    title: "Decide where your email will live",
    body: "Some website builders and domain registrars include mailboxes. Dedicated email providers usually offer better reliability, storage and spam filtering. Check what you already pay for before buying another service.",
  },
  {
    title: "Choose your addresses",
    body: "Start with one shared address plus one personal address. More mailboxes usually cost more per month, and unread mailboxes damage trust more than having fewer.",
  },
  {
    title: "Add the mail settings to your domain",
    body: "Your provider will give you a set of records to add where your domain is managed. Take a screenshot of the existing settings first, then add exactly what they specify.",
  },
  {
    title: "Verify and send a test",
    body: "Send a message from your new address to a personal account, and reply to it. Check that it arrives in the inbox rather than spam.",
  },
  {
    title: "Move your old mail across",
    body: "If you were using a free personal address, forward it to the new one and set an auto-reply telling people about the change. Keep the old address running for a few months.",
  },
  {
    title: "Tell people your new address",
    body: "Update your website, business cards, invoices, social profiles and directory listings on the same day so nothing points at the old address.",
  },
];

const FAQ = [
  {
    q: "Can I just forward email instead of hosting a mailbox?",
    a: "You can, and it is cheap. The catch is replying: replies come from your old personal address unless the forwarding service supports sending as your domain. Customers notice.",
  },
  {
    q: "Why is my email going to spam?",
    a: "Usually because the sending permissions on your domain are incomplete. Ask your email provider for their SPF, DKIM and DMARC values and add exactly those.",
  },
  {
    q: "How many mailboxes do I need?",
    a: "One shared address is enough for most one-person businesses. Add more only when someone actually needs their own.",
  },
  {
    q: "What happens to email if I move my website?",
    a: "Nothing, provided you leave your mail records alone. Website records and mail records are separate settings that live in the same place.",
  },
  {
    q: "Do I need a paid mailbox to look professional?",
    a: "You need an address at your own domain. Whether it is a paid mailbox or an included one matters far less than not using a free personal address for business.",
  },
];

function BusinessEmail() {
  const { state } = useStore();
  const domain = state.business.ownedDomain || "yourbusiness.com";

  return (
    <AppShell
      title="Business email"
      description="An address at your own domain is the cheapest credibility you can buy."
    >
      <div className="space-y-6">
        <section className="surface-panel p-5 sm:p-6">
          <h2 className="font-display text-xl font-bold">Why this matters</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-destructive/30 bg-destructive-soft p-4">
              <Badge className="bg-destructive text-destructive-foreground">Looks amateur</Badge>
              <p className="mt-2 font-mono text-sm break-all">harborhearth1998@freemail.com</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Customers cannot tell this apart from a scam, and you do not control it.
              </p>
            </div>
            <div className="rounded-xl border border-success/30 bg-success-soft p-4">
              <Badge className="bg-success text-success-foreground">Looks established</Badge>
              <p className="mt-2 font-mono text-sm break-all">hello@{domain}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Matches your website, reinforces your name, and stays yours if staff change.
              </p>
            </div>
          </div>
        </section>

        <Callout tone="warning" title="Email records deserve care">
          Your <GlossaryTooltip term="MX record" /> tells the internet where to deliver your mail. Removing or
          mistyping it stops email arriving immediately, and senders may not be told it failed. Screenshot your
          settings before changing anything.
        </Callout>

        <section className="surface-panel p-5 sm:p-6">
          <h2 className="font-display text-xl font-bold">Choosing your address</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {NAMING.map((n) => (
              <li key={n.name} className="rounded-xl border border-border bg-muted/40 p-4">
                <p className="font-mono text-sm font-semibold">
                  {n.name}
                  {domain}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{n.use}</p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold">Setting it up, step by step</h2>
          <ol className="mt-4 space-y-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="surface-panel flex gap-4 p-5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft font-display text-sm font-bold text-primary">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-display font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="surface-panel p-5 sm:p-6">
          <h2 className="font-display text-xl font-bold">Reaching the inbox, not the spam folder</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Three settings decide whether your mail is trusted: <GlossaryTooltip term="SPF" /> lists who may
            send on your behalf, <GlossaryTooltip term="DKIM" /> signs your messages so they can be verified,
            and <GlossaryTooltip term="DMARC" /> tells other mail systems what to do when a check fails. Your
            email provider publishes the exact values — copy them without editing.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold">Common questions</h2>
          <Accordion type="single" collapsible className="surface-panel mt-4 px-5">
            {FAQ.map((f) => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger className="text-left font-display font-semibold">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
    </AppShell>
  );
}
