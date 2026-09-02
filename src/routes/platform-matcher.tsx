import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Blocks, RefreshCcw } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Callout } from "@/components/Callouts";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/platform-matcher")({
  head: () => ({
    meta: [
      { title: "Platform matcher — find the right way to build your website" },
      {
        name: "description",
        content:
          "Answer eight plain-English questions and get a recommended category of website tool, with honest trade-offs and no provider endorsements.",
      },
      { property: "og:title", content: "Find the right way to build your website" },
      {
        property: "og:description",
        content: "A neutral recommendation category based on ecommerce, booking, budget and how often you update.",
      },
    ],
  }),
  component: PlatformMatcher,
});

interface Question {
  id: string;
  label: string;
  options: { value: string; label: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: "ecommerce",
    label: "Do you need to sell products or take payments on the site?",
    options: [
      { value: "no", label: "No" },
      { value: "few", label: "A few items or services" },
      { value: "yes", label: "Yes, a real shop" },
    ],
  },
  {
    id: "booking",
    label: "Do you need customers to book appointments themselves?",
    options: [
      { value: "no", label: "No" },
      { value: "maybe", label: "Would be nice" },
      { value: "yes", label: "Yes, essential" },
    ],
  },
  {
    id: "updates",
    label: "How often will you update the site?",
    options: [
      { value: "rare", label: "Rarely" },
      { value: "monthly", label: "Monthly" },
      { value: "weekly", label: "Weekly or more" },
    ],
  },
  {
    id: "speed",
    label: "Do you need something live quickly?",
    options: [
      { value: "yes", label: "Yes, days" },
      { value: "weeks", label: "A few weeks is fine" },
      { value: "no", label: "No rush" },
    ],
  },
  {
    id: "design",
    label: "How much design freedom do you want?",
    options: [
      { value: "template", label: "A good template is fine" },
      { value: "some", label: "Some control" },
      { value: "max", label: "Maximum flexibility" },
    ],
  },
  {
    id: "help",
    label: "Do you have someone technical helping you?",
    options: [
      { value: "no", label: "No" },
      { value: "sometimes", label: "Occasionally" },
      { value: "yes", label: "Yes, regularly" },
    ],
  },
  {
    id: "budget",
    label: "What monthly cost feels comfortable?",
    options: [
      { value: "low", label: "As low as possible" },
      { value: "mid", label: "Moderate" },
      { value: "high", label: "Whatever it takes" },
    ],
  },
  {
    id: "growth",
    label: "Do you expect advanced custom features later?",
    options: [
      { value: "no", label: "No" },
      { value: "maybe", label: "Possibly" },
      { value: "yes", label: "Yes, likely" },
    ],
  },
];

interface Recommendation {
  key: string;
  title: string;
  bestFor: string;
  advantages: string[];
  tradeoffs: string[];
  complexity: string;
  maintenance: string;
  questions: string[];
  features: string[];
  examples: string;
}

