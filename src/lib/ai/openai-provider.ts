import { getAiConfig } from "./config";
import { SYSTEM_PROMPT, buildPromptWithContext } from "./prompt";
import { retrieveKbExcerpts } from "./knowledge-retrieval";
import type { AiChatResponse } from "./types";
import { aiChatResponseSchema } from "./schema";

function isDnsRelated(message: string, context: Record<string, unknown>): boolean {
  const text = `${message} ${JSON.stringify(context)}`.toLowerCase();
  return ["dns", "mx", "spf", "dkim", "dmarc", "cname", "migration", "record"].some((k) =>
    text.includes(k),
  );
}

export async function callOpenAi(
  message: string,
  context: Record<string, unknown>,
  conversation?: Array<{ role: "user" | "assistant"; content: string }>,
): Promise<AiChatResponse> {
  const config = getAiConfig();
  if (!config.apiKey) throw new Error("OPENAI_API_KEY not configured");

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

    const response = await client.chat.completions.create(
      {
        model: config.model,
        max_tokens: config.maxOutputTokens,
        messages,
        response_format: { type: "json_object" },
      } as unknown as Record<string, unknown>,
      { signal: controller.signal as unknown as AbortSignal },
    );

    const content = response.choices[0]?.message?.content ?? "";
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error("Invalid JSON from model");
    }

    const validated = aiChatResponseSchema.safeParse(parsed);
    if (!validated.success) {
      // Single repair retry with compact instruction
      const repairPrompt =
        "Fix JSON to match schema: answer 1-1800 chars, optional recommendedAction {label,route,reason} with allowed route, optional safetyNotice max 300, suggestedQuestions max 3 each max 120.";
      messages.push({ role: "assistant", content });
      messages.push({ role: "user", content: repairPrompt });
      const retry = await client.chat.completions.create(
        {
          model: config.model,
          max_tokens: config.maxOutputTokens,
          messages,
          response_format: { type: "json_object" },
        } as unknown as Record<string, unknown>,
        { signal: controller.signal as unknown as AbortSignal },
      );
      const retryContent = retry.choices[0]?.message?.content ?? "";
      const retryParsed = JSON.parse(retryContent);
      const retryValidated = aiChatResponseSchema.safeParse(retryParsed);
      if (!retryValidated.success) throw new Error("Schema validation failed after retry");
      return retryValidated.data as AiChatResponse;
    }

    return validated.data as AiChatResponse;
  } finally {
    clearTimeout(timeout);
  }
}
