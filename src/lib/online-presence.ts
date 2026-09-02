import type {
  AppState,
  BusinessProfile,
  DnsImpactPreview,
  DnsPlanningState,
  LaunchBlocker,
  LaunchReadiness,
  PresenceAreaId,
  PresenceAreaStatus,
  PresenceStatusArea,
} from "./types";
import { getReadiness } from "./readiness";
import { inferDefaultJourney, JOURNEY_DEFINITIONS } from "./customer-journey";

const STATUS_LABEL: Record<PresenceAreaStatus, string> = {
  not_started: "Not started",
  needs_information: "Needs information",
  planned: "Planned",
  in_progress: "In progress",
  needs_attention: "Needs attention",
  ready_for_review: "Ready for review",
  complete: "Complete",
};

function hasTaskComplete(tasks: AppState["tasks"], needles: string[]): boolean {
  const lower = needles.map((n) => n.toLowerCase());
  return tasks.some(
    (t) => lower.some((n) => t.title.toLowerCase().includes(n)) && t.status === "complete",
  );
}

function isTaskOutstanding(tasks: AppState["tasks"], needles: string[]): boolean {
  const lower = needles.map((n) => n.toLowerCase());
  const found = tasks.find((t) => lower.some((n) => t.title.toLowerCase().includes(n)));
  if (!found) return true;
  return found.status !== "complete";
}

function normaliseConfidence(v: string | undefined): string {
  return (v ?? "").trim().toLowerCase();
}

// ---- Customer Action helper ----

export function getCustomerActionStatus(state: AppState): PresenceStatusArea {
  const business = state.business;
  const journeyType = inferDefaultJourney(business);
  const label = JOURNEY_DEFINITIONS[journeyType]?.label ?? journeyType;
  const test = state.customerJourneyTest;
  const tasks = state.tasks;

  let status: PresenceAreaStatus;
  let summary: string;
  let blockers: string[] | undefined;

  if (!test || !test.steps || test.steps.length === 0) {
    // No test recorded — check if task exists
    const outstanding = isTaskOutstanding(tasks, ["test your contact form"]);
    if (outstanding && !business.primaryCustomerAction) {
      status = "needs_information";
      summary = `Choose your primary customer action — suggested "${label}" — then test it end to end.`;
    } else if (outstanding) {
      status = "not_started";
      summary = `Test "${label}" on a real phone and record each step outcome.`;
    } else {
      status = "planned";
      summary = `Primary action "${label}" planned — record your test results.`;
    }
  } else {
    const steps = test.steps;
    const blocked = steps.filter((s) => s.status === "blocked");
    const needs = steps.filter((s) => s.status === "needs_improvement");
    const notTested = steps.filter((s) => s.status === "not_tested");
    const allPassed = steps.length > 0 && steps.every((s) => s.status === "passed");

    if (blocked.length > 0) {
      status = "needs_attention";
      summary = `Blocked: ${blocked.map((s) => s.label).join(", ")} — fix before launch.`;
      blockers = blocked.map((s) => s.label);
    } else if (needs.length > 0) {
      status = "needs_attention";
      summary = `Needs improvement: ${needs.map((s) => s.label).join(", ")}.`;
      blockers = needs.map((s) => s.label);
    } else if (allPassed) {
      status = "complete";
      summary = `All ${steps.length} steps passed for "${label}".`;
    } else if (notTested.length > 0) {
      status = "in_progress";
      summary = `${steps.length - notTested.length}/${steps.length} steps recorded for "${label}".`;
      blockers = notTested.map((s) => s.label);
    } else {
      status = "ready_for_review";
      summary = `Customer journey "${label}" recorded — review for final checks.`;
    }
  }

  return {
    id: "customer_action",
    label: "Customer action",
    description: "The one action you want customers to take, tested end to end on a real phone.",
    status,
    statusLabel: STATUS_LABEL[status],
    summary,
    relatedRoute: "/customer-journey",
    actionLabel: status === "complete" ? "Review journey" : "Test your key action",
    priority: 5,
    blockers,
    lastVerifiedAt: test?.lastUpdatedAt,
  };
}

// ---- DNS Impact Preview ----

