import { createFileRoute, Link } from "@tanstack/react-router";
import { ContentPageLayout, ContentSection, InPageTableOfContents } from "@/components/ContentPage";
import { Callout } from "@/components/Callouts";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy — Launch My Business Online" },
      {
        name: "description",
        content:
          "What we store when you build a launch plan, what we never ask for, and how to delete your data at any time.",
      },
      { property: "og:title", content: "Privacy at Launch My Business Online" },
      {
        property: "og:description",
        content: "Plain-English privacy: local plans, no passwords, easy deletion.",
      },
    ],
  }),
  component: PrivacyPage,
});

const TOC = [
  { id: "collect", label: "What we collect" },
  { id: "never", label: "What we never store" },
  { id: "use", label: "How your plan is used" },
  { id: "local", label: "Guest plans and local storage" },
  { id: "delete", label: "Deleting your data" },
  { id: "contact", label: "Privacy questions" },
];

function PrivacyPage() {
  return (
    <ContentPageLayout
      eyebrow="Legal"
      title="Privacy"
      description="Your launch plan belongs to you. Here is exactly what is stored, where it lives, and how to remove it."
      aside={<InPageTableOfContents items={TOC} />}
    >
      <p className="text-sm text-muted-foreground">
        Last updated: 2 September 2026 (placeholder date).
      </p>

      <ContentSection id="collect" title="What we collect">
        <p>
          <strong className="text-foreground">Guest / demo mode:</strong> everything you type —
          business details, checklist progress, page drafts and ownership notes — is saved in your
          own browser. It is not sent to us.
        </p>
        <p>
          <strong className="text-foreground">Signed-in mode:</strong> when account sync is enabled,
          we would store your name, email address and the plan content you choose to save, so you
          can continue on another device. Account sync is not live yet; today the sign-in screen
          only labels the plan stored on this device.
        </p>
      </ContentSection>

      <ContentSection id="never" title="What we never store">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Passwords for your registrar, hosting, email or social accounts.</li>
          <li>Account recovery codes or two-step authentication backup codes.</li>
          <li>DNS control-panel credentials or API keys.</li>
          <li>Payment card numbers or bank details.</li>
        </ul>
        <p>Never enter any of these into this app, or into a message to us.</p>
      </ContentSection>

      <ContentSection id="use" title="How your business profile and checklist are used">
        <p>
          Your answers are used to generate your roadmap, tailor guidance, and track progress. They
          are not sold, and we do not use them to advertise providers to you. We are not paid to
          recommend registrars, platforms or email providers.
        </p>
      </ContentSection>

      <ContentSection id="local" title="Guest plans and local storage">
        <p>
          Guest plans live in your browser's local storage under a single key. Clearing your
          browsing data, using a different browser, or private browsing will make the plan appear
          empty. Export a copy from Settings if the plan matters to you.
        </p>
      </ContentSection>

      <ContentSection id="delete" title="Deleting your data">
        <p>
          You can delete everything at any time from Settings, or request deletion of a future
          synced account from the delete-account page. Deletion of local data is immediate and
          cannot be undone.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <Button asChild variant="outline">
            <Link to="/settings">Open settings</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/delete-account">Request account deletion</Link>
          </Button>
        </div>
      </ContentSection>

      <ContentSection id="contact" title="Privacy questions">
        <p>
          Send privacy questions through the contact form and choose the “Privacy request” topic. A
          dedicated privacy contact address will be published here when account sync launches.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <Button asChild>
            <Link to="/contact">Contact us</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/terms">Read the terms</Link>
          </Button>
        </div>
      </ContentSection>

      <Callout tone="info" title="Educational guidance only">
        This page describes how the product handles information. It is not legal advice about your
        own privacy obligations to your customers.
      </Callout>
    </ContentPageLayout>
  );
}
