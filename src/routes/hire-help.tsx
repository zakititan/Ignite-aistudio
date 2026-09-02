import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Copy,
  Printer,
  Download,
  Eye,
  Building2,
  Target,
  Palette,
  Globe,
  ListChecks,
  ShieldCheck,
  HelpCircle,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Callout } from "@/components/Callouts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store";
import { getReadiness } from "@/lib/readiness";
import { JOURNEY_DEFINITIONS } from "@/lib/customer-journey";
import type { CustomerJourneyType } from "@/lib/types";

export const Route = createFileRoute("/hire-help")({
  head: () => ({
    meta: [
      { title: "Share your website plan with a professional — Cornerstone" },
      {
        name: "description",
        content:
          "Create a clear project brief from the work you have already completed. Keep domain, website, email, and payment accounts under business-owner control.",
      },
      { property: "og:title", content: "Share your website plan with a professional" },
      {
        property: "og:description",
        content:
          "A local-only handoff brief compiled from your business profile, plan, domain shortlist and readiness.",
      },
    ],
  }),
  component: HireHelpPage,
});

const QUESTIONS = [
  "Will the domain and all accounts be registered in my business's name, with my email as the recovery address?",
  "What exactly is included, and what counts as extra?",
  "Who owns the website files and content when we finish, and how will you hand them over?",
  "What happens if I want to move to another provider later — is there a lock-in or fee?",
  "How will you hand over logins, and how do I revoke your access when the work is done?",
  "What is your timescale, and what do you need from me to stay on schedule?",
  "Is support included after launch, for how long, and what does it cover?",
  "Will you document how I can update the site myself and who to contact for future help?",
] as const;

const OWNERSHIP_ITEMS = [
  {
    id: "domain",
    label: "Domain is registered in an account the business controls",
    hint: "Registrar account belongs to the owner, with business email as the account email.",
  },
  {
    id: "hosting",
    label: "Website hosting/platform is in the business owner's account",
    hint: "Billing and admin access are in your name, not the helper's personal account.",
  },
  {
    id: "email",
    label: "Business email recovery is set to a business-controlled address",
    hint: "Recovery phone/email you control; two-step sign-in turned on for registrar and email.",
  },
  {
    id: "second-owner",
    label: "A second trusted owner or admin is recorded",
    hint: "Documented backup owner so the business is not locked out if one person leaves.",
  },
  {
    id: "no-passwords",
    label: "No passwords or card numbers are pasted in this brief",
    hint: "Share accounts with collaborator/admin access. Store credentials in a password manager.",
  },
  {
    id: "least-privilege",
    label: "Only the required access is granted, and it will be revoked after handoff",
    hint: "Give the minimum role needed for the task, with a clear end date.",
  },
] as const;

function fmt(v: string | undefined, fallback = "— not yet recorded —") {
  const t = (v ?? "").trim();
  return t.length ? t : fallback;
}

