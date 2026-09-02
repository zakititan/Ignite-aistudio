export interface Article {
  slug: string;
  title: string;
  category: string;
  summary: string;
  meaning: string;
  whenToCare: string;
  mistake: string;
  nextAction: string;
  terms: string[];
  minutes: number;
}

export const LIBRARY_CATEGORIES = [
  "Domains",
  "Website basics",
  "Hosting & platforms",
  "Budget & pricing",
  "DNS",
  "Business email",
  "Email signatures",
  "Reviews & reputation",
  "Security & recovery",
  "Ecommerce",
  "Website content",
  "SEO & local search",
  "Maintenance",
  "Ownership & custody",
  "Hiring a professional",
];

export const ARTICLES: Article[] = [
  {
    slug: "domain-vs-hosting",
    title: "Domain vs hosting: what is the difference?",
    category: "Domains",
    summary:
      "Your domain is the web address people type. Hosting is the service that stores your pages and delivers them to visitors.",
    meaning:
      "You usually pay for these separately, and they can come from different companies. Owning one does not mean you own the other.",
    whenToCare: "Before you buy anything, and any time a provider offers you a bundle.",
    mistake:
      "Assuming that buying a domain means your website is live. It is not — nothing is connected yet.",
    nextAction:
      "Write down which company holds your web address and which one will hold your website.",
    terms: ["Domain", "Hosting", "Registrar"],
    minutes: 4,
  },
  {
    slug: "choose-a-domain-name",
    title: "How to choose a domain name",
    category: "Domains",
    summary: "Short, easy to say out loud, easy to spell, and clearly yours.",
    meaning:
      "Customers often hear your web address before they see it. If you have to spell it twice on the phone, pick another.",
    whenToCare:
      "Before you register anything — changing later means losing links and printed materials.",
    mistake: "Adding hyphens or numbers to force an unavailable name to work.",
    nextAction: "Run three candidate names through the Domain Name Score in the Domain Finder.",
    terms: ["Domain", "Registrar"],
    minutes: 5,
  },
  {
    slug: "domain-expires",
    title: "What happens when a domain expires?",
    category: "Domains",
    summary: "Your website and any email on that address can stop working, sometimes within hours.",
    meaning:
      "There is usually a grace period, but recovering a lapsed address can be expensive or impossible if someone else takes it.",
    whenToCare: "Every year, and any time your payment card changes.",
    mistake: "Letting renewal notices go to an old personal inbox nobody checks.",
    nextAction: "Turn on auto-renew and record the renewal date in your Ownership Record.",
    terms: ["Domain", "Registrar", "Auto-renewal", "Registrar lock"],
    minutes: 3,
  },
  {
    slug: "tco-budget-renewal-traps",
    title: "3-Year Website TCO: How to spot introductory price hikes",
    category: "Budget & pricing",
    summary: "Introductory promotional rates frequently jump by 200% to 500% in Year 2 and beyond.",
    meaning:
      "A $1.99/year domain or $2.99/mo web host often balloons upon renewal into $25+/yr domain fees, $9.99/yr WHOIS privacy add-ons, and full-price hosting tiers.",
    whenToCare:
      "Before purchasing multi-year contracts or entering credit card details at checkout.",
    mistake:
      "Budgeting only for Year 1 setup costs without accounting for ongoing 36-month software subscriptions.",
    nextAction:
      "Run the 3-Year Website TCO Calculator to forecast domain, email, hosting, and merchant processing costs.",
    terms: ["TCO", "WHOIS privacy", "Payment gateway", "Auto-renewal"],
    minutes: 5,
  },
  {
    slug: "dns-without-jargon",
    title: "How DNS works without the jargon",
    category: "DNS",
    summary: "DNS is the directory that tells the internet where your website and email live.",
    meaning:
      "When you point your address at a website, you are updating a directory entry — not moving any files.",
    whenToCare: "When connecting a new website, or switching email providers.",
    mistake: "Deleting records you do not recognise, which often breaks business email.",
    nextAction:
      "Screenshot your current settings before you change a single line, or download a DNS zone snapshot.",
    terms: ["DNS", "A record", "CNAME", "MX record", "Nameserver", "Zone file"],
    minutes: 6,
  },
  {
    slug: "dns-zone-backup-vault",
    title: "Why every business needs an offline DNS zone backup",
    category: "DNS",
    summary:
      "A plain-text BIND zone file lets you restore all website, mail, and verification routing in seconds.",
    meaning:
      "If nameservers get wiped or an agency mistakenly resets your registrar DNS, having an offline zone snapshot prevents days of broken email and downtime.",
    whenToCare:
      "After completing your website and email DNS records, and before making any major server migrations.",
    mistake:
      "Relying purely on your web host's memory without storing a local copy of your DNS records.",
    nextAction:
      "Download an authoritative zone file snapshot from the Disaster Recovery & Domain Security Drill.",
    terms: ["DNS", "Zone file", "TTL", "Nameserver"],
    minutes: 4,
  },
  {
    slug: "avoid-losing-domain-access",
    title: "How to avoid losing access to your domain (Account Fortress & 2FA)",
    category: "Ownership & custody",
    summary: "Register it yourself, secure the account with 2FA, and document root access.",
    meaning:
      "Your web address is foundational business infrastructure. If a contractor holds it alone or your password leaks without 2FA, your brand can be hijacked or held hostage.",
    whenToCare: "Before hiring any freelancer, and whenever a contractor completes a project.",
    mistake:
      "Letting an agency register the domain in their own company account 'to make setup easier'.",
    nextAction:
      "Complete the 2FA Fortress Checklist and verify all assets in your Ownership Record.",
    terms: ["Registrar", "Domain", "2FA / MFA", "Registrar lock", "Root account"],
    minutes: 5,
  },
  {
    slug: "website-outage-triage",
    title: "Emergency triage: what to do when your website goes down",
    category: "Security & recovery",
    summary:
      "Isolate the root cause fast: SSL certificate lapse, NXDOMAIN DNS failure, or 500 server crash.",
    meaning:
      "Different error screens require completely different fixes. A red browser lock warning is an SSL issue; a 502 Bad Gateway is a hosting server crash.",
    whenToCare:
      "The moment a customer or monitoring alert reports that your website is inaccessible.",
    mistake:
      "Panicking and changing random DNS records, which often breaks email deliverability as well.",
    nextAction:
      "Open the Disaster Recovery Drill, select your error symptom, and copy the ready-to-paste emergency support ticket.",
    terms: ["SSL certificate", "HTTPS", "NXDOMAIN", "HTTP 500 / 502", "Downtime"],
    minutes: 5,
  },
  {
    slug: "email-signature-trust",
    title: "HTML Email Signatures: How to turn routine emails into local trust",
    category: "Email signatures",
    summary:
      "A clean, responsive HTML email signature establishes instant credibility and drives phone calls and reviews.",
    meaning:
      "Standard text signatures look casual, while image-only signatures get blocked by spam filters or don't render on mobile. Clean HTML with tap-to-call links and review badges gives maximum deliverability.",
    whenToCare: "Immediately after setting up your custom business email mailbox.",
    mistake:
      "Using a single large PNG image for your signature, which Outlook and Gmail often block by default.",
    nextAction:
      "Generate a client-safe signature in the Professional HTML Email Signature Generator and paste into Gmail or Outlook.",
    terms: ["HTML signature", "Business email", "Spam filter", "Tap-to-call"],
    minutes: 4,
  },
  {
    slug: "google-reviews-growth-engine",
    title: "How to turn happy customers into 5-star Google reviews",
    category: "Reviews & reputation",
    summary:
      "Direct shortlinks, countertop QR stands, and prompt post-service SMS follow-ups generate consistent reviews.",
    meaning:
      "87% of local consumers read Google reviews before contacting a business. Having 15+ recent reviews with photos is the #1 signal for ranking in Google Maps 3-pack.",
    whenToCare:
      "The day you launch and immediately after every completed job or customer transaction.",
    mistake:
      "Asking customers to 'search for us on Google' instead of giving them a direct 1-tap review link or QR code.",
    nextAction:
      "Print a Tabletop Counter Stand and copy the 1-day SMS follow-up script from the Google Review Request Kit.",
    terms: [
      "Google Business Profile",
      "Google Maps 3-pack",
      "Review shortlink",
      "QR code",
      "Social proof",
    ],
    minutes: 5,
  },
  {
    slug: "choose-a-website-builder",
    title: "Choosing a website platform: Builder vs CMS vs Custom",
    category: "Hosting & platforms",
    summary:
      "Match the tool to how often you will update the site and what technical overhead you can sustain.",
    meaning:
      "All-in-one builders (Squarespace, Wix) bundle hosting and security for a flat monthly fee. Self-hosted CMS (WordPress) offers unlimited flexibility but requires plugin and backup maintenance.",
    whenToCare: "Before paying for an annual subscription.",
    mistake:
      "Choosing a complex self-hosted stack you have no time to update, resulting in security vulnerabilities.",
    nextAction: "Run the Platform Matcher and review the 3-Year TCO comparisons.",
    terms: ["CMS", "Hosting", "Ecommerce", "TCO"],
    minutes: 6,
  },
  {
    slug: "preflight-checklist-guide",
    title: "The Pre-Flight Launch Simulation: What to test before going live",
    category: "Website basics",
    summary:
      "Verify mobile responsiveness, form delivery, SSL padlocks, analytics, and social share tags.",
    meaning:
      "Launching with broken phone numbers, missing Open Graph images, or non-functional contact forms wastes your initial traffic spike.",
    whenToCare: "48 to 24 hours prior to public announcement or ad spending.",
    mistake: "Assuming forms work because the submit button showed an on-screen alert.",
    nextAction: "Run through all checks in the Pre-Flight Launch Simulator.",
    terms: ["Pre-flight check", "Open Graph", "SSL certificate", "Conversion"],
    minutes: 5,
  },
  {
    slug: "essential-pages",
    title: "What pages every small-business website needs",
    category: "Website content",
    summary: "Home, About, Services or Products, and Contact will carry most small businesses.",
    meaning: "Fewer, clearer pages usually produce more enquiries than a large, unfinished site.",
    whenToCare: "While planning your build.",
    mistake: "Launching with placeholder text still on the page.",
    nextAction: "Open the Content Builder and draft your Home page first.",
    terms: ["Conversion"],
    minutes: 4,
  },
  {
    slug: "homepage-that-converts",
    title: "How to write a homepage that gets enquiries",
    category: "Website content",
    summary: "Say what you do, who you do it for, where, and what to do next — above the fold.",
    meaning: "Visitors decide in seconds. Clarity beats clever wording every time.",
    whenToCare: "Before launch, and again after your first month of visitors.",
    mistake: "Opening with 'Welcome to our website'.",
    nextAction: "Use the headline prompts in the Content Builder.",
    terms: ["Conversion"],
    minutes: 6,
  },
  {
    slug: "business-email-setup",
    title: "Setting up business email: SPF, DKIM, and DMARC explained",
    category: "Business email",
    summary:
      "An address on your own domain looks professional, protects deliverability, and prevents email spoofing.",
    meaning:
      "It requires specific DNS records (MX, SPF TXT, DKIM CNAME) from your email host — no code required.",
    whenToCare: "Once your web address is registered and before sending client invoices or quotes.",
    mistake:
      "Omitting SPF and DKIM records, which causes modern inboxes (Gmail/Yahoo) to reject your emails as spam.",
    nextAction: "Follow the Business Email guide and verify DNS deliverability records.",
    terms: ["MX record", "SPF", "DKIM", "DMARC", "Email deliverability"],
    minutes: 7,
  },
  {
    slug: "what-https-means",
    title: "What HTTPS means for your customers",
    category: "Security & recovery",
    summary: "The padlock shows the connection to your site is encrypted and tamper-proof.",
    meaning:
      "Without it, browsers warn visitors that your site is 'not secure', which destroys trust instantly.",
    whenToCare: "Immediately after connecting your web address.",
    mistake: "Ignoring a mixed-content warning after switching on HTTPS.",
    nextAction: "Load your site and confirm the padlock appears with no warning.",
    terms: ["SSL certificate", "HTTPS"],
    minutes: 3,
  },
  {
    slug: "test-your-contact-form",
    title: "How to test your contact form & notification pipeline",
    category: "Website basics",
    summary:
      "Submit real test enquiries and confirm the message lands in a monitored inbox without hitting spam.",
    meaning:
      "Silent form delivery failures are one of the most common and expensive small business website bugs.",
    whenToCare: "Before launch and on a monthly maintenance cadence.",
    mistake: "Assuming 'Message Sent' on screen guarantees email inbox delivery.",
    nextAction: "Send a test enquiry and reply to confirm full two-way communication.",
    terms: ["Conversion", "Spam filter"],
    minutes: 3,
  },
  {
    slug: "basic-accessibility",
    title: "Basic website accessibility & mobile ergonomics",
    category: "Website basics",
    summary:
      "Readable text, 44px touch targets, good contrast, and image alt tags benefit every customer.",
    meaning:
      "Accessible websites convert better on mobile and safeguard against usability complaints.",
    whenToCare: "While designing and reviewing pages.",
    mistake:
      "Using tiny, low-contrast text or placing clickable buttons too close together for thumb taps.",
    nextAction: "Review your site on a physical smartphone under bright lighting.",
    terms: ["Accessibility"],
    minutes: 5,
  },
  {
    slug: "ready-for-search",
    title: "Getting your website ready for search & Google Maps",
    category: "SEO & local search",
    summary:
      "NAP consistency (Name, Address, Phone), fast mobile load times, sitemaps, and local citations.",
    meaning:
      "Search engines need to verify your physical service location before recommending you to nearby searchers.",
    whenToCare: "Right after launch.",
    mistake:
      "Listing different phone numbers or addresses across your website, Facebook, and Google profile.",
    nextAction: "Check your SEO readiness checklist in the Get Found guide.",
    terms: [
      "NAP consistency",
      "Google Business Profile",
      "Sitemap",
      "Search indexing",
      "Analytics",
    ],
    minutes: 6,
  },
  {
    slug: "before-hiring-a-designer",
    title: "How to prepare before hiring a web designer or agency",
    category: "Hiring a professional",
    summary:
      "Define your pages, write your copy, set your budget, and insist on holding all master accounts.",
    meaning: "Clear briefs get faster quotes, prevent scope creep, and avoid vendor lock-in.",
    whenToCare: "Before signing contracts or paying deposits.",
    mistake: "Allowing an agency to purchase domains and hosting under their own credit card.",
    nextAction: "Generate the designer interview questionnaire in your Launch Dossier.",
    terms: ["Hosting", "Registrar", "CMS", "Ownership record", "Root account"],
    minutes: 5,
  },
  {
    slug: "after-you-launch",
    title: "What to do once your website is live: Maintenance cadence",
    category: "Maintenance",
    summary: "Check forms weekly, review analytics monthly, and renew domains and SSL annually.",
    meaning: "Launch is the start of an ongoing business asset, not a one-and-done project.",
    whenToCare: "Day one after launch and ongoing.",
    mistake: "Never checking your website until a customer calls to say it is broken.",
    nextAction: "Open the Maintenance Center and schedule your recurring calendar checks.",
    terms: ["Analytics", "Auto-renewal", "Downtime"],
    minutes: 4,
  },
];

