import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  ClipboardCheck,
  Copy,
  Sparkles,
  Download,
  Smartphone,
  Monitor,
  Code2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  Scale,
  Building,
  HelpCircle,
  HardDrive,
  Printer,
  FileText,
  Image as ImageIcon,
  Megaphone,
  BookOpen,
  CalendarCheck,
  Utensils,
  Briefcase,
  Star,
  Truck,
  Info,
  Check,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Callout } from "@/components/Callouts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { CONTENT_DRAFT_STATUS_LABEL, type ContentDraftStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/content")({
  head: () => ({
    meta: [
      { title: "Website Content Builder — 13 Page Workspace (Publish-Ready Drafts)" },
      {
        name: "description",
        content:
          "Content builder workspace for 13 pages with why, recommended sections, prompts, draft fields, CTA guidance, checklist, image/alt reminders and policy requirements. Copy, print or download .txt/.md drafts locally.",
      },
      { property: "og:title", content: "Website Content Builder — 13 Publish-Ready Drafts" },
    ],
  }),
  component: ContentBuilder,
});

interface Field {
  id: string;
  label: string;
  help: string;
  example: string;
  prompt?: string;
  rows?: number;
}

interface Page {
  id: string;
  name: string;
  why: string;
  purpose: string;
  sections: string[];
  fields: Field[];
  ctaGuidance: string;
  checklist: string[];
  imageReminder: string;
  policyNote?: string;
}

