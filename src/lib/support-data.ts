export interface HelpArticle {
  slug: string;
  title: string;
  category: string;
  summary: string;
  minutes: number;
  to: string;
  popular?: boolean;
  analogy?: string;
  example?: string;
}

export const HELP_CATEGORIES: { id: string; label: string; description: string; to: string }[] = [
  {
    id: "getting-started",
    label: "Getting started",
    description: "Build your plan and understand the seven launch phases.",
    to: "/how-it-works",
  },
  {
    id: "domains",
    label: "Domains",
    description: "Choosing, checking and renewing your web address.",
    to: "/domains",
  },
  {
    id: "platforms",
    label: "Website platforms",
    description: "Pick the builder, shop or CMS that fits your business.",
    to: "/platform-matcher",
  },
  {
    id: "dns",
    label: "DNS and domain connection",
    description: "Point your domain at your website without breaking email.",
    to: "/connect-domain",
  },
  {
    id: "email",
    label: "Business email",
    description: "Set up name@yourbusiness.com and keep it deliverable.",
    to: "/business-email",
  },
  {
    id: "content",
    label: "Website content",
    description: "Write pages that answer customer questions.",
    to: "/content",
  },
  {
    id: "checklist",
    label: "Launch checklist",
    description: "Track every task from plan to live.",
    to: "/checklist",
  },
  {
    id: "journey",
    label: "Customer journey tests",
    description:
      "Test calls, messages, forms, bookings, purchases and visits like a real customer.",
    to: "/customer-journey",
  },
  {
    id: "online-setup",
    label: "Online setup map",
    description: "See how your domain, DNS, website and business email fit together.",
    to: "/online-setup",
  },
  {
    id: "visibility",
    label: "Search and local visibility",
    description: "Be findable on search engines and maps.",
    to: "/get-found",
  },
  {
    id: "growth",
    label: "Growth toolkit",
    description: "Create campaign links and record simple monthly health checks.",
    to: "/growth-toolkit",
  },
  {
    id: "ownership",
    label: "Ownership and handoff",
    description: "Keep accounts in the right hands and share a professional launch dossier.",
    to: "/launch-dossier",
  },
  {
    id: "account",
    label: "Account and settings",
    description: "Your saved plan, appearance, privacy and data export.",
    to: "/settings",
  },
];

