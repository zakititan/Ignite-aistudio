const REQUIRED_MODEL = "gpt-5.6-luna";

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const n = parseInt(value ?? "", 10);
  if (Number.isFinite(n) && n > 0) return n;
  return fallback;
}

export interface AiConfig {
  enabled: boolean;
  model: typeof REQUIRED_MODEL;
  apiKey: string | undefined;
  maxOutputTokens: number;
  timeoutMs: number;
  maxMessageCharacters: number;
  maxContextCharacters: number;
  sessionSecret: string | undefined;
  kvUrl: string | undefined;
  kvToken: string | undefined;
  projectDailyCap: number;
}

export function getAiConfig(): AiConfig {
  const enabled = process.env.AI_FEATURE_ENABLED === "true";
  const model = process.env.AI_MODEL || REQUIRED_MODEL;

  if (model !== REQUIRED_MODEL) {
    throw new Error("AI model configuration is not supported. Expected gpt-5.6-luna.");
  }

  return {
    enabled,
    model: REQUIRED_MODEL,
    apiKey: process.env.OPENAI_API_KEY,
    maxOutputTokens: parsePositiveInt(process.env.AI_MAX_OUTPUT_TOKENS, 500),
    timeoutMs: parsePositiveInt(process.env.AI_REQUEST_TIMEOUT_MS, 20_000),
    maxMessageCharacters: parsePositiveInt(process.env.AI_MAX_MESSAGE_CHARACTERS, 2_000),
    maxContextCharacters: parsePositiveInt(process.env.AI_MAX_CONTEXT_CHARACTERS, 6_000),
    sessionSecret: process.env.AI_SESSION_SECRET,
    kvUrl: process.env.KV_REST_API_URL,
    kvToken: process.env.KV_REST_API_TOKEN,
    projectDailyCap: parsePositiveInt(process.env.AI_PROJECT_DAILY_REQUEST_CAP, 2000),
  };
}

export function isAiEnabled(): boolean {
  try {
    const cfg = getAiConfig();
    return cfg.enabled && !!cfg.apiKey;
  } catch {
    return false;
  }
}
