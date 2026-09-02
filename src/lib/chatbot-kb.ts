export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
  actions?: { label: string; to: string }[];
  suggestedQuestions?: string[];
}

export interface ChatbotContext {
  businessName?: string;
  domain?: string;
  completionPercent?: number;
  blockersCount?: number;
  nextStepTitle?: string;
  nextStepRoute?: string;
}

export const STARTER_QUESTIONS: string[] = [
  "How do I connect my domain?",
  "What DNS records do I need?",
  "How do I set up business email?",
  "What should I check before launch?",
  "Where am I in my launch plan?",
  "Which website builder should I use?",
];

interface KbTopic {
  keywords: string[];
  patterns?: RegExp[];
  respond: (
    query: string,
    context: ChatbotContext,
  ) => {
    text: string;
    actions?: { label: string; to: string }[];
    suggestedQuestions?: string[];
  };
}

const TOPICS: KbTopic[] = [
  // 1. Current progress / launch status
  {
    keywords: [
      "status",
      "progress",
      "where am i",
      "how ready",
      "readiness",
      "percent",
      "next step",
      "what's next",
      "my plan",
      "blockers",
    ],
    patterns: [/where.*am.*i/i, /my.*status/i, /what.*next/i, /how.*ready/i],
    respond: (_, context) => {
      const biz = context.businessName || "your business";
      const pct = context.completionPercent ?? 0;
      const blockers = context.blockersCount ?? 0;
      const nextTitle = context.nextStepTitle || "Complete your business basics";
      const nextRoute = context.nextStepRoute || "/business-profile";

      return {
        text: `Here is your current launch status for **${biz}**:\n\n• **Launch readiness:** ${pct}% completed\n• **Open blockers:** ${blockers} critical items needing attention\n• **Immediate priority:** ${nextTitle}\n\nYou can work through your tailored milestones one step at a time. Would you like to jump straight into your next step?`,
        actions: [
          { label: `Continue: ${nextTitle} →`, to: nextRoute },
          { label: "View full checklist →", to: "/checklist" },
        ],
        suggestedQuestions: [
          "What are my blockers?",
          "What should I check before launch?",
          "How do I connect my domain?",
        ],
      };
    },
  },

  // 2. Connecting custom domain / DNS setup
  {
    keywords: [
      "connect domain",
      "point domain",
      "dns setup",
      "add domain",
      "godaddy",
      "namecheap",
      "cloudflare",
      "domain setting",
      "connect my domain",
    ],
    patterns: [/connect.*domain/i, /point.*domain/i, /setup.*dns/i],
    respond: (_, context) => {
      const domain = context.domain || "your custom domain";
      return {
        text: `Connecting **${domain}** to your website takes two main DNS records in your domain registrar:\n\n1. **A Record (Root):** Point the \`@\` hostname to your website hosting server's IP address.\n2. **CNAME Record (www):** Point \`www\` to your root domain or hosting hostname.\n\n⏱️ **Propagation:** Changes usually update within 15 to 60 minutes, but can take up to 24-48 hours globally. Always keep your domain account in your own name!`,
        actions: [
          { label: "Open Domain Connection Guide →", to: "/connect-domain" },
          { label: "Explore Domain Shortlist →", to: "/domains" },
        ],
        suggestedQuestions: [
          "What is an A record vs CNAME?",
          "How long does DNS propagation take?",
          "How do I set up business email?",
        ],
      };
    },
  },

  // 3. DNS Record types (A, CNAME, MX, TXT, TTL)
  {
    keywords: [
      "a record",
      "cname",
      "mx record",
      "txt record",
      "what is an a record",
      "what is cname",
      "what is mx",
      "record type",
      "ttl",
      "nameserver",
    ],
    patterns: [/what.*(a record|cname|mx|txt|ttl|nameserver)/i],
    respond: () => {
      return {
        text: `Here is a plain-English guide to common DNS record types:\n\n• **A Record:** Points your domain to a server's numerical IP address (e.g. \`192.0.2.1\`).\n• **CNAME Record:** An alias pointing one web name to another (e.g. \`www\` pointing to \`yourdomain.com\`).\n• **MX Record:** Directs incoming emails to your email host (like Titan, Google Workspace, or Outlook).\n• **TXT Record:** Holds text verification codes and anti-spam policies (like SPF and DKIM).\n• **TTL (Time To Live):** Tells internet servers how many seconds to cache your DNS record before checking for updates.`,
        actions: [
          { label: "Configure DNS records →", to: "/connect-domain" },
          { label: "Check DNS impact safety →", to: "/connect-domain" },
        ],
        suggestedQuestions: [
          "How do I connect my domain?",
          "What are SPF, DKIM, and DMARC?",
          "How long does DNS propagation take?",
        ],
      };
    },
  },

  // 4. DNS Propagation / Why isn't my domain live yet?
  {
    keywords: [
      "propagation",
      "how long",
      "take to update",
      "why isn't my domain working",
      "domain not working",
      "not live yet",
      "dns delay",
      "wait time",
    ],
    patterns: [/how long.*(dns|domain|propagation)/i, /why.*(not working|not live)/i],
    respond: () => {
      return {
        text: `**DNS propagation** is the time it takes for internet servers worldwide to update their cached copies of your domain records:\n\n• **Typical time:** 15 to 60 minutes for modern DNS providers (like Cloudflare, Namecheap, Google).\n• **Maximum time:** Up to 24 to 48 hours in rare cases depending on TTL settings.\n\n💡 **Tip:** If your site works on your mobile phone via cellular data but not on your home Wi-Fi, your local router is still caching the old records. Try clearing your browser cache or testing in an incognito window!`,
        actions: [{ label: "Verify DNS records now →", to: "/connect-domain" }],
        suggestedQuestions: [
          "How do I connect my domain?",
          "What should I check before launch?",
          "How do I set up business email?",
        ],
      };
    },
  },

  // 5. Business email setup
  {
    keywords: [
      "email",
      "business email",
      "titan",
      "google workspace",
      "gmail",
      "custom email",
      "professional email",
      "mail",
      "inbox",
    ],
    patterns: [/how.*email/i, /setup.*email/i, /business.*email/i],
    respond: (_, context) => {
      const domain = context.domain || "yourdomain.com";
      return {
        text: `Using an address like **hello@${domain}** instantly builds customer credibility over personal free email accounts.\n\n**3 Steps to set up business email:**\n1. **Choose a provider:** Titan Email (built for small businesses), Google Workspace (Gmail + Docs), or Microsoft 365.\n2. **Add MX Records:** Add your provider's mail exchange records to your domain DNS.\n3. **Set up SPF, DKIM & DMARC:** Crucial DNS records that prove your emails are authentic and prevent them from landing in spam.`,
        actions: [
          { label: "Open Email Readiness Checklist →", to: "/email-readiness" },
          { label: "Connect Domain DNS →", to: "/connect-domain" },
        ],
        suggestedQuestions: [
          "What are SPF, DKIM, and DMARC?",
          "How do I stop emails going to spam?",
          "What DNS records do I need?",
        ],
      };
    },
  },

  // 6. SPF, DKIM, DMARC / Spam prevention
  {
    keywords: [
      "spf",
      "dkim",
      "dmarc",
      "spam",
      "deliverability",
      "junk mail",
      "email security",
      "spam score",
    ],
    patterns: [/what is.*(spf|dkim|dmarc)/i, /stop.*spam/i, /land in.*spam/i],
    respond: () => {
      return {
        text: `**SPF, DKIM, and DMARC** are the 3 security pillars that protect your business emails from going to spam:\n\n• **SPF (Sender Policy Framework):** A TXT record listing the exact mail servers allowed to send mail on behalf of your domain.\n• **DKIM (DomainKeys Identified Mail):** A digital signature attached to every email confirming the message wasn't tampered with in transit.\n• **DMARC:** Tells receiving mailboxes (Gmail, Yahoo, Outlook) what to do if an incoming email fails SPF or DKIM (e.g. quarantine or reject).\n\nWithout these, modern mailboxes will often flag your quotes, invoices, and replies as suspicious!`,
        actions: [
          { label: "Test Email Readiness →", to: "/email-readiness" },
          { label: "Check Pre-Flight Spam Score →", to: "/preflight" },
        ],
        suggestedQuestions: [
          "How do I set up business email?",
          "What DNS records do I need?",
          "What should I check before launch?",
        ],
      };
    },
  },

  // 7. Pre-launch checks & Simulator
  {
    keywords: [
      "check before launch",
      "preflight",
      "test",
      "simulator",
      "before announcing",
      "launch checklist",
      "go live check",
      "ready to launch",
      "quality check",
    ],
    patterns: [/what.*check.*before.*launch/i, /how.*test.*website/i, /ready.*launch/i],
    respond: () => {
      return {
        text: `Before announcing your website to customers or printing business cards, run through these essential checks:\n\n1. 📱 **Mobile tap test:** Tap your phone number and address on a smartphone to make sure it opens the dialer and maps.\n2. 📝 **Lead form verification:** Submit a test message through your contact or quote form to verify notifications reach your inbox.\n3. 🔒 **SSL certificate:** Ensure your browser shows the secure padlock on \`https://\`.\n4. 🚫 **404 page:** Confirm misspelled URLs show a polite error with a home link, not a server crash.\n5. ⚡ **Speed & clarity:** Ensure your key service and phone number are visible within 5 seconds of loading.`,
        actions: [
          { label: "Open 'Check Before Launch' Tool →", to: "/preflight" },
          { label: "Run Customer Journey Test →", to: "/customer-journey" },
        ],
        suggestedQuestions: [
          "What is SSL and HTTPS?",
          "Where is my launch checklist?",
          "How do I connect my domain?",
        ],
      };
    },
  },

  // 8. SSL & HTTPS
  {
    keywords: ["ssl", "https", "padlock", "security certificate", "not secure warning", "tls"],
    patterns: [/what is.*ssl/i, /how.*get.*(ssl|https)/i, /not secure/i],
    respond: () => {
      return {
        text: `**SSL (Secure Sockets Layer)** encrypts the connection between visitors and your website, displaying the secure **padlock** and \`https://\` in the address bar.\n\n• **Why it matters:** Without SSL, modern browsers show an alarming *"Not Secure"* warning, and search engines like Google will penalize your rankings.\n• **How to get it:** Most modern web hosts (Shopify, Squarespace, Wix, Cloudflare, WordPress hosts) include a free auto-renewing SSL certificate once your domain DNS is properly connected.\n\nIf you see an SSL error right after connecting DNS, wait 15–30 minutes for the certificate authority to issue your certificate!`,
        actions: [
          { label: "Run SSL & Security Check →", to: "/preflight" },
          { label: "Protect Website Access →", to: "/security-drill" },
        ],
        suggestedQuestions: [
          "How do I connect my domain?",
          "What should I check before launch?",
          "How do I prevent lockouts?",
        ],
      };
    },
  },

  // 9. Website platform recommendations
  {
    keywords: [
      "platform",
      "builder",
      "shopify",
      "wordpress",
      "squarespace",
      "wix",
      "framer",
      "webflow",
      "which platform",
      "website builder",
      "make website",
    ],
    patterns: [/which.*(platform|builder)/i, /shopify.*wordpress/i, /best.*builder/i],
    respond: () => {
      return {
        text: `Choosing the right website builder depends on your business model:\n\n• **Squarespace:** Best for simple service businesses, consultants, salons, and portfolios. Beautiful templates and zero maintenance.\n• **Shopify:** The gold standard if you sell physical products and need inventory, shipping labels, and checkout.\n• **WordPress (.org):** Maximum flexibility and control for large content sites, directories, or custom plugins.\n• **Wix:** Easy drag-and-drop visual builder ideal for small local shops wanting fast results.\n\nUse our Platform Matcher tool to get a tailored recommendation for your specific budget and goals!`,
        actions: [
          { label: "Find My Ideal Platform Match →", to: "/platform-matcher" },
          { label: "Draft Key Page Content →", to: "/content" },
        ],
        suggestedQuestions: [
          "What pages does my website need?",
          "How do I connect my domain?",
          "What should I check before launch?",
        ],
      };
    },
  },

  // 10. Key pages & copy
  {
    keywords: [
      "pages",
      "content",
      "copy",
      "homepage",
      "headline",
      "about page",
      "services page",
      "contact page",
      "call to action",
      "cta",
    ],
    patterns: [/what pages/i, /how to write/i, /content.*website/i],
    respond: () => {
      return {
        text: `Most small business websites only need **5 core pages** to convert visitors into paying clients:\n\n1. **Homepage:** A clear headline explaining what you do, who you serve, and how to contact you.\n2. **Services / Products:** Descriptions, transparent pricing expectations, and what's included.\n3. **About Us:** Your story, qualifications, local roots, and why customers trust you.\n4. **Reviews / Proof:** Customer testimonials, photo proof, or case studies.\n5. **Contact:** Clickable phone number, email, address map, and a simple inquiry form.\n\n💡 Remember: Write in plain, spoken language as if talking directly to a customer!`,
        actions: [
          { label: "Open Page Content Studio →", to: "/content" },
          { label: "Review Business Profile →", to: "/business-profile" },
        ],
        suggestedQuestions: [
          "Which website builder should I use?",
          "What should I check before launch?",
          "How do I get on Google Maps?",
        ],
      };
    },
  },

  // 11. Google Business Profile & Getting found
  {
    keywords: [
      "google maps",
      "google business",
      "local seo",
      "get found",
      "ranking",
      "seo",
      "search engine",
      "reviews",
      "google profile",
    ],
    patterns: [/how.*get found/i, /google.*maps/i, /google.*business/i, /get.*reviews/i],
    respond: () => {
      return {
        text: `For local businesses, your **Google Business Profile** (Google Maps listing) is often more visible than your actual website homepage!\n\n**Action steps to get found locally:**\n1. **Claim your listing:** Go to \`google.com/business\` and claim your business name.\n2. **Match NAP exactly:** Your Name, Address, and Phone number must match your website letter-for-letter.\n3. **Add photos & hours:** Upload real photos of your workspace, team, and storefront.\n4. **Collect 5 reviews:** Send your direct Google review link to your 5 most recent happy clients.`,
        actions: [
          { label: "Open 'Get Found Online' Guide →", to: "/get-found" },
          { label: "Check Pre-Flight Reviews →", to: "/preflight" },
        ],
        suggestedQuestions: [
          "What should I check before launch?",
          "What pages does my website need?",
          "Where is my launch checklist?",
        ],
      };
    },
  },

  // 12. Ownership, security, and avoiding lockouts
  {
    keywords: [
      "ownership",
      "lockout",
      "contractor",
      "agency",
      "password",
      "2fa",
      "security",
      "backup",
      "who owns my domain",
    ],
    patterns: [/who owns/i, /avoid.*lockout/i, /security.*domain/i],
    respond: () => {
      return {
        text: `**Never let a third-party agency or freelancer buy your domain under their own personal account.**\n\nIf they disappear, change careers, or have a dispute, you could lose your domain name, website, and business email overnight.\n\n**Protection rules:**\n• Buy the domain with your own credit card and email address.\n• Invite developers as a *delegated manager* or *collaborator*, never as the primary account owner.\n• Turn on **Two-Factor Authentication (2FA)** on your registrar and hosting accounts.\n• Download a backup copy of your DNS zone records.`,
        actions: [
          { label: "View Digital Ownership Ledger →", to: "/ownership-record" },
          { label: "Run Security & Lockout Drill →", to: "/security-drill" },
        ],
        suggestedQuestions: [
          "How do I connect my domain?",
          "What should I check before launch?",
          "Where is my launch checklist?",
        ],
      };
    },
  },

  // 13. Sharing the launch plan / Dossier
  {
    keywords: [
      "share",
      "export",
      "print",
      "dossier",
      "handover",
      "pdf",
      "send to client",
      "send to contractor",
    ],
    patterns: [/how.*share/i, /how.*export/i, /print.*plan/i],
    respond: () => {
      return {
        text: `You can export and share your entire verified launch blueprint at any time:\n\n• **Share Your Launch Plan:** A one-page printable certificate and technical handover dossier showing DNS records, ownership details, and verified readiness checks.\n• **Formats:** Print to PDF, copy Markdown for GitHub/docs, or copy a shareable link.\n\nPerfect for sharing with business partners, web contractors, or keeping in your company records!`,
        actions: [
          { label: "Open Share Launch Plan →", to: "/launch-dossier" },
          { label: "View Master Checklist →", to: "/checklist" },
        ],
        suggestedQuestions: [
          "Where am I in my launch plan?",
          "What should I check before launch?",
          "How do I connect my domain?",
        ],
      };
    },
  },
];