function buildBriefText(opts: {
  business: ReturnType<typeof useStore>["state"]["business"];
  tasks: ReturnType<typeof useStore>["state"]["tasks"];
  ownership: ReturnType<typeof useStore>["state"]["ownership"];
  drafts: ReturnType<typeof useStore>["state"]["drafts"];
  savedDomains: ReturnType<typeof useStore>["state"]["savedDomainIdeas"];
  journey: ReturnType<typeof useStore>["state"]["customerJourneyTest"];
  readiness: ReturnType<typeof getReadiness>;
}): string {
  const { business, tasks, ownership, drafts, savedDomains, journey, readiness } = opts;
  const preferred =
    business.preferredDomain?.trim() ||
    savedDomains.find((d) => d.status === "preferred")?.domain ||
    "— none marked —";
  const purchased = business.domainPurchased || "— not recorded —";
  const registrar =
    business.registrarName?.trim() || ownership.domainRegistrar?.trim() || "— not recorded —";
  const platform =
    business.websiteApproach?.trim() || ownership.websitePlatform?.trim() || "— not decided —";
  const existing = business.existingWebsiteStatus || "— not recorded —";
  const emailStatus = business.businessEmailStatus || "— not recorded —";
  const email = business.businessEmail?.trim() || "— not recorded —";

  const completed = tasks.filter((t) => t.status === "complete");
  const openRequired = tasks.filter((t) => t.importance === "required" && t.status !== "complete");
  const openRecommended = tasks.filter(
    (t) => t.importance === "recommended" && t.status !== "complete",
  );

  const journeyLabel = journey?.journeyType
    ? journey.journeyType === "custom" && journey.customJourneyLabel
      ? journey.customJourneyLabel
      : (JOURNEY_DEFINITIONS[journey.journeyType as CustomerJourneyType]?.label ??
        journey.journeyType)
    : business.primaryCustomerAction
      ? (JOURNEY_DEFINITIONS[business.primaryCustomerAction as CustomerJourneyType]?.label ??
        business.primaryCustomerAction)
      : "— not yet chosen —";

  const journeySteps = journey?.steps ?? [];
  const journeyStatus =
    journeySteps.length === 0
      ? "Not yet tested"
      : journeySteps.every((s) => s.status === "passed")
        ? "All steps passed"
        : journeySteps.some((s) => s.status === "blocked")
          ? `Blocked: ${journeySteps
              .filter((s) => s.status === "blocked")
              .map((s) => s.label)
              .join("; ")}`
          : journeySteps.some((s) => s.status === "needs_improvement")
            ? `Needs improvement: ${journeySteps
                .filter((s) => s.status === "needs_improvement")
                .map((s) => s.label)
                .join("; ")}`
            : `${journeySteps.filter((s) => s.status !== "not_tested").length}/${journeySteps.length} steps recorded`;

  const draftPages = Object.keys(drafts ?? {});
  const draftSummary =
    draftPages.length === 0
      ? "No content drafts saved yet"
      : draftPages
          .map((k) => `- ${k}: last updated ${drafts[k]?.updatedAt?.slice(0, 10) ?? "—"}`)
          .join("\n");

  const shortlistLines =
    savedDomains.length === 0
      ? "No domain shortlist saved yet"
      : savedDomains
          .map(
            (d) => `- ${d.domain} — ${d.status}${d.note ? ` — note: ${d.note.slice(0, 80)}` : ""}`,
          )
          .join("\n");

  const blockers =
    readiness.blockers.length === 0
      ? "None — readiness shows no critical blockers"
      : readiness.blockers.map((b) => `- [${b.severity}] ${b.title}: ${b.description}`).join("\n");

  const safeDate = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `# Website Project Brief — ${business.businessName || "Your business"}
_Generated ${safeDate} from Cornerstone (stored locally in your browser)._

> Keep domain, website, email, and payment accounts under business-owner control. This brief stays in your browser — nothing is sent to a server. Share the file or printed page directly with your chosen professional. Do not paste passwords or card numbers.

## 1 — Business summary
- Business name: ${fmt(business.businessName)}
- Category: ${fmt(business.category)}
- Description: ${fmt(business.description)}
- Target customers: ${fmt(business.targetCustomers)}
- Location / service area: ${fmt(business.location || business.address)} | Service areas: ${fmt(business.serviceAreas)}
- Address: ${fmt(business.address)}
- Hours: ${fmt(business.hoursDetail)}
- Delivery / pickup notes: ${fmt(business.deliveryNotes)}
- Primary goal: ${fmt(business.primaryGoal)}
- Current status: ${fmt(business.currentStatus)}

## 2 — Website goals
- Main reason (primary goal): ${fmt(business.primaryGoal)}
- Primary customer action: ${journeyLabel}
- Required pages (from website needs): ${(business.needs ?? []).join(", ") || "— not yet chosen —"}
- Required features / needs: ${(business.needs ?? []).join(", ") || "— not yet chosen —"}
- Website approach: ${fmt(platform)}
- Policies needed: ${(business.policiesNeeded ?? []).join(", ") || "— none checked —"}

## 3 — Brand / content readiness
- Logo available: ${fmt(business.logoAvailable)}
- Photos ready: ${fmt(business.photoReady)}
- Testimonials available: ${fmt(business.testimonialsAvailable)}
- Brand colors: ${fmt(business.brandColors)}
- What makes you different: ${fmt(business.differentiator)}
- Qualifications: ${fmt(business.qualifications)}
- Social links: ${fmt(business.socialLinks)}
- Content drafts:
${draftSummary}
- Writing differentiator proof: ${fmt(business.differentiator || business.description)}

## 4 — Domain / technical status
- Preferred domain: ${preferred}
- Domain purchased?: ${purchased}
- Owned domain: ${fmt(business.ownedDomain)}
- Registrar / provider: ${registrar}
- DNS provider: ${fmt(ownership.dnsProvider)}
- Platform / host: ${fmt(ownership.websitePlatform || business.websiteApproach)}
- Existing website status: ${existing}
- Business email: ${email} — status: ${emailStatus}
- Email provider: ${fmt(ownership.emailProvider)}
- Analytics account: ${fmt(ownership.analyticsAccount)}
- Shortlist (from Domain finder):
${shortlistLines}
- Reminder: DNS and email records are separate. Screenshot current settings before changing. Do not delete MX/SPF/DKIM/DMARC records when connecting a website.

## 5 — Project scope / open tasks
- Progress: ${completed.length}/${tasks.length} tasks complete (${tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0}% overall); ${readiness.completedRequiredTasks}/${readiness.totalRequiredTasks} required complete
- Completed tasks:
${completed.length ? completed.map((t) => `- [${t.phase}] ${t.title} (${t.importance})`).join("\n") : "- None yet"}
- Open required tasks (must review before launch):
${openRequired.length ? openRequired.map((t) => `- [${t.phase}] ${t.title}: ${t.description}`).join("\n") : "- None — all required tasks complete"}
- Open recommended tasks:
${
  openRecommended.length
    ? openRecommended
        .slice(0, 8)
        .map((t) => `- ${t.title}`)
        .join("\n")
    : "- None or not applicable"
}
- Launch blockers (from readiness):
${blockers}
- Journey test status (${journeyLabel}): ${journeyStatus}
${journeySteps.length ? journeySteps.map((s) => `  - ${s.label}: ${s.status}${s.note ? ` — ${s.note.slice(0, 80)}` : ""}`).join("\n") : ""}
- Items to quote (quote open required tasks + blockers):
${openRequired.length ? openRequired.map((t) => `- ${t.title}`).join("\n") : "- No required tasks outstanding — quote remaining recommended and improvements"}

## 6 — Ownership / access checklist  —  Keep ownership with the business
- Domain is registered in an account the business controls: [ ]
- Website hosting/platform is in the business owner's account: [ ]
- Business email recovery is set to a business-controlled address: [ ]
- A second trusted owner or admin is recorded: [ ]
- No passwords or card numbers are pasted in this brief: [ ]
- Only the required access is granted, and it will be revoked after handoff: [ ]

  Detail snapshot: Domain registrar: ${registrar}; Renewal date: ${fmt(ownership.renewalDate)}; Recovery contact: ${fmt(ownership.recoveryOwner)}; Notes: ${fmt(ownership.notes)}

## 7 — Questions to ask the professional
${QUESTIONS.map((q, i) => `${i + 1}. ${q}`).join("\n")}

---
This brief was generated locally in your browser from Business Profile, Onboarding, Domain Shortlist, Launch Plan, Content Builder, Customer Journey Tester, and Ownership Record. It stays on your device — share by copying, printing, or downloading. Review any pricing or legal points with the professional before signing.
`;
}