export const HELP_ARTICLES: HelpArticle[] = [
  {
    slug: "readiness-score-explained",
    title: "What does my launch readiness score mean?",
    category: "Launch checklist",
    summary:
      "Understand what the score checks, what a blocker means and why it is guidance rather than a guarantee.",
    minutes: 4,
    to: "/dashboard",
    popular: true,
    analogy:
      "Think of it like a pre-flight checklist: useful for known risks, but not a weather forecast.",
    example: "A broken booking button remains a blocker even if your domain is connected.",
  },
  {
    slug: "test-customer-action",
    title: "How do I test a call, form, booking or purchase?",
    category: "Launch checklist",
    summary:
      "Follow the same five-step path a customer would use and record the result without storing passwords or card details.",
    minutes: 5,
    to: "/customer-journey",
    popular: true,
    analogy: "It is a secret-shopper visit for your website.",
    example: "Place a test cake order on your phone and confirm the bakery receives it.",
  },
  {
    slug: "dns-impact-and-safety",
    title: "How do I know whether a DNS change is safe?",
    category: "DNS and domain connection",
    summary:
      "Use the impact preview, save your current records and protect mail records before changing website settings.",
    minutes: 5,
    to: "/online-setup",
    analogy:
      "DNS is the building directory; replacing the directory company affects every room, not just one sign.",
    example:
      "An A record change may affect the website, while nameserver changes can also affect email.",
  },
  {
    slug: "backup-before-device-change",
    title: "How do I move my plan to another device?",
    category: "Account and settings",
    summary: "Export your local plan as JSON, then restore it on the new browser.",
    minutes: 3,
    to: "/settings",
    analogy: "It is a photocopy of your project folder kept in a safe drawer.",
    example: "Import the backup after replacing a laptop instead of starting onboarding again.",
  },
  {
    slug: "campaign-links",
    title: "How do I tell which post or flyer brought visitors?",
    category: "Search and local visibility",
    summary:
      "Create consistent UTM labels in the Growth Toolkit and compare the results in your analytics tool.",
    minutes: 4,
    to: "/growth-toolkit",
    analogy:
      "Put a different colored sticker on identical envelopes so you know which mailbox they came from.",
    example: "Compare source=instagram with source=flyer for the same spring offer.",
  },
  {
    slug: "build-first-plan",
    title: "How do I build my first launch plan?",
    category: "Getting started",
    summary: "Answer a short set of questions and we generate a roadmap tailored to your business.",
    minutes: 3,
    to: "/onboarding",
    popular: true,
  },
  {
    slug: "choose-domain",
    title: "How do I choose a good domain name?",
    category: "Domains",
    summary: "Short, sayable, spellable, and matching your business name wherever possible.",
    minutes: 5,
    to: "/domains",
    popular: true,
  },
  {
    slug: "who-owns-domain",
    title: "How do I check who owns my domain?",
    category: "Domains",
    summary:
      "Look for renewal receipts, then confirm the registrar account holder before making changes.",
    minutes: 4,
    to: "/ownership-record",
  },
  {
    slug: "pick-platform",
    title: "Which website platform should I use?",
    category: "Website platforms",
    summary: "Answer eight plain-English questions and compare the trade-offs of each option.",
    minutes: 6,
    to: "/platform-matcher",
    popular: true,
  },
  {
    slug: "connect-domain-safely",
    title: "How do I connect my domain without breaking email?",
    category: "DNS and domain connection",
    summary: "Website records and mail records are separate. Change one, leave the other alone.",
    minutes: 8,
    to: "/connect-domain",
    popular: true,
  },
  {
    slug: "dns-propagation",
    title: "Why does my site still show the old page?",
    category: "DNS and domain connection",
    summary:
      "Changes can take up to 48 hours to spread. Check in a private window before panicking.",
    minutes: 4,
    to: "/troubleshooting",
  },
  {
    slug: "business-email-setup",
    title: "How do I set up name@mybusiness.com?",
    category: "Business email",
    summary: "Choose a provider, add mail records, then send a test message in both directions.",
    minutes: 7,
    to: "/business-email",
  },
  {
    slug: "email-into-spam",
    title: "Why does my email land in spam?",
    category: "Business email",
    summary: "SPF, DKIM and DMARC tell other providers your mail is genuine.",
    minutes: 6,
    to: "/glossary",
  },
  {
    slug: "write-home-page",
    title: "What should my home page say?",
    category: "Website content",
    summary: "One clear sentence about what you do, for whom, and how to get in touch.",
    minutes: 5,
    to: "/content",
  },
  {
    slug: "launch-day",
    title: "What happens on launch day?",
    category: "Launch checklist",
    summary: "Final checks, test the contact form, confirm HTTPS, then tell your customers.",
    minutes: 4,
    to: "/checklist",
  },
  {
    slug: "google-business",
    title: "How do I show up on maps and local search?",
    category: "Search and local visibility",
    summary: "Consistent name, address and phone details plus a verified business profile.",
    minutes: 6,
    to: "/get-found",
  },
  {
    slug: "export-plan",
    title: "How do I export or delete my saved plan?",
    category: "Account and settings",
    summary: "Download a JSON copy or clear everything stored in this browser at any time.",
    minutes: 2,
    to: "/settings",
  },
];

export interface TroubleshootingFlow {
  id: string;
  title: string;
  likelyCause: string;
  steps: string[];
  warning?: string;
  relatedTo: string;
  relatedLabel: string;
}

