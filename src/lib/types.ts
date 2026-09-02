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
  notes: string;
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
}
