import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Blocks,
  RefreshCcw,
  Globe,
  Server,
  ShoppingBag,
  Layers,
  Sparkles,
  Zap,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  DollarSign,
  Search,
  Filter,
  ArrowRight,
  Info,
  Calendar,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Callout } from "@/components/Callouts";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/platform-matcher")({
  head: () => ({
    meta: [
      { title: "Website & Hosting Platform Matcher & Pricing Directory" },
      {
        name: "description",
        content:
          "Find the right website builder, managed WordPress host, ecommerce platform, or static hosting. Compare transparent monthly, annual, and renewal pricing.",
      },
      { property: "og:title", content: "Website & Hosting Platform Matcher with Pricing" },
      {
        property: "og:description",
        content:
          "Transparent comparison of website builders and hosting providers with hidden renewal fee detection and feature breakdowns.",
      },
    ],
  }),
  component: PlatformMatcher,
});

interface Question {
  id: string;
  label: string;
  options: { value: string; label: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: "ecommerce",
    label: "Do you need to sell products or take payments on the site?",
    options: [
      { value: "no", label: "No" },
      { value: "few", label: "A few items or services" },
      { value: "yes", label: "Yes, a full shop with cart" },
    ],
  },
  {
    id: "booking",
    label: "Do you need customers to book appointments themselves?",
    options: [
      { value: "no", label: "No" },
      { value: "maybe", label: "Would be nice" },
      { value: "yes", label: "Yes, essential" },
    ],
  },
  {
    id: "updates",
    label: "How often will you update the site?",
    options: [
      { value: "rare", label: "Rarely" },
      { value: "monthly", label: "Monthly" },
      { value: "weekly", label: "Weekly or more" },
    ],
  },
  {
    id: "speed",
    label: "Do you need something live quickly?",
    options: [
      { value: "yes", label: "Yes, days" },
      { value: "weeks", label: "A few weeks is fine" },
      { value: "no", label: "No rush" },
    ],
  },
  {
    id: "design",
    label: "How much design freedom do you want?",
    options: [
      { value: "template", label: "A clean template is fine" },
      { value: "some", label: "Some control" },
      { value: "max", label: "Maximum pixel freedom" },
    ],
  },
  {
    id: "help",
    label: "Do you have someone technical helping you?",
    options: [
      { value: "no", label: "No, purely DIY" },
      { value: "sometimes", label: "Occasionally" },
      { value: "yes", label: "Yes, regularly" },
    ],
  },
  {
    id: "budget",
    label: "What monthly cost feels comfortable?",
    options: [
      { value: "low", label: "As low as possible ($0–$10/mo)" },
      { value: "mid", label: "Moderate ($15–$35/mo)" },
      { value: "high", label: "Whatever it takes ($40+/mo)" },
    ],
  },
  {
    id: "growth",
    label: "Do you expect advanced custom features later?",
    options: [
      { value: "no", label: "No" },
      { value: "maybe", label: "Possibly" },
      { value: "yes", label: "Yes, likely" },
    ],
  },
];

interface Recommendation {
  key: string;
  title: string;
  bestFor: string;
  categoryFilter: string;
  advantages: string[];
  tradeoffs: string[];
  complexity: string;
  maintenance: string;
  questions: string[];
  features: string[];
  topProviders: string[];
  examples: string;
}

