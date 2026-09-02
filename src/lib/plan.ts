import type {
  AppState,
  BusinessProfile,
  Importance,
  LaunchTask,
  MaintenanceTask,
  PhaseKey,
} from "./types";

export const PHASES: {
  key: PhaseKey;
  number: number;
  title: string;
  why: string;
}[] = [
  {
    key: "plan",
    number: 1,
    title: "Plan your online presence",
    why: "A few clear decisions now save days of rework later. You will know what you are building and why.",
  },
  {
    key: "domain",
    number: 2,
    title: "Secure your web address",
    why: "Your web address (domain) is business property. Registering it in your own account keeps you in control.",
  },
  {
    key: "setup",
    number: 3,
    title: "Choose your website setup",
    why: "Picking the right type of website tool means less maintenance and fewer surprises later.",
  },
  {
    key: "build",
    number: 4,
    title: "Build your core pages",
    why: "A handful of clear pages does more for enquiries than a big, confusing website.",
  },
  {
    key: "connect",
    number: 5,
    title: "Connect your address and email",
    why: "This is the step that makes your website appear at your own web address, safely.",
  },
  {
    key: "launch",
    number: 6,
    title: "Test and launch",
    why: "Checking your site on a real phone catches most problems before customers do.",
  },
  {
    key: "grow",
    number: 7,
    title: "Get found and maintain your site",
    why: "A live site needs a little care each month to keep bringing in customers.",
  },
];

export const CATEGORIES = [
  "Bakery / café / restaurant",
  "Trades (plumbing, electrical, repair)",
  "Salon / spa / wellness",
  "Clinic / healthcare",
  "Consultant / agency",
  "Tutor / coach / course seller",
  "Freelancer / creative",
  "Retail / online shop",
  "Charity / community group",
  "Other",
];

export const GOALS = [
  "Get more local enquiries",
  "Display my services professionally",
  "Take bookings or appointments",
  "Sell products online",
  "Build credibility for my business",
  "Collect leads",
  "Share a portfolio",
  "Start a blog or newsletter",
  "I am not sure yet",
];

export const START_POINTS = [
  "I have nothing yet",
  "I have a business name but no domain",
  "I already own a domain",
  "I have a website but need help improving it",
  "Someone else manages my website/domain",
  "I have social-media pages only",
];

export const WEBSITE_NEEDS = [
  "Simple brochure site",
  "Contact form",
  "Online booking",
  "Ecommerce shop",
  "Restaurant menu",
  "Photo gallery",
  "Portfolio",
  "Testimonials",
  "Blog",
  "Members-only area",
  "Multiple locations",
  "Multiple languages",
  "Email newsletter signup",
  "WhatsApp / phone contact button",
];

let seq = 0;
const nextId = (prefix: string) => `${prefix}-${(seq += 1)}-${Math.random().toString(36).slice(2, 7)}`;

interface Seed {
  phase: PhaseKey;
  category: string;
  title: string;
  description: string;
  importance: Importance;
  minutes: number;
}