export const TROUBLESHOOTING_FLOWS: TroubleshootingFlow[] = [
  {
    id: "site-not-loading",
    title: "My website is not loading",
    likelyCause: "Recent DNS changes, an expired domain, or a hosting outage.",
    steps: [
      "Check the address for typos, including http:// versus https://.",
      "Try the site on mobile data as well as your usual network.",
      "Sign in to your registrar and confirm the domain has not expired.",
      "Confirm your website platform shows the site as published, not draft.",
      "If you changed DNS in the last 48 hours, wait and re-check.",
    ],
    relatedTo: "/connect-domain",
    relatedLabel: "DNS connection guide",
  },
  {
    id: "old-website",
    title: "I still see my old website",
    likelyCause: "Your browser or local network is caching the previous version.",
    steps: [
      "Open the site in a private or incognito window.",
      "Clear your browser cache, then reload.",
      "Ask someone on a different network to check for you.",
      "Confirm the A or CNAME record matches the value your new host gave you.",
    ],
    relatedTo: "/connect-domain",
    relatedLabel: "Check your records",
  },
  {
    id: "parking-page",
    title: "I see a parking page",
    likelyCause: "The domain is registered but not yet pointed at a website.",
    steps: [
      "Sign in to your registrar and look for a parking or default page setting.",
      "Add the website records your platform provided.",
      "Remove only the registrar's own placeholder record — nothing else.",
    ],
    warning:
      "Do not delete records you do not recognise. Mail records often look unfamiliar but are essential.",
    relatedTo: "/connect-domain",
    relatedLabel: "DNS connection guide",
  },
  {
    id: "not-verified",
    title: "My domain connection is not verified",
    likelyCause: "A record value has a typo, or verification is still pending.",
    steps: [
      "Copy the record value again from your platform — never retype it.",
      "Check the host field: some registrars want @, others want the full domain.",
      "Remove trailing spaces or full stops.",
      "Wait 30 minutes, then press verify again.",
    ],
    relatedTo: "/connect-domain",
    relatedLabel: "Record reference",
  },
  {
    id: "email-broken",
    title: "My business email stopped working",
    likelyCause: "Mail records were replaced while connecting the website.",
    steps: [
      "Stop and check whether your MX records still list your email provider.",
      "Compare them with the values in your email provider's setup guide.",
      "Restore any missing MX, SPF, DKIM or DMARC records.",
      "Send a test message from an outside address and reply to it.",
    ],
    warning:
      "Website records (A, CNAME) and mail records (MX, TXT for SPF/DKIM/DMARC) are separate. Changing website records should never require deleting mail records.",
    relatedTo: "/business-email",
    relatedLabel: "Business email guide",
  },
  {
    id: "no-https",
    title: "HTTPS is not active",
    likelyCause: "The certificate is still being issued, or the domain is not fully pointed yet.",
    steps: [
      "Wait up to 24 hours after the domain connection completes.",
      "Confirm both yourbusiness.com and www.yourbusiness.com are configured.",
      "Look for a 'force HTTPS' or 'SSL' toggle in your platform settings.",
    ],
    relatedTo: "/glossary",
    relatedLabel: "What is an SSL certificate?",
  },
  {
    id: "form-not-sending",
    title: "My contact form does not send messages",
    likelyCause: "Notifications go to an unmonitored address, or messages are filtered.",
    steps: [
      "Submit a test enquiry yourself.",
      "Check the spam or junk folder of the receiving mailbox.",
      "Confirm the notification address in your platform's form settings.",
      "Add a fallback: show your phone number and email on the contact page.",
    ],
    relatedTo: "/content",
    relatedLabel: "Contact page content",
  },
  {
    id: "no-domain-access",
    title: "I cannot access my domain account",
    likelyCause: "The account uses an old email address, or someone else set it up.",
    steps: [
      "Search your email for renewal receipts to identify the registrar.",
      "Use the registrar's account recovery, not a password guess.",
      "If a former contractor set it up, request a formal transfer in writing.",
      "Once recovered, update the account email and enable two-step sign-in.",
    ],
    relatedTo: "/ownership-record",
    relatedLabel: "Record your ownership details",
  },
  {
    id: "unknown-owner",
    title: "I do not know who owns the domain",
    likelyCause: "The domain was registered by an agency, employee or family member.",
    steps: [
      "Check bank statements for yearly registrar charges.",
      "Ask everyone who has helped with the website before.",
      "Ask for the registrar name and account email in writing.",
      "Plan a transfer into an account your business controls.",
    ],
    warning: "Never accept 'we'll look after it for you' as the only arrangement.",
    relatedTo: "/hire-help",
    relatedLabel: "Working with a professional",
  },
  {
    id: "cannot-sign-in",
    title: "I cannot sign in to Cornerstone",
    likelyCause:
      "Your plan is stored in this browser, so a different device or cleared data looks empty.",
    steps: [
      "Open the app in the same browser you used before.",
      "Check whether browsing data was cleared recently.",
      "If you exported a plan, you still have the JSON copy.",
      "Request reset instructions from the sign-in page.",
    ],
    relatedTo: "/forgot-password",
    relatedLabel: "Reset sign-in",
  },
];

