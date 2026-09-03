import { z } from "zod";

const allowedRoutes = [
  "/",
  "/how-it-works",
  "/onboarding",
  "/dashboard",
  "/business-profile",
  "/domains",
  "/platform-matcher",
  "/cost-calculator",
  "/content",
  "/business-email",
  "/connect-domain",
  "/online-setup",
  "/customer-journey",
  "/checklist",
  "/preflight",
  "/launch-wizard",
  "/launch-dossier",
  "/ownership-record",
  "/security-drill",
  "/email-signature",
  "/review-kit",
  "/growth-toolkit",
  "/get-found",
  "/maintenance",
  "/learn",
  "/help",
  "/troubleshooting",
  "/glossary",
  "/hire-help",
  "/account",
  "/settings",
  "/create-account",
  "/sign-in",
  "/forgot-password",
  "/reset-password",
  "/delete-account",
  "/contact",
  "/privacy",
  "/terms",
  "/accessibility",
  "/status",
  "/changelog",
] as const;

export const aiChatRequestSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  conversation: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(1500),
      }),
    )
    .max(6)
    .optional(),
  context: z.object({
    currentRoute: z.string().refine((v) => (allowedRoutes as readonly string[]).includes(v), {
      message: "Invalid route",
    }),
    pageTitle: z.string().max(200).optional(),
    business: z
      .object({
        category: z.string().max(100).optional(),
        model: z.enum(["local", "online", "hybrid"]).optional(),
        primaryGoal: z.string().max(100).optional(),
        primaryCustomerAction: z.string().max(100).optional(),
        locationProvided: z.boolean().optional(),
        hasBusinessEmail: z.enum(["yes", "no", "unknown"]).optional(),
        websiteStatus: z.enum(["not_started", "draft", "live", "unknown"]).optional(),
        websiteProvider: z.string().max(100).optional(),
        emailProvider: z.string().max(100).optional(),
        domainStatus: z.enum(["none", "considering", "preferred", "purchased", "owned"]).optional(),
      })
      .optional(),
    readiness: z
      .object({
        status: z.string().max(50).optional(),
        requiredCompletionPercent: z.number().min(0).max(100).optional(),
        blockerTitles: z.array(z.string().max(120)).max(10).optional(),
      })
      .optional(),
    dns: z
      .object({
        impactLevel: z.enum(["low", "medium", "high"]).optional(),
        websiteChangePlanned: z.boolean().optional(),
        businessEmailAtRisk: z.boolean().optional(),
      })
      .optional(),
    customerJourney: z
      .object({
        type: z.string().max(50).optional(),
        status: z.enum(["not_tested", "passed", "needs_improvement", "blocked"]).optional(),
      })
      .optional(),
  }),
});

export const aiChatResponseSchema = z.object({
  answer: z.string().min(1).max(1800),
  recommendedAction: z
    .object({
      label: z.string().min(1).max(80),
      route: z.string().refine((v) => (allowedRoutes as readonly string[]).includes(v)),
      reason: z.string().min(1).max(200),
    })
    .optional(),
  safetyNotice: z.string().max(300).optional(),
  suggestedQuestions: z.array(z.string().min(1).max(120)).max(3).optional(),
});

export function isAllowedRoute(route: string): boolean {
  return (allowedRoutes as readonly string[]).includes(route);
}