function baseSeeds(b: BusinessProfile): Seed[] {
  const needs = b.needs ?? [];
  const has = (n: string) => needs.includes(n);
  const ownsDomain = b.currentStatus === "I already own a domain";
  const thirdParty = b.currentStatus === "Someone else manages my website/domain";
  const wantsEmail = b.needsBusinessEmail !== "no";

  const seeds: Seed[] = [
    {
      phase: "plan",
      category: "Ownership and accounts",
      title: "Write down what your website must do",
      description:
        "One sentence: who you help, what you offer, and the one action you want visitors to take.",
      importance: "required",
      minutes: 20,
    },
    {
      phase: "plan",
      category: "Ownership and accounts",
      title: "Choose the email address that will own your business accounts",
      description:
        "Use an address you personally control. Every domain, website and billing account should be registered to it.",
      importance: "required",
      minutes: 10,
    },
    {
      phase: "plan",
      category: "Website essentials",
      title: "Collect your business details in one place",
      description: "Business name, phone, address or service area, hours, and any existing photos or logo.",
      importance: "recommended",
      minutes: 30,
    },
  ];

  if (thirdParty) {
    seeds.push({
      phase: "plan",
      category: "Ownership and accounts",
      title: "Confirm who currently owns your domain, hosting and email",
      description:
        "Ask for the registrar name, the account email, and administrator access in writing before making any change.",
      importance: "required",
      minutes: 45,
    });
  }

  seeds.push(
    ownsDomain
      ? {
          phase: "domain",
          category: "Ownership and accounts",
          title: "Sign in to your existing domain account and confirm control",
          description:
            "Check the renewal date, the recovery email, and that the account is in your business's name.",
          importance: "required",
          minutes: 25,
        }
      : {
          phase: "domain",
          category: "Ownership and accounts",
          title: "Choose and register your web address",
          description:
            "Use the Domain Finder to shortlist names, then register your favourite in your own account.",
          importance: "required",
          minutes: 45,
        },
    {
      phase: "domain",
      category: "Ownership and accounts",
      title: "Turn on two-step sign-in and save recovery details",
      description:
        "Two-step sign-in (2FA) stops someone else taking over your web address. Store recovery codes somewhere safe and offline.",
      importance: "required",
      minutes: 15,
    },
    {
      phase: "domain",
      category: "Ownership and accounts",
      title: "Turn on renewal reminders or auto-renew",
      description: "An expired web address can take your website and email offline.",
      importance: "required",
      minutes: 10,
    },
    {
      phase: "setup",
      category: "Website essentials",
      title: "Pick the type of website tool that fits you",
      description: "Use the Platform Matcher to get a recommended category, not a sales pitch.",
      importance: "required",
      minutes: 30,
    },
    {
      phase: "setup",
      category: "Website essentials",
      title: "Compare current plan pricing and renewal terms",
      description:
        "Check included email, storage, transaction fees, support, and what the price becomes after the first year.",
      importance: "recommended",
      minutes: 30,
    },
  );

  const corePages = ["Home", "About", "Contact"];
  if (has("Restaurant menu")) corePages.push("Menu");
  if (has("Ecommerce shop")) corePages.push("Products");
  if (has("Online booking")) corePages.push("Booking");
  if (has("Portfolio")) corePages.push("Portfolio");
  if (!has("Ecommerce shop") && !has("Restaurant menu")) corePages.push("Services");

  corePages.forEach((page) =>
    seeds.push({
      phase: "build",
      category: "Website essentials",
      title: `Write your ${page} page`,
      description: `Use the Content Builder prompts for the ${page} page, then edit the wording in your own voice.`,
      importance: page === "Home" || page === "Contact" ? "required" : "recommended",
      minutes: page === "Home" ? 60 : 35,
    }),
  );

  seeds.push({
    phase: "build",
    category: "Website essentials",
    title: "Add photos with useful alternative text",
    description:
      "Real photos beat stock images. Alternative text describes each picture for people using screen readers.",
    importance: "recommended",
    minutes: 40,
  });

  if (has("WhatsApp / phone contact button")) {
    seeds.push({
      phase: "build",
      category: "Website essentials",
      title: "Add a tap-to-call and WhatsApp button",
      description: "On mobile these are often the most used buttons on a small business website.",
      importance: "recommended",
      minutes: 20,
    });
  }

  seeds.push(
    {
      phase: "connect",
      category: "Domain, DNS and security",
      title: "Take a screenshot of your current domain settings",
      description: "Before changing anything, save a copy of what is already there so you can undo mistakes.",
      importance: "required",
      minutes: 10,
    },
    {
      phase: "connect",
      category: "Domain, DNS and security",
      title: "Point your web address at your website",
      description:
        "Follow the DNS Guide. You will add the exact values your website provider gives you — nothing else.",
      importance: "required",
      minutes: 45,
    },
    {
      phase: "connect",
      category: "Domain, DNS and security",
      title: "Turn on HTTPS and check for browser warnings",
      description: "HTTPS is the padlock in the address bar. Most modern platforms enable it for you.",
      importance: "required",
      minutes: 15,
    },
  );

  if (wantsEmail) {
    seeds.push(
      {
        phase: "connect",
        category: "Business email",
        title: "Set up your business email address",
        description: "Something like hello@yourbusiness.com looks professional and keeps work mail organised.",
        importance: "recommended",
        minutes: 60,
      },
      {
        phase: "connect",
        category: "Business email",
        title: "Send and receive a test email",
        description: "Send from your new address to a personal address and reply back to confirm both directions.",
        importance: "required",
        minutes: 10,
      },
    );
  }

  seeds.push(
    {
      phase: "launch",
      category: "Website quality",
      title: "Check every page on a real phone",
      description: "Most visitors to small business sites are on mobile. Look for cut-off text and tiny buttons.",
      importance: "required",
      minutes: 30,
    },
    {
      phase: "launch",
      category: "Website quality",
      title: "Test your contact form end to end",
      description: "Submit it yourself and confirm the notification actually arrives in the right inbox.",
      importance: "required",
      minutes: 15,
    },
    {
      phase: "launch",
      category: "Website quality",
      title: "Check spelling, prices, hours and phone numbers",
      description: "Read every page once out loud. Errors here cost trust immediately.",
      importance: "required",
      minutes: 25,
    },
    {
      phase: "grow",
      category: "Discoverability",
      title: "Write clear page titles and descriptions",
      description: "Say what the page is and where you work, in plain words a customer would use.",
      importance: "recommended",
      minutes: 35,
    },
    {
      phase: "grow",
      category: "Discoverability",
      title: "Connect a search monitoring tool and verify ownership",
      description: "This shows how search engines see your site and warns you about problems.",
      importance: "recommended",
      minutes: 30,
    },
    {
      phase: "grow",
      category: "Measurement",
      title: "Set up website analytics and define one key action",
      description: "Pick one thing that matters: a form submission, booking, call, purchase or signup.",
      importance: "recommended",
      minutes: 30,
    },
    {
      phase: "grow",
      category: "Post-launch",
      title: "Schedule a monthly website check",
      description: "Fifteen minutes a month keeps content current and catches broken links early.",
      importance: "optional",
      minutes: 10,
    },
  );

  if (b.customerModel !== "online") {
    seeds.push({
      phase: "grow",
      category: "Discoverability",
      title: "Create or claim your local business profile",
      description:
        "Keep your business name, address, phone, hours and website identical everywhere they appear.",
      importance: "recommended",
      minutes: 45,
    });
  }

  return seeds;
}

