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
  "Hosting",
  "DNS",
  "Business email",
  "Ecommerce",
  "Booking",
  "Website content",
  "SEO",
  "Local business visibility",
  "Security",
  "Maintenance",
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
    terms: ["Domain", "Registrar"],
    minutes: 3,
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
    nextAction: "Screenshot your current settings before you change a single line.",
    terms: ["DNS", "A record", "CNAME", "MX record", "Nameserver"],
    minutes: 6,
  },
  {
    slug: "avoid-losing-domain-access",
    title: "How to avoid losing access to your domain",
    category: "Security",
    summary: "Register it yourself, secure the account, and document who can get in.",
    meaning:
      "Your web address is business infrastructure. If a contractor holds it alone, you can be locked out of your own brand.",
    whenToCare: "Before hiring anyone, and whenever a team member leaves.",
    mistake: "Letting an agency register the domain 'to make it easier'.",
    nextAction: "Complete the Domain Safety Checklist in the Domain Finder.",
    terms: ["Registrar", "Domain"],
    minutes: 5,
  },
  {
    slug: "choose-a-website-builder",
    title: "Choosing a website builder",
    category: "Website basics",
    summary: "Match the tool to how often you will update the site and what you need to sell.",
    meaning:
      "Simpler tools trade design freedom for speed and low maintenance. That trade is usually worth it at the start.",
    whenToCare: "Before paying for an annual plan.",
    mistake: "Choosing a powerful platform you will never have time to maintain.",
    nextAction: "Run the Platform Matcher and read the trade-offs of your recommended category.",
    terms: ["CMS", "Hosting", "Ecommerce"],
    minutes: 6,
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
    title: "Setting up business email",
    category: "Business email",
    summary: "An address on your own web address looks professional and keeps work mail separate.",
    meaning: "It requires a few directory (DNS) entries from your email provider — no coding.",
    whenToCare: "Once your web address is registered.",
    mistake: "Removing existing mail records while connecting a website.",
    nextAction: "Follow the Business Email guide step by step.",
    terms: ["MX record", "SPF", "DKIM", "DMARC"],
    minutes: 7,
  },
  {
    slug: "what-https-means",
    title: "What HTTPS means for your customers",
    category: "Security",
    summary: "The padlock shows the connection to your site is encrypted.",
    meaning:
      "Without it, browsers warn visitors that your site is 'not secure', which loses trust instantly.",
    whenToCare: "Immediately after connecting your web address.",
    mistake: "Ignoring a mixed-content warning after switching on HTTPS.",
    nextAction: "Load your site and confirm the padlock appears with no warning.",
    terms: ["SSL certificate", "HTTPS"],
    minutes: 3,
  },
  {
    slug: "test-your-contact-form",
    title: "How to test your contact form",
    category: "Website basics",
    summary: "Submit it yourself and confirm the message truly lands in a monitored inbox.",
    meaning:
      "Silent form failures are one of the most common and costly small business website problems.",
    whenToCare: "Before launch and once a month after.",
    mistake: "Assuming 'thanks for your message' means the email was delivered.",
    nextAction: "Send a test now and check your spam folder too.",
    terms: ["Conversion"],
    minutes: 3,
  },
  {
    slug: "basic-accessibility",
    title: "Basic website accessibility",
    category: "Website basics",
    summary: "Readable text, good contrast, descriptive links and image alt text help everyone.",
    meaning: "Accessible sites are easier for all customers to use — and often rank better too.",
    whenToCare: "While building each page.",
    mistake: "Using pale grey text on white because it 'looks minimal'.",
    nextAction: "Check your smallest text on a phone in daylight.",
    terms: [],
    minutes: 5,
  },
  {
    slug: "ready-for-search",
    title: "Getting your website ready for search",
    category: "SEO",
    summary: "Clear titles, real content, a fast mobile site, and a way to monitor how you appear.",
    meaning: "Search engines need to understand what you offer and where before they can show you.",
    whenToCare: "Right after launch.",
    mistake: "Copying descriptions from another business's site.",
    nextAction: "Check your SEO readiness score in the Get Found guide.",
    terms: ["Sitemap", "Search indexing", "Analytics"],
    minutes: 6,
  },
  {
    slug: "before-hiring-a-designer",
    title: "How to prepare before hiring a web designer",
    category: "Hiring a professional",
    summary: "Know your goal, your pages, your budget, and who will own the accounts.",
    meaning: "Clear briefs get cheaper, faster quotes and fewer disputes.",
    whenToCare: "Before requesting quotes.",
    mistake: "Letting the designer register the domain and hosting in their own name.",
    nextAction: "Generate the designer question list from the Learning Library tools.",
    terms: ["Hosting", "Registrar", "CMS"],
    minutes: 5,
  },
  {
    slug: "after-you-launch",
    title: "What to do when your website is live",
    category: "Maintenance",
    summary: "Check it the next day, watch enquiries, and set a monthly review.",
    meaning: "Launch is the start of a small routine, not the finish line.",
    whenToCare: "Day one after launch.",
    mistake: "Never looking at the site again until something breaks.",
    nextAction: "Open the Maintenance Center and confirm your weekly tasks.",
    terms: ["Analytics"],
    minutes: 4,
  },
];

export const GLOSSARY: Record<string, string> = {
  Domain:
    "Your web address, like yourbusiness.com. You rent it yearly rather than buying it forever.",
  Registrar: "The company where you register and renew your web address.",
  Hosting: "The service that stores your website's pages and shows them to visitors.",
  DNS: "The settings that tell the internet where your website and email live.",
  Nameserver: "The service that answers questions about your domain's settings.",
  "A record": "A setting that points your web address to a website's numeric address.",
  CNAME: "A setting that points one web address at another name.",
  "MX record": "A setting that tells the internet where to deliver your email. Handle with care.",
  "TXT record": "A short note in your domain settings, often used to prove you own the domain.",
  "SSL certificate": "The file that lets your site use a secure, encrypted connection.",
  HTTPS: "The padlock in the address bar. It means the connection to your site is encrypted.",
  Sitemap: "A list of your pages that helps search engines find everything.",
  "Search indexing": "When a search engine stores your page so it can show it in results.",
  Analytics: "A tool that shows how many people visit and what they do.",
  Conversion: "A visitor doing the thing you want: calling, booking, buying or enquiring.",
  CMS: "Content management system — software for editing your website without code.",
  Ecommerce: "Selling products or services online with payments taken on your site.",
  "Booking system": "A tool that lets customers reserve a time slot themselves.",
  Redirect: "A rule that sends visitors from one web address to another automatically.",
  SPF: "An email setting that lists who is allowed to send mail using your domain.",
  DKIM: "An email setting that adds a signature proving your mail is genuine.",
  DMARC: "An email setting that says what to do with mail that fails the other checks.",
};
