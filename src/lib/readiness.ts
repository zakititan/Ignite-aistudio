import type {
  BusinessProfile,
  CustomerJourneyTest,
  LaunchBlocker,
  LaunchReadiness,
  LaunchTask,
  OwnershipRecord,
} from "./types";
import { JOURNEY_DEFINITIONS } from "./customer-journey";

/**
 * Deterministic launch readiness helper shared by Dashboard and Checklist.
 * Never uses guaranteed language — "ready_for_review" means "ready for final review".
 */

function findTaskId(tasks: LaunchTask[], needles: string[]): string | undefined {
  const lower = needles.map((n) => n.toLowerCase());
  const found = tasks.find((t) => lower.some((n) => t.title.toLowerCase().includes(n)));
  return found?.id;
}

function isComplete(tasks: LaunchTask[], needles: string[]): boolean {
  const lower = needles.map((n) => n.toLowerCase());
  const found = tasks.find((t) => lower.some((n) => t.title.toLowerCase().includes(n)));
  if (!found) return false;
  return found.status === "complete";
}

function hasAnyComplete(tasks: LaunchTask[], needles: string[]): boolean {
  const lower = needles.map((n) => n.toLowerCase());
  const candidates = tasks.filter((t) => lower.some((n) => t.title.toLowerCase().includes(n)));
  return candidates.some((t) => t.status === "complete");
}

function isTaskOutstanding(tasks: LaunchTask[], needles: string[]): boolean {
  // blocker outstanding if matching task exists and is not complete, or if no matching task but we treat as outstanding
  const lower = needles.map((n) => n.toLowerCase());
  const found = tasks.find((t) => lower.some((n) => t.title.toLowerCase().includes(n)));
  if (!found) return true;
  return found.status !== "complete";
}

// Helpers for conditional gating per business type
function isLiveWebsite(business: BusinessProfile): boolean {
  return business.websiteUrlStatus === "live";
}

function isLocalRelevant(business: BusinessProfile): boolean {
  return (
    business.customerModel === "local" ||
    business.customerModel === "both" ||
    business.hasPhysicalLocation ||
    business.servesAtCustomerLocation
  );
}

function isEcommerceRelevant(business: BusinessProfile): boolean {
  const needs = business.needs ?? [];
  const goal = (business.primaryGoal ?? "").toLowerCase();
  const cat = (business.category ?? "").toLowerCase();
  return (
    needs.includes("Ecommerce shop") ||
    goal.includes("sell") ||
    goal.includes("product") ||
    cat.includes("retail") ||
    cat.includes("shop") ||
    (business.storeUrl ?? "").trim().length > 0
  );
}

function isBookingRelevant(business: BusinessProfile): boolean {
  const needs = business.needs ?? [];
  const goal = (business.primaryGoal ?? "").toLowerCase();
  return (
    needs.includes("Online booking") ||
    goal.includes("booking") ||
    goal.includes("appointment") ||
    (business.bookingUrl ?? "").trim().length > 0
  );
}

function isContactFormRelevant(business: BusinessProfile): boolean {
  const needs = business.needs ?? [];
  const action = (business.primaryCustomerAction ?? "").toString();
  return (
    needs.includes("Contact form") ||
    action === "contact_form" ||
    (business.contactFormUrl ?? "").trim().length > 0
  );
}

function needsBusinessEmailRelevant(business: BusinessProfile): boolean {
  const v = (business.needsBusinessEmail ?? "").toString().toLowerCase();
  const uses = (business.usesBusinessEmail ?? "").toString().toLowerCase();
  if (v === "yes" || uses === "yes") return true;
  if ((business.businessEmail ?? "").trim().length > 0) return true;
  if (v === "unsure" || uses === "unsure" || uses === "not_sure") return false;
  return v === "yes";
}