const RECOMMENDATIONS = {
  builder: {
    key: "builder",
    title: "Easy all-in-one website builder",
    bestFor: "Most first-time small business websites that need to look professional quickly.",
    advantages: [
      "Hosting, security and updates are handled for you",
      "Templates mean you never face a blank page",
      "Usually live within days, not weeks",
    ],
    tradeoffs: [
      "Design freedom is limited to what the template allows",
      "Moving to another platform later means rebuilding pages",
    ],
    complexity: "Low",
    maintenance: "Low",
    questions: [
      "What does the plan cost on renewal, not just the first year?",
      "Is business email included or separate?",
      "Can I export my content if I leave?",
    ],
    features: ["Contact form", "Photo gallery", "Mobile-friendly templates", "Basic SEO settings"],
    examples: "Example type: all-in-one website builders (examples only, not endorsements).",
  },
  ecommerce: {
    key: "ecommerce",
    title: "Ecommerce-first platform",
    bestFor: "Businesses whose main goal is selling products online with real inventory.",
    advantages: [
      "Payments, tax, shipping and inventory built in",
      "Purpose-built checkout that customers already trust",
      "Apps for reviews, discounts and abandoned carts",
    ],
    tradeoffs: [
      "Monthly cost plus transaction fees",
      "More settings to learn than a simple brochure site",
    ],
    complexity: "Medium",
    maintenance: "Medium",
    questions: [
      "What are the transaction fees on my expected volume?",
      "Which payment methods are supported in my country?",
      "How are shipping and tax rules configured?",
    ],
    features: ["Product catalogue", "Checkout", "Shipping and returns", "Order notifications"],
    examples: "Example type: hosted ecommerce platforms (examples only, not endorsements).",
  },
  cms: {
    key: "cms",
    title: "Flexible content system with managed hosting",
    bestFor: "Businesses publishing regularly or needing plugins for booking, membership or multiple languages.",
    advantages: [
      "Large plugin ecosystem for almost any need",
      "Full control over content structure and design",
      "Easier to hand over to a professional later",
    ],
    tradeoffs: [
      "Needs updates, backups and occasional troubleshooting",
      "Plugin choices can create security or speed problems",
    ],
    complexity: "Medium to high",
    maintenance: "High",
    questions: [
      "Who applies updates and takes backups?",
      "What happens if a plugin breaks the site?",
      "Is managed hosting included?",
    ],
    features: ["Blog", "Membership", "Multiple languages", "Custom page types"],
    examples: "Example type: managed content management systems (examples only, not endorsements).",
  },
  pro: {
    key: "pro",
    title: "Professional designer or developer build",
    bestFor: "Businesses with distinctive requirements, a real budget, and no time to build themselves.",
    advantages: [
      "Tailored design and functionality",
      "Someone else carries the technical work",
      "Can integrate with your existing systems",
    ],
    tradeoffs: [
      "Highest upfront cost and longest timeline",
      "You must document ownership of every account before starting",
    ],
    complexity: "High",
    maintenance: "Depends on your agreement",
    questions: [
      "Will the domain and hosting be registered in my name?",
      "What is included in ongoing support, and at what cost?",
      "Who owns the design files and content after launch?",
    ],
    features: ["Custom design", "Integrations", "Bespoke functionality"],
    examples: "Example type: independent designers, developers and small studios (examples only).",
  },
  onepage: {
    key: "onepage",
    title: "Simple one-page launch site",
    bestFor: "Getting something honest and useful online this week while you plan the full site.",
    advantages: [
      "Live in hours, often free or very cheap",
      "Everything a customer needs on one screen",
      "Easy to replace later without losing much",
    ],
    tradeoffs: ["Limited room for detail", "Not suitable for a real shop or large service list"],
    complexity: "Very low",
    maintenance: "Very low",
    questions: ["Can I connect my own web address?", "Can I add a contact form?"],
    features: ["Headline", "Services summary", "Contact details", "Map or service area"],
    examples: "Example type: one-page site builders and link pages (examples only).",
  },
} satisfies Record<string, Recommendation>;

const COMPARISON = [
  {
    option: "All-in-one builder",
    bestFor: "First website, service businesses",
    difficulty: "Easy",
    flexibility: "Medium",
    maintenance: "Low",
    ecommerce: "Basic",
    booking: "Add-on",
    ideal: "Owner who updates occasionally",
  },
  {
    option: "Ecommerce platform",
    bestFor: "Selling products online",
    difficulty: "Medium",
    flexibility: "Medium",
    maintenance: "Medium",
    ecommerce: "Strong",
    booking: "Add-on",
    ideal: "Retailer with inventory",
  },
  {
    option: "Managed content system",
    bestFor: "Publishing, memberships, plugins",
    difficulty: "Medium–hard",
    flexibility: "High",
    maintenance: "High",
    ecommerce: "Plugin-based",
    booking: "Plugin-based",
    ideal: "Owner with some help available",
  },
  {
    option: "Custom professional build",
    bestFor: "Distinctive or complex needs",
    difficulty: "Hard (for you: easy)",
    flexibility: "Very high",
    maintenance: "By agreement",
    ecommerce: "Custom",
    booking: "Custom",
    ideal: "Funded business with a clear brief",
  },
  {
    option: "One-page launch site",
    bestFor: "Being online this week",
    difficulty: "Very easy",
    flexibility: "Low",
    maintenance: "Very low",
    ecommerce: "None",
    booking: "Link only",
    ideal: "Brand new business",
  },
];

function recommend(a: Record<string, string | undefined>): Recommendation {
  if (a["ecommerce"] === "yes") return RECOMMENDATIONS.ecommerce;
  if (a["growth"] === "yes" && a["help"] !== "no") return RECOMMENDATIONS.cms;
  if (a["design"] === "max" && a["budget"] === "high") return RECOMMENDATIONS.pro;
  if (a["speed"] === "yes" && a["budget"] === "low" && a["updates"] === "rare")
    return RECOMMENDATIONS.onepage;
  if (a["updates"] === "weekly" && a["design"] !== "template") return RECOMMENDATIONS.cms;
  return RECOMMENDATIONS.builder;
}

