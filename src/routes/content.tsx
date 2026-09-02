import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ClipboardCheck, Copy, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Callout } from "@/components/Callouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/content")({
  head: () => ({
    meta: [
      { title: "Website content builder — write your pages without a blank page" },
      {
        name: "description",
        content:
          "Guided prompts for your home, about, services and contact pages, with examples and a plain-English writing checklist.",
      },
      { property: "og:title", content: "Write your website pages" },
      {
        property: "og:description",
        content:
          "Prompts, examples and starter drafts for the five pages most small businesses need.",
      },
    ],
  }),
  component: ContentBuilder,
});

interface Field {
  id: string;
  label: string;
  help: string;
  example: string;
  rows?: number;
}

interface Page {
  id: string;
  name: string;
  purpose: string;
  fields: Field[];
}

const PAGES: Page[] = [
  {
    id: "home",
    name: "Home",
    purpose: "Tell a first-time visitor what you do, who it is for, and what to do next.",
    fields: [
      {
        id: "headline",
        label: "One sentence: what do you do and for whom?",
        help: "Plain language beats clever wording. A stranger should understand it in three seconds.",
        example:
          "Small-batch sourdough and pastries, baked fresh every morning in Portland's Pearl District.",
      },
      {
        id: "audience",
        label: "Who is this for?",
        help: "Naming your customer helps the right people feel recognised.",
        example:
          "Neighbours, nearby offices ordering breakfast, and couples planning wedding cakes.",
        rows: 3,
      },
      {
        id: "proof",
        label: "Why should someone trust you?",
        help: "Years in business, qualifications, reviews, or a simple promise you always keep.",
        example:
          "Twelve years baking locally, 400+ five-star reviews, and everything sold on the day it is made.",
        rows: 3,
      },
      {
        id: "cta",
        label: "What should visitors do next?",
        help: "Pick one main action: call, book, order, or visit.",
        example: "Order a cake online, or drop in before 2pm.",
      },
    ],
  },
  {
    id: "about",
    name: "About",
    purpose: "Build trust with the story behind the business.",
    fields: [
      {
        id: "story",
        label: "How did the business start?",
        help: "Two or three honest sentences. No corporate language needed.",
        example:
          "Maya started baking for the farmers market in 2013 and opened the Harbor & Hearth shop in 2016.",
        rows: 4,
      },
      {
        id: "values",
        label: "What matters to you in how you work?",
        help: "Concrete beats abstract: name the actual practice, not the value word.",
        example:
          "We mill our own flour weekly and donate unsold loaves to the community kitchen each evening.",
        rows: 3,
      },
      {
        id: "team",
        label: "Who will the customer meet?",
        help: "A first name and a role is plenty.",
        example: "Maya (baker and owner) and Theo, who runs the counter most mornings.",
        rows: 2,
      },
    ],
  },
  {
    id: "services",
    name: "Services or products",
    purpose: "Help visitors work out whether you offer what they need.",
    fields: [
      {
        id: "list",
        label: "List what you offer, one per line",
        help: "Use the words customers use, not internal names.",
        example:
          "Daily bread\nCelebration cakes\nWholesale to cafés\nMorning pastry boxes for offices",
        rows: 5,
      },
      {
        id: "detail",
        label: "For each, what does the customer get?",
        help: "One clear sentence each. Mention lead time if it matters.",
        example: "Celebration cakes: designed with you, from £60, three days' notice.",
        rows: 5,
      },
      {
        id: "pricing",
        label: "How will you talk about price?",
        help: "You do not need a full price list, but silence about price loses enquiries.",
        example: "Loaves from £4.50. Cakes from £60. Wholesale pricing on request.",
        rows: 2,
      },
    ],
  },
  {
    id: "contact",
    name: "Contact",
    purpose: "Make it effortless to reach you and know when you will reply.",
    fields: [
      {
        id: "methods",
        label: "How can people reach you?",
        help: "Phone, email, form, or a messaging app. Two options is usually enough.",
        example: "Call 555 0134, or email hello@harborandhearth.com.",
        rows: 2,
      },
      {
        id: "hours",
        label: "When are you open or available?",
        help: "Include the days you are closed. It prevents wasted trips.",
        example: "Tue–Sat 7am–3pm. Closed Sunday and Monday.",
        rows: 2,
      },
      {
        id: "response",
        label: "How quickly will you reply?",
        help: "Setting an expectation is more reassuring than promising instant answers.",
        example: "We reply to emails within one working day.",
      },
      {
        id: "location",
        label: "Where are you, or where do you serve?",
        help: "An address, or the areas you cover.",
        example: "412 Harbor Street, Portland — plus delivery across the inner east side.",
        rows: 2,
      },
    ],
  },
  {
    id: "faq",
    name: "FAQ",
    purpose: "Answer the questions you already get asked every week.",
    fields: [
      {
        id: "questions",
        label: "What do customers ask you most often?",
        help: "Write the question exactly as customers say it.",
        example: "Do you do gluten-free?\nCan I order same day?\nDo you deliver?",
        rows: 5,
      },
      {
        id: "answers",
        label: "Your answers, in order",
        help: "Short, direct, and honest — including when the answer is no.",
        example:
          "We bake gluten-free on Thursdays only.\nSame-day orders depend on what's left, so call first.\nWe deliver within three miles for £5.",
        rows: 5,
      },
    ],
  },
];