export function getDnsImpactPreview(state: AppState): DnsImpactPreview {
  const business = state.business;
  const planning = state.dnsPlanning;

  // Derive usesBusinessEmail
  const usesEmailRaw =
    planning?.usesBusinessEmail ??
    ((): DnsPlanningState["usesBusinessEmail"] => {
      const b = normaliseConfidence(business.usesBusinessEmail ?? business.needsBusinessEmail);
      if (b === "yes") return "yes";
      if (b === "no") return "no";
      // also check businessEmail presence
      if (business.businessEmail?.trim()) return "yes";
      if (b === "unsure" || b === "not_sure") return "not_sure";
      return "not_sure";
    })();

  const changeType: DnsPlanningState["websiteChangeType"] =
    planning?.websiteChangeType ??
    ((): DnsPlanningState["websiteChangeType"] => {
      const b = normaliseConfidence(
        business.websiteChangePlanned ?? business.existingWebsitePresent,
      );
      if (b === "yes") return "replacing";
      if (b === "no") return "first";
      // fallback to existingWebsiteStatus
      const ew = (business.existingWebsiteStatus ?? "").toLowerCase();
      if (ew.includes("have a website") || ew.includes("improving") || ew.includes("already"))
        return "replacing";
      if (ew.includes("nothing yet") || ew.includes("no domain")) return "first";
      return "unsure";
    })();

  const screenshot: DnsPlanningState["screenshotSaved"] =
    planning?.screenshotSaved ??
    ((): DnsPlanningState["screenshotSaved"] => {
      const v = normaliseConfidence(business.dnsScreenshotSaved);
      if (v === "yes") return "yes";
      if (v === "no" || v === "not_yet") return "not_yet";
      if (v === "unsure") return "unsure";
      // also check task screenshot complete
      if (hasTaskComplete(state.tasks, ["take a screenshot of your current domain settings"]))
        return "yes";
      return "not_yet";
    })();

  const hasExact: DnsPlanningState["hasExactRecords"] =
    planning?.hasExactRecords ??
    ((): DnsPlanningState["hasExactRecords"] => {
      const v = normaliseConfidence(business.hasExactProviderRecords);
      if (v === "yes") return "yes";
      if (v === "preset") return "preset";
      if (v === "no" || v === "not_yet") return "not_yet";
      return "not_yet";
    })();

  const providerLocation = (
    planning?.dnsProviderLocation ??
    business.dnsProvider ??
    business.registrarName ??
    state.ownership.dnsProvider ??
    ""
  ).trim();
  const providerKnown = providerLocation.length > 0;

  const emailAtRisk = usesEmailRaw === "yes" || usesEmailRaw === "not_sure";
  const existingWebsiteAtRisk = changeType === "replacing";
  const websiteChangeExpected = changeType === "replacing" || changeType === "unsure";

  const requiredBeforeChange: string[] = [];
  const recordsToPreserve: string[] = [];

  if (emailAtRisk) {
    recordsToPreserve.push("MX (email delivery)");
    recordsToPreserve.push("SPF / DKIM / DMARC (email authentication)");
  }
  if (existingWebsiteAtRisk) {
    recordsToPreserve.push("Existing website records (A / CNAME)");
  } else {
    recordsToPreserve.push("Website records (A / CNAME) — new site");
  }
  // Always preserve ability to undo
  if (screenshot !== "yes") {
    requiredBeforeChange.push("Take a screenshot of current domain settings");
  }
  if (hasExact !== "yes" && hasExact !== "preset") {
    requiredBeforeChange.push("Get exact DNS values from your website provider");
  }
  if (!providerKnown) {
    requiredBeforeChange.push("Confirm where your DNS is managed");
  }
  if (emailAtRisk && hasExact !== "yes") {
    requiredBeforeChange.push("Save your business email records before changing anything");
  }
  if (requiredBeforeChange.length === 0) {
    requiredBeforeChange.push("You have the key safeguards saved — proceed with DNS guide");
  }

  let level: DnsImpactPreview["level"];
  let title: string;
  let summary: string;
  let recommendedNextStep: { label: string; route: string };

  // low only if first site + no email + screenshot + exact records
  const isLow =
    changeType === "first" && usesEmailRaw === "no" && screenshot === "yes" && hasExact === "yes";
  // high if email yes+change, replacing, no screenshot, unknown provider, no exact records
  const isHigh =
    usesEmailRaw === "yes" &&
    changeType === "replacing" &&
    screenshot !== "yes" &&
    !providerKnown &&
    hasExact !== "yes" &&
    hasExact !== "preset";

  if (isLow) {
    level = "low";
    title = "You are ready to connect — low DNS risk";
    summary =
      "You are ready to connect. First website and no business email at risk — you have a screenshot and exact provider values. Safe to connect.";
    recommendedNextStep = { label: "Connect your website", route: "/connect-domain" };
  } else if (isHigh) {
    level = "high";
    title = "This change needs extra care — high DNS risk";
    summary =
      "This change needs extra care — changing DNS will affect your existing website and business email. Save a screenshot, confirm DNS location, and keep exact mail records before changing anything.";
    recommendedNextStep = { label: "Save DNS screenshot first", route: "/connect-domain" };
  } else if (changeType === "replacing" || changeType === "unsure") {
    level = "medium";
    title = "Review your current setup — medium DNS risk";
    summary =
      "Review your current setup before changing DNS. Replacing or unsure website setup — verify DNS provider and preserve existing records before updating.";
    recommendedNextStep = { label: "Review DNS guide", route: "/connect-domain" };
  } else {
    // fallback medium if not low/high but missing safeguards
    if (screenshot !== "yes" || hasExact !== "yes") {
      level = "medium";
      title = "Review your current setup — medium DNS risk";
      summary =
        "Review your current setup before changing DNS. Add missing safeguards (screenshot, exact records) before changing.";
      recommendedNextStep = { label: "Review DNS guide", route: "/connect-domain" };
    } else {
      level = "low";
      title = "You are ready to connect — low DNS risk";
      summary = "You are ready to connect. Safeguards in place — proceed with DNS connection.";
      recommendedNextStep = { label: "Connect your website", route: "/connect-domain" };
    }
  }

  return {
    level,
    title,
    summary,
    websiteChangeExpected,
    emailAtRisk,
    existingWebsiteAtRisk,
    requiredBeforeChange,
    recordsToPreserve,
    recommendedNextStep,
  };
}