function HireHelpPage() {
  const { state, hydrated } = useStore();
  const b = state.business;
  const tasks = state.tasks;
  const ownership = state.ownership;
  const shortlist = useMemo(() => state.savedDomainIdeas ?? [], [state.savedDomainIdeas]);
  const preferredFromShortlist = shortlist.find((d) => d.status === "preferred")?.domain ?? "";

  const readiness = useMemo(
    () => getReadiness(tasks, b, ownership, state.customerJourneyTest),
    [tasks, b, ownership, state.customerJourneyTest],
  );

  const [ownershipChecks, setOwnershipChecks] = useState<Record<string, boolean>>({});
  const [questionChecks, setQuestionChecks] = useState<Record<number, boolean>>({});
  const [showPreview, setShowPreview] = useState(false);

  const missingEssentials: string[] = [];
  if (!b.businessName.trim()) missingEssentials.push("business name");
  if (!b.category.trim()) missingEssentials.push("category");
  if (!b.description.trim()) missingEssentials.push("description");
  if (!b.primaryGoal.trim()) missingEssentials.push("primary goal");
  if (!b.primaryCustomerAction) missingEssentials.push("primary customer action");
  const hasPreferred = Boolean(b.preferredDomain.trim() || preferredFromShortlist);
  if (!hasPreferred) missingEssentials.push("preferred domain");
  const hasNeeds = (b.needs ?? []).length > 0;
  if (!hasNeeds) missingEssentials.push("website needs");

  const isMissingState =
    !state.onboardingComplete || tasks.length === 0 || missingEssentials.length >= 2;

  const briefText = useMemo(
    () =>
      buildBriefText({
        business: b,
        tasks,
        ownership,
        drafts: state.drafts ?? {},
        savedDomains: shortlist,
        journey: state.customerJourneyTest,
        readiness,
      }),
    [b, tasks, ownership, state.drafts, shortlist, state.customerJourneyTest, readiness],
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(briefText);
      toast.success("Brief copied to clipboard. Paste directly to your professional.");
    } catch {
      toast.error("Copy failed — select the preview text and copy manually.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = (ext: "txt" | "md") => {
    const blob = new Blob([briefText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `website-brief-${
      (b.businessName || "business")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .slice(0, 30) || "brief"
    }.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded as .${ext}. This file stays on your device.`);
  };

  if (!hydrated) {
    return (
      <AppShell
        title="Share your website plan with a professional"
        description="Create a clear project brief from the work you have already completed. Keep domain, website, email, and payment accounts under business-owner control."
      >
        <div className="surface-panel p-6 text-sm text-muted-foreground">Loading your brief…</div>
      </AppShell>
    );
  }

  const completedCount = tasks.filter((t) => t.status === "complete").length;
  const openRequired = tasks.filter((t) => t.importance === "required" && t.status !== "complete");
  const journeyLabel = state.customerJourneyTest?.journeyType
    ? state.customerJourneyTest.journeyType === "custom" &&
      state.customerJourneyTest.customJourneyLabel
      ? state.customerJourneyTest.customJourneyLabel
      : (JOURNEY_DEFINITIONS[state.customerJourneyTest.journeyType as CustomerJourneyType]?.label ??
        state.customerJourneyTest.journeyType)
    : b.primaryCustomerAction
      ? (JOURNEY_DEFINITIONS[b.primaryCustomerAction as CustomerJourneyType]?.label ??
        b.primaryCustomerAction)
      : "— not yet chosen —";

  return (
    <AppShell
      title="Share your website plan with a professional"
      description="Create a clear project brief from the work you have already completed. Keep domain, website, email, and payment accounts under business-owner control."
    >
      <style>{`@media print { body { background: white !important; } .print\\:hidden { display: none !important; } #handoff-brief { box-shadow: none !important; border: none !important; } }`}</style>

      <div className="space-y-6">
        {/* Local-only + export bar */}
        <section className="surface-panel p-5 sm:p-6 print:hidden">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold flex items-center gap-2">
                <FileText className="size-5 text-primary" aria-hidden="true" /> Your handoff brief
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Compiled from Business Profile, Onboarding, Domain Shortlist, Launch Plan, Content
                Builder, Customer Journey Tester and Ownership Record — editable via those pages.
              </p>
            </div>
            <Badge variant="outline" className="shrink-0">
              {tasks.length ? `${completedCount}/${tasks.length} tasks` : "No plan yet"} ·{" "}
              {readiness.status.replace("_", " ")}
            </Badge>
          </div>

          <Callout tone="info" title="This brief stays in your browser" className="mt-4">
            <p>
              Nothing is sent to a server. Use Copy, Print/Save as PDF, or Download and share the
              file or printed page directly with your chosen professional. Do not paste passwords or
              card numbers — use collaborator/admin access instead.
            </p>
          </Callout>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={handleCopy}>
              <Copy className="size-4" aria-hidden="true" /> Copy brief to clipboard
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="size-4" aria-hidden="true" /> Print / Save as PDF
            </Button>
            <Button variant="outline" onClick={() => handleDownload("txt")}>
              <Download className="size-4" aria-hidden="true" /> Download as .txt
            </Button>
            <Button variant="outline" onClick={() => handleDownload("md")}>
              <Download className="size-4" aria-hidden="true" /> Download as .md
            </Button>
            <Button variant="secondary" onClick={() => setShowPreview(true)}>
              <Eye className="size-4" aria-hidden="true" /> Preview
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Print uses your browser&apos;s print dialog — choose “Save as PDF” as the destination if
            you need a PDF. Downloads are created locally on your device.
          </p>
        </section>

        {/* Missing info guided completion */}
        {isMissingState ? (
          <section
            aria-labelledby="missing-info"
            className="rounded-xl border border-warning/40 bg-warning-soft p-5 print:hidden"
          >
            <h2
              id="missing-info"
              className="font-display text-base font-bold flex items-center gap-2"
            >
              <AlertTriangle className="size-5 text-warning-foreground" aria-hidden="true" />{" "}
              Complete a few details for a stronger brief
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your brief is ready to share as-is, but adding essentials helps a professional quote
              accurately.
              {missingEssentials.length ? ` Missing: ${missingEssentials.join(", ")}.` : ""}
              {tasks.length === 0 ? " No launch plan yet." : ""}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link to="/business-profile">Business Profile</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/domains">Preferred domain</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/business-profile">Website goals</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/checklist">Checklist</Link>
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Tip: Pick a preferred domain in the Domain finder (mark one as Preferred) and choose
              your primary customer action in Business Profile → Contact &amp; action. Both appear
              in sections 2 and 4 below.
            </p>
          </section>
        ) : null}

        {/* Brief */}
        <div
          id="handoff-brief"
          className="space-y-6 bg-card print:bg-white"
          aria-label="Project brief preview"
        >
          {/* 1 Business summary */}
          <section aria-labelledby="brief-1" className="surface-panel p-5 sm:p-6">
            <h2
              id="brief-1"
              className="font-display text-lg font-bold flex items-center gap-2 border-b border-border pb-3"
            >
              <Building2 className="size-5 text-primary" aria-hidden="true" /> 1 · Business summary
            </h2>
            <p className="mt-2 text-xs text-muted-foreground">
              From Business Profile and Onboarding ·{" "}
              <Link to="/business-profile" className="underline underline-offset-4 print:hidden">
                Edit
              </Link>
            </p>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              {[
                ["Business name", b.businessName],
                ["Category", b.category],
                ["Description", b.description],
                ["Target customers", b.targetCustomers],
                [
                  "Location / service area",
                  [b.location, b.serviceAreas].filter(Boolean).join(" · "),
                ],
                ["Address", b.address],
                ["Primary goal", b.primaryGoal],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-border bg-muted/30 p-3">
                  <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    {k}
                  </dt>
                  <dd className="mt-1 font-medium wrap-break-word">{fmt(v as string)}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Hours &amp; delivery
                </p>
                <p className="mt-1 wrap-break-word">
                  {fmt(b.hoursDetail)} · {fmt(b.deliveryNotes)}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Contact summary
                </p>
                <p className="mt-1 wrap-break-word">
                  {fmt(
                    [
                      b.phone && `Phone: ${b.phone}`,
                      b.whatsappNumber && `WhatsApp: ${b.whatsappNumber}`,
                      b.businessEmail && `Email: ${b.businessEmail}`,
                      b.contactFormUrl && `Form: ${b.contactFormUrl}`,
                      b.bookingUrl && `Booking: ${b.bookingUrl}`,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "",
                  )}
                </p>
              </div>
            </div>
          </section>

          {/* 2 Website goals */}
          <section aria-labelledby="brief-2" className="surface-panel p-5 sm:p-6">
            <h2
              id="brief-2"
              className="font-display text-lg font-bold flex items-center gap-2 border-b border-border pb-3"
            >
              <Target className="size-5 text-primary" aria-hidden="true" /> 2 · Website goals
            </h2>
            <p className="mt-2 text-xs text-muted-foreground">
              Main reason, primary action, pages &amp; features ·{" "}
              <Link to="/business-profile" className="underline underline-offset-4 print:hidden">
                Edit
              </Link>{" "}
              ·{" "}
              <Link to="/onboarding" className="underline underline-offset-4 print:hidden">
                Onboarding
              </Link>
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Main reason
                </p>
                <p className="mt-1 font-medium wrap-break-word">{fmt(b.primaryGoal)}</p>
                <p className="mt-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Primary customer action
                </p>
                <p className="mt-1 wrap-break-word flex items-center gap-2">
                  {journeyLabel}{" "}
                  {b.primaryCustomerAction ? (
                    <Badge variant="outline" className="text-[11px]">
                      {JOURNEY_DEFINITIONS[b.primaryCustomerAction as CustomerJourneyType]?.label ??
                        b.primaryCustomerAction}
                    </Badge>
                  ) : null}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Required pages &amp; features (from needs)
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(b.needs ?? []).length ? (
                    b.needs.map((n) => (
                      <Badge key={n} variant="outline" className="font-normal">
                        {n}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">— not yet chosen —</span>
                  )}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Pages derive from Build phase tasks; features are your Onboarding “website needs”.
                </p>
              </div>
            </div>
            <div className="mt-3 rounded-xl border border-border p-3 text-sm">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                What “done” looks like for the helper
              </p>
              <p className="mt-1 text-muted-foreground wrap-break-word">
                {b.timeline ? `Timeline: ${b.timeline}.` : ""}{" "}
                {b.buildPreference ? ` Build preference: ${b.buildPreference}.` : ""}{" "}
                {b.websiteApproach ? ` Approach: ${b.websiteApproach}.` : ""}
                {!b.timeline && !b.buildPreference
                  ? "— Ask timeline and build approach when quoting."
                  : ""}
              </p>
            </div>
          </section>

          {/* 3 Brand / content readiness */}
          <section aria-labelledby="brief-3" className="surface-panel p-5 sm:p-6">
            <h2
              id="brief-3"
              className="font-display text-lg font-bold flex items-center gap-2 border-b border-border pb-3"
            >
              <Palette className="size-5 text-primary" aria-hidden="true" /> 3 · Brand &amp; content
              readiness
            </h2>
            <p className="mt-2 text-xs text-muted-foreground">
              Logo, photos, drafts, testimonials ·{" "}
              <Link to="/content" className="underline underline-offset-4 print:hidden">
                Content Builder
              </Link>{" "}
              ·{" "}
              <Link to="/business-profile" className="underline underline-offset-4 print:hidden">
                Brand &amp; trust
              </Link>
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                ["Logo", b.logoAvailable || "— not recorded —"],
                ["Photos", b.photoReady || "— not recorded —"],
                ["Testimonials", b.testimonialsAvailable || "— not recorded —"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="rounded-xl border border-border bg-muted/30 p-3 text-center"
                >
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    {k}
                  </p>
                  <p className="mt-1 text-sm font-medium capitalize">{v}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border p-3 text-sm">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Differentiator / proof
                </p>
                <p className="mt-1 wrap-break-word">{fmt(b.differentiator || b.description)}</p>
                <p className="mt-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Brand colors &amp; assets
                </p>
                <p className="mt-1 wrap-break-word">
                  {fmt(b.brandColors)}{" "}
                  {b.brandAssets?.length ? `· ${b.brandAssets.join(", ")}` : ""}
                </p>
              </div>
              <div className="rounded-xl border border-border p-3 text-sm">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Content drafts
                </p>
                {Object.keys(state.drafts ?? {}).length === 0 ? (
                  <p className="mt-1 text-muted-foreground">
                    No drafts saved yet — start in Content Builder.
                  </p>
                ) : (
                  <ul className="mt-1 space-y-1">
                    {Object.entries(state.drafts).map(([page, draft]) => (
                      <li key={page} className="flex justify-between gap-2">
                        <span className="font-medium capitalize">{page}</span>
                        <span className="text-xs text-muted-foreground">
                          {draft.updatedAt ? new Date(draft.updatedAt).toLocaleDateString() : "—"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Social &amp; qualifications
                </p>
                <p className="mt-1 wrap-break-word text-muted-foreground">
                  {fmt(b.socialLinks)} · {fmt(b.qualifications)}
                </p>
              </div>
            </div>
          </section>

          {/* 4 Domain / technical status */}
          <section aria-labelledby="brief-4" className="surface-panel p-5 sm:p-6">
            <h2
              id="brief-4"
              className="font-display text-lg font-bold flex items-center gap-2 border-b border-border pb-3"
            >
              <Globe className="size-5 text-primary" aria-hidden="true" /> 4 · Domain &amp;
              technical status
            </h2>
            <p className="mt-2 text-xs text-muted-foreground">
              Preferred domain, registrar, platform, email ·{" "}
              <Link to="/domains" className="underline underline-offset-4 print:hidden">
                Domain finder
              </Link>{" "}
              ·{" "}
              <Link to="/ownership-record" className="underline underline-offset-4 print:hidden">
                Ownership
              </Link>
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-muted/30 p-3 text-sm">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Preferred domain
                </p>
                <p className="mt-1 font-medium wrap-break-word">
                  {b.preferredDomain || preferredFromShortlist || "— not yet chosen —"}
                  {preferredFromShortlist && !b.preferredDomain ? (
                    <span className="text-xs text-muted-foreground"> (from shortlist)</span>
                  ) : null}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Purchased: {b.domainPurchased || "— not recorded —"} · Owned domain:{" "}
                  {fmt(b.ownedDomain)}
                </p>
                {shortlist.length ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {shortlist.slice(0, 4).map((d) => (
                      <Badge
                        key={d.id}
                        variant={d.status === "preferred" ? "default" : "outline"}
                        className="text-[11px]"
                      >
                        {d.domain} · {d.status}
                      </Badge>
                    ))}
                    {shortlist.length > 4 ? (
                      <Badge variant="outline" className="text-[11px]">
                        +{shortlist.length - 4} more
                      </Badge>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-3 text-sm">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Registrar &amp; platform
                </p>
                <p className="mt-1 wrap-break-word">
                  Registrar: {fmt(b.registrarName || ownership.domainRegistrar)}
                </p>
                <p className="wrap-break-word">DNS provider: {fmt(ownership.dnsProvider)}</p>
                <p className="wrap-break-word">
                  Website platform: {fmt(ownership.websitePlatform || b.websiteApproach)}
                </p>
                <p className="wrap-break-word">Existing website: {fmt(b.existingWebsiteStatus)}</p>
              </div>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border p-3 text-sm">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Business email
                </p>
                <p className="mt-1 wrap-break-word">
                  {fmt(b.businessEmail)} · {fmt(b.businessEmailStatus)}
                </p>
                <p className="wrap-break-word text-xs text-muted-foreground">
                  Provider: {fmt(ownership.emailProvider)} · Registrar renewal:{" "}
                  {fmt(ownership.renewalDate)}
                </p>
              </div>
              <div className="rounded-xl border border-warning/30 bg-warning-soft/30 p-3 text-sm">
                <p className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="size-4 text-warning-foreground" aria-hidden="true" />{" "}
                  DNS / email reminder
                </p>
                <p className="mt-1 text-muted-foreground">
                  Screenshot current DNS before changes. Keep website records and mail records
                  separate — do not delete MX/SPF/DKIM/DMARC when connecting a domain. Test email
                  send and receive after any DNS change.
                </p>
              </div>
            </div>
          </section>

          {/* 5 Project scope / open tasks */}
          <section aria-labelledby="brief-5" className="surface-panel p-5 sm:p-6">
            <h2
              id="brief-5"
              className="font-display text-lg font-bold flex items-center gap-2 border-b border-border pb-3"
            >
              <ListChecks className="size-5 text-primary" aria-hidden="true" /> 5 · Project scope
              &amp; open tasks
            </h2>
            <p className="mt-2 text-xs text-muted-foreground">
              From Launch Plan &amp; Checklist ·{" "}
              <Link to="/checklist" className="underline underline-offset-4 print:hidden">
                Checklist
              </Link>{" "}
              ·{" "}
              <Link to="/customer-journey" className="underline underline-offset-4 print:hidden">
                Journey tester
              </Link>
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-muted/30 p-3 text-center">
                <p className="text-2xl font-bold">{completedCount}</p>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Completed
                </p>
                <p className="text-xs text-muted-foreground">of {tasks.length} total</p>
              </div>
              <div className="rounded-xl border border-warning/30 bg-warning-soft/30 p-3 text-center">
                <p className="text-2xl font-bold">{openRequired.length}</p>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Open required
                </p>
                <p className="text-xs text-muted-foreground">must do before launch</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-3 text-center">
                <p className="text-2xl font-bold">{readiness.blockers.length}</p>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Launch blockers
                </p>
                <p className="text-xs text-muted-foreground">
                  {readiness.status.replace("_", " ")}
                </p>
              </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border p-3">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Completed tasks
                </p>
                {tasks.filter((t) => t.status === "complete").length === 0 ? (
                  <p className="mt-1 text-sm text-muted-foreground">None yet.</p>
                ) : (
                  <ul className="mt-2 space-y-1 text-sm">
                    {tasks
                      .filter((t) => t.status === "complete")
                      .slice(0, 6)
                      .map((t) => (
                        <li key={t.id} className="flex gap-2 wrap-break-word">
                          <CheckCircle2
                            className="size-4 shrink-0 text-success"
                            aria-hidden="true"
                          />
                          <span>
                            {t.title}{" "}
                            <span className="text-xs text-muted-foreground">({t.phase})</span>
                          </span>
                        </li>
                      ))}
                    {tasks.filter((t) => t.status === "complete").length > 6 ? (
                      <li className="text-xs text-muted-foreground">
                        + {tasks.filter((t) => t.status === "complete").length - 6} more — see full
                        checklist.
                      </li>
                    ) : null}
                  </ul>
                )}
              </div>
              <div className="rounded-xl border border-border p-3">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Open required tasks &amp; blockers to quote
                </p>
                {openRequired.length === 0 && readiness.blockers.length === 0 ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    No required tasks outstanding — quote remaining recommended improvements and
                    support.
                  </p>
                ) : (
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {openRequired.slice(0, 5).map((t) => (
                      <li key={t.id} className="wrap-break-word">
                        • {t.title}{" "}
                        <span className="text-xs text-muted-foreground">
                          — {t.description.slice(0, 80)}
                        </span>
                      </li>
                    ))}
                    {readiness.blockers.slice(0, 3).map((b_) => (
                      <li key={b_.id} className="wrap-break-word">
                        • <span className="font-medium">Blocker:</span> {b_.title}{" "}
                        <span className="text-xs text-muted-foreground">[{b_.severity}]</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-border p-3">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Journey test status — {journeyLabel}
              </p>
              {state.customerJourneyTest ? (
                <div className="mt-2 text-sm">
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className={
                        state.customerJourneyTest.steps.every((s) => s.status === "passed")
                          ? "border-success/30 text-success"
                          : state.customerJourneyTest.steps.some((s) => s.status === "blocked")
                            ? "border-destructive/30 text-destructive"
                            : "border-warning/30 text-warning-foreground"
                      }
                    >
                      {state.customerJourneyTest.steps.every((s) => s.status === "passed")
                        ? "All passed"
                        : state.customerJourneyTest.steps.some((s) => s.status === "blocked")
                          ? "Blocked"
                          : state.customerJourneyTest.steps.some(
                                (s) => s.status === "needs_improvement",
                              )
                            ? "Needs improvement"
                            : "Partial"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {state.customerJourneyTest.steps.filter((s) => s.status === "passed").length}/
                      {state.customerJourneyTest.steps.length} passed · last{" "}
                      {new Date(state.customerJourneyTest.lastUpdatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    {state.customerJourneyTest.steps.slice(0, 4).map((s) => (
                      <li key={s.id} className="wrap-break-word">
                        {s.label}: <em>{s.status.replace("_", " ")}</em>
                        {s.note ? ` — ${s.note.slice(0, 60)}` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">
                  No journey test saved yet. Test your primary action on a real phone in the Journey
                  tester.
                </p>
              )}
            </div>
          </section>

          {/* 6 Ownership / access checklist */}
          <section
            aria-labelledby="brief-6"
            className="rounded-xl border-2 border-warning/40 bg-warning-soft p-5 sm:p-6"
          >
            <h2
              id="brief-6"
              className="font-display text-lg font-bold flex items-center gap-2 text-warning-foreground"
            >
              <ShieldCheck className="size-5" aria-hidden="true" /> 6 · Keep ownership with the
              business
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              High-visibility safety checklist — confirm each item before granting access. The
              business owner stays in control of the accounts that the business depends on.
            </p>
            <div className="mt-4 grid gap-3">
              {OWNERSHIP_ITEMS.map((item) => (
                <Label
                  key={item.id}
                  htmlFor={`own-check-${item.id}`}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-warning/30 bg-card p-3 text-sm font-normal"
                >
                  <Checkbox
                    id={`own-check-${item.id}`}
                    checked={Boolean(ownershipChecks[item.id])}
                    onCheckedChange={(v) =>
                      setOwnershipChecks((p) => ({ ...p, [item.id]: Boolean(v) }))
                    }
                    aria-label={item.label}
                  />
                  <span className="flex-1">
                    <span className="font-medium">{item.label}</span>
                    <span className="block text-xs text-muted-foreground">{item.hint}</span>
                  </span>
                </Label>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">Current record snapshot</p>
              <p className="mt-1 wrap-break-word">
                Registrar: {fmt(ownership.domainRegistrar || b.registrarName)} · Renewal:{" "}
                {fmt(ownership.renewalDate)} · DNS: {fmt(ownership.dnsProvider)} · Platform:{" "}
                {fmt(ownership.websitePlatform || b.websiteApproach)} · Recovery:{" "}
                {fmt(ownership.recoveryOwner)} · Email provider: {fmt(ownership.emailProvider)}
              </p>
              <p className="mt-1">
                Full detail:{" "}
                <Link to="/ownership-record" className="underline underline-offset-4 print:hidden">
                  Ownership record
                </Link>{" "}
                · No passwords or card numbers belong here or in this brief.
              </p>
            </div>
          </section>

          {/* 7 Questions to ask */}
          <section aria-labelledby="brief-7" className="surface-panel p-5 sm:p-6">
            <h2
              id="brief-7"
              className="font-display text-lg font-bold flex items-center gap-2 border-b border-border pb-3"
            >
              <HelpCircle className="size-5 text-primary" aria-hidden="true" /> 7 · Questions to ask
              the professional
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Use this static checklist in your meeting. Check off what you have asked — clarity now
              prevents disputes later.
            </p>
            <ol className="mt-4 space-y-3">
              {QUESTIONS.map((q, idx) => (
                <li key={idx}>
                  <Label
                    htmlFor={`q-${idx}`}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-muted/30 p-3 text-sm font-normal"
                  >
                    <Checkbox
                      id={`q-${idx}`}
                      checked={Boolean(questionChecks[idx])}
                      onCheckedChange={(v) =>
                        setQuestionChecks((p) => ({ ...p, [idx]: Boolean(v) }))
                      }
                      aria-label={`Question ${idx + 1}: ${q}`}
                    />
                    <span className="flex-1">
                      <span className="font-medium">
                        {idx + 1}. {q}
                      </span>
                    </span>
                  </Label>
                </li>
              ))}
            </ol>
            <div className="mt-4 rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              Also ask to see two recent live examples you can visit yourself, and get scope, price
              and timeline in writing before paying.
            </div>
          </section>

          {/* Footer share guidance */}
          <section className="surface-panel p-5 text-sm print:break-inside-avoid">
            <h2 className="font-display text-base font-semibold">How to share this brief</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>Copy to clipboard and paste into an email or message to your professional.</li>
              <li>
                Print and choose “Save as PDF” in the print dialog, or hand over a printed copy.
              </li>
              <li>Download as .txt or .md — both are plain text created locally on your device.</li>
            </ul>
            <p className="mt-3 rounded-xl border border-primary/20 bg-primary-soft/30 p-3 text-xs">
              This brief stays in your browser. Nothing is sent to a server, emailed automatically,
              or turned into a PDF by a backend service. You control the file. Review pricing,
              contracts and provider terms yourself — this is general guidance, not legal advice.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 print:hidden">
              <Button asChild variant="outline" size="sm">
                <Link to="/business-profile">Review business profile</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/ownership-record">Fill in your ownership record</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/checklist">
                  Back to your checklist <ExternalLink className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </section>
        </div>

        {/* Preview dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Brief preview</DialogTitle>
              <DialogDescription>
                Local-only preview. Copy, print, or download from the main page. Works in light,
                dark and system themes.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-muted/30 p-4 text-xs leading-relaxed">
                {briefText}
              </pre>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={handleCopy}>
                  <Copy className="size-4" aria-hidden="true" /> Copy brief to clipboard
                </Button>
                <Button size="sm" variant="outline" onClick={handlePrint}>
                  <Printer className="size-4" aria-hidden="true" /> Print / Save as PDF
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDownload("txt")}>
                  <Download className="size-4" aria-hidden="true" /> Download .txt
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDownload("md")}>
                  <Download className="size-4" aria-hidden="true" /> Download .md
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This brief stays in your browser — nothing is uploaded or emailed by a service.
                Share the file or printed page with your professional directly.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