const RECOMMENDATIONS = {
  builder: {
    key: "builder",
    title: "Easy all-in-one website builder",
    bestFor:
      "Most first-time small business websites that need to look polished quickly without touching server code.",
    categoryFilter: "builder",
    advantages: [
      "Hosting, SSL, updates, and templates are bundled in one flat subscription",
      "Visual drag-and-drop editing with zero code required",
      "Live within days with reliable uptime and built-in security",
    ],
    tradeoffs: [
      "Design flexibility is bounded by template blocks",
      "Moving to another platform later means rebuilding pages from scratch",
    ],
    complexity: "Low",
    maintenance: "Low (handled by provider)",
    questions: [
      "What does the plan cost on Year 2 renewal, not just the promo rate?",
      "Is business email included or separate (e.g. Google Workspace/Titan/Neo)?",
      "Can I export my form leads and content easily?",
    ],
    features: ["Visual Editor", "Free SSL", "Contact Forms", "Mobile Responsive", "Analytics"],
    topProviders: ["Squarespace", "Wix", "Hostinger AI Builder", "Webflow"],
    examples: "Squarespace, Wix, Hostinger Website Builder, Webflow.",
  },
  ecommerce: {
    key: "ecommerce",
    title: "Dedicated ecommerce-first platform",
    bestFor:
      "Businesses whose core engine is selling physical or digital goods online with inventory, cart checkout, and shipping.",
    categoryFilter: "ecommerce",
    advantages: [
      "Payments, tax calculations, shipping labels, and inventory built-in",
      "High-converting checkout trusted globally by consumers",
      "Rich ecosystem for reviews, discount codes, and abandoned cart recovery",
    ],
    tradeoffs: [
      "Monthly subscription plus credit card processing and possible third-party app fees",
      "More settings and product taxonomy to configure before launch",
    ],
    complexity: "Medium",
    maintenance: "Medium",
    questions: [
      "What are the transaction fees on my expected sales volume?",
      "Which payment gateways (Stripe, PayPal, Apple Pay) are enabled?",
      "How are sales tax and shipping zones configured?",
    ],
    features: [
      "Inventory Management",
      "PCI-Compliant Checkout",
      "Discounts",
      "Abandoned Cart",
      "Shipping Rules",
    ],
    topProviders: ["Shopify", "WooCommerce", "BigCommerce"],
    examples: "Shopify, WooCommerce on Managed Host, BigCommerce.",
  },
  cms: {
    key: "cms",
    title: "Flexible WordPress CMS with managed hosting",
    bestFor:
      "Businesses publishing frequent content, multi-language sites, or requiring specific custom plugins and full ownership.",
    categoryFilter: "cms",
    advantages: [
      "Massive ecosystem of 60,000+ plugins and endless design themes",
      "100% data ownership and portable database",
      "Standard framework easily handed over to agencies or freelancers",
    ],
    tradeoffs: [
      "Requires routine plugin, core, and PHP updates to stay secure",
      "Plugin bloat can cause slowdowns if not monitored",
    ],
    complexity: "Medium to high",
    maintenance: "Medium–High (needs backups & updates)",
    questions: [
      "Does the hosting plan include automated daily backups and staging?",
      "What is the renewal price after the Year 1 promotional rate expires?",
      "Is server caching and web application firewall (WAF) enabled?",
    ],
    features: [
      "Full Data Ownership",
      "Custom Post Types",
      "Plugin Library",
      "SEO Freedom",
      "Database Access",
    ],
    topProviders: ["SiteGround", "WP Engine", "Hostinger WordPress", "DreamHost"],
    examples: "SiteGround Managed WP, WP Engine, Hostinger Cloud WP, DreamHost.",
  },
  pro: {
    key: "pro",
    title: "Professional visual code builder or custom build",
    bestFor:
      "Businesses with distinctive branding, custom interaction requirements, and a dedicated budget.",
    categoryFilter: "builder",
    advantages: [
      "Bespoke design that stands out completely from template clones",
      "Clean semantic code with blazing-fast load performance",
      "Integrates with bespoke backends and third-party APIs",
    ],
    tradeoffs: [
      "Higher upfront investment and learning curve",
      "Clear ownership documentation needed before commencing work",
    ],
    complexity: "High",
    maintenance: "Depends on setup",
    questions: [
      "Will the domain and hosting accounts be registered strictly in my company name?",
      "What are the ongoing retainer or hosting costs after launch?",
      "Who owns the intellectual property and design assets?",
    ],
    features: ["Custom Interactions", "Bespoke CMS Schema", "Enterprise CDN", "API Integrations"],
    topProviders: ["Webflow", "Vercel / Next.js", "Cloudflare Pages"],
    examples: "Webflow, Vercel Jamstack, Cloudflare Pages, Independent Studio.",
  },
  onepage: {
    key: "onepage",
    title: "Simple one-page launch site",
    bestFor:
      "Getting an honest, fast, and credible web presence online this week for under $20/year.",
    categoryFilter: "onepage",
    advantages: [
      "Can be built and live in an afternoon for minimal cost",
      "Presents all vital information (services, hours, contact, map) on a single scannable page",
      "Near-zero maintenance or security overhead",
    ],
    tradeoffs: [
      "Limited capacity for deep multi-page content or complex shopping carts",
      "Basic SEO footprint compared to a full multi-page content architecture",
    ],
    complexity: "Very low",
    maintenance: "Near zero",
    questions: [
      "Can I connect my custom .com domain?",
      "Can I add a contact form that forwards straight to my email?",
    ],
    features: [
      "Single Page Flow",
      "Contact Form",
      "Social Links",
      "Mobile Optimized",
      "Ultra Low Cost",
    ],
    topProviders: ["Carrd", "Neo AI Site", "Hostinger One-Page"],
    examples: "Carrd Pro, Neo AI Website, Hostinger One-Page.",
  },
  static: {
    key: "static",
    title: "Static / Jamstack with global edge hosting",
    bestFor:
      "Technical founders and developers who want blazing-fast load times, unlimited bandwidth, and $0 hosting on a global edge CDN.",
    categoryFilter: "static",
    advantages: [
      "Zero monthly hosting fees with unlimited bandwidth and free SSL",
      "Fastest possible load times via 300+ global edge data centers",
      "Automated Git deploys, version control, and instant rollbacks",
    ],
    tradeoffs: [
      "Requires static build knowledge (React, Astro, Hugo, or plain HTML)",
      "No visual drag-and-drop editor; content changes need a code deploy or headless CMS",
    ],
    complexity: "High (Developer)",
    maintenance: "Low (Serverless, no server patching)",
    questions: [
      "Do I have a developer or comfort with Git-based deployments?",
      "Will I pair this with a headless CMS for non-technical editing?",
      "Is free email routing sufficient or do I need a dedicated inbox?",
    ],
    features: ["Global Edge CDN", "Free SSL", "Git Deploys", "Unlimited Bandwidth", "DDoS Protection"],
    topProviders: ["Cloudflare Pages", "Vercel", "Netlify"],
    examples: "Cloudflare Pages, Vercel, Netlify, GitHub Pages.",
  },
} satisfies Record<string, Recommendation>;

export interface HostingProvider {
  id: string;
  name: string;
  category: "builder" | "cms" | "ecommerce" | "static" | "onepage";
  categoryLabel: string;
  tagline: string;
  badge?: string;
  startingPriceAnnual: string;
  startingPriceMonthly: string;
  renewalPriceAnnual: string;
  renewalShock: "none" | "low" | "medium" | "high";
  shockDescription: string;
  hostingIncluded: boolean;
  freeDomainYear1: boolean;
  businessEmailIncluded: string;
  storage: string;
  transactionFee: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  officialUrl: string;
  plans: {
    name: string;
    annualPrice: string;
    monthlyPrice: string;
    renewalPrice: string;
    keyFeature: string;
  }[];
}