export function getBotResponse(
  userQuery: string,
  context: ChatbotContext = {},
): {
  text: string;
  actions?: { label: string; to: string }[];
  suggestedQuestions?: string[];
} {
  const query = userQuery.trim().toLowerCase();

  // Match against topics
  for (const topic of TOPICS) {
    // Check regex patterns first
    if (topic.patterns?.some((p) => p.test(query))) {
      return topic.respond(userQuery, context);
    }
    // Check keyword occurrences
    if (topic.keywords.some((kw) => query.includes(kw.toLowerCase()))) {
      return topic.respond(userQuery, context);
    }
  }

  // Greetings
  if (/^(hi|hello|hey|greetings|help|start|good morning|good afternoon)/i.test(query)) {
    const biz = context.businessName ? ` for **${context.businessName}**` : "";
    return {
      text: `Hello! 👋 I'm your launch assistant${biz}.\n\nI can answer basic questions about:\n• Connecting your custom domain & understanding DNS\n• Setting up professional business email (Titan, Google, Microsoft)\n• Pre-launch quality checks (mobile, forms, SSL, 404s)\n• Picking the right website builder\n• Your current launch progress and next steps\n\nWhat would you like to know?`,
      actions: [
        { label: "View Launch Checklist →", to: "/checklist" },
        { label: "Check Before Launch →", to: "/preflight" },
      ],
      suggestedQuestions: [
        "How do I connect my domain?",
        "What DNS records do I need?",
        "Where am I in my launch plan?",
        "What should I check before launch?",
      ],
    };
  }

  // Fallback answer
  return {
    text: `That's a great question! As your launch assistant, I specialize in the core steps of getting your business live online: domains, DNS records, business email, website builders, and pre-launch quality checks.\n\nHere are some common topics I can help explain right now:`,
    actions: [
      { label: "Explore Launch Checklist →", to: "/checklist" },
      { label: "Check Before Launch →", to: "/preflight" },
      { label: "Connect Domain Guide →", to: "/connect-domain" },
    ],
    suggestedQuestions: [
      "How do I connect my domain?",
      "What DNS records do I need?",
      "How do I set up business email?",
      "What should I check before launch?",
    ],
  };
}
