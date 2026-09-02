import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Mail,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Info,
  Layers,
  UserCheck,
  DollarSign,
  Calculator,
  TrendingDown,
  Zap,
  Check,
  Activity,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Callout } from "@/components/Callouts";
import { LiveDnsChecker } from "@/components/LiveDnsChecker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/business-email")({
  head: () => ({
    meta: [
      { title: "Business Email Setup & DNS Generator — Look Professional" },
      {
        name: "description",
        content:
          "Generate exact MX, SPF, DKIM, and DMARC DNS records for Titan, Google Workspace, Microsoft 365, and other email providers with deliverability guidance.",
      },
      { property: "og:title", content: "Business Email Setup & DNS Generator" },
      {
        property: "og:description",
        content:
          "Interactive DNS records generator, multi-sender SPF builder, address naming architect, and inbox deliverability tester.",
      },
    ],
  }),
  component: BusinessEmail,
});

interface DnsRecord {
  id: string;
  type: "MX" | "TXT" | "CNAME" | "A";
  host: string;
  priority?: number;
  value: string;
  purpose: string;
  critical?: boolean;
}

interface ProviderPricing {
  startingPrice: string;
  pricePerUserMonthly: number; // For cost calculator
  billingNote: string;
  freeTierOrTrial: string;
  storage: string;
  bestFor: string;
  highlights: string[];
  plans: { name: string; price: string; storage: string; note: string }[];
}

interface ProviderPreset {
  id: string;
  name: string;
  tagline: string;
  badge?: string;
  docUrl: string;
  pricing: ProviderPricing;
  generateRecords: (
    domain: string,
    spfIncludes: string[],
    dmarcPolicy: string,
    dmarcEmail: string,
    googleMode?: "single" | "five",
  ) => DnsRecord[];
}