const WRITING_CHECKLIST = [
  "Would a stranger understand this in five seconds?",
  "Is it about the customer, not just about you?",
  "Is there one clear next step on every page?",
  "Have you removed words you would never say out loud?",
  "Are your contact details correct and easy to find?",
  "Have you checked spelling and read it aloud once?",
];

function ContentBuilder() {
  const { state, saveDraft } = useStore();
  const [values, setValues] = useState<Record<string, Record<string, string>>>(() => {
    const initial: Record<string, Record<string, string>> = {};
    for (const p of PAGES) initial[p.id] = state.drafts[p.id]?.fields ?? {};
    return initial;
  });

  const business = state.business.businessName || "your business";

  const setField = (page: string, field: string, value: string) =>
    setValues((v) => ({ ...v, [page]: { ...v[page], [field]: value.slice(0, 2000) } }));

  const copyPage = async (page: Page) => {
    const text = page.fields
      .map((f) => `${f.label}\n${values[page.id]?.[f.id] ?? ""}`)
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Draft copied. Paste it into your website builder.");
    } catch {
      toast.error("We could not copy that. Select the text and copy manually.");
    }
  };

  return (
    <AppShell
      title="Website content builder"
      description="The blank page is the hardest part. These prompts get you past it."
    >
      <div className="space-y-6">
        <Callout tone="info" title="Your words, in your voice">
          Answer the prompts in ordinary language, as if a customer asked you in person. Everything
          saves to this device automatically.
        </Callout>
        <div className="surface-panel flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Your business profile pre-fills names, hours and contact here. Keep it current for
            accurate drafts.
          </p>
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <Link to="/business-profile">Edit business profile →</Link>
          </Button>
        </div>

        <Tabs defaultValue="home">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
            {PAGES.map((p) => (
              <TabsTrigger key={p.id} value={p.id}>
                {p.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {PAGES.map((page) => (
            <TabsContent key={page.id} value={page.id} className="space-y-4">
              <div className="surface-panel p-5">
                <h2 className="font-display text-xl font-bold">{page.name} page</h2>
                <p className="mt-1 text-sm text-muted-foreground">{page.purpose}</p>
              </div>

              {page.fields.map((f) => (
                <div key={f.id} className="surface-panel space-y-2 p-5">
                  <Label
                    htmlFor={`${page.id}-${f.id}`}
                    className="font-display text-base font-semibold"
                  >
                    {f.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">{f.help}</p>
                  {f.rows === undefined ? (
                    <Input
                      id={`${page.id}-${f.id}`}
                      value={values[page.id]?.[f.id] ?? ""}
                      onChange={(e) => setField(page.id, f.id, e.target.value)}
                      maxLength={2000}
                    />
                  ) : (
                    <Textarea
                      id={`${page.id}-${f.id}`}
                      rows={f.rows}
                      value={values[page.id]?.[f.id] ?? ""}
                      onChange={(e) => setField(page.id, f.id, e.target.value)}
                      maxLength={2000}
                    />
                  )}
                  <details className="rounded-lg border border-border bg-muted/40 p-3">
                    <summary className="cursor-pointer text-sm font-medium">
                      Show an example for a bakery
                    </summary>
                    <p className="mt-2 text-sm whitespace-pre-line text-muted-foreground">
                      {f.example}
                    </p>
                  </details>
                </div>
              ))}

              <div className="surface-panel flex flex-wrap items-center gap-3 p-5">
                <Button
                  onClick={() => {
                    saveDraft(page.id, values[page.id] ?? {});
                    toast.success(`${page.name} draft saved.`);
                  }}
                >
                  Save this page
                </Button>
                <Button variant="outline" onClick={() => copyPage(page)}>
                  <Copy className="size-4" aria-hidden="true" />
                  Copy draft
                </Button>
                <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="size-4 text-accent" aria-hidden="true" />
                  Writing help for {business}
                  <Badge variant="outline">Coming soon</Badge>
                </span>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <section className="surface-panel p-5">
          <h2 className="font-display text-xl font-bold">Before you publish</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {WRITING_CHECKLIST.map((c) => (
              <li key={c}>• {c}</li>
            ))}
          </ul>
          <div className="mt-5 flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary-soft/30 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-sm font-semibold flex items-center gap-2">
                <ClipboardCheck className="size-4 text-primary" aria-hidden="true" /> Next: test
                with a real phone
              </p>
              <p className="text-sm text-muted-foreground">
                After writing, try your main customer action end to end — form, booking, purchase or
                call — as a stranger would.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" className="shrink-0">
                <Link to="/customer-journey">Open journey tester →</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="shrink-0">
                <Link to="/hire-help">Hire help handoff →</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