function isExistingSiteMigration(business: BusinessProfile): boolean {
  const status = (business.existingWebsiteStatus ?? "").toLowerCase();
  const present = (business.existingWebsitePresent ?? "").toString().toLowerCase();
  const change = (business.websiteChangePlanned ?? "").toString().toLowerCase();
  return (
    present === "yes" ||
    change === "yes" ||
    change === "replacing" ||
    status.includes("have a website") ||
    status.includes("improving") ||
    status.includes("someone else manages") ||
    status.includes("already") // I already own a domain not necessarily site but treat as existing? keep conservative
  );
}

export function getReadiness(
  tasks: LaunchTask[],
  business: BusinessProfile,
  ownership?: OwnershipRecord,
  customerJourneyTest?: CustomerJourneyTest | boolean,
): LaunchReadiness {
  const total = tasks.length;
  const overallCompletionPercent = total
    ? Math.round((tasks.filter((t) => t.status === "complete").length / total) * 100)
    : 0;

  const requiredTasks = tasks.filter((t) => t.importance === "required");
  const totalRequiredTasks = requiredTasks.length;
  const completedRequiredTasks = requiredTasks.filter((t) => t.status === "complete").length;
  const requiredCompletionPercent = totalRequiredTasks
    ? Math.round((completedRequiredTasks / totalRequiredTasks) * 100)
    : 0;

  // not_started if no onboarding/plan (no tasks)
  if (!total) {
    return {
      status: "not_started",
      overallCompletionPercent,
      requiredCompletionPercent,
      completedRequiredTasks,
      totalRequiredTasks,
      blockers: [],
      nextRecommendedAction: "Create your launch plan to see what to review before launch.",
    };
  }

  const blockers: LaunchBlocker[] = [];

  // 1 - Domain ownership (critical, always relevant)
  {
    const id = "domain-ownership";
    const ownershipMarked =
      ownership &&
      [ownership.domainRegistrar, ownership.renewalDate].some((v) => (v ?? "").trim().length > 0);
    const domainTaskComplete = hasAnyComplete(tasks, [
      "choose and register your web address",
      "sign in to your existing domain",
      "confirm control",
    ]);
    const tfaComplete = isComplete(tasks, ["turn on two-step"]);
    const renewalComplete = isComplete(tasks, ["turn on renewal", "auto-renew"]);
    // outstanding if any core domain ownership signal incomplete
    const outstanding = !(
      domainTaskComplete &&
      tfaComplete &&
      renewalComplete &&
      (ownershipMarked ||
        business.ownedDomain.trim().length > 0 ||
        business.currentStatus !== "I already own a domain")
    );
    // Simplify: if any of domain tasks incomplete => blocker
    const simpleOutstanding =
      isTaskOutstanding(tasks, [
        "choose and register your web address",
        "sign in to your existing domain",
      ]) ||
      isTaskOutstanding(tasks, ["turn on two-step"]) ||
      isTaskOutstanding(tasks, ["turn on renewal"]);
    const isOutstanding = simpleOutstanding || outstanding;
    // Always evaluate; blockers only added when outstanding
    if (isOutstanding) {
      blockers.push({
        id,
        title: "Confirm your domain ownership",
        description:
          "Your web address is business property — review that it is registered in your own account with recovery access saved.",
        severity: "critical",
        relatedTaskId: findTaskId(tasks, [
          "choose and register your web address",
          "sign in to your existing domain",
        ]),
        relatedRoute: "/ownership-record",
        actionLabel: "Review ownership",
      });
    }
  }

  // 2 - Website connection (critical)
  {
    const id = "website-connection";
    const outstanding =
      isTaskOutstanding(tasks, ["point your web address at your website"]) ||
      isTaskOutstanding(tasks, ["take a screenshot of your current domain settings"]);
    if (outstanding) {
      blockers.push({
        id,
        title: "Connect your web address to your website",
        description:
          "Until your address points to your website, visitors will not reach the right place.",
        severity: "critical",
        relatedTaskId: findTaskId(tasks, ["point your web address at your website"]),
        relatedRoute: "/connect-domain",
        actionLabel: "Review connection",
      });
    }
  }

  // 3 - HTTPS (critical) — only if live URL
  {
    const id = "https";
    const isLive = isLiveWebsite(business);
    // Only gate HTTPS when live — per spec HTTPS only if live URL
    if (isLive) {
      const outstanding = isTaskOutstanding(tasks, ["turn on https", "check for browser warnings"]);
      if (outstanding) {
        blockers.push({
          id,
          title: "Check HTTPS (padlock) for warnings",
          description:
            "Browsers warn visitors when the padlock is missing — review before you invite customers.",
          severity: "critical",
          relatedTaskId: findTaskId(tasks, ["turn on https"]),
          relatedRoute: "/connect-domain",
          actionLabel: "Review HTTPS",
        });
      }
    }
  }

  // 4 - Test primary action / customer journey (critical / important)
  {
    const isJourneyObject = typeof customerJourneyTest === "object" && customerJourneyTest !== null;
    if (isJourneyObject) {
      const journey = customerJourneyTest as CustomerJourneyTest;
      const steps = journey.steps ?? [];
      const hasBlocked = steps.some((s) => s.status === "blocked");
      const hasNeeds = steps.some((s) => s.status === "needs_improvement");
      const allPassed = steps.length > 0 && steps.every((s) => s.status === "passed");
      const label =
        journey.journeyType === "custom" && journey.customJourneyLabel?.trim()
          ? journey.customJourneyLabel.trim()
          : (JOURNEY_DEFINITIONS[journey.journeyType]?.label ?? journey.journeyType);
      if (hasBlocked) {
        const blockedLabels = steps
          .filter((s) => s.status === "blocked")
          .map((s) => s.label)
          .join(", ");
        blockers.push({
          id: "customer-journey-blocked",
          title: `Customer journey blocked: ${label}`,
          description: `One or more steps are blocked — ${blockedLabels}. Fix these before inviting customers, or customers will not be able to complete this action.`,
          severity: "critical",
          relatedRoute: "/customer-journey",
          actionLabel: "Fix journey",
        });
      } else if (hasNeeds) {
        const needsLabels = steps
          .filter((s) => s.status === "needs_improvement")
          .map((s) => s.label)
          .join(", ");
        blockers.push({
          id: "customer-journey-needs-improvement",
          title: `Customer journey needs improvement: ${label}`,
          description: `Some steps need improvement — ${needsLabels}. Review and improve these for a smoother customer experience.`,
          severity: "important",
          relatedRoute: "/customer-journey",
          actionLabel: "Improve journey",
        });
      } else if (allPassed) {
        // satisfied — no blocker; also mark that primary action is tested
      } else {
        // Not fully tested — show guidance blocker as critical until tested
        const notTested = steps.filter((s) => s.status === "not_tested").length;
        const tested = steps.length - notTested;
        // Only show if journey exists but not completed — treat as important prompt, but spec says blocked primary journey must appear as critical; incomplete test should prompt testing
        // Use critical to ensure visibility before launch
        blockers.push({
          id: "primary-action-test",
          title: "Test your primary customer action end to end",
          description: `You chose "${label}" as your main customer action. ${tested}/${steps.length} steps recorded. Complete the test on a real phone and record each outcome.`,
          severity: "critical",
          relatedTaskId: findTaskId(tasks, ["test your contact form"]),
          relatedRoute: "/customer-journey",
          actionLabel: "Test your key action",
        });
      }
    } else {
      let outstanding: boolean;
      if (typeof customerJourneyTest === "boolean") {
        outstanding = !customerJourneyTest;
      } else {
        outstanding = isTaskOutstanding(tasks, ["test your contact form"]);
      }
      if (outstanding) {
        blockers.push({
          id: "primary-action-test",
          title: "Test your primary customer action end to end",
          description:
            "Submit the form, booking or checkout yourself and confirm the message or order reaches the right inbox.",
          severity: "critical",
          relatedTaskId: findTaskId(tasks, ["test your contact form"]),
          relatedRoute: "/customer-journey",
          actionLabel: "Test your key action",
        });
      }
    }
  }

  // 5 - Business details (important)
  {
    const id = "business-details";
    const outstanding =
      isTaskOutstanding(tasks, ["collect your business details"]) ||
      isTaskOutstanding(tasks, ["check spelling, prices, hours"]);
    if (outstanding) {
      blockers.push({
        id,
        title: "Complete core business details",
        description:
          "Review name, phone, address or service area, hours and prices — errors here reduce trust quickly.",
        severity: "important",
        relatedTaskId:
          findTaskId(tasks, ["collect your business details"]) ??
          findTaskId(tasks, ["check spelling, prices"]),
        relatedRoute: "/content",
        actionLabel: "Review details",
      });
    }
  }

  // 6 - Mobile review (important) — All applicable
  {
    const id = "mobile-review";
    const outstanding = isTaskOutstanding(tasks, ["check every page on a real phone"]);
    if (outstanding) {
      blockers.push({
        id,
        title: "Review every page on a real phone",
        description:
          "Many customers visit on mobile — review for cut-off text and buttons that are hard to tap.",
        severity: "important",
        relatedTaskId: findTaskId(tasks, ["check every page on a real phone"]),
        relatedRoute: "/checklist",
        actionLabel: "Review on mobile",
      });
    }
  }

  // 7 - Protect email (important) — only when relevant to business model
  {
    const id = "protect-email";
    const needsEmail = business.needsBusinessEmail !== "no";
    if (needsEmail) {
      const outstanding = isTaskOutstanding(tasks, ["send and receive a test email"]);
      if (outstanding) {
        blockers.push({
          id,
          title: "Protect and test your business email",
          description:
            "Email delivery can be affected when domain settings change — send a test and keep mail records separate.",
          severity: "important",
          relatedTaskId: findTaskId(tasks, ["send and receive a test email"]),
          relatedRoute: "/business-email",
          actionLabel: "Review email",
        });
      }
    }
  }

  // 8 - Selling / data policies (important) — only when relevant
  {
    const id = "selling-data-policies";
    const needsSelling =
      business.needs?.includes("Ecommerce shop") ||
      business.needs?.includes("Online booking") ||
      business.needs?.includes("Members-only area") ||
      business.needs?.includes("Email newsletter signup") ||
      business.primaryGoal?.toLowerCase().includes("sell") ||
      business.category?.toLowerCase().includes("retail");
    if (needsSelling) {
      const sellingPageComplete = (() => {
        if (business.needs?.includes("Ecommerce shop")) {
          return isComplete(tasks, ["write your products page"]);
        }
        return true;
      })();
      if (!sellingPageComplete) {
        blockers.push({
          id,
          title: "Review selling and data-use information",
          description:
            "If you take payments or collect personal data, review that terms, returns and privacy details are clear before you invite customers.",
          severity: "important",
          relatedTaskId:
            findTaskId(tasks, ["write your products page"]) ??
            findTaskId(tasks, ["schedule a monthly"]),
          relatedRoute: "/content",
          actionLabel: "Review policies",
        });
      }
    }
  }

  // 9 - Business essentials (unified profile) — critical if core details missing
  {
    const id = "business-essentials";
    const missingName = !business.businessName.trim();
    const missingDescription = !business.description.trim() && !business.servicesOffered.trim();
    const needsLocation = business.customerModel !== "online" && business.customerModel !== "";
    const missingLocation = needsLocation
      ? !business.location.trim() && !(business.address ?? "").trim()
      : false;
    const action = (business.primaryCustomerAction ?? "").toString().trim();
    const phone = (business.phone ?? "").trim();
    const whatsapp = (business.whatsappNumber ?? "").trim();
    const email = (business.businessEmail ?? "").trim();
    const contactForm = (business.contactFormUrl ?? "").trim();
    const booking = (business.bookingUrl ?? "").trim();
    const store = (business.storeUrl ?? "").trim();
    const missingContact =
      !action && !phone && !whatsapp && !email && !contactForm && !booking && !store;

    const missing: string[] = [];
    if (missingName) missing.push("business name");
    if (missingDescription) missing.push("description/services");
    if (missingLocation) missing.push("location for local customers");
    if (missingContact) missing.push("primary customer action or contact method");

    if (missing.length > 0) {
      const title = "Complete business essentials in your profile";
      const description =
        missing.length === 1
          ? `Missing ${missing[0]}. Add it in Business profile so customers know how to reach you and downstream pages stay accurate.`
          : `Missing ${missing.join(", ")}. Fill these in Business profile so greetings, content builder, journey tester and discoverability use the right details.`;
      blockers.push({
        id,
        title,
        description,
        severity: "critical",
        relatedRoute: "/business-profile",
        actionLabel: "Complete business profile",
      });
    }
  }

  // 10 - Local presence specifics: location/service area + hours if needed
  {
    if (isLocalRelevant(business)) {
      const locationMissing =
        !business.location.trim() &&
        !(business.address ?? "").trim() &&
        !(business.serviceAreas ?? "").trim();
      const hoursMissing = business.hasBusinessHours && !(business.hoursDetail ?? "").trim();
      // Location/service area blocker
      if (locationMissing) {
        blockers.push({
          id: "local-location-service-area",
          title: "Add location or service area for local customers",
          description:
            "Local customers need to know where you are or where you serve. Add your town/city, address or service areas in Business profile — why it matters: without this, customers cannot visit or know if you serve them.",
          severity: "critical",
          relatedRoute: "/business-profile",
          actionLabel: "Add location",
        });
      } else if (hoursMissing) {
        // Only if location present but hours missing
        blockers.push({
          id: "local-hours",
          title: "Add business hours for local customers",
          description:
            "When customers visit or call in person, they expect correct hours. Add opening hours in Business profile — why it matters: wrong hours cause wasted trips and lost trust.",
          severity: "important",
          relatedRoute: "/business-profile",
          actionLabel: "Add hours",
        });
      }
    }
  }

  // 11 - Ecommerce specifics: product/checkout/delivery/returns/payment
  {
    if (isEcommerceRelevant(business)) {
      const productOutstanding = isTaskOutstanding(tasks, ["write your products page"]);
      const deliveryMissing = !(business.deliveryNotes ?? "").trim();
      const storeMissing = !(business.storeUrl ?? "").trim();
      const needsPolicies = business.policiesNeeded ?? [];
      const returnsMissing =
        !needsPolicies.includes("Returns / refunds") &&
        !needsPolicies.includes("Shipping / delivery");
      // Product page critical
      if (productOutstanding) {
        blockers.push({
          id: "ecommerce-product",
          title: "Complete product and checkout details",
          description:
            "Online shoppers need clear products, prices and checkout. Finish your Products page — why it matters: customers will not buy if they cannot find what you sell or how to pay.",
          severity: "critical",
          relatedTaskId: findTaskId(tasks, ["write your products page"]),
          relatedRoute: "/content",
          actionLabel: "Add products",
        });
      }
      // Delivery/payment/returns important (aggregate to avoid spam)
      const ecommerceSecondaryMissing: string[] = [];
      if (storeMissing) ecommerceSecondaryMissing.push("store/checkout link");
      if (deliveryMissing) ecommerceSecondaryMissing.push("delivery/returns info");
      if (returnsMissing) ecommerceSecondaryMissing.push("returns/shipping policy");
      if (ecommerceSecondaryMissing.length > 0 && !productOutstanding) {
        // Only show secondary if primary already done, to keep blocker count reasonable
        blockers.push({
          id: "ecommerce-fulfillment",
          title: "Add delivery, returns and payment details",
          description: `Missing ${ecommerceSecondaryMissing.join(", ")}. Add these in Business profile and Content — why it matters: checkout questions cause abandoned carts. Protect business email before DNS change.`,
          severity: "important",
          relatedRoute: "/business-profile",
          actionLabel: "Review fulfilment",
        });
      }
    }
  }

  // 12 - Booking specifics: booking flow + confirmation + cancellation
  {
    if (isBookingRelevant(business)) {
      const bookingMissing = !(business.bookingUrl ?? "").trim();
      const confirmationOutstanding = false; // No dedicated task; use journey test as proxy
      const isJourneyObject =
        typeof customerJourneyTest === "object" && customerJourneyTest !== null;
      const journey = isJourneyObject ? (customerJourneyTest as CustomerJourneyTest) : null;
      const isBookingJourney = journey?.journeyType === "booking";
      const journeyNotPassed = !journey || !journey.steps.every((s) => s.status === "passed");
      if (bookingMissing) {
        blockers.push({
          id: "booking-flow",
          title: "Set up booking flow and confirmation",
          description:
            "Customers need an easy way to book, a clear confirmation and a way to cancel or reschedule — add your booking link in Business profile and test the full flow, including confirmation and cancellation. Why it matters: a broken booking loses the customer.",
          severity: "critical",
          relatedRoute: "/business-profile",
          actionLabel: "Add booking link",
        });
      } else if (isBookingJourney && journeyNotPassed) {
        // Booking URL present but journey not passed — reinforce blocker already exists via journey, but add specific booking confirmation hint
        // Avoid duplicate if journey blocker already present
        const hasJourneyBlocker = blockers.some(
          (b) => b.id.startsWith("customer-journey") || b.id === "primary-action-test",
        );
        if (!hasJourneyBlocker) {
          blockers.push({
            id: "booking-confirmation",
            title: "Test booking confirmation and cancellation",
            description:
              "Try changing or cancelling a test booking to verify confirmation messages arrive. Why it matters: customers panic if they do not get a confirmation.",
            severity: "important",
            relatedRoute: "/customer-journey",
            actionLabel: "Test booking",
          });
        }
      }
    }
  }

  // 13 - Contact-form: form tested or alternate
  {
    if (isContactFormRelevant(business)) {
      const isJourneyObject =
        typeof customerJourneyTest === "object" && customerJourneyTest !== null;
      const journey = isJourneyObject ? (customerJourneyTest as CustomerJourneyTest) : null;
      const isContactFormJourney = journey?.journeyType === "contact_form";
      const formTested = isContactFormJourney
        ? journey!.steps.every((s) => s.status === "passed")
        : !isTaskOutstanding(tasks, ["test your contact form"]);
      const hasAlternate =
        !!(business.phone ?? "").trim() ||
        !!(business.whatsappNumber ?? "").trim() ||
        !!(business.businessEmail ?? "").trim() ||
        business.primaryCustomerAction === "phone_call" ||
        business.primaryCustomerAction === "whatsapp_message";
      if (!formTested && !hasAlternate) {
        blockers.push({
          id: "contact-form-or-alternate",
          title: "Test contact form or add alternate contact",
          description:
            "Contact form enquiries must reach you — submit a test yourself and check the inbox, or list a phone/WhatsApp/email customers can use today. Why it matters: without this, enquiries are lost.",
          severity: "critical",
          relatedRoute: "/customer-journey",
          actionLabel: "Test contact form",
        });
      }
    }
  }

  // 14 - Business-email: email-safe DNS review before DNS complete
  {
    if (needsBusinessEmailRelevant(business)) {
      const screenshotOutstanding = isTaskOutstanding(tasks, [
        "take a screenshot of your current domain settings",
      ]);
      const pointOutstanding = isTaskOutstanding(tasks, ["point your web address at your website"]);
      // If DNS not yet complete and email at risk, require safeguard review
      if (screenshotOutstanding && pointOutstanding) {
        blockers.push({
          id: "email-safe-dns-review",
          title: "Protect business email before changing DNS",
          description:
            "Email delivery depends on DNS records (MX, SPF/DKIM). Save your current domain settings screenshot and get exact mail values before updating — review DNS impact. Why it matters: wrong DNS change can stop business email.",
          severity: "important",
          relatedTaskId: findTaskId(tasks, ["take a screenshot of your current domain settings"]),
          relatedRoute: "/connect-domain",
          actionLabel: "Review DNS impact",
        });
      } else {
        // Also if email test not done but DNS about to change, keep separate blocker? Already handled by protect-email
      }
    }
  }

  // 15 - Existing-site migration: backup + redirect + journey tested
  {
    if (isExistingSiteMigration(business)) {
      const screenshotOutstanding = isTaskOutstanding(tasks, [
        "take a screenshot of your current domain settings",
      ]);
      const pointOutstanding = isTaskOutstanding(tasks, ["point your web address at your website"]);
      const isJourneyObject =
        typeof customerJourneyTest === "object" && customerJourneyTest !== null;
      const journey = isJourneyObject ? (customerJourneyTest as CustomerJourneyTest) : null;
      const journeyTested = journey ? journey.steps.every((s) => s.status === "passed") : false;
      const journeyHasBlocked = journey ? journey.steps.some((s) => s.status === "blocked") : false;
      if (screenshotOutstanding) {
        blockers.push({
          id: "existing-site-backup",
          title: "Back up existing site before migrating",
          description:
            "You are replacing an existing website — take a screenshot/back-up of current DNS settings and content before changing. Why it matters: without a backup you cannot undo a bad change.",
          severity: "critical",
          relatedTaskId: findTaskId(tasks, ["take a screenshot of your current domain settings"]),
          relatedRoute: "/connect-domain",
          actionLabel: "Save backup",
        });
      }
      // Redirect check not directly modelled as task; use journey tested as proxy
      if (!journeyTested && !screenshotOutstanding && !pointOutstanding) {
        // Only add if backup done and DNS pointed but journey not fully tested
        if (!journeyHasBlocked) {
          const hasJourneyBlocker = blockers.some(
            (b) => b.id === "primary-action-test" || b.id.startsWith("customer-journey"),
          );
          if (!hasJourneyBlocker) {
            blockers.push({
              id: "existing-site-redirect-journey",
              title: "Test redirects and main customer action after migration",
              description:
                "After migration, confirm old links redirect and test your primary customer action end to end on a real phone — why it matters: broken redirects lose search traffic and customers.",
              severity: "important",
              relatedRoute: "/customer-journey",
              actionLabel: "Test after migration",
            });
          }
        }
      }
    }
  }

  // Status determination
  let status: LaunchReadiness["status"];
  if (!total) {
    status = "not_started";
  } else if (blockers.some((b) => b.severity === "critical")) {
    status = "blocked";
  } else if (completedRequiredTasks < totalRequiredTasks) {
    status = "nearly_ready";
  } else {
    status = "ready_for_review";
  }

  // Next recommended action — first critical blocker, else first important, else next incomplete required task
  let nextRecommendedAction: string | undefined;
  const firstCritical = blockers.find((b) => b.severity === "critical");
  const firstImportant = blockers.find((b) => b.severity === "important");
  if (firstCritical) nextRecommendedAction = firstCritical.actionLabel ?? firstCritical.title;
  else if (firstImportant)
    nextRecommendedAction = firstImportant.actionLabel ?? firstImportant.title;
  else {
    const nextRequired = requiredTasks.find((t) => t.status !== "complete");
    if (nextRequired) nextRecommendedAction = nextRequired.title;
    else {
      const nextAny = tasks.find((t) => t.status !== "complete");
      if (nextAny) nextRecommendedAction = nextAny.title;
    }
  }

  return {
    status,
    overallCompletionPercent,
    requiredCompletionPercent,
    completedRequiredTasks,
    totalRequiredTasks,
    blockers,
    nextRecommendedAction,
  };
}