const PROVIDER_PRESETS: ProviderPreset[] = [
  {
    id: "titan",
    name: "Titan Mail",
    tagline: "Modern business email built for small businesses & domain registrars",
    badge: "Recommended for Small Business",
    docUrl: "https://support.titan.email",
    pricing: {
      startingPrice: "$1.50 – $2.00 / user / mo",
      pricePerUserMonthly: 1.5,
      billingNote: "Billed annually or bundled with domain registrars",
      freeTierOrTrial: "30-day free trial with most registrars",
      storage: "10 GB to 50 GB per mailbox",
      bestFor:
        "Solo founders, freelancers, and small businesses seeking clean, reliable email without paying for unused enterprise software.",
      highlights: [
        "Built-in read receipts & email tracking",
        "Send later & follow-up reminders",
        "Rich signature builder & template manager",
        "iOS, Android, and Desktop native apps",
        "Unlimited free email aliases (hello@, support@)",
        "Integrated calendar and contacts",
      ],
      plans: [
        {
          name: "Business Email",
          price: "$1.50 – $2.00/user/mo",
          storage: "10 GB / mailbox",
          note: "Includes calendar, contacts, read receipts, and mobile apps.",
        },
        {
          name: "Business Premium",
          price: "$2.99 – $3.99/user/mo",
          storage: "50 GB / mailbox",
          note: "Includes priority support, advanced anti-spam, and expanded storage.",
        },
      ],
    },
    generateRecords: (domain, spfIncludes, dmarcPolicy, dmarcEmail) => {
      const spfIncludeStr =
        spfIncludes.length > 0 ? " " + spfIncludes.map((i) => `include:${i}`).join(" ") : "";
      return [
        {
          id: "titan-mx-1",
          type: "MX",
          host: "@",
          priority: 10,
          value: "mx1.titan.email",
          purpose: "Primary incoming mail server for Titan Mail.",
          critical: true,
        },
        {
          id: "titan-mx-2",
          type: "MX",
          host: "@",
          priority: 20,
          value: "mx2.titan.email",
          purpose: "Secondary backup incoming mail server.",
          critical: true,
        },
        {
          id: "titan-spf",
          type: "TXT",
          host: "@",
          value: `v=spf1 include:spf.titan.email${spfIncludeStr} ~all`,
          purpose:
            "SPF permission record authorizing Titan (and extra senders) to send for your domain.",
          critical: true,
        },
        {
          id: "titan-dkim-1",
          type: "TXT",
          host: "titan1._domainkey",
          value:
            "v=DKIM1; k=rsa; p=(Copy your unique public DKIM key from Titan Control Panel > Email Settings > DKIM)",
          purpose:
            "DKIM signature TXT key 1: Cryptographically signs outgoing emails to prevent spoofing and guarantee primary inbox delivery.",
          critical: true,
        },
        {
          id: "titan-dkim-2",
          type: "TXT",
          host: "titan2._domainkey",
          value:
            "v=DKIM1; k=rsa; p=(Copy your backup public DKIM key from Titan Control Panel for automated key rotation)",
          purpose: "DKIM signature TXT key 2: Backup key for seamless DKIM key rotation.",
        },
        {
          id: "titan-dmarc",
          type: "TXT",
          host: "_dmarc",
          value: `v=DMARC1; p=${dmarcPolicy}; rua=mailto:${dmarcEmail || `admin@${domain}`}; sp=${dmarcPolicy}; aspf=r;`,
          purpose:
            "DMARC policy: Protects your brand from impersonation and satisfies Gmail/Yahoo requirements.",
        },
      ];
    },
  },
  {
    id: "google",
    name: "Google Workspace",
    tagline: "Gmail, Google Calendar, Drive, and Meet at your custom domain",
    badge: "Most Popular",
    docUrl: "https://support.google.com/a/answer/140034",
    pricing: {
      startingPrice: "$6.00 / user / mo",
      pricePerUserMonthly: 6.0,
      billingNote: "Billed monthly ($7.20/mo) or annually ($6.00/mo/user)",
      freeTierOrTrial: "14-day free trial",
      storage: "30 GB pooled cloud storage per user",
      bestFor:
        "Teams already collaborating extensively in Google Docs, Sheets, Google Meet, and Drive.",
      highlights: [
        "Familiar Gmail web and mobile interface",
        "Google Drive cloud storage (30GB to 2TB)",
        "Google Meet video calls (100+ participants)",
        "Collaborative Docs, Sheets, and Slides",
        "Up to 30 email aliases per user at no extra cost",
        "Top-tier spam filtering and enterprise security",
      ],
      plans: [
        {
          name: "Business Starter",
          price: "$6.00/user/mo",
          storage: "30 GB pooled / user",
          note: "Custom business email, 100-participant video calls, 30GB Drive storage.",
        },
        {
          name: "Business Standard",
          price: "$12.00/user/mo",
          storage: "2 TB pooled / user",
          note: "150-participant video meetings + recording, 2TB Drive storage.",
        },
        {
          name: "Business Plus",
          price: "$18.00/user/mo",
          storage: "5 TB pooled / user",
          note: "500-participant video calls, Vault retention and discovery.",
        },
      ],
    },
    generateRecords: (domain, spfIncludes, dmarcPolicy, dmarcEmail, googleMode = "single") => {
      const spfIncludeStr =
        spfIncludes.length > 0 ? " " + spfIncludes.map((i) => `include:${i}`).join(" ") : "";

      const records: DnsRecord[] = [];

      if (googleMode === "single") {
        records.push({
          id: "google-mx-single",
          type: "MX",
          host: "@",
          priority: 1,
          value: "SMTP.GOOGLE.COM",
          purpose: "Google's modern, simplified single MX record for all incoming mail.",
          critical: true,
        });
      } else {
        records.push(
          {
            id: "google-mx-1",
            type: "MX",
            host: "@",
            priority: 1,
            value: "ASPMX.L.GOOGLE.COM",
            purpose: "Primary Google incoming mail server.",
            critical: true,
          },
          {
            id: "google-mx-2",
            type: "MX",
            host: "@",
            priority: 5,
            value: "ALT1.ASPMX.L.GOOGLE.COM",
            purpose: "Secondary backup server.",
            critical: true,
          },
          {
            id: "google-mx-3",
            type: "MX",
            host: "@",
            priority: 5,
            value: "ALT2.ASPMX.L.GOOGLE.COM",
            purpose: "Secondary backup server.",
            critical: true,
          },
          {
            id: "google-mx-4",
            type: "MX",
            host: "@",
            priority: 10,
            value: "ALT3.ASPMX.L.GOOGLE.COM",
            purpose: "Tertiary backup server.",
          },
          {
            id: "google-mx-5",
            type: "MX",
            host: "@",
            priority: 10,
            value: "ALT4.ASPMX.L.GOOGLE.COM",
            purpose: "Tertiary backup server.",
          },
        );
      }

      records.push(
        {
          id: "google-spf",
          type: "TXT",
          host: "@",
          value: `v=spf1 include:_spf.google.com${spfIncludeStr} ~all`,
          purpose: "SPF permission record authorizing Google Workspace mail servers.",
          critical: true,
        },
        {
          id: "google-dkim",
          type: "TXT",
          host: "google._domainkey",
          value:
            "v=DKIM1; k=rsa; p=(Generate this unique key inside Google Admin Console > Apps > Gmail > Authenticate email)",
          purpose:
            "DKIM signature TXT record from Google Admin Console. Essential for inbox delivery.",
          critical: true,
        },
        {
          id: "google-dmarc",
          type: "TXT",
          host: "_dmarc",
          value: `v=DMARC1; p=${dmarcPolicy}; rua=mailto:${dmarcEmail || `admin@${domain}`};`,
          purpose: "DMARC policy required by modern email filters.",
        },
      );

      return records;
    },
  },
  {
    id: "m365",
    name: "Microsoft 365 (Outlook)",
    tagline: "Outlook, Exchange Online, Word, Excel, and Microsoft Teams",
    badge: "Enterprise Standard",
    docUrl: "https://learn.microsoft.com/en-us/microsoft-365/admin/get-help-with-domains",
    pricing: {
      startingPrice: "$6.00 / user / mo",
      pricePerUserMonthly: 6.0,
      billingNote: "Billed annually ($6.00/mo) or monthly ($7.20/mo)",
      freeTierOrTrial: "30-day free trial",
      storage: "50 GB mailbox + 1 TB OneDrive storage",
      bestFor:
        "Businesses and corporate teams who rely on Microsoft Word, Excel, PowerPoint, and Microsoft Teams.",
      highlights: [
        "Familiar Microsoft Outlook web, mobile, and desktop apps",
        "50 GB dedicated mailbox storage per user",
        "1 TB OneDrive cloud storage per user",
        "Microsoft Teams for meetings and chat",
        "Web and mobile versions of Word, Excel, PowerPoint",
        "Free email aliases & shared inboxes",
      ],
      plans: [
        {
          name: "Exchange Online Plan 1",
          price: "$4.00/user/mo",
          storage: "50 GB / mailbox",
          note: "Email-only plan with 50GB mailbox and web Outlook.",
        },
        {
          name: "Microsoft 365 Business Basic",
          price: "$6.00/user/mo",
          storage: "50 GB mailbox + 1 TB cloud",
          note: "Email + Teams + Web Office apps (Word, Excel) + 1TB OneDrive.",
        },
        {
          name: "Microsoft 365 Business Standard",
          price: "$12.50/user/mo",
          storage: "50 GB mailbox + 1 TB cloud",
          note: "Adds downloadable desktop Word, Excel, and PowerPoint apps.",
        },
      ],
    },
    generateRecords: (domain, spfIncludes, dmarcPolicy, dmarcEmail) => {
      const cleanDomain = domain.replace(/[^a-zA-Z0-9]/g, "-");
      const spfIncludeStr =
        spfIncludes.length > 0 ? " " + spfIncludes.map((i) => `include:${i}`).join(" ") : "";
      return [
        {
          id: "m365-mx",
          type: "MX",
          host: "@",
          priority: 0,
          value: `${cleanDomain}.mail.protection.outlook.com`,
          purpose: "Microsoft 365 Exchange Online incoming mail router.",
          critical: true,
        },
        {
          id: "m365-autodiscover",
          type: "CNAME",
          host: "autodiscover",
          value: "autodiscover.outlook.com",
          purpose: "Autodiscover allows Outlook desktop & mobile apps to connect automatically.",
          critical: true,
        },
        {
          id: "m365-spf",
          type: "TXT",
          host: "@",
          value: `v=spf1 include:spf.protection.outlook.com${spfIncludeStr} ~all`,
          purpose: "SPF authorization for Microsoft 365 mail servers.",
          critical: true,
        },
        {
          id: "m365-dkim-1",
          type: "TXT",
          host: "selector1._domainkey",
          value:
            "v=DKIM1; k=rsa; p=(Enabled inside Microsoft 365 Defender / Exchange Admin Center > Email authentication > DKIM)",
          purpose: "Primary DKIM TXT record for Microsoft 365 outbound mail signing.",
        },
        {
          id: "m365-dkim-2",
          type: "TXT",
          host: "selector2._domainkey",
          value: "v=DKIM1; k=rsa; p=(Secondary DKIM public key for Microsoft 365 key rotation)",
          purpose: "Secondary backup DKIM TXT record for key rotation.",
        },
        {
          id: "m365-dmarc",
          type: "TXT",
          host: "_dmarc",
          value: `v=DMARC1; p=${dmarcPolicy}; rua=mailto:${dmarcEmail || `admin@${domain}`};`,
          purpose: "DMARC record to protect domain reputation and prevent spoofing.",
        },
      ];
    },
  },
  {
    id: "zoho",
    name: "Zoho Mail",
    tagline: "Feature-rich business mail with free tier options for single users",
    badge: "Free Tier Available",
    docUrl: "https://www.zoho.com/mail/help/adminconsole/domain-verification.html",
    pricing: {
      startingPrice: "Free (5 users) or $1.00 / mo",
      pricePerUserMonthly: 1.0,
      billingNote:
        "Free tier available; paid plans billed annually ($1.00/mo) or monthly ($1.25/mo)",
      freeTierOrTrial: "Forever-Free Plan for up to 5 users (Webmail only)",
      storage: "5 GB / user (Free) or 10 GB / user (Mail Lite)",
      bestFor:
        "Budget-conscious founders wanting a zero-cost start or low-cost $1/mo mailbox with IMAP/mobile app access.",
      highlights: [
        "Forever Free tier for up to 5 users on single domain",
        "Ultra-low $1.00/user/mo entry for paid plan",
        "Clean webmail interface with zero advertisements",
        "Task management, notes, and calendar included",
        "Free email aliases & email routing",
        "Comprehensive mobile apps for iOS and Android",
      ],
      plans: [
        {
          name: "Forever Free Plan",
          price: "$0 / mo (Up to 5 users)",
          storage: "5 GB / user",
          note: "Webmail and Zoho mobile app access only (no POP/IMAP for third-party apps).",
        },
        {
          name: "Mail Lite",
          price: "$1.00/user/mo",
          storage: "5 GB or 10 GB / user",
          note: "Includes IMAP/POP sync for Apple Mail / Outlook, email forwarding, and multiple domains.",
        },
        {
          name: "Mail Premium",
          price: "$4.00/user/mo",
          storage: "50 GB / user",
          note: "Huge 50GB storage, white labeling, backup & restoration, eDiscovery.",
        },
      ],
    },
    generateRecords: (domain, spfIncludes, dmarcPolicy, dmarcEmail) => {
      const spfIncludeStr =
        spfIncludes.length > 0 ? " " + spfIncludes.map((i) => `include:${i}`).join(" ") : "";
      return [
        {
          id: "zoho-mx-1",
          type: "MX",
          host: "@",
          priority: 10,
          value: "mx.zoho.com",
          purpose: "Primary Zoho incoming mail server.",
          critical: true,
        },
        {
          id: "zoho-mx-2",
          type: "MX",
          host: "@",
          priority: 20,
          value: "mx2.zoho.com",
          purpose: "Secondary Zoho incoming mail server.",
          critical: true,
        },
        {
          id: "zoho-mx-3",
          type: "MX",
          host: "@",
          priority: 50,
          value: "mx3.zoho.com",
          purpose: "Tertiary backup mail server.",
        },
        {
          id: "zoho-spf",
          type: "TXT",
          host: "@",
          value: `v=spf1 include:zoho.com${spfIncludeStr} ~all`,
          purpose: "SPF permission string authorizing Zoho mail servers.",
          critical: true,
        },
        {
          id: "zoho-dkim",
          type: "TXT",
          host: "zoho._domainkey",
          value:
            "v=DKIM1; k=rsa; p=(Copy value from Zoho Admin Control Panel > Email Configuration > DKIM)",
          purpose: "DKIM signature TXT record from your Zoho Control Panel.",
        },
        {
          id: "zoho-dmarc",
          type: "TXT",
          host: "_dmarc",
          value: `v=DMARC1; p=${dmarcPolicy}; rua=mailto:${dmarcEmail || `admin@${domain}`};`,
          purpose: "DMARC policy for anti-spoofing.",
        },
      ];
    },
  },
  {
    id: "fastmail",
    name: "Fastmail",
    tagline: "Independent, fast, privacy-respecting business email",
    badge: "Privacy Focused",
    docUrl: "https://www.fastmail.help/hc/en-001/articles/360058752834-Custom-domains",
    pricing: {
      startingPrice: "$3.00 – $5.00 / user / mo",
      pricePerUserMonthly: 5.0,
      billingNote: "Billed annually ($5.00/mo) or monthly ($6.00/mo)",
      freeTierOrTrial: "30-day free trial (no credit card required)",
      storage: "30 GB to 100 GB per user",
      bestFor:
        "Power users and privacy advocates who want lightning-fast webmail, zero ads, no tracking, and masked email support.",
      highlights: [
        "100% ad-free and privacy-respecting (no data harvesting)",
        "Ultra-fast search and responsive web interface",
        "Masked Email integration with 1Password",
        "Full calendar and contacts sync (CalDAV/CardDAV)",
        "Up to 600 email aliases per account",
        "Supports hundreds of custom domains",
      ],
      plans: [
        {
          name: "Individual / Basic",
          price: "$3.00/user/mo",
          storage: "2 GB / user",
          note: "Fastmail domain only (no custom domain support on basic).",
        },
        {
          name: "Standard",
          price: "$5.00/user/mo",
          storage: "30 GB / user",
          note: "Full custom domain support, 600 aliases, calendar, and 30GB storage.",
        },
        {
          name: "Professional",
          price: "$9.00/user/mo",
          storage: "100 GB / user",
          note: "100GB storage, email retention archive, priority phone support.",
        },
      ],
    },
    generateRecords: (domain, spfIncludes, dmarcPolicy, dmarcEmail) => {
      const spfIncludeStr =
        spfIncludes.length > 0 ? " " + spfIncludes.map((i) => `include:${i}`).join(" ") : "";
      return [
        {
          id: "fastmail-mx-1",
          type: "MX",
          host: "@",
          priority: 10,
          value: "in1-smtp.messagingengine.com",
          purpose: "Fastmail primary incoming mail router.",
          critical: true,
        },
        {
          id: "fastmail-mx-2",
          type: "MX",
          host: "@",
          priority: 20,
          value: "in2-smtp.messagingengine.com",
          purpose: "Fastmail backup incoming mail router.",
          critical: true,
        },
        {
          id: "fastmail-spf",
          type: "TXT",
          host: "@",
          value: `v=spf1 include:spf.messagingengine.com${spfIncludeStr} ~all`,
          purpose: "SPF authorization for Fastmail servers.",
          critical: true,
        },
        {
          id: "fastmail-dkim-1",
          type: "TXT",
          host: "fm1._domainkey",
          value:
            "v=DKIM1; k=rsa; p=(Copy public key 1 from Fastmail Settings > Custom Domains > DKIM)",
          purpose: "Fastmail DKIM TXT signing key 1.",
        },
        {
          id: "fastmail-dkim-2",
          type: "TXT",
          host: "fm2._domainkey",
          value:
            "v=DKIM1; k=rsa; p=(Copy public key 2 from Fastmail Settings > Custom Domains > DKIM)",
          purpose: "Fastmail DKIM TXT signing key 2.",
        },
        {
          id: "fastmail-dkim-3",
          type: "TXT",
          host: "fm3._domainkey",
          value:
            "v=DKIM1; k=rsa; p=(Copy public key 3 from Fastmail Settings > Custom Domains > DKIM)",
          purpose: "Fastmail DKIM TXT signing key 3.",
        },
        {
          id: "fastmail-dmarc",
          type: "TXT",
          host: "_dmarc",
          value: `v=DMARC1; p=${dmarcPolicy}; rua=mailto:${dmarcEmail || `admin@${domain}`};`,
          purpose: "DMARC policy for mailbox protection.",
        },
      ];
    },
  },
  {
    id: "icloud",
    name: "Apple iCloud+ Custom Domain",
    tagline: "Included with iCloud+ subscriptions for Apple Mail users",
    badge: "Cheapest for Apple Users",
    docUrl: "https://support.apple.com/en-us/102540",
    pricing: {
      startingPrice: "$0.99 / mo total (up to 5 family members)",
      pricePerUserMonthly: 0.99,
      billingNote: "Part of standard Apple iCloud+ monthly storage subscription",
      freeTierOrTrial: "Included if you already pay for Apple iCloud+",
      storage: "50 GB to 2 TB shared iCloud storage",
      bestFor:
        "Solo founders or families in the Apple ecosystem who already pay for 50GB+ iCloud storage.",
      highlights: [
        "Only $0.99/month flat (not per user) for the 50GB tier",
        "Supports up to 5 custom domains per iCloud account",
        "Up to 3 email addresses per domain per family member",
        "Seamless native integration with Apple Mail on iPhone, iPad, Mac",
        "Includes iCloud Private Relay & Hide My Email",
        "Shareable with up to 5 family members at no extra cost",
      ],
      plans: [
        {
          name: "iCloud+ 50 GB",
          price: "$0.99 / month total",
          storage: "50 GB shared",
          note: "Up to 5 custom domains + 3 email addresses per person + Private Relay.",
        },
        {
          name: "iCloud+ 200 GB",
          price: "$2.99 / month total",
          storage: "200 GB shared",
          note: "Family Sharing for up to 5 members + HomeKit Secure Video.",
        },
        {
          name: "iCloud+ 2 TB",
          price: "$9.99 / month total",
          storage: "2 TB shared",
          note: "Massive storage for high-res photo/video backups and custom domain mail.",
        },
      ],
    },
    generateRecords: (domain, spfIncludes, dmarcPolicy, dmarcEmail) => {
      const spfIncludeStr =
        spfIncludes.length > 0 ? " " + spfIncludes.map((i) => `include:${i}`).join(" ") : "";
      return [
        {
          id: "icloud-mx-1",
          type: "MX",
          host: "@",
          priority: 10,
          value: "mx01.mail.icloud.com",
          purpose: "Apple iCloud primary mail gateway.",
          critical: true,
        },
        {
          id: "icloud-mx-2",
          type: "MX",
          host: "@",
          priority: 10,
          value: "mx02.mail.icloud.com",
          purpose: "Apple iCloud backup mail gateway.",
          critical: true,
        },
        {
          id: "icloud-spf",
          type: "TXT",
          host: "@",
          value: `v=spf1 include:icloud.com${spfIncludeStr} ~all`,
          purpose: "SPF permission record for iCloud sending.",
          critical: true,
        },
        {
          id: "icloud-dkim",
          type: "TXT",
          host: "sig1._domainkey",
          value:
            "v=DKIM1; k=rsa; p=(Provided during Apple iCloud custom domain setup in iCloud.com Settings)",
          purpose: "Apple iCloud DKIM signing TXT record.",
        },
        {
          id: "icloud-dmarc",
          type: "TXT",
          host: "_dmarc",
          value: `v=DMARC1; p=${dmarcPolicy}; rua=mailto:${dmarcEmail || `admin@${domain}`};`,
          purpose: "DMARC record.",
        },
      ];
    },
  },
  {
    id: "cpanel",
    name: "cPanel / Host Webmail",
    tagline: "Built-in webmail hosted directly on your web hosting server",
    badge: "Included with Hosting ($0)",
    docUrl: "https://docs.cpanel.net/cpanel/email/email-accounts/",
    pricing: {
      startingPrice: "$0 additional (Included with hosting)",
      pricePerUserMonthly: 0,
      billingNote: "Covered by your web hosting bill (e.g. $3–$10/mo hosting plan)",
      freeTierOrTrial: "Unlimited mailboxes included with web hosting",
      storage: "Shared with your website disk space",
      bestFor:
        "Testing early stage ideas or prototypes where zero additional software budget exists.",
      highlights: [
        "Zero additional monthly email software cost",
        "Create unlimited mailboxes (e.g. support, info, sales)",
        "Includes Roundcube webmail interface",
        "Easy forwarders and autoresponders inside cPanel",
        "IMAP and POP3 support for desktop mail clients",
        "Note: Shares IP with other websites on your shared server",
      ],
      plans: [
        {
          name: "Standard Shared Hosting Mail",
          price: "$0 / mo (Included)",
          storage: "Shared disk quota",
          note: "Basic webmail access. Note that shared hosting IPs have higher spam risk.",
        },
      ],
    },
    generateRecords: (domain, spfIncludes, dmarcPolicy, dmarcEmail) => {
      const spfIncludeStr =
        spfIncludes.length > 0 ? " " + spfIncludes.map((i) => `include:${i}`).join(" ") : "";
      return [
        {
          id: "cpanel-mx",
          type: "MX",
          host: "@",
          priority: 0,
          value: `mail.${domain}`,
          purpose: "Points incoming mail directly to your host's mail server.",
          critical: true,
        },
        {
          id: "cpanel-a",
          type: "A",
          host: "mail",
          value: "YOUR_SERVER_IP_ADDRESS",
          purpose: "A record pointing mail subdomain to your web host IP.",
          critical: true,
        },
        {
          id: "cpanel-spf",
          type: "TXT",
          host: "@",
          value: `v=spf1 +a +mx +ip4:YOUR_SERVER_IP${spfIncludeStr} ~all`,
          purpose: "SPF record authorizing server IP and host MX.",
          critical: true,
        },
        {
          id: "cpanel-dkim",
          type: "TXT",
          host: "default._domainkey",
          value:
            "v=DKIM1; k=rsa; p=(Generated automatically in cPanel > Email Deliverability > DKIM)",
          purpose: "cPanel DKIM authentication TXT record.",
        },
        {
          id: "cpanel-dmarc",
          type: "TXT",
          host: "_dmarc",
          value: `v=DMARC1; p=${dmarcPolicy}; rua=mailto:${dmarcEmail || `admin@${domain}`};`,
          purpose: "DMARC record for server deliverability.",
        },
      ];
    },
  },
];