export const HOSTING_PROVIDERS: HostingProvider[] = [
  {
    id: "squarespace",
    name: "Squarespace",
    category: "builder",
    categoryLabel: "All-in-One Builder",
    tagline: "Award-winning designer templates with zero maintenance and built-in commerce.",
    badge: "Top Design Choice",
    startingPriceAnnual: "$16 / mo",
    startingPriceMonthly: "$25 / mo",
    renewalPriceAnnual: "$16 / mo (No promo price hike)",
    renewalShock: "none",
    shockDescription: "Transparent flat pricing. No unexpected Year 2 promotional renewal jump.",
    hostingIncluded: true,
    freeDomainYear1: true,
    businessEmailIncluded: "Separate (Google Workspace add-on, 1st yr discount)",
    storage: "Unlimited",
    transactionFee: "3% on Business plan (0% on Commerce plans)",
    pros: [
      "World-class typography and mobile-responsive aesthetics",
      "Zero technical maintenance; hosting and security fully managed",
      "Built-in blogging, email campaigns, scheduling, and analytics",
    ],
    cons: [
      "Limited third-party code customisation compared to WordPress",
      "3% transaction fee on Business plan unless upgrading to Commerce",
    ],
    bestFor: "Creative studios, consultants, local service businesses, and boutique portfolios.",
    officialUrl: "https://www.squarespace.com/pricing",
    plans: [
      {
        name: "Personal",
        annualPrice: "$16 / mo",
        monthlyPrice: "$25 / mo",
        renewalPrice: "$16 / mo",
        keyFeature: "Unlimited storage, free custom domain (yr 1), SSL, basic templates.",
      },
      {
        name: "Business",
        annualPrice: "$23 / mo",
        monthlyPrice: "$33 / mo",
        renewalPrice: "$23 / mo",
        keyFeature: "Advanced analytics, custom JavaScript/CSS, 3% commerce transaction fee.",
      },
      {
        name: "Commerce Basic",
        annualPrice: "$27 / mo",
        monthlyPrice: "$36 / mo",
        renewalPrice: "$27 / mo",
        keyFeature: "0% transaction fee, point of sale, customer accounts, merchandising.",
      },
    ],
  },
  {
    id: "wix",
    name: "Wix",
    category: "builder",
    categoryLabel: "All-in-One Builder",
    tagline: "Unconstrained visual drag-and-drop freedom with extensive app market.",
    badge: "Maximum Drag & Drop",
    startingPriceAnnual: "$17 / mo",
    startingPriceMonthly: "$23 / mo",
    renewalPriceAnnual: "$17 / mo",
    renewalShock: "none",
    shockDescription: "Flat subscription. Standard annual discount with transparent renewal.",
    hostingIncluded: true,
    freeDomainYear1: true,
    businessEmailIncluded: "Separate (Google Workspace add-on)",
    storage: "2 GB – 50 GB (depends on plan)",
    transactionFee: "Standard payment processing",
    pros: [
      "Absolute layout freedom: drag anything anywhere on screen",
      "Huge App Market for booking, restaurant menus, and memberships",
      "Includes Wix Studio for advanced agency-grade responsive styling",
    ],
    cons: [
      "Cannot switch templates once a site is built without rebuilding",
      "Storage is capped on lower tiers (Light tier has 2GB)",
    ],
    bestFor: "Small businesses wanting total visual control without writing code.",
    officialUrl: "https://www.wix.com/upgrade/website",
    plans: [
      {
        name: "Light",
        annualPrice: "$17 / mo",
        monthlyPrice: "$23 / mo",
        renewalPrice: "$17 / mo",
        keyFeature: "2 GB storage, 2 collaborators, custom domain, no Wix ads.",
      },
      {
        name: "Core (Commerce)",
        annualPrice: "$29 / mo",
        monthlyPrice: "$36 / mo",
        renewalPrice: "$29 / mo",
        keyFeature: "50 GB storage, accept payments, 5 collaborators, basic marketing suite.",
      },
      {
        name: "Business",
        annualPrice: "$36 / mo",
        monthlyPrice: "$44 / mo",
        renewalPrice: "$36 / mo",
        keyFeature: "100 GB storage, advanced ecommerce, automated sales tax, 10 staff.",
      },
    ],
  },
  {
    id: "hostinger_builder",
    name: "Hostinger AI Website Builder",
    category: "builder",
    categoryLabel: "Budget AI Builder",
    tagline: "Ultra-affordable AI site generator with managed hosting and free domain.",
    badge: "Best Budget All-in-One",
    startingPriceAnnual: "$2.99 / mo",
    startingPriceMonthly: "$11.99 / mo",
    renewalPriceAnnual: "$7.99 / mo (Year 2+)",
    renewalShock: "medium",
    shockDescription:
      "Introductory promotional teaser ($2.99/mo) jumps by ~167% to $7.99/mo upon Year 2 renewal.",
    hostingIncluded: true,
    freeDomainYear1: true,
    businessEmailIncluded: "Included (Free custom email mailboxes for 1st year)",
    storage: "Unmetered",
    transactionFee: "0% commission",
    pros: [
      "Extremely affordable entry pricing for solo entrepreneurs",
      "AI text generation, AI logo creator, and AI heatmap visualizer",
      "Includes free domain and free webmail in the bundle",
    ],
    cons: [
      "Renewal rate jumps to $7.99/mo after the promotional period",
      "Fewer third-party plugin integrations than WordPress or Shopify",
    ],
    bestFor:
      "Solo founders, side hustles, and budget-conscious starters wanting an all-in-one bundle.",
    officialUrl: "https://www.hostinger.com/website-builder",
    plans: [
      {
        name: "Premium Website Builder",
        annualPrice: "$2.99 / mo (Intro)",
        monthlyPrice: "$11.99 / mo",
        renewalPrice: "$7.99 / mo",
        keyFeature: "AI builder, free domain (yr 1), free email, up to 100 websites.",
      },
      {
        name: "Business Website Builder",
        annualPrice: "$3.99 / mo (Intro)",
        monthlyPrice: "$13.99 / mo",
        renewalPrice: "$8.99 / mo",
        keyFeature: "Ecommerce features (500 products, 0% fee), AI copywriting tools, analytics.",
      },
    ],
  },
  {
    id: "siteground",
    name: "SiteGround Managed WordPress",
    category: "cms",
    categoryLabel: "Managed WordPress",
    tagline:
      "High-speed Google Cloud infrastructure with automated daily backups & top-tier support.",
    badge: "Top WordPress Host",
    startingPriceAnnual: "$2.99 / mo",
    startingPriceMonthly: "$19.99 / mo",
    renewalPriceAnnual: "$17.99 / mo (Year 2+)",
    renewalShock: "high",
    shockDescription:
      "Aggressive intro discount ($2.99/mo) renews at $17.99/mo — a 500% renewal increase.",
    hostingIncluded: true,
    freeDomainYear1: false,
    businessEmailIncluded: "Included (Free unlimited custom domain mailboxes)",
    storage: "10 GB – 40 GB NVMe",
    transactionFee: "None (Standard WooCommerce)",
    pros: [
      "Custom SuperCacher technology delivers exceptional page load speeds",
      "Free automated daily backups with 1-click restore",
      "Free SSL, free CDN, staging environments, and WordPress auto-updates",
    ],
    cons: [
      "Steep renewal prices after the initial contract period expires",
      "Strict storage and monthly visit limits on entry plan",
    ],
    bestFor:
      "Small businesses building serious WordPress or WooCommerce sites wanting rock-solid reliability.",
    officialUrl: "https://www.siteground.com/wordpress-hosting.htm",
    plans: [
      {
        name: "StartUp",
        annualPrice: "$2.99 / mo (Promo)",
        monthlyPrice: "$19.99 / mo",
        renewalPrice: "$17.99 / mo",
        keyFeature: "1 website, 10 GB storage, ~10,000 monthly visits, free email & SSL.",
      },
      {
        name: "GrowBig",
        annualPrice: "$4.99 / mo (Promo)",
        monthlyPrice: "$29.99 / mo",
        renewalPrice: "$29.99 / mo",
        keyFeature:
          "Unlimited websites, 20 GB storage, ~100k visits, 1-click staging, on-demand backup.",
      },
      {
        name: "GoGeek",
        annualPrice: "$7.99 / mo (Promo)",
        monthlyPrice: "$39.99 / mo",
        renewalPrice: "$44.99 / mo",
        keyFeature: "40 GB storage, priority support, Git integration, white-label client access.",
      },
    ],
  },
  {
    id: "wpengine",
    name: "WP Engine",
    category: "cms",
    categoryLabel: "Premium WordPress",
    tagline:
      "Enterprise-grade managed WordPress hosting with advanced developer staging and security.",
    badge: "Enterprise Standard",
    startingPriceAnnual: "$20 / mo",
    startingPriceMonthly: "$30 / mo",
    renewalPriceAnnual: "$30 / mo",
    renewalShock: "low",
    shockDescription: "Minor promo discount in Year 1 ($20/mo) renewing at standard $30/mo.",
    hostingIncluded: true,
    freeDomainYear1: false,
    businessEmailIncluded: "Not included (Dedicated email provider required)",
    storage: "10 GB – 50 GB",
    transactionFee: "None",
    pros: [
      "Industry-leading WordPress caching, performance, and EverCache CDN",
      "Automated plugin vulnerability alerts and daily staging clones",
      "24/7 specialized WordPress expert support",
    ],
    cons: [
      "Premium price point geared toward growing companies",
      "No email hosting included (must use Google Workspace, Microsoft 365, or Neo)",
    ],
    bestFor:
      "Established businesses, agencies, and high-traffic WordPress sites where downtime is catastrophic.",
    officialUrl: "https://wpengine.com/plans/",
    plans: [
      {
        name: "Startup",
        annualPrice: "$20 / mo (billed $240/yr)",
        monthlyPrice: "$30 / mo",
        renewalPrice: "$30 / mo",
        keyFeature:
          "1 site, 25k visits/mo, 10 GB storage, 50 GB bandwidth, free automated migration.",
      },
      {
        name: "Professional",
        annualPrice: "$50 / mo (billed $590/yr)",
        monthlyPrice: "$65 / mo",
        renewalPrice: "$65 / mo",
        keyFeature:
          "3 sites, 75k visits/mo, 15 GB storage, 125 GB bandwidth, staging environments.",
      },
    ],
  },
  {
    id: "shopify",
    name: "Shopify",
    category: "ecommerce",
    categoryLabel: "Dedicated Ecommerce",
    tagline: "The world's leading ecommerce platform for online retail and in-person POS sales.",
    badge: "Ecommerce Gold Standard",
    startingPriceAnnual: "$29 / mo",
    startingPriceMonthly: "$39 / mo",
    renewalPriceAnnual: "$29 / mo",
    renewalShock: "none",
    shockDescription: "Predictable flat pricing with 25% discount when paid annually ($29/mo).",
    hostingIncluded: true,
    freeDomainYear1: false,
    businessEmailIncluded: "Email forwarding only (Genuine inbox requires Google/Neo/Titan)",
    storage: "Unlimited products & files",
    transactionFee: "2.9% + 30¢ (Shopify Payments) or +2.0% for external gateways",
    pros: [
      "The highest-converting checkout in ecommerce (Shop Pay)",
      "Native inventory tracking, multi-channel selling (Instagram, TikTok, Amazon)",
      "Unrivaled app store for dropshipping, subscriptions, and shipping logistics",
    ],
    cons: [
      "Monthly app fees can add up quickly as you install custom plugins",
      "Additional 2.0% fee if you do not use Shopify Payments",
    ],
    bestFor: "Anyone building an active online store with catalog inventory and shipping.",
    officialUrl: "https://www.shopify.com/pricing",
    plans: [
      {
        name: "Basic",
        annualPrice: "$29 / mo",
        monthlyPrice: "$39 / mo",
        renewalPrice: "$29 / mo",
        keyFeature: "Full online store, 2 staff accounts, 24/7 support, 2.9% + 30¢ card fee.",
      },
      {
        name: "Shopify",
        annualPrice: "$79 / mo",
        monthlyPrice: "$105 / mo",
        renewalPrice: "$79 / mo",
        keyFeature: "5 staff accounts, standard reporting, lower card rate (2.7% + 30¢).",
      },
      {
        name: "Advanced",
        annualPrice: "$299 / mo",
        monthlyPrice: "$399 / mo",
        renewalPrice: "$299 / mo",
        keyFeature: "15 staff accounts, custom report builder, lowest rates (2.5% + 30¢).",
      },
    ],
  },
  {
    id: "webflow",
    name: "Webflow",
    category: "builder",
    categoryLabel: "Visual Code Platform",
    tagline: "Design, build, and launch responsive websites visually without writing custom code.",
    badge: "Agency & Designer Pick",
    startingPriceAnnual: "$14 / mo",
    startingPriceMonthly: "$18 / mo",
    renewalPriceAnnual: "$14 / mo",
    renewalShock: "none",
    shockDescription:
      "Transparent flat subscription. Tier depends on CMS items and monthly traffic.",
    hostingIncluded: true,
    freeDomainYear1: false,
    businessEmailIncluded: "Separate",
    storage: "Tier-based (500 to 10k items)",
    transactionFee: "0% on CMS/Business (Standard Stripe fees)",
    pros: [
      "Generates clean semantic HTML/CSS code matching modern web standards",
      "Visual CMS database for structured dynamic content (blogs, team, case studies)",
      "Fast global CDN hosted on AWS and Fastly with automated SSL",
    ],
    cons: [
      "Steeper learning curve than Squarespace or Wix (understands CSS box model)",
      "Separate workspace plans needed for multi-member agency collaboration",
    ],
    bestFor: "Designers, tech startups, and marketing teams seeking pixel-perfect custom sites.",
    officialUrl: "https://webflow.com/pricing",
    plans: [
      {
        name: "Basic",
        annualPrice: "$14 / mo",
        monthlyPrice: "$18 / mo",
        renewalPrice: "$14 / mo",
        keyFeature: "Custom domain, 500 monthly form submissions, 50 GB bandwidth (No CMS).",
      },
      {
        name: "CMS",
        annualPrice: "$23 / mo",
        monthlyPrice: "$29 / mo",
        renewalPrice: "$23 / mo",
        keyFeature: "2,000 CMS database items, 3 content editors, 200 GB bandwidth.",
      },
      {
        name: "Business",
        annualPrice: "$39 / mo",
        monthlyPrice: "$49 / mo",
        renewalPrice: "$39 / mo",
        keyFeature: "10,000 CMS database items, 10 content editors, 400 GB bandwidth.",
      },
    ],
  },
  {
    id: "carrd",
    name: "Carrd",
    category: "onepage",
    categoryLabel: "One-Page Builder",
    tagline: "Simple, responsive, one-page sites for pretty much anything at $19/year.",
    badge: "Lowest Cost One-Pager",
    startingPriceAnnual: "$1.58 / mo ($19/yr)",
    startingPriceMonthly: "$1.58 / mo",
    renewalPriceAnnual: "$19 / year (Flat)",
    renewalShock: "none",
    shockDescription:
      "Virtually unbeatable pricing: $19 per year covers up to 10 custom domain sites.",
    hostingIncluded: true,
    freeDomainYear1: false,
    businessEmailIncluded: "Separate (Compatible with Neo, Google Workspace, Titan)",
    storage: "Lightweight single page",
    transactionFee: "None (Embed Stripe Checkout / PayPal)",
    pros: [
      "Costs only $19 per year for Pro Standard with custom domain support",
      "Ultra-fast loading times with clean responsive templates",
      "Built-in forms for contact, Mailchimp, and payment buttons",
    ],
    cons: [
      "Restricted strictly to single-page layouts (not suitable for deep multi-page sites)",
      "Basic widget set without complex database features",
    ],
    bestFor:
      "Freelancers, pre-launch waiting lists, portfolio cards, and quick local service pages.",
    officialUrl: "https://carrd.co/pro",
    plans: [
      {
        name: "Core (Free)",
        annualPrice: "$0",
        monthlyPrice: "$0",
        renewalPrice: "$0",
        keyFeature: "Build up to 3 sites with carrd.co subdomain.",
      },
      {
        name: "Pro Standard",
        annualPrice: "$19 / year",
        monthlyPrice: "$1.58 / mo equiv.",
        renewalPrice: "$19 / year",
        keyFeature:
          "Publish up to 10 sites with custom domains, contact forms, Google Analytics, no branding.",
      },
      {
        name: "Pro Plus",
        annualPrice: "$49 / year",
        monthlyPrice: "$4.08 / mo equiv.",
        renewalPrice: "$49 / year",
        keyFeature:
          "Publish up to 25 sites, password protection, advanced forms, download site files.",
      },
    ],
  },
  {
    id: "neo_site",
    name: "Neo AI One-Page Website",
    category: "onepage",
    categoryLabel: "One-Page AI Builder",
    tagline: "Instant AI website creator bundled with your Neo business email suite.",
    badge: "Bundled with Email",
    startingPriceAnnual: "$0 / yr 1 (Included)",
    startingPriceMonthly: "$0 / yr 1",
    renewalPriceAnnual: "$0.60 / mo ($7.20 / year)",
    renewalShock: "none",
    shockDescription:
      "Included free for Year 1 with any Neo email plan; renews at nominal $7.20/year.",
    hostingIncluded: true,
    freeDomainYear1: true,
    businessEmailIncluded: "Directly bundled with your Neo Mailbox",
    storage: "Single-page cloud hosting",
    transactionFee: "None",
    pros: [
      "Generates a complete business website in 60 seconds with AI",
      "Seamless integration with Neo Bookings scheduler, WhatsApp chat, and contact forms",
      "Included free for year 1 with your Neo business email subscription",
    ],
    cons: ["Limited to single-page promotional presence", "Tied to the Neo business ecosystem"],
    bestFor: "Entrepreneurs setting up both their email and website in a single 5-minute workflow.",
    officialUrl: "https://www.neo.space",
    plans: [
      {
        name: "Neo AI Site (With Email)",
        annualPrice: "$0 (Year 1 with Email)",
        monthlyPrice: "$0",
        renewalPrice: "$7.20 / year ($0.60/mo)",
        keyFeature: "AI-generated layout, contact form, appointment scheduler, custom domain.",
      },
    ],
  },
  {
    id: "cloudflare_pages",
    name: "Cloudflare Pages",
    category: "static",
    categoryLabel: "Jamstack / Static",
    tagline:
      "Blazing fast global edge network hosting with unlimited bandwidth and zero server costs.",
    badge: "100% Free Edge Tier",
    startingPriceAnnual: "$0 / mo",
    startingPriceMonthly: "$0 / mo",
    renewalPriceAnnual: "$0 / mo (Forever Free)",
    renewalShock: "none",
    shockDescription: "Generous free tier forever. No credit card required for custom domain SSL.",
    hostingIncluded: true,
    freeDomainYear1: false,
    businessEmailIncluded: "Free Email Routing (Forwarding) included",
    storage: "Unlimited static assets",
    transactionFee: "None",
    pros: [
      "Fastest global edge CDN in the world (300+ data centers)",
      "Zero monthly hosting fees and unlimited bandwidth",
      "Automated Git deploys and instant free SSL certificates",
    ],
    cons: [
      "Requires static HTML/React/Vue/Astro build or developer knowledge",
      "No built-in visual WYSIWYG drag-and-drop editor",
    ],
    bestFor:
      "Developers, tech founders, and static sites wanting zero maintenance and zero hosting bills.",
    officialUrl: "https://pages.cloudflare.com",
    plans: [
      {
        name: "Free Forever",
        annualPrice: "$0",
        monthlyPrice: "$0",
        renewalPrice: "$0",
        keyFeature:
          "Unlimited sites, unlimited requests, 500 builds/mo, global CDN & DDoS protection.",
      },
      {
        name: "Pro",
        annualPrice: "$20 / mo",
        monthlyPrice: "$25 / mo",
        renewalPrice: "$20 / mo",
        keyFeature: "5,000 builds/mo, advanced cache analytics, web application firewall rules.",
      },
    ],
  },
];

