import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  ClipboardCheck,
  Copy,
  Sparkles,
  Download,
  Eye,
  Smartphone,
  Monitor,
  Code2,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  ExternalLink,
  ChevronRight,
  Info,
  Check,
  RefreshCw,
  Zap,
  Shield,
  Scale,
  Building,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Callout } from "@/components/Callouts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/content")({
  head: () => ({
    meta: [
      {
        title: "Website Starter Copy & Page Content Builder — 7 Core Pages",
      },
      {
        name: "description",
        content:
          "Generate high-converting website copy drafts for Home, About, Services, Contact, FAQ, Privacy Policy, and Terms of Service with real-time visual mockups and one-click exports.",
      },
      {
        property: "og:title",
        content: "Website Starter Copy & Page Content Builder",
      },
      {
        property: "og:description",
        content:
          "Interactive draft writer with real-time preview, industry starter templates, auto-fill from Business Profile, clarity checks, and one-click HTML/Markdown exports.",
      },
    ],
  }),
  component: ContentBuilder,
});

interface Field {
  id: string;
  label: string;
  help: string;
  example: string;
  rows?: number;
}

interface Page {
  id: string;
  name: string;
  purpose: string;
  fields: Field[];
}

const PAGES: Page[] = [
  {
    id: "home",
    name: "Home",
    purpose: "Tell a first-time visitor what you do, who it is for, and what to do next.",
    fields: [
      {
        id: "headline",
        label: "One sentence: what do you do and for whom?",
        help: "Plain language beats clever wording. A stranger should understand it in three seconds.",
        example:
          "Small-batch sourdough and pastries, baked fresh every morning in Portland's Pearl District.",
      },
      {
        id: "audience",
        label: "Who is this for?",
        help: "Naming your customer helps the right people feel recognised.",
        example:
          "Neighbours, nearby offices ordering breakfast, and couples planning wedding cakes.",
        rows: 3,
      },
      {
        id: "proof",
        label: "Why should someone trust you?",
        help: "Years in business, qualifications, reviews, or a simple promise you always keep.",
        example:
          "Twelve years baking locally, 400+ five-star reviews, and everything sold on the day it is made.",
        rows: 3,
      },
      {
        id: "cta",
        label: "What should visitors do next?",
        help: "Pick one main action: call, book, order, or visit.",
        example: "Order a cake online, or drop in before 2pm.",
      },
    ],
  },
  {
    id: "about",
    name: "About",
    purpose: "Build trust with the honest story behind the business.",
    fields: [
      {
        id: "story",
        label: "How did the business start?",
        help: "Two or three honest sentences. No corporate language needed.",
        example:
          "Maya started baking for the farmers market in 2013 and opened the Harbor & Hearth shop in 2016.",
        rows: 4,
      },
      {
        id: "values",
        label: "What matters to you in how you work?",
        help: "Concrete beats abstract: name the actual practice, not the value word.",
        example:
          "We mill our own flour weekly and donate unsold loaves to the community kitchen each evening.",
        rows: 3,
      },
      {
        id: "team",
        label: "Who will the customer meet?",
        help: "A first name and a role is plenty.",
        example: "Maya (baker and owner) and Theo, who runs the counter most mornings.",
        rows: 2,
      },
    ],
  },
  {
    id: "services",
    name: "Services & Products",
    purpose: "Help visitors work out whether you offer what they need.",
    fields: [
      {
        id: "list",
        label: "List what you offer, one per line",
        help: "Use the words customers use, not internal names.",
        example:
          "Daily Artisan Sourdough\nCelebration & Wedding Cakes\nWholesale Breads to Local Cafés\nMorning Pastry Boxes for Offices",
        rows: 4,
      },
      {
        id: "detail",
        label: "For each, what does the customer get?",
        help: "One clear sentence each. Mention lead time if it matters.",
        example:
          "Celebration cakes: designed with you, from £60, three days' notice required.\nWholesale delivery: 6am daily drop to your kitchen door.",
        rows: 4,
      },
      {
        id: "pricing",
        label: "How will you talk about price?",
        help: "You do not need a full price list, but silence about price loses enquiries.",
        example: "Loaves from £4.50. Celebration cakes from £60. Wholesale pricing on request.",
        rows: 2,
      },
    ],
  },
  {
    id: "contact",
    name: "Contact & Location",
    purpose: "Make it effortless to reach you and know when you will reply.",
    fields: [
      {
        id: "methods",
        label: "How can people reach you?",
        help: "Phone, email, form, or messaging app. Two options is usually enough.",
        example: "Call (555) 0134, or email hello@harborandhearth.com.",
        rows: 2,
      },
      {
        id: "hours",
        label: "When are you open or available?",
        help: "Include the days you are closed. It prevents wasted trips.",
        example: "Tue–Sat 7:00 AM – 3:00 PM. Closed Sunday and Monday.",
        rows: 2,
      },
      {
        id: "response",
        label: "How quickly will you reply?",
        help: "Setting an expectation is more reassuring than promising instant answers.",
        example: "We reply to all emails and catering requests within one business day.",
      },
      {
        id: "location",
        label: "Where are you, or where do you serve?",
        help: "An address, or the areas you cover.",
        example: "412 Harbor Street, Portland — plus delivery across the inner east side.",
        rows: 2,
      },
    ],
  },
  {
    id: "faq",
    name: "FAQ",
    purpose: "Answer the questions you already get asked every week.",
    fields: [
      {
        id: "questions",
        label: "What do customers ask you most often?",
        help: "Write the question exactly as customers say it.",
        example: "Do you offer gluten-free options?\nCan I order on the same day?\nDo you deliver?",
        rows: 4,
      },
      {
        id: "answers",
        label: "Your answers, in order",
        help: "Short, direct, and honest — including when the answer is no.",
        example:
          "We bake dedicated gluten-free loaves on Thursdays only.\nSame-day orders depend on morning inventory, so please call ahead.\nWe deliver within 3 miles for £5 flat rate.",
        rows: 4,
      },
    ],
  },
  {
    id: "privacy",
    name: "Privacy Policy",
    purpose:
      "Plain-language disclosure of how customer data, contact info, and analytics are handled.",
    fields: [
      {
        id: "controller",
        label: "Business Name & Data Controller Details",
        help: "Who operates this website and who to contact for data inquiries.",
        example:
          "Harbor & Hearth LLC, 412 Harbor Street, Portland OR. Data contact: privacy@harborhearthbakery.com",
        rows: 2,
      },
      {
        id: "collection",
        label: "What customer data do you collect?",
        help: "Contact form entries, order details, newsletter emails, website cookies/analytics.",
        example:
          "We only collect information you voluntarily provide: your name, email address, phone number, and delivery address when ordering or submitting inquiries. We also use standard anonymous website analytics.",
        rows: 3,
      },
      {
        id: "usage",
        label: "How do you use this information?",
        help: "Fulfilling orders, responding to inquiries, sending receipts, and service updates.",
        example:
          "Your data is used solely to respond to inquiries, process bakery orders, and deliver catering services. We never sell, rent, or trade customer contact details to third parties.",
        rows: 3,
      },
      {
        id: "thirdparties",
        label: "Third-party tools and processors",
        help: "Payment processors (Stripe, Square), hosting, email delivery.",
        example:
          "Payments are processed securely via Stripe. We do not store raw credit card numbers on our servers. Anonymous web traffic is analyzed via Google Analytics.",
        rows: 3,
      },
      {
        id: "rights",
        label: "Customer rights & deletion requests",
        help: "How visitors can request access, corrections, or deletion of their information.",
        example:
          "You have the right to request a copy of the personal data we hold about you or ask us to delete your details at any time by emailing privacy@harborhearthbakery.com.",
        rows: 2,
      },
    ],
  },
  {
    id: "terms",
    name: "Terms of Service",
    purpose: "Clear expectations on bookings, pricing, cancellations, refunds, and liability.",
    fields: [
      {
        id: "acceptance",
        label: "Agreement & Service Overview",
        help: "State what services you provide and that website visitors agree to these terms.",
        example:
          "By accessing this website and ordering services from Harbor & Hearth LLC, you agree to these clear terms of service.",
        rows: 2,
      },
      {
        id: "pricing_payment",
        label: "Pricing, Quotes & Payment Terms",
        help: "Deposits, quote validity, payment due dates, and accepted payment methods.",
        example:
          "All listed prices are in USD. Custom event orders require a 50% non-refundable deposit to secure the date, with full payment due 48 hours prior to delivery.",
        rows: 3,
      },
      {
        id: "cancellation_refunds",
        label: "Cancellation, Rescheduling & Refund Policy",
        help: "Clear rules prevent awkward disputes before they occur.",
        example:
          "Standard orders may be cancelled up to 24 hours in advance for a full refund. Custom wedding and catering cakes require 7 days notice for a date reschedule.",
        rows: 3,
      },
      {
        id: "liability",
        label: "Limitation of Liability & Allergens/Disclaimers",
        help: "Disclaimers regarding allergy warnings, third-party delays, or service limitations.",
        example:
          "While we take cross-contamination precautions, our facility processes nuts, gluten, and dairy. Products are provided on an 'as is' basis without warranties beyond our quality guarantee.",
        rows: 3,
      },
      {
        id: "jurisdiction",
        label: "Governing Law & Contact Channel",
        help: "Which state/country laws apply and where legal questions can be sent.",
        example:
          "These terms are governed by the laws of the State of Oregon. Questions regarding these terms may be sent to legal@harborhearthbakery.com.",
        rows: 2,
      },
    ],
  },
];