const COMMON_EXTRA_SENDERS = [
  { id: "shopify", label: "Shopify Store", include: "shops.shopify.com" },
  { id: "mailchimp", label: "Mailchimp Newsletters", include: "servers.mcsv.net" },
  { id: "klaviyo", label: "Klaviyo Marketing", include: "klaviyo.com" },
  { id: "brevo", label: "Brevo (Sendinblue)", include: "spf.sendinblue.com" },
  { id: "squarespace", label: "Squarespace Form Alerts", include: "_spf.squarespace.com" },
  { id: "postmark", label: "Postmark App Mail", include: "spf.mtasv.net" },
  { id: "sendgrid", label: "Twilio SendGrid", include: "sendgrid.net" },
];

const NAMING_GUIDES = [
  {
    prefix: "hello@",
    category: "General Enquiries",
    bestFor: "Solo founders, friendly modern brands, creative studios, local shops.",
    proTip: "Warm and inviting without feeling overly corporate. Highly recommended default.",
  },
  {
    prefix: "info@",
    category: "Standard Contact",
    bestFor: "Traditional service firms, medical, legal, manufacturing.",
    proTip: "Neutral and widely recognized, though slightly impersonal compared to hello@.",
  },
  {
    prefix: "first.last@",
    category: "Personal Direct",
    bestFor: "Consultants, therapists, executive coaches, real estate agents.",
    proTip: "Builds deep personal trust with high-touch clients who hire you directly.",
  },
  {
    prefix: "bookings@",
    category: "Appointments & Schedules",
    bestFor: "Salons, clinics, photographers, private dining, tour operators.",
    proTip: "Can be connected to automated calendar scheduling tools like Calendly/Acuity.",
  },
  {
    prefix: "orders@",
    category: "E-commerce & Shipping",
    bestFor: "Online stores, physical products, order confirmations, receipt dispatch.",
    proTip: "Keeps transaction receipts separate from customer service conversations.",
  },
  {
    prefix: "support@",
    category: "Customer Helpdesk",
    bestFor: "Software, customer service teams, multi-staff technical support.",
    proTip: "Easily routed to ticket management software (Zendesk, Freshdesk, Front).",
  },
  {
    prefix: "billing@",
    category: "Finance & Invoices",
    bestFor: "Accountants, bookkeeping, recurring subscription disputes, vendor payments.",
    proTip: "Keeps bank statements and receipts confidential from general team inboxes.",
  },
];

