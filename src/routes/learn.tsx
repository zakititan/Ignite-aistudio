import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookOpen, Check, Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { GlossaryTooltip } from "@/components/GlossaryTooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ARTICLES, GLOSSARY, LIBRARY_CATEGORIES, VISUAL_RESOURCES } from "@/lib/library";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { VisualResourceCard } from "@/components/VisualResourceCard";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learning library — the jargon explained in plain English" },
      {
        name: "description",
        content:
          "Short explainers on domains, hosting, DNS, email, SEO and security: what it means, when to care, and the mistake to avoid.",
      },
      { property: "og:title", content: "Learning library" },
      {
        property: "og:description",
        content: "Every technical term you will meet, explained the way a friend would explain it.",
      },
    ],
  }),
  component: Learn,
});

function Learn() {
  const { state, toggleArticle } = useStore();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [showAllVisualResources, setShowAllVisualResources] = useState(false);

  const q = query.trim().toLowerCase();
  const articles = useMemo(
    () =>
      ARTICLES.filter(
        (a) =>
          (category === "All" || a.category === category) &&
          (!q || a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q)),
      ),
    [q, category],
  );

  const glossaryEntries = useMemo(
    () =>
      Object.entries(GLOSSARY).filter(
        ([term, def]) => !q || term.toLowerCase().includes(q) || def.toLowerCase().includes(q),
      ),
    [q],
  );

  const glossaryMidpoint = Math.ceil(glossaryEntries.length / 2);
  const glossaryCol1 = glossaryEntries.slice(0, glossaryMidpoint);
  const glossaryCol2 = glossaryEntries.slice(glossaryMidpoint);

  const visualResources = useMemo(
    () =>
      VISUAL_RESOURCES.filter((resource) => {
        const matchesCategory =
          category === "All" ||
          category
            .split(" & ")
            .some((part) =>
              resource.topics.some((topic) => topic.toLowerCase().includes(part.toLowerCase())),
            );
        const searchable = [
          resource.title,
          resource.description,
          resource.analogy,
          ...resource.topics,
        ]
          .join(" ")
          .toLowerCase();
        return matchesCategory && (!q || searchable.includes(q));
      }),
    [q, category],
  );
  const visibleVisualResources = showAllVisualResources
    ? visualResources
    : visualResources.slice(0, 6);

  return (
    <AppShell
      title="Learning library"
      description="Understand the jargon once, and it stops being scary."
    >
      <div className="space-y-6">
        <section className="surface-panel p-5 sm:p-6" aria-labelledby="start-here">
          <div>
            <h2 id="start-here" className="font-display text-xl font-bold">
              Start here if this is all new
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Follow the same order you would use to open a real shop: choose the address, put up
              the website, then set up a way for customers to reach you.
            </p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { step: "1", label: "Choose your address", to: "/domains" as const },
              { step: "2", label: "Connect your website", to: "/connect-domain" as const },
              { step: "3", label: "Set up business email", to: "/business-email" as const },
            ].map((item) => (
              <Link
                key={item.step}
                to={item.to}
                className="rounded-lg border p-3 transition-colors hover:bg-muted"
              >
                <span className="text-xs font-bold text-primary">STEP {item.step}</span>
                <span className="mt-1 block font-display font-semibold">{item.label}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="surface-panel space-y-4 p-5 sm:p-6" aria-labelledby="watch-and-see">
          <div>
            <h2 id="watch-and-see" className="font-display text-xl font-bold">
              Watch or skim instead
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Prefer pictures to paragraphs? Start with a few trusted videos and guides; you can
              open the full collection whenever you need it. Videos play right here.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {visibleVisualResources.map((resource) => (
              <VisualResourceCard key={resource.title} resource={resource} />
            ))}
          </div>
          {visualResources.length > 6 ? (
            <Button
              variant="outline"
              onClick={() => setShowAllVisualResources((visible) => !visible)}
            >
              {showAllVisualResources
                ? "Show fewer resources"
                : `Show all ${visualResources.length} resources`}
            </Button>
          ) : null}
          {!visualResources.length ? (
            <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              No visual resources match this search yet. Try a simpler word or choose “All”.
            </p>
          ) : null}
        </section>

        <section className="surface-panel space-y-4 p-5">
          <div className="space-y-1.5">
            <Label htmlFor="lib-search">Search the library</Label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="lib-search"
                className="pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value.slice(0, 100))}
                placeholder="Try 'DNS', 'hosting' or 'reviews'"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {["All", ...LIBRARY_CATEGORIES].map((c) => (
              <Button
                key={c}
                size="sm"
                variant={category === c ? "default" : "outline"}
                onClick={() => setCategory(c)}
              >
                {c}
              </Button>
            ))}
          </div>
        </section>

        <section aria-labelledby="articles">
          <h2 id="articles" className="font-display text-xl font-bold">
            Explainers
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({articles.length})
            </span>
          </h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {articles.map((a) => {
              const read = state.completedArticles.includes(a.slug);
              return (
                <article
                  key={a.slug}
                  className={cn(
                    "surface-panel p-5",
                    read && "border-success/35 bg-success-soft/30",
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{a.category}</Badge>
                    <span className="text-xs text-muted-foreground">{a.minutes} min read</span>
                    {read ? <Badge className="bg-success-soft text-success">Read</Badge> : null}
                  </div>
                  <h3 className="mt-2 font-display text-lg font-bold">{a.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{a.summary}</p>

                  <dl className="mt-4 space-y-3 text-sm">
                    <div>
                      <dt className="font-semibold">What it means</dt>
                      <dd className="text-muted-foreground">{a.meaning}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold">When you need to care</dt>
                      <dd className="text-muted-foreground">{a.whenToCare}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold">Common mistake</dt>
                      <dd className="text-muted-foreground">{a.mistake}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold">What to do next</dt>
                      <dd className="text-muted-foreground">{a.nextAction}</dd>
                    </div>
                    {a.analogy ? (
                      <div className="rounded-md bg-primary-soft/50 p-3">
                        <dt className="font-semibold">Think of it like this</dt>
                        <dd className="text-muted-foreground">{a.analogy}</dd>
                      </div>
                    ) : null}
                    {a.example ? (
                      <div>
                        <dt className="font-semibold">A real-world example</dt>
                        <dd className="text-muted-foreground">{a.example}</dd>
                      </div>
                    ) : null}
                  </dl>

                  {a.terms.length ? (
                    <p className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      {a.terms.map((t) => (
                        <GlossaryTooltip key={t} term={t} />
                      ))}
                    </p>
                  ) : null}

                  <Button
                    className="mt-4"
                    size="sm"
                    variant={read ? "secondary" : "outline"}
                    onClick={() => toggleArticle(a.slug)}
                  >
                    {read ? (
                      <Check className="size-4" aria-hidden="true" />
                    ) : (
                      <BookOpen className="size-4" aria-hidden="true" />
                    )}
                    {read ? "Marked as read" : "Mark as read"}
                  </Button>
                </article>
              );
            })}
          </div>
          {!articles.length ? (
            <p className="surface-panel mt-4 p-6 text-sm text-muted-foreground">
              Nothing matches that search. Try a simpler word, or clear the category filter.
            </p>
          ) : null}
        </section>

        <section aria-labelledby="glossary">
          <h2 id="glossary" className="font-display text-xl font-bold">
            Glossary
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({glossaryEntries.length})
            </span>
          </h2>
          {glossaryEntries.length ? (
            <Accordion type="multiple" className="mt-4 grid gap-4 items-start md:grid-cols-2">
              <div className="surface-panel px-5">
                {glossaryCol1.map(([term, def]) => (
                  <AccordionItem key={term} value={term} className="last:border-b-0">
                    <AccordionTrigger className="text-left font-display font-semibold">
                      {term}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                      {def}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </div>
              {glossaryCol2.length ? (
                <div className="surface-panel px-5">
                  {glossaryCol2.map(([term, def]) => (
                    <AccordionItem key={term} value={term} className="last:border-b-0">
                      <AccordionTrigger className="text-left font-display font-semibold">
                        {term}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                        {def}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </div>
              ) : null}
            </Accordion>
          ) : (
            <p className="surface-panel mt-4 p-6 text-sm text-muted-foreground">
              No glossary terms match that search.
            </p>
          )}
        </section>
      </div>
    </AppShell>
  );
}
