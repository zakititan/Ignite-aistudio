export type RateLimitDecision = {
  allowed: boolean;
  reason?: "burst" | "short_window" | "hourly" | "daily" | "ip_guard" | "project_capacity";
  retryAfterSeconds?: number;
};

const burstMap = new Map<string, number[]>();
const fiveMinMap = new Map<string, number[]>();
const hourMap = new Map<string, number[]>();
const dayMap = new Map<string, number[]>();
const ipMinuteMap = new Map<string, number[]>();
const ipHourMap = new Map<string, number[]>();
const ipDayMap = new Map<string, number[]>();
let projectDailyCount = 0;
let projectDayKey = new Date().toISOString().slice(0, 10);

function prune(arr: number[], windowMs: number): number[] {
  const now = Date.now();
  return arr.filter((t) => now - t < windowMs);
}

function checkAndAdd(
  map: Map<string, number[]>,
  key: string,
  windowMs: number,
  limit: number,
): { allowed: boolean; retryAfter?: number } {
  const arr = prune(map.get(key) ?? [], windowMs);
  if (arr.length >= limit) {
    const oldest = Math.min(...arr);
    const retry = Math.ceil((oldest + windowMs - Date.now()) / 1000);
    map.set(key, arr);
    return { allowed: false, retryAfter: Math.max(1, retry) };
  }
  arr.push(Date.now());
  map.set(key, arr);
  return { allowed: true };
}

export async function checkRateLimit(
  sessionId: string,
  hashedIp: string,
  projectCap: number,
): Promise<RateLimitDecision> {
  // Try Redis if configured
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;
  if (kvUrl && kvToken) {
    try {
      const { Redis } = await import("@upstash/redis");
      const { Ratelimit } = await import("@upstash/ratelimit");
      const redis = new Redis({ url: kvUrl, token: kvToken });
      // Use Upstash Ratelimit for burst + hourly
      const burst = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(2, "20 s"),
        prefix: "cornerstone:ai:burst",
      });
      const short = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "5 m"),
        prefix: "cornerstone:ai:5m",
      });
      const hourly = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, "1 h"),
        prefix: "cornerstone:ai:hour",
      });
      const daily = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(30, "24 h"),
        prefix: "cornerstone:ai:day",
      });

      for (const [limiter, reason] of [
        [burst, "burst"],
        [short, "short_window"],
        [hourly, "hourly"],
        [daily, "daily"],
      ] as const) {
        const res = await (
          limiter as unknown as {
            limit: (id: string) => Promise<{ success: boolean; reset: number }>;
          }
        ).limit(sessionId);
        if (!res.success) {
          const retry = Math.ceil((res.reset - Date.now()) / 1000);
          return { allowed: false, reason, retryAfterSeconds: Math.max(1, retry) };
        }
      }

      // IP guards
      const ipMin = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "1 m"),
        prefix: "cornerstone:ai:ipmin",
      });
      const ipHr = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(60, "1 h"),
        prefix: "cornerstone:ai:iphr",
      });
      const ipDy = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(150, "24 h"),
        prefix: "cornerstone:ai:ipday",
      });
      for (const [limiter, reason] of [
        [ipMin, "ip_guard"],
        [ipHr, "ip_guard"],
        [ipDy, "ip_guard"],
      ] as const) {
        const res = await (
          limiter as unknown as {
            limit: (id: string) => Promise<{ success: boolean; reset: number }>;
          }
        ).limit(hashedIp);
        if (!res.success) {
          const retry = Math.ceil((res.reset - Date.now()) / 1000);
          return { allowed: false, reason, retryAfterSeconds: Math.max(1, retry) };
        }
      }

      // Project cap
      const today = new Date().toISOString().slice(0, 10);
      const projKey = `cornerstone:ai:project:day:${today}`;
      const count = (await redis.incr(projKey)) as number;
      if (count === 1) await redis.expire(projKey, 86400);
      if (count > projectCap) {
        return { allowed: false, reason: "project_capacity", retryAfterSeconds: 3600 };
      }

      return { allowed: true };
    } catch {
      // Fall through to in-memory
    }
  }

  // In-memory fallback
  const dayKey = new Date().toISOString().slice(0, 10);
  if (dayKey !== projectDayKey) {
    projectDayKey = dayKey;
    projectDailyCount = 0;
  }
  projectDailyCount++;
  if (projectDailyCount > projectCap) {
    return { allowed: false, reason: "project_capacity", retryAfterSeconds: 3600 };
  }

  let res = checkAndAdd(burstMap, sessionId, 20_000, 2);
  if (!res.allowed) return { allowed: false, reason: "burst", retryAfterSeconds: res.retryAfter };
  res = checkAndAdd(fiveMinMap, sessionId, 5 * 60_000, 5);
  if (!res.allowed)
    return { allowed: false, reason: "short_window", retryAfterSeconds: res.retryAfter };
  res = checkAndAdd(hourMap, sessionId, 60 * 60_000, 20);
  if (!res.allowed) return { allowed: false, reason: "hourly", retryAfterSeconds: res.retryAfter };
  res = checkAndAdd(dayMap, sessionId, 24 * 60 * 60_000, 30);
  if (!res.allowed) return { allowed: false, reason: "daily", retryAfterSeconds: res.retryAfter };

  res = checkAndAdd(ipMinuteMap, hashedIp, 60_000, 10);
  if (!res.allowed)
    return { allowed: false, reason: "ip_guard", retryAfterSeconds: res.retryAfter };
  res = checkAndAdd(ipHourMap, hashedIp, 60 * 60_000, 60);
  if (!res.allowed)
    return { allowed: false, reason: "ip_guard", retryAfterSeconds: res.retryAfter };
  res = checkAndAdd(ipDayMap, hashedIp, 24 * 60 * 60_000, 150);
  if (!res.allowed)
    return { allowed: false, reason: "ip_guard", retryAfterSeconds: res.retryAfter };

  return { allowed: true };
}

export function _resetRateLimitForTests(): void {
  burstMap.clear();
  fiveMinMap.clear();
  hourMap.clear();
  dayMap.clear();
  ipMinuteMap.clear();
  ipHourMap.clear();
  ipDayMap.clear();
  projectDailyCount = 0;
  projectDayKey = new Date().toISOString().slice(0, 10);
}
