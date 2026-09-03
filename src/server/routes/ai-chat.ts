import { getAiConfig } from "@/lib/ai/config";
import { aiChatRequestSchema } from "@/lib/ai/schema";
import { getOrCreateSessionId, getClientIp, hashIp } from "@/lib/ai/session";
import { checkRateLimit } from "@/lib/ai/rate-limit";
import { callOpenAi } from "@/lib/ai/openai-provider";
import { errorResponse } from "@/lib/ai/errors";
import { minimizeContext } from "@/lib/ai/assistant-context";

export async function handleAiChat(request: Request): Promise<Response> {
  const start = Date.now();
  const requestId = Math.random().toString(36).slice(2, 10);

  if (request.method !== "POST") {
    return Response.json(errorResponse("INVALID_REQUEST", "Use POST."), { status: 405 });
  }

  const ct = request.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    return Response.json(
      errorResponse("INVALID_REQUEST", "Content-Type must be application/json"),
      { status: 400 },
    );
  }

  const rawBody = await request.text();
  if (rawBody.length > 16 * 1024) {
    return Response.json(errorResponse("INVALID_REQUEST", "Request body too large"), {
      status: 400,
    });
  }

  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    return Response.json(errorResponse("INVALID_REQUEST", "Invalid JSON"), { status: 400 });
  }

  let config;
  try {
    config = getAiConfig();
  } catch (e) {
    return Response.json(errorResponse("AI_DISABLED", (e as Error).message), { status: 503 });
  }

  if (!config.enabled) {
    return Response.json(
      errorResponse(
        "AI_DISABLED",
        "AI help is not available in this environment. You can still use Cornerstone's local guides.",
      ),
      { status: 503 },
    );
  }
  if (!config.apiKey) {
    return Response.json(errorResponse("AI_DISABLED", "AI help is not configured."), {
      status: 503,
    });
  }

  const parsed = aiChatRequestSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      errorResponse("INVALID_REQUEST", "Invalid request. Please check your message and try again."),
      { status: 400 },
    );
  }

  const { message, conversation, context } = parsed.data;

  const lower = message.toLowerCase();
  if (
    ["password", "recovery code", "api key", "card number", "cvv"].some((k) => lower.includes(k))
  ) {
    return Response.json(
      errorResponse(
        "SAFETY_BLOCKED",
        "Please do not enter passwords, recovery codes, payment details, or API keys.",
      ),
      { status: 400 },
    );
  }

  const { sessionId, setCookieHeader } = getOrCreateSessionId(request);
  const ip = getClientIp(request);
  const secret = config.sessionSecret || "dev-secret";
  const hashedIp = hashIp(ip, secret);

  const decision = await checkRateLimit(sessionId, hashedIp, config.projectDailyCap);
  if (!decision.allowed) {
    const headers: Record<string, string> = {
      "Retry-After": String(decision.retryAfterSeconds ?? 60),
      "Cache-Control": "no-store",
    };
    if (setCookieHeader) headers["Set-Cookie"] = setCookieHeader;
    return Response.json(
      errorResponse(
        "RATE_LIMITED",
        "You have reached the assistant limit for now. Please try again shortly, or use the related guide while you wait.",
        decision.retryAfterSeconds,
      ),
      {
        status: 429,
        headers,
      },
    );
  }

  const minimized = minimizeContext(context as unknown as import("@/lib/ai/types").AiContext);

  try {
    const result = await callOpenAi(
      message,
      minimized as unknown as Record<string, unknown>,
      conversation,
    );
    const headers: Record<string, string> = {};
    if (setCookieHeader) headers["Set-Cookie"] = setCookieHeader;

    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        requestId,
        route: context.currentRoute,
        outcome: "success",
        latencyMs: Date.now() - start,
        inputCharacters: message.length,
        outputCharacters: result.answer.length,
        model: config.model,
      }),
    );

    return Response.json(result, { headers });
  } catch (e) {
    const err = e as Error & { code?: string };
    const msg = err.message ?? "";

    if (msg.includes("timeout") || err.name === "AbortError") {
      return Response.json(
        errorResponse(
          "UPSTREAM_TIMEOUT",
          "The AI service took too long to respond. Please try again shortly.",
        ),
        { status: 504 },
      );
    }
    if (msg.includes("429") || msg.includes("rate limit")) {
      return Response.json(
        errorResponse(
          "UPSTREAM_RATE_LIMITED",
          "The AI service is temporarily busy. Please try again shortly.",
        ),
        { status: 429 },
      );
    }
    if (msg.includes("model") || msg.includes("configuration")) {
      return Response.json(errorResponse("INTERNAL_ERROR", "AI configuration error."), {
        status: 500,
      });
    }

    console.error(
      JSON.stringify({ requestId, outcome: "internal_error", latencyMs: Date.now() - start }),
    );
    return Response.json(
      errorResponse(
        "UPSTREAM_UNAVAILABLE",
        "The AI service is temporarily unavailable. Please try again shortly.",
      ),
      { status: 503 },
    );
  }
}