const DELIVERABILITY_CHECKLIST = [
  {
    id: "prop",
    label: "Wait 15–30 minutes for DNS records to propagate",
    detail:
      "Registrars usually update within 15 minutes, though full worldwide spread can take a few hours.",
  },
  {
    id: "inbound",
    label: "Send an inbound test from your personal email (e.g., @gmail.com)",
    detail: "Confirms your MX records are actively directing incoming mail to your new inbox.",
  },
  {
    id: "outbound",
    label: "Reply back from your new business email to your personal address",
    detail: "Confirms outgoing SMTP connection is authenticated and working.",
  },
  {
    id: "spamcheck",
    label: "Verify the reply landed directly in the primary Inbox (not Spam/Junk)",
    detail:
      "If it lands in spam, confirm your SPF and DMARC TXT records match the generated table exactly.",
  },
  {
    id: "headers",
    label: "Inspect email authentication headers ('Show original' in Gmail)",
    detail: "Look for 'SPF: PASS', 'DKIM: PASS', and 'DMARC: PASS' next to the message details.",
  },
];

const FAQ = [
  {
    q: "Can I just use email forwarding instead of a real mailbox?",
    a: "Email forwarding forwards incoming mail to your personal Gmail or Outlook for free. However, when you hit 'Reply', customers will see your personal @gmail.com address, which immediately destroys credibility and exposes your private email. A genuine mailbox is essential for professional correspondence.",
  },
  {
    q: "Why can't I have two separate SPF TXT records?",
    a: "RFC 7208 strictly forbids having more than one SPF record on a domain. If you publish two SPF TXT records, email receivers like Google, Microsoft, and Apple will treat it as a Permanent Error (PermError) and send your emails directly to the spam folder. Use our SPF Multi-Sender builder above to combine all your tools into one single record.",
  },
  {
    q: "What is DMARC and why do I need it now?",
    a: "In early 2024, Google and Yahoo introduced strict sender requirements. Domains sending email without a basic DMARC policy (even a passive monitoring policy p=none) face severe spam filtering and rejection rates. Adding the simple _dmarc TXT record ensures your domain stays compliant.",
  },
  {
    q: "Will adding email DNS records break my website?",
    a: "No, as long as you do NOT delete your website's A, CNAME, or ALIAS records. Website traffic is handled by A and CNAME records pointing to your web host (e.g., @ and www). Mail is handled exclusively by MX and mail-specific TXT records. They live together peacefully in the same DNS zone.",
  },
  {
    q: "What is the difference between an email alias and a separate mailbox?",
    a: "A mailbox is an independent account with its own login and storage (which usually costs $3–$6/month). An alias is an extra forwarding label (e.g. info@ and billing@) that delivers into your existing hello@ mailbox for free. For solo businesses, set up ONE mailbox and add multiple aliases to save money!",
  },
];