export interface GlossaryTerm {
  term: string;
  category: "Domains" | "DNS" | "Website" | "Email" | "Growth";
  definition: string;
  whyItMatters: string;
  relatedTo: string;
  relatedLabel: string;
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: "Domain",
    category: "Domains",
    definition:
      "Your web address, such as yourbusiness.com. You rent it yearly rather than owning it forever.",
    whyItMatters:
      "It is the name customers type, share and remember. Losing it means losing your online front door.",
    relatedTo: "/domains",
    relatedLabel: "Domain finder",
  },
  {
    term: "Registrar",
    category: "Domains",
    definition: "The company where you register and renew your web address.",
    whyItMatters:
      "The registrar account is the master key to your domain. It must be in your business's name.",
    relatedTo: "/ownership-record",
    relatedLabel: "Ownership record",
  },
  {
    term: "Hosting",
    category: "Website",
    definition: "The service that stores your website's pages and shows them to visitors.",
    whyItMatters: "Most modern website builders include hosting, so you may not buy it separately.",
    relatedTo: "/platform-matcher",
    relatedLabel: "Platform matcher",
  },
  {
    term: "DNS",
    category: "DNS",
    definition: "The settings that tell the internet where your website and your email live.",
    whyItMatters: "A single wrong entry can take your site offline or stop your email arriving.",
    relatedTo: "/connect-domain",
    relatedLabel: "Connect your domain",
  },
  {
    term: "Nameserver",
    category: "DNS",
    definition: "The service that answers questions about your domain's settings.",
    whyItMatters:
      "Changing nameservers moves all of your settings at once — a bigger change than editing one record.",
    relatedTo: "/connect-domain",
    relatedLabel: "Connect your domain",
  },
  {
    term: "A record",
    category: "DNS",
    definition: "A setting that points your web address to a website's numeric address.",
    whyItMatters: "This is usually the record your website platform asks you to add.",
    relatedTo: "/connect-domain",
    relatedLabel: "Record reference",
  },
  {
    term: "CNAME record",
    category: "DNS",
    definition: "A setting that points one web address at another name.",
    whyItMatters: "Commonly used for the www version of your address.",
    relatedTo: "/connect-domain",
    relatedLabel: "Record reference",
  },
  {
    term: "MX record",
    category: "Email",
    definition: "A setting that tells the internet where to deliver your email.",
    whyItMatters: "Deleting or replacing it stops incoming mail immediately. Handle with care.",
    relatedTo: "/business-email",
    relatedLabel: "Business email",
  },
  {
    term: "TXT record",
    category: "DNS",
    definition: "A short note in your domain settings, often used to prove you own the domain.",
    whyItMatters: "Verification and email security settings both use TXT records.",
    relatedTo: "/connect-domain",
    relatedLabel: "Record reference",
  },
  {
    term: "SSL certificate",
    category: "Website",
    definition: "The file that lets your site use a secure, encrypted connection.",
    whyItMatters: "Without it browsers warn visitors that your site is not secure.",
    relatedTo: "/troubleshooting",
    relatedLabel: "HTTPS not active",
  },
  {
    term: "HTTPS",
    category: "Website",
    definition:
      "The padlock in the address bar. It means the connection to your site is encrypted.",
    whyItMatters: "Customers trust it, and search engines expect it.",
    relatedTo: "/get-found",
    relatedLabel: "Get found",
  },
  {
    term: "Redirect",
    category: "Website",
    definition: "A rule that sends visitors from one web address to another automatically.",
    whyItMatters: "Keeps old links working after you rename pages or change domains.",
    relatedTo: "/get-found",
    relatedLabel: "Get found",
  },
  {
    term: "Sitemap",
    category: "Growth",
    definition: "A list of your pages that helps search engines find everything.",
    whyItMatters: "Faster discovery of new pages after launch.",
    relatedTo: "/get-found",
    relatedLabel: "Get found",
  },
  {
    term: "Search indexing",
    category: "Growth",
    definition: "When a search engine stores your page so it can show it in results.",
    whyItMatters: "If your page is not indexed, nobody can find it by searching.",
    relatedTo: "/get-found",
    relatedLabel: "Get found",
  },
  {
    term: "Analytics",
    category: "Growth",
    definition: "A tool that shows how many people visit your site and what they do.",
    whyItMatters: "Tells you which pages bring enquiries so you can improve them.",
    relatedTo: "/maintenance",
    relatedLabel: "Maintenance center",
  },
  {
    term: "Conversion",
    category: "Growth",
    definition: "A visitor doing the thing you want: calling, booking, buying or enquiring.",
    whyItMatters: "Visits alone do not pay the bills; conversions do.",
    relatedTo: "/content",
    relatedLabel: "Content builder",
  },
  {
    term: "CMS",
    category: "Website",
    definition: "Content management system — software for editing your website without code.",
    whyItMatters: "Lets you update your own pages instead of paying for every small change.",
    relatedTo: "/platform-matcher",
    relatedLabel: "Platform matcher",
  },
  {
    term: "Ecommerce",
    category: "Website",
    definition: "Selling products or services online with payments taken on your site.",
    whyItMatters: "Adds checkout, tax, shipping and payout considerations to your plan.",
    relatedTo: "/platform-matcher",
    relatedLabel: "Platform matcher",
  },
  {
    term: "SPF",
    category: "Email",
    definition: "An email setting that lists who is allowed to send mail using your domain.",
    whyItMatters: "Missing SPF is a common reason business email lands in spam.",
    relatedTo: "/business-email",
    relatedLabel: "Business email",
  },
  {
    term: "DKIM",
    category: "Email",
    definition: "An email setting that adds a signature proving your mail is genuine.",
    whyItMatters: "Protects your business name from being used in fake emails.",
    relatedTo: "/business-email",
    relatedLabel: "Business email",
  },
  {
    term: "DMARC",
    category: "Email",
    definition: "An email setting that says what to do with mail that fails the other checks.",
    whyItMatters: "Improves deliverability and reduces impersonation.",
    relatedTo: "/business-email",
    relatedLabel: "Business email",
  },
];

