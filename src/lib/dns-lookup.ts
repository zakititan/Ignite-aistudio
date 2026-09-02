/**
 * DNS-over-HTTPS (DoH) Client & Domain Propagation Checker
 * Uses public DoH providers (Cloudflare & Google DNS) to query real-time DNS records.
 */

export interface DnsAnswer {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

export interface DnsResponse {
  Status: number; // 0 = NOERROR, 3 = NXDOMAIN, 2 = SERVFAIL
  TC: boolean;
  RD: boolean;
  RA: boolean;
  AD: boolean;
  CD: boolean;
  Question?: { name: string; type: number }[];
  Answer?: DnsAnswer[];
  Authority?: DnsAnswer[];
  Comment?: string;
}

export type DnsRecordType = "A" | "AAAA" | "CNAME" | "MX" | "TXT" | "NS" | "SOA" | "SRV";

const RECORD_TYPES: Record<DnsRecordType, number> = {
  A: 1,
  NS: 2,
  CNAME: 5,
  SOA: 6,
  MX: 15,
  TXT: 16,
  AAAA: 28,
  SRV: 33,
};

/**
 * Normalise user domain input
 */
export function normaliseDomain(input: string): string {
  let clean = input.trim().toLowerCase();
  clean = clean.replace(/^https?:\/\//, "");
  clean = clean.replace(/^www\./, "");
  clean = clean.replace(/\/.*$/, "");
  clean = clean.replace(/\.$/, "");
  return clean;
}

/**
 * Query DNS-over-HTTPS via Cloudflare or Google fallback
 */
export async function queryDoh(
  name: string,
  type: DnsRecordType,
  timeoutMs = 6000,
): Promise<{ success: boolean; data?: DnsResponse; error?: string; providerUsed?: string }> {
  const cleanName = name.trim().replace(/\.$/, "");

  // Provider 1: Cloudflare DoH (Fastest, standard JSON)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const cfUrl = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(cleanName)}&type=${type}`;
    const res = await fetch(cfUrl, {
      headers: { Accept: "application/dns-json" },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const json = (await res.json()) as DnsResponse;
      return { success: true, data: json, providerUsed: "Cloudflare 1.1.1.1" };
    }
  } catch {
    // Fallback to Google DNS DoH
  }

  // Provider 2: Google Public DNS DoH
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const googleUrl = `https://dns.google/resolve?name=${encodeURIComponent(cleanName)}&type=${type}`;
    const res = await fetch(googleUrl, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const json = (await res.json()) as DnsResponse;
      return { success: true, data: json, providerUsed: "Google 8.8.8.8" };
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to query DNS-over-HTTPS servers.",
    };
  }

  return { success: false, error: "No DNS response returned from public resolvers." };
}

export interface ParsedMxRecord {
  priority: number;
  host: string;
  raw: string;
}

export interface SpfAnalysis {
  raw?: string;
  isValid: boolean;
  status: "secure" | "warning" | "missing" | "misconfigured";
  includes: string[];
  allMechanism?: "~all" | "-all" | "?all" | "+all";
  detectedServices: string[];
  recommendation: string;
}

export interface DmarcAnalysis {
  raw?: string;
  isValid: boolean;
  status: "enforced" | "monitoring" | "missing" | "misconfigured";
  policy?: "none" | "quarantine" | "reject";
  rua?: string;
  ruf?: string;
  pct?: number;
  recommendation: string;
}

export interface DkimAnalysis {
  selectorChecked: string;
  found: boolean;
  type?: "TXT" | "CNAME";
  value?: string;
  status: "active" | "missing";
}

export interface DnsDiagnosticReport {
  domain: string;
  checkedAt: string;
  overallGrade: "A+" | "A" | "B" | "C" | "F";
  overallScore: number; // 0 - 100
  summary: string;
  // A / CNAME (Website)
  website: {
    resolves: boolean;
    records: { type: "A" | "AAAA" | "CNAME"; value: string; ttl: number }[];
    detectedHost?: string;
    status: "live" | "warning" | "offline";
    message: string;
  };
  // MX (Mail)
  mail: {
    hasMx: boolean;
    records: ParsedMxRecord[];
    detectedProvider?: string;
    status: "active" | "warning" | "missing";
    message: string;
  };
  // SPF
  spf: SpfAnalysis;
  // DMARC
  dmarc: DmarcAnalysis;
  // DKIM
  dkim: DkimAnalysis[];
  // Nameservers
  nameservers: {
    servers: string[];
    detectedProvider?: string;
  };
  rawResponses: Record<string, DnsResponse | undefined>;
}

/**
 * Detects known hosting platforms from IP or CNAME
 */
function detectHostingPlatform(records: { type: string; value: string }[]): string | undefined {
  for (const r of records) {
    const val = r.value.toLowerCase();
    if (val.includes("myshopify.com") || val === "23.227.38.65") return "Shopify";
    if (
      val.includes("squarespace") ||
      val.startsWith("198.185.159.") ||
      val.startsWith("198.49.23.")
    )
      return "Squarespace";
    if (val.includes("wixdns.net") || val.includes("wix") || val.startsWith("185.230.63."))
      return "Wix";
    if (val.includes("vercel-dns") || val === "76.76.21.21") return "Vercel";
    if (val.includes("netlify") || val === "75.2.60.5") return "Netlify";
    if (val.includes("wordpress") || val.includes("automattic")) return "WordPress.com";
    if (val.includes("cloudflare") || val.startsWith("104.21.") || val.startsWith("172.67."))
      return "Cloudflare Proxy";
    if (val.includes("github.io") || val.startsWith("185.199.")) return "GitHub Pages";
    if (val.includes("ghost.io")) return "Ghost";
    if (val.includes("webflow") || val === "75.2.70.75" || val === "99.83.190.102")
      return "Webflow";
  }
  return undefined;
}

/**
 * Detects email provider from MX records
 */
function detectEmailProvider(mxRecords: ParsedMxRecord[]): string | undefined {
  const hosts = mxRecords.map((m) => m.host.toLowerCase()).join(" ");
  if (hosts.includes("titan.email")) return "Titan Mail";
  if (
    hosts.includes("google.com") ||
    hosts.includes("googlemail.com") ||
    hosts.includes("aspmx.l.google.com")
  )
    return "Google Workspace (Gmail)";
  if (
    hosts.includes("outlook.com") ||
    hosts.includes("microsoft.com") ||
    hosts.includes("protection.outlook")
  )
    return "Microsoft 365 (Exchange)";
  if (hosts.includes("zoho.com") || hosts.includes("zoho.eu")) return "Zoho Mail";
  if (hosts.includes("fastmail.com") || hosts.includes("fmhosted.com")) return "Fastmail";
  if (
    hosts.includes("icloud.com") ||
    hosts.includes("mail.me.com") ||
    hosts.includes("icloudmailadmin")
  )
    return "Apple iCloud+ Mail";
  if (hosts.includes("secureserver.net")) return "GoDaddy Email";
  if (hosts.includes("privateemail.com")) return "Namecheap Private Email";
  if (hosts.includes("mailgun.org")) return "Mailgun";
  if (hosts.includes("sendgrid.net")) return "SendGrid";
  if (hosts.includes("protonmail.ch") || hosts.includes("proton.me")) return "Proton Mail";
  return undefined;
}

/**
 * Detects DNS provider from NS records
 */
function detectDnsProvider(nsServers: string[]): string | undefined {
  const text = nsServers.map((s) => s.toLowerCase()).join(" ");
  if (text.includes("cloudflare.com")) return "Cloudflare DNS";
  if (text.includes("domaincontrol.com")) return "GoDaddy DNS";
  if (text.includes("registrar-servers.com")) return "Namecheap DNS";
  if (text.includes("googledomains.com") || text.includes("cloud-dns")) return "Google Cloud DNS";
  if (text.includes("awsdns")) return "Amazon Route 53";
  if (text.includes("porkbun.com")) return "Porkbun DNS";
  if (text.includes("hover.com")) return "Hover DNS";
  if (text.includes("digitalocean.com")) return "DigitalOcean DNS";
  if (text.includes("dns-parking.com") || text.includes("hostinger.com")) return "Hostinger DNS";
  if (text.includes("bluehost.com")) return "Bluehost DNS";
  if (text.includes("siteground.net")) return "SiteGround DNS";
  return undefined;
}

/**
 * Parses raw MX data strings like "10 mx1.titan.email."
 */
function parseMxRecords(answers?: DnsAnswer[]): ParsedMxRecord[] {
  if (!answers || answers.length === 0) return [];
  const parsed: ParsedMxRecord[] = [];

  for (const a of answers) {
    if (a.type !== 15 && a.type !== RECORD_TYPES.MX) continue;
    const cleanData = a.data.trim().replace(/^"|"$/g, "");
    const parts = cleanData.split(/\s+/);
    if (parts.length >= 2) {
      const priority = parseInt(parts[0] || "0", 10);
      const host = parts.slice(1).join(" ").replace(/\.$/, "");
      parsed.push({ priority: isNaN(priority) ? 0 : priority, host, raw: a.data });
    } else {
      parsed.push({ priority: 10, host: cleanData.replace(/\.$/, ""), raw: a.data });
    }
  }

  return parsed.sort((a, b) => a.priority - b.priority);
}

/**
 * Analyses SPF record
 */
function analyzeSpf(txtAnswers?: DnsAnswer[]): SpfAnalysis {
  if (!txtAnswers || txtAnswers.length === 0) {
    return {
      isValid: false,
      status: "missing",
      includes: [],
      detectedServices: [],
      recommendation:
        "No SPF record detected. Create a TXT record with 'v=spf1 include:... ~all' to prevent spoofing.",
    };
  }

  const spfRecords: string[] = [];
  for (const a of txtAnswers) {
    const val = a.data.replace(/^"|"$/g, "").replace(/""/g, "");
    if (val.startsWith("v=spf1")) {
      spfRecords.push(val);
    }
  }

  if (spfRecords.length === 0) {
    return {
      isValid: false,
      status: "missing",
      includes: [],
      detectedServices: [],
      recommendation:
        "No SPF record found in TXT entries. Add an SPF TXT record for your business email provider.",
    };
  }

  if (spfRecords.length > 1) {
    return {
      raw: spfRecords.join(" | "),
      isValid: false,
      status: "misconfigured",
      includes: [],
      detectedServices: [],
      recommendation:
        "CRITICAL ERROR: Multiple SPF records found. RFC 7208 forbids having more than one SPF TXT record. Merge them into a single record.",
    };
  }

  const spf = spfRecords[0];
  if (!spf) {
    return {
      isValid: false,
      status: "missing",
      includes: [],
      detectedServices: [],
      recommendation: "No SPF record found.",
    };
  }
  const includes: string[] = [];
  const detectedServices: string[] = [];
  let allMechanism: "~all" | "-all" | "?all" | "+all" | undefined;

  const parts = spf.split(/\s+/);
  for (const part of parts) {
    if (part.startsWith("include:")) {
      const inc = part.replace("include:", "");
      includes.push(inc);
      if (inc.includes("titan.email")) detectedServices.push("Titan Mail");
      if (inc.includes("google.com")) detectedServices.push("Google Workspace");
      if (inc.includes("outlook.com")) detectedServices.push("Microsoft 365");
      if (inc.includes("zoho.com")) detectedServices.push("Zoho Mail");
      if (inc.includes("mailgun")) detectedServices.push("Mailgun");
      if (inc.includes("sendgrid")) detectedServices.push("SendGrid");
      if (inc.includes("amazonses")) detectedServices.push("Amazon SES");
      if (inc.includes("shopify")) detectedServices.push("Shopify");
      if (inc.includes("zendesk")) detectedServices.push("Zendesk");
    }
    if (part === "~all" || part === "-all" || part === "?all" || part === "+all") {
      allMechanism = part as "~all" | "-all" | "?all" | "+all";
    }
  }

  const isSecure = allMechanism === "~all" || allMechanism === "-all";

  return {
    raw: spf,
    isValid: true,
    status: isSecure ? "secure" : "warning",
    includes,
    allMechanism,
    detectedServices,
    recommendation: isSecure
      ? "SPF is active and properly configured with strict sender verification."
      : "SPF ends with permissive flag (" +
        (allMechanism || "+all") +
        "). Change to ~all (SoftFail) or -all (HardFail).",
  };
}

/**
 * Analyses DMARC record from `_dmarc.<domain>`
 */
function analyzeDmarc(dmarcAnswers?: DnsAnswer[]): DmarcAnalysis {
  if (!dmarcAnswers || dmarcAnswers.length === 0) {
    return {
      isValid: false,
      status: "missing",
      recommendation:
        "No DMARC record detected at _dmarc. Add 'v=DMARC1; p=quarantine; rua=mailto:...' to enforce anti-spoofing.",
    };
  }

  const records: string[] = [];
  for (const a of dmarcAnswers) {
    const val = a.data.replace(/^"|"$/g, "").replace(/""/g, "");
    if (val.startsWith("v=DMARC1")) {
      records.push(val);
    }
  }

  if (records.length === 0) {
    return {
      isValid: false,
      status: "missing",
      recommendation:
        "No v=DMARC1 record found at _dmarc hostname. Add a DMARC TXT record to meet 2025/2026 inbox sender requirements.",
    };
  }

  const dmarc = records[0];
  if (!dmarc) {
    return {
      isValid: false,
      status: "missing",
      recommendation: "No DMARC record found.",
    };
  }
  let policy: "none" | "quarantine" | "reject" | undefined;
  let rua: string | undefined;
  let ruf: string | undefined;
  let pct: number | undefined;

  const tags = dmarc.split(";").map((t) => t.trim());
  for (const tag of tags) {
    const [key, ...rest] = tag.split("=");
    const val = rest.join("=").trim();
    if (!key) continue;
    const cleanKey = key.trim().toLowerCase();

    if (cleanKey === "p") {
      if (val === "reject") policy = "reject";
      else if (val === "quarantine") policy = "quarantine";
      else policy = "none";
    }
    if (cleanKey === "rua") rua = val;
    if (cleanKey === "ruf") ruf = val;
    if (cleanKey === "pct") pct = parseInt(val, 10);
  }

  const isEnforced = policy === "quarantine" || policy === "reject";

  return {
    raw: dmarc,
    isValid: true,
    status: isEnforced ? "enforced" : "monitoring",
    policy,
    rua,
    ruf,
    pct,
    recommendation: isEnforced
      ? `DMARC is active with strong '${policy}' enforcement protection against unauthorized spoofers.`
      : "DMARC is set to 'p=none' (Monitoring mode). Outgoing emails are tracked but unauthorized spoofed emails are not blocked.",
  };
}

/**
 * Runs a full, comprehensive DNS diagnostic on a domain
 */
export async function checkFullDomainPropagation(
  domainInput: string,
  preferredProviderId?: string,
): Promise<DnsDiagnosticReport> {
  const domain = normaliseDomain(domainInput);
  const rawResponses: Record<string, DnsResponse | undefined> = {};

  // 1. Parallel DNS queries
  const [
    aRes,
    aaaaRes,
    cnameRes,
    wwwARes,
    mxRes,
    txtRes,
    dmarcRes,
    nsRes,
    dkimTitan1,
    dkimTitan2,
    dkimGoogle,
    dkimM365,
    dkimZoho,
    dkimFastmail,
  ] = await Promise.all([
    queryDoh(domain, "A"),
    queryDoh(domain, "AAAA"),
    queryDoh(domain, "CNAME"),
    queryDoh(`www.${domain}`, "A"),
    queryDoh(domain, "MX"),
    queryDoh(domain, "TXT"),
    queryDoh(`_dmarc.${domain}`, "TXT"),
    queryDoh(domain, "NS"),
    queryDoh(`titan1._domainkey.${domain}`, "TXT"),
    queryDoh(`titan2._domainkey.${domain}`, "TXT"),
    queryDoh(`google._domainkey.${domain}`, "TXT"),
    queryDoh(`selector1._domainkey.${domain}`, "TXT"),
    queryDoh(`zoho._domainkey.${domain}`, "TXT"),
    queryDoh(`fm1._domainkey.${domain}`, "TXT"),
  ]);

  rawResponses["A"] = aRes.data;
  rawResponses["MX"] = mxRes.data;
  rawResponses["TXT"] = txtRes.data;
  rawResponses["DMARC"] = dmarcRes.data;
  rawResponses["NS"] = nsRes.data;

  // Process A / CNAME
  const websiteRecords: { type: "A" | "AAAA" | "CNAME"; value: string; ttl: number }[] = [];
  if (aRes.data?.Answer) {
    for (const a of aRes.data.Answer) {
      if (a.type === 1) websiteRecords.push({ type: "A", value: a.data, ttl: a.TTL });
    }
  }
  if (aaaaRes.data?.Answer) {
    for (const a of aaaaRes.data.Answer) {
      if (a.type === 28) websiteRecords.push({ type: "AAAA", value: a.data, ttl: a.TTL });
    }
  }
  if (cnameRes.data?.Answer) {
    for (const a of cnameRes.data.Answer) {
      if (a.type === 5)
        websiteRecords.push({ type: "CNAME", value: a.data.replace(/\.$/, ""), ttl: a.TTL });
    }
  }
  if (wwwARes.data?.Answer) {
    for (const a of wwwARes.data.Answer) {
      if (a.type === 1 && !websiteRecords.some((r) => r.value === a.data)) {
        websiteRecords.push({ type: "A", value: `www -> ${a.data}`, ttl: a.TTL });
      }
    }
  }

  const websiteResolves = websiteRecords.length > 0;
  const detectedHost = detectHostingPlatform(websiteRecords);

  // Process MX
  const mxRecords = parseMxRecords(mxRes.data?.Answer);
  const hasMx = mxRecords.length > 0;
  const detectedMailProvider = detectEmailProvider(mxRecords);

  // Process SPF
  const spfAnalysis = analyzeSpf(txtRes.data?.Answer);

  // Process DMARC
  const dmarcAnalysis = analyzeDmarc(dmarcRes.data?.Answer);

  // Process Nameservers
  const nsServers = (nsRes.data?.Answer || [])
    .filter((a) => a.type === 2)
    .map((a) => a.data.replace(/\.$/, ""));
  const detectedDns = detectDnsProvider(nsServers);

  // Process DKIM selectors
  const dkimChecks: DkimAnalysis[] = [];
  if (dkimTitan1.data?.Answer && dkimTitan1.data.Answer.length > 0) {
    dkimChecks.push({
      selectorChecked: `titan1._domainkey.${domain}`,
      found: true,
      type: "TXT",
      value: dkimTitan1.data.Answer[0]?.data,
      status: "active",
    });
  }
  if (dkimTitan2.data?.Answer && dkimTitan2.data.Answer.length > 0) {
    dkimChecks.push({
      selectorChecked: `titan2._domainkey.${domain}`,
      found: true,
      type: "TXT",
      value: dkimTitan2.data.Answer[0]?.data,
      status: "active",
    });
  }
  if (dkimGoogle.data?.Answer && dkimGoogle.data.Answer.length > 0) {
    dkimChecks.push({
      selectorChecked: `google._domainkey.${domain}`,
      found: true,
      type: "TXT",
      value: dkimGoogle.data.Answer[0]?.data,
      status: "active",
    });
  }
  if (dkimM365.data?.Answer && dkimM365.data.Answer.length > 0) {
    dkimChecks.push({
      selectorChecked: `selector1._domainkey.${domain}`,
      found: true,
      type: "TXT",
      value: dkimM365.data.Answer[0]?.data,
      status: "active",
    });
  }
  if (dkimZoho.data?.Answer && dkimZoho.data.Answer.length > 0) {
    dkimChecks.push({
      selectorChecked: `zoho._domainkey.${domain}`,
      found: true,
      type: "TXT",
      value: dkimZoho.data.Answer[0]?.data,
      status: "active",
    });
  }
  if (dkimFastmail.data?.Answer && dkimFastmail.data.Answer.length > 0) {
    dkimChecks.push({
      selectorChecked: `fm1._domainkey.${domain}`,
      found: true,
      type: "TXT",
      value: dkimFastmail.data.Answer[0]?.data,
      status: "active",
    });
  }

  // Calculate Health Score (0 - 100)
  let score = 0;
  if (websiteResolves) score += 20;
  if (hasMx) score += 30;
  if (spfAnalysis.isValid) {
    if (spfAnalysis.status === "secure") score += 25;
    else score += 15;
  }
  if (dmarcAnalysis.isValid) {
    if (dmarcAnalysis.status === "enforced") score += 20;
    else score += 10;
  }
  if (dkimChecks.length > 0) score += 5;

  let overallGrade: "A+" | "A" | "B" | "C" | "F" = "F";
  if (score >= 90) overallGrade = "A+";
  else if (score >= 80) overallGrade = "A";
  else if (score >= 60) overallGrade = "B";
  else if (score >= 40) overallGrade = "C";
  else overallGrade = "F";

  let summary = "";
  if (overallGrade === "A+") {
    summary =
      "Superb setup! Website resolution, active MX mail routing, SPF authentication, and DMARC enforcement are all verified live.";
  } else if (overallGrade === "A") {
    summary =
      "Strong configuration. Mail servers and basic authentication are active. Consider upgrading DMARC to 'p=quarantine' or adding DKIM for perfection.";
  } else if (overallGrade === "B") {
    summary =
      "Basic email routing is active, but missing SPF or DMARC authentication puts your messages at risk of spam folders.";
  } else if (overallGrade === "C") {
    summary =
      "Partial DNS records found. Ensure your MX records and SPF TXT records are saved at your domain registrar.";
  } else {
    summary =
      "No active mail or web records detected. Ensure nameservers are assigned and DNS records have finished propagating (can take up to 24h).";
  }

  return {
    domain,
    checkedAt: new Date().toISOString(),
    overallGrade,
    overallScore: score,
    summary,
    website: {
      resolves: websiteResolves,
      records: websiteRecords,
      detectedHost,
      status: websiteResolves ? "live" : "offline",
      message: websiteResolves
        ? `Resolves to ${websiteRecords.length} record(s)${detectedHost ? ` on ${detectedHost}` : ""}.`
        : "No A or CNAME records found pointing your domain to a web server.",
    },
    mail: {
      hasMx,
      records: mxRecords,
      detectedProvider: detectedMailProvider,
      status: hasMx ? "active" : "missing",
      message: hasMx
        ? `${mxRecords.length} MX record(s) detected${detectedMailProvider ? ` (${detectedMailProvider})` : ""}.`
        : "No MX records found. Outbound or inbound business emails cannot function.",
    },
    spf: spfAnalysis,
    dmarc: dmarcAnalysis,
    dkim: dkimChecks,
    nameservers: {
      servers: nsServers,
      detectedProvider: detectedDns,
    },
    rawResponses,
  };
}
