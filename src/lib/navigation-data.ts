import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ListChecks,
  Building2,
  Globe,
  Blocks,
  FileText,
  Mail,
  Network,
  Rocket,
  ClipboardCheck,
  ShieldCheck,
  ShieldAlert,
  Search,
  Star,
  Calculator,
  Wrench,
  TrendingUp,
  BookOpen,
  LifeBuoy,
  UserRound,
  Settings,
} from "lucide-react";
import type { AppState } from "./types";
import { getReadiness } from "./readiness";
import { getOnlinePresenceStatus, getTopPresenceAction } from "./online-presence";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  description?: string;
}

export interface NavGroup {
  id: string;
  title: string;
  description: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "plan",
    title: "My plan",
    description: "Launch overview, checklist & profile",
    items: [
      {
        to: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        description: "Overview, milestones & next step",
      },
      {
        to: "/checklist",
        label: "Checklist",
        icon: ListChecks,
        description: "Phase-by-phase action items",
      },
      {
        to: "/business-profile",
        label: "Business profile",
        icon: Building2,
        description: "Core info, services & audience",
      },
    ],
  },
  {
    id: "build",
    title: "Build my website",
    description: "Domain, site builder & mail",
    items: [
      {
        to: "/domains",
        label: "Domain",
        icon: Globe,
        description: "Find, check and secure your web address",
      },
      {
        to: "/platform-matcher",
        label: "Website & hosting",
        icon: Blocks,
        description: "Match the right website platform",
      },
      {
        to: "/content",
        label: "Content",
        icon: FileText,
        description: "Draft 13 pages (Home, About, Services, Products, Booking, Menu, Portfolio, ...)",
      },
      {
        to: "/business-email",
        label: "Business email",
        icon: Mail,
        description: "Professional address (hello@domain)",
      },
      {
        to: "/connect-domain",
        label: "Connect domain",
        icon: Network,
        description: "Point your domain DNS safely",
      },
    ],
  },
  {
    id: "launch",
    title: "Launch safely",
    description: "Testing, verification & ownership",
    items: [
      {
        to: "/launch-wizard",
        label: "Launch wizard",
        icon: Rocket,
        description: "6-step guided launch sequence",
      },
      {
        to: "/customer-journey",
        label: "Customer journey",
        icon: ClipboardCheck,
        description: "Test key customer actions on mobile",
      },
      {
        to: "/preflight",
        label: "Check before launch",
        icon: ShieldCheck,
        description: "Test forms, mobile dialers, and error pages",
      },
      {
        to: "/ownership-record",
        label: "Ownership record",
        icon: ShieldCheck,
        description: "Record domain registrar, DNS & host custody",
      },
      {
        to: "/security-drill",
        label: "Protect your website access",
        icon: ShieldAlert,
        description: "2FA checklist & disaster recovery triage",
      },
      {
        to: "/launch-dossier",
        label: "Share your launch plan",
        icon: FileText,
        description: "Printable launch deed & agency handover",
      },
    ],
  },
  {
    id: "grow",
    title: "Grow my business",
    description: "Local search, reviews & maintenance",
    items: [
      {
        to: "/get-found",
        label: "Get found",
        icon: Search,
        description: "Local SEO, Google Business profile & maps",
      },
      {
        to: "/review-kit",
        label: "Reviews",
        icon: Star,
        description: "Generate QR codes for Google reviews",
      },
      {
        to: "/email-signature",
        label: "Email signature",
        icon: Mail,
        description: "Professional branded email signature",
      },
      {
        to: "/cost-calculator",
        label: "Cost calculator",
        icon: Calculator,
        description: "Estimate true 3-year running costs",
      },
      {
        to: "/maintenance",
        label: "Maintenance",
        icon: Wrench,
        description: "Routine health checks & renewal alerts",
      },
    ],
  },
  {
    id: "learn",
    title: "Learn & settings",
    description: "Guides, help & local storage",
    items: [
      {
        to: "/learn",
        label: "Learning library",
        icon: BookOpen,
        description: "Plain-English guides on domains & web",
      },
      {
        to: "/help",
        label: "Help",
        icon: LifeBuoy,
        description: "Troubleshooting FAQs & guidance",
      },
      {
        to: "/account",
        label: "My plan",
        icon: UserRound,
        description: "Plan summary & export options",
      },
      {
        to: "/settings",
        label: "Settings",
        icon: Settings,
        description: "Backups, reset & local data controls",
      },
    ],
  },
];

export interface BreadcrumbInfo {
  group: string;
  groupRoute?: string;
  label: string;
}

