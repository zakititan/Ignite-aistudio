import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const BOOTSTRAP_URL = "https://data.iana.org/rdap/dns.json";
const DOMAIN_PATTERN = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

// Some registries operate RDAP but have not published their endpoint in IANA's bootstrap directory.
// Keep this list intentionally small and verify every entry against the registry before adding it.
const RDAP_FALLBACKS: Record<string, string> = {
  co: "https://rdap.registry.co/co/",
};

type Bootstrap = {
  services: [string[], string[]][];
};

let bootstrapPromise: Promise<Bootstrap> | undefined;

function normaliseDomain(value: string) {
  return value.trim().toLowerCase().replace(/\.$/, "");
}

async function getBootstrap() {
  bootstrapPromise ??= fetch(BOOTSTRAP_URL, {
    headers: { Accept: "application/rdap+json, application/json" },
  }).then(async (response) => {
    if (!response.ok) throw new Error("The RDAP directory is unavailable.");
    return (await response.json()) as Bootstrap;
  });
  return bootstrapPromise;
}

async function getRdapBaseUrl(domain: string) {
  const tld = domain.split(".").at(-1);
  if (tld && RDAP_FALLBACKS[tld]) return RDAP_FALLBACKS[tld];
  const bootstrap = await getBootstrap();
  const service = bootstrap.services.find(([tlds]) =>
    tlds.some((entry) => entry.toLowerCase() === tld),
  );
  const baseUrl = service?.[1][0];
  if (!baseUrl) throw new Error("This domain ending is not supported by the RDAP directory.");
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}

export type DomainAvailabilityStatus =
  "available" | "registered" | "unknown" | "unsupported" | "rate_limited";

/**
 * RDAP checker — 5 explicit outcomes, no registrant data, no purchase.
 * - registered: 200 from RDAP
 * - available (Possibly available): 404 — no registration returned, confirm with registrar
 * - rate_limited: 429
 * - unsupported: TLD not in IANA bootstrap / RDAP directory
 * - unknown (Could not verify): other HTTP errors or fetch failure
 * Never returns registrant/personal data and never initiates purchase.
 */
export const checkDomainAvailability = createServerFn({ method: "GET" })
  .validator(z.object({ domain: z.string().trim().min(1).max(253) }))
  .handler(async ({ data }) => {
    const domain = normaliseDomain(data.domain);
    if (!DOMAIN_PATTERN.test(domain)) {
      return {
        domain,
        status: "unknown" as DomainAvailabilityStatus,
        message: "Enter a domain such as yourbusiness.com to check it.",
      };
    }

    let baseUrl: string;
    try {
      baseUrl = await getRdapBaseUrl(domain);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "";
      if (msg.toLowerCase().includes("not supported")) {
        return {
          domain,
          status: "unsupported" as DomainAvailabilityStatus,
          message:
            "This domain ending is not supported by the RDAP directory. Check with a registrar.",
        };
      }
      return {
        domain,
        status: "unknown" as DomainAvailabilityStatus,
        message: "The RDAP directory is unavailable. Try again shortly or check with a registrar.",
      };
    }

    try {
      const response = await fetch(new URL(`domain/${encodeURIComponent(domain)}`, baseUrl), {
        headers: { Accept: "application/rdap+json, application/json" },
        redirect: "follow",
      });

      if (response.status === 404) {
        return {
          domain,
          status: "available" as DomainAvailabilityStatus,
          message:
            "Possibly available — no registration was returned by the registry. Confirm price and complete registration with a registrar.",
        };
      }
      if (response.ok) {
        return {
          domain,
          status: "registered" as DomainAvailabilityStatus,
          message:
            "Registered — this domain is already registered according to the registry's RDAP service.",
        };
      }
      if (response.status === 429) {
        return {
          domain,
          status: "rate_limited" as DomainAvailabilityStatus,
          message:
            "Rate-limited — the registry asked us to slow down. Wait a minute and try again, or check with a registrar.",
        };
      }
      return {
        domain,
        status: "unknown" as DomainAvailabilityStatus,
        message:
          "Could not verify — the registry could not confirm availability right now. Try again shortly or check with a registrar.",
      };
    } catch {
      return {
        domain,
        status: "unknown" as DomainAvailabilityStatus,
        message:
          "Could not verify — the registry could not be reached. Try again shortly or check with a registrar.",
      };
    }
  });