const COMPARISON_ARCHETYPES = [
  {
    option: "All-in-one builder (Squarespace / Wix)",
    bestFor: "First website, service businesses, portfolio",
    priceRange: "$16 – $29 / mo",
    difficulty: "Easy (Visual)",
    flexibility: "Medium",
    maintenance: "Low (Zero server updates)",
    hosting: "Included",
    freeDomain: "1st Year Free",
    emailStatus: "Separate ($2–$6/mo)",
    ideal: "Owner who wants a great site without technical stress",
  },
  {
    option: "Managed WordPress (SiteGround / Hostinger)",
    bestFor: "Publishing, blogs, custom plugins, high SEO",
    priceRange: "$3 – $18 / mo (Promo vs Renew)",
    difficulty: "Medium–Hard",
    flexibility: "High (60k+ plugins)",
    maintenance: "Medium–High (Backups & updates)",
    hosting: "Included (Cloud server)",
    freeDomain: "Varies by host",
    emailStatus: "Included on cPanel / Add-on",
    ideal: "Business needing deep customization & data ownership",
  },
  {
    option: "Dedicated Ecommerce (Shopify)",
    bestFor: "Online retail store with products & cart",
    priceRange: "$29 – $79 / mo + 2.9%",
    difficulty: "Medium",
    flexibility: "Medium (Shopify apps)",
    maintenance: "Low (Hosted SaaS)",
    hosting: "Included",
    freeDomain: "Separate registration",
    emailStatus: "Separate / Forwarding",
    ideal: "Retailers focused purely on sales & checkout conversion",
  },
  {
    option: "One-Page Micro Site (Carrd / Neo AI Site)",
    bestFor: "Speed launch, portfolio, single service page",
    priceRange: "$0 – $1.58 / mo ($19/yr)",
    difficulty: "Very Easy",
    flexibility: "Low–Medium",
    maintenance: "Near Zero",
    hosting: "Included",
    freeDomain: "Connect custom domain",
    emailStatus: "Bundled with Neo / Separate",
    ideal: "Founders needing a fast, low-cost presence this week",
  },
  {
    option: "Static Jamstack (Cloudflare Pages / Vercel)",
    bestFor: "Modern web apps, fast landing pages",
    priceRange: "$0 / mo (Free Tier)",
    difficulty: "Developer",
    flexibility: "Infinite (Custom code)",
    maintenance: "Low (Serverless)",
    hosting: "Global Edge CDN",
    freeDomain: "Separate (Wholesale DNS)",
    emailStatus: "Free Routing / Separate",
    ideal: "Technical founders & developers wanting $0 hosting",
  },
];

