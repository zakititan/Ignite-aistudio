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

export const checkDomainAvailability = createServerFn({ method: "GET" })
  .validator(z.object({ domain: z.string().trim().min(1).max(253) }))
  .handler(async ({ data }) => {
    const domain = normaliseDomain(data.domain);
    if (!DOMAIN_PATTERN.test(domain)) {
      return {
        domain,
        status: "unknown" as const,
        message: "Enter a domain such as yourbusiness.com to check it.",
      };
    }

    try {
      const baseUrl = await getRdapBaseUrl(domain);
      const response = await fetch(new URL(`domain/${encodeURIComponent(domain)}`, baseUrl), {
        headers: { Accept: "application/rdap+json, application/json" },
        redirect: "follow",
      });

      if (response.status === 404) {
        return {
          domain,
          status: "available" as const,
          message:
            "No registration was returned by the registry. Confirm price and complete registration with a registrar.",
        };
      }
      if (response.ok) {
        return {
          domain,
          status: "registered" as const,
          message: "This domain is already registered according to the registry's RDAP service.",
        };
      }
      return {
        domain,
        status: "unknown" as const,
        message:
          "The registry could not confirm availability right now. Try again shortly or check with a registrar.",
      };
    } catch {
      return {
        domain,
        status: "unknown" as const,
        message: "The registry could not be reached. Try again shortly or check with a registrar.",
      };
    }
  });
