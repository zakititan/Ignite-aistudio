export type AiChatRole = "user" | "assistant";

export interface AiChatMessage {
  role: AiChatRole;
  content: string;
}

export interface AiBusinessContext {
  category?: string;
  model?: "local" | "online" | "hybrid";
  primaryGoal?: string;
  primaryCustomerAction?: string;
  locationProvided?: boolean;
  hasBusinessEmail?: "yes" | "no" | "unknown";
  websiteStatus?: "not_started" | "draft" | "live" | "unknown";
  websiteProvider?: string;
  emailProvider?: string;
  domainStatus?: "none" | "considering" | "preferred" | "purchased" | "owned";
}

export interface AiReadinessContext {
  status?: string;
  requiredCompletionPercent?: number;
  blockerTitles?: string[];
}

export interface AiDnsContext {
  impactLevel?: "low" | "medium" | "high";
  websiteChangePlanned?: boolean;
  businessEmailAtRisk?: boolean;
}

export interface AiCustomerJourneyContext {
  type?: string;
  status?: "not_tested" | "passed" | "needs_improvement" | "blocked";
}

export interface AiContext {
  currentRoute: string;
  pageTitle?: string;
  business?: AiBusinessContext;
  readiness?: AiReadinessContext;
  dns?: AiDnsContext;
  customerJourney?: AiCustomerJourneyContext;
}

export interface AiChatRequest {
  message: string;
  conversation?: AiChatMessage[];
  context: AiContext;
}

export type AiChatResponse = {
  answer: string;
  recommendedAction?: {
    label: string;
    route: string;
    reason: string;
  };
  safetyNotice?: string;
  suggestedQuestions?: string[];
};

export type AiErrorCode =
  | "INVALID_REQUEST"
  | "AI_DISABLED"
  | "RATE_LIMITED"
  | "AI_CAPACITY_LIMITED"
  | "UPSTREAM_RATE_LIMITED"
  | "UPSTREAM_TIMEOUT"
  | "UPSTREAM_UNAVAILABLE"
  | "SAFETY_BLOCKED"
  | "INTERNAL_ERROR";

export interface AiErrorResponse {
  error: {
    code: AiErrorCode;
    message: string;
    retryAfterSeconds?: number;
  };
}

export type AiMetricOutcome =
  | "success"
  | "invalid_request"
  | "rate_limited"
  | "provider_rate_limited"
  | "provider_timeout"
  | "provider_unavailable"
  | "safety_blocked"
  | "internal_error";

export interface AiChatMetric {
  timestamp: string;
  requestId: string;
  route: string;
  outcome: AiMetricOutcome;
  latencyMs: number;
  inputCharacters: number;
  outputCharacters?: number;
  model: "gpt-5.6-luna";
}

export type OpenAiProviderFailureKind =
  | "invalid_api_key"
  | "invalid_model"
  | "model_access_denied"
  | "unsupported_request"
  | "provider_rate_limited"
  | "provider_timeout"
  | "provider_unavailable"
  | "invalid_model_output"
  | "unknown_provider_error";

export class OpenAiProviderError extends Error {
  readonly kind: OpenAiProviderFailureKind;
  readonly status?: number;
  readonly providerCode?: string;

  constructor(
    kind: OpenAiProviderFailureKind,
    options?: { status?: number; providerCode?: string; cause?: unknown },
  ) {
    super(kind);
    this.name = "OpenAiProviderError";
    this.kind = kind;
    this.status = options?.status;
    this.providerCode = options?.providerCode;
  }
}