export const GLOSSARY_CATEGORIES = ["Domains", "DNS", "Website", "Email", "Growth"] as const;

export interface ServiceStatus {
  id: string;
  name: string;
  description: string;
  status: "operational" | "degraded" | "down";
}

export const SERVICE_STATUSES: ServiceStatus[] = [
  {
    id: "website",
    name: "Website",
    description: "Marketing pages and guides.",
    status: "operational",
  },
  {
    id: "sign-in",
    name: "Sign in",
    description: "Labelling your plan with your details.",
    status: "operational",
  },
  {
    id: "plan-saving",
    name: "Plan saving",
    description: "Saving your roadmap on this device.",
    status: "operational",
  },
  {
    id: "library",
    name: "Learning library",
    description: "Articles, glossary and guides.",
    status: "operational",
  },
  {
    id: "notifications",
    name: "Notifications",
    description: "Maintenance reminders (not yet enabled).",
    status: "operational",
  },
];

export interface ChangelogEntryData {
  version: string;
  date: string;
  area: "Appearance" | "Planning" | "Guides" | "Mobile" | "Accounts";
  title: string;
  items: string[];
}

export const CHANGELOG: ChangelogEntryData[] = [
  {
    version: "1.4.0",
    date: "2 September 2026",
    area: "Appearance",
    title: "Dark mode and full route coverage",
    items: [
      "Added light, dark and system themes with a toggle in navigation and settings.",
      "Added help centre, troubleshooting, glossary, status and changelog pages.",
      "Added a friendly 404 page for unknown addresses.",
    ],
  },
  {
    version: "1.3.0",
    date: "12 August 2026",
    area: "Planning",
    title: "Expanded launch checklist",
    items: [
      "Filter tasks by phase, status and importance.",
      "Add your own custom tasks to the roadmap.",
      "Progress now reflects estimated effort remaining.",
    ],
  },
  {
    version: "1.2.0",
    date: "23 July 2026",
    area: "Accounts",
    title: "Digital ownership record",
    items: [
      "New printable record of registrar, hosting, email and analytics owners.",
      "Warnings about contractor-only account ownership.",
    ],
  },
  {
    version: "1.1.0",
    date: "3 July 2026",
    area: "Mobile",
    title: "Improved mobile navigation",
    items: ["Bottom navigation on small screens.", "Larger tap targets across guides."],
  },
];
