import { Link } from "@tanstack/react-router";
import { Rocket } from "lucide-react";

const COLUMNS: { heading: string; links: { to: string; label: string }[] }[] = [
  {
    heading: "Product",
    links: [
      { to: "/how-it-works", label: "How it works" },
      { to: "/onboarding", label: "Build my plan" },
      { to: "/checklist", label: "Launch checklist" },
      { to: "/learn", label: "Learning library" },
      { to: "/help", label: "Help centre" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { to: "/domains", label: "Domain guide" },
      { to: "/platform-matcher", label: "Platform matcher" },
      { to: "/connect-domain", label: "DNS connection guide" },
      { to: "/business-email", label: "Business email guide" },
      { to: "/get-found", label: "Get found" },
      { to: "/troubleshooting", label: "Troubleshooting" },
      { to: "/glossary", label: "Glossary" },
      { to: "/hire-help", label: "Hire a professional" },
    ],
  },
  {
    heading: "Company",
    links: [
      { to: "/contact", label: "Contact" },
      { to: "/changelog", label: "Changelog" },
      { to: "/status", label: "Status" },
      { to: "/ownership-record", label: "Ownership record" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { to: "/privacy", label: "Privacy" },
      { to: "/terms", label: "Terms" },
      { to: "/accessibility", label: "Accessibility" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Rocket className="size-4.5" aria-hidden="true" />
              </span>
              <span className="font-display text-sm font-bold">Launch My Business Online</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Your simple, step-by-step guide from business idea to live website.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h2 className="font-display text-sm font-semibold">{col.heading}</h2>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-10 border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
          Educational guidance only; pricing, eligibility and provider features vary. Domain
          availability, technical requirements, legal obligations, accessibility requirements, tax
          obligations, privacy requirements and search visibility differ by location, platform and
          business type. Review provider documentation and seek qualified professional advice when
          needed.
        </p>
      </div>
    </footer>
  );
}