interface IndustryTemplate {
  name: string;
  icon: string;
  tagline: string;
  data: Record<string, Record<string, string>>;
}

const INDUSTRY_TEMPLATES: IndustryTemplate[] = [
  {
    name: "Bakery & Coffee Shop",
    icon: "🥐",
    tagline: "Local food, fresh morning deliveries, neighborhood foot traffic",
    data: {
      home: {
        headline:
          "Handcrafted sourdough loaves, artisan pastries, and specialty espresso roasted locally in Portland.",
        audience:
          "Morning commuters, neighborhood families, local offices ordering team catering, and bespoke wedding cake clients.",
        proof:
          "Over 10 years serving the Pearl District with 500+ five-star reviews. 100% organic flour, baked fresh at 4:00 AM daily.",
        cta: "Browse our daily bakery menu or reserve a custom cake for your next event.",
      },
      about: {
        story:
          "Harbor & Hearth began in 2014 at the Saturday farmers market, inspired by European hearth baking techniques.",
        values:
          "We source all flour from regenerative family farms and donate 100% of unsold day-of loaves to local community kitchens.",
        team: "Founded by Maya (Head Baker) alongside our friendly front-of-house barista crew.",
      },
      services: {
        list: "Daily Sourdough & Hearth Breads\nSweet & Savory Morning Pastries\nCustom Celebration & Wedding Cakes\nWholesale Delivery to Cafés & Restaurants",
        detail:
          "Daily Breads: Naturally leavened and fermented for 36 hours for effortless digestion.\nCustom Cakes: Tailored seasonal flavors, requiring 3 business days notice.",
        pricing:
          "Artisan loaves from $7. Pastries from $4. Custom multi-tier celebration cakes from $75.",
      },
      contact: {
        methods: "Call (555) 234-5678 or email hello@harborhearthbakery.com",
        hours: "Tuesday – Saturday: 7:00 AM – 3:00 PM (or until sold out). Closed Sunday & Monday.",
        response: "We respond to custom catering and cake inquiries within 24 business hours.",
        location: "412 Harbor Street, Portland, OR 97209",
      },
      faq: {
        questions:
          "Do you have vegan or gluten-sensitive options?\nHow far in advance should I order celebration cakes?\nCan I freeze your sourdough bread?",
        answers:
          "Yes! We bake vegan cinnamon rolls and gluten-friendly seed loaves every Thursday.\nPlease order custom event cakes at least 3 business days in advance.\nYes, our naturally leavened bread freezes wonderfully for up to 3 months when sliced.",
      },
      privacy: {
        controller:
          "Harbor & Hearth Bakery LLC, 412 Harbor Street, Portland OR. Contact: privacy@harborhearthbakery.com",
        collection:
          "We collect customer names, phone numbers, and email addresses when you place an order or message us via our contact form.",
        usage:
          "Data is used strictly to prepare orders, process payments, and coordinate delivery.",
        thirdparties:
          "Credit card payments are handled securely through Square/Stripe. We do not store financial account numbers.",
        rights:
          "You can request deletion of your contact information anytime by emailing privacy@harborhearthbakery.com.",
      },
      terms: {
        acceptance:
          "By ordering from Harbor & Hearth Bakery, you agree to our standard order and service terms.",
        pricing_payment:
          "Full payment is required at time of online order. Custom event catering requires a 50% deposit.",
        cancellation_refunds:
          "Standard pastry orders can be cancelled up to 24 hours prior. Custom cakes require 3 business days notice.",
        liability:
          "Our kitchen processes nuts, dairy, wheat, and sesame. Please notify us of severe allergies prior to ordering.",
        jurisdiction: "Governed by the laws of the State of Oregon.",
      },
    },
  },
  {
    name: "Professional Consulting & Advisory",
    icon: "💼",
    tagline: "B2B advisory, management consulting, financial/legal services",
    data: {
      home: {
        headline:
          "Strategic financial operations and fractional CFO leadership for high-growth tech startups.",
        audience:
          "Seed to Series B founders, venture-backed tech executives, and growing professional service firms.",
        proof:
          "Guided 40+ startups through $85M in funding rounds, with an average 18% reduction in operating cash burn.",
        cta: "Schedule a complimentary 30-minute financial roadmap audit.",
      },
      about: {
        story:
          "Founded by former Big-4 audit leaders and startup founders who wanted transparent, high-impact financial guidance without agency bloat.",
        values:
          "Uncompromising data integrity, clear plain-English communication, and proactive forward-looking cash models.",
        team: "Led by Marcus Vance (CPA & Fractional CFO) with senior financial analysts in New York and London.",
      },
      services: {
        list: "Fractional CFO & Cash Management\nFundraising Due Diligence & Financial Modeling\nBoard Room Reporting & Unit Economics\nTax Strategy & Compliance",
        detail:
          "Fractional CFO: Dedicated weekly leadership overseeing budgets, runway projections, and executive strategy.",
        pricing:
          "Monthly advisory retainers start at $2,500/mo with zero long-term lock-in contracts.",
      },
      contact: {
        methods: "Book directly via Calendly or email advisory@vancefinancial.com",
        hours: "Monday – Friday: 9:00 AM – 6:00 PM EST",
        response: "All client inquiries receive a guaranteed executive response within 4 hours.",
        location: "Serving clients globally across US, UK, and Europe via secure video portal.",
      },
      faq: {
        questions:
          "When should a company hire a Fractional CFO versus a full-time CFO?\nWhat accounting software do you work with?\nHow quickly can we onboard?",
        answers:
          "Fractional CFOs are ideal for companies generating between $500k and $10M in revenue who need senior expertise without a $300k+ executive salary.\nWe specialize in QuickBooks Online, Xero, Stripe, Ramp, and NetSuite.\nStandard onboarding takes 5 business days to integrate data and deliver your first cash forecast.",
      },
      privacy: {
        controller: "Vance Financial Advisory Group Inc. Contact: legal@vancefinancial.com",
        collection:
          "We collect client executive names, corporate emails, and financial metrics shared during advisory engagements.",
        usage:
          "Client data is processed exclusively for delivering strategic financial models and compliance deliverables.",
        thirdparties:
          "All data storage adheres to SOC-2 compliant cloud infrastructure and encrypted vault services.",
        rights:
          "Clients maintain total ownership of their financial records and may request data export or shredding at any time.",
      },
      terms: {
        acceptance:
          "Engagement with Vance Financial Advisory is governed by our master service agreement and statement of work.",
        pricing_payment:
          "Retainer invoices are billed monthly in advance and payable via ACH / wire within 15 days.",
        cancellation_refunds:
          "Retainers may be cancelled with 30 days written notice. Prepaid unearned retainers are refunded pro-rata.",
        liability:
          "Advisory services provide strategic analysis and do not constitute formal statutory audit certifications.",
        jurisdiction: "Governed by the laws of the State of Delaware.",
      },
    },
  },
  {
    name: "Trades, Plumbing & Home Services",
    icon: "🔨",
    tagline: "Emergency repair, residential electrical, HVAC, plumbing",
    data: {
      home: {
        headline:
          "Licensed, same-day residential plumbing and water heater installation across Greater Austin.",
        audience:
          "Homeowners, residential landlords, and real estate property managers needing dependable repairs.",
        proof:
          "Texas Master Plumber License #42981. Over 1,200 verified five-star homeowner reviews. Upfront pricing with no overtime surprises.",
        cta: "Call (512) 555-0199 for immediate dispatch or book an estimate online.",
      },
      about: {
        story:
          "Family-owned and operated since 2008. We built our reputation on turning up on time, protecting your floors, and charging fair fixed rates.",
        values:
          "Honest diagnostics: We only recommend replacing parts when repair isn't safe or cost-effective.",
        team: "Master Plumber David Miller and a team of certified, background-checked field technicians.",
      },
      services: {
        list: "Emergency Drain Cleaning & Hydro-Jetting\nTankless & Standard Water Heater Replacement\nWhole-Home Leak Detection & Repiping\nSewer Line Camera Inspection",
        detail:
          "Water Heaters: Same-day replacement with 10-year manufacturer warranties included on all units.",
        pricing:
          "Free on-site estimates during standard hours. Clear fixed quotes before any wrench turns.",
      },
      contact: {
        methods: "24/7 Phone: (512) 555-0199 | Email: dispatch@millerplumbingtx.com",
        hours: "Standard: Mon–Sat 7:00 AM – 7:00 PM | 24/7 Emergency Dispatch Available",
        response:
          "Emergency calls dispatched within 45 minutes across Travis & Williamson counties.",
        location:
          "Based in North Austin, serving Austin, Round Rock, Cedar Park, and Pflugerville.",
      },
      faq: {
        questions:
          "Do you charge extra for weekend or evening visits?\nAre your technicians licensed and insured?\nWhat warranty do you provide on repairs?",
        answers:
          "No hidden weekend surcharges for standard scheduled bookings.\nYes, 100% of our technicians are state-licensed, background-checked, and carry full liability insurance.\nWe offer a 1-year unconditional labor guarantee on all plumbing installations.",
      },
      privacy: {
        controller:
          "Miller Plumbing & Mechanical Services LLC, Austin TX. Contact: dispatch@millerplumbingtx.com",
        collection:
          "We collect homeowner names, service addresses, phone numbers, and job notes for dispatch scheduling.",
        usage:
          "Used solely to route field technicians, send appointment SMS notifications, and provide written warranties.",
        thirdparties:
          "SMS notifications are routed via Twilio. Invoicing is processed through Housecall Pro / Stripe.",
        rights:
          "You may opt out of promotional service reminders at any time by replying STOP to SMS or emailing us.",
      },
      terms: {
        acceptance:
          "By approving an on-site estimate or dispatch, customers agree to our standard trade terms.",
        pricing_payment:
          "Payment is due upon completion of services. We accept all major cards, checks, and financing.",
        cancellation_refunds:
          "No fee for cancellations made 2 hours prior to scheduled technician arrival.",
        liability:
          "All labor is backed by our 1-year workmanship warranty. Manufacturer warranties apply to hardware.",
        jurisdiction: "Governed by the laws of the State of Texas.",
      },
    },
  },
  {
    name: "Creative Studio & Digital Agency",
    icon: "🎨",
    tagline: "Brand identity, web design, UI/UX, commercial photography",
    data: {
      home: {
        headline:
          "Brand identity and high-converting Shopify web design for ambitious lifestyle and consumer brands.",
        audience:
          "Direct-to-consumer ecommerce founders, boutique retailers, and modern lifestyle creators.",
        proof:
          "Featured on Awwwards and SiteInspire. Designed stores that generated over $40M in collective revenue.",
        cta: "Explore our recent client portfolio or book a 15-minute discovery consultation.",
      },
      about: {
        story:
          "We started as an independent design duo tired of cookie-cutter templates and sluggish agency turnaround times.",
        values:
          "Craft-focused aesthetics backed by conversion rate science. Clean typography, fast load times, zero clutter.",
        team: "Elena & Noah — Lead Brand Strategist & Senior Full-Stack Shopify Engineer.",
      },
      services: {
        list: "Custom Shopify Store Design & Development\nComprehensive Brand Identity & Visual Guidelines\nPackaging & Physical Unboxing Design\nConversion Rate Optimization (CRO) Audits",
        detail:
          "Shopify Build: Bespoke, mobile-first design built on Shopify OS 2.0 for blistering performance.",
        pricing: "Brand identity packages from $3,500. Custom Shopify builds from $6,000.",
      },
      contact: {
        methods: "Direct inquiry form or email studio@lumindesign.co",
        hours: "Monday – Thursday: 10:00 AM – 5:00 PM PST",
        response:
          "We review new project briefs and respond with availability within 2 business days.",
        location: "Based in Seattle, WA — collaborating with international brands worldwide.",
      },
      faq: {
        questions:
          "How long does a full custom website project take?\nWill I be able to edit my own store after launch?\nDo you offer ongoing retainer support?",
        answers:
          "Standard brand & Shopify projects take between 4 to 8 weeks from kickoff to launch.\nYes! We build using intuitive drag-and-drop sections and record custom video walkthrough tutorials for your team.\nYes, we offer monthly growth retainers for ongoing conversion optimization and campaign assets.",
      },
      privacy: {
        controller: "Lumin Design Studio LLC, Seattle WA. Contact: privacy@lumindesign.co",
        collection:
          "We collect client contact information, project brief details, and asset files uploaded for design reviews.",
        usage:
          "Data is used solely to execute creative design deliverables and maintain client project communication.",
        thirdparties:
          "Design files are hosted via Figma and Google Drive. Invoices are managed via Stripe.",
        rights:
          "Clients may request complete archival or deletion of past project briefs after final handover.",
      },
      terms: {
        acceptance:
          "Design and development projects are governed by our custom proposal and statement of work.",
        pricing_payment:
          "Projects are structured with a 50% deposit upon kickoff and 50% upon final launch approval.",
        cancellation_refunds:
          "Deposits cover preliminary discovery and concept phases and are non-refundable once design begins.",
        liability:
          "Upon final invoice settlement, full intellectual property rights for delivered custom designs transfer to the client.",
        jurisdiction: "Governed by the laws of the State of Washington.",
      },
    },
  },
];