// 13 pages covering all required types
export const PAGES: Page[] = [
  {
    id: "home",
    name: "Home",
    why: "First impression — visitors decide in 5 seconds if you can help them and what to do next.",
    purpose: "Tell a first-time visitor what you do, who it is for, and what to do next.",
    sections: ["Hero headline + subhead", "Who it's for", "Proof / trust signals", "Primary CTA button", "Hero image with descriptive alt text"],
    fields: [
      { id: "headline", label: "One sentence: what do you do and for whom?", help: "Plain language beats clever wording. Fill-in: We help _____ achieve _____ without _____.", example: "Small-batch sourdough and pastries, baked fresh every morning in Portland's Pearl District.", prompt: "We help [audience] get [outcome] without [common pain]." },
      { id: "audience", label: "Who is this for?", help: "Name your customer so the right people feel recognised.", example: "Neighbours, nearby offices ordering breakfast, and couples planning wedding cakes.", rows: 3, prompt: "Perfect for [audience 1], [audience 2], and [audience 3] who need [outcome]." },
      { id: "proof", label: "Why should someone trust you?", help: "Years, qualifications, reviews, or a promise you always keep.", example: "Twelve years baking locally, 400+ five-star reviews, and everything sold on the day it is made.", rows: 3, prompt: "[Number] years / [credential] + [review count] + [quality promise]." },
      { id: "cta", label: "What should visitors do next? (CTA)", help: "Pick ONE main action: call, book, order, visit. Verb-first wording wins.", example: "Order a cake online, or drop in before 2pm." },
    ],
    ctaGuidance: "One primary CTA only: e.g. 'Book a tasting' or 'Call (555) 0134'. Avoid 'Submit' or 4 competing buttons. Repeat CTA at bottom.",
    checklist: ["Clear headline (under 15 words)", "Audience named", "At least one proof point", "Single CTA with verb", "Hero image planned + alt text drafted"],
    imageReminder: "Hero photo: real storefront, product, or team at work. Alt text: describe what is visible + context, e.g. 'Fresh sourdough loaf on wooden board at Harbor & Hearth, Portland storefront'. Avoid stock photos.",
  },
  {
    id: "about",
    name: "About",
    why: "People buy from people they trust. Honest story beats corporate jargon and builds confidence before checkout.",
    purpose: "Build trust with the honest story behind the business.",
    sections: ["Founding story", "How you work / values in practice", "Who the customer meets (team)", "Credentials / qualifications", "Photo + alt text"],
    fields: [
      { id: "story", label: "How did the business start?", help: "2–3 honest sentences. No buzzwords.", example: "Maya started baking for the farmers market in 2013 and opened the Harbor & Hearth shop in 2016.", rows: 4, prompt: "Started in [year] when [founder] noticed [problem] and began [what you did]." },
      { id: "values", label: "What matters in how you work?", help: "Name concrete practice, not abstract value word.", example: "We mill our own flour weekly and donate unsold loaves to the community kitchen each evening.", rows: 3, prompt: "We [concrete practice] so customers get [benefit]." },
      { id: "team", label: "Who will the customer meet?", help: "First name + role is plenty.", example: "Maya (baker and owner) and Theo, who runs the counter most mornings.", rows: 2, prompt: "[Name] ([role]) — [what they handle for the customer]." },
      { id: "credentials", label: "Qualifications / proof (optional)", help: "Licences, years, awards, guarantees.", example: "Food safety certified, chamber member since 2018, 12 years experience.", rows: 2 },
    ],
    ctaGuidance: "Soft CTA: 'Meet us in person' or 'See our work →' linking to Portfolio or Contact. Avoid hard sell here.",
    checklist: ["Story in plain language", "Concrete values/practice", "Team/owner named", "Credentials mentioned", "Portrait photo + alt text planned"],
    imageReminder: "Portrait of founder/team at work. Alt: 'Maya, baker and owner, shaping sourdough at Harbor & Hearth kitchen' — include name, action, location.",
  },
  {
    id: "services",
    name: "Services",
    why: "Clarity converts. If visitors can't match their need to your offer in 30 seconds, they leave.",
    purpose: "Help visitors work out whether you offer what they need.",
    sections: ["List of services (one per line)", "What customer gets per service", "Who each service is for", "Pricing approach", "Each service image + alt text"],
    fields: [
      { id: "list", label: "List what you offer, one per line", help: "Use customer words, not internal jargon.", example: "Daily Artisan Sourdough\nCelebration & Wedding Cakes\nWholesale Breads to Local Cafés", rows: 4, prompt: "[Service 1]\n[Service 2]\n[Service 3] — verb-first, in plain words" },
      { id: "detail", label: "For each, what does the customer get?", help: "One clear sentence + lead time if relevant.", example: "Celebration cakes: designed with you, from £60, three days' notice required.", rows: 4, prompt: "[Service]: [deliverable] in [timeframe], including [what's included]." },
      { id: "pricing", label: "How will you talk about price?", help: "You don't need full price list, but silence loses enquiries.", example: "Loaves from £4.50. Celebration cakes from £60. Wholesale pricing on request.", rows: 2, prompt: "From [price] — [what affects price] — [how to get exact quote]." },
      { id: "cta", label: "Service page CTA", help: "What next step for this page? Book, quote, or contact?", example: "Request a quote for your date" },
    ],
    ctaGuidance: "Each service needs mini-CTA: 'Check availability' / 'Get a quote in 24h'. Link to Contact or Booking page.",
    checklist: ["Services in customer words", "Outcome + timeframe per service", "Price framing (even a range)", "CTA per service", "Service photos + alt text"],
    imageReminder: "One photo per service. Alt: 'Close-up of three-tier vanilla celebration cake with seasonal fruit, Harbor & Hearth bakery' — describe product, not 'image1.jpg'.",
  },
  {
    id: "products",
    name: "Products",
    why: "For shops, the product page is the shop window. Clear photos, specs, and honesty about stock reduce returns.",
    purpose: "List tangible products with what buyers actually compare: price, variants, and availability.",
    sections: ["Product name + SKU if relevant", "Key specs / variants", "Price + what's included", "Stock / made-to-order note", "Product photos + alt text"],
    fields: [
      { id: "list", label: "Products (one per line: name — variants)", help: "e.g. Sourdough Loaf — 500g / 750g, seeded or plain.", example: "Sourdough Loaf — Plain 750g\nSeeded Tin Loaf — 500g\nMorning Pastry Box — 6 mix", rows: 4, prompt: "[Product] — [weight/variant], [key option]" },
      { id: "detail", label: "What does each product include?", help: "Materials, size, dietary info, care instructions.", example: "Naturally leavened, 36h ferment. Contains wheat. Keeps 2 days at room temp.", rows: 4, prompt: "[Product] is [material/process], [size], [care/allergen note]." },
      { id: "pricing", label: "Pricing & fulfilment", help: "Base price, delivery, pickup, or wholesale tier.", example: "Loaves £4.50 pickup, £6 delivered. Pastry boxes £18 (6 pack).", rows: 2 },
      { id: "cta", label: "Products CTA", help: "Shop button wording.", example: "Add to order — pickup Tue–Sat" },
    ],
    ctaGuidance: "CTA: 'Add to basket' or 'Order for pickup' + note cut-off. Don't link to homepage — link to store/checkout or Contact.",
    checklist: ["Products in customer words", "Variants + allergen/care noted", "Price + fulfilment clear", "Stock / lead time set", "Each product photo + alt text"],
    imageReminder: "Each product: front + scale photo. Alt: '750g plain sourdough loaf, unsliced, on bakery counter' — include weight, type, context.",
    policyNote: "If selling online, ensure Privacy + Shipping/Returns pages cover payment data and fulfilment.",
  },
  {
    id: "contact",
    name: "Contact",
    why: "If they can't reach you in one tap, they contact a competitor. Reduce friction to zero.",
    purpose: "Make it effortless to reach you and know when you will reply.",
    sections: ["Contact methods (phone/email/form)", "Hours + closed days", "Response time promise", "Location / service area + map placeholder", "Location photo + alt"],
    fields: [
      { id: "methods", label: "How can people reach you?", help: "Phone, email, form, or messaging app. Two options is usually enough.", example: "Call (555) 0134, or email hello@harborandhearth.com.", rows: 2, prompt: "Call [phone] or email [email] — [fastest method]." },
      { id: "hours", label: "When are you open or available?", help: "Include closed days to prevent wasted trips.", example: "Tue–Sat 7:00 AM – 3:00 PM. Closed Sunday and Monday.", rows: 2 },
      { id: "response", label: "How quickly will you reply?", help: "Set expectation > promise instant.", example: "We reply to all emails and catering requests within one business day." },
      { id: "location", label: "Where are you, or where do you serve?", help: "Address or areas you cover.", example: "412 Harbor Street, Portland — plus delivery across the inner east side.", rows: 2 },
    ],
    ctaGuidance: "Tap-to-call / WhatsApp buttons on mobile. CTA text: 'Call now (555) 0134' or 'Send an enquiry — we reply today'.",
    checklist: ["At least 2 contact routes", "Hours including closed days", "Response time stated", "Address or service area", "Map / storefront photo alt text"],
    imageReminder: "Storefront or team photo. Alt: 'Exterior of Harbor & Hearth at 412 Harbor Street, Portland — blue awning, open sign' — orient a first-time visitor.",
  },
  {
    id: "booking",
    name: "Booking",
    why: "If you sell time (classes, appointments, tastings), friction in booking is lost revenue.",
    purpose: "Let customers understand how booking works before they commit.",
    sections: ["How to book (online / phone)", "Available slots & duration", "What to bring / prepare", "Confirmation & reminder", "Booking page image + alt"],
    fields: [
      { id: "howto", label: "How do customers book?", help: "Link or instruction. Keep steps ≤3.", example: "Book online via Calendly, or call (555) 0134. Instant confirmation by email.", rows: 2, prompt: "Book via [link/method] — [steps] — [confirmation]." },
      { id: "slots", label: "When and how long?", help: "Slots, duration, timezone if relevant.", example: "Tue–Fri 10am–4pm, 60-min slots. Limited weekend tastings at 11am.", rows: 2 },
      { id: "prepare", label: "What should customers prepare or bring?", help: "Pre-work, location, cancellation ask.", example: "Bring the brief and samples if you have them. Arrive 5 min early.", rows: 2 },
      { id: "cta", label: "Booking CTA", help: "Primary button wording.", example: "Check live availability — no payment now" },
    ],
    ctaGuidance: "CTA: 'Check availability' or 'Reserve your slot'. Show 'no charge until confirmed' if true to lower anxiety.",
    checklist: ["Booking method clear", "Duration + slots listed", "Preparation notes", "Confirmation explained", "Alt text for calendar/slot illustration"],
    imageReminder: "Photo of experience/booking in action. Alt: 'Baking workshop participants shaping dough at communal table, Portland'.",
    policyNote: "Must link to Booking & Cancellation Policy page so fees/notice periods are transparent pre-checkout.",
  },
  {
    id: "menu",
    name: "Menu",
    why: "For restaurants/cafés, menu is the decision page. Prices, dietary flags, and availability prevent enquiries about basics.",
    purpose: "Present offerings, prices, and dietary info in customer-scannable form.",
    sections: ["Categories (Mains / Drinks / Specials)", "Item name + price", "Dietary / allergen flags", "Availability / seasonal note", "Dish photos + alt text"],
    fields: [
      { id: "list", label: "Menu items (one per line: name — price)", help: "Include price alignment. Use menu words customers expect.", example: "Sourdough Toast & Eggs — £8.50 (V)\nSeasonal Soup — £6.00 (VG, GF)\nFlat White — £3.80", rows: 5, prompt: "[Dish] — £[price] ([dietary])" },
      { id: "dietary", label: "Dietary & allergen key", help: "Define V/VG/GF, plus cross-contact disclaimer.", example: "V=vegetarian, VG=vegan, GF=gluten-free. Kitchen handles nuts, gluten, dairy — tell us about allergies before ordering.", rows: 2 },
      { id: "availability", label: "Availability / specials note", help: "Seasonal, limited, or 'until sold out'.", example: "Baked fresh until 2pm daily or sold out. Weekend specials Sat 9am.", rows: 2 },
      { id: "cta", label: "Menu CTA", help: "Order, visit, or download PDF?", example: "View today's specials or call to pre-order" },
    ],
    ctaGuidance: "CTA: 'Call to pre-order' or 'View full PDF menu' — don't force ordering if you don't offer online ordering.",
    checklist: ["Prices shown (or 'on request' justified)", "Dietary/allergen key", "Availability note", "CTA appropriate", "Each dish photo Alt text"],
    imageReminder: "Each hero dish: overhead natural light photo. Alt: 'Sourdough toast topped with poached eggs and herbs, served on ceramic plate at Harbor & Hearth' — describe dish, not 'food.jpg'.",
  },
  {
    id: "portfolio",
    name: "Portfolio",
    why: "Show, don't claim. Before/after and client outcomes beat adjectives and reassure hesitant buyers.",
    purpose: "Showcase real work with context customers can evaluate.",
    sections: ["Project / case thumbnail", "Brief + outcome", "Role / scope", "Client quote (optional)", "Each case image + alt text"],
    fields: [
      { id: "projects", label: "Projects (one per line: title — client/type)", help: "Pick 3–6 best, not everything.", example: "Wedding Cake — Emily & Jon, 80 guests\nCafé Wholesale — The Daily Grind espresso bars (6 stores)", rows: 4, prompt: "[Project] — [client/type] — [year/place]" },
      { id: "detail", label: "For each: brief, your role, outcome", help: "1–2 sentences of result, not process alone.", example: "Designed 3-tier vanilla cake for 80 guests, seasonal fruit — delivered and assembled on site.", rows: 4, prompt: "[Brief] — we [role/deliverable] — result: [outcome/measure]." },
      { id: "cta", label: "Portfolio CTA", help: "Invite enquiry with similar scope.", example: "Have a similar event? Get a quote in 24 hours" },
    ],
    ctaGuidance: "CTA per project: 'Start a similar project' links to Contact with prefilled context.",
    checklist: ["3–6 strongest cases", "Brief + outcome per case", "Role clearly stated", "Permission to publish confirmed", "Each image alt describes result"],
    imageReminder: "Before/after or final outcome photo. Alt: 'Three-tier wedding cake with white icing and seasonal berries, 80-guest reception, Harbor & Hearth 2024' — describe result + scale + year.",
    policyNote: "Only show work you have written permission to publish. Blur unsolicited client data.",
  },
  {
    id: "testimonials",
    name: "Testimonials",
    why: "Social proof outperforms self-praise. Short, specific quotes with context feel genuine; generic praise feels fake.",
    purpose: "Gather concise, credible endorsements that map to real hesitations.",
    sections: ["Quote (short + specific)", "Attribution (name / role / place)", "Permission & date", "Photo of work/person (with consent)", "Alt text for any headshot"],
    fields: [
      { id: "quotes", label: "Quotes (one per line: keep short)", help: "Specific beats generic: name the outcome.", example: "\"Our wedding cake was stunning and survived a 2-hour summer delivery perfectly\" — Priya, wedding Aug 2024\n\"Reliable 6am bread drop for our café, 6 days a week\" — Sam, Daily Grind owner", rows: 5, prompt: "\"[specific outcome/detail]\" — [Name], [context/date]" },
      { id: "consent", label: "Consent & how you'll attribute", help: "First name + context is often enough. Confirm permission.", example: "Permission confirmed via email 12 Mar 2024. Display as: Priya (wedding client, Portland) — full name on file.", rows: 2 },
      { id: "cta", label: "Testimonials CTA", help: "Let readers take next step while reassured.", example: "Read more on Google — or book a tasting" },
    ],
    ctaGuidance: "Pair with secondary CTA: 'See portfolio' + 'Read all reviews on Google' — don't fake or edit quotes beyond typos (mark edits with [...]).",
    checklist: ["3–6 specific quotes", "Attribution (role/place/date)", "Written permission recorded", "Quotes unedited or marked [...] if shortened", "Headshot alt text if used, else work photo alt"],
    imageReminder: "If using headshots, get explicit consent. Alt: 'Headshot of Priya, wedding customer, August 2024' — or use photo of work instead of face.",
  },
  {
    id: "faq",
    name: "FAQ",
    why: "Answer questions you already get every week — fewer inbound emails, more confident buyers.",
    purpose: "Answer the questions you already get asked every week.",
    sections: ["Questions as customers say them", "Short direct answers (including 'no')", "Link to relevant page/CTA"],
    fields: [
      { id: "questions", label: "What do customers ask you most often?", help: "Write question exactly as customers say it.", example: "Do you offer gluten-free options?\nCan I order on the same day?\nDo you deliver?", rows: 4 },
      { id: "answers", label: "Your answers, in order", help: "Short, direct, honest — including when answer is no.", example: "We bake dedicated gluten-free loaves on Thursdays only.\nSame-day orders depend on morning inventory, so please call ahead.\nWe deliver within 3 miles for £5 flat rate.", rows: 4 },
    ],
    ctaGuidance: "End FAQs with 'Still have a question? Ask us — we reply within 1 business day' linking to Contact.",
    checklist: ["5–8 most asked questions", "Answers under 40 words", "Honest 'no' where needed", "Link to relevant policy/contact", "No duplicate of service/menu detail"],
    imageReminder: "FAQ rarely needs images. If illustrated, alt: 'Illustration of delivery van indicating 3-mile delivery zone' — decorative images can have empty alt.",
  },
  {
    id: "privacy",
    name: "Privacy Policy",
    why: "Legally required if you collect enquiries, bookings, or analytics. Plain language builds trust; copy-paste risks breaches.",
    purpose: "Plain-language disclosure of how customer data, contact info, and analytics are handled.",
    sections: ["Data controller & contact", "What data you collect", "How you use it", "Third-party processors & security", "Customer rights & deletion"],
    fields: [
      { id: "controller", label: "Business Name & Data Controller Details", help: "Who operates site and who to contact for data inquiries.", example: "Harbor & Hearth LLC, 412 Harbor Street, Portland OR. Data contact: privacy@harborhearthbakery.com", rows: 2 },
      { id: "collection", label: "What customer data do you collect?", help: "Form entries, order details, newsletter emails, analytics.", example: "We only collect information you voluntarily provide: your name, email, phone, and delivery address when ordering or submitting inquiries. We use anonymous analytics.", rows: 3 },
      { id: "usage", label: "How do you use this information?", help: "Fulfilling orders, replies, receipts, updates.", example: "Your data is used solely to respond to inquiries, process orders, and deliver services. We never sell contact details.", rows: 3 },
      { id: "thirdparties", label: "Third-party tools and processors", help: "Payment processors (Stripe, Square), hosting, email.", example: "Payments via Stripe. No raw card numbers stored. Analytics via Google Analytics.", rows: 3 },
      { id: "rights", label: "Customer rights & deletion requests", help: "How visitors request access, correction, deletion.", example: "You may request a copy or deletion of personal data by emailing privacy@harborhearthbakery.com.", rows: 2 },
    ],
    ctaGuidance: "CTA not salesy: 'Questions about privacy? Email privacy@…' . Link from footer and checkout/contact forms.",
    checklist: ["Controller + contact", "Data collected listed", "Purpose stated", "Third parties named", "Rights & deletion route", "Last updated date planned"],
    imageReminder: "Privacy page needs no images. If you add a trust badge illustration, alt must be empty or descriptive: 'Shield icon indicating data handling policy'.",
    policyNote: "Required if you use contact forms, booking, analytics, or store customer details. This draft is plain-language starter copy — have local counsel review before publishing. Update 'Last updated' on changes.",
  },
  {
    id: "shipping",
    name: "Shipping & Returns",
    why: "Unclear delivery, timing, and returns cause purchase anxiety and disputes. State it before checkout.",
    purpose: "Set fulfilment expectations: where you ship/deliver, timing, costs, and returns/refunds.",
    sections: ["Service area / shipping regions", "Delivery timing & cost", "Pickup option if any", "Returns / refunds eligibility & window", "Damaged / missing order process"],
    fields: [
      { id: "where", label: "Where do you ship or deliver?", help: "Postcode, radius, or regions. Be specific.", example: "Delivery within 5 km of 412 Harbor Street, Portland. Pickup available Tue–Sat 7am–2pm. No shipping outside Portland metro.", rows: 2, prompt: "We deliver to [area] / ship to [regions]. Pickup at [address/hours]." },
      { id: "timing", label: "Timing & fees", help: "Cut-off, SLA, flat fee or free threshold.", example: "Order by 4pm for next-day delivery. £5 flat delivery within 3 miles. Free delivery over £50.", rows: 2 },
      { id: "returns", label: "Returns, refunds & exchanges", help: "Window, condition, non-returnable (food, custom).", example: "Perishable food and custom cakes are non-returnable. Other goods: 14-day return if unused, you cover return shipping. Refunds within 5 business days.", rows: 3, prompt: "[Non-returnable categories] excluded. [Window] refund for [condition] — [where to request]." },
      { id: "issues", label: "Damaged or missing orders & contact", help: "What customer should do immediately.", example: "If damaged, email hello@harborandhearth.com within 24h with photo. We replace or refund within 48h.", rows: 2 },
    ],
    ctaGuidance: "CTA: 'Questions before ordering? Contact us — we reply within 24h' . Link this page from product/checkout pages.",
    checklist: ["Service area explicit", "Timing + fees stated", "Return window + exclusions", "Damage process + contact", "Linked from Products/Contact"],
    imageReminder: "Optional: delivery zone map. Alt: 'Map showing 5 km delivery radius around Harbor & Hearth, Portland' — describe coverage, not 'map image'.",
    policyNote: "Required if you sell physical goods, deliver, or accept returns. Keep consistent with Privacy and checkout copy. Review annually.",
  },
  {
    id: "cancellation",
    name: "Booking & Cancellation Policy",
    why: "Time is inventory. Clear notice periods and fees prevent awkward disputes and protect both parties.",
    purpose: "Clear expectations on bookings, pricing, cancellations, rescheduling, and refunds.",
    sections: ["Pricing, deposits & payment terms", "Cancellation notice required", "Rescheduling terms", "No-show / late policy", "Liability & jurisdiction"],
    fields: [
      { id: "pricing_payment", label: "Pricing, quotes & payment terms", help: "Deposits, quote validity, payment due dates.", example: "All prices in USD. Custom event orders require 50% non-refundable deposit, balance due 48h before delivery.", rows: 3 },
      { id: "cancellation_refunds", label: "Cancellation & rescheduling & refunds", help: "Clear rules prevent disputes.", example: "Standard orders: cancel up to 24h for full refund. Custom cakes: 7 days for reschedule, 72h for partial refund.", rows: 3 },
      { id: "liability", label: "Liability, allergens & limitations", help: "Allergy warnings, third-party delays, scope limits.", example: "Kitchen handles nuts, gluten, dairy. Tell us about severe allergies before ordering. Services 'as is' beyond our quality guarantee.", rows: 3 },
      { id: "jurisdiction", label: "Governing law & contact", help: "Which laws apply, where to send questions.", example: "Governed by laws of Oregon. Questions to legal@harborhearthbakery.com.", rows: 2 },
    ],
    ctaGuidance: "Link before payment: 'By booking you agree to our Booking & Cancellation Policy'. Keep CTA reassuring: 'Reschedule free up to 7 days before'.",
    checklist: ["Deposit/refund stated", "Notice periods (24h/7 days)", "Reschedule vs cancel defined", "Liability/allergen disclaimer", "Contact for policy questions"],
    imageReminder: "No images needed. If adding calendar illustration, alt: 'Calendar illustration showing 7-day cancellation window'.",
    policyNote: "Required if you take bookings, deposits, or custom orders. Pair with Booking page and checkout. Legal review recommended.",
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
    tagline: "Local food, morning deliveries, foot traffic",
    data: {
      home: { headline: "Handcrafted sourdough loaves, artisan pastries, and specialty espresso roasted locally in Portland.", audience: "Morning commuters, neighborhood families, offices ordering catering, and bespoke wedding cake clients.", proof: "Over 10 years serving the Pearl District with 500+ five-star reviews. 100% organic flour, baked fresh at 4:00 AM daily.", cta: "Browse our daily bakery menu or reserve a custom cake." },
      about: { story: "Harbor & Hearth began in 2014 at the Saturday farmers market, inspired by European hearth baking.", values: "We source flour from regenerative family farms and donate 100% of unsold loaves to community kitchens.", team: "Founded by Maya (Head Baker) with our friendly front-of-house crew.", credentials: "12 years, food safety certified, chamber member since 2018." },
      services: { list: "Daily Sourdough & Hearth Breads\nSweet & Savory Morning Pastries\nCustom Celebration & Wedding Cakes\nWholesale Delivery to Cafés", detail: "Daily Breads: 36h fermented. Custom Cakes: tailored seasonal flavors, 3 business days notice.", pricing: "Artisan loaves from $7. Pastries from $4. Cakes from $75.", cta: "Request a quote for your date" },
      products: { list: "Sourdough Loaf — 750g plain or seeded\nSeeded Tin Loaf — 500g\nMorning Pastry Box — 6 mix", detail: "36h fermented, contains wheat. Keeps 2 days at room temp.", pricing: "Loaves $7 pickup / $9 delivered. Pastry box $18.", cta: "Order for pickup Tue–Sat" },
      contact: { methods: "Call (555) 234-5678 or email hello@harborhearthbakery.com", hours: "Tue–Sat 7am–3pm (until sold out). Closed Sun & Mon.", response: "We respond to cake enquiries within 24 business hours.", location: "412 Harbor Street, Portland, OR 97209" },
      booking: { howto: "Book tastings via Calendly or call (555) 234-5678.", slots: "Tue–Fri 10am–4pm, 60-min. Weekend tastings 11am.", prepare: "Bring inspo photos and guest count.", cta: "Check live availability" },
      menu: { list: "Sourdough Toast & Eggs — $8.50 (V)\nSeasonal Soup — $6 (VG, GF)\nFlat White — $3.80", dietary: "V=vegetarian, VG=vegan, GF=gluten-free. Kitchen handles nuts/dairy.", availability: "Until 2pm daily or sold out.", cta: "View today's specials" },
      portfolio: { projects: "Wedding Cake — Emily & Jon, 80 guests\nWholesale — Daily Grind (6 stores)", detail: "3-tier vanilla cake, seasonal fruit — delivered and assembled on site.", cta: "Start a similar project" },
      testimonials: { quotes: "\"Stunning cake and perfect delivery\" — Priya, wedding Aug 2024\n\"Reliable 6am drop for our café\" — Sam, Daily Grind", consent: "Permission on file, first name + context displayed.", cta: "Read more on Google" },
      faq: { questions: "Do you have vegan or gluten-sensitive options?\nHow far in advance for celebration cakes?\nCan I freeze sourdough?", answers: "Yes — vegan rolls and gluten-friendly seed loaves Thu.\nAt least 3 business days.\nYes, freezes well sliced up to 3 months." },
      privacy: { controller: "Harbor & Hearth Bakery LLC, 412 Harbor Street, Portland OR. privacy@harborhearthbakery.com", collection: "Names, phone, email, address when you order or message us.", usage: "To prepare orders and coordinate delivery. Never sold.", thirdparties: "Square/Stripe payments, no card storage.", rights: "Request deletion anytime via privacy@." },
      shipping: { where: "Delivery within 5 km of 412 Harbor Street. Pickup Tue–Sat 7am–2pm.", timing: "Order by 4pm for next day. $5 flat within 3 miles.", returns: "Perishable & custom non-returnable. Other goods 14-day return if unused.", issues: "Damaged? Email within 24h with photo." },
      cancellation: { pricing_payment: "Full payment at online order. Custom events 50% deposit.", cancellation_refunds: "Standard pastry orders cancel 24h prior. Custom cakes 3 business days.", liability: "Kitchen handles nuts, dairy, wheat, sesame.", jurisdiction: "Governed by Oregon law." },
    },
  },
  {
    name: "Professional Consulting",
    icon: "💼",
    tagline: "B2B advisory, fractional leadership",
    data: {
      home: { headline: "Fractional CFO leadership for high-growth tech startups.", audience: "Seed to Series B founders and venture-backed executives.", proof: "Guided 40+ startups through $85M in funding, avg 18% burn reduction.", cta: "Book a complimentary 30-min roadmap audit." },
      about: { story: "Founded by ex Big-4 audit leaders and founders tired of agency bloat.", values: "Data integrity, plain-English communication, forward-looking cash models.", team: "Led by Marcus Vance (CPA & Fractional CFO).", credentials: "CPA, 15 years, SOC-2 compliant." },
      services: { list: "Fractional CFO & Cash Management\nFundraising Due Diligence\nBoard Reporting & Unit Economics", detail: "Weekly leadership over budgets, runway, strategy.", pricing: "Retainers from $2,500/mo, no lock-in.", cta: "Schedule an audit" },
      products: { list: "Financial Model Template — Excel + Notion\nBoard Deck — 12-slide investor pack", detail: "Includes 3-year forecast and unit economics.", pricing: "Templates $149. 1:1 review add-on $500.", cta: "Buy template + review" },
      contact: { methods: "Book via Calendly or email advisory@vancefinancial.com", hours: "Mon–Fri 9am–6pm EST", response: "Executive response within 4 hours.", location: "Global remote via secure video." },
      booking: { howto: "Book 30-min audit on Calendly, confirmation email instantly.", slots: "Mon–Thu 9am–4pm EST, 30 & 60-min.", prepare: "Bring last 3 months P&L and cap table.", cta: "Check availability" },
      menu: { list: "Strategy Session — $300 (60m)\nDeep Dive — $900 (half-day)", dietary: "N/A — service only.", availability: "Book 2 weeks ahead for deep dives.", cta: "See service comparison" },
      portfolio: { projects: "Series A Prep — SaaS, $12M raised\nBurn Reduction — Marketplace, -22% burn", detail: "Led model rebuild and board prep — closed in 8 weeks.", cta: "Discuss similar outcome" },
      testimonials: { quotes: "\"Cut our burn 18% in one quarter\" — CTO, Series A SaaS", consent: "LinkedIn-published, permission confirmed.", cta: "Read LinkedIn reviews" },
      faq: { questions: "When to hire fractional vs full-time CFO?\nWhat software?\nHow fast to onboard?", answers: "$500k–$10M revenue sweet spot.\nQBO, Xero, Stripe, Ramp, NetSuite.\n~5 business days." },
      privacy: { controller: "Vance Financial Advisory — legal@vancefinancial.com", collection: "Executive names, corporate email, metrics shared.", usage: "For models and compliance deliverables.", thirdparties: "SOC-2 vault services.", rights: "Export or shred on request." },
      shipping: { where: "No physical shipping — digital delivery via secure portal.", timing: "Deliverables within 5 business days of kickoff.", returns: "Retainer: 30-day notice, pro-rata refund of unearned fees.", issues: "Issue? Email legal@ within 7 days." },
      cancellation: { pricing_payment: "Monthly in advance, ACH/wire within 15 days.", cancellation_refunds: "Cancel with 30 days notice, unearned refunded.", liability: "Strategic analysis, not statutory audit.", jurisdiction: "Delaware law." },
    },
  },
  {
    name: "Trades & Home Services",
    icon: "🔨",
    tagline: "Emergency repair, plumbing, HVAC",
    data: {
      home: { headline: "Licensed, same-day residential plumbing and water heater installation across Greater Austin.", audience: "Homeowners, landlords, property managers needing dependable repairs.", proof: "Master Plumber License #42981. 1,200+ five-star reviews. Upfront pricing.", cta: "Call (512) 555-0199 for dispatch or book online." },
      about: { story: "Family-owned since 2008. Turn up on time, protect your floors, charge fair fixed rates.", values: "Honest diagnostics: replace only when repair isn't safe or cost-effective.", team: "Master Plumber David Miller + certified, background-checked techs.", credentials: "Licensed, insured, background-checked." },
      services: { list: "Emergency Drain Cleaning\nWater Heater Replacement\nLeak Detection & Repiping", detail: "Same-day water heater replacement with 10-year warranty.", pricing: "Free on-site estimates standard hours.", cta: "Book estimate" },
      products: { list: "Water Heater — Tankless 50-gal\nWhole-Home Filter — Carbon + softener", detail: "10-year warranty, installed same-day.", pricing: "From $1,200 installed.", cta: "Get installed price" },
      contact: { methods: "24/7 Phone (512) 555-0199 | dispatch@millerplumbingtx.com", hours: "Mon–Sat 7am–7pm + 24/7 emergency.", response: "Dispatched within 45 min across Travis & Williamson.", location: "North Austin — Austin, Round Rock, Cedar Park, Pflugerville." },
      booking: { howto: "Book estimate online or call 24/7.", slots: "Mon–Sat 7am–7pm, emergency 24/7.", prepare: "Clear access to valve/heater area.", cta: "Book free estimate" },
      menu: { list: "Drain Clear — from $129\nWater Heater Swap — from $1,200", dietary: "N/A", availability: "Same-day if called before noon.", cta: "View pricing" },
      portfolio: { projects: "Whole-Home Repipe — 3-bed, Austin\nHydro-Jet — Historic home", detail: "Repipe in 2 days, minimal drywall cut.", cta: "See more jobs" },
      testimonials: { quotes: "\"On time and no overtime surprise\" — Homeowner, Austin", consent: "Google reviews, permission implied public.", cta: "Read 1,200 reviews" },
      faq: { questions: "Weekend surcharges?\nLicensed & insured?\nWarranty?", answers: "No hidden weekend surcharge for scheduled.\nYes, 100% licensed/insured.\n1-year labor guarantee." },
      privacy: { controller: "Miller Plumbing LLC — dispatch@millerplumbingtx.com", collection: "Homeowner name, address, phone, job notes.", usage: "Routing techs and warranties.", thirdparties: "Twilio SMS, Housecall Pro / Stripe.", rights: "Opt out via STOP." },
      shipping: { where: "On-site service — no shipping. Parts ordered if needed.", timing: "Same-day dispatch if before noon.", returns: "No fee cancel 2h prior. Warranty claims within 1 year.", issues: "Issue? Call dispatch 24/7." },
      cancellation: { pricing_payment: "Due on completion. Cards, checks, financing.", cancellation_refunds: "Cancel 2h prior no fee.", liability: "1-year workmanship warranty. Manufacturer hardware warranty.", jurisdiction: "Texas law." },
    },
  },
  {
    name: "Creative Studio",
    icon: "🎨",
    tagline: "Brand, Shopify, photography",
    data: {
      home: { headline: "Brand identity and high-converting Shopify design for ambitious lifestyle brands.", audience: "DTC founders, boutique retailers, modern creators.", proof: "Featured on Awwwards. Stores generated $40M+ revenue.", cta: "Explore portfolio or book discovery call." },
      about: { story: "Started as duo tired of cookie-cutter templates and sluggish turnarounds.", values: "Craft aesthetics backed by conversion science — fast, clean, zero clutter.", team: "Elena & Noah — Brand Strategist & Senior Shopify Engineer.", credentials: "Shopify Plus certified." },
      services: { list: "Custom Shopify Design & Dev\nBrand Identity & Guidelines\nPackaging Design\nCRO Audits", detail: "Bespoke, mobile-first on Shopify OS 2.0.", pricing: "Brand from $3,500. Shopify from $6,000.", cta: "Book discovery call" },
      products: { list: "Brand Guidelines Template — PDF\nShopify Starter Theme — OS 2.0", detail: "Sections, video walkthroughs included.", pricing: "From $199.", cta: "Preview theme" },
      contact: { methods: "Form or studio@lumindesign.co", hours: "Mon–Thu 10am–5pm PST", response: "Respond within 2 business days.", location: "Seattle, WA — remote worldwide." },
      booking: { howto: "Book 15-min discovery via Calendly.", slots: "Mon–Thu 10am–5pm PST.", prepare: "Bring mood board and competitor links.", cta: "Book discovery call" },
      menu: { list: "Brand Sprint — $3,500\nShopify Build — from $6,000", dietary: "N/A", availability: "4–8 weeks from kickoff.", cta: "View packages" },
      portfolio: { projects: "Lifestyle DTC — +64% conversion\nPackaging — Eco unboxing", detail: "Re-platform to OS 2.0, sub-2s load.", cta: "View case study" },
      testimonials: { quotes: "\"Best investment — store now converts 3x\" — Founder, DTC", consent: "Testimonial release signed.", cta: "Read client stories" },
      faq: { questions: "How long does project take?\nCan I edit after launch?\nRetainer?", answers: "4–8 weeks.\nYes, drag-and-drop + video training.\nYes, monthly growth retainer." },
      privacy: { controller: "Lumin Design Studio — privacy@lumindesign.co", collection: "Contact, brief, asset files.", usage: "To execute design deliverables.", thirdparties: "Figma, Google Drive, Stripe.", rights: "Archival or deletion on request." },
      shipping: { where: "No physical shipping — Figma files + repo access.", timing: "Handoff within 48h of final payment.", returns: "Deposits non-refundable once concept begins.", issues: "Revisions per SOW." },
      cancellation: { pricing_payment: "50% kickoff, 50% launch.", cancellation_refunds: "Deposits cover discovery, non-refundable once design begins.", liability: "IP transfers on final payment.", jurisdiction: "Washington law." },
    },
  },
];

