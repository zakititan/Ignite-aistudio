import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ContentPageLayout, ContentSection } from "@/components/ContentPage";
import { Callout } from "@/components/Callouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/accessibility")({
  head: () => ({
    meta: [
      { title: "Accessibility — Cornerstone" },
      {
        name: "description",
        content:
          "Our accessibility commitment: keyboard operation, readable contrast, light and dark themes, and a feedback path.",
      },
      { property: "og:title", content: "Accessibility commitment" },
      {
        property: "og:description",
        content:
          "How we build for keyboard, screen reader and low-vision use — and how to report a problem.",
      },
    ],
  }),
  component: AccessibilityPage,
});

function AccessibilityPage() {
  const [sent, setSent] = useState(false);
  const [page, setPage] = useState("");
  const [details, setDetails] = useState("");

  return (
    <ContentPageLayout
      eyebrow="Commitment"
      title="Accessibility"
      description="Everyone starting a business should be able to use this guidance, whatever device or assistive technology they rely on."
    >
      <ContentSection title="What we aim for">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Semantic HTML with proper headings, landmarks and labels.</li>
          <li>Full keyboard operation, with visible focus rings on every control.</li>
          <li>Readable text contrast in both light and dark themes.</li>
          <li>Light, dark and device-preference themes, remembered per device.</li>
          <li>Responsive layouts with generous tap targets on mobile.</li>
          <li>Respect for reduced-motion preferences where animation is used.</li>
          <li>Status shown with words and icons, never colour alone.</li>
        </ul>
      </ContentSection>

      <ContentSection title="Known limitations">
        <p>
          Some longer guides use wide tables of DNS records that require horizontal scrolling on
          small screens. A few illustrative demo screens are placeholders while features are still
          being built. We are working through these; this list is a placeholder and will be updated
          as issues are resolved.
        </p>
      </ContentSection>

      <section className="surface-panel space-y-4 p-5 sm:p-6">
        <div>
          <h2 className="font-display text-xl font-bold">Report an accessibility issue</h2>
          <p className="text-sm text-muted-foreground">
            Tell us what got in your way. Reports go to the product team.
          </p>
        </div>
        {sent ? (
          <Callout tone="success" title="Thank you — your report has been noted">
            This is a demo form, so nothing was transmitted. Until submissions are connected, please
            also send the details through the contact page so we definitely receive them.
          </Callout>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (details.trim().length < 10) {
                toast.error("Please describe the issue in a little more detail.");
                return;
              }
              setSent(true);
              toast.success("Report captured on this device (demo).");
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="a11y-page">Page address</Label>
              <Input
                id="a11y-page"
                value={page}
                onChange={(e) => setPage(e.target.value)}
                placeholder="/connect-domain"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="a11y-details">What happened?</Label>
              <Textarea
                id="a11y-details"
                required
                rows={5}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe the problem, your device and browser, and any assistive technology you use."
              />
            </div>
            <Button type="submit">Send report</Button>
          </form>
        )}
      </section>

      <ContentSection title="What to include in a report">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>The page address where the problem happened.</li>
          <li>Your device and browser.</li>
          <li>Any assistive technology, such as a screen reader or magnifier.</li>
          <li>A short description of what you expected and what happened instead.</li>
          <li>How you would like us to reply.</li>
        </ul>
        <div className="flex flex-wrap gap-3 pt-1">
          <Button asChild variant="outline">
            <Link to="/contact">Contact the team</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/settings">Change appearance settings</Link>
          </Button>
        </div>
      </ContentSection>
    </ContentPageLayout>
  );
}