function recommend(a: Record<string, string | undefined>): Recommendation {
  if (a["ecommerce"] === "yes") return RECOMMENDATIONS.ecommerce;
  if (a["growth"] === "yes" && a["help"] !== "no") return RECOMMENDATIONS.cms;
  if (a["help"] === "yes" && a["budget"] === "low" && a["ecommerce"] === "no" && a["booking"] === "no")
    return RECOMMENDATIONS.static;
  if (a["design"] === "max" && a["budget"] === "high") return RECOMMENDATIONS.pro;
  if (a["speed"] === "yes" && a["budget"] === "low" && a["updates"] === "rare")
    return RECOMMENDATIONS.onepage;
  if (a["updates"] === "weekly" && a["design"] !== "template") return RECOMMENDATIONS.cms;
  return RECOMMENDATIONS.builder;
}

function PlatformMatcher() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [activeDirectoryCategory, setActiveDirectoryCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [billingCycleView, setBillingCycleView] = useState<"annual" | "monthly">("annual");

  const answered = Object.keys(answers).length;
  const result = useMemo(() => (answered >= 4 ? recommend(answers) : null), [answers, answered]);

  const filteredProviders = useMemo(() => {
    return HOSTING_PROVIDERS.filter((p) => {
      const matchCategory =
        activeDirectoryCategory === "all" || p.category === activeDirectoryCategory;
      const matchSearch =
        searchQuery.trim() === "" ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.bestFor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [activeDirectoryCategory, searchQuery]);

  return (
    <AppShell
      title="Website Platform & Hosting Matcher with Pricing"
      description="Find the right tool to build and host your website with honest trade-offs and transparent pricing."
    >
      <div className="space-y-10">
        {/* Top Header Guidance */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Choose the right platform for your website
              </h1>
              <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                Take our 8-question matchmaker or explore the directory below to compare transparent
                Year 1 vs Year 2 renewal prices, hosting types, and email compatibility.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link to="/cost-calculator">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <DollarSign className="size-4 text-primary" />
                  3-Year TCO Calculator
                </Button>
              </Link>
              <Link to="/connect-domain">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Globe className="size-4 text-primary" />
                  DNS Connection Guide
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Callout tone="info" title="Independent & Neutral Analysis">
              We do not accept commissions, affiliate bounties, or sponsor placements. Every
              provider listed reflects real-world pricing and honest engineering trade-offs.
            </Callout>
            <Callout tone="success" title="Hosting vs Email Clarification">
              Most all-in-one website builders bundle web hosting in their subscription, but{" "}
              <strong>business email</strong> is usually billed separately ($2–$6/user/mo). Always
              check what is included.
            </Callout>
          </div>
        </section>

        {/* Section 1: 8-Question Interactive Matchmaker */}
        <section
          className="surface-panel space-y-6 p-5 sm:p-7 border border-border"
          aria-labelledby="matcher-heading"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Step 1 · Needs Assessment
              </span>
              <h2 id="matcher-heading" className="font-display text-xl font-bold sm:text-2xl">
                Interactive Platform Matcher
              </h2>
            </div>
            {answered > 0 && (
              <Button variant="outline" size="sm" onClick={() => setAnswers({})}>
                <RefreshCcw className="mr-1.5 size-3.5" aria-hidden="true" />
                Reset answers
              </Button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {QUESTIONS.map((q) => (
              <fieldset
                key={q.id}
                className="rounded-xl border border-border bg-card p-4 space-y-2.5"
              >
                <legend className="font-display text-sm font-semibold text-foreground px-1">
                  {q.label}
                </legend>
                <RadioGroup
                  className="gap-2"
                  value={answers[q.id] ?? ""}
                  onValueChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))}
                >
                  {q.options.map((o) => (
                    <Label
                      key={o.value}
                      htmlFor={`${q.id}-${o.value}`}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-lg border p-2.5 text-xs font-medium transition-colors sm:text-sm",
                        answers[q.id] === o.value
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border/60 hover:bg-muted/60 text-muted-foreground",
                      )}
                    >
                      <RadioGroupItem id={`${q.id}-${o.value}`} value={o.value} />
                      {o.label}
                    </Label>
                  ))}
                </RadioGroup>
              </fieldset>
            ))}
          </div>

          {/* Recommendation Output */}
          <div className="pt-2">
            {result ? (
              <article className="rounded-2xl border-2 border-primary/40 bg-primary/5 p-5 sm:p-7 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                      <Blocks className="size-6" aria-hidden="true" />
                    </span>
                    <div>
                      <Badge className="bg-success text-success-foreground mb-1">
                        Best Fit for Your Profile
                      </Badge>
                      <h3 className="font-display text-2xl font-bold">{result.title}</h3>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setActiveDirectoryCategory(result.categoryFilter);
                      const el = document.getElementById("directory-heading");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="gap-1.5"
                  >
                    View matching options below
                    <ArrowRight className="size-4" />
                  </Button>
                </div>

                <p className="text-sm sm:text-base text-foreground/90 font-medium">
                  {result.bestFor}
                </p>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                    <h4 className="font-display text-sm font-semibold flex items-center gap-1.5 text-success">
                      <Check className="size-4" /> Advantages
                    </h4>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-muted-foreground">
                      {result.advantages.map((a) => (
                        <li key={a} className="flex items-start gap-2">
                          <span className="text-success font-bold">•</span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                    <h4 className="font-display text-sm font-semibold flex items-center gap-1.5 text-warning">
                      <AlertCircle className="size-4" /> Trade-offs to Consider
                    </h4>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-muted-foreground">
                      {result.tradeoffs.map((a) => (
                        <li key={a} className="flex items-start gap-2">
                          <span className="text-warning font-bold">•</span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                    <h4 className="font-display text-sm font-semibold flex items-center gap-1.5">
                      <Info className="size-4 text-primary" /> Questions to Ask Before Choosing
                    </h4>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-muted-foreground">
                      {result.questions.map((q) => (
                        <li key={q} className="flex items-start gap-2">
                          <span className="text-primary font-bold">?</span>
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                    <h4 className="font-display text-sm font-semibold flex items-center gap-1.5">
                      <Sparkles className="size-4 text-primary" /> Recommended Providers
                    </h4>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {result.topProviders.map((p) => (
                        <Badge
                          key={p}
                          variant="secondary"
                          className="px-2.5 py-1 text-xs font-semibold"
                        >
                          {p}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground pt-2">
                      Scroll down to see exact plan pricing and renewal terms for each of these
                      tools.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-primary/20">
                  <div className="rounded-lg bg-card/80 p-3 border border-border/50">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                      Setup Complexity
                    </span>
                    <p className="mt-0.5 font-semibold text-sm">{result.complexity}</p>
                  </div>
                  <div className="rounded-lg bg-card/80 p-3 border border-border/50">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                      Ongoing Maintenance
                    </span>
                    <p className="mt-0.5 font-semibold text-sm">{result.maintenance}</p>
                  </div>
                </div>
              </article>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                <Blocks className="mx-auto size-8 text-muted-foreground/60 mb-2" />
                <p className="font-medium text-foreground">
                  Answer at least four questions above to calculate your customized platform
                  recommendation.
                </p>
                <p className="text-xs mt-1">Currently answered: {answered} of 8</p>
              </div>
            )}
          </div>
        </section>

        {/* Section 2: Website & Hosting Provider Directory & Pricing Options */}
        <section className="space-y-6" aria-labelledby="directory-heading">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Step 2 · Pricing & Provider Directory
              </span>
              <h2 id="directory-heading" className="font-display text-xl font-bold sm:text-2xl">
                Website & Hosting Provider Options & Pricing
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Transparent breakdown of popular website builders, managed WordPress hosts, and
                ecommerce stacks.
              </p>
            </div>

            {/* Billing Cycle Toggle */}
            <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 p-1 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setBillingCycleView("annual")}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  billingCycleView === "annual"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Annual Billed (Savings)
              </button>
              <button
                type="button"
                onClick={() => setBillingCycleView("monthly")}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  billingCycleView === "monthly"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Monthly Billed
              </button>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "all", label: "All Providers", icon: Globe },
                { id: "builder", label: "All-in-One Builders", icon: Blocks },
                { id: "cms", label: "Managed WordPress", icon: Server },
                { id: "ecommerce", label: "Ecommerce", icon: ShoppingBag },
                { id: "onepage", label: "One-Page / Micro", icon: Zap },
                { id: "static", label: "Static / Jamstack", icon: Layers },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeDirectoryCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveDirectoryCategory(tab.id)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                      isActive
                        ? "border-primary bg-primary text-primary-foreground font-semibold"
                        : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="size-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search provider, feature, or plan..."
                className="pl-8 h-9 text-xs"
              />
            </div>
          </div>

          {/* Provider Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {filteredProviders.map((provider) => (
              <article
                key={provider.id}
                className="surface-panel flex flex-col justify-between overflow-hidden border border-border p-5 sm:p-6 transition-all hover:border-primary/50"
              >
                <div className="space-y-5">
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-xl font-bold tracking-tight">
                          {provider.name}
                        </h3>
                        {provider.badge && (
                          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                            {provider.badge}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">
                        {provider.categoryLabel}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-muted-foreground block">
                        {billingCycleView === "annual"
                          ? "Starting from (annual)"
                          : "Starting from (monthly)"}
                      </span>
                      <span className="font-display text-xl font-bold text-primary">
                        {billingCycleView === "annual"
                          ? provider.startingPriceAnnual
                          : provider.startingPriceMonthly}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground">{provider.tagline}</p>

                  {/* Renewal Shock Warning Banner */}
                  <div
                    className={cn(
                      "rounded-lg p-3 text-xs border flex items-start gap-2.5",
                      provider.renewalShock === "none"
                        ? "border-success/30 bg-success-soft text-foreground"
                        : provider.renewalShock === "low"
                          ? "border-border bg-muted text-muted-foreground"
                          : provider.renewalShock === "medium"
                            ? "border-warning/30 bg-warning-soft text-foreground"
                            : "border-destructive/30 bg-destructive-soft text-foreground",
                    )}
                  >
                    <AlertCircle
                      className={cn(
                        "size-4 shrink-0 mt-0.5",
                        provider.renewalShock === "none"
                          ? "text-success"
                          : provider.renewalShock === "high"
                            ? "text-destructive"
                            : "text-warning",
                      )}
                    />
                    <div>
                      <span className="font-semibold block">
                        {provider.renewalShock === "none"
                          ? "Flat Renewal Pricing"
                          : `Year 2+ Renewal: ${provider.renewalPriceAnnual}`}
                      </span>
                      <span className="text-xs opacity-90">{provider.shockDescription}</span>
                    </div>
                  </div>

                  {/* Feature & Inclusion Snapshot */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-md border border-border/70 bg-card p-2">
                      <span className="text-muted-foreground block font-medium">
                        Hosting Included
                      </span>
                      <span className="font-semibold flex items-center gap-1 mt-0.5">
                        {provider.hostingIncluded ? (
                          <Check className="size-3.5 text-success" />
                        ) : (
                          <X className="size-3.5 text-destructive" />
                        )}
                        {provider.hostingIncluded ? "Yes (Managed)" : "Separate Server"}
                      </span>
                    </div>
                    <div className="rounded-md border border-border/70 bg-card p-2">
                      <span className="text-muted-foreground block font-medium">
                        Free Domain (Yr 1)
                      </span>
                      <span className="font-semibold flex items-center gap-1 mt-0.5">
                        {provider.freeDomainYear1 ? (
                          <Check className="size-3.5 text-success" />
                        ) : (
                          <X className="size-3.5 text-muted-foreground" />
                        )}
                        {provider.freeDomainYear1 ? "Included 1st Year" : "Register Separately"}
                      </span>
                    </div>
                    <div className="rounded-md border border-border/70 bg-card p-2 col-span-2">
                      <span className="text-muted-foreground block font-medium">
                        Business Email Status
                      </span>
                      <span className="font-medium text-foreground mt-0.5 block">
                        {provider.businessEmailIncluded}
                      </span>
                    </div>
                    <div className="rounded-md border border-border/70 bg-card p-2">
                      <span className="text-muted-foreground block font-medium">Storage</span>
                      <span className="font-semibold mt-0.5 block">{provider.storage}</span>
                    </div>
                    <div className="rounded-md border border-border/70 bg-card p-2">
                      <span className="text-muted-foreground block font-medium">
                        Transaction Fee
                      </span>
                      <span className="font-semibold mt-0.5 block">{provider.transactionFee}</span>
                    </div>
                  </div>

                  {/* Pros / Trade-offs */}
                  <div className="grid gap-2 sm:grid-cols-2 text-xs">
                    <div className="rounded-md border border-success/20 bg-success-soft/40 p-3">
                      <span className="font-semibold text-success flex items-center gap-1.5">
                        <Check className="size-3.5" /> Pros
                      </span>
                      <ul className="mt-1.5 space-y-1 text-muted-foreground">
                        {provider.pros.map((p) => (
                          <li key={p} className="flex items-start gap-1.5">
                            <span className="text-success font-bold">•</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-md border border-warning/20 bg-warning-soft/30 p-3">
                      <span className="font-semibold text-warning flex items-center gap-1.5">
                        <X className="size-3.5" /> Trade-offs
                      </span>
                      <ul className="mt-1.5 space-y-1 text-muted-foreground">
                        {provider.cons.map((c) => (
                          <li key={c} className="flex items-start gap-1.5">
                            <span className="text-warning font-bold">•</span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Plan Breakdown Table */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      Popular Plan Tiers
                    </span>
                    <div className="rounded-lg border border-border overflow-hidden text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-muted/60 text-muted-foreground border-b border-border">
                          <tr>
                            <th className="p-2 font-medium">Plan</th>
                            <th className="p-2 font-medium">Price</th>
                            <th className="p-2 font-medium">Included Highlight</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {provider.plans.map((pl) => (
                            <tr key={pl.name} className="hover:bg-muted/30">
                              <td className="p-2 font-semibold whitespace-nowrap">{pl.name}</td>
                              <td className="p-2 whitespace-nowrap text-primary font-medium">
                                {billingCycleView === "annual" ? pl.annualPrice : pl.monthlyPrice}
                              </td>
                              <td className="p-2 text-muted-foreground">{pl.keyFeature}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pros & Best For */}
                  <div className="space-y-2 text-xs">
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">Best for:</strong> {provider.bestFor}
                    </p>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-5 mt-5 border-t border-border flex items-center justify-between gap-3">
                  <Link
                    to="/connect-domain"
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    DNS Setup Guide
                    <ArrowRight className="size-3" />
                  </Link>

                  <a
                    href={provider.officialUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-medium"
                  >
                    Official Pricing Page
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </article>
            ))}
          </div>

          {filteredProviders.length === 0 && (
            <div className="surface-panel p-8 text-center text-muted-foreground">
              <p>No providers matched your filter "{searchQuery}".</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setActiveDirectoryCategory("all");
                }}
                className="mt-3"
              >
                Clear filters
              </Button>
            </div>
          )}

          <Callout tone="warning" title="Pricing Disclaimer — Verify Before You Buy">
            Prices shown are starting rates gathered May 2026 and may change without notice. Always
            confirm the current Year 1, Year 2 renewal, and transaction-fee terms on the official
            pricing page linked in each card. Promotional teasers (e.g. $2.99/mo) often renew 2–5×
            higher — check the “Year 2+ Renewal” badge before committing and use the 3-Year TCO
            Calculator to compare total ownership honestiy.
          </Callout>
        </section>

        {/* Section 3: High-Level Architecture & Cost Comparison Matrix */}
        <section className="space-y-4" aria-labelledby="compare-heading">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Step 3 · Feature Matrix
            </span>
            <h2 id="compare-heading" className="font-display text-xl font-bold sm:text-2xl">
              Side-by-Side Website & Hosting Stack Comparison
            </h2>
            <p className="text-sm text-muted-foreground">
              Compare hosting difficulty, recurring expenses, email independence, and portability
              across all categories.
            </p>
          </div>

          <div className="surface-panel overflow-x-auto border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="font-semibold text-foreground">Platform Type</TableHead>
                  <TableHead className="font-semibold text-foreground">Best For</TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Typical Cost Range
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">Setup Difficulty</TableHead>
                  <TableHead className="font-semibold text-foreground">Maintenance Level</TableHead>
                  <TableHead className="font-semibold text-foreground">Hosting Bundled?</TableHead>
                  <TableHead className="font-semibold text-foreground">Email Handling</TableHead>
                  <TableHead className="font-semibold text-foreground">Ideal Operator</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {COMPARISON_ARCHETYPES.map((row) => (
                  <TableRow key={row.option} className="hover:bg-muted/30">
                    <TableCell className="font-semibold whitespace-nowrap text-primary">
                      {row.option}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xs">
                      {row.bestFor}
                    </TableCell>
                    <TableCell className="text-xs font-medium whitespace-nowrap">
                      {row.priceRange}
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{row.difficulty}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{row.maintenance}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap font-medium text-success">
                      {row.hosting}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {row.emailStatus}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{row.ideal}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* Section 4: Pro-Tips for Small Business Website Owners */}
        <section className="surface-panel p-6 sm:p-8 border border-border space-y-6">
          <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl flex items-center gap-2">
            <ShieldCheck className="size-6 text-primary" />4 Golden Safeguards When Buying Website &
            Hosting
          </h2>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-1.5">
              <h3 className="font-display text-sm font-semibold flex items-center gap-2 text-foreground">
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                  1
                </span>
                Keep Domain Registration Separate From Website Hosting
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                If your domain registrar and website host are the same company, migrating away later
                is stressful. Keeping your domain at an independent registrar (Porkbun, Cloudflare,
                Namecheap) ensures you can switch website builders in 5 minutes by updating your DNS
                A records.
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-display text-sm font-semibold flex items-center gap-2 text-foreground">
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                  2
                </span>
                Never Lock Your Business Email to a Website Builder
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Use dedicated email platforms like Neo, Google Workspace, Titan, or Microsoft 365.
                If you ever change your website theme, CMS, or hosting host, your business email and
                customer conversations will remain completely uninterrupted.
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-display text-sm font-semibold flex items-center gap-2 text-foreground">
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                  3
                </span>
                Watch Out for Promotional Year 2 Renewal Traps
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Shared web hosts often advertise headline rates of $2.99/mo, but automatically bill
                at $17.99/mo to $29.99/mo upon renewal. Always check the 3-year total cost of
                ownership before signing an annual contract.
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-display text-sm font-semibold flex items-center gap-2 text-foreground">
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                  4
                </span>
                Check Plugin & Transaction Fee Overhead
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                For ecommerce, calculate transaction fees (e.g. Shopify 2.9% + 30¢ vs WooCommerce 0%
                platform commission). For WordPress, factor in premium plugins ($50–$200/yr for
                forms, caching, or security).
              </p>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