export const GLOSSARY: Record<string, string> = {
  Domain:
    "Your web address, like yourbusiness.com. You register (rent) it yearly rather than buying it forever.",
  Registrar:
    "The ICANN-accredited company where you register and renew your web address (e.g., Porkbun, Namecheap, GoDaddy).",
  Hosting:
    "The cloud server service that stores your website's files, images, and code and serves them to web visitors.",
  DNS: "Domain Name System — the internet's telephone directory that translates human names (yourdomain.com) into server IP addresses.",
  Nameserver:
    "The authoritative servers that store and respond to queries about your domain's DNS routing records.",
  "A record":
    "An address record pointing your root domain (@) directly to a server's numeric IPv4 address (e.g. 76.76.21.21).",
  CNAME:
    "Canonical Name record — an alias that points one subdomain (e.g., www or mail) to another host name.",
  "MX record":
    "Mail Exchange record — directs incoming emails sent to @yourdomain.com to your email provider's servers.",
  "TXT record":
    "Text record — stores arbitrary text data in your DNS, commonly used for ownership verification and anti-spam rules.",
  "Zone file":
    "A standardized text file containing all authoritative DNS records (A, CNAME, MX, TXT) for your domain, used for offline backup.",
  TTL: "Time to Live — the number of seconds DNS resolvers cache a record before querying the nameserver again for updates.",
  "SSL certificate":
    "A digital certificate that encrypts the connection between a visitor's browser and your web server.",
  HTTPS:
    "Hypertext Transfer Protocol Secure — indicated by the padlock icon in the browser address bar, ensuring encrypted data transmission.",
  "2FA / MFA":
    "Two-Factor Authentication — requiring both your password and a time-based authenticator app code to log into critical accounts.",
  "Registrar lock":
    "A security setting at your domain registrar that prevents unauthorized transfers of your web address to another provider.",
  "Root account":
    "The primary master login created with your personal/corporate email that holds master billing and permission rights.",
  TCO: "Total Cost of Ownership — the comprehensive sum of all initial and recurring software, domain, email, and processing costs over 1–3 years.",
  "WHOIS privacy":
    "A service that masks your personal contact details (name, home address, phone) in public domain lookup registries.",
  "Payment gateway":
    "A secure merchant processing service (like Stripe or Square) that processes credit cards online for a fee (typically 2.9% + 30¢).",
  "HTML signature":
    "A formatted email sign-off containing clickable phone numbers, website links, branding, and review badges rendered via HTML.",
  "Spam filter":
    "Automated email server algorithms that inspect incoming messages for authentication records (SPF/DKIM) and suspicious links.",
  "Tap-to-call":
    "A clickable link (tel:+1...) formatted so mobile visitors can tap to instantly dial your business phone number.",
  "Google Business Profile":
    "The free local business listing platform that powers your presence on Google Maps and local search results.",
  "Google Maps 3-pack":
    "The top 3 local business listings displayed with a map pin on Google search result pages for local service queries.",
  "Review shortlink":
    "A direct URL (e.g. g.page/r/.../review) that opens directly to the 5-star review submission window.",
  "QR code":
    "Quick Response code — a 2D matrix barcode scannable with smartphone cameras to open web links instantly.",
  "Social proof":
    "Evidence from existing customers (reviews, ratings, testimonials) that reassures prospective buyers.",
  Sitemap:
    "An XML file listing all published pages on your website to help search engine crawlers discover and index your content.",
  "Search indexing":
    "When search engines crawl, analyze, and save your website pages into their searchable database.",
  Analytics:
    "Software (e.g., Google Analytics or Plausible) that tracks visitor counts, traffic sources, and on-site behavior.",
  Conversion:
    "When a website visitor completes your primary business goal: calling, booking an appointment, filling a quote form, or purchasing.",
  CMS: "Content Management System — software (like WordPress, Ghost, or Webflow) enabling easy page and blog editing without writing code.",
  Ecommerce:
    "The infrastructure for selling products or services online, managing inventory, and processing customer checkout transactions.",
  "Booking system":
    "Software that lets customers schedule appointments or service windows directly on your website based on live availability.",
  Redirect:
    "A web server rule (such as 301 Permanent Redirect) sending visitors automatically from an old URL to a new target address.",
  SPF: "Sender Policy Framework — a DNS TXT record declaring which mail servers are authorized to send email on behalf of your domain.",
  DKIM: "DomainKeys Identified Mail — an encrypted digital signature attached to outgoing emails proving the message wasn't forged or altered.",
  DMARC:
    "Domain-based Message Authentication, Reporting & Conformance — instructions to receiving inboxes on handling emails failing SPF/DKIM.",
  "Email deliverability":
    "The rate at which your outgoing business emails successfully reach recipient inboxes instead of being rejected or sent to spam.",
  NXDOMAIN:
    "Non-Existent Domain — a DNS error indicating that the domain name cannot be resolved to any active server IP address.",
  "HTTP 500 / 502":
    "Server error status codes indicating that the web host crashed, timed out, or encountered an internal script failure.",
  Downtime:
    "The period when a website or email service is inaccessible to visitors or customers due to technical failures.",
  "Pre-flight check":
    "A comprehensive pre-launch audit testing all links, forms, security certificates, and responsiveness prior to public release.",
  "Open Graph":
    "Meta tags in your website HTML that control the preview image, title, and description displayed when your URL is shared on social media.",
  "NAP consistency":
    "Ensuring your business Name, Address, and Phone number are spelled identically across all online listings and directories.",
  "Auto-renewal":
    "An automated billing setting ensuring your domain and hosting subscriptions renew seamlessly without service interruption.",
  "Ownership record":
    "A secure central document detailing all account logins, registrar credentials, DNS hosts, and billing cards for your digital assets.",
  Accessibility:
    "Designing web pages so that people with visual, auditory, motor, or cognitive disabilities can navigate and interact with ease.",
};
