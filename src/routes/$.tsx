import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, LifeBuoy, ListChecks, Search } from "lucide-react";
import { MarketingNavbar } from "@/components/MarketingNavbar";
import { SiteFooter } from "@/components/SiteFooter";
import { LinkCard } from "@/components/ContentPage";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/$")({
  head: () => ({
    meta: [
      { title: "Page not found — Launch My Business Online" },
      {
        name: "description",
        content: "That address does not exist. Jump back to your dashboard, the help centre or the learning library.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Page not found" },
      { property: "og:description", content: "Let's get you back on track." },
    ],
  }),
  component: CatchAllNotFound,
});

function CatchAllNotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingNavbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-16 sm:px-6">
        <p className="font-display text-sm font-semibold tracking-wide text-primary uppercase">Error 404</p>
        <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">We can't find that page</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          The address may have changed, or the link that brought you here might be out of date. Nothing in your plan
          has been lost — it is saved on this device.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/">Go to the home page</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/dashboard">Open my dashboard</Link>
          </Button>
        </div>

        <h2 className="mt-12 font-display text-xl font-bold">Popular destinations</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <LinkCard
            icon={ListChecks}
            title="Launch checklist"
            description="Your step-by-step tasks, filtered by phase and importance."
            to="/checklist"
            cta="Open checklist"
          />
          <LinkCard
            icon={LifeBuoy}
            title="Help centre"
            description="Search plain-English answers about domains, email and DNS."
            to="/help"
            cta="Get help"
          />
          <LinkCard
            icon={Compass}
            title="Learning library"
            description="Short guides for every stage of getting your business online."
            to="/learn"
            cta="Start learning"
          />
          <LinkCard
            icon={Search}
            title="Glossary"
            description="Every technical word explained in everyday language."
            to="/glossary"
            cta="Look up a term"
          />
        </div>

        <p className="mt-10 text-sm text-muted-foreground">
          Think this page should exist?{" "}
          <Link to="/contact" className="text-primary underline">
            Tell us what you were looking for
          </Link>
          .
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
