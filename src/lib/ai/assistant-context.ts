import type { AiContext } from "./types";

export function buildAssistantContext(
  rawContext: unknown,
  maxChars = 6000,
): { context: AiContext; truncated: boolean } {
  // rawContext is already validated by schema, just trim if too large
  const json = JSON.stringify(rawContext);
  if (json.length <= maxChars) {
    return { context: rawContext as AiContext, truncated: false };
  }
  // Truncate blockerTitles if needed
  const ctx = rawContext as AiContext;
  if (ctx.readiness?.blockerTitles && ctx.readiness.blockerTitles.length > 5) {
    ctx.readiness.blockerTitles = ctx.readiness.blockerTitles.slice(0, 5);
  }
  const trimmed = JSON.stringify(ctx);
  if (trimmed.length <= maxChars) return { context: ctx, truncated: true };
  // Fallback: strip to minimal
  const minimal: AiContext = {
    currentRoute: ctx.currentRoute,
    business: ctx.business
      ? { category: ctx.business.category, model: ctx.business.model }
      : undefined,
    readiness: ctx.readiness ? { status: ctx.readiness.status } : undefined,
  };
  return { context: minimal, truncated: true };
}

export function minimizeContext(context: AiContext): AiContext {
  // Ensure only allowlisted compact fields
  return {
    currentRoute: context.currentRoute,
    pageTitle: context.pageTitle,
    business: context.business
      ? {
          category: context.business.category,
          model: context.business.model,
          primaryGoal: context.business.primaryGoal,
          primaryCustomerAction: context.business.primaryCustomerAction,
          locationProvided: context.business.locationProvided,
          hasBusinessEmail: context.business.hasBusinessEmail,
          websiteStatus: context.business.websiteStatus,
          websiteProvider: context.business.websiteProvider,
          emailProvider: context.business.emailProvider,
          domainStatus: context.business.domainStatus,
        }
      : undefined,
    readiness: context.readiness
      ? {
          status: context.readiness.status,
          requiredCompletionPercent: context.readiness.requiredCompletionPercent,
          blockerTitles: context.readiness.blockerTitles?.slice(0, 5),
        }
      : undefined,
    dns: context.dns,
    customerJourney: context.customerJourney,
  };
}
