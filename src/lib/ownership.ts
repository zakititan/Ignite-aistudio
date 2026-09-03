import type { OwnershipHealth, OwnershipRecord } from "./types";
import { OWNERSHIP_HEALTH_LABEL } from "./types";

export function getOwnershipHealth(record: OwnershipRecord): {
  health: OwnershipHealth;
  label: string;
  summary: string;
} {
  const criticalMissing =
    !record.domainRegistrar.trim() ||
    !record.renewalDate.trim() ||
    !record.recoveryOwner.trim();

  if (criticalMissing) {
    return {
      health: "at_risk",
      label: OWNERSHIP_HEALTH_LABEL.at_risk,
      summary: "Critical custody fields missing — domain, renewal or recovery owner.",
    };
  }

  const renewalDateStr = record.renewalDate.trim();
  const lastReviewedStr = record.lastReviewedAt.trim();

  // Review due if renewal is within 60 days or last reviewed > 90 days ago
  const now = new Date();
  let renewalDueSoon = false;
  if (/^\d{4}-\d{2}-\d{2}$/.test(renewalDateStr)) {
    const renewal = new Date(`${renewalDateStr}T00:00:00Z`);
    const diffDays = (renewal.getTime() - now.getTime()) / 86400000;
    if (diffDays >= 0 && diffDays <= 60) renewalDueSoon = true;
    if (diffDays < 0) renewalDueSoon = true; // already expired -> review due
  }

  let reviewOverdue = false;
  if (/^\d{4}-\d{2}-\d{2}$/.test(lastReviewedStr)) {
    const last = new Date(`${lastReviewedStr}T00:00:00Z`);
    const diff = (now.getTime() - last.getTime()) / 86400000;
    if (diff > 90) reviewOverdue = true;
  } else if (!lastReviewedStr) {
    // if never reviewed but otherwise documented, flag as review due after 90 days of creation? treat as needs_attention
    reviewOverdue = false;
  }

  if (renewalDueSoon || reviewOverdue) {
    return {
      health: "review_due",
      label: OWNERSHIP_HEALTH_LABEL.review_due,
      summary: renewalDueSoon
        ? "Renewal date is near or past — verify auto-renew and payment."
        : "Ownership record not reviewed in over 90 days — verify contacts.",
    };
  }

  const fields: (keyof OwnershipRecord)[] = [
    "domainRegistrar",
    "renewalDate",
    "dnsProvider",
    "websitePlatform",
    "emailProvider",
    "analyticsAccount",
    "paymentProcessor",
    "socialOwners",
    "recoveryOwner",
    "registrarAccountEmail",
    "lastReviewedAt",
  ];
  const filled = fields.filter((k) => (record[k] ?? "").toString().trim().length > 0).length;
  const total = fields.length; // 11
  const ratio = filled / total;

  if (ratio >= 0.8) {
    return {
      health: "documented",
      label: OWNERSHIP_HEALTH_LABEL.documented,
      summary: `${filled}/${total} fields documented and critical assets secured.`,
    };
  }

  return {
    health: "needs_attention",
    label: OWNERSHIP_HEALTH_LABEL.needs_attention,
    summary: `${filled}/${total} fields complete — add missing providers and review date.`,
  };
}