export function generateTasks(b: BusinessProfile): LaunchTask[] {
  return baseSeeds(b).map((s) => ({
    id: nextId("task"),
    phase: s.phase,
    category: s.category,
    title: s.title,
    description: s.description,
    importance: s.importance,
    estimatedMinutes: s.minutes,
    status: "todo",
    notes: "",
    assignedTo: "Me",
    completedAt: null,
  }));
}

export function defaultMaintenance(): MaintenanceTask[] {
  const days = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
  const items: [string, MaintenanceTask["recurrence"], number][] = [
    ["Check enquiries and form notifications", "weekly", 3],
    ["Reply to new leads", "weekly", 2],
    ["Scan the website for obvious issues", "weekly", 5],
    ["Review your key pages and update offers or hours", "monthly", 18],
    ["Test the contact form", "monthly", 20],
    ["Review basic analytics", "monthly", 25],
    ["Check platform updates and backups", "monthly", 28],
    ["Refresh photos and testimonials", "quarterly", 70],
    ["Review who has access to your accounts", "quarterly", 75],
    ["Test the booking or purchase flow", "quarterly", 80],
    ["Review your domain renewal date", "yearly", 300],
    ["Review account recovery information", "yearly", 320],
    ["Review privacy and legal pages", "yearly", 340],
  ];
  return items.map(([title, recurrence, due]) => ({
    id: nextId("maint"),
    title,
    recurrence,
    nextDue: days(due),
    status: "pending",
    notes: "",
  }));
}

