export type CustomerModel = "local" | "online" | "both";
export type Confidence = "yes" | "no" | "unsure";
export type TechComfort = "beginner" | "comfortable" | "confident";
export type Importance = "required" | "recommended" | "optional";
export type TaskStatus = "todo" | "in_progress" | "complete";

export type PhaseKey = "plan" | "domain" | "setup" | "build" | "connect" | "launch" | "grow";

export interface BusinessProfile {
  businessName: string;
  category: string;
  description: string;
  location: string;
  customerModel: CustomerModel | "";
  hasPhysicalLocation: boolean;
  servesAtCustomerLocation: boolean;
  hasBusinessHours: boolean;
  primaryGoal: string;
  currentStatus: string;
  ownedDomain: string;
  registrarName: string;
  hasRegistrarAccess: Confidence | "";
  hasRecoveryEmailAccess: Confidence | "";
  needs: string[];
  setupBudget: string;
  monthlyBudget: string;
  timeline: string;
  buildPreference: string;
  techComfort: TechComfort | "";
  wantsSelfUpdate: Confidence | "";
  brandAssets: string[];
  needsContentHelp: Confidence | "";
  needsBusinessEmail: Confidence | "";
  // Phase 4: unified business profile extensions
  targetCustomers: string;
  servicesOffered: string;
  differentiator: string;
  address: string;
  serviceAreas: string;
  hoursDetail: string;
  deliveryNotes: string;
  primaryCustomerAction: CustomerJourneyType | "";
  phone: string;
  whatsappNumber: string;
  businessEmail: string;
  contactFormUrl: string;
  bookingUrl: string;
  storeUrl: string;
  preferredContactMethod: string;
  logoAvailable: Confidence | "";
  brandColors: string;
  photoReady: Confidence | "";
  testimonialsAvailable: Confidence | "";
  qualifications: string;
  socialLinks: string;
  policiesNeeded: string[];
  websiteApproach: string;
  preferredDomain: string;
  domainPurchased: Confidence | "";
  existingWebsiteStatus: string;
  businessEmailStatus: string;
  // Phase: online presence map extensions (minimal new fields, reuse where possible)
  websiteUrl?: string;
  websiteUrlStatus?: "not_added" | "draft" | "live";
  dnsProvider?: string;
  websiteProvider?: string;
  usesBusinessEmail?: Confidence | "";
  emailStatus?: string;
  websiteChangePlanned?: Confidence | "";
  existingWebsitePresent?: Confidence | "";
  dnsScreenshotSaved?: Confidence | "";
  hasExactProviderRecords?: Confidence | "";
}

export interface LaunchTask {
  id: string;
  phase: PhaseKey;
  category: string;
  title: string;
  description: string;
  importance: Importance;
  estimatedMinutes: number;
  status: TaskStatus;
  notes: string;
  assignedTo: string;
  completedAt: string | null;
  /** A URL, confirmation code, or short note explaining how this was checked. */
  evidence?: string;
  custom?: boolean;
}

export interface MaintenanceTask {
  id: string;
  title: string;
  recurrence: "weekly" | "monthly" | "quarterly" | "yearly";
  nextDue: string;
  status: "pending" | "done" | "snoozed";
  notes: string;
}

export interface ContentDraft {
  pageType: string;
  fields: Record<string, string>;
  updatedAt: string;
}

export interface DomainRecordEntry {
  id: string;
  type: string;
  host: string;
  value: string;
  purpose: string;
  added: boolean;
}

export interface OwnershipRecord {
  domainRegistrar: string;
  renewalDate: string;
  dnsProvider: string;
  websitePlatform: string;
  emailProvider: string;
  analyticsAccount: string;
  paymentProcessor: string;
  socialOwners: string;
  recoveryOwner: string;
  registrarAccountEmail: string;
  lastReviewedAt: string;
  notes: string;
}

export type OwnershipHealth = "at_risk" | "needs_attention" | "documented" | "review_due";

export const OWNERSHIP_HEALTH_LABEL: Record<OwnershipHealth, string> = {
  at_risk: "At risk",
  needs_attention: "Needs attention",
  documented: "Documented",
  review_due: "Review due",
};

export type ReadinessStatus = "not_started" | "blocked" | "nearly_ready" | "ready_for_review";
export type LaunchBlockerSeverity = "critical" | "important";

