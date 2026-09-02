import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { BookOpen, LifeBuoy } from "lucide-react";
import { ContentPageLayout, ContentSection, LinkCard, SafetyWarningBanner } from "@/components/ContentPage";
import { Callout } from "@/components/Callouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact us — Launch My Business Online" },
      {
        name: "description",
        content: "Ask a product question, report a technical issue, share feedback or make a privacy request.",
      },
      { property: "og:title", content: "How can we help?" },
      { property: "og:description", content: "Reach the team behind your launch plan." },
    ],
  }),
  component: ContactPage,
});

const TOPICS = [
  "Product question",
  "Technical issue",
  "Feedback or feature idea",
  "Partnership",
  "Privacy request",
  "Accessibility feedback",
];

type Errors = Partial<Record<"name" | "email" | "topic" | "message", string>>;

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [business, setBusiness] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (!name.trim()) next.name = "Please tell us your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "Enter a valid email address.";
    if (!topic) next.topic = "Choose a topic so we can route your message.";
    if (message.trim().length < 10) next.message = "Please add a little more detail (at least 10 characters).";
    setErrors(next);
    if (Object.keys(next).length > 0) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setSent(true);
    toast.success("Message captured (demo mode).");
  };

  return (
    <ContentPageLayout
      eyebrow="Support"
      title="How can we help?"
      description="Tell us what you are trying to do and we will point you to the right guidance."
    >
      <SafetyWarningBanner title="Never send credentials">
        Do not include passwords, account-recovery codes, DNS control-panel logins or payment details in this form —
        or in any message to us. We will never ask for them.
      </SafetyWarningBanner>

      {sent ? (
        <Callout tone="success" title="Thanks — we have your message">
          Message sending is not connected to a backend yet, so this is a demo confirmation and nothing was
          transmitted. Keep a copy of what you wrote, and try the help centre in the meantime.
        </Callout>
      ) : (
        <section className="surface-panel space-y-4 p-5 sm:p-6">
          <h2 className="font-display text-xl font-bold">Send a message</h2>
          <form className="space-y-4" onSubmit={submit} noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="c-name">Your name</Label>
                <Input
                  id="c-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "c-name-error" : undefined}
                />
                {errors.name ? (
                  <p id="c-name-error" className="text-sm text-destructive">
                    {errors.name}
                  </p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-email">Email address</Label>
                <Input
                  id="c-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "c-email-error" : undefined}
                />
                {errors.email ? (
                  <p id="c-email-error" className="text-sm text-destructive">
                    {errors.email}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="c-topic">Topic</Label>
                <Select value={topic} onValueChange={setTopic}>
                  <SelectTrigger id="c-topic" aria-describedby={errors.topic ? "c-topic-error" : undefined}>
                    <SelectValue placeholder="Choose a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {TOPICS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.topic ? (
                  <p id="c-topic-error" className="text-sm text-destructive">
                    {errors.topic}
                  </p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-business">Business name (optional)</Label>
                <Input id="c-business" value={business} onChange={(e) => setBusiness(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="c-message">Message</Label>
              <Textarea
                id="c-message"
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? "c-message-error" : undefined}
              />
              {errors.message ? (
                <p id="c-message-error" className="text-sm text-destructive">
                  {errors.message}
                </p>
              ) : null}
            </div>

            <Button type="submit">Send message</Button>
          </form>
        </section>
      )}

      <ContentSection title="Faster answers">
        <p>Most questions are already answered in the guides below.</p>
      </ContentSection>

      <div className="grid gap-4 sm:grid-cols-2">
        <LinkCard
          icon={LifeBuoy}
          title="Troubleshooting"
          description="Website not loading, email stopped, HTTPS missing — step-by-step fixes."
          to="/troubleshooting"
          cta="Open troubleshooting"
        />
        <LinkCard
          icon={BookOpen}
          title="Learning library"
          description="Short, plain-English guides for every stage of getting online."
          to="/learn"
          cta="Browse the library"
        />
      </div>

      <p className="text-sm text-muted-foreground">
        Privacy requests can also be reviewed on the <Link to="/privacy" className="text-primary underline">privacy page</Link>.
      </p>
    </ContentPageLayout>
  );
}