// ---- Helpers for each presence area ----

function domainArea(state: AppState, readiness: LaunchReadiness): PresenceStatusArea {
  const business = state.business;
  const tasks = state.tasks;
  const ownership = state.ownership;
  const ideas = state.savedDomainIdeas;

  const ownedDomain = (business.ownedDomain ?? "").trim();
  const registrarName =
    (business.registrarName ?? "").trim() || (ownership.domainRegistrar ?? "").trim();
  const preferredDomain = (business.preferredDomain ?? "").trim();
  const hasIdeas = ideas.length > 0;
  const purchasedIdea = ideas.some((d) => d.status === "purchased");
  const domainTaskDone = hasTaskComplete(tasks, [
    "choose and register your web address",
    "sign in to your existing domain",
  ]);
  const tfaDone = hasTaskComplete(tasks, ["turn on two-step"]);
  const renewalDone = hasTaskComplete(tasks, ["turn on renewal"]);
  const access = normaliseConfidence(business.hasRegistrarAccess);
  const blockers: string[] = [];

  let status: PresenceAreaStatus;
  let summary: string;

  const hasOwned = ownedDomain.length > 0 || business.domainPurchased === "yes" || purchasedIdea;
  const readinessBlocked = readiness.blockers.some((b) => b.id === "domain-ownership");

  if (hasOwned && domainTaskDone && tfaDone && renewalDone && registrarName) {
    if (readinessBlocked) {
      status = "needs_attention";
      summary = "Domain registered but ownership or 2FA needs review.";
      blockers.push("Review registrar ownership and recovery access");
    } else if (access === "no") {
      status = "needs_attention";
      summary = "Domain owned but you marked no registrar access — confirm control.";
      blockers.push("Confirm registrar access");
    } else {
      status = "complete";
      summary = `Domain ${ownedDomain || preferredDomain || "saved"} is registered and secured.`;
    }
  } else if (hasOwned) {
    if (!domainTaskDone) {
      status = "in_progress";
      summary = "Domain found — confirm control and renewal in your account.";
    } else if (!tfaDone || !renewalDone) {
      status = "needs_attention";
      summary = "Domain registered — enable 2FA and renewal protection.";
      if (!tfaDone) blockers.push("Turn on two-step sign-in");
      if (!renewalDone) blockers.push("Enable auto-renew or reminders");
    } else if (!registrarName) {
      status = "needs_information";
      summary = "Add your registrar name so ownership can be verified.";
      blockers.push("Registrar name missing");
    } else {
      status = "in_progress";
      summary = "Domain details partially complete — finish verification.";
    }
  } else if (hasIdeas || preferredDomain) {
    status = "planned";
    summary = "Domain idea saved — ready to register in your own account.";
  } else {
    status = "needs_information";
    summary = "No domain chosen yet — shortlist a web address to start.";
  }

  return {
    id: "domain",
    label: "Domain",
    description:
      "Your web address — registered in your own account with renewal and recovery saved.",
    status,
    statusLabel: STATUS_LABEL[status],
    summary,
    relatedRoute: "/domains",
    actionLabel: status === "complete" ? "Review domain" : "Choose your domain",
    priority: 1,
    blockers: blockers.length ? blockers : undefined,
  };
}

