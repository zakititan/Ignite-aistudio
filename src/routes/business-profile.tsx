import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Building2,
  MapPin,
  Phone,
  Palette,
  Globe,
  HardDrive,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Callout } from "@/components/Callouts";
import { useStore } from "@/lib/store";
import { CATEGORIES, GOALS } from "@/lib/plan";
import { JOURNEY_DEFINITIONS } from "@/lib/customer-journey";
import type { CustomerJourneyType } from "@/lib/types";

export const Route = createFileRoute("/business-profile")({
  head: () => ({
    meta: [
      { title: "Business profile — your unified workspace" },
      {
        name: "description",
        content:
          "One place for your business basics, location, contact, brand and online setup. Completion shows what is missing and where it is used downstream.",
      },
      { property: "og:title", content: "Your business profile" },
    ],
  }),
  component: BusinessProfilePage,
});

const CONTACT_METHODS = [
  "Phone",
  "WhatsApp",
  "Email",
  "Contact form",
  "Booking link",
  "Store / checkout",
  "Visit in person",
];
const WEBSITE_APPROACHES = [
  "Website builder (guided)",
  "WordPress / CMS",
  "Hire a professional",
  "Existing platform — improving",
  "Not sure yet",
];
const EXISTING_WEBSITE_STATUSES = [
  "I have nothing yet",
  "I have a business name but no domain",
  "I already own a domain",
  "I have a website but need help improving it",
  "Someone else manages my website/domain",
  "I have social-media pages only",
];
const EMAIL_STATUSES = [
  "Needs setup",
  "Already set up",
  "Using personal email for now",
  "Not needed",
];
const YES_NO_UNSURE = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unsure", label: "Not sure" },
] as const;
const POLICIES = [
  "Privacy",
  "Terms",
  "Returns / refunds",
  "Cookies",
  "Shipping / delivery",
] as const;

