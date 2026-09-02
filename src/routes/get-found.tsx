import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Callout } from "@/components/Callouts";
import { GlossaryTooltip } from "@/components/GlossaryTooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/get-found")({
  head: () => ({
    meta: [
      { title: "Get found online — local listings, search basics and reviews" },
      {
        name: "description",
        content:
          "Realistic, plain-English steps to help customers find your business: local listings, page basics, reviews and honest timelines.",
      },
      { property: "og:title", content: "Help customers find your business" },
      {
        property: "og:description",
        content: "Local listings, consistent details, search basics and review habits — without hype or gimmicks.",
      },
    ],
  }),
  component: GetFound,
});

const FOUNDATIONS = [
  {
    title: "Claim your local business listing",
    body: "For most local businesses this brings more customers than anything else on this page. Add your address or service area, hours, photos and phone number, then keep them accurate.",
  },
  {
    title: "Keep your name, address and phone identical everywhere",
    body: "Search engines match your business across sites by these details. 'St' in one place and 'Street' in another creates doubt. Pick one format and use it on every listing.",
  },
  {
    title: "Give every page a clear title and description",
    body: "The title is the clickable line in search results. Say what the page is and where you are: 'Celebration cakes in Portland — Harbor & Hearth Bakery'.",
  },
  {
    title: "Write for humans, mentioning what you actually do",
    body: "Use the words customers use. If people search 'sourdough near me', the phrase 'artisanal fermented loaves' will not find them.",
  },
  {
    title: "Make sure search engines can read your site",
    body: "Confirm your pages are not blocked, submit a sitemap through your platform's settings, and check that important text is real text, not an image.",
  },
  {
    title: "Ask happy customers for reviews",
    body: "Ask in person, right after a good experience, and make it one tap. Reply to every review, especially the critical ones, calmly and briefly.",
  },
  {
    title: "List yourself where your customers already look",
    body: "Industry directories, local chambers, community groups and marketplaces. Two or three relevant listings beat twenty irrelevant ones.",
  },
  {
    title: "Add a way to measure what is working",
    body: "Basic analytics tells you which pages people read and where they came from, so you stop guessing.",
  },
];

const TIMELINE = [
  { when: "Week 1", what: "Your listing can appear quickly once verified. Verification itself may take days." },
  { when: "Weeks 2–6", what: "Search engines discover and index your pages. Your business name should find you." },
  { when: "Months 2–4", what: "You may start appearing for specific service and location phrases." },
  { when: "Months 4–12", what: "Steady visibility builds through reviews, links, and regular updates." },
];

const MYTHS = [
  {
    q: "Can I pay to be number one in search results?",
    a: "You can pay for advertising slots, clearly labelled as ads. Nobody can sell you a guaranteed top position in the ordinary results — anyone promising that is not being honest.",
  },
  {
    q: "Do I need to blog every week?",
    a: "No. For most local businesses, accurate listings, clear service pages and reviews matter more than volume of content.",
  },
  {
    q: "Should I stuff my pages with keywords?",
    a: "No. It reads badly to customers and search engines discount it. Write naturally and mention your service and location once or twice.",
  },
  {
    q: "Is social media a substitute for a website?",
    a: "It is a good addition, but you do not own it. A page can be restricted or removed without warning, and you cannot take your audience with you.",
  },
];

function GetFound() {
  const { state } = useStore();
  const local = state.business.customerModel !== "online";

  return (
    <AppShell
      title="Get found online"
      description="Honest steps that actually move the needle — and the timelines to expect."
    >
      <div className="space-y-6">
        <Callout tone="info" title="Being found takes weeks, not hours">
          A brand new website is not instantly visible in search results. The foundations below are what make
          the difference, and they compound over months.
        </Callout>

        {local ? (
          <Callout tone="success" title="Start with your local listing">
            Because you serve customers in a specific area, your free local business listing is the single
            highest-value task on this page. Do it before anything else here.
          </Callout>
        ) : null}

        <section>
          <h2 className="font-display text-xl font-bold">The foundations, in order</h2>
          <ol className="mt-4 space-y-3">
            {FOUNDATIONS.map((f, i) => (
              <li key={f.title} className="surface-panel flex gap-4 p-5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft font-display text-sm font-bold text-primary">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-display font-semibold">{f.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-sm text-muted-foreground">
            Useful terms: <GlossaryTooltip term="Sitemap" />, <GlossaryTooltip term="Search indexing" />,{" "}
            <GlossaryTooltip term="Analytics" />, <GlossaryTooltip term="Conversion" />.
          </p>
        </section>

        <section className="surface-panel p-5 sm:p-6">
          <h2 className="font-display text-xl font-bold">What to expect, and when</h2>
          <ul className="mt-4 space-y-3">
            {TIMELINE.map((t) => (
              <li key={t.when} className="flex flex-wrap items-start gap-3">
                <Badge variant="outline" className="shrink-0">
                  {t.when}
                </Badge>
                <span className="text-sm text-muted-foreground">{t.what}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold">Myths worth ignoring</h2>
          <Accordion type="single" collapsible className="surface-panel mt-4 px-5">
            {MYTHS.map((m) => (
              <AccordionItem key={m.q} value={m.q}>
                <AccordionTrigger className="text-left font-display font-semibold">{m.q}</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {m.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
    </AppShell>
  );
}