export const emptyBusiness: BusinessProfile = {
  businessName: "",
  category: "",
  description: "",
  location: "",
  customerModel: "",
  hasPhysicalLocation: false,
  servesAtCustomerLocation: false,
  hasBusinessHours: false,
  primaryGoal: "",
  currentStatus: "",
  ownedDomain: "",
  registrarName: "",
  hasRegistrarAccess: "",
  hasRecoveryEmailAccess: "",
  needs: [],
  setupBudget: "",
  monthlyBudget: "",
  timeline: "",
  buildPreference: "",
  techComfort: "",
  wantsSelfUpdate: "",
  brandAssets: [],
  needsContentHelp: "",
  needsBusinessEmail: "",
};

export const demoBusiness: BusinessProfile = {
  businessName: "Harbor & Hearth Bakery",
  category: "Bakery / café / restaurant",
  description:
    "A neighbourhood bakery selling fresh breads, pastries and custom celebration cakes made to order.",
  location: "Mumbai, India",
  customerModel: "both",
  hasPhysicalLocation: true,
  servesAtCustomerLocation: false,
  hasBusinessHours: true,
  primaryGoal: "Get more local enquiries",
  currentStatus: "I have a business name but no domain",
  ownedDomain: "",
  registrarName: "",
  hasRegistrarAccess: "",
  hasRecoveryEmailAccess: "",
  needs: [
    "Contact form",
    "Restaurant menu",
    "Photo gallery",
    "Testimonials",
    "WhatsApp / phone contact button",
  ],
  setupBudget: "Under 10,000",
  monthlyBudget: "Under 1,000 per month",
  timeline: "This week",
  buildPreference: "Do it myself with guidance",
  techComfort: "beginner",
  wantsSelfUpdate: "yes",
  brandAssets: ["Logo", "Photos"],
  needsContentHelp: "yes",
  needsBusinessEmail: "yes",
};

export function demoState(): AppState {
  const tasks = generateTasks(demoBusiness);
  const now = new Date().toISOString();
  tasks.slice(0, 3).forEach((t) => {
    t.status = "complete";
    t.completedAt = now;
  });
  const domainTask = tasks.find((t) => t.title.toLowerCase().includes("register your web address"));
  if (domainTask) domainTask.status = "in_progress";
  return {
    onboardingComplete: true,
    onboardingStep: 7,
    business: demoBusiness,
    tasks,
    maintenance: defaultMaintenance(),
    drafts: {},
    ownership: {
      domainRegistrar: "",
      renewalDate: "",
      dnsProvider: "",
      websitePlatform: "",
      emailProvider: "",
      analyticsAccount: "",
      paymentProcessor: "",
      socialOwners: "",
      recoveryOwner: "",
      notes: "",
    },
    dnsRecords: [],
    completedArticles: [],
    account: { signedIn: false, fullName: "", email: "" },
  };
}

export function emptyState(): AppState {
  return {
    onboardingComplete: false,
    onboardingStep: 0,
    business: { ...emptyBusiness },
    tasks: [],
    maintenance: defaultMaintenance(),
    drafts: {},
    ownership: {
      domainRegistrar: "",
      renewalDate: "",
      dnsProvider: "",
      websitePlatform: "",
      emailProvider: "",
      analyticsAccount: "",
      paymentProcessor: "",
      socialOwners: "",
      recoveryOwner: "",
      notes: "",
    },
    dnsRecords: [],
    completedArticles: [],
    account: { signedIn: false, fullName: "", email: "" },
  };
}

export function currentStage(tasks: LaunchTask[]): PhaseKey {
  for (const p of PHASES) {
    const inPhase = tasks.filter((t) => t.phase === p.key);
    if (inPhase.length && inPhase.some((t) => t.status !== "complete")) return p.key;
  }
  return "grow";
}

export function progressPercent(tasks: LaunchTask[]): number {
  if (!tasks.length) return 0;
  const done = tasks.filter((t) => t.status === "complete").length;
  return Math.round((done / tasks.length) * 100);
}

export function remainingEffort(tasks: LaunchTask[]): string {
  const mins = tasks
    .filter((t) => t.status !== "complete")
    .reduce((sum, t) => sum + t.estimatedMinutes, 0);
  if (!mins) return "All planned work is complete";
  const low = Math.max(1, Math.round((mins / 60) * 0.8));
  const high = Math.max(low + 1, Math.round((mins / 60) * 1.3));
  return `About ${low}–${high} hours of focused work`;
}
