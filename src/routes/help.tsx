import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookOpen, Clock, ExternalLink, PlayCircle, Search } from "lucide-react";
import { ContentPageLayout } from "@/components/ContentPage";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HELP_ARTICLES, HELP_CATEGORIES, type HelpArticle } from "@/lib/support-data";
import { VISUAL_RESOURCES } from "@/lib/library";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help centre — Cornerstone" },
      {
        name: "description",
        content:
          "Search beginner-friendly answers about domains, platforms, DNS, business email and launching.",
      },
      { property: "og:title", content: "Help centre" },
      {
        property: "og:description",
        content: "Search plain-English answers for getting your business online.",
      },
    ],
  }),
  component: HelpPage,
});

function ArticleCard({ article }: { article: HelpArticle }) {
  return (
    <Link
      to={article.to}
      className="surface-panel flex flex-col gap-1.5 p-4 transition-colors hover:bg-muted"
    >
      <span className="text-xs font-semibold tracking-wide text-primary uppercase">
        {article.category}
      </span>
      <span className="font-display text-base font-semibold">{article.title}</span>
      <span className="text-sm text-muted-foreground">{article.summary}</span>
      {article.analogy ? (
        <span className="mt-1 text-sm text-primary/80">Think of it like: {article.analogy}</span>
      ) : null}
      {article.example ? (
        <span className="text-xs text-muted-foreground">Example: {article.example}</span>
      ) : null}
      <span className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="size-3.5" aria-hidden="true" />
        {article.minutes} min read
      </span>
    </Link>
  );
}

function HelpPage() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!q) return [];
    return HELP_ARTICLES.filter((a) =>
      `${a.title} ${a.summary} ${a.category} ${a.analogy ?? ""} ${a.example ?? ""}`
        .toLowerCase()
        .includes(q),
    );
  }, [q]);

  const popular = HELP_ARTICLES.filter((a) => a.popular);

  return (
    <ContentPageLayout
      eyebrow="Support"
      title="Help centre"
      description="Search for an answer, browse by topic, or contact us if you are still stuck."
    >
      <section className="surface-panel space-y-3 p-5 sm:p-6">
        <Label htmlFor="help-search" className="font-display text-base font-semibold">
          Search help articles
        </Label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="help-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try “connect my domain” or “email in spam”"
            className="pl-9"
          />
        </div>
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {q
            ? `${results.length} result${results.length === 1 ? "" : "s"} for “${query.trim()}”`
            : `${HELP_ARTICLES.length} articles available`}
        </p>
      </section>

      {q ? (
        results.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {results.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Search}
            title="No articles matched that search"
            description="Try a simpler word such as “domain”, “email” or “launch”, or browse the categories below."
            actionLabel="Contact support"
            actionTo="/contact"
          />
        )
      ) : (
        <>
          <section className="surface-panel space-y-4 p-5 sm:p-6" aria-labelledby="visual-help">
            <div>
              <h2 id="visual-help" className="font-display text-xl font-bold">
                Prefer watching or skimming?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Start with one of these trusted visual guides. You do not need to understand every
                technical word before you begin.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {VISUAL_RESOURCES.filter((resource) => resource.kind === "Video")
                .slice(0, 10)
                .map((resource) => (
                  <a
                    key={resource.title}
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border p-4 transition-colors hover:bg-muted"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                        <span>
                          {resource.kind === "Video" ? (
                            <PlayCircle className="size-3" />
                          ) : (
                            <BookOpen className="size-3" />
                          )}
                        </span>
                        {resource.kind}
                      </span>
                      <ExternalLink className="size-4 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <h3 className="mt-2 font-display font-semibold">{resource.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{resource.description}</p>
                    <p className="mt-2 text-xs text-primary/80">
                      Think of it like: {resource.analogy}
                    </p>
                  </a>
                ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-xl font-bold">Browse by topic</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {HELP_CATEGORIES.map((c) => (
                <Link
                  key={c.id}
                  to={c.to}
                  className="surface-panel flex flex-col gap-1.5 p-4 transition-colors hover:bg-muted"
                >
                  <span className="font-display text-base font-semibold">{c.label}</span>
                  <span className="text-sm text-muted-foreground">{c.description}</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-xl font-bold">Popular articles</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {popular.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </section>
        </>
      )}

      <section className="surface-panel flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="font-display text-lg font-bold">Still need help?</h2>
          <p className="text-sm text-muted-foreground">
            Send us the details and we will point you at the right next step.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/contact">Contact us</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/troubleshooting">Troubleshoot an issue</Link>
          </Button>
        </div>
      </section>

      <section className="surface-panel p-5">
        <h2 className="font-display text-base font-bold">
          See how your domain, website and email connect
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your web address, website and business email share the same domain settings (DNS). The
          setup map shows what is planned, what is unknown, and what to protect before you change
          anything. Email records (MX/SPF) stay separate from website records (A/CNAME).
        </p>
        <Button asChild size="sm" className="mt-3">
          <Link to="/online-setup">View setup map →</Link>
        </Button>
      </section>

      <section className="surface-panel p-5">
        <h2 className="font-display text-base font-bold">Test your customer journey</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          If a customer cannot call, submit a form, book or buy, use the 5-step journey tester to
          record what happened. Blocked steps show as a critical launch blocker.
        </p>
        <Button asChild size="sm" className="mt-3">
          <Link to="/customer-journey">Open journey tester →</Link>
        </Button>
      </section>
    </ContentPageLayout>
  );
}