function BusinessEmail() {
  const { state, setBusiness, setOwnership } = useStore();
  const domain = state.business.ownedDomain || "yourbusiness.com";

  const [selectedProviderId, setSelectedProviderId] = useState<string>(
    state.ownership?.emailProvider
      ? PROVIDER_PRESETS.find((p) =>
          p.name.toLowerCase().includes(state.ownership.emailProvider.toLowerCase()),
        )?.id || "titan"
      : "titan",
  );
  const [googleMode, setGoogleMode] = useState<"single" | "five">("single");
  const [selectedExtraSenders, setSelectedExtraSenders] = useState<string[]>([]);
  const [customSenderInclude, setCustomSenderInclude] = useState<string>("");
  const [dmarcPolicy, setDmarcPolicy] = useState<"none" | "quarantine" | "reject">("none");
  const [dmarcEmail, setDmarcEmail] = useState<string>(
    state.business.businessEmail || `admin@${domain}`,
  );
  const [activeTab, setActiveTab] = useState<string>("generator");
  const [addedRecords, setAddedRecords] = useState<Record<string, boolean>>({});
  const [completedTests, setCompletedTests] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Pricing calculator state
  const [calcMailboxes, setCalcMailboxes] = useState<number>(1);
  const [calcCycle, setCalcCycle] = useState<"monthly" | "annual">("annual");

  // Address architect state
  const [selectedPrefix, setSelectedPrefix] = useState<string>("hello@");
  const [customPrefix, setCustomPrefix] = useState<string>("");

  const activeProvider = useMemo(() => {
    return PROVIDER_PRESETS.find((p) => p.id === selectedProviderId) || PROVIDER_PRESETS[0]!;
  }, [selectedProviderId]);

  const allExtraIncludes = useMemo(() => {
    const list: string[] = [];
    selectedExtraSenders.forEach((id) => {
      const found = COMMON_EXTRA_SENDERS.find((s) => s.id === id);
      if (found) list.push(found.include);
    });
    if (customSenderInclude.trim()) {
      list.push(customSenderInclude.trim());
    }
    return list;
  }, [selectedExtraSenders, customSenderInclude]);

  const generatedRecords: DnsRecord[] = useMemo(() => {
    return activeProvider.generateRecords(
      domain,
      allExtraIncludes,
      dmarcPolicy,
      dmarcEmail,
      googleMode,
    );
  }, [activeProvider, domain, allExtraIncludes, dmarcPolicy, dmarcEmail, googleMode]);

  const addedCount = useMemo(() => {
    return generatedRecords.filter((r) => addedRecords[r.id]).length;
  }, [generatedRecords, addedRecords]);

  const progressPercent = Math.round((addedCount / (generatedRecords.length || 1)) * 100);

  const copyToClipboard = async (text: string, key: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast.success(`Copied ${label} to clipboard!`);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      toast.error("Could not copy automatically. Please select the text and copy manually.");
    }
  };

  const copyAllRecords = async () => {
    const formatted = generatedRecords
      .map(
        (r) =>
          `Type: ${r.type}\nHost/Name: ${r.host}\n${r.priority !== undefined ? `Priority: ${r.priority}\n` : ""}Value: ${r.value}\nPurpose: ${r.purpose}\n`,
      )
      .join("\n---\n\n");
    await copyToClipboard(formatted, "all", "all DNS records");
  };

  const toggleRecordCheck = (id: string) => {
    setAddedRecords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleTestCheck = (id: string) => {
    setCompletedTests((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSaveToProfile = () => {
    setOwnership({ emailProvider: activeProvider.name });
    const fullEmail = customPrefix.trim()
      ? `${customPrefix.trim()}@${domain}`
      : `${selectedPrefix}${domain}`;
    setBusiness({
      businessEmail: fullEmail,
      businessEmailStatus: "configured",
    });
    toast.success(
      `Saved ${activeProvider.name} and ${fullEmail} to your business profile & ownership records!`,
    );
  };

  const chosenEmailPreview = customPrefix.trim()
    ? `${customPrefix.trim()}@${domain}`
    : `${selectedPrefix}${domain}`;

  return (
    <AppShell
      title="Business Email Setup & DNS Generator"
      description="Step-by-step guidance, deliverability safeguards, and exact DNS records for your domain."
    >
      <div className="space-y-8">
        {/* Top Overview & Credibility Card */}
        <section className="surface-panel overflow-hidden border border-border p-5 sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                  <Mail className="mr-1 size-3.5" /> Professional Communication
                </Badge>
                {state.business.ownedDomain ? (
                  <Badge variant="outline" className="font-mono text-xs">
                    {domain}
                  </Badge>
                ) : null}
              </div>
              <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Upgrade from free webmail to custom domain authority
              </h2>
              <p className="text-sm text-muted-foreground sm:text-base">
                An email address matching your domain (like{" "}
                <span className="font-semibold text-foreground">hello@{domain}</span>) is the single
                most cost-effective trust signal you can create. Follow our guided setup to avoid
                spam filters and keep your website safe.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
              <div className="rounded-xl border border-border bg-muted/40 p-4 text-left lg:text-right">
                <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Setup Progress
                </p>
                <div className="mt-1 flex items-baseline gap-2 lg:justify-end">
                  <span className="font-display text-2xl font-bold text-primary">
                    {addedCount} / {generatedRecords.length}
                  </span>
                  <span className="text-xs text-muted-foreground">records marked added</span>
                </div>
                <Progress value={progressPercent} className="mt-2 h-1.5 w-full lg:w-48" />
              </div>
            </div>
          </div>

          {/* Quick Credibility Comparison */}
          <div className="mt-6 grid gap-4 pt-6 border-t border-border sm:grid-cols-2">
            <div className="rounded-xl border border-destructive/30 bg-destructive-soft p-4">
              <div className="flex items-center justify-between">
                <Badge className="bg-destructive text-destructive-foreground">Amateur Signal</Badge>
                <span className="text-xs text-destructive font-medium">
                  Spam Risk & No Ownership
                </span>
              </div>
              <p className="mt-3 font-mono text-sm font-semibold break-all text-destructive-foreground/90">
                mybusiness.marketing12@gmail.com
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Hard to verify, easily impersonated by scammers, and cannot be handed over if your
                team grows.
              </p>
            </div>
            <div className="rounded-xl border border-success/30 bg-success-soft p-4">
              <div className="flex items-center justify-between">
                <Badge className="bg-success text-success-foreground">Established Business</Badge>
                <span className="text-xs text-success font-medium">100% Brand Ownership</span>
              </div>
              <p className="mt-3 font-mono text-sm font-semibold break-all text-success-foreground">
                hello@{domain}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Matches your website address, builds immediate buyer trust, and remains an asset of
                your business.
              </p>
            </div>
          </div>
        </section>

        {/* Safeguard Alert */}
        <Callout tone="warning" title="Crucial DNS Safety Rule: Do Not Delete Website Records">
          When adding your email records, <strong>only add</strong> the new MX, SPF, DKIM, and DMARC
          records shown below. <strong>Never delete or modify</strong> your existing A, CNAME, or
          ALIAS records for your main website or www address. Email and website records exist
          side-by-side in your domain's DNS manager.
        </Callout>

        {/* Main Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 p-1">
            <TabsTrigger value="generator" className="gap-1.5 text-xs">
              <Sparkles className="size-3.5" /> DNS Generator
            </TabsTrigger>
            <TabsTrigger value="live-dns" className="gap-1.5 text-xs">
              <Activity className="size-3.5" /> Live DNS Check
            </TabsTrigger>
            <TabsTrigger value="pricing" className="gap-1.5 text-xs">
              <DollarSign className="size-3.5" /> Pricing & Plans
            </TabsTrigger>
            <TabsTrigger value="architect" className="gap-1.5 text-xs">
              <Layers className="size-3.5" /> Address Architect
            </TabsTrigger>
            <TabsTrigger value="deliverability" className="gap-1.5 text-xs">
              <ShieldCheck className="size-3.5" /> Deliverability
            </TabsTrigger>
            <TabsTrigger value="migration" className="gap-1.5 text-xs">
              <HelpCircle className="size-3.5" /> Migration & FAQs
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: DNS RECORD GENERATOR */}
          <TabsContent value="generator" className="space-y-6">
            {/* Step 1: Select Email Host */}
            <div className="surface-panel space-y-5 p-5 sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold">1. Select your email provider</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose who hosts your mailboxes to generate exact, pre-validated DNS records.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("pricing")}
                    className="text-xs text-primary gap-1"
                  >
                    <DollarSign className="size-3.5" /> Compare Pricing & Plans
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveToProfile}
                    className="w-fit text-xs"
                  >
                    <UserCheck className="mr-1.5 size-3.5 text-primary" /> Save Provider to
                    Ownership
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {PROVIDER_PRESETS.map((p) => {
                  const isSelected = selectedProviderId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedProviderId(p.id)}
                      className={cn(
                        "relative flex flex-col justify-between rounded-xl border p-4 text-left transition-all",
                        isSelected
                          ? "border-primary bg-primary-soft/40 shadow-sm ring-2 ring-primary/20"
                          : "border-border bg-card hover:border-border hover:bg-muted/30",
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-display font-semibold text-foreground">
                            {p.name}
                          </span>
                          {p.badge ? (
                            <Badge
                              variant="secondary"
                              className="text-[10px] uppercase tracking-wider"
                            >
                              {p.badge}
                            </Badge>
                          ) : null}
                        </div>
                        <p className="mt-1.5 text-xs text-muted-foreground">{p.tagline}</p>

                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center rounded-md border border-primary/20 bg-primary-soft/50 px-2 py-0.5 text-[11px] font-semibold text-primary">
                            {p.pricing.startingPrice}
                          </span>
                          <span className="rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground">
                            {p.pricing.storage}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-2 text-xs">
                        <span
                          className={cn(
                            "font-medium",
                            isSelected ? "text-primary" : "text-muted-foreground",
                          )}
                        >
                          {isSelected ? "✓ Active Preset" : "Click to select"}
                        </span>
                        <a
                          href={p.docUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                        >
                          Setup Guide <ExternalLink className="size-3" />
                        </a>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Special options for Google Workspace */}
              {selectedProviderId === "google" && (
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <Label className="text-sm font-semibold">Google MX Record Style</Label>
                  <RadioGroup
                    value={googleMode}
                    onValueChange={(val: "single" | "five") => setGoogleMode(val)}
                    className="mt-2 grid gap-3 sm:grid-cols-2"
                  >
                    <div className="flex items-start space-x-3 rounded-lg border border-border bg-card p-3">
                      <RadioGroupItem value="single" id="g-single" className="mt-1" />
                      <div>
                        <Label htmlFor="g-single" className="font-semibold cursor-pointer">
                          Modern Single Record (Recommended)
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Priority 1 pointing to <code className="font-mono">SMTP.GOOGLE.COM</code>.
                          Simpler and faster to add.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 rounded-lg border border-border bg-card p-3">
                      <RadioGroupItem value="five" id="g-five" className="mt-1" />
                      <div>
                        <Label htmlFor="g-five" className="font-semibold cursor-pointer">
                          Legacy 5 Records (ASPMX)
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Use only if your registrar or Google setup wizard specifically asks for
                          the 5 ASPMX records.
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </div>

            {/* Step 2: SPF Multi-Sender Combiner (Solves the Fatal Double-SPF error) */}
            <div className="surface-panel space-y-5 p-5 sm:p-6">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg font-bold">2. SPF Multi-Sender Builder</h3>
                  <Badge
                    variant="outline"
                    className="border-amber-500/30 text-amber-600 bg-amber-50 dark:bg-amber-950/20 text-xs"
                  >
                    Prevents Critical RFC Error
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Do you also send marketing newsletters, receipts, or website contact alerts from
                  other platforms? Check them below to automatically merge them into one valid SPF
                  string.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {COMMON_EXTRA_SENDERS.map((sender) => {
                  const isChecked = selectedExtraSenders.includes(sender.id);
                  return (
                    <label
                      key={sender.id}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-colors",
                        isChecked
                          ? "border-primary bg-primary-soft/20 text-foreground"
                          : "border-border bg-card hover:bg-muted/40",
                      )}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedExtraSenders((prev) => [...prev, sender.id]);
                          } else {
                            setSelectedExtraSenders((prev) =>
                              prev.filter((id) => id !== sender.id),
                            );
                          }
                        }}
                        className="mt-0.5"
                      />
                      <div className="space-y-0.5">
                        <span className="text-sm font-medium leading-none">{sender.label}</span>
                        <p className="text-xs font-mono text-muted-foreground">
                          include:{sender.include}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Label
                  htmlFor="custom-include"
                  className="text-xs font-medium text-muted-foreground shrink-0"
                >
                  Custom SPF Include (optional):
                </Label>
                <Input
                  id="custom-include"
                  placeholder="e.g. mailgun.org or server hostname"
                  value={customSenderInclude}
                  onChange={(e) => setCustomSenderInclude(e.target.value)}
                  className="font-mono text-xs max-w-sm"
                />
              </div>
            </div>

            {/* Step 3: DMARC Policy Configurator */}
            <div className="surface-panel space-y-5 p-5 sm:p-6">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg font-bold">3. DMARC Security Policy</h3>
                  <Badge variant="outline" className="text-xs text-primary">
                    Gmail & Yahoo 2024+ Mandate
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  DMARC tells receiving mail servers what to do if someone attempts to forge emails
                  from your domain name.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div
                  onClick={() => setDmarcPolicy("none")}
                  className={cn(
                    "rounded-xl border p-4 cursor-pointer transition-colors",
                    dmarcPolicy === "none"
                      ? "border-primary bg-primary-soft/30 ring-2 ring-primary/20"
                      : "border-border bg-card hover:bg-muted/30",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">p=none</span>
                    <Badge className="bg-primary/10 text-primary text-[10px]">Recommended</Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    <strong>Monitoring Only:</strong> Reports unauthorized senders without dropping
                    any legitimate mail. Safest for new business setups.
                  </p>
                </div>

                <div
                  onClick={() => setDmarcPolicy("quarantine")}
                  className={cn(
                    "rounded-xl border p-4 cursor-pointer transition-colors",
                    dmarcPolicy === "quarantine"
                      ? "border-primary bg-primary-soft/30 ring-2 ring-primary/20"
                      : "border-border bg-card hover:bg-muted/30",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">p=quarantine</span>
                    <Badge variant="secondary" className="text-[10px]">
                      Moderate
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    <strong>Send to Spam:</strong> Unauthenticated emails claiming to be from your
                    domain are routed directly to the recipient's spam folder.
                  </p>
                </div>

                <div
                  onClick={() => setDmarcPolicy("reject")}
                  className={cn(
                    "rounded-xl border p-4 cursor-pointer transition-colors",
                    dmarcPolicy === "reject"
                      ? "border-primary bg-primary-soft/30 ring-2 ring-primary/20"
                      : "border-border bg-card hover:bg-muted/30",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">p=reject</span>
                    <Badge variant="destructive" className="text-[10px]">
                      Strict
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    <strong>Strict Block:</strong> Outright drops unverified mail. Only use once you
                    are 100% certain all company senders have DKIM configured.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Label
                  htmlFor="dmarc-email"
                  className="text-xs font-medium text-muted-foreground shrink-0"
                >
                  Aggregate Report Notification Email (rua):
                </Label>
                <Input
                  id="dmarc-email"
                  value={dmarcEmail}
                  onChange={(e) => setDmarcEmail(e.target.value)}
                  placeholder={`admin@${domain}`}
                  className="font-mono text-xs max-w-sm"
                />
              </div>
            </div>

            {/* Generated DNS Records Table */}
            <div className="surface-panel space-y-5 p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-display text-xl font-bold">
                    4. Generated DNS Records for {activeProvider.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Add these {generatedRecords.length} records into your domain's DNS manager (at{" "}
                    {state.business.registrarName || "your domain registrar"}).
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setActiveTab("live-dns")}
                    className="gap-1.5 bg-primary text-primary-foreground"
                  >
                    <Activity className="size-3.5" /> Check Live DNS Propagation
                  </Button>
                  <Button variant="outline" size="sm" onClick={copyAllRecords} className="gap-1.5">
                    <Copy className="size-3.5" /> Copy All Records as Text
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-12 text-center">Done</TableHead>
                      <TableHead className="w-20">Type</TableHead>
                      <TableHead className="w-32">Host / Name</TableHead>
                      <TableHead className="w-24">Priority</TableHead>
                      <TableHead className="min-w-[280px]">Value / Points To</TableHead>
                      <TableHead className="w-28 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {generatedRecords.map((r) => {
                      const isAdded = !!addedRecords[r.id];
                      return (
                        <TableRow
                          key={r.id}
                          className={cn("transition-colors", isAdded ? "bg-success-soft/20" : "")}
                        >
                          <TableCell className="text-center">
                            <Checkbox
                              checked={isAdded}
                              onCheckedChange={() => toggleRecordCheck(r.id)}
                              aria-label={`Mark record ${r.type} ${r.host} as added`}
                            />
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                "font-mono font-bold text-xs",
                                r.type === "MX"
                                  ? "border-blue-500/40 text-blue-600 bg-blue-50 dark:bg-blue-950/20"
                                  : r.type === "TXT"
                                    ? "border-purple-500/40 text-purple-600 bg-purple-50 dark:bg-purple-950/20"
                                    : "border-emerald-500/40 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20",
                              )}
                            >
                              {r.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm font-semibold">
                            <div className="flex items-center gap-1.5">
                              <span>{r.host}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  copyToClipboard(r.host, `host-${r.id}`, `Host "${r.host}"`)
                                }
                                className="text-muted-foreground hover:text-foreground"
                                title="Copy Host"
                              >
                                <Copy className="size-3" />
                              </button>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {r.priority !== undefined ? (
                              <span className="rounded bg-muted px-2 py-0.5 text-xs font-semibold">
                                {r.priority}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-mono text-xs font-medium break-all text-foreground">
                                {r.value}
                              </p>
                              <p className="text-xs text-muted-foreground">{r.purpose}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                copyToClipboard(r.value, `val-${r.id}`, `${r.type} record value`)
                              }
                              className="h-8 gap-1 text-xs"
                            >
                              {copiedKey === `val-${r.id}` ? (
                                <>
                                  <CheckCircle2 className="size-3 text-success" /> Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="size-3" /> Copy
                                </>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-col gap-4 rounded-xl bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm">
                  <span className="font-semibold text-foreground">Done adding these records?</span>{" "}
                  <span className="text-muted-foreground">
                    Next, test live propagation to confirm receiving mail servers can find you.
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => setActiveTab("live-dns")}
                    size="sm"
                    className="gap-2 bg-primary text-primary-foreground"
                  >
                    <Activity className="size-4" /> Check Live DNS Status
                  </Button>
                  <Button
                    onClick={() => setActiveTab("deliverability")}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    Deliverability Checklist <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB: LIVE DNS & EMAIL PROPAGATION CHECKER (DoH) */}
          <TabsContent value="live-dns" className="space-y-6">
            <LiveDnsChecker initialDomain={domain} expectedProviderId={activeProvider.id} />
          </TabsContent>

          {/* TAB 2: PRICING & COST COMPARISON */}
          <TabsContent value="pricing" className="space-y-8">
            {/* Header / Intro */}
            <div className="surface-panel space-y-4 p-5 sm:p-7">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/10 text-primary">
                      <DollarSign className="mr-1 size-3.5" /> Transparent Comparison
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      2025–2026 Live Market Rates
                    </Badge>
                  </div>
                  <h3 className="font-display text-2xl font-bold tracking-tight">
                    Business Email Pricing & Mailbox Cost Calculator
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Most providers charge on a <strong>per user / per mailbox / per month</strong>{" "}
                    model. Compare starter plans, storage allowances, and simulate your total
                    spending as your team grows.
                  </p>
                </div>
              </div>

              {/* Interactive Mailbox Cost Calculator */}
              <div className="mt-6 rounded-2xl border border-primary/20 bg-primary-soft/20 p-5 sm:p-6 space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Calculator className="size-5 text-primary" />
                      <h4 className="font-display font-bold text-base text-foreground">
                        Live Mailbox Cost Simulator
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Adjust team size and billing frequency to see real-time cost comparisons.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 bg-card rounded-lg border border-border p-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setCalcCycle("annual")}
                      className={cn(
                        "rounded-md px-3 py-1.5 font-medium transition-colors",
                        calcCycle === "annual"
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      Annual Billing (Save ~15-20%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalcCycle("monthly")}
                      className={cn(
                        "rounded-md px-3 py-1.5 font-medium transition-colors",
                        calcCycle === "monthly"
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      Monthly Billing
                    </button>
                  </div>
                </div>

                {/* Team Size Selector Buttons */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-foreground">
                    Number of Paid Mailboxes (Team Size):
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { count: 1, label: "1 User (Solo)" },
                      { count: 2, label: "2 Users" },
                      { count: 3, label: "3 Users" },
                      { count: 5, label: "5 Users" },
                      { count: 10, label: "10 Users" },
                      { count: 25, label: "25 Users" },
                    ].map((item) => (
                      <button
                        key={item.count}
                        type="button"
                        onClick={() => setCalcMailboxes(item.count)}
                        className={cn(
                          "rounded-lg border px-3 py-2 text-xs font-semibold transition-all",
                          calcMailboxes === item.count
                            ? "border-primary bg-primary text-primary-foreground shadow-xs"
                            : "border-border bg-card hover:border-border hover:bg-muted/40 text-foreground",
                        )}
                      >
                        {item.label}
                      </button>
                    ))}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground font-medium pl-2">
                        Custom:
                      </span>
                      <Input
                        type="number"
                        min={1}
                        max={500}
                        value={calcMailboxes}
                        onChange={(e) =>
                          setCalcMailboxes(Math.max(1, parseInt(e.target.value) || 1))
                        }
                        className="h-8 w-20 font-mono text-xs text-center"
                      />
                    </div>
                  </div>
                </div>

                {/* Calculated Results Grid */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 pt-2">
                  {PROVIDER_PRESETS.map((p) => {
                    let monthlyTotal = 0;
                    let annualTotal = 0;
                    let displayNote = "";

                    if (p.id === "icloud") {
                      // iCloud is $0.99/mo total for up to 5 family members, $2.99 for larger
                      monthlyTotal = calcMailboxes <= 5 ? 0.99 : 2.99;
                      annualTotal = monthlyTotal * 12;
                      displayNote =
                        calcMailboxes <= 5
                          ? "Flat $0.99/mo total for up to 5 users"
                          : "Flat $2.99/mo total (200GB plan)";
                    } else if (p.id === "cpanel") {
                      monthlyTotal = 0;
                      annualTotal = 0;
                      displayNote = "Included with web hosting plan ($0 additional)";
                    } else if (p.id === "zoho") {
                      if (calcMailboxes <= 5) {
                        monthlyTotal = 0;
                        annualTotal = 0;
                        displayNote = "Free tier covers up to 5 users ($0/mo)";
                      } else {
                        monthlyTotal = calcMailboxes * 1.0;
                        annualTotal = calcMailboxes * 1.0 * 12;
                        displayNote = `$1.00/user/mo on Mail Lite`;
                      }
                    } else {
                      const basePerUser = p.pricing.pricePerUserMonthly;
                      const multiplier = calcCycle === "annual" ? 1.0 : 1.2;
                      monthlyTotal = calcMailboxes * basePerUser * multiplier;
                      annualTotal = calcMailboxes * basePerUser * 12;
                      displayNote = `${p.pricing.startingPrice}`;
                    }

                    const isSelected = selectedProviderId === p.id;

                    return (
                      <div
                        key={p.id}
                        className={cn(
                          "flex flex-col justify-between rounded-xl border p-4 transition-all",
                          isSelected
                            ? "border-primary bg-card ring-2 ring-primary/30 shadow-sm"
                            : "border-border bg-card/80 hover:border-border",
                        )}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-display font-bold text-sm text-foreground">
                              {p.name}
                            </span>
                            {isSelected && (
                              <Badge className="bg-primary text-[10px] text-primary-foreground">
                                Active
                              </Badge>
                            )}
                          </div>
                          <p className="mt-1 text-[11px] text-muted-foreground line-clamp-1">
                            {displayNote}
                          </p>

                          <div className="mt-4 space-y-1">
                            <div className="flex items-baseline gap-1">
                              <span className="font-display text-2xl font-black text-foreground">
                                ${monthlyTotal.toFixed(monthlyTotal % 1 === 0 ? 0 : 2)}
                              </span>
                              <span className="text-xs text-muted-foreground">/ month total</span>
                            </div>
                            <p className="text-[11px] font-medium text-muted-foreground">
                              ${annualTotal.toFixed(0)} / year for {calcMailboxes}{" "}
                              {calcMailboxes === 1 ? "user" : "users"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-border/50">
                          <Button
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setSelectedProviderId(p.id);
                              setActiveTab("generator");
                              toast.success(`Selected ${p.name}! DNS records updated.`);
                            }}
                            className="w-full text-xs h-8"
                          >
                            {isSelected ? "Configure DNS Records" : "Select Preset"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* The Unlimited Aliases Money Saver Pro-Tip */}
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-start gap-3.5">
                  <Zap className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h5 className="font-display font-bold text-sm text-foreground">
                      Solo Founder Money-Saver: Pay for 1 Mailbox + Use Unlimited Free Aliases
                    </h5>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      If you are a solo entrepreneur or small partnership, you{" "}
                      <strong>do not need to purchase separate $6/month seats</strong> for{" "}
                      <code className="font-mono text-foreground font-semibold">hello@</code>,{" "}
                      <code className="font-mono text-foreground font-semibold">support@</code>,{" "}
                      <code className="font-mono text-foreground font-semibold">billing@</code>, and{" "}
                      <code className="font-mono text-foreground font-semibold">sales@</code>.
                      Almost every provider on this list lets you create unlimited free aliases that
                      all route to your 1 primary account, keeping your monthly cost at just{" "}
                      <strong>$1.50 to $6.00/month total</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Provider Deep-Dive Pricing Cards */}
            <div className="space-y-4">
              <div>
                <h3 className="font-display text-xl font-bold">Comprehensive Provider Breakdown</h3>
                <p className="text-sm text-muted-foreground">
                  In-depth pricing plans, mailbox storage quotas, included productivity apps, and
                  free trial terms.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {PROVIDER_PRESETS.map((p) => {
                  const isSelected = selectedProviderId === p.id;
                  return (
                    <div
                      key={p.id}
                      className={cn(
                        "flex flex-col justify-between rounded-2xl border bg-card p-5 sm:p-6 transition-all",
                        isSelected
                          ? "border-primary shadow-md ring-2 ring-primary/20"
                          : "border-border hover:border-border",
                      )}
                    >
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-display text-lg font-bold text-foreground">
                              {p.name}
                            </span>
                            {p.badge ? (
                              <Badge
                                variant="secondary"
                                className="text-[10px] uppercase tracking-wider"
                              >
                                {p.badge}
                              </Badge>
                            ) : null}
                          </div>
                          <p className="text-xs text-muted-foreground">{p.tagline}</p>
                        </div>

                        {/* Price Tag */}
                        <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 space-y-1">
                          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Starting Price
                          </span>
                          <p className="font-display text-xl font-bold text-foreground">
                            {p.pricing.startingPrice}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {p.pricing.billingNote}
                          </p>
                        </div>

                        {/* Quick Metrics */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="rounded-lg border border-border/60 bg-card p-2.5">
                            <span className="text-[10px] text-muted-foreground block font-medium">
                              Storage / Mailbox
                            </span>
                            <span className="font-semibold text-foreground text-xs mt-0.5 block">
                              {p.pricing.storage}
                            </span>
                          </div>
                          <div className="rounded-lg border border-border/60 bg-card p-2.5">
                            <span className="text-[10px] text-muted-foreground block font-medium">
                              Trial / Free Tier
                            </span>
                            <span className="font-semibold text-foreground text-xs mt-0.5 block">
                              {p.pricing.freeTierOrTrial}
                            </span>
                          </div>
                        </div>

                        {/* Best For */}
                        <div className="space-y-1">
                          <span className="text-[11px] font-semibold text-foreground">
                            Best suited for:
                          </span>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {p.pricing.bestFor}
                          </p>
                        </div>

                        {/* Plan Tiers */}
                        <div className="space-y-2 border-t border-border/60 pt-3">
                          <span className="text-[11px] font-semibold text-foreground">
                            Available Plan Tiers:
                          </span>
                          <div className="space-y-2">
                            {p.pricing.plans.map((plan, idx) => (
                              <div
                                key={idx}
                                className="rounded-lg border border-border/50 bg-muted/20 p-2.5 text-xs space-y-0.5"
                              >
                                <div className="flex items-center justify-between font-semibold">
                                  <span>{plan.name}</span>
                                  <span className="text-primary font-mono">{plan.price}</span>
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                  <span>{plan.storage}</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                                  {plan.note}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Key Feature Highlights */}
                        <div className="space-y-1.5 border-t border-border/60 pt-3">
                          <span className="text-[11px] font-semibold text-foreground">
                            Included Highlights:
                          </span>
                          <ul className="space-y-1 text-xs text-muted-foreground">
                            {p.pricing.highlights.map((h, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <Check className="size-3.5 text-success shrink-0 mt-0.5" />
                                <span className="leading-tight">{h}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-5 pt-4 border-t border-border space-y-2">
                        <Button
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setSelectedProviderId(p.id);
                            setActiveTab("generator");
                            toast.success(`Active preset changed to ${p.name}!`);
                          }}
                          className="w-full text-xs h-9 gap-1.5"
                        >
                          <Sparkles className="size-3.5" />{" "}
                          {isSelected ? "Active Preset (View DNS)" : "Select This Provider"}
                        </Button>
                        <a
                          href={p.docUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground hover:text-foreground py-1"
                        >
                          Official Setup & Docs <ExternalLink className="size-3" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Side-by-Side Comparison Table */}
            <div className="surface-panel space-y-4 p-5 sm:p-6">
              <div>
                <h3 className="font-display text-lg font-bold">
                  Side-by-Side Feature & Cost Matrix
                </h3>
                <p className="text-sm text-muted-foreground">
                  Quickly compare email limits, storage, app support, and entry costs.
                </p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-40 font-bold">Provider</TableHead>
                      <TableHead className="w-32 font-bold">Starting Price</TableHead>
                      <TableHead className="w-32 font-bold">Trial / Free</TableHead>
                      <TableHead className="w-32 font-bold">Mailbox Storage</TableHead>
                      <TableHead className="w-28 font-bold">Mobile Apps</TableHead>
                      <TableHead className="w-28 font-bold">Free Aliases</TableHead>
                      <TableHead className="min-w-[200px] font-bold">
                        Office / Cloud Suite
                      </TableHead>
                      <TableHead className="w-28 text-right font-bold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {PROVIDER_PRESETS.map((p) => {
                      const isSelected = selectedProviderId === p.id;
                      return (
                        <TableRow
                          key={p.id}
                          className={cn(isSelected ? "bg-primary-soft/20 font-medium" : "")}
                        >
                          <TableCell className="font-display font-semibold text-foreground">
                            <div className="flex items-center gap-2">
                              <span>{p.name}</span>
                              {isSelected && (
                                <Badge className="bg-primary text-[9px] text-primary-foreground">
                                  Active
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs font-semibold text-primary">
                            {p.pricing.startingPrice}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {p.pricing.freeTierOrTrial}
                          </TableCell>
                          <TableCell className="text-xs text-foreground font-medium">
                            {p.pricing.storage}
                          </TableCell>
                          <TableCell className="text-xs">
                            <Badge variant="outline" className="text-[10px] text-success">
                              ✓ iOS & Android
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            <Badge variant="outline" className="text-[10px] text-success">
                              ✓ Unlimited
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {p.id === "google"
                              ? "Google Drive, Docs, Sheets, Meet"
                              : p.id === "m365"
                                ? "Word, Excel, Teams, 1TB OneDrive"
                                : p.id === "icloud"
                                  ? "iCloud Drive, Apple Notes, Photos"
                                  : "Standalone Calendar & Contacts"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant={isSelected ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                setSelectedProviderId(p.id);
                                setActiveTab("generator");
                              }}
                              className="h-7 text-xs px-2.5"
                            >
                              {isSelected ? "View DNS" : "Select"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: ADDRESS ARCHITECT */}
          <TabsContent value="architect" className="space-y-6">
            <div className="surface-panel space-y-6 p-5 sm:p-6">
              <div>
                <h3 className="font-display text-xl font-bold">Mailbox Address Architect</h3>
                <p className="text-sm text-muted-foreground">
                  Pick the most effective mailbox name for your business model, or create aliases to
                  save on monthly subscription costs.
                </p>
              </div>

              {/* Interactive Preview Header Card */}
              <div className="rounded-xl border border-primary/30 bg-primary-soft/30 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                      Selected Primary Address
                    </span>
                    <p className="font-mono text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                      {chosenEmailPreview}
                    </p>
                  </div>
                  <Button onClick={handleSaveToProfile} size="sm" className="gap-2">
                    <UserCheck className="size-4" /> Save as Business Email
                  </Button>
                </div>
              </div>

              {/* Custom Prefix Field */}
              <div className="space-y-2 max-w-md">
                <Label htmlFor="custom-pfx" className="text-sm font-semibold">
                  Or enter a custom address name:
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="custom-pfx"
                    placeholder="e.g. contact, sales, dr.smith"
                    value={customPrefix}
                    onChange={(e) =>
                      setCustomPrefix(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""))
                    }
                    className="font-mono text-sm"
                  />
                  <span className="font-mono text-sm font-semibold text-muted-foreground">
                    @{domain}
                  </span>
                </div>
              </div>

              {/* Role Guides Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {NAMING_GUIDES.map((item) => {
                  const isSelected = selectedPrefix === item.prefix && !customPrefix;
                  return (
                    <div
                      key={item.prefix}
                      onClick={() => {
                        setSelectedPrefix(item.prefix);
                        setCustomPrefix("");
                      }}
                      className={cn(
                        "flex flex-col justify-between rounded-xl border p-4 cursor-pointer transition-all",
                        isSelected
                          ? "border-primary bg-primary-soft/30 ring-2 ring-primary/20"
                          : "border-border bg-card hover:bg-muted/30",
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-base font-bold text-foreground">
                            {item.prefix}
                            {domain}
                          </span>
                          <Badge variant="outline" className="text-[10px]">
                            {item.category}
                          </Badge>
                        </div>
                        <p className="mt-2 text-xs font-medium text-foreground">
                          Best for: {item.bestFor}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                          {item.proTip}
                        </p>
                      </div>

                      <div className="mt-3 border-t border-border/50 pt-2 text-xs font-medium text-primary">
                        {isSelected ? "✓ Active Selection" : "Click to choose"}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Alias Money-Saving Tip */}
              <div className="rounded-xl border border-border bg-muted/40 p-5">
                <div className="flex items-start gap-3">
                  <Info className="size-5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-display font-semibold text-sm">
                      Pro-Tip: Save money by using Email Aliases
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      If you are a solo business owner, you{" "}
                      <strong>do not need to pay for 4 separate mailboxes</strong> to have{" "}
                      <code className="font-mono">hello@</code>,{" "}
                      <code className="font-mono">billing@</code>,{" "}
                      <code className="font-mono">support@</code>, and your personal name. Most
                      providers (Titan, Google, Microsoft, Zoho) let you create{" "}
                      <strong>unlimited free email aliases</strong> that forward directly into your
                      single main inbox.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: DELIVERABILITY & TEST */}
          <TabsContent value="deliverability" className="space-y-6">
            <div className="surface-panel space-y-6 p-5 sm:p-6">
              <div>
                <h3 className="font-display text-xl font-bold">
                  Pre-Flight Deliverability Checklist
                </h3>
                <p className="text-sm text-muted-foreground">
                  Before announcing your new business email to customers or partners, run these five
                  essential validation tests.
                </p>
              </div>

              <div className="space-y-3">
                {DELIVERABILITY_CHECKLIST.map((step, idx) => {
                  const isChecked = !!completedTests[step.id];
                  return (
                    <div
                      key={step.id}
                      onClick={() => toggleTestCheck(step.id)}
                      className={cn(
                        "flex items-start gap-4 rounded-xl border p-4 cursor-pointer transition-colors",
                        isChecked
                          ? "border-success/40 bg-success-soft/20"
                          : "border-border bg-card hover:bg-muted/30",
                      )}
                    >
                      <div className="mt-0.5">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => toggleTestCheck(step.id)}
                          aria-label={step.label}
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground">
                            Step {idx + 1}: {step.label}
                          </span>
                          {isChecked && (
                            <Badge className="bg-success text-success-foreground text-[10px]">
                              Passed
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {step.detail}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Spam Troubleshooting Deep Dive */}
              <div className="rounded-xl border border-destructive/20 bg-destructive-soft/30 p-5 space-y-3">
                <div className="flex items-center gap-2 text-destructive font-semibold text-sm">
                  <AlertTriangle className="size-4" /> Did your test email land in the Spam folder?
                </div>
                <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1.5 leading-relaxed">
                  <li>
                    <strong>Check SPF record:</strong> Confirm your domain does not have two SPF
                    records. Merge them into one.
                  </li>
                  <li>
                    <strong>Check DKIM key:</strong> If using Google Workspace or Zoho, make sure
                    you clicked "Start Authentication" inside their admin console after adding the
                    TXT record.
                  </li>
                  <li>
                    <strong>New domain reputation:</strong> Brand-new domains have neutral
                    reputation. Avoid sending blast marketing emails for the first 14 days. Send
                    5–10 genuine conversational emails first.
                  </li>
                  <li>
                    <strong>Warmup tool:</strong> Use free tools like{" "}
                    <a
                      href="https://www.mail-tester.com"
                      target="_blank"
                      rel="noreferrer"
                      className="underline font-medium text-foreground"
                    >
                      mail-tester.com
                    </a>{" "}
                    to get an instant 10/10 spam score breakdown.
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>

          {/* TAB 4: MIGRATION & FAQS */}
          <TabsContent value="migration" className="space-y-6">
            <div className="surface-panel space-y-6 p-5 sm:p-6">
              <div>
                <h3 className="font-display text-xl font-bold">
                  Moving from a Personal @gmail.com to Business Email
                </h3>
                <p className="text-sm text-muted-foreground">
                  How to switch seamlessly without losing past customer messages or existing
                  threads.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary-soft text-primary font-bold text-xs">
                      1
                    </span>
                    <h4 className="font-semibold text-sm">Set Auto-Forwarding</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    In your old personal email settings, configure automatic forwarding to your new{" "}
                    <code className="font-mono text-[11px]">{chosenEmailPreview}</code> address so
                    zero messages are missed.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary-soft text-primary font-bold text-xs">
                      2
                    </span>
                    <h4 className="font-semibold text-sm">Set Auto-Responder</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Add an auto-reply on the old account:{" "}
                    <em>
                      "We've upgraded our business address! Please update your records to{" "}
                      {chosenEmailPreview}."
                    </em>
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary-soft text-primary font-bold text-xs">
                      3
                    </span>
                    <h4 className="font-semibold text-sm">Update Directory Profiles</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Update Google Business Profile, Instagram bio, Facebook page, Yelp, and invoices
                    with your new email on the same launch day.
                  </p>
                </div>
              </div>
            </div>

            {/* Accordion FAQs */}
            <div className="surface-panel space-y-4 p-5 sm:p-6">
              <h3 className="font-display text-xl font-bold">Frequently Asked Questions</h3>
              <Accordion type="single" collapsible className="w-full">
                {FAQ.map((f, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left font-semibold text-sm">
                      {f.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {f.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
