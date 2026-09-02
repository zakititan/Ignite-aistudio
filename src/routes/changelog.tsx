import { createFileRoute, Link } from "@tanstack/react-router";
import { ContentPageLayout } from "@/components/ContentPage";
import { Button } from "@/components/ui/button";
import { CHANGELOG } from "@/lib/support-data";

export const Route = createFileRoute("/changelog")({
  head: () => ({
    meta: [
      { title: "What's new — Launch My Business Online" },
      {
        name: "description",
        content:
          "Recent improvements to the launch roadmap, guides, appearance settings and mobile experience.",
      },
      { property: "og:title", content: "What's new" },
      {
        property: "og:description",
        content: "A running list of improvements to your launch guidance.",
      },
    ],
  }),
  component: ChangelogPage,
});

function ChangelogPage() {
  return (
    <ContentPageLayout
      eyebrow="Product"
      title="What's new"
      description="Improvements we have shipped recently, newest first."
    >
      <ol className="space-y-4">
        {CHANGELOG.map((entry) => (
          <li key={entry.version} className="surface-panel space-y-3 p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">
                v{entry.version}
              </span>
              <span className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {entry.area}
              </span>
              <span className="text-xs text-muted-foreground">{entry.date}</span>
            </div>
            <h2 className="font-display text-lg font-bold">{entry.title}</h2>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
              {entry.items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <section className="surface-panel flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="font-display text-lg font-bold">Have an idea?</h2>
          <p className="text-sm text-muted-foreground">
            Tell us what would make getting online easier — we read every message.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/contact">Share feedback</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/status">Service status</Link>
          </Button>
        </div>
      </section>
    </ContentPageLayout>
  );
}