function websiteArea(state: AppState): PresenceStatusArea {
  const business = state.business;
  const tasks = state.tasks;
  const ownership = state.ownership;

  const websiteUrl = (business.websiteUrl ?? "").trim();
  const websiteUrlStatus = (business.websiteUrlStatus ?? "") as string;
  const provider =
    (business.websiteProvider ?? "").trim() || (ownership.websitePlatform ?? "").trim();
  const approach = (business.websiteApproach ?? "").trim();
  const existingPresent = normaliseConfidence(business.existingWebsitePresent);
  const blockers: string[] = [];

  const homeDone = hasTaskComplete(tasks, ["write your home page"]);
  const httpsDone = hasTaskComplete(tasks, ["turn on https"]);
  const mobileDone = hasTaskComplete(tasks, ["check every page on a real phone"]);

  let status: PresenceAreaStatus;
  let summary: string;

  if (websiteUrlStatus === "live" && homeDone && httpsDone) {
    if (!mobileDone) {
      status = "ready_for_review";
      summary = "Website live — review on a real phone before inviting customers.";
    } else {
      status = "complete";
      summary = "Website live with HTTPS and core pages checked.";
    }
  } else if (websiteUrlStatus === "draft" || websiteUrl.length > 0) {
    status = "in_progress";
    summary = websiteUrl
      ? `Website draft at ${websiteUrl} — finish core pages and connect.`
      : "Website draft in progress.";
    if (!homeDone) blockers.push("Write Home page");
    if (!httpsDone) blockers.push("Enable HTTPS");
  } else if (provider || approach || existingPresent === "yes") {
    status = "planned";
    summary = provider
      ? `Website tool "${provider}" chosen — build core pages.`
      : "Website setup chosen — start building core pages.";
  } else if (tasks.length === 0) {
    status = "not_started";
    summary = "No website setup yet — choose a website tool to begin.";
  } else {
    status = "needs_information";
    summary = "Tell us your website approach so we can guide the next step.";
    blockers.push("Website approach missing");
  }

  return {
    id: "website",
    label: "Website",
    description: "What customers see — pages, design and hosting in one place.",
    status,
    statusLabel: STATUS_LABEL[status],
    summary,
    relatedRoute: "/platform-matcher",
    actionLabel: status === "complete" ? "Review website" : "Build your website",
    priority: 2,
    blockers: blockers.length ? blockers : undefined,
  };
}

function emailArea(state: AppState, readiness: LaunchReadiness): PresenceStatusArea {
  const business = state.business;
  const tasks = state.tasks;
  const uses = normaliseConfidence(business.usesBusinessEmail ?? business.needsBusinessEmail);

  const hasEmail =
    (business.businessEmail ?? "").trim().length > 0 ||
    (state.ownership.emailProvider ?? "").trim().length > 0;
  const chooseDone = hasTaskComplete(tasks, ["choose your business email provider"]);
  const setupDone = hasTaskComplete(tasks, ["set up your business email address"]);
  const testDone = hasTaskComplete(tasks, ["send and receive a test email"]);
  const blockers: string[] = [];

  let status: PresenceAreaStatus;
  let summary: string;

  if (uses === "no") {
    status = "complete";
    summary = "Business email not needed — marked as not required.";
  } else if (uses === "unsure" || uses === "not_sure" || uses === "") {
    status = "needs_information";
    summary = "Confirm if you need a business email (e.g., hello@yourbusiness.com).";
    blockers.push("Email need unclear");
  } else if (testDone && setupDone) {
    status = "complete";
    summary = "Business email set up and test message verified.";
  } else if (chooseDone || setupDone || hasEmail) {
    if (readiness.blockers.some((b) => b.id === "protect-email")) {
      status = "needs_attention";
      summary = "Business email at risk — test delivery and keep mail records separate.";
      blockers.push("Send and receive a test email");
    } else {
      status = "in_progress";
      summary = "Business email setup in progress — finish and test both directions.";
      if (!testDone) blockers.push("Send a test email");
    }
  } else {
    status = "planned";
    summary = "Business email planned — choose provider and addresses.";
  }

  return {
    id: "email",
    label: "Business email",
    description: "Your hello@yourbusiness.com address — separate from website records.",
    status,
    statusLabel: STATUS_LABEL[status],
    summary,
    relatedRoute: "/business-email",
    actionLabel: status === "complete" && uses !== "no" ? "Review email" : "Set up business email",
    priority: 3,
    blockers: blockers.length ? blockers : undefined,
  };
}