const JARGON_WORDS = [
  "cutting-edge",
  "game-changer",
  "game-changing",
  "supercharge",
  "synergy",
  "leverage",
  "disrupt",
  "paradigm",
  "rockstar",
  "ninja",
  "world-class",
  "best-of-breed",
  "holistic",
  "seamless",
  "next-gen",
];

export function ContentBuilder() {
  const { state, saveDraft } = useStore();
  const [activePageId, setActivePageId] = useState("home");
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "mobile">("desktop");
  const [exportFormat, setExportFormat] = useState<"html" | "markdown" | "text">("html");

  const [values, setValues] = useState<Record<string, Record<string, string>>>(() => {
    const initial: Record<string, Record<string, string>> = {};
    for (const p of PAGES) {
      initial[p.id] = state.drafts[p.id]?.fields ?? {};
    }
    return initial;
  });

  const businessName = state.business.businessName || state.business.name || "Your Business";
  const domain = state.business.ownedDomain || state.business.preferredDomain || "yourbusiness.com";

  const setField = (page: string, field: string, value: string) => {
    setValues((v) => {
      const next = { ...v, [page]: { ...v[page], [field]: value.slice(0, 4000) } };
      saveDraft(page, next[page] || {});
      return next;
    });
  };

  // Load a pre-built industry template
  const applyTemplate = (template: IndustryTemplate) => {
    setValues(template.data);
    for (const [pageId, fields] of Object.entries(template.data)) {
      saveDraft(pageId, fields);
    }
    toast.success(`Loaded "${template.name}" starter copy into all 7 pages!`);
  };

  // Smart Pre-fill from Business Profile
  const prefillFromProfile = () => {
    const p = state.business;
    const bName = businessName;
    const category = p.category || "Professional Services";
    const loc = p.location || p.address || "Local and regional service";
    const contactEmail = p.businessEmail || p.ownerContact || `hello@${domain}`;
    const contactPhone = p.phone || p.whatsappNumber || "(555) 123-4567";
    const hours = p.hoursDetail || p.openingHours || "Monday – Friday: 9:00 AM – 5:00 PM";
    const desc = p.description || `${category} dedicated to dependable, high-quality service.`;
    const services =
      p.servicesOffered ||
      "Consultation & Tailored Solutions\nOn-site Delivery\nCustom Project Execution";
    const targetCust = p.targetCustomers || "Local homeowners, professionals, and businesses.";
    const diff =
      p.differentiator ||
      p.qualifications ||
      "Over a decade of industry expertise, transparent pricing, and 100% satisfaction guarantee.";

    const generated: Record<string, Record<string, string>> = {
      home: {
        headline: desc.length > 20 ? desc : `${bName} — Trusted ${category} in ${loc}.`,
        audience: targetCust,
        proof: diff,
        cta:
          p.primaryCustomerAction === "phone_call"
            ? `Call ${contactPhone} for immediate assistance.`
            : `Book an appointment online or contact ${contactEmail} today.`,
      },
      about: {
        story: `${bName} was founded with a straightforward mission: to provide dependable, transparent, and top-tier ${category.toLowerCase()} without the headaches.`,
        values: `We prioritize transparent pricing, prompt communication, and exceptional craftsmanship on every project.`,
        team: `Led by our experienced founders and dedicated customer support specialists ready to assist you.`,
      },
      services: {
        list: services,
        detail: `Every service is executed with rigorous attention to detail, clear turnaround times, and upfront estimates before work begins.`,
        pricing: `Clear and transparent rates. Contact us for a personalized estimate tailored to your exact scope.`,
      },
      contact: {
        methods: `Phone: ${contactPhone} | Email: ${contactEmail}`,
        hours: hours,
        response: `We respond to all phone calls and web inquiries within 1 business day.`,
        location: loc,
      },
      faq: {
        questions: `What areas do you serve?\nHow do I get an estimate or quote?\nWhat payment methods do you accept?`,
        answers: `We proudly serve ${loc} and surrounding communities.\nYou can request an estimate by calling ${contactPhone} or submitting our online contact form.\nWe accept all major credit cards, bank transfers, and electronic payments.`,
      },
      privacy: {
        controller: `${bName} (${loc}). Primary Data Contact: ${contactEmail}`,
        collection: `We collect contact details (name, email, phone number, and address) provided voluntarily through our website inquiry forms, orders, or booking requests.`,
        usage: `Your information is used strictly to fulfill service requests, provide customer support, and communicate important updates regarding your account or appointments.`,
        thirdparties: `We use trusted, industry-standard third-party providers for web hosting, email communication, and secure payment processing. We never sell your personal information.`,
        rights: `You may request access to, correction of, or deletion of your personal data at any time by contacting ${contactEmail}.`,
      },
      terms: {
        acceptance: `By accessing and using this website or engaging services from ${bName}, you agree to abide by these Terms of Service.`,
        pricing_payment: `All quotes provided are valid for 30 days. Payment terms, deposits, and accepted methods will be confirmed prior to commencement of work.`,
        cancellation_refunds: `Appointments or bookings may be rescheduled or cancelled up to 24 hours in advance. Refund terms for specialized materials or custom labor are specified in your service agreement.`,
        liability: `Services and website content are provided on an 'as is' basis. To the maximum extent permitted by law, ${bName} is not liable for indirect or consequential damages.`,
        jurisdiction: `These terms are governed by the local laws applicable to ${loc}. Inquiries may be addressed to ${contactEmail}.`,
      },
    };

    setValues(generated);
    for (const [pageId, fields] of Object.entries(generated)) {
      saveDraft(pageId, fields);
    }
    toast.success("Generated tailored copy for all 7 website pages from your Business Profile!");
  };

  const activePage = PAGES.find((p) => p.id === activePageId) || PAGES[0];
  const activePageData = useMemo(() => values[activePageId] || {}, [values, activePageId]);

  // Copy Analysis Metrics
  const activePageStats = useMemo(() => {
    const text = Object.values(activePageData).join(" ");
    const words = text
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0);
    const wordCount = words.length;
    const charCount = text.length;
    const readTimeSec = Math.max(10, Math.round((wordCount / 200) * 60));

    // Jargon detection
    const lower = text.toLowerCase();
    const foundJargon = JARGON_WORDS.filter((j) => lower.includes(j));

    return {
      wordCount,
      charCount,
      readTimeSec,
      foundJargon,
    };
  }, [activePageData]);

  // Generate Semantic HTML
  const generateHtmlForPage = (pageId: string) => {
    const d = values[pageId] || {};
    const bName = businessName;

    if (pageId === "home") {
      return `<!-- ${bName} - Homepage Content -->
<section class="hero-banner">
  <div class="container">
    <h1>${d.headline || "Welcome to " + bName}</h1>
    <p class="audience-lead">${d.audience || "Crafted for customers who value quality."}</p>
    <div class="cta-group">
      <a href="/contact" class="btn btn-primary">${d.cta || "Get in Touch Today"}</a>
    </div>
  </div>
</section>

<section class="trust-proof">
  <div class="container">
    <h2>Why Choose Us</h2>
    <p>${d.proof || "Dedicated to exceptional service and reliable results."}</p>
  </div>
</section>`;
    }

    if (pageId === "about") {
      return `<!-- ${bName} - About Us -->
<section class="about-story">
  <div class="container">
    <h1>Our Story</h1>
    <p class="story-body">${d.story || "Founded with a passion for excellence and authentic craft."}</p>

    <h2>How We Work</h2>
    <p>${d.values || "Quality, honesty, and clear communication are at our core."}</p>

    <h2>Meet the Team</h2>
    <p>${d.team || "A dedicated team ready to support your goals."}</p>
  </div>
</section>`;
    }

    if (pageId === "services") {
      const items = (d.list || "")
        .split("\n")
        .filter((l) => l.trim().length > 0)
        .map((l) => `    <li><strong>${l}</strong></li>`)
        .join("\n");

      return `<!-- ${bName} - Services & Offerings -->
<section class="services-overview">
  <div class="container">
    <h1>What We Offer</h1>
    <ul class="service-list">
${items || "    <li>Consultation & Custom Solutions</li>"}
    </ul>

    <h2>Service Details</h2>
    <p class="service-details">${(d.detail || "").replace(/\n/g, "<br />\n") || "Tailored solutions designed to fit your unique needs."}</p>

    <h2>Investment & Pricing</h2>
    <p class="pricing-info">${d.pricing || "Transparent pricing. Contact us for custom quotes."}</p>
  </div>
</section>`;
    }

    if (pageId === "contact") {
      return `<!-- ${bName} - Contact & Location -->
<section class="contact-section">
  <div class="container">
    <h1>Get in Touch</h1>
    <p class="reach-us">${d.methods || "Email or call our team for prompt assistance."}</p>

    <div class="business-details">
      <h3>Opening Hours</h3>
      <p>${d.hours || "Monday - Friday: 9:00 AM - 5:00 PM"}</p>

      <h3>Location & Service Area</h3>
      <p>${d.location || "Serving local and remote clients."}</p>

      <h3>Response Time Guarantee</h3>
      <p>${d.response || "We reply to all inquiries within one business day."}</p>
    </div>
  </div>
</section>`;
    }

    if (pageId === "faq") {
      const qList = (d.questions || "").split("\n").filter((q) => q.trim().length > 0);
      const aList = (d.answers || "").split("\n").filter((a) => a.trim().length > 0);

      const faqs = qList
        .map(
          (q, i) => `  <div class="faq-item">
    <h3>${q}</h3>
    <p>${aList[i] || "Please contact our team for specific details."}</p>
  </div>`,
        )
        .join("\n\n");

      return `<!-- ${bName} - Frequently Asked Questions -->
<section class="faq-section">
  <div class="container">
    <h1>Frequently Asked Questions</h1>
${faqs || "  <p>Have questions? We are always happy to answer them.</p>"}
  </div>
</section>`;
    }

    if (pageId === "privacy") {
      return `<!-- ${bName} - Privacy Policy -->
<section class="legal-page privacy-policy">
  <div class="container">
    <h1>Privacy Policy</h1>
    <p class="policy-updated">Last Updated: ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>

    <h2>1. Data Controller & Overview</h2>
    <p>${d.controller || bName}</p>

    <h2>2. Information We Collect</h2>
    <p>${d.collection || "We collect information voluntarily submitted via forms."}</p>

    <h2>3. How We Use Your Information</h2>
    <p>${d.usage || "Information is used exclusively to fulfill customer services."}</p>

    <h2>4. Third-Party Service Providers</h2>
    <p>${d.thirdparties || "Standard hosting and payment processors only."}</p>

    <h2>5. Your Rights & Contact Details</h2>
    <p>${d.rights || "You may contact us anytime to request data correction or deletion."}</p>
  </div>
</section>`;
    }

    if (pageId === "terms") {
      return `<!-- ${bName} - Terms of Service -->
<section class="legal-page terms-of-service">
  <div class="container">
    <h1>Terms of Service</h1>
    <p class="terms-updated">Last Updated: ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>

    <h2>1. Acceptance of Terms</h2>
    <p>${d.acceptance || "By using our services, you agree to these terms."}</p>

    <h2>2. Pricing & Payment</h2>
    <p>${d.pricing_payment || "Payment terms and rates agreed upon prior to project start."}</p>

    <h2>3. Cancellation & Refunds</h2>
    <p>${d.cancellation_refunds || "Cancellations subject to reasonable advance notice."}</p>

    <h2>4. Limitation of Liability</h2>
    <p>${d.liability || "Services provided on standard commercial terms."}</p>

    <h2>5. Governing Law</h2>
    <p>${d.jurisdiction || "Governed by local jurisdiction laws."}</p>
  </div>
</section>`;
    }

    return "";
  };

  // Generate Clean Markdown
  const generateMarkdownForPage = (pageId: string) => {
    const d = values[pageId] || {};
    const pageObj = PAGES.find((p) => p.id === pageId);
    if (!pageObj) return "";

    const lines = [
      `# ${businessName} — ${pageObj.name} Page`,
      `*${pageObj.purpose}*`,
      ``,
      ...pageObj.fields.map((f) => `### ${f.label}\n${d[f.id] || "_Not written yet._"}\n`),
    ];
    return lines.join("\n");
  };

  // Generate Plain Text
  const generateTextForPage = (pageId: string) => {
    const d = values[pageId] || {};
    const pageObj = PAGES.find((p) => p.id === pageId);
    if (!pageObj) return "";

    const lines = [
      `=== ${businessName.toUpperCase()} — ${pageObj.name.toUpperCase()} PAGE ===`,
      ``,
      ...pageObj.fields.map((f) => `[${f.label.toUpperCase()}]\n${d[f.id] || "(Pending draft)"}\n`),
    ];
    return lines.join("\n");
  };

  const copyCurrentPageExport = async () => {
    let content = "";
    if (exportFormat === "html") content = generateHtmlForPage(activePageId);
    else if (exportFormat === "markdown") content = generateMarkdownForPage(activePageId);
    else content = generateTextForPage(activePageId);

    try {
      await navigator.clipboard.writeText(content);
      toast.success(
        `Copied ${activePage.name} page in ${exportFormat.toUpperCase()} to clipboard!`,
      );
    } catch {
      toast.error("Could not copy text.");
    }
  };

  // Download All 7 Pages Master Bundle
  const downloadMasterBundle = () => {
    const allHtml = PAGES.map((p) => generateHtmlForPage(p.id)).join(
      '\n\n<hr class="page-divider" />\n\n',
    );
    const blob = new Blob([allHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `website-copy-bundle-all-7-pages-${domain.replace(/[^a-z0-9]/gi, "-")}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded All 7 Website Pages in Master HTML Bundle!");
  };

  return (
    <AppShell
      title="Website Starter Copy & Page Content Builder"
      description="Write high-converting, professional copy without the blank page. Preview live in browser and export to any website builder."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prefillFromProfile}
            className="text-xs gap-1.5"
          >
            <Sparkles className="size-3.5 text-primary" /> Auto-Fill All 7 Pages from Profile
          </Button>
          <Button size="sm" onClick={downloadMasterBundle} className="text-xs gap-1.5">
            <Download className="size-3.5" /> Download All 7 Pages Bundle
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <Callout tone="info" title="Human Words Build Customer Trust">
          Write naturally in plain, spoken language as if you are talking to a customer
          face-to-face. As you type on the left, your live webpage mock updates in real time on the
          right.
        </Callout>

        {/* Industry Starter Presets Bar */}
        <div className="surface-panel p-4 sm:p-5 space-y-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                1-Click Starter Copy Presets
              </span>
              <h3 className="font-display font-bold text-base text-foreground">
                Load a high-converting industry template:
              </h3>
            </div>
            <span className="text-xs text-muted-foreground">
              Select a template to pre-fill all 7 core pages
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {INDUSTRY_TEMPLATES.map((tpl) => (
              <button
                key={tpl.name}
                type="button"
                onClick={() => applyTemplate(tpl)}
                className="group flex flex-col justify-between rounded-xl border border-border bg-card p-3 text-left transition-all hover:border-primary hover:bg-primary-soft/30 hover:shadow-sm"
              >
                <div>
                  <span className="text-2xl">{tpl.icon}</span>
                  <p className="mt-1 font-display font-bold text-xs text-foreground group-hover:text-primary">
                    {tpl.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">
                    {tpl.tagline}
                  </p>
                </div>
                <span className="mt-2 text-[10px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Load Template →
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Page Selector Tabs */}
        <div className="flex flex-col gap-4">
          <Tabs value={activePageId} onValueChange={setActivePageId} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 p-1">
              {PAGES.map((p) => {
                const isFilled =
                  Object.values(values[p.id] || {}).filter((v) => v.trim().length > 0).length > 0;
                return (
                  <TabsTrigger key={p.id} value={p.id} className="gap-1.5 text-xs font-semibold">
                    <span className="truncate">{p.name}</span>
                    {isFilled && <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>

        {/* Interactive Workspace: Split Screen Editor + Live Mockup */}
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* LEFT SIDE: Structured Guided Prompts (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="surface-panel p-5 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl font-bold">{activePage.name} Page Builder</h3>
                  <p className="text-xs text-muted-foreground">{activePage.purpose}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {activePageStats.wordCount} words • ~{activePageStats.readTimeSec}s read
                </Badge>
              </div>

              {/* Jargon Warning Alert if detected */}
              {activePageStats.foundJargon.length > 0 && (
                <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-2.5 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Clarity Alert: </span>
                    Avoid buzzwords like <strong>{activePageStats.foundJargon.join(", ")}</strong>.
                    Use concrete words describing what the customer actually receives.
                  </div>
                </div>
              )}
            </div>

            {/* Prompt Input Fields */}
            {activePage.fields.map((f) => (
              <div key={f.id} className="surface-panel space-y-2 p-5">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor={`${activePage.id}-${f.id}`}
                    className="font-display text-sm font-bold text-foreground"
                  >
                    {f.label}
                  </Label>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {(activePageData[f.id] || "").length}/4000
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{f.help}</p>

                {f.rows === undefined ? (
                  <Input
                    id={`${activePage.id}-${f.id}`}
                    value={activePageData[f.id] ?? ""}
                    onChange={(e) => setField(activePage.id, f.id, e.target.value)}
                    placeholder={`e.g. ${f.example}`}
                    className="text-sm font-medium"
                    maxLength={4000}
                  />
                ) : (
                  <Textarea
                    id={`${activePage.id}-${f.id}`}
                    rows={f.rows}
                    value={activePageData[f.id] ?? ""}
                    onChange={(e) => setField(activePage.id, f.id, e.target.value)}
                    placeholder={`e.g. ${f.example}`}
                    className="text-sm font-medium leading-relaxed"
                    maxLength={4000}
                  />
                )}

                <details className="rounded-lg border border-border bg-muted/30 p-2.5 text-xs text-muted-foreground">
                  <summary className="cursor-pointer font-medium text-foreground hover:text-primary">
                    View prompt inspiration & sample
                  </summary>
                  <p className="mt-2 whitespace-pre-line font-mono text-[11px] bg-card p-2 rounded border border-border">
                    {f.example}
                  </p>
                </details>
              </div>
            ))}
          </div>

          {/* RIGHT SIDE: Live Customer Website Mockup Preview & Code Export (6 cols) */}
          <div className="lg:col-span-6 space-y-4 lg:sticky lg:top-4">
            {/* Viewport & Format Selector Header */}
            <div className="surface-panel p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg">
                <Button
                  variant={previewViewport === "desktop" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setPreviewViewport("desktop")}
                  className="h-7 text-xs gap-1 px-2.5"
                >
                  <Monitor className="size-3.5" /> Desktop
                </Button>
                <Button
                  variant={previewViewport === "mobile" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setPreviewViewport("mobile")}
                  className="h-7 text-xs gap-1 px-2.5"
                >
                  <Smartphone className="size-3.5" /> Mobile
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as "html" | "markdown" | "text")}
                  aria-label="Export format"
                  className="rounded-md border border-border bg-background px-2 py-1 text-xs font-semibold text-foreground"
                >
                  <option value="html">Semantic HTML</option>
                  <option value="markdown">Clean Markdown</option>
                  <option value="text">Plain Text</option>
                </select>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyCurrentPageExport}
                  className="h-8 text-xs gap-1"
                >
                  <Copy className="size-3.5" /> Copy Code
                </Button>
              </div>
            </div>

            {/* Interactive Browser Frame */}
            <div
              className={cn(
                "mx-auto transition-all rounded-2xl border border-border/80 bg-card shadow-2xl overflow-hidden",
                previewViewport === "mobile" ? "max-w-[340px]" : "w-full",
              )}
            >
              {/* Browser Window Chrome */}
              <div className="bg-muted/80 border-b border-border/60 px-3 py-2 flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-rose-400 inline-block" />
                  <span className="size-2.5 rounded-full bg-amber-400 inline-block" />
                  <span className="size-2.5 rounded-full bg-emerald-400 inline-block" />
                </div>
                <div className="flex-1 bg-background/80 rounded-md px-2.5 py-0.5 text-[10px] font-mono text-muted-foreground truncate border border-border/40 text-center">
                  https://{domain}/{activePageId === "home" ? "" : activePageId}
                </div>
              </div>

              {/* Mockup Header Navigation */}
              <div className="border-b border-border/40 px-4 py-2.5 flex items-center justify-between bg-card">
                <span className="font-display font-bold text-xs text-foreground tracking-tight">
                  {businessName}
                </span>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                  <span className={activePageId === "home" ? "text-primary font-bold" : ""}>
                    Home
                  </span>
                  <span className={activePageId === "about" ? "text-primary font-bold" : ""}>
                    About
                  </span>
                  <span className={activePageId === "services" ? "text-primary font-bold" : ""}>
                    Services
                  </span>
                  <span className={activePageId === "contact" ? "text-primary font-bold" : ""}>
                    Contact
                  </span>
                </div>
              </div>

              {/* Rendered Live Content */}
              <div className="p-4 sm:p-6 space-y-6 bg-background/50 min-h-[380px]">
                {/* HOMEPAGE VIEW */}
                {activePageId === "home" && (
                  <div className="space-y-5">
                    <div className="rounded-xl border border-primary/20 bg-primary-soft/30 p-4 sm:p-6 text-center space-y-3">
                      <h1 className="font-display font-extrabold text-base sm:text-xl text-foreground leading-snug">
                        {activePageData.headline || (
                          <span className="text-muted-foreground italic">
                            Your clear one-sentence headline will appear here...
                          </span>
                        )}
                      </h1>
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
                        {activePageData.audience ||
                          "Tell your target visitors who your products or services are designed for."}
                      </p>
                      <div className="pt-2">
                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow hover:bg-primary/90"
                        >
                          {activePageData.cta || "Get Started Today"}
                        </button>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                        Why Customers Trust Us
                      </span>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {activePageData.proof ||
                          "Years of experience, certifications, client reviews, and guarantees."}
                      </p>
                    </div>
                  </div>
                )}

                {/* ABOUT VIEW */}
                {activePageId === "about" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                        Our Story
                      </span>
                      <h2 className="font-display font-bold text-lg text-foreground">
                        About {businessName}
                      </h2>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {activePageData.story || "Share how and why your business began..."}
                      </p>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-3.5 space-y-1">
                      <span className="font-bold text-xs text-foreground block">
                        Our Core Values
                      </span>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {activePageData.values ||
                          "Describe the concrete practices that define how you operate."}
                      </p>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-3.5 space-y-1">
                      <span className="font-bold text-xs text-foreground block">
                        Meet Our People
                      </span>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {activePageData.team ||
                          "Introduce key founders, specialists, or customer-facing staff."}
                      </p>
                    </div>
                  </div>
                )}

                {/* SERVICES VIEW */}
                {activePageId === "services" && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                        Our Offerings
                      </span>
                      <h2 className="font-display font-bold text-lg text-foreground">
                        Services & Products
                      </h2>
                    </div>

                    <div className="space-y-2">
                      {(activePageData.list || "Custom Service 1\nCustom Service 2")
                        .split("\n")
                        .filter((s) => s.trim().length > 0)
                        .map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                          >
                            <span className="font-semibold text-xs text-foreground">{item}</span>
                            <ChevronRight className="size-3.5 text-muted-foreground" />
                          </div>
                        ))}
                    </div>

                    <div className="rounded-lg border border-border bg-card p-3.5 space-y-1">
                      <span className="font-bold text-xs text-foreground block">
                        Service Details & Deliverables
                      </span>
                      <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                        {activePageData.detail ||
                          "Specify turnarounds, materials, or included deliverables."}
                      </p>
                    </div>

                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3.5 space-y-1">
                      <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400 block">
                        Pricing & Quotes
                      </span>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {activePageData.pricing || "Pricing starting points or quote terms."}
                      </p>
                    </div>
                  </div>
                )}

                {/* CONTACT VIEW */}
                {activePageId === "contact" && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                        Get In Touch
                      </span>
                      <h2 className="font-display font-bold text-lg text-foreground">
                        Contact & Location
                      </h2>
                    </div>

                    <div className="grid gap-2.5">
                      <div className="rounded-lg border border-border bg-card p-3 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                          How to Reach Us
                        </span>
                        <p className="text-xs font-semibold text-foreground">
                          {activePageData.methods || "Phone, email, or booking link."}
                        </p>
                      </div>

                      <div className="rounded-lg border border-border bg-card p-3 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                          Hours of Operation
                        </span>
                        <p className="text-xs text-foreground">
                          {activePageData.hours || "Open days and hours."}
                        </p>
                      </div>

                      <div className="rounded-lg border border-border bg-card p-3 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                          Location & Service Area
                        </span>
                        <p className="text-xs text-foreground">
                          {activePageData.location || "Street address or coverage zone."}
                        </p>
                      </div>

                      <div className="rounded-lg border border-primary/20 bg-primary-soft/20 p-2.5 text-xs text-primary flex items-center gap-2">
                        <Clock className="size-4 shrink-0" />
                        <span>
                          {activePageData.response || "Guaranteed response within 1 business day."}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* FAQ VIEW */}
                {activePageId === "faq" && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                        Questions Answered
                      </span>
                      <h2 className="font-display font-bold text-lg text-foreground">
                        Frequently Asked Questions
                      </h2>
                    </div>

                    <Accordion type="single" collapsible className="space-y-2">
                      {(
                        activePageData.questions ||
                        "What are your delivery options?\nDo you offer refunds?"
                      )
                        .split("\n")
                        .filter((q) => q.trim().length > 0)
                        .map((q, i) => {
                          const ansList = (activePageData.answers || "").split("\n");
                          const ans =
                            ansList[i] || "Contact our support team for specific guidance.";
                          return (
                            <AccordionItem
                              key={i}
                              value={`faq-${i}`}
                              className="rounded-lg border border-border bg-card px-3"
                            >
                              <AccordionTrigger className="text-xs font-bold text-foreground py-2.5">
                                {q}
                              </AccordionTrigger>
                              <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-3">
                                {ans}
                              </AccordionContent>
                            </AccordionItem>
                          );
                        })}
                    </Accordion>
                  </div>
                )}

                {/* PRIVACY POLICY VIEW */}
                {activePageId === "privacy" && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                        <Shield className="size-3" /> Legal & Transparency
                      </span>
                      <h2 className="font-display font-bold text-lg text-foreground">
                        Privacy Policy
                      </h2>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-3.5 space-y-2">
                      <h4 className="text-xs font-bold text-foreground">1. Data Controller</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {activePageData.controller ||
                          `${businessName} operates this website and is responsible for your personal data.`}
                      </p>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-3.5 space-y-2">
                      <h4 className="text-xs font-bold text-foreground">
                        2. Information We Collect & How
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {activePageData.collection ||
                          "We collect information voluntarily submitted via inquiry forms or orders."}
                      </p>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-3.5 space-y-2">
                      <h4 className="text-xs font-bold text-foreground">
                        3. Purpose of Processing
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {activePageData.usage ||
                          "Your data is used solely to provide customer services and fulfill orders."}
                      </p>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-3.5 space-y-2">
                      <h4 className="text-xs font-bold text-foreground">
                        4. Third-Party Processors & Security
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {activePageData.thirdparties ||
                          "We use encrypted payment processors (Stripe/Square) and reputable hosting."}
                      </p>
                    </div>

                    <div className="rounded-lg border border-primary/20 bg-primary-soft/20 p-3 space-y-1">
                      <h4 className="text-xs font-bold text-primary">5. Your Privacy Rights</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {activePageData.rights ||
                          "You have the right to request deletion of your information anytime."}
                      </p>
                    </div>
                  </div>
                )}

                {/* TERMS OF SERVICE VIEW */}
                {activePageId === "terms" && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                        <Scale className="size-3" /> Service Agreements
                      </span>
                      <h2 className="font-display font-bold text-lg text-foreground">
                        Terms of Service
                      </h2>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-3.5 space-y-2">
                      <h4 className="text-xs font-bold text-foreground">1. Acceptance of Terms</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {activePageData.acceptance ||
                          `By using this website, you agree to these standard terms provided by ${businessName}.`}
                      </p>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-3.5 space-y-2">
                      <h4 className="text-xs font-bold text-foreground">
                        2. Pricing, Invoicing & Payments
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {activePageData.pricing_payment ||
                          "Prices are transparent and agreed upon before work begins."}
                      </p>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-3.5 space-y-2">
                      <h4 className="text-xs font-bold text-foreground">
                        3. Cancellation & Refunds
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {activePageData.cancellation_refunds ||
                          "Cancellations must be communicated in advance according to our notice policy."}
                      </p>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-3.5 space-y-2">
                      <h4 className="text-xs font-bold text-foreground">
                        4. Limitation of Liability
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {activePageData.liability ||
                          "Services are provided with standard commercial warranties."}
                      </p>
                    </div>

                    <div className="rounded-lg border border-primary/20 bg-primary-soft/20 p-3 space-y-1">
                      <h4 className="text-xs font-bold text-primary">5. Governing Law</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {activePageData.jurisdiction || "Governed by local state and country laws."}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Mockup Footer */}
              <div className="border-t border-border/40 bg-muted/40 p-3 text-center text-[10px] text-muted-foreground">
                © {new Date().getFullYear()} {businessName}. All rights reserved.
              </div>
            </div>

            {/* Code / Markdown Raw View Accordion */}
            <div className="surface-panel p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Code2 className="size-4 text-primary" /> Generated {exportFormat.toUpperCase()}{" "}
                  Snippet
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyCurrentPageExport}
                  className="h-7 text-xs gap-1"
                >
                  <Copy className="size-3" /> Copy
                </Button>
              </div>

              <pre className="overflow-x-auto rounded-lg bg-muted/70 p-3 font-mono text-[10px] text-foreground max-h-48">
                {exportFormat === "html"
                  ? generateHtmlForPage(activePageId)
                  : exportFormat === "markdown"
                    ? generateMarkdownForPage(activePageId)
                    : generateTextForPage(activePageId)}
              </pre>
            </div>
          </div>
        </div>

        {/* Pre-Publishing Checklist */}
        <section className="surface-panel p-5 sm:p-6 space-y-4">
          <h2 className="font-display text-xl font-bold">Writing & Conversion Checklist</h2>
          <div className="grid gap-3 sm:grid-cols-3 text-xs text-muted-foreground">
            <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-1">
              <strong className="text-foreground block font-semibold">
                ✓ The 5-Second Stranger Test
              </strong>
              Would someone who has never heard of your industry understand what you do and what to
              do next within 5 seconds?
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-1">
              <strong className="text-foreground block font-semibold">
                ✓ Customer-Centric Framing
              </strong>
              Count the times you use &quot;you / your&quot; versus &quot;we / our&quot;. Great copy
              focuses on the customer&apos;s outcome.
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-1">
              <strong className="text-foreground block font-semibold">
                ✓ Single Clear Call-To-Action
              </strong>
              Avoid giving 4 competing buttons. Pick one primary objective (e.g. Call, Book, or
              Order).
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary-soft/30 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-sm font-semibold flex items-center gap-2">
                <ClipboardCheck className="size-4 text-primary" aria-hidden="true" /> Next: Test the
                full customer journey
              </p>
              <p className="text-xs text-muted-foreground">
                After writing your pages, walk through the actual transaction from a mobile phone as
                a stranger would.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" className="shrink-0">
                <Link to="/customer-journey">Open Journey Tester →</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="shrink-0">
                <Link to="/launch-wizard">Launch Wizard →</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