const JARGON_WORDS = ["cutting-edge", "game-changer", "game-changing", "supercharge", "synergy", "leverage", "disrupt", "paradigm", "rockstar", "ninja", "world-class", "best-of-breed", "holistic", "seamless", "next-gen"];

const STATUS_OPTIONS: ContentDraftStatus[] = ["not_started", "draft", "needs_review", "ready_to_publish"];

export function ContentBuilder() {
  const { state, saveDraft, setDraftStatus } = useStore();
  const [activePageId, setActivePageId] = useState(PAGES[0]!.id);
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "mobile">("desktop");
  const [exportFormat, setExportFormat] = useState<"html" | "markdown" | "text">("html");

  const [values, setValues] = useState<Record<string, Record<string, string>>>(() => {
    const initial: Record<string, Record<string, string>> = {};
    for (const p of PAGES) initial[p.id] = state.drafts[p.id]?.fields ?? {};
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

  const applyTemplate = (template: IndustryTemplate) => {
    setValues((prev) => {
      const merged: Record<string, Record<string, string>> = { ...prev };
      for (const [pageId, fields] of Object.entries(template.data)) {
        merged[pageId] = { ...(merged[pageId] ?? {}), ...fields };
        saveDraft(pageId, merged[pageId]!);
      }
      return merged;
    });
    toast.success(`Loaded "${template.name}" starter copy — edit drafts before publishing.`);
  };

  const prefillFromProfile = () => {
    const p = state.business;
    const bName = businessName;
    const category = p.category || "Professional Services";
    const loc = p.location || p.address || "Local and regional service";
    const contactEmail = p.businessEmail || p.ownerContact || `hello@${domain}`;
    const contactPhone = p.phone || p.whatsappNumber || "(555) 123-4567";
    const hours = p.hoursDetail || p.openingHours || "Monday – Friday: 9:00 AM – 5:00 PM";
    const desc = p.description || `${category} dedicated to dependable, high-quality service.`;
    const services = p.servicesOffered || "Consultation & Tailored Solutions\nOn-site Delivery\nCustom Project Execution";
    const targetCust = p.targetCustomers || "Local homeowners, professionals, and businesses.";
    const diff = p.differentiator || p.qualifications || "Over a decade of expertise, transparent pricing, and 100% satisfaction guarantee.";
    const generated: Record<string, Record<string, string>> = {
      home: { headline: desc.length > 20 ? desc : `${bName} — Trusted ${category} in ${loc}.`, audience: targetCust, proof: diff, cta: p.primaryCustomerAction === "phone_call" ? `Call ${contactPhone} for immediate assistance.` : `Book an appointment online or contact ${contactEmail} today.` },
      about: { story: `${bName} was founded with a mission: dependable, transparent, top-tier ${category.toLowerCase()} without the headaches.`, values: `We prioritize transparent pricing, prompt communication, and exceptional craftsmanship.`, team: `Led by founders and dedicated specialists ready to assist you.`, credentials: p.qualifications || "" },
      services: { list: services, detail: `Executed with attention to detail, clear turnarounds, and upfront estimates before work begins.`, pricing: `Transparent rates. Contact for a personalized estimate.`, cta: `Request a quote` },
      products: { list: services, detail: `Each product includes careful sourcing and quality checks.`, pricing: `From transparent base price — contact for bulk/wholesale.`, cta: `Order via ${contactEmail} or ${contactPhone}` },
      contact: { methods: `Phone: ${contactPhone} | Email: ${contactEmail}`, hours, response: `We respond within 1 business day.`, location: loc },
      booking: { howto: `Book via ${p.bookingUrl || "booking link or call " + contactPhone} — confirmation by email.`, slots: hours, prepare: `Bring any relevant details and arrive a few minutes early.`, cta: `Check availability` },
      menu: { list: services, dietary: `V=vegetarian, VG=vegan, GF=gluten-free. Tell us about allergies before ordering.`, availability: `Available ${hours} or until sold out.`, cta: `Call ${contactPhone} to order` },
      portfolio: { projects: services, detail: `Each project tailored to client goals with measured outcomes.`, cta: `Start a similar project — contact ${contactEmail}` },
      testimonials: { quotes: `“Professional, on time, and excellent result” — Happy customer`, consent: `Permission on file — first name and context.`, cta: `Read more reviews or contact us` },
      faq: { questions: `What areas do you serve?\nHow do I get an estimate?\nWhat payment methods?`, answers: `We serve ${loc} and surroundings.\nCall ${contactPhone} or use our contact form.\nMajor cards, bank transfers, and electronic payments.` },
      privacy: { controller: `${bName} (${loc}). Primary Data Contact: ${contactEmail}`, collection: `Contact details (name, email, phone, address) provided voluntarily via inquiry forms, orders, or booking requests.`, usage: `To fulfil requests, provide support, and send updates.`, thirdparties: `We use standard third-party providers for hosting, email, and secure payments. We never sell personal information.`, rights: `Request access/correction/deletion via ${contactEmail}.` },
      shipping: { where: `Service area: ${loc}. ${p.deliveryNotes || "Delivery/pickup options on request."}`, timing: `Timing per agreement — we confirm at booking.`, returns: `Perishable/custom non-returnable; other goods per 14-day policy — contact ${contactEmail}.`, issues: `For issues, contact ${contactPhone} or ${contactEmail} within 24h.` },
      cancellation: { pricing_payment: `Quotes valid 30 days. Payment terms confirmed before work begins.`, cancellation_refunds: `Appointments may be rescheduled/cancelled up to 24h in advance. Custom materials refund per agreement.`, liability: `Services provided 'as is' to extent permitted by law. Allergens/risks disclosed before purchase.`, jurisdiction: `Governance per local laws applicable to ${loc}. Contact ${contactEmail}.` },
    };
    setValues((prev) => {
      const merged = { ...prev, ...generated };
      for (const [pid, fields] of Object.entries(generated)) saveDraft(pid, fields);
      return merged;
    });
    toast.success("Generated tailored drafts for 13 pages from your Business Profile — review and set status per page.");
  };

  const activePage = PAGES.find((p) => p.id === activePageId) || PAGES[0]!;
  const activePageData = useMemo(() => values[activePageId] || {}, [values, activePageId]);
  const activeStatus: ContentDraftStatus = (state.drafts[activePageId]?.status as ContentDraftStatus) ?? (Object.values(activePageData).some((v) => v.trim().length > 0) ? "draft" : "not_started");

  const activePageStats = useMemo(() => {
    const text = Object.values(activePageData).join(" ");
    const words = text.trim().split(/\s+/).filter((w) => w.length > 0);
    const wordCount = words.length;
    const charCount = text.length;
    const readTimeSec = Math.max(10, Math.round((wordCount / 200) * 60));
    const lower = text.toLowerCase();
    const foundJargon = JARGON_WORDS.filter((j) => lower.includes(j));
    const filled = Object.values(activePageData).filter((v) => v.trim().length > 0).length;
    const total = activePage.fields.length;
    const completeness = total ? Math.round((filled / total) * 100) : 0;
    return { wordCount, charCount, readTimeSec, foundJargon, filled, total, completeness };
  }, [activePageData, activePage]);

  const generateHtmlForPage = (pageId: string) => {
    const d = values[pageId] || {};
    const bName = businessName;
    const pageObj = PAGES.find((p) => p.id === pageId);
    if (!pageObj) return "";
    // Per-page semantic HTML generators with fallback generic
    if (pageId === "home") return `<!-- ${bName} — Homepage (DRAFT — paste into your website builder) -->\n<section class="hero-banner">\n  <div class="container">\n    <h1>${d.headline || "Welcome to " + bName}</h1>\n    <p class="audience-lead">${d.audience || "Crafted for customers who value quality."}</p>\n    <div class="cta-group">\n      <a href="/contact" class="btn btn-primary">${d.cta || "Get in Touch Today"}</a>\n    </div>\n  </div>\n</section>\n<section class="trust-proof">\n  <div class="container">\n    <h2>Why Choose Us</h2>\n    <p>${d.proof || "Dedicated to exceptional service."}</p>\n  </div>\n</section>`;
    if (pageId === "about") return `<!-- ${bName} — About Us (DRAFT) -->\n<section class="about-story">\n  <div class="container">\n    <h1>Our Story</h1>\n    <p>${d.story || "Founded with passion for excellence."}</p>\n    <h2>How We Work</h2>\n    <p>${d.values || "Quality, honesty, clear communication."}</p>\n    <h2>Meet the Team</h2>\n    <p>${d.team || "A dedicated team ready to support you."}</p>\n    ${d.credentials ? `<p><strong>Credentials:</strong> ${d.credentials}</p>` : ""}\n  </div>\n</section>`;
    if (pageId === "services") {
      const items = (d.list || "").split("\n").filter((l) => l.trim()).map((l) => `    <li><strong>${l}</strong></li>`).join("\n");
      return `<!-- ${bName} — Services (DRAFT) -->\n<section class="services-overview">\n  <div class="container">\n    <h1>What We Offer</h1>\n    <ul class="service-list">\n${items || "    <li>Custom Service</li>"}\n    </ul>\n    <h2>Details</h2>\n    <p>${(d.detail || "").replace(/\n/g, "<br />\n") || "Tailored solutions."}</p>\n    <h2>Pricing</h2>\n    <p>${d.pricing || "Transparent pricing. Contact for quotes."}</p>\n    <p><a href="/contact">${d.cta || "Request a quote"}</a></p>\n  </div>\n</section>`;
    }
    if (pageId === "products") {
      const items = (d.list || "").split("\n").filter((l) => l.trim()).map((l) => `    <li><strong>${l}</strong></li>`).join("\n");
      return `<!-- ${bName} — Products (DRAFT) -->\n<section class="products">\n  <div class="container">\n    <h1>Products</h1>\n    <ul>\n${items || "    <li>Product — variant</li>"}\n    </ul>\n    <p>${(d.detail || "").replace(/\n/g, "<br />\n")}</p>\n    <p><strong>Pricing:</strong> ${d.pricing || ""}</p>\n    <p><a href="/contact">${d.cta || "Order now"}</a></p>\n    <p><em>Image reminder:</em> Each product needs front photo + alt text describing weight/type.</p>\n  </div>\n</section>`;
    }
    if (pageId === "contact") return `<!-- ${bName} — Contact (DRAFT) -->\n<section class="contact-section">\n  <div class="container">\n    <h1>Get in Touch</h1>\n    <p>${d.methods || "Email or call."}</p>\n    <h3>Opening Hours</h3><p>${d.hours || ""}</p>\n    <h3>Location</h3><p>${d.location || ""}</p>\n    <h3>Response Time</h3><p>${d.response || ""}</p>\n  </div>\n</section>`;
    if (pageId === "booking") return `<!-- ${bName} — Booking (DRAFT) -->\n<section class="booking">\n  <div class="container">\n    <h1>Book an Appointment</h1>\n    <p><strong>How to book:</strong> ${d.howto || ""}</p>\n    <p><strong>Slots:</strong> ${d.slots || ""}</p>\n    <p><strong>Prepare:</strong> ${d.prepare || ""}</p>\n    <p><a href="/contact" class="btn">${d.cta || "Check availability"}</a></p>\n    <p><em>See Booking &amp; Cancellation Policy before confirming.</em></p>\n  </div>\n</section>`;
    if (pageId === "menu") {
      const items = (d.list || "").split("\n").filter((l) => l.trim()).map((l) => `    <li>${l}</li>`).join("\n");
      return `<!-- ${bName} — Menu (DRAFT) -->\n<section class="menu">\n  <div class="container">\n    <h1>Menu</h1>\n    <ul>\n${items || "    <li>Item — £0.00</li>"}\n    </ul>\n    <p><strong>Dietary key:</strong> ${d.dietary || ""}</p>\n    <p><strong>Availability:</strong> ${d.availability || ""}</p>\n    <p>${d.cta || ""}</p>\n  </div>\n</section>`;
    }
    if (pageId === "portfolio") return `<!-- ${bName} — Portfolio (DRAFT) -->\n<section class="portfolio">\n  <div class="container">\n    <h1>Portfolio — Selected Work</h1>\n    <p>${(d.projects || "").split("\n").filter(Boolean).map((l) => `<strong>${l}</strong>`).join("<br />\n") || "Add 3–6 best cases."}</p>\n    <p>${(d.detail || "").replace(/\n/g, "<br />\n")}</p>\n    <p><a href="/contact">${d.cta || "Start a similar project"}</a></p>\n  </div>\n</section>`;
    if (pageId === "testimonials") return `<!-- ${bName} — Testimonials (DRAFT) -->\n<section class="testimonials">\n  <div class="container">\n    <h1>What Customers Say</h1>\n    ${(d.quotes || "").split("\n").filter(Boolean).map((q) => `    <blockquote><p>${q}</p></blockquote>`).join("\n") || "    <p>Add 3–6 specific quotes with permission.</p>"}\n    <p><em>Consent:</em> ${d.consent || ""}</p>\n    <p><a href="/contact">${d.cta || "Book a tasting"}</a></p>\n  </div>\n</section>`;
    if (pageId === "faq") {
      const qList = (d.questions || "").split("\n").filter((q) => q.trim().length > 0);
      const aList = (d.answers || "").split("\n").filter((a) => a.trim().length > 0);
      const faqs = qList.map((q, i) => `  <div class="faq-item">\n    <h3>${q}</h3>\n    <p>${aList[i] || "Contact our team for details."}</p>\n  </div>`).join("\n\n");
      return `<!-- ${bName} — FAQ (DRAFT) -->\n<section class="faq-section">\n  <div class="container">\n    <h1>Frequently Asked Questions</h1>\n${faqs || "  <p>Have questions? Contact us.</p>"}\n  </div>\n</section>`;
    }
    if (pageId === "privacy") return `<!-- ${bName} — Privacy Policy (DRAFT — seek local legal review) -->\n<section class="legal-page privacy-policy">\n  <div class="container">\n    <h1>Privacy Policy</h1>\n    <p class="policy-updated">Last Updated: ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })} — DRAFT</p>\n    <h2>1. Data Controller</h2><p>${d.controller || bName}</p>\n    <h2>2. Information We Collect</h2><p>${d.collection || ""}</p>\n    <h2>3. How We Use It</h2><p>${d.usage || ""}</p>\n    <h2>4. Third-Party Processors</h2><p>${d.thirdparties || ""}</p>\n    <h2>5. Your Rights</h2><p>${d.rights || ""}</p>\n  </div>\n</section>`;
    if (pageId === "shipping") return `<!-- ${bName} — Shipping & Returns (DRAFT) -->\n<section class="legal-page shipping-returns">\n  <div class="container">\n    <h1>Shipping &amp; Returns</h1>\n    <p class="updated">Last updated: ${new Date().toLocaleDateString()}</p>\n    <h2>Where We Deliver / Ship</h2><p>${d.where || ""}</p>\n    <h2>Timing & Fees</h2><p>${d.timing || ""}</p>\n    <h2>Returns & Refunds</h2><p>${d.returns || ""}</p>\n    <h2>Damaged or Missing Orders</h2><p>${d.issues || ""}</p>\n  </div>\n</section>`;
    if (pageId === "cancellation") return `<!-- ${bName} — Booking & Cancellation Policy (DRAFT — seek legal review) -->\n<section class="legal-page cancellation">\n  <div class="container">\n    <h1>Booking &amp; Cancellation Policy</h1>\n    <p class="updated">Last updated: ${new Date().toLocaleDateString()}</p>\n    <h2>1. Pricing & Payment</h2><p>${d.pricing_payment || ""}</p>\n    <h2>2. Cancellation & Rescheduling</h2><p>${d.cancellation_refunds || ""}</p>\n    <h2>3. Liability & Allergens</h2><p>${d.liability || ""}</p>\n    <h2>4. Governing Law</h2><p>${d.jurisdiction || ""}</p>\n  </div>\n</section>`;
    // generic fallback
    return `<!-- ${bName} — ${pageObj.name} (DRAFT) -->\n<section class="page-${pageId}">\n  <div class="container">\n    <h1>${pageObj.name}</h1>\n${pageObj.fields.map((f) => `    <h2>${f.label}</h2>\n    <p>${d[f.id] || ""}</p>`).join("\n")}\n  </div>\n</section>`;
  };

  const generateMarkdownForPage = (pageId: string) => {
    const d = values[pageId] || {};
    const pageObj = PAGES.find((p) => p.id === pageId);
    if (!pageObj) return "";
    const status = state.drafts[pageId]?.status ?? "draft";
    const lines = [`# ${businessName} — ${pageObj.name}`, `> ${pageObj.why}`, `> Status: ${CONTENT_DRAFT_STATUS_LABEL[status as ContentDraftStatus]} — DRAFT (not auto-published)`, `> Recommended sections: ${pageObj.sections.join(" • ")}`, ``, `**CTA guidance:** ${pageObj.ctaGuidance}`, ``, `**Image / alt reminder:** ${pageObj.imageReminder}`, ``];
    if (pageObj.policyNote) lines.push(`> **Policy note:** ${pageObj.policyNote}`, ``);
    lines.push(...pageObj.fields.map((f) => `### ${f.label}\n${f.prompt ? `*Prompt: ${f.prompt}*\n` : ""}${d[f.id] || "_Not written yet._"}\n`));
    lines.push(`---\n**Checklist:** ${pageObj.checklist.map((c) => `- [ ] ${c}`).join("\n")}\n`);
    return lines.join("\n");
  };

  const generateTextForPage = (pageId: string) => {
    const d = values[pageId] || {};
    const pageObj = PAGES.find((p) => p.id === pageId);
    if (!pageObj) return "";
    const status = state.drafts[pageId]?.status ?? "draft";
    const lines = [`=== ${businessName.toUpperCase()} — ${pageObj.name.toUpperCase()} (STATUS: ${CONTENT_DRAFT_STATUS_LABEL[status as ContentDraftStatus].toUpperCase()} — DRAFT) ===`, ``, `Why this page matters: ${pageObj.why}`, `Sections: ${pageObj.sections.join(" | ")}`, ``, `CTA: ${pageObj.ctaGuidance}`, `Image: ${pageObj.imageReminder}`, ``];
    if (pageObj.policyNote) lines.push(`Policy: ${pageObj.policyNote}`, ``);
    lines.push(...pageObj.fields.map((f) => `[${f.label.toUpperCase()}]\n${d[f.id] || "(Pending draft)"}\n${f.prompt ? `Prompt: ${f.prompt}` : ""}\n`));
    lines.push(`CHECKLIST:\n${pageObj.checklist.map((c) => ` [ ] ${c}`).join("\n")}\n`);
    return lines.join("\n");
  };

  const copyCurrentPageExport = async () => {
    let content = "";
    if (exportFormat === "html") content = generateHtmlForPage(activePageId);
    else if (exportFormat === "markdown") content = generateMarkdownForPage(activePageId);
    else content = generateTextForPage(activePageId);
    try {
      await navigator.clipboard.writeText(content);
      toast.success(`Copied ${activePage.name} (${exportFormat.toUpperCase()}) — draft, not published.`);
    } catch {
      toast.error("Could not copy.");
    }
  };

  const downloadCurrentPage = (format: "html" | "markdown" | "text") => {
    let content = "";
    let mime = "text/plain";
    let ext = "txt";
    if (format === "html") { content = generateHtmlForPage(activePageId); mime = "text/html;charset=utf-8"; ext = "html"; }
    else if (format === "markdown") { content = generateMarkdownForPage(activePageId); mime = "text/markdown;charset=utf-8"; ext = "md"; }
    else { content = generateTextForPage(activePageId); mime = "text/plain;charset=utf-8"; ext = "txt"; }
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activePageId}-${domain.replace(/[^a-z0-9]/gi, "-")}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${activePage.name} as .${ext} (draft).`);
  };

  const downloadMasterBundle = (format: "html" | "markdown" | "text") => {
    let all = "";
    let mime = "text/plain";
    let ext = "txt";
    if (format === "html") { all = PAGES.map((p) => generateHtmlForPage(p.id)).join('\n\n<hr class="page-divider" />\n\n'); mime = "text/html;charset=utf-8"; ext = "html"; }
    else if (format === "markdown") { all = PAGES.map((p) => generateMarkdownForPage(p.id)).join("\n\n---\n\n"); mime = "text/markdown;charset=utf-8"; ext = "md"; }
    else { all = PAGES.map((p) => generateTextForPage(p.id)).join("\n\n==========\n\n"); mime = "text/plain;charset=utf-8"; ext = "txt"; }
    const blob = new Blob([all], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `website-copy-bundle-all-${PAGES.length}-pages-${domain.replace(/[^a-z0-9]/gi, "-")}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded all ${PAGES.length} pages as .${ext} bundle (drafts, not published).`);
  };

  const printCurrentPage = () => {
    window.print();
  };

  const overallStats = useMemo(() => {
    const total = PAGES.length;
    const ready = PAGES.filter((p) => state.drafts[p.id]?.status === "ready_to_publish").length;
    const draft = PAGES.filter((p) => (state.drafts[p.id]?.status ?? "not_started") !== "not_started").length;
    const needsReview = PAGES.filter((p) => state.drafts[p.id]?.status === "needs_review").length;
    return { total, ready, draft, needsReview };
  }, [state.drafts]);

  return (
    <AppShell
      title="Website Content Builder"
      description={`13-page workspace — drafts only, not auto-published. Copy, print, or download .txt/.md to paste into your builder. ${overallStats.ready}/${overallStats.total} ready, ${overallStats.needsReview} needs review.`}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={prefillFromProfile} className="text-xs gap-1.5">
            <Sparkles className="size-3.5 text-primary" /> Auto-Fill 13 Pages from Profile
          </Button>
          <Button variant="outline" size="sm" onClick={printCurrentPage} className="text-xs gap-1.5">
            <Printer className="size-3.5" /> Print / Save as PDF
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/80 bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <HardDrive className="size-4 text-primary" aria-hidden="true" />
            <span><strong className="text-foreground">Drafts saved on this device only.</strong> Not published. Copy/download to your website builder manually.</span>
          </div>
          <Badge variant="outline" className="text-[11px] font-normal">Auto-save active • {PAGES.length} pages</Badge>
        </div>

        <Callout tone="warning" title="Drafts, not published — paste into your builder">
          Nothing here is live on the web until you copy it into your website platform (Wix, Squarespace, Shopify, WordPress, etc.) and publish there. Mark pages <strong>Ready to publish</strong> only after you have reviewed on a real phone.
        </Callout>

        <Callout tone="info" title="Human words build trust — write plain, fill the blanks">
          Use the fill-in-the-blank prompts as a starting point, then edit into your natural voice. Live preview updates as you type on the left.
        </Callout>

        {/* Industry Starter Presets */}
        <div className="surface-panel p-4 sm:p-5 space-y-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">1-Click Starter Copy Presets</span>
              <h3 className="font-display font-bold text-base text-foreground">Load an industry template (13 pages):</h3>
            </div>
            <span className="text-xs text-muted-foreground">Select to pre-fill all 13 pages — remains a draft</span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {INDUSTRY_TEMPLATES.map((tpl) => (
              <button key={tpl.name} type="button" onClick={() => applyTemplate(tpl)} className="group flex flex-col justify-between rounded-xl border border-border bg-card p-3 text-left transition-all hover:border-primary hover:bg-primary-soft/30 hover:shadow-sm">
                <div>
                  <span className="text-2xl">{tpl.icon}</span>
                  <p className="mt-1 font-display font-bold text-xs text-foreground group-hover:text-primary">{tpl.name}</p>
                  <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{tpl.tagline}</p>
                </div>
                <span className="mt-2 text-[10px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">Load Template →</span>
              </button>
            ))}
          </div>
        </div>

        {/* Overall progress */}
        <div className="surface-panel p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            <span className="font-semibold text-foreground">{overallStats.draft}/{overallStats.total} pages have drafts</span>
            <span className="text-muted-foreground">• {overallStats.ready} Ready • {overallStats.needsReview} Needs review</span>
          </div>
          <div className="flex gap-1.5">
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => downloadMasterBundle("markdown")}><Download className="size-3.5" /> .md bundle</Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => downloadMasterBundle("text")}><Download className="size-3.5" /> .txt bundle</Button>
            <Button size="sm" className="h-7 text-xs" onClick={() => downloadMasterBundle("html")}><Download className="size-3.5" /> .html bundle</Button>
          </div>
        </div>

        {/* Page Selector Tabs */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 p-1 bg-muted/50 rounded-xl border">
            {PAGES.map((p) => {
              const st = (state.drafts[p.id]?.status ?? (Object.values(values[p.id] || {}).some((v) => v.trim().length > 0) ? "draft" : "not_started")) as ContentDraftStatus;
              const isActive = activePageId === p.id;
              const statusColor = st === "ready_to_publish" ? "bg-emerald-500" : st === "needs_review" ? "bg-amber-500" : st === "draft" ? "bg-sky-500" : "bg-muted-foreground/30";
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActivePageId(p.id)}
                  className={cn("rounded-lg px-2.5 py-2 text-xs font-semibold text-left flex items-center justify-between gap-1 border", isActive ? "bg-card border-primary shadow-sm text-primary" : "bg-background/60 border-transparent hover:border-border text-foreground")}
                >
                  <span className="truncate">{p.name}</span>
                  <span className={cn("size-2 rounded-full shrink-0", statusColor)} title={CONTENT_DRAFT_STATUS_LABEL[st]} aria-label={CONTENT_DRAFT_STATUS_LABEL[st]} />
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-1.5 text-[11px] text-muted-foreground items-center">
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-muted-foreground/30" /> Not started</span>
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-sky-500" /> Draft</span>
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-amber-500" /> Needs review</span>
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-emerald-500" /> Ready to publish</span>
            <span className="ml-2 text-primary font-medium">(Ready ≠ published — manual publish still required)</span>
          </div>
        </div>

        {/* Workspace split */}
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* LEFT: prompts */}
          <div className="lg:col-span-6 space-y-4">
            <div className="surface-panel p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-xl font-bold flex items-center gap-2"><FileText className="size-5 text-primary" /> {activePage.name} <Badge variant="outline" className="text-[10px]">{PAGES.findIndex((p) => p.id === activePage.id) + 1}/{PAGES.length}</Badge></h3>
                  <p className="text-xs text-muted-foreground mt-1">{activePage.purpose}</p>
                  <p className="text-xs text-foreground/80 mt-2 flex items-start gap-1.5"><Info className="size-3.5 mt-0.5 text-primary shrink-0" /><strong>Why this page:</strong> {activePage.why}</p>
                </div>
                <Badge variant="outline" className="text-xs shrink-0">{activePageStats.wordCount} words • ~{activePageStats.readTimeSec}s</Badge>
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
                <p className="text-xs font-bold text-foreground flex items-center gap-1"><Megaphone className="size-3.5 text-primary" /> Recommended sections</p>
                <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
                  {activePage.sections.map((s) => <li key={s}>{s}</li>)}
                </ul>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Label className="text-xs font-semibold">Page status:</Label>
                <Select value={activeStatus} onValueChange={(v) => setDraftStatus(activePageId, v as ContentDraftStatus)}>
                  <SelectTrigger className="h-8 w-44 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((o) => <SelectItem key={o} value={o}>{CONTENT_DRAFT_STATUS_LABEL[o]}</SelectItem>)}
                  </SelectContent>
                </Select>
                <span className="text-[11px] text-muted-foreground">Completeness: {activePageStats.filled}/{activePageStats.total} ({activePageStats.completeness}%)</span>
              </div>

              {activePageStats.foundJargon.length > 0 && (
                <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-2.5 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <div><span className="font-semibold">Clarity alert: </span>avoid buzzwords <strong>{activePageStats.foundJargon.join(", ")}</strong>. Use concrete words.</div>
                </div>
              )}

              <div className="rounded-lg border border-primary/20 bg-primary-soft/20 p-2.5 text-xs text-foreground">
                <p className="font-semibold flex items-center gap-1"><Megaphone className="size-3.5 text-primary" /> CTA guidance:</p>
                <p className="text-muted-foreground mt-1">{activePage.ctaGuidance}</p>
              </div>

              <div className="rounded-lg border border-border bg-card p-3 space-y-1.5">
                <p className="text-xs font-bold text-foreground flex items-center gap-1"><ClipboardCheck className="size-3.5 text-emerald-600" /> Completeness checklist</p>
                <ul className="space-y-1">
                  {activePage.checklist.map((item) => {
                    const done = Object.values(activePageData).join(" ").length > 10; // heuristic overall
                    return (
                      <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className={cn("mt-0.5 size-3.5 rounded-full border flex items-center justify-center shrink-0", done ? "bg-emerald-500 border-emerald-500 text-white" : "border-border")}>{done ? <Check className="size-2.5" /> : null}</span>
                        <span>{item}</span>
                      </li>
                    );
                  })}
                </ul>
                <p className="text-[11px] text-muted-foreground">Fill each field above. Mark status Ready only after reviewing on a real phone and checking spelling, prices, hours, phone.</p>
              </div>

              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs flex items-start gap-2">
                <ImageIcon className="size-4 text-amber-700 dark:text-amber-300 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-amber-800 dark:text-amber-200">Image / alt-text reminder</p>
                  <p className="text-amber-700 dark:text-amber-300/90 mt-0.5">{activePage.imageReminder}</p>
                </div>
              </div>

              {activePage.policyNote && (
                <div className="rounded-lg border border-sky-500/30 bg-sky-500/10 p-2.5 text-xs flex items-start gap-2">
                  <Shield className="size-4 text-sky-700 dark:text-sky-300 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-sky-800 dark:text-sky-200">Policy requirement</p>
                    <p className="text-sky-700 dark:text-sky-300/90 mt-0.5">{activePage.policyNote}</p>
                  </div>
                </div>
              )}
            </div>

            {activePage.fields.map((f) => (
              <div key={f.id} className="surface-panel space-y-2 p-5">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`${activePage.id}-${f.id}`} className="font-display text-sm font-bold text-foreground">{f.label}</Label>
                  <span className="text-[10px] text-muted-foreground font-mono">{(activePageData[f.id] || "").length}/4000</span>
                </div>
                <p className="text-xs text-muted-foreground">{f.help}</p>
                {f.prompt && <p className="text-xs font-mono bg-muted/40 border border-dashed border-border rounded px-2 py-1.5 text-foreground/80">Fill: {f.prompt}</p>}
                {f.rows === undefined ? (
                  <Input id={`${activePage.id}-${f.id}`} value={activePageData[f.id] ?? ""} onChange={(e) => setField(activePage.id, f.id, e.target.value)} placeholder={`e.g. ${f.example}`} className="text-sm font-medium" maxLength={4000} />
                ) : (
                  <Textarea id={`${activePage.id}-${f.id}`} rows={f.rows} value={activePageData[f.id] ?? ""} onChange={(e) => setField(activePage.id, f.id, e.target.value)} placeholder={`e.g. ${f.example}`} className="text-sm font-medium leading-relaxed" maxLength={4000} />
                )}
                <details className="rounded-lg border border-border bg-muted/30 p-2.5 text-xs text-muted-foreground">
                  <summary className="cursor-pointer font-medium text-foreground hover:text-primary">View example</summary>
                  <p className="mt-2 whitespace-pre-line font-mono text-[11px] bg-card p-2 rounded border border-border">{f.example}</p>
                </details>
              </div>
            ))}
          </div>

          {/* RIGHT: preview + export */}
          <div className="lg:col-span-6 space-y-4 lg:sticky lg:top-4">
            <div className="surface-panel p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg">
                <Button variant={previewViewport === "desktop" ? "default" : "ghost"} size="sm" onClick={() => setPreviewViewport("desktop")} className="h-7 text-xs gap-1 px-2.5"><Monitor className="size-3.5" /> Desktop</Button>
                <Button variant={previewViewport === "mobile" ? "default" : "ghost"} size="sm" onClick={() => setPreviewViewport("mobile")} className="h-7 text-xs gap-1 px-2.5"><Smartphone className="size-3.5" /> Mobile</Button>
              </div>
              <div className="flex items-center gap-2">
                <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value as "html" | "markdown" | "text")} aria-label="Export format" className="rounded-md border border-border bg-background px-2 py-1 text-xs font-semibold text-foreground">
                  <option value="html">Semantic HTML</option>
                  <option value="markdown">Clean Markdown</option>
                  <option value="text">Plain Text</option>
                </select>
                <Button size="sm" variant="outline" onClick={copyCurrentPageExport} className="h-8 text-xs gap-1"><Copy className="size-3.5" /> Copy</Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => downloadCurrentPage("text")}><Download className="size-3" /> .txt</Button>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => downloadCurrentPage("markdown")}><Download className="size-3" /> .md</Button>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => downloadCurrentPage("html")}><Download className="size-3" /> .html</Button>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={printCurrentPage}><Printer className="size-3" /> Print / Save PDF</Button>
            </div>

            {/* Browser frame */}
            <div className={cn("mx-auto transition-all rounded-2xl border border-border/80 bg-card shadow-2xl overflow-hidden", previewViewport === "mobile" ? "max-w-[340px]" : "w-full")}>
              <div className="bg-muted/80 border-b border-border/60 px-3 py-2 flex items-center gap-2">
                <div className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-rose-400 inline-block" /><span className="size-2.5 rounded-full bg-amber-400 inline-block" /><span className="size-2.5 rounded-full bg-emerald-400 inline-block" /></div>
                <div className="flex-1 bg-background/80 rounded-md px-2.5 py-0.5 text-[10px] font-mono text-muted-foreground truncate border border-border/40 text-center">https://{domain}/{activePageId === "home" ? "" : activePageId}</div>
              </div>
              <div className="border-b border-border/40 px-4 py-2.5 flex items-center justify-between bg-card">
                <span className="font-display font-bold text-xs text-foreground tracking-tight truncate">{businessName}</span>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                  {PAGES.slice(0, 4).map((p) => <span key={p.id} className={activePageId === p.id ? "text-primary font-bold" : ""}>{p.name}</span>)}
                </div>
              </div>
              <div className="p-4 sm:p-6 space-y-6 bg-background/50 min-h-[380px] print:bg-white">
                {/* Dynamic preview per page */}
                {activePageId === "home" && (
                  <div className="space-y-5">
                    <div className="rounded-xl border border-primary/20 bg-primary-soft/30 p-4 sm:p-6 text-center space-y-3">
                      <h1 className="font-display font-extrabold text-base sm:text-xl text-foreground leading-snug">{activePageData.headline || <span className="text-muted-foreground italic">Your headline will appear here…</span>}</h1>
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">{activePageData.audience || "Who it's for."}</p>
                      <div className="pt-2"><button type="button" className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow">{activePageData.cta || "Get Started Today"}</button></div>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Why Customers Trust Us</span>
                      <p className="text-xs text-muted-foreground leading-relaxed">{activePageData.proof || "Years of experience, reviews, guarantee."}</p>
                    </div>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1"><ImageIcon className="size-3" /> Alt draft: “{businessName} hero — {(activePageData.headline || "headline").slice(0, 60)}”</p>
                  </div>
                )}
                {activePageId === "about" && (
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Our Story</span>
                    <h2 className="font-display font-bold text-lg text-foreground">About {businessName}</h2>
                    <p className="text-xs text-muted-foreground leading-relaxed">{activePageData.story || "Share how and why your business began… "}</p>
                    <div className="rounded-lg border border-border bg-card p-3.5"><span className="font-bold text-xs text-foreground block">How We Work</span><p className="text-xs text-muted-foreground leading-relaxed">{activePageData.values || "Concrete practices."}</p></div>
                    <div className="rounded-lg border border-border bg-card p-3.5"><span className="font-bold text-xs text-foreground block">Meet Our People</span><p className="text-xs text-muted-foreground leading-relaxed">{activePageData.team || "Introduce team."}</p></div>
                    {activePageData.credentials && <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3.5"><p className="text-xs text-muted-foreground">{activePageData.credentials}</p></div>}
                  </div>
                )}
                {activePageId === "services" && (
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Offerings</span><h2 className="font-display font-bold text-lg text-foreground">Services</h2>
                    <div className="space-y-2">
                      {(activePageData.list || "Custom Service 1\nCustom Service 2").split("\n").filter(Boolean).map((item, idx) => <div key={idx} className="flex items-center justify-between rounded-lg border border-border bg-card p-3"><span className="font-semibold text-xs text-foreground">{item}</span><ChevronRight className="size-3.5 text-muted-foreground" /></div>)}
                    </div>
                    <div className="rounded-lg border border-border bg-card p-3.5"><span className="font-bold text-xs block">Details</span><p className="text-xs text-muted-foreground whitespace-pre-line">{activePageData.detail || "Deliverables & turnaround."}</p></div>
                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3.5"><span className="font-bold text-xs text-emerald-600 block">Pricing</span><p className="text-xs text-muted-foreground">{activePageData.pricing || "Pricing starting points."}</p><p className="text-xs text-primary mt-1">{activePageData.cta || ""}</p></div>
                  </div>
                )}
                {activePageId === "products" && (
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1"><Briefcase className="size-3" /> Products</span><h2 className="font-display font-bold text-lg">Products</h2>
                    <div className="grid gap-2">
                      {(activePageData.list || "Product A — variant\nProduct B — variant").split("\n").filter(Boolean).map((item, i) => <div key={i} className="rounded-lg border border-border bg-card p-3 flex justify-between items-center"><span className="text-xs font-semibold">{item}</span><Badge variant="outline" className="text-[10px]">In stock</Badge></div>)}
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-pre-line">{activePageData.detail || "What each product includes."}</p>
                    <p className="text-xs font-semibold text-emerald-600">{activePageData.pricing || ""}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1"><ImageIcon className="size-3" /> Each product needs photo + alt text describing weight/type.</p>
                  </div>
                )}
                {activePageId === "contact" && (
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Get In Touch</span><h2 className="font-display font-bold text-lg">Contact & Location</h2>
                    <div className="grid gap-2.5">
                      <div className="rounded-lg border border-border bg-card p-3"><span className="text-[10px] font-bold uppercase text-muted-foreground block">How to Reach Us</span><p className="text-xs font-semibold">{activePageData.methods || "Phone, email, or booking link."}</p></div>
                      <div className="rounded-lg border border-border bg-card p-3"><span className="text-[10px] font-bold uppercase block">Hours</span><p className="text-xs">{activePageData.hours || "Open days and hours."}</p></div>
                      <div className="rounded-lg border border-border bg-card p-3"><span className="text-[10px] font-bold uppercase block">Location</span><p className="text-xs">{activePageData.location || ""}</p></div>
                      <div className="rounded-lg border border-primary/20 bg-primary-soft/20 p-2.5 text-xs text-primary flex items-center gap-2"><Clock className="size-4" /><span>{activePageData.response || "We reply within 1 business day."}</span></div>
                    </div>
                  </div>
                )}
                {activePageId === "booking" && (
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1"><CalendarCheck className="size-3" /> Booking</span><h2 className="font-display font-bold text-lg">Book an Appointment</h2>
                    <div className="rounded-lg border border-border bg-card p-3.5"><p className="text-xs font-semibold">How to book</p><p className="text-xs text-muted-foreground">{activePageData.howto || "Booking method."}</p></div>
                    <div className="rounded-lg border border-border bg-card p-3.5"><p className="text-xs font-semibold">Slots</p><p className="text-xs text-muted-foreground">{activePageData.slots || ""}</p></div>
                    <div className="rounded-lg border border-border bg-card p-3.5"><p className="text-xs font-semibold">Prepare</p><p className="text-xs text-muted-foreground">{activePageData.prepare || ""}</p></div>
                    <button type="button" className="w-full rounded-lg bg-primary text-primary-foreground py-2 text-xs font-bold">{activePageData.cta || "Check availability"}</button>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Shield className="size-3" /> Links to Booking & Cancellation Policy</p>
                  </div>
                )}
                {activePageId === "menu" && (
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1"><Utensils className="size-3" /> Menu</span><h2 className="font-display font-bold text-lg">Menu</h2>
                    <div className="space-y-2">
                      {(activePageData.list || "Dish — £0.00").split("\n").filter(Boolean).map((l, i) => <div key={i} className="flex justify-between rounded-lg border border-border bg-card p-3 text-xs"><span className="font-semibold">{l}</span><span className="text-muted-foreground">Photo alt →</span></div>)}
                    </div>
                    <p className="text-xs"><strong>Dietary:</strong> {activePageData.dietary || ""}</p>
                    <p className="text-xs text-muted-foreground">{activePageData.availability || ""}</p>
                    <p className="text-xs text-primary font-semibold">{activePageData.cta || ""}</p>
                  </div>
                )}
                {activePageId === "portfolio" && (
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Selected Work</span><h2 className="font-display font-bold text-lg">Portfolio</h2>
                    {(activePageData.projects || "Project — Client").split("\n").filter(Boolean).map((p, i) => <div key={i} className="rounded-lg border border-border bg-card p-3"><p className="text-xs font-bold">{p}</p><p className="text-xs text-muted-foreground">{(activePageData.detail || "").split("\n")[i] || ""}</p></div>)}
                    <button type="button" className="w-full rounded-lg bg-primary text-primary-foreground py-2 text-xs font-bold">{activePageData.cta || "Start a similar project"}</button>
                  </div>
                )}
                {activePageId === "testimonials" && (
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1"><Star className="size-3" /> Testimonials</span><h2 className="font-display font-bold text-lg">What Customers Say</h2>
                    {(activePageData.quotes || "\"Great service\" — Name").split("\n").filter(Boolean).map((q, i) => <div key={i} className="rounded-lg border border-border bg-card p-3"><p className="text-xs italic">“{q}”</p></div>)}
                    <p className="text-[11px] text-muted-foreground">{activePageData.consent || ""}</p>
                    <p className="text-xs text-primary font-semibold">{activePageData.cta || ""}</p>
                  </div>
                )}
                {activePageId === "faq" && (
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Questions Answered</span><h2 className="font-display font-bold text-lg">Frequently Asked Questions</h2>
                    <Accordion type="single" collapsible className="space-y-2">
                      {(activePageData.questions || "What are delivery options?\nDo you offer refunds?").split("\n").filter(Boolean).map((q, i) => {
                        const ansList = (activePageData.answers || "").split("\n");
                        const ans = ansList[i] || "Contact our team for details.";
                        return <AccordionItem key={i} value={`faq-${i}`} className="rounded-lg border border-border bg-card px-3"><AccordionTrigger className="text-xs font-bold py-2.5">{q}</AccordionTrigger><AccordionContent className="text-xs text-muted-foreground pb-3">{ans}</AccordionContent></AccordionItem>;
                      })}
                    </Accordion>
                  </div>
                )}
                {activePageId === "privacy" && (
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1"><Shield className="size-3" /> Legal & Transparency</span><h2 className="font-display font-bold text-lg">Privacy Policy</h2>
                    <p className="text-[11px] text-muted-foreground">Last updated: {new Date().toLocaleDateString()} — DRAFT (not legal advice)</p>
                    <div className="space-y-2 text-xs">
                      <div className="rounded-lg border border-border bg-card p-3"><h4 className="font-bold">1. Data Controller</h4><p className="text-muted-foreground">{activePageData.controller || businessName}</p></div>
                      <div className="rounded-lg border border-border bg-card p-3"><h4 className="font-bold">2. Information We Collect</h4><p className="text-muted-foreground">{activePageData.collection || ""}</p></div>
                      <div className="rounded-lg border border-border bg-card p-3"><h4 className="font-bold">3. How We Use It</h4><p className="text-muted-foreground">{activePageData.usage || ""}</p></div>
                      <div className="rounded-lg border border-border bg-card p-3"><h4 className="font-bold">4. Third-Party Processors</h4><p className="text-muted-foreground">{activePageData.thirdparties || ""}</p></div>
                      <div className="rounded-lg border border-primary/20 bg-primary-soft/20 p-3"><h4 className="font-bold text-primary">5. Your Rights</h4><p className="text-muted-foreground">{activePageData.rights || ""}</p></div>
                    </div>
                  </div>
                )}
                {activePageId === "shipping" && (
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1"><Truck className="size-3" /> Fulfilment</span><h2 className="font-display font-bold text-lg">Shipping & Returns</h2>
                    <p className="text-[11px] text-muted-foreground">DRAFT — link from Products and checkout</p>
                    <div className="space-y-2 text-xs">
                      <div className="rounded-lg border border-border bg-card p-3"><h4 className="font-bold">Where We Deliver / Ship</h4><p className="text-muted-foreground">{activePageData.where || ""}</p></div>
                      <div className="rounded-lg border border-border bg-card p-3"><h4 className="font-bold">Timing & Fees</h4><p className="text-muted-foreground">{activePageData.timing || ""}</p></div>
                      <div className="rounded-lg border border-border bg-card p-3"><h4 className="font-bold">Returns & Refunds</h4><p className="text-muted-foreground">{activePageData.returns || ""}</p></div>
                      <div className="rounded-lg border border-border bg-card p-3"><h4 className="font-bold">Damaged or Missing Orders</h4><p className="text-muted-foreground">{activePageData.issues || ""}</p></div>
                    </div>
                  </div>
                )}
                {activePageId === "cancellation" && (
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1"><Scale className="size-3" /> Service Agreements</span><h2 className="font-display font-bold text-lg">Booking & Cancellation Policy</h2>
                    <p className="text-[11px] text-muted-foreground">DRAFT — seek local legal review before publishing</p>
                    <div className="space-y-2 text-xs">
                      <div className="rounded-lg border border-border bg-card p-3"><h4 className="font-bold">Pricing & Payment</h4><p className="text-muted-foreground">{activePageData.pricing_payment || ""}</p></div>
                      <div className="rounded-lg border border-border bg-card p-3"><h4 className="font-bold">Cancellation & Rescheduling</h4><p className="text-muted-foreground">{activePageData.cancellation_refunds || ""}</p></div>
                      <div className="rounded-lg border border-border bg-card p-3"><h4 className="font-bold">Liability & Allergens</h4><p className="text-muted-foreground">{activePageData.liability || ""}</p></div>
                      <div className="rounded-lg border border-primary/20 bg-primary-soft/20 p-3"><h4 className="font-bold text-primary">Governing Law</h4><p className="text-muted-foreground">{activePageData.jurisdiction || ""}</p></div>
                    </div>
                  </div>
                )}
              </div>
              <div className="border-t border-border/40 bg-muted/40 p-3 text-center text-[10px] text-muted-foreground">© {new Date().getFullYear()} {businessName}. All drafts — paste into your builder to publish.</div>
            </div>

            <div className="surface-panel p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5"><Code2 className="size-4 text-primary" /> Generated {exportFormat.toUpperCase()} Snippet — DRAFT</span>
                <Button size="sm" variant="ghost" onClick={copyCurrentPageExport} className="h-7 text-xs gap-1"><Copy className="size-3" /> Copy</Button>
              </div>
              <pre className="overflow-x-auto rounded-lg bg-muted/70 p-3 font-mono text-[10px] text-foreground max-h-48 whitespace-pre-wrap">{exportFormat === "html" ? generateHtmlForPage(activePageId) : exportFormat === "markdown" ? generateMarkdownForPage(activePageId) : generateTextForPage(activePageId)}</pre>
              <p className="text-[11px] text-muted-foreground">This is a local draft. To go live, copy or download and paste into your website builder, then publish there. No automatic publishing is performed.</p>
            </div>
          </div>
        </div>

        <section className="surface-panel p-5 sm:p-6 space-y-4">
          <h2 className="font-display text-xl font-bold">Writing & Conversion Checklist (all pages)</h2>
          <div className="grid gap-3 sm:grid-cols-3 text-xs text-muted-foreground">
            <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-1"><strong className="text-foreground block font-semibold">✓ 5-Second Test</strong>Would a stranger understand what you do and what to do next in 5 seconds?</div>
            <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-1"><strong className="text-foreground block font-semibold">✓ Customer-Centric</strong>Count “you/your” vs “we/our”. Great copy focuses on the customer’s outcome.</div>
            <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-1"><strong className="text-foreground block font-semibold">✓ One CTA</strong>Avoid 4 competing buttons. Pick one primary objective per page.</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-3 flex items-start gap-2 text-xs">
            <ImageIcon className="size-4 text-primary mt-0.5" />
            <div><p className="font-semibold text-foreground">Publish-ready materials reminder:</p><p className="text-muted-foreground">Every page with images needs: real photo (not stock if possible), descriptive file name (sourdough-loaf-front.jpg), and alt text for screen readers. Testimonials need written consent. Policies need last-updated date and local review.</p></div>
          </div>
          <div className="flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary-soft/30 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="font-display text-sm font-semibold flex items-center gap-2"><ClipboardCheck className="size-4 text-primary" /> Next: Test the full customer journey</p><p className="text-xs text-muted-foreground">After drafting, walk through the transaction on a real phone as a stranger would.</p></div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" className="shrink-0"><Link to="/customer-journey">Open Journey Tester →</Link></Button>
              <Button asChild variant="outline" size="sm" className="shrink-0"><Link to="/launch-wizard">Launch Wizard →</Link></Button>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