export interface LaunchBlocker {
  id: string;
  title: string;
  description: string;
  severity: LaunchBlockerSeverity;
  relatedTaskId?: string | undefined;
  relatedRoute?: string | undefined;
  actionLabel?: string | undefined;
}

export interface LaunchReadiness {
  status: ReadinessStatus;
  overallCompletionPercent: number;
  requiredCompletionPercent: number;
  completedRequiredTasks: number;
  totalRequiredTasks: number;
  blockers: LaunchBlocker[];
  nextRecommendedAction?: string | undefined;
}

export type CustomerJourneyType =
  | "phone_call"
  | "whatsapp_message"
  | "contact_form"
  | "booking"
  | "online_purchase"
  | "visit_location"
  | "newsletter_signup"
  | "custom";

export type JourneyStepStatus = "not_tested" | "passed" | "needs_improvement" | "blocked";

export interface CustomerJourneyStepResult {
  id: string;
  label: string;
  status: JourneyStepStatus;
  note?: string | undefined;
}

export interface CustomerJourneyTest {
  journeyType: CustomerJourneyType;
  customJourneyLabel?: string | undefined;
  steps: CustomerJourneyStepResult[];
  lastUpdatedAt: string;
  completedAt?: string | null | undefined;
  /** Optional evidence — no sensitive data. */
  testDate?: string | undefined;
  deviceBrowser?: string | undefined;
  testWebsiteUrl?: string | undefined;
  whatYouVerified?: string | undefined;
  confirmationReference?: string | undefined;
}

export type DomainShortlistStatus =
  "considering" | "preferred" | "backup" | "rejected" | "purchased";

export interface SavedDomainIdea {
  id: string;
  domain: string;
  status: DomainShortlistStatus;
  note?: string | undefined;
  score?:
    | {
        clarity: number;
        memorability: number;
        spellingEase: number;
        localRelevance: number;
        brandFlexibility: number;
      }
    | undefined;
  availability?:
    | {
        status: "available" | "registered" | "unknown" | "unsupported" | "rate_limited";
        checkedAt: string;
        message?: string | undefined;
      }
    | undefined;
  createdAt: string;
  updatedAt: string;
}

export type PresenceAreaId =
  "domain" | "website" | "email" | "dns" | "customer_action" | "ownership" | "local_presence";

export type PresenceAreaStatus =
  | "not_started"
  | "needs_information"
  | "planned"
  | "in_progress"
  | "needs_attention"
  | "ready_for_review"
  | "complete";

export interface PresenceStatusArea {
  id: PresenceAreaId;
  label: string;
  description: string;
  status: PresenceAreaStatus;
  statusLabel: string;
  summary: string;
  relatedRoute: string;
  actionLabel: string;
  priority: number;
  blockers?: string[] | undefined;
  lastVerifiedAt?: string | undefined;
  evidence?: string | undefined;
}

export type DnsImpactLevel = "low" | "medium" | "high";

export interface DnsImpactPreview {
  level: DnsImpactLevel;
  title: string;
  summary: string;
  websiteChangeExpected: boolean;
  emailAtRisk: boolean;
  existingWebsiteAtRisk: boolean;
  requiredBeforeChange: string[];
  recordsToPreserve: string[];
  recommendedNextStep: { label: string; route: string };
}

export interface DnsPlanningState {
  websiteChangeType: "first" | "replacing" | "unsure";
  usesBusinessEmail: "yes" | "no" | "not_sure";
  dnsProviderLocation: string;
  screenshotSaved: "yes" | "not_yet" | "unsure";
  hasExactRecords: "yes" | "not_yet" | "preset";
}

export interface AppState {
  onboardingComplete: boolean;
  onboardingStep: number;
  business: BusinessProfile;
  tasks: LaunchTask[];
  maintenance: MaintenanceTask[];
  drafts: Record<string, ContentDraft>;
  ownership: OwnershipRecord;
  dnsRecords: DomainRecordEntry[];
  completedArticles: string[];
  account: { signedIn: boolean; fullName: string; email: string };
  customerJourneyTest?: CustomerJourneyTest | undefined;
  savedDomainIdeas: SavedDomainIdea[];
  /** Opt-in only. Signals never leave this browser. */
  localInsightsConsent?: boolean;
  dnsPlanning?: DnsPlanningState | undefined;
}