function PlatformMatcher() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const answered = Object.keys(answers).length;
  const result = useMemo(() => (answered >= 4 ? recommend(answers) : null), [answers, answered]);

  return (
    <AppShell
      title="Find the right way to build your website"
      description="A recommended category — never a single brand you must buy."
    >
      <div className="space-y-8">
        <Callout tone="info" title="We do not sell or promote any provider">
          Answer at least four questions to see a recommendation. Compare current plan pricing, transaction
          fees, included email, storage, support and renewal terms before buying anything.
        </Callout>

        <section className="grid gap-4 md:grid-cols-2">
          {QUESTIONS.map((q) => (
            <fieldset key={q.id} className="surface-panel p-5">
              <legend className="font-display text-base font-semibold">{q.label}</legend>
              <RadioGroup
                className="mt-3 gap-2"
                value={answers[q.id] ?? ""}
                onValueChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))}
              >
                {q.options.map((o) => (
                  <Label
                    key={o.value}
                    htmlFor={`${q.id}-${o.value}`}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm font-medium transition-colors",
                      answers[q.id] === o.value
                        ? "border-primary bg-primary-soft"
                        : "border-border hover:bg-muted",
                    )}
                  >
                    <RadioGroupItem id={`${q.id}-${o.value}`} value={o.value} />
                    {o.label}
                  </Label>
                ))}
              </RadioGroup>
            </fieldset>
          ))}
        </section>

        <section aria-labelledby="result">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="result" className="font-display text-xl font-bold">
              Your recommendation
            </h2>
            <Button variant="outline" size="sm" onClick={() => setAnswers({})}>
              <RefreshCcw className="size-4" aria-hidden="true" />
              Start over
            </Button>
          </div>

          {result ? (
            <article className="surface-panel mt-4 p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Blocks className="size-5" aria-hidden="true" />
                </span>
                <h3 className="font-display text-2xl font-bold">{result.title}</h3>
                <Badge className="bg-success-soft text-success">Best fit for your answers</Badge>
              </div>
              <p className="mt-3 text-muted-foreground">{result.bestFor}</p>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-display text-sm font-semibold">Advantages</h4>
                  <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                    {result.advantages.map((a) => (
                      <li key={a}>• {a}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-display text-sm font-semibold">Trade-offs</h4>
                  <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                    {result.tradeoffs.map((a) => (
                      <li key={a}>• {a}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-display text-sm font-semibold">Questions to ask before choosing</h4>
                  <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                    {result.questions.map((a) => (
                      <li key={a}>• {a}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-display text-sm font-semibold">Feature checklist</h4>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {result.features.map((f) => (
                      <li key={f}>
                        <Badge variant="outline">{f}</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-muted/40 p-4">
                  <dt className="text-xs font-semibold text-muted-foreground uppercase">Setup complexity</dt>
                  <dd className="mt-1 font-medium">{result.complexity}</dd>
                </div>
                <div className="rounded-xl border border-border bg-muted/40 p-4">
                  <dt className="text-xs font-semibold text-muted-foreground uppercase">Ongoing maintenance</dt>
                  <dd className="mt-1 font-medium">{result.maintenance}</dd>
                </div>
              </dl>
              <p className="mt-4 text-xs text-muted-foreground">{result.examples}</p>
            </article>
          ) : (
            <p className="surface-panel mt-4 p-6 text-sm text-muted-foreground">
              Answer at least four questions above and your recommendation will appear here.
            </p>
          )}
        </section>

        <section aria-labelledby="compare">
          <h2 id="compare" className="font-display text-xl font-bold">
            Compare the options
          </h2>
          <div className="surface-panel mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Option</TableHead>
                  <TableHead>Best for</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Flexibility</TableHead>
                  <TableHead>Maintenance</TableHead>
                  <TableHead>Ecommerce</TableHead>
                  <TableHead>Booking</TableHead>
                  <TableHead>Ideal user</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {COMPARISON.map((row) => (
                  <TableRow key={row.option}>
                    <TableCell className="font-medium whitespace-nowrap">{row.option}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{row.bestFor}</TableCell>
                    <TableCell className="text-sm">{row.difficulty}</TableCell>
                    <TableCell className="text-sm">{row.flexibility}</TableCell>
                    <TableCell className="text-sm">{row.maintenance}</TableCell>
                    <TableCell className="text-sm">{row.ecommerce}</TableCell>
                    <TableCell className="text-sm">{row.booking}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{row.ideal}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Pricing is deliberately not listed because provider pricing changes frequently.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