function SectionCard({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="surface-panel space-y-4 p-5">
      <div>
        <h3 className="font-display text-base font-semibold">{title}</h3>
        {hint ? <p className="mt-1 text-sm text-muted-foreground">{hint}</p> : null}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function fieldFilled(v: unknown): boolean {
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "string") return v.trim().length > 0;
  if (typeof v === "boolean") return true; // boolean is always considered set (we track via related detail)
  return Boolean(v);
}

function BusinessProfilePage() {
  const { state, setBusiness } = useStore();
  const b = state.business;

  const shortlist = state.savedDomainIdeas ?? [];
  const preferredFromShortlist = shortlist.find((d) => d.status === "preferred")?.domain ?? "";

  // Overall completion across all business-profile fields
  const completion = useMemo(() => {
    const checks: { label: string; filled: boolean; section: string }[] = [
      { label: "Business name", filled: fieldFilled(b.businessName), section: "Basics" },
      { label: "Category", filled: fieldFilled(b.category), section: "Basics" },
      { label: "Description", filled: fieldFilled(b.description), section: "Basics" },
      { label: "Primary goal", filled: fieldFilled(b.primaryGoal), section: "Basics" },
      { label: "Target customers", filled: fieldFilled(b.targetCustomers), section: "Basics" },
      { label: "Services / products", filled: fieldFilled(b.servicesOffered), section: "Basics" },
      { label: "Differentiator", filled: fieldFilled(b.differentiator), section: "Basics" },

      { label: "Customer model", filled: fieldFilled(b.customerModel), section: "Location" },
      { label: "City / region / country", filled: fieldFilled(b.location), section: "Location" },
      { label: "Service areas", filled: fieldFilled(b.serviceAreas), section: "Location" },
      {
        label: "Business hours detail",
        filled: !b.hasBusinessHours || fieldFilled(b.hoursDetail),
        section: "Location",
      },
      {
        label: "Delivery / pickup notes",
        filled: fieldFilled(b.deliveryNotes) || !fieldFilled(b.serviceAreas),
        section: "Location",
      },
      { label: "Street address (optional)", filled: true, section: "Location" }, // optional, always counts as filled to avoid penalising

      {
        label: "Primary customer action",
        filled: fieldFilled(b.primaryCustomerAction),
        section: "Contact",
      },
      { label: "Phone", filled: fieldFilled(b.phone), section: "Contact" },
      { label: "WhatsApp", filled: fieldFilled(b.whatsappNumber), section: "Contact" },
      { label: "Business email", filled: fieldFilled(b.businessEmail), section: "Contact" },
      {
        label: "Preferred contact method",
        filled: fieldFilled(b.preferredContactMethod),
        section: "Contact",
      },
      // URLs are optional but at least one contact channel should be present for Contact completeness
      {
        label: "At least one contact link (form / booking / store)",
        filled:
          fieldFilled(b.contactFormUrl) ||
          fieldFilled(b.bookingUrl) ||
          fieldFilled(b.storeUrl) ||
          fieldFilled(b.phone) ||
          fieldFilled(b.businessEmail),
        section: "Contact",
      },

      { label: "Logo availability", filled: fieldFilled(b.logoAvailable), section: "Brand" },
      { label: "Brand colors", filled: fieldFilled(b.brandColors), section: "Brand" },
      { label: "Photo readiness", filled: fieldFilled(b.photoReady), section: "Brand" },
      { label: "Testimonials", filled: fieldFilled(b.testimonialsAvailable), section: "Brand" },
      { label: "Qualifications", filled: fieldFilled(b.qualifications), section: "Brand" },
      { label: "Social links", filled: fieldFilled(b.socialLinks), section: "Brand" },

      { label: "Website approach", filled: fieldFilled(b.websiteApproach), section: "Online" },
      {
        label: "Preferred domain",
        filled: fieldFilled(b.preferredDomain) || fieldFilled(preferredFromShortlist),
        section: "Online",
      },
      {
        label: "Domain purchased status",
        filled: fieldFilled(b.domainPurchased),
        section: "Online",
      },
      { label: "Registrar / provider", filled: fieldFilled(b.registrarName), section: "Online" },
      {
        label: "Existing website status",
        filled: fieldFilled(b.existingWebsiteStatus),
        section: "Online",
      },
      {
        label: "Business email status",
        filled: fieldFilled(b.businessEmailStatus),
        section: "Online",
      },
    ];
    const total = checks.length;
    const done = checks.filter((c) => c.filled).length;
    const percent = total ? Math.round((done / total) * 100) : 0;
    const missing = checks.filter((c) => !c.filled);
    const bySection: Record<string, { done: number; total: number }> = {};
    for (const c of checks) {
      if (!bySection[c.section]) bySection[c.section] = { done: 0, total: 0 };
      bySection[c.section]!.total += 1;
      if (c.filled) bySection[c.section]!.done += 1;
    }
    return { percent, done, total, missing, bySection, checks };
  }, [b, preferredFromShortlist]);

  const essentialsMissing: string[] = [];
  if (!b.businessName.trim()) essentialsMissing.push("business name");
  if (!b.description.trim()) essentialsMissing.push("description");
  if (
    b.customerModel !== "online" &&
    b.customerModel !== "" &&
    !b.location.trim() &&
    !b.address.trim()
  )
    essentialsMissing.push("location for local customers");
  const hasContact =
    Boolean(b.primaryCustomerAction) ||
    Boolean(b.phone.trim()) ||
    Boolean(b.whatsappNumber.trim()) ||
    Boolean(b.businessEmail.trim()) ||
    Boolean(b.contactFormUrl.trim()) ||
    Boolean(b.bookingUrl.trim()) ||
    Boolean(b.storeUrl.trim());
  if (!hasContact) essentialsMissing.push("primary customer action or contact method");

  return (
    <AppShell
      title="Business profile"
      description="One workspace for the details every other page relies on. Changes save automatically and flow to dashboard, content, journey tester and handoff."
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/80 bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <HardDrive className="size-4 text-primary" aria-hidden="true" />
            <span>
              <strong className="text-foreground">Data is saved on this device.</strong> Changes
              save automatically as you type and pre-fill downstream tools.
            </span>
          </div>
          <Badge variant="outline" className="text-[11px] font-normal">
            Auto-save active
          </Badge>
        </div>

        {/* Completion header */}
        <section className="surface-panel p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold">Profile completion</h2>
              <p className="text-sm text-muted-foreground">
                {completion.done} of {completion.total} fields complete · used for greetings,
                content builder, journey defaults, get-found and hire-help handoff
              </p>
            </div>
            <Badge
              className={
                completion.percent === 100
                  ? "bg-success-soft text-success"
                  : "bg-primary-soft text-primary"
              }
            >
              {completion.percent}% complete
            </Badge>
          </div>
          <Progress
            value={completion.percent}
            className="mt-4"
            aria-label={`Business profile ${completion.percent} percent complete`}
          />
          {completion.missing.length ? (
            <div className="mt-4 rounded-xl border border-warning/25 bg-warning-soft/40 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <AlertTriangle className="size-4 text-warning" aria-hidden="true" />{" "}
                Missing: {completion.missing.map((m) => m.label).join(", ")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Fill these where you can. Essentials for launch readiness are:{" "}
                {essentialsMissing.length
                  ? essentialsMissing.join(", ")
                  : "all essentials present — readiness blocker will clear."}
              </p>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-success/20 bg-success-soft/40 p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-success">
                <CheckCircle2 className="size-4" aria-hidden="true" /> All profile fields have
                something recorded. Review for accuracy on a real phone.
              </p>
            </div>
          )}
          <div className="mt-4 grid gap-2 sm:grid-cols-5">
            {Object.entries(completion.bySection).map(([section, v]) => (
              <div
                key={section}
                className="rounded-xl border border-border bg-muted/30 p-3 text-center"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {section}
                </p>
                <p className="mt-1 text-sm font-bold">
                  {v.done}/{v.total}
                </p>
                <Progress value={Math.round((v.done / v.total) * 100)} className="mt-2 h-1.5" />
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Pre-filled from onboarding where possible. Edits here update downstream pages
            automatically. No passwords or secret keys — use a password manager for credentials.
          </p>
        </section>

        {essentialsMissing.length ? (
          <Callout tone="warning" title="Essentials need attention for launch readiness">
            Your launch readiness checker will stay blocked until you add:{" "}
            {essentialsMissing.join(", ")}. Fixing it here clears the blocker at{" "}
            <Link to="/dashboard" className="underline underline-offset-4">
              dashboard
            </Link>{" "}
            and{" "}
            <Link to="/checklist" className="underline underline-offset-4">
              checklist
            </Link>
            .
          </Callout>
        ) : null}

        <Tabs defaultValue="basics" className="space-y-4">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
            <TabsTrigger value="basics" className="gap-1.5">
              <Building2 className="size-4" aria-hidden="true" /> Basics
            </TabsTrigger>
            <TabsTrigger value="location" className="gap-1.5">
              <MapPin className="size-4" aria-hidden="true" /> Location
            </TabsTrigger>
            <TabsTrigger value="contact" className="gap-1.5">
              <Phone className="size-4" aria-hidden="true" /> Contact & action
            </TabsTrigger>
            <TabsTrigger value="brand" className="gap-1.5">
              <Palette className="size-4" aria-hidden="true" /> Brand & trust
            </TabsTrigger>
            <TabsTrigger value="online" className="gap-1.5">
              <Globe className="size-4" aria-hidden="true" /> Online setup
            </TabsTrigger>
          </TabsList>

          {/* A Basics */}
          <TabsContent value="basics" className="space-y-4">
            <SectionCard
              title="A · Business basics"
              hint="This feeds dashboard greetings, content builder prompts and get-found titles. Plain language wins over clever wording."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="bp-businessName">Business name *</Label>
                  <Input
                    id="bp-businessName"
                    value={b.businessName}
                    onChange={(e) => setBusiness({ businessName: e.target.value.slice(0, 100) })}
                    placeholder="Harbor & Hearth Bakery"
                  />
                  <p className="text-xs text-muted-foreground">
                    Shown on dashboard welcome and page titles.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bp-category">Category</Label>
                  <Select value={b.category} onValueChange={(v) => setBusiness({ category: v })}>
                    <SelectTrigger id="bp-category" aria-label="Business category">
                      <SelectValue placeholder="Choose closest match" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bp-description">Description *</Label>
                <Textarea
                  id="bp-description"
                  rows={3}
                  value={b.description}
                  onChange={(e) => setBusiness({ description: e.target.value.slice(0, 500) })}
                  placeholder="One or two sentences about what you sell, in words customers use."
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  {b.description.length}/500 · Used in content builder Home headline and ownership
                  handoff.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bp-primaryGoal">Primary goal</Label>
                <Select
                  value={b.primaryGoal}
                  onValueChange={(v) => setBusiness({ primaryGoal: v })}
                >
                  <SelectTrigger id="bp-primaryGoal" aria-label="Primary goal">
                    <SelectValue placeholder="Pick the single most important outcome" />
                  </SelectTrigger>
                  <SelectContent>
                    {GOALS.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Drives journey tester default and dashboard next step.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bp-targetCustomers">Target customers</Label>
                <Textarea
                  id="bp-targetCustomers"
                  rows={2}
                  value={b.targetCustomers}
                  onChange={(e) => setBusiness({ targetCustomers: e.target.value.slice(0, 500) })}
                  placeholder="Who is this for? e.g., Neighbours, offices ordering breakfast, couples planning cakes."
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  Helps content builder “Who is this for?” and get-found wording.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bp-servicesOffered">Services / products</Label>
                <Textarea
                  id="bp-servicesOffered"
                  rows={4}
                  value={b.servicesOffered}
                  onChange={(e) => setBusiness({ servicesOffered: e.target.value.slice(0, 1000) })}
                  placeholder="List what you offer, one per line, in customer words."
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground">
                  Feeds content Services page and hire-help handoff scope.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bp-differentiator">What makes you different</Label>
                <Textarea
                  id="bp-differentiator"
                  rows={2}
                  value={b.differentiator}
                  onChange={(e) => setBusiness({ differentiator: e.target.value.slice(0, 500) })}
                  placeholder="Why choose you? e.g., Sold on the day it is made, donated unsold each evening."
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  Used as proof on Home and About drafts.
                </p>
              </div>
            </SectionCard>

            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/content">Use in content builder →</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/get-found">Preview in get-found</Link>
              </Button>
            </div>
          </TabsContent>

          {/* B Location */}
          <TabsContent value="location" className="space-y-4">
            <SectionCard
              title="B · Location & service area"
              hint="For local and both models, accuracy here prevents wasted trips and helps local listings."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="bp-customerModel">Customer model</Label>
                  <Select
                    value={b.customerModel}
                    onValueChange={(v) =>
                      setBusiness({ customerModel: v as typeof b.customerModel })
                    }
                  >
                    <SelectTrigger id="bp-customerModel">
                      <SelectValue placeholder="local / online / both" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bp-location">City / region / country *</Label>
                  <Input
                    id="bp-location"
                    value={b.location}
                    onChange={(e) => setBusiness({ location: e.target.value.slice(0, 200) })}
                    placeholder="Mumbai, India"
                  />
                  <p className="text-xs text-muted-foreground">
                    Used for get-found sequence and page titles. Required if you serve local
                    customers.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bp-address">Street address (optional)</Label>
                <Input
                  id="bp-address"
                  value={b.address}
                  onChange={(e) => setBusiness({ address: e.target.value.slice(0, 300) })}
                  placeholder="412 Harbor Street, Mumbai (leave blank if you have no storefront)"
                />
                <p className="text-xs text-muted-foreground">
                  Only if customers visit you. Shown in contact drafts and ownership context.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bp-serviceAreas">Service areas</Label>
                <Textarea
                  id="bp-serviceAreas"
                  rows={2}
                  value={b.serviceAreas}
                  onChange={(e) => setBusiness({ serviceAreas: e.target.value.slice(0, 500) })}
                  placeholder="Where you deliver or visit customers — e.g., Fort, Colaba + delivery across inner Mumbai."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4">
                  <div>
                    <p className="text-sm font-medium">Customers visit a physical location</p>
                    <p className="text-xs text-muted-foreground">
                      Enables visit_location journey and local checklist
                    </p>
                  </div>
                  <Switch
                    checked={b.hasPhysicalLocation}
                    onCheckedChange={(checked) => setBusiness({ hasPhysicalLocation: checked })}
                    aria-label="Customers visit physical location"
                  />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4">
                  <div>
                    <p className="text-sm font-medium">You serve at customer location</p>
                    <p className="text-xs text-muted-foreground">Trades, home visits, delivery</p>
                  </div>
                  <Switch
                    checked={b.servesAtCustomerLocation}
                    onCheckedChange={(checked) =>
                      setBusiness({ servesAtCustomerLocation: checked })
                    }
                    aria-label="Serve at customer location"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4">
                <div>
                  <p className="text-sm font-medium">You have set business hours</p>
                  <p className="text-xs text-muted-foreground">If yes, describe below</p>
                </div>
                <Switch
                  checked={b.hasBusinessHours}
                  onCheckedChange={(checked) => setBusiness({ hasBusinessHours: checked })}
                  aria-label="Has business hours"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bp-hoursDetail">Business hours detail</Label>
                <Textarea
                  id="bp-hoursDetail"
                  rows={2}
                  value={b.hoursDetail}
                  onChange={(e) => setBusiness({ hoursDetail: e.target.value.slice(0, 500) })}
                  placeholder="Tue–Sat 7am–3pm, closed Sunday and Monday"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bp-deliveryNotes">Delivery / pickup notes</Label>
                <Textarea
                  id="bp-deliveryNotes"
                  rows={2}
                  value={b.deliveryNotes}
                  onChange={(e) => setBusiness({ deliveryNotes: e.target.value.slice(0, 500) })}
                  placeholder="Delivery within 5 km for ₹150; free pickup before 2pm. Mention cut-off times."
                />
              </div>
            </SectionCard>
          </TabsContent>

          {/* C Contact */}
          <TabsContent value="contact" className="space-y-4">
            <SectionCard
              title="C · Contact & customer action"
              hint="The single most important action drives journey tester defaults and readiness checks. Provide at least one reliable way to reach you."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="bp-primaryCustomerAction">Primary customer action *</Label>
                  <Select
                    value={b.primaryCustomerAction}
                    onValueChange={(v) =>
                      setBusiness({ primaryCustomerAction: v as CustomerJourneyType })
                    }
                  >
                    <SelectTrigger id="bp-primaryCustomerAction">
                      <SelectValue placeholder="Choose journey type" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(JOURNEY_DEFINITIONS) as CustomerJourneyType[]).map((t) => (
                        <SelectItem key={t} value={t}>
                          {JOURNEY_DEFINITIONS[t].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Sets default in customer-journey tester.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bp-preferredContactMethod">Preferred contact method</Label>
                  <Select
                    value={b.preferredContactMethod}
                    onValueChange={(v) => setBusiness({ preferredContactMethod: v })}
                  >
                    <SelectTrigger id="bp-preferredContactMethod">
                      <SelectValue placeholder="How should customers reach you first?" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTACT_METHODS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="bp-phone">Phone</Label>
                  <Input
                    id="bp-phone"
                    value={b.phone}
                    onChange={(e) => setBusiness({ phone: e.target.value.slice(0, 100) })}
                    placeholder="022 555 0134"
                    inputMode="tel"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bp-whatsapp">WhatsApp number</Label>
                  <Input
                    id="bp-whatsapp"
                    value={b.whatsappNumber}
                    onChange={(e) => setBusiness({ whatsappNumber: e.target.value.slice(0, 100) })}
                    placeholder="91 98765 43210"
                    inputMode="tel"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bp-businessEmail">Business email</Label>
                <Input
                  id="bp-businessEmail"
                  value={b.businessEmail}
                  onChange={(e) => setBusiness({ businessEmail: e.target.value.slice(0, 255) })}
                  placeholder="hello@yourbusiness.example"
                  type="email"
                />
                <p className="text-xs text-muted-foreground">
                  Shown in contact drafts. Keep the recovery email current in ownership record.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="bp-contactFormUrl">Contact form URL (optional)</Label>
                  <Input
                    id="bp-contactFormUrl"
                    value={b.contactFormUrl}
                    onChange={(e) => setBusiness({ contactFormUrl: e.target.value.slice(0, 500) })}
                    placeholder="https://yourbusiness.example/contact"
                    type="url"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bp-bookingUrl">Booking URL (optional)</Label>
                  <Input
                    id="bp-bookingUrl"
                    value={b.bookingUrl}
                    onChange={(e) => setBusiness({ bookingUrl: e.target.value.slice(0, 500) })}
                    placeholder="https://calendly.com/... or booking page"
                    type="url"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bp-storeUrl">Store / checkout URL (optional)</Label>
                <Input
                  id="bp-storeUrl"
                  value={b.storeUrl}
                  onChange={(e) => setBusiness({ storeUrl: e.target.value.slice(0, 500) })}
                  placeholder="https://yourbusiness.example/shop"
                  type="url"
                />
                <p className="text-xs text-muted-foreground">
                  If you sell online, link the shop so handoff and journey tests know where to go.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <Button asChild variant="outline" size="sm">
                  <Link to="/customer-journey">Test this action →</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/content">Populate contact page →</Link>
                </Button>
              </div>
            </SectionCard>
          </TabsContent>

          {/* D Brand */}
          <TabsContent value="brand" className="space-y-4">
            <SectionCard
              title="D · Brand & trust"
              hint="Honest proof beats stock images. Record what is ready and what needs work."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="bp-logoAvailable">Logo ready?</Label>
                  <Select
                    value={b.logoAvailable}
                    onValueChange={(v) => setBusiness({ logoAvailable: v as never })}
                  >
                    <SelectTrigger id="bp-logoAvailable">
                      <SelectValue placeholder="Yes / No / Not sure" />
                    </SelectTrigger>
                    <SelectContent>
                      {YES_NO_UNSURE.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bp-photoReady">Photos ready?</Label>
                  <Select
                    value={b.photoReady}
                    onValueChange={(v) => setBusiness({ photoReady: v as never })}
                  >
                    <SelectTrigger id="bp-photoReady">
                      <SelectValue placeholder="Yes / No / Not sure" />
                    </SelectTrigger>
                    <SelectContent>
                      {YES_NO_UNSURE.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="bp-brandColors">Brand colors</Label>
                  <Input
                    id="bp-brandColors"
                    value={b.brandColors}
                    onChange={(e) => setBusiness({ brandColors: e.target.value.slice(0, 300) })}
                    placeholder="Terracotta #C96A2B, cream #FFF8EC, charcoal #2B2B2B — or 'not chosen yet'"
                  />
                  <p className="text-xs text-muted-foreground">
                    Helps a designer or builder stay consistent.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bp-testimonials">Testimonials ready?</Label>
                  <Select
                    value={b.testimonialsAvailable}
                    onValueChange={(v) => setBusiness({ testimonialsAvailable: v as never })}
                  >
                    <SelectTrigger id="bp-testimonials">
                      <SelectValue placeholder="Yes / No / Not sure" />
                    </SelectTrigger>
                    <SelectContent>
                      {YES_NO_UNSURE.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bp-qualifications">Qualifications / credentials</Label>
                <Textarea
                  id="bp-qualifications"
                  rows={2}
                  value={b.qualifications}
                  onChange={(e) => setBusiness({ qualifications: e.target.value.slice(0, 500) })}
                  placeholder="e.g., 12 years baking, food safety certified, chamber member since 2018"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bp-socialLinks">Social links (one per line)</Label>
                <Textarea
                  id="bp-socialLinks"
                  rows={3}
                  value={b.socialLinks}
                  onChange={(e) => setBusiness({ socialLinks: e.target.value.slice(0, 1000) })}
                  placeholder="instagram.com/yourbusiness&#10;facebook.com/yourbusiness"
                />
                <p className="text-xs text-muted-foreground">
                  Used in contact drafts and handoff pack. No passwords — just public links.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Policies you need</Label>
                <p className="text-xs text-muted-foreground">
                  Check what applies if you collect data or take payments. Links to content
                  checklist.
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {POLICIES.map((pol) => (
                    <Label
                      key={pol}
                      htmlFor={`pol-${pol}`}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm font-medium"
                    >
                      <Checkbox
                        id={`pol-${pol}`}
                        checked={b.policiesNeeded.includes(pol)}
                        onCheckedChange={() =>
                          setBusiness({
                            policiesNeeded: b.policiesNeeded.includes(pol)
                              ? b.policiesNeeded.filter((p) => p !== pol)
                              : [...b.policiesNeeded, pol],
                          })
                        }
                      />
                      {pol}
                    </Label>
                  ))}
                </div>
              </div>
            </SectionCard>
          </TabsContent>

          {/* E Online */}
          <TabsContent value="online" className="space-y-4">
            <SectionCard
              title="E · Online setup"
              hint="Keep control of domain and email. Never store passwords here — record only names and statuses."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="bp-websiteApproach">Website approach</Label>
                  <Select
                    value={b.websiteApproach}
                    onValueChange={(v) => setBusiness({ websiteApproach: v })}
                  >
                    <SelectTrigger id="bp-websiteApproach">
                      <SelectValue placeholder="How will the site be built?" />
                    </SelectTrigger>
                    <SelectContent>
                      {WEBSITE_APPROACHES.map((w) => (
                        <SelectItem key={w} value={w}>
                          {w}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bp-existingWebsiteStatus">Existing website status</Label>
                  <Select
                    value={b.existingWebsiteStatus}
                    onValueChange={(v) => setBusiness({ existingWebsiteStatus: v })}
                  >
                    <SelectTrigger id="bp-existingWebsiteStatus">
                      <SelectValue placeholder="Where are you starting from?" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXISTING_WEBSITE_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="bp-preferredDomain">Preferred domain (from shortlist)</Label>
                  <Input
                    id="bp-preferredDomain"
                    value={b.preferredDomain}
                    onChange={(e) => setBusiness({ preferredDomain: e.target.value.slice(0, 200) })}
                    placeholder="yourbusiness.com"
                  />
                  {preferredFromShortlist ? (
                    <p className="text-xs text-muted-foreground">
                      Shortlist preferred:{" "}
                      <button
                        type="button"
                        className="underline underline-offset-4"
                        onClick={() => {
                          setBusiness({ preferredDomain: preferredFromShortlist });
                          toast.success(`Set preferred domain to ${preferredFromShortlist}`);
                        }}
                      >
                        Use {preferredFromShortlist}
                      </button>{" "}
                      ·{" "}
                      <Link to="/domains" className="underline underline-offset-4">
                        Manage shortlist
                      </Link>
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Pick a name in{" "}
                      <Link to="/domains" className="underline underline-offset-4">
                        Domain finder
                      </Link>{" "}
                      then mark one as Preferred — it appears here.
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bp-domainPurchased">Domain purchased?</Label>
                  <Select
                    value={b.domainPurchased}
                    onValueChange={(v) => setBusiness({ domainPurchased: v as never })}
                  >
                    <SelectTrigger id="bp-domainPurchased">
                      <SelectValue placeholder="Yes / No / Not sure" />
                    </SelectTrigger>
                    <SelectContent>
                      {YES_NO_UNSURE.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="bp-registrarName">Registrar / provider name</Label>
                  <Input
                    id="bp-registrarName"
                    value={b.registrarName}
                    onChange={(e) => setBusiness({ registrarName: e.target.value.slice(0, 200) })}
                    placeholder="The company you pay each year (no login needed)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Mirrors onboarding. Also shown in ownership record.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bp-ownedDomain">Owned domain (if any)</Label>
                  <Input
                    id="bp-ownedDomain"
                    value={b.ownedDomain}
                    onChange={(e) => setBusiness({ ownedDomain: e.target.value.slice(0, 200) })}
                    placeholder="yourbusiness.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    From onboarding — keeping them in sync avoids mismatches.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bp-businessEmailStatus">Business email status</Label>
                <Select
                  value={b.businessEmailStatus}
                  onValueChange={(v) => setBusiness({ businessEmailStatus: v })}
                >
                  <SelectTrigger id="bp-businessEmailStatus">
                    <SelectValue placeholder="Choose status" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMAIL_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Shown in ownership record and email setup guidance.
                </p>
              </div>

              <Callout tone="info" title="Ownership stays safe">
                Record only provider names and statuses here. Credentials belong in a password
                manager, with two-step sign-in turned on — especially for the registrar.
              </Callout>

              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to="/ownership-record">Update ownership record →</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/connect-domain">Connect domain guide</Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/hire-help">Hire help handoff →</Link>
                </Button>
              </div>
            </SectionCard>
          </TabsContent>
        </Tabs>

        <section className="surface-panel p-5">
          <h2 className="font-display text-lg font-bold">Where your profile appears</h2>
          <ul className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <li>
              • Dashboard greeting:{" "}
              {b.businessName ? `“Welcome back, ${b.businessName}”` : "— add business name"}
            </li>
            <li>• Content builder: name, description, hours, address, contact</li>
            <li>
              • Journey tester: defaults to “
              {b.primaryCustomerAction
                ? (JOURNEY_DEFINITIONS[b.primaryCustomerAction]?.label ?? b.primaryCustomerAction)
                : "inferred from goal"}
              ”
            </li>
            <li>• Get found: location and service areas for local guidance</li>
            <li>• Ownership & handoff: domain, registrar, email and provider names</li>
            <li>• Readiness blocker: links here until essentials are complete</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link to="/dashboard">
                Back to dashboard <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/checklist">View launch readiness</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/content">Continue to content</Link>
            </Button>
          </div>
        </section>

        <p className="text-xs text-muted-foreground">
          Changes save to this device automatically. We never ask for passwords or card numbers on
          this page. If someone asks you to paste a password here, do not.
        </p>
      </div>
    </AppShell>
  );
}
