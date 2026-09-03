import { createHmac, randomBytes } from "node:crypto";

const SESSION_COOKIE = "cornerstone_ai_session";
const MAX_AGE = 30 * 24 * 60 * 60; // 30 days

function sign(value: string, secret: string): string {
  const hmac = createHmac("sha256", secret).update(value).digest("hex");
  return `${value}.${hmac}`;
}

function verify(signed: string, secret: string): string | null {
  const idx = signed.lastIndexOf(".");
  if (idx === -1) return null;
  const value = signed.slice(0, idx);
  const sig = signed.slice(idx + 1);
  const expected = createHmac("sha256", secret).update(value).digest("hex");
  if (sig.length !== expected.length) return null;
  // constant-time compare
  let ok = 0;
  for (let i = 0; i < sig.length; i++) ok |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  return ok === 0 ? value : null;
}

export function getOrCreateSessionId(request: Request): {
  sessionId: string;
  setCookieHeader?: string;
} {
  const secret = process.env.AI_SESSION_SECRET || "dev-session-secret-not-for-production";
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, v.join("=")];
    }),
  );
  const existing = cookies[SESSION_COOKIE];
  if (existing) {
    const verified = verify(existing, secret);
    if (verified) return { sessionId: verified };
  }
  const newId = randomBytes(16).toString("hex");
  const signed = sign(newId, secret);
  const setCookieHeader = `${SESSION_COOKIE}=${signed}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${MAX_AGE}`;
  return { sessionId: newId, setCookieHeader };
}

export function hashIp(ip: string, secret: string): string {
  return createHmac("sha256", secret).update(ip).digest("hex").slice(0, 32);
}

export function getClientIp(request: Request): string {
  const xf = request.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() ?? "unknown";
  const xr = request.headers.get("x-real-ip");
  if (xr) return xr.trim();
  return "unknown";
}
