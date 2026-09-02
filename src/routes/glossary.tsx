import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ContentPageLayout } from "@/components/ContentPage";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { GLOSSARY_CATEGORIES, GLOSSARY_TERMS } from "@/lib/support-data";

export const Route = createFileRoute("/glossary")({
  head: () => ({
    meta: [
      { title: "Glossary — plain-English web words explained" },
      {
        name: "description",
        content:
          "Domain, DNS, hosting, SSL, MX record, SPF and more — explained in everyday language, with why each one matters.",
      },
      { property: "og:title", content: "Plain-English glossary" },
      {
        property: "og:description",
        content: "Every technical word you will meet while getting your business online.",
      },
    ],
  }),
  component: GlossaryPage,
});

function GlossaryPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const q = query.trim().toLowerCase();

  const terms = useMemo(
    () =>
      GLOSSARY_TERMS.filter((t) => {
        const matchesCategory = category === "All" || t.category === category;
        const matchesQuery = q
          ? `${t.term} ${t.definition} ${t.whyItMatters}`.toLowerCase().includes(q)
          : true;
        return matchesCategory && matchesQuery;
      }).sort((a, b) => a.term.localeCompare(b.term)),
    [q, category],
  );

  return (
    <ContentPageLayout
      eyebrow="Reference"
      title="Glossary"
      description="Technical words, translated. Every entry explains what it means and why it matters to your business."
    >
      <section className="surface-panel space-y-4 p-5 sm:p-6">
        <div className="space-y-2">
          <Label htmlFor="glossary-search" className="font-display text-base font-semibold">
            Search terms
          </Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="glossary-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try “MX record” or “SSL”"
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {["All", ...GLOSSARY_CATEGORIES].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                category === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:bg-muted",
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {terms.length} term{terms.length === 1 ? "" : "s"} shown
        </p>
      </section>

      {terms.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No terms matched"
          description="Try a shorter word, or clear the category filter to search everything."
          actionLabel="Ask us instead"
          actionTo="/contact"
        />
      ) : (
        <dl className="grid gap-4 sm:grid-cols-2">
          {terms.map((t) => (
            <div key={t.term} className="surface-panel space-y-2 p-5">
              <span className="text-xs font-semibold tracking-wide text-primary uppercase">
                {t.category}
              </span>
              <dt className="font-display text-lg font-semibold">{t.term}</dt>
              <dd className="space-y-2 text-sm text-muted-foreground">
                <p>{t.definition}</p>
                <p>
                  <span className="font-medium text-foreground">Why it matters: </span>
                  {t.whyItMatters}
                </p>
                <Button asChild variant="link" className="h-auto p-0">
                  <Link to={t.relatedTo}>{t.relatedLabel}</Link>
                </Button>
              </dd>
            </div>
          ))}
        </dl>
      )}
    </ContentPageLayout>
  );
}
