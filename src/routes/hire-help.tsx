import { createFileRoute, Link } from "@tanstack/react-router";
import { ContentPageLayout, ContentSection, SafetyWarningBanner } from "@/components/ContentPage";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/hire-help")({
  head: () => ({
    meta: [
      { title: "Hiring help — what to ask before you pay" },
      {
        name: "description",
        content:
          "Typical price ranges, questions to ask, red flags to avoid, and how to keep ownership of your domain and accounts.",
      },
      { property: "og:title", content: "Hiring help safely" },
      { property: "og:description", content: "Know what to ask, what it costs, and how to stay in control." },
    ],
  }),
  component: HireHelpPage,
});

const TASKS = [
  { task: "Register a domain and set it up", diy: "20 minutes", cost: "£10–£30 per year", worth: "Do it yourself — it must be in your name." },
  { task: "Connect a domain to a website (DNS)", diy: "1–2 hours", cost: "£50–£150 one-off", worth: "Worth paying if the records confuse you." },
  { task: "Build a simple 5-page website", diy: "1–2 weekends", cost: "£500–£3,000", worth: "DIY on a builder is realistic for most." },
  { task: "Set up business email", diy: "1 hour", cost: "£50–£120 one-off", worth: "Usually straightforward to do yourself." },
  { task: "Logo and brand basics", diy: "A few hours", cost: "£150–£800", worth: "Paying often pays off visually." },
  { task: "Local search setup", diy: "1–2 hours", cost: "£100–£400", worth: "DIY first; the listings are free." },
  { task: "Ongoing maintenance", diy: "1 hour a month", cost: "£25–£150 a month", worth: "Consider it once you rely on the site." },
];

function HireHelpPage() {
  return (
    <ContentPageLayout
      eyebrow="Guidance"
      title="Hiring help"
      description="There is no shame in paying someone. There is real risk in paying the wrong someone — here is how to tell the difference."
    >
      <SafetyWarningBanner title="Keep ownership in your name">
        Whoever helps you, the domain, hosting, email and analytics accounts must be registered to your business, with
        your email as the recovery address. Give collaborator or admin access instead of handing over your login.
      </SafetyWarningBanner>

      <ContentSection title="What things typically cost">
        <p className="text-sm text-muted-foreground">
          Indicative ranges only — prices vary by country, provider and scope.
        </p>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Doing it yourself</TableHead>
                <TableHead>Typical paid cost</TableHead>
                <TableHead>Worth paying for?</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TASKS.map((t) => (
                <TableRow key={t.task}>
                  <TableCell className="font-medium">{t.task}</TableCell>
                  <TableCell className="text-muted-foreground">{t.diy}</TableCell>
                  <TableCell className="text-muted-foreground">{t.cost}</TableCell>
                  <TableCell className="text-muted-foreground">{t.worth}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ContentSection>

      <ContentSection title="Questions to ask before you pay">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Will the domain and all accounts be registered in my business's name?</li>
          <li>What exactly is included, and what counts as extra?</li>
          <li>Who owns the website files and content when we finish?</li>
          <li>What happens if I want to move to another provider later?</li>
          <li>How will you hand over logins, and how do I revoke your access?</li>
          <li>What is your timescale, and what do you need from me?</li>
          <li>Is support included after launch, and for how long?</li>
        </ul>
      </ContentSection>

      <ContentSection title="Red flags">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>They register the domain in their own name or company.</li>
          <li>They refuse to give you admin access to your own accounts.</li>
          <li>They guarantee first place in search results.</li>
          <li>No written scope, price or timeline.</li>
          <li>Large upfront payment with no milestones.</li>
          <li>They pressure you into a long contract before any work is shown.</li>
        </ul>
      </ContentSection>

      <ContentSection title="Where to find people">
        <p>
          Ask other local business owners, your accountant, or a nearby business support organisation. Freelance
          marketplaces and platform partner directories are options too — check reviews and ask for two recent
          examples you can visit yourself. We do not run a directory and we are not paid to recommend anyone.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button asChild variant="outline">
            <Link to="/ownership-record">Fill in your ownership record</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/checklist">Back to your checklist</Link>
          </Button>
        </div>
      </ContentSection>
    </ContentPageLayout>
  );
}
