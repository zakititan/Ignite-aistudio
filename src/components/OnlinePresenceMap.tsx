import { Link } from "@tanstack/react-router";
import { Globe, Mail, Server } from "lucide-react";
import { Button } from "@/components/ui/button";

const BUILDING_BLOCKS = [
  {
    icon: Globe,
    title: "1. Domain",
    description: "Your address, such as yourbusiness.com. You register and renew it each year.",
    to: "/domains",
    action: "Learn about domains",
  },
  {
    icon: Server,
    title: "2. Website and hosting",
    description:
      "Your website is what customers see. Hosting is the service that stores and delivers it.",
    to: "/platform-matcher",
    action: "Choose a website setup",
  },
  {
    icon: Mail,
    title: "3. Business email",
    description:
      "An address such as hello@yourbusiness.com. It uses your domain but is a separate service.",
    to: "/business-email",
    action: "Learn about business email",
  },
] as const;

export function OnlinePresenceMap({ showActions = true }: { showActions?: boolean }) {
  return (
    <section className="surface-panel p-5 sm:p-6" aria-labelledby="online-building-blocks">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold tracking-wide text-primary uppercase">
          The simple version
        </p>
        <h2 id="online-building-blocks" className="mt-1 font-display text-xl font-bold">
          Your online presence has three separate parts
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You can buy them from one company or different companies. The important thing is that your
          business controls every account.
        </p>
      </div>
      <ol className="mt-5 grid gap-3 md:grid-cols-3">
        {BUILDING_BLOCKS.map(({ icon: Icon, title, description, to, action }) => (
          <li key={title} className="rounded-xl border border-border bg-muted/40 p-4">
            <Icon className="size-5 text-primary" aria-hidden="true" />
            <h3 className="mt-3 font-display font-semibold">{title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
            {showActions ? (
              <Button asChild variant="link" size="sm" className="mt-2 h-auto px-0">
                <Link to={to}>{action}</Link>
              </Button>
            ) : null}
          </li>
        ))}
      </ol>
      <p className="mt-4 rounded-lg border border-warning/30 bg-warning-soft px-3 py-2 text-sm text-foreground">
        Connecting your website changes domain settings. It should not require deleting your email
        settings.
      </p>
    </section>
  );
}
