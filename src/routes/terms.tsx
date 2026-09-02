import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ContentPageLayout,
  ContentSection,
  InPageTableOfContents,
  SafetyWarningBanner,
} from "@/components/ContentPage";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of use — Launch My Business Online" },
      {
        name: "description",
        content:
          "Educational guidance, no guarantees on domains, pricing, rankings or email delivery, and your responsibility to verify provider settings.",
      },
      { property: "og:title", content: "Terms of use" },
      {
        property: "og:description",
        content: "What this guidance covers, and what remains your responsibility.",
      },
    ],
  }),
  component: TermsPage,
});

const TOC = [
  { id: "guidance", label: "Educational guidance" },
  { id: "no-guarantee", label: "No guarantees" },
  { id: "responsibility", label: "Your responsibility" },
  { id: "acceptable-use", label: "Acceptable use" },
  { id: "ip", label: "Intellectual property" },
  { id: "liability", label: "Limitation of liability" },
  { id: "changes", label: "Changes to the service" },
  { id: "contact", label: "Contact" },
];

function TermsPage() {
  return (
    <ContentPageLayout
      eyebrow="Legal"
      title="Terms of use"
      description="A plain-English summary of what this product promises, and what it deliberately does not."
      aside={<InPageTableOfContents items={TOC} />}
    >
      <p className="text-sm text-muted-foreground">
        Last updated: 2 September 2026 (placeholder date).
      </p>

      <ContentSection id="guidance" title="Educational guidance">
        <p>
          Launch My Business Online provides general educational guidance about getting a small
          business online. It is not legal, tax, accounting, security or financial advice, and it
          does not create a professional relationship.
        </p>
      </ContentSection>

      <ContentSection id="no-guarantee" title="No guarantees">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            Domain availability and pricing shown here are illustrative until confirmed with a
            registrar.
          </li>
          <li>We do not guarantee search rankings, traffic, enquiries or sales.</li>
          <li>We do not guarantee legal, tax or accessibility compliance in your jurisdiction.</li>
          <li>
            We do not guarantee email delivery, uptime, or the performance of any third-party
            provider.
          </li>
          <li>Provider features and prices change without notice.</li>
        </ul>
      </ContentSection>

      <ContentSection id="responsibility" title="Your responsibility">
        <p>
          You are responsible for verifying every DNS value, mail record and account setting against
          your provider's own documentation before you make a change, and for keeping backups of
          existing settings.
        </p>
        <SafetyWarningBanner>
          Take a screenshot or export of your current DNS records before editing them. Never delete
          a record you do not recognise — mail records in particular are easy to lose and hard to
          reconstruct.
        </SafetyWarningBanner>
      </ContentSection>

      <ContentSection id="acceptable-use" title="Acceptable use">
        <p>
          Use the product respectfully and lawfully. Do not attempt to disrupt the service, misuse
          forms to send abusive or misleading content, or use the guidance to impersonate another
          business.
        </p>
      </ContentSection>

      <ContentSection id="ip" title="Intellectual property">
        <p>
          The guidance, layout and wording of this product remain the property of their owner.
          Content you write — your business details, page drafts and notes — remains yours.
          Placeholder section pending final terms.
        </p>
      </ContentSection>

      <ContentSection id="liability" title="Limitation of liability">
        <p>
          To the extent permitted by law, the product is provided “as is” and we are not liable for
          losses arising from following general guidance, from third-party provider outages, or from
          configuration changes you make. Placeholder section pending final terms.
        </p>
      </ContentSection>

      <ContentSection id="changes" title="Changes to the service">
        <p>
          Features may be added, changed or removed. Meaningful changes are noted on the changelog
          page. Continued use after a change means you accept the updated terms.
        </p>
        <Button asChild variant="outline">
          <Link to="/changelog">See what changed</Link>
        </Button>
      </ContentSection>

      <ContentSection id="contact" title="Contact">
        <p>Questions about these terms can be sent through the contact form.</p>
        <div className="flex flex-wrap gap-3 pt-1">
          <Button asChild>
            <Link to="/contact">Contact us</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/privacy">Read the privacy page</Link>
          </Button>
        </div>
      </ContentSection>
    </ContentPageLayout>
  );
}