function dnsArea(state: AppState): PresenceStatusArea {
  const tasks = state.tasks;
  const preview = getDnsImpactPreview(state);
  const screenshotDone = hasTaskComplete(tasks, [
    "take a screenshot of your current domain settings",
  ]);
  const pointDone = hasTaskComplete(tasks, ["point your web address at your website"]);
  const httpsDone = hasTaskComplete(tasks, ["turn on https"]);

  let status: PresenceAreaStatus;
  let summary: string;
  const blockers: string[] = [...preview.requiredBeforeChange];

  if (pointDone && httpsDone && preview.level === "low") {
    status = "complete";
    summary = "DNS connected and safeguards verified.";
  } else if (pointDone && httpsDone) {
    status = "ready_for_review";
    summary = "DNS connected — verify no email or website disruption.";
  } else if (screenshotDone && pointDone) {
    status = "in_progress";
    summary = "DNS changes in progress — finish HTTPS check.";
  } else if (screenshotDone || preview.level !== "high") {
    if (preview.level === "high") {
      status = "needs_attention";
      summary = "High-risk DNS change — save safeguards before updating.";
    } else if (preview.level === "medium") {
      status = "planned";
      summary = "DNS planned — review impact before changing records.";
    } else {
      status = "planned";
      summary = "DNS ready to connect — follow the DNS guide.";
    }
  } else {
    if (tasks.length === 0) {
      status = "not_started";
      summary = "DNS not started — create your plan first.";
    } else {
      status = "needs_information";
      summary = "DNS setup needs your provider location and current records.";
    }
  }

  // trim blockers to 3 for display if already complete
  const displayBlockers = status === "complete" ? undefined : blockers.slice(0, 4);

  return {
    id: "dns",
    label: "DNS & connection",
    description: "The settings that point your web address to your website — safely.",
    status,
    statusLabel: STATUS_LABEL[status],
    summary,
    relatedRoute: "/connect-domain",
    actionLabel: preview.recommendedNextStep.label,
    priority: 4,
    blockers: displayBlockers,
  };
}

function ownershipArea(state: AppState, readiness: LaunchReadiness): PresenceStatusArea {
  const business = state.business;
  const ownership = state.ownership;
  const tasks = state.tasks;

  const hasRegistrar =
    (ownership.domainRegistrar ?? "").trim() || (business.registrarName ?? "").trim();
  const hasRenewal = (ownership.renewalDate ?? "").trim();
  const hasDnsProvider = (ownership.dnsProvider ?? "").trim();
  const hasRecovery =
    (ownership.recoveryOwner ?? "").trim() ||
    normaliseConfidence(business.hasRecoveryEmailAccess) === "yes";
  const tfaDone = hasTaskComplete(tasks, ["turn on two-step"]);
  const renewalDone = hasTaskComplete(tasks, ["turn on renewal"]);
  const blockers: string[] = [];

  let status: PresenceAreaStatus;
  let summary: string;

  const filledCount = [
    hasRegistrar,
    hasRenewal,
    hasDnsProvider,
    ownership.websitePlatform,
    ownership.emailProvider,
  ].filter((v) => (v ?? "").trim().length > 0).length;

  const readinessBlocked = readiness.blockers.some((b) => b.id === "domain-ownership");

  if (filledCount >= 4 && tfaDone && renewalDone && hasRecovery) {
    if (readinessBlocked) {
      status = "needs_attention";
      summary = "Ownership record saved but review 2FA and renewal safeguards.";
    } else {
      status = "complete";
      summary = "Ownership and recovery details saved.";
    }
  } else if (filledCount >= 2 || hasRegistrar) {
    status = "in_progress";
    summary = "Ownership record partially complete — add missing providers and dates.";
    if (!hasRegistrar) blockers.push("Domain registrar");
    if (!hasRenewal) blockers.push("Renewal date");
    if (!hasRecovery) blockers.push("Recovery email/account");
    if (!tfaDone) blockers.push("Two-step sign-in");
  } else if (tasks.length === 0) {
    status = "not_started";
    summary = "Ownership not yet tracked — save who controls domain, DNS and billing.";
  } else {
    status = "needs_information";
    summary = "Add ownership details so you stay in control of your accounts.";
    blockers.push("Registrar and renewal missing");
  }

  return {
    id: "ownership",
    label: "Ownership",
    description: "Who controls your domain, website and billing — with recovery saved offline.",
    status,
    statusLabel: STATUS_LABEL[status],
    summary,
    relatedRoute: "/ownership-record",
    actionLabel: status === "complete" ? "Review ownership" : "Save ownership",
    priority: 6,
    blockers: blockers.length ? blockers : undefined,
  };
}

