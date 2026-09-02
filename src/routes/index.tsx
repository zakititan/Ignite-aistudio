import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Globe,
  Layout,
  Mail,
  ListChecks,
  ShieldCheck,
  Search,
  Wrench,
  Sparkles,
  Network,
  FileText,
  ArrowRight,
  Lightbulb,
  Rocket,
  TrendingUp,
  Check,
} from "lucide-react";
import { MarketingNavbar } from "@/components/MarketingNavbar";
import { SiteFooter } from "@/components/SiteFooter";
import { OwnershipWarningCard } from "@/components/Callouts";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Launch My Business Online — Get your website live, step by step" },
      {
        name: "description",
        content:
          "A personalized, plain-English plan to choose a domain, build a website, set up business email and launch online — no technical background needed.",
      },
      { property: "og:title", content: "Launch your business website with confidence" },
      {
        property: "og:description",
        content:
          "Tell us about your business and get a tailored launch roadmap: domain, website, business email, and getting found online.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

const JOURNEY = [
  { label: "Business idea", icon: Lightbulb },
  { label: "Domain", icon: Globe },
  { label: "Website", icon: Layout },
  { label: "Launch", icon: Rocket },
  { label: "Grow", icon: TrendingUp },
];

const TRUST = [
  "Built for first-time website owners",
  "Plain-English guidance",
  "Keep ownership of your domain and accounts",
  "Launch at your own pace",
];

const WORRIES = [
  "What kind of domain should I buy?",
  "Do I need hosting?",
  "Which website platform fits my business?",
  "How do I connect my domain?",
  "How do customers find me on Google?",
  "What do I need to maintain after launch?",
];

const STEPS = [
  {
    title: "Tell us about your business",
    body: "Seven short steps. No technical questions, and nothing you cannot answer about your own business.",
  },
  {
    title: "Receive your tailored launch roadmap",
    body: "A phased plan built around your goal, budget, timeline and comfort with technology.",
  },
  {
    title: "Complete one clear task at a time",
    body: "Every task explains why it matters, how long it takes, and what to watch out for.",
  },
];

const FEATURES = [
  { icon: Sparkles, title: "Personalized setup plan", body: "A roadmap shaped by your business type and goal, not a generic listicle." },
  { icon: Globe, title: "Domain name guidance", body: "Name ideas, a clarity score, and safety steps so the address stays yours." },
  { icon: Layout, title: "Website platform recommendations", body: "A recommended category of tool, with honest trade-offs — never a sales pitch." },
  { icon: Network, title: "DNS connection walkthroughs", body: "Plain-English instructions with warnings before anything risky." },
  { icon: FileText, title: "Website content prompts", body: "Fill-in-the-blank prompts for every page, so you never face a blank screen." },
  { icon: ListChecks, title: "Launch readiness checklist", body: "Required, recommended and optional tasks with progress you can see." },
  { icon: Search, title: "Local visibility and SEO basics", body: "Practical steps that help customers and search engines understand you." },
  { icon: Wrench, title: "Maintenance reminders", body: "Weekly, monthly, quarterly and yearly care in a simple calendar." },
];

const TESTIMONIALS = [
  {
    quote:
      "I had a bakery for six years and no website. The plan gave me five tasks a week and I stopped feeling behind.",
    name: "Priya N.",
    role: "Bakery owner",
  },
  {
    quote:
      "The ownership checklist alone was worth it. My old developer held my domain and I did not even know.",
    name: "Marcus D.",
    role: "Freelance designer",
  },
  {
    quote: "I finally understood what DNS actually does. Connected the domain myself in an afternoon.",
    name: "Tom R.",
    role: "Plumbing company owner",
  },
  {
    quote: "The homepage prompts helped me say what I do in one sentence. Enquiries went up straight away.",
    name: "Aisha K.",
    role: "Wellness coach",
  },
];

const FAQS = [
  {
    q: "What is the difference between a domain and hosting?",
    a: "Your domain is the web address people type, like yourbusiness.com. Hosting is the service that stores your pages and delivers them to visitors. They are usually bought separately and can come from different companies.",
  },
  {
    q: "Can I use a domain I already own?",
    a: "Yes. Tell us during onboarding and your plan will focus on confirming your access, checking the renewal date, and connecting the address safely to your new site.",
  },
  {
    q: "Can I create a website without coding?",
    a: "Absolutely. Most small businesses use an all-in-one builder or a managed content system. We help you pick the right category for how you work.",
  },
  {
    q: "How much should a simple business website cost?",
    a: "It varies a lot by country, platform and whether you hire help. Rather than quoting figures that go out of date, we show you exactly what to compare: plan price, renewal price, transaction fees, included email, storage and support.",
  },
  {
    q: "Do I need a business email address?",
    a: "It is not required, but an address on your own web address looks more professional and keeps business messages organized. Our guide walks through setup without breaking existing mail.",
  },
  {
    q: "Can I use this if I sell products online?",
    a: "Yes. Select an online shop in your website needs and your roadmap will include product pages, payments, shipping and returns policies, and testing the purchase flow.",
  },
  {
    q: "What if someone else built my website before?",
    a: "Your plan will start with a recovery and access checklist so you can confirm who owns the domain, hosting, website platform and email before anything changes.",
  },
  {
    q: "Will this help me appear on Google?",
    a: "Nobody can promise rankings. We cover the steps that make it easier for search engines and customers to understand your business: clear titles, real content, a mobile-friendly secure site, and consistent local details.",
  },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNavbar />

      <main>
        {/* Hero */}
        <section className="bg-hero-wash">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-card px-3 py-1.5 text-xs font-semibold text-primary">
                  <Sparkles className="size-3.5" aria-hidden="true" />
                  Free personalized launch plan
                </span>
                <h1 className="mt-5 text-4xl font-extrabold sm:text-5xl lg:text-6xl">
                  Launch your business website with{" "}
                  <span className="text-gradient-brand">confidence.</span>
                </h1>
                <p className="mt-5 max-w-xl text-lg text-muted-foreground">
                  Get a personalized, step-by-step plan to choose a domain, build a website, set up business
                  email and launch online — without the technical confusion.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg" className="text-base">
                    <Link to="/onboarding">
                      Create My Free Launch Plan
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="text-base">
                    <Link to="/how-it-works">See How It Works</Link>
                  </Button>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  You do not need to do everything today. One completed task is progress.
                </p>
              </div>

              <div className="surface-panel p-6 sm:p-8">
                <h2 className="font-display text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                  Your journey
                </h2>
                <ol className="mt-5 space-y-4">
                  {JOURNEY.map((j, i) => (
                    <li key={j.label} className="flex items-center gap-4">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                        <j.icon className="size-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-display font-semibold">{j.label}</p>
                        <div className="mt-1.5 h-1.5 rounded-full bg-muted">
                          <div
                            className="h-1.5 rounded-full bg-primary/70"
                            style={{ width: `${100 - i * 18}%` }}
                          />
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <ul className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {TRUST.map((t) => (
                <li
                  key={t}
                  className="flex items-start gap-2.5 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium"
                >
                  <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Problem */}
        <section className="border-t border-border bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
            <h2 className="max-w-2xl text-3xl font-bold sm:text-4xl">
              Starting a website should not require speaking tech.
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              These are the questions almost every first-time website owner asks. We answer each one inside
              your plan, at the moment it matters.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {WORRIES.map((w) => (
                <div key={w} className="surface-panel p-5">
                  <p className="font-display text-lg font-semibold">“{w}”</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Not sure? We’ll explain your options before you choose.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
            <h2 className="text-3xl font-bold sm:text-4xl">How it works</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <div key={s.title} className="surface-panel p-6">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 font-display text-xl font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-border bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
            <h2 className="text-3xl font-bold sm:text-4xl">Everything you need, in one calm place</h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((f) => (
                <div key={f.title} className="surface-panel p-5">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <f.icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-display text-base font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ownership */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                  <ShieldCheck className="size-6" aria-hidden="true" />
                </span>
                <h2 className="mt-5 text-3xl font-bold sm:text-4xl">
                  Your business should own its online home.
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Keep this account in your control. It is part of your business infrastructure — as real as
                  your lease or your phone number.
                </p>
              </div>
              <OwnershipWarningCard />
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="border-t border-border bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
            <h2 className="text-3xl font-bold sm:text-4xl">Built for businesses like yours</h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {TESTIMONIALS.map((t) => (
                <figure key={t.name} className="surface-panel p-6">
                  <blockquote className="text-base leading-relaxed">“{t.quote}”</blockquote>
                  <figcaption className="mt-4 text-sm font-semibold">
                    {t.name}
                    <span className="block font-normal text-muted-foreground">{t.role}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              Illustrative examples showing typical use. Not real customer endorsements.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-20">
            <h2 className="text-3xl font-bold sm:text-4xl">Common questions</h2>
            <Accordion type="single" collapsible className="mt-8">
              {FAQS.map((f) => (
                <AccordionItem key={f.q} value={f.q}>
                  <AccordionTrigger className="text-left font-display text-base font-semibold">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-border bg-hero-wash">
          <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
            <h2 className="text-3xl font-bold sm:text-4xl">Your business deserves a home online.</h2>
            <p className="mt-3 text-muted-foreground">
              Start free, work at your own pace, and keep every account in your own name.
            </p>
            <Button asChild size="lg" className="mt-8 text-base">
              <Link to="/onboarding">
                Build My Launch Plan
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />

      {/* Sticky mobile CTA */}
      <div className="sticky bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur sm:hidden">
        <Button asChild className="w-full" size="lg">
          <Link to="/onboarding">Create My Free Launch Plan</Link>
        </Button>
      </div>
    </div>
  );
}