export const ROUTE_HIERARCHY: Record<string, BreadcrumbInfo> = {
  "/dashboard": { group: "My plan", groupRoute: "/dashboard", label: "Dashboard" },
  "/checklist": { group: "My plan", groupRoute: "/checklist", label: "Checklist" },
  "/business-profile": {
    group: "My plan",
    groupRoute: "/business-profile",
    label: "Business profile",
  },
  "/account": { group: "My plan", groupRoute: "/account", label: "My plan" },

  "/domains": { group: "Build my website", groupRoute: "/domains", label: "Domain" },
  "/platform-matcher": {
    group: "Build my website",
    groupRoute: "/platform-matcher",
    label: "Website & hosting",
  },
  "/content": { group: "Build my website", groupRoute: "/content", label: "Content" },
  "/business-email": {
    group: "Build my website",
    groupRoute: "/business-email",
    label: "Business email",
  },
  "/connect-domain": {
    group: "Build my website",
    groupRoute: "/connect-domain",
    label: "Connect domain",
  },

  "/launch-wizard": {
    group: "Launch safely",
    groupRoute: "/launch-wizard",
    label: "Launch wizard",
  },
  "/customer-journey": {
    group: "Launch safely",
    groupRoute: "/customer-journey",
    label: "Customer journey",
  },
  "/preflight": { group: "Launch safely", groupRoute: "/preflight", label: "Check before launch" },
  "/ownership-record": {
    group: "Launch safely",
    groupRoute: "/ownership-record",
    label: "Ownership record",
  },
  "/security-drill": {
    group: "Launch safely",
    groupRoute: "/security-drill",
    label: "Protect your website access",
  },
  "/launch-dossier": {
    group: "Launch safely",
    groupRoute: "/launch-dossier",
    label: "Share your launch plan",
  },

  "/get-found": { group: "Grow my business", groupRoute: "/get-found", label: "Get found" },
  "/review-kit": { group: "Grow my business", groupRoute: "/review-kit", label: "Reviews" },
  "/email-signature": {
    group: "Grow my business",
    groupRoute: "/email-signature",
    label: "Email signature",
  },
  "/cost-calculator": {
    group: "Grow my business",
    groupRoute: "/cost-calculator",
    label: "Cost calculator",
  },
  "/maintenance": { group: "Grow my business", groupRoute: "/maintenance", label: "Maintenance" },

  "/learn": { group: "Learn & settings", groupRoute: "/learn", label: "Learning library" },
  "/help": { group: "Learn & settings", groupRoute: "/help", label: "Help" },
  "/settings": { group: "Learn & settings", groupRoute: "/settings", label: "Settings" },
  "/glossary": { group: "Learn & settings", groupRoute: "/glossary", label: "Glossary" },
  "/troubleshooting": {
    group: "Learn & settings",
    groupRoute: "/troubleshooting",
    label: "Troubleshooting",
  },
  "/hire-help": { group: "Learn & settings", groupRoute: "/hire-help", label: "Hire help" },
};

export interface NextStep {
  name: string;
  route: string;
  reason?: string;
}

export function getNextBestStep(state: AppState): NextStep {
  if (!state.onboardingComplete) {
    return {
      name: "Set up business basics",
      route: "/onboarding",
      reason: "Start by answering a few quick questions to build your plan.",
    };
  }

  const b = state.business;
  if (!b.businessName || b.businessName.trim() === "") {
    return {
      name: "Complete business profile",
      route: "/business-profile",
      reason: "Add your business name, core services, and contact info.",
    };
  }

  // Check presence status and blockers
  const areas = getOnlinePresenceStatus(state);
  const readiness = getReadiness(
    state.tasks,
    state.business,
    state.ownership,
    state.customerJourneyTest,
  );
  const topAction = getTopPresenceAction(areas, readiness);

  if (topAction) {
    const id = topAction.id;
    if (id === "domain" || id === "domain-ownership") {
      return {
        name: "Find & secure your domain",
        route: "/domains",
        reason: "Your web address is your digital front door.",
      };
    }
    if (id === "website" || id === "platform-matcher") {
      return {
        name: "Pick your website builder",
        route: "/platform-matcher",
        reason: "Choose the platform that matches your business model.",
      };
    }
    if (id === "dns" || id === "website-connection") {
      return {
        name: "Connect domain to website",
        route: "/connect-domain",
        reason: "Configure DNS records so visitors reach your new site.",
      };
    }
    if (id === "email" || id === "protect-email") {
      return {
        name: "Configure business email",
        route: "/business-email",
        reason: "Set up professional mail and keep mail records protected.",
      };
    }
    if (
      id === "customer_action" ||
      id === "primary-action-test" ||
      id === "customer-journey-blocked" ||
      id === "customer-journey-needs-improvement"
    ) {
      return {
        name: "Test customer journey",
        route: "/customer-journey",
        reason: "Make sure customers can actually submit an inquiry or book.",
      };
    }
    if (id === "ownership") {
      return {
        name: "Protect your website access",
        route: "/ownership-record",
        reason: "Confirm your master accounts and ownership logins.",
      };
    }
    if (id === "local_presence" || id === "business-details") {
      return {
        name: "Set up local presence",
        route: "/get-found",
        reason: "Help nearby customers discover you on search and maps.",
      };
    }
  }

  // Fallback to first incomplete task
  const incomplete = state.tasks.find((t) => t.status !== "complete");
  if (incomplete) {
    let route = "/checklist";
    if (incomplete.phase === "plan") route = "/business-profile";
    else if (incomplete.phase === "domain") route = "/domains";
    else if (incomplete.phase === "platform") route = "/platform-matcher";
    else if (incomplete.phase === "content") route = "/content";
    else if (incomplete.phase === "email") route = "/business-email";
    else if (incomplete.phase === "dns") route = "/connect-domain";
    else if (incomplete.phase === "review") route = "/preflight";
    else if (incomplete.phase === "growth") route = "/get-found";

    return {
      name: incomplete.title,
      route,
      reason: incomplete.description,
    };
  }

  return {
    name: "Check before launch",
    route: "/preflight",
    reason: "Run a final simulated check on forms, dialers, and links.",
  };
}
