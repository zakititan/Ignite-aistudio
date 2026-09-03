import type { AiErrorCode } from "./types";

export function errorResponse(code: AiErrorCode, message: string, retryAfterSeconds?: number) {
  return {
    error: {
      code,
      message,
      ...(retryAfterSeconds !== undefined ? { retryAfterSeconds } : {}),
    },
  };
}

export const ERROR_MESSAGES: Record<AiErrorCode, string> = {
  INVALID_REQUEST: "Your request could not be understood. Please try rephrasing.",
  AI_DISABLED:
    "AI help is not available in this environment. You can still use Cornerstone's local guides.",
  RATE_LIMITED:
    "You have reached the assistant limit for now. Please try again shortly, or use the related guide while you wait.",
  AI_CAPACITY_LIMITED: "The assistant is temporarily at capacity. Please try again shortly.",
  UPSTREAM_RATE_LIMITED: "The AI service is temporarily busy. Please try again shortly.",
  UPSTREAM_TIMEOUT: "The AI service took too long to respond. Please try again shortly.",
  UPSTREAM_UNAVAILABLE: "The AI service is temporarily unavailable. Please try again shortly.",
  SAFETY_BLOCKED: "That request cannot be processed as written. Please try rephrasing.",
  INTERNAL_ERROR: "Something went wrong. Please try again shortly.",
};
