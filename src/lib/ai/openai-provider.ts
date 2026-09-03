import { getAiConfig } from "./config";
import { SYSTEM_PROMPT, buildPromptWithContext } from "./prompt";
import { retrieveKbExcerpts } from "./knowledge-retrieval";
import type { AiChatResponse } from "./types";
import { aiChatResponseSchema } from "./schema";
import { OpenAiProviderError } from "./types";

function isDnsRelated(message: string, context: Record<string, unknown>): boolean {
  const text = `${message} ${JSON.stringify(context)}`.toLowerCase();
  return ["dns", "mx", "spf", "dkim", "dmarc", "cname", "migration", "record"].some((k) =>
    text.includes(k),
  );
}

function classifyOpenAiError(error: unknown): OpenAiProviderError {
  const candidate = error as {
    status?: unknown;
    statusCode?: unknown;
    code?: unknown;
    type?: unknown;
    name?: unknown;
    message?: unknown;
  };
  const status =
    typeof candidate.status === "number"
      ? candidate.status
      : typeof candidate.statusCode === "number"
        ? candidate.statusCode
        : undefined;
  const code = typeof candidate.code === "string" ? candidate.code : undefined;
  const type = typeof candidate.type === "string" ? candidate.type : undefined;
  const name = typeof candidate.name === "string" ? candidate.name : undefined;
  const message = typeof candidate.message === "string" ? candidate.message : "";

  if (name === "AbortError" || /abort|timeout/i.test(message)) {
    return new OpenAiProviderError("provider_timeout", { status, providerCode: code });
  }
  if (status === 401 || code === "invalid_api_key" || type === "authentication_error") {
    return new OpenAiProviderError("invalid_api_key", { status, providerCode: code });
  }
  if (status === 429) {
    return new OpenAiProviderError("provider_rate_limited", { status, providerCode: code });
  }
  if (
    code === "model_not_found" ||
    code === "invalid_model" ||
    /model.*(not found|does not exist|not available|unsupported)/i.test(message)
  ) {
    return new OpenAiProviderError("invalid_model", { status, providerCode: code });
  }
  if (status === 403 || /not authorized|does not have access|permission/i.test(message)) {
    return new OpenAiProviderError("model_access_denied", { status, providerCode: code });
  }
  if (
    status === 400 &&
    (/response_format/i.test(message) ||
      /max_tokens/i.test(message) ||
      /unsupported parameter/i.test(message) ||
      /unknown parameter/i.test(message) ||
      /chat completions/i.test(message))
  ) {
    return new OpenAiProviderError("unsupported_request", { status, providerCode: code });
  }
  if (status !== undefined && status >= 500) {
    return new OpenAiProviderError("provider_unavailable", { status, providerCode: code });
  }
  return new OpenAiProviderError("unknown_provider_error", { status, providerCode: code });
}

export async function callOpenAi(
  message: string,
  context: Record<string, unknown>,
  conversation?: Array<{ role: "user" | "assistant"; content: string }>,
): Promise<AiChatResponse> {
  const config = getAiConfig();
  if (!config.apiKey) throw new OpenAiProviderError("invalid_api_key");

  const kbExcerpts = retrieveKbExcerpts(message, 2500);
  const dnsRelated = isDnsRelated(message, context);
  const systemPrompt = buildPromptWithContext(context, kbExcerpts, dnsRelated);

  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: systemPrompt },
  ];
  if (conversation) {
    for (const turn of conversation.slice(-6)) {
      messages.push({ role: turn.role, content: turn.content.slice(0, 1500) });
    }
  }
  messages.push({ role: "user", content: message.slice(0, 2000) });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey: config.apiKey });

    // Compatibility-safe request: try minimal, then with output limit, then with structured output
    const tryCreate = async (opts: Record<string, unknown>) => {
      try {
        return await client.chat.completions.create(
          opts as never,
          { signal: controller.signal as unknown as AbortSignal } as never,
        );
      } catch (e) {
        throw classifyOpenAiError(e);
      }
    };

    let response;
    try {
      // Step A: minimal + output limit + json_object
      response = await tryCreate({
        model: config.model,
        max_completion_tokens: config.maxOutputTokens,
        messages,
        response_format: { type: "json_object" },
      });
    } catch (e) {
      const err = e as OpenAiProviderError;
      if (err.kind === "unsupported_request") {
        // Step B: try without response_format, with max_completion_tokens
        try {
          response = await tryCreate({
            model: config.model,
            max_completion_tokens: config.maxOutputTokens,
            messages,
          });
        } catch (e2) {
          const err2 = e2 as OpenAiProviderError;
          if (err2.kind === "unsupported_request") {
            // Step C: fallback to legacy max_tokens
            response = await tryCreate({
              model: config.model,
              max_tokens: config.maxOutputTokens,
              messages,
            });
          } else {
            throw e2;
          }
        }
      } else {
        throw e;
      }
    }

    const content =
      (response as { choices: Array<{ message: { content: string | null } }> }).choices[0]?.message
        ?.content ?? "";
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new OpenAiProviderError("invalid_model_output");
    }

    const validated = aiChatResponseSchema.safeParse(parsed);
    if (!validated.success) {
      const repairPrompt =
        "Fix JSON to match schema: answer 1-1800 chars, optional recommendedAction {label,route,reason} with allowed route, optional safetyNotice max 300, suggestedQuestions max 3 each max 120.";
      messages.push({ role: "assistant", content });
      messages.push({ role: "user", content: repairPrompt });
      let retry: unknown;
      try {
        retry = await tryCreate({
          model: config.model,
          max_completion_tokens: config.maxOutputTokens,
          messages,
          response_format: { type: "json_object" },
        });
      } catch {
        // On retry failure, classify
        throw new OpenAiProviderError("invalid_model_output");
      }
      const retryContent =
        (retry as { choices: Array<{ message: { content: string | null } }> }).choices[0]?.message
          ?.content ?? "";
      let retryParsed: unknown;
      try {
        retryParsed = JSON.parse(retryContent);
      } catch {
        throw new OpenAiProviderError("invalid_model_output");
      }
      const retryValidated = aiChatResponseSchema.safeParse(retryParsed);
      if (!retryValidated.success) throw new OpenAiProviderError("invalid_model_output");
      return retryValidated.data as AiChatResponse;
    }

    return validated.data as AiChatResponse;
  } catch (e) {
    if (e instanceof OpenAiProviderError) throw e;
    throw classifyOpenAiError(e);
  } finally {
    clearTimeout(timeout);
  }
}