function localPresenceArea(state: AppState): PresenceStatusArea {
  const business = state.business;
  const tasks = state.tasks;

  const customerModel = business.customerModel;
  const hasPhysical = business.hasPhysicalLocation;
  const address = (business.address ?? "").trim() || (business.location ?? "").trim();
  const serviceAreas = (business.serviceAreas ?? "").trim();
  const hours = (business.hoursDetail ?? "").trim();
  const profileTaskDone = hasTaskComplete(tasks, ["create or claim your local business profile"]);

  let status: PresenceAreaStatus;
  let summary: string;
  const blockers: string[] = [];

  if (customerModel === "online") {
    status = "complete";
    summary = "Online-only business — local profile not required.";
  } else if (profileTaskDone && address && (hasPhysical || serviceAreas)) {
    status = "complete";
    summary = "Local presence claimed with address/service area.";
  } else if (address || serviceAreas || hasPhysical) {
    if (!profileTaskDone) {
      status = "in_progress";
      summary = "Address saved — claim your local business profile to get found.";
      blockers.push("Create or claim local profile");
    } else {
      status = "ready_for_review";
      summary = "Local profile in progress — verify name, address and hours match everywhere.";
    }
    if (!address && !serviceAreas) blockers.push("Address or service area");
    if (!hours) blockers.push("Business hours");
  } else if (customerModel === "" && !hasPhysical && !address) {
    status = "needs_information";
    summary = "Tell us where you serve customers to guide local setup.";
    blockers.push("Location / service area missing");
  } else if (tasks.length === 0) {
    status = "not_started";
    summary = "Local presence not started — add your service area.";
  } else {
    status = "needs_information";
    summary = "Add your address or service areas for local discovery.";
    blockers.push("Service area missing");
  }

  return {
    id: "local_presence",
    label: "Local presence",
    description: "How nearby customers find you — address, hours and local profile.",
    status,
    statusLabel: STATUS_LABEL[status],
    summary,
    relatedRoute: "/get-found",
    actionLabel:
      status === "complete" && customerModel !== "online"
        ? "Review local profile"
        : "Set up local presence",
    priority: 7,
    blockers: blockers.length ? blockers : undefined,
  };
}

export function getOnlinePresenceStatus(state: AppState): PresenceStatusArea[] {
  const readiness = getReadiness(
    state.tasks,
    state.business,
    state.ownership,
    state.customerJourneyTest,
  );

  const areas: PresenceStatusArea[] = [
    domainArea(state, readiness),
    websiteArea(state),
    emailArea(state, readiness),
    dnsArea(state),
    getCustomerActionStatus(state),
    ownershipArea(state, readiness),
    localPresenceArea(state),
  ];

  // sort by priority (already in order)
  return areas.sort((a, b) => a.priority - b.priority);
}

export function getTopPresenceAction(
  areas: PresenceStatusArea[],
  readiness: LaunchReadiness,
): PresenceStatusArea | LaunchBlocker | null {
  // Priority per spec 1-6: map readiness blockers first
  if (readiness.blockers.length > 0) {
    const critical = readiness.blockers.find((b) => b.severity === "critical");
    if (critical) return critical;
    // otherwise first important blocker
    const important = readiness.blockers.find((b) => b.severity === "important");
    if (important) return important;
  }

  // Fallback to first incomplete presence area by priority
  const sorted = [...areas].sort((a, b) => a.priority - b.priority);
  for (const area of sorted) {
    if (area.status !== "complete") return area;
  }
  return null;
}
