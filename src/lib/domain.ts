/**
 * Domain helper — generation + 0-10 scoring (educational, not a verdict).
 * No registrant data, no purchase.
 */

export interface DomainSuggestion {
  domain: string;
  why: string;
  bestFor: string;
}

export interface DomainScoreItem {
  label: string;
  value: number;
  hint: string;
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 28);

export function buildDomainSuggestions(
  name: string,
  category: string,
  city: string,
): DomainSuggestion[] {
  const base = slug(name);
  if (!base) return [];
  const short = base.length > 14 ? base.slice(0, 14) : base;
  const loc = slug(city.split(",")[0] ?? "");
  const trade = category.toLowerCase().includes("bakery")
    ? "bakery"
    : category.toLowerCase().includes("trades")
      ? "services"
      : category.toLowerCase().includes("salon")
        ? "studio"
        : category.toLowerCase().includes("clinic")
          ? "clinic"
          : category.toLowerCase().includes("retail")
            ? "shop"
            : "co";

  const out: DomainSuggestion[] = [
    {
      domain: `${base}.com`,
      why: "Exact business name. Easiest to say on the phone and print on a card.",
      bestFor: "Any business that already uses this name",
    },
    {
      domain: `${short}${trade}.com`,
      why: "Adds what you do, which helps people guess your address correctly.",
      bestFor: "Businesses with a common or abstract name",
    },
  ];
  if (loc)
    out.push({
      domain: `${short}${loc}.com`,
      why: "A location word can help when you serve one town or neighbourhood.",
      bestFor: "Local service businesses",
    });
  out.push(
    {
      domain: `${base}.co`,
      why: "A shorter alternative if the .com is taken. Still widely recognised.",
      bestFor: "Modern brands comfortable with a shorter ending",
    },
    {
      domain: `get${short}.com`,
      why: "An action word can rescue a taken name without hyphens or numbers.",
      bestFor: "Product or service brands",
    },
    {
      domain: `${short}${trade}.${loc ? "in" : "net"}`,
      why: "A country or general ending, useful when you mainly serve one market.",
      bestFor: "Businesses serving a single country",
    },
  );
  return out;
}

export function scoreDomain(domain: string, city: string): DomainScoreItem[] {
  const name = domain.split(".")[0] ?? "";
  const len = name.length;
  const hasHyphenOrNumber = /[-0-9]/.test(name);
  const loc = slug(city.split(",")[0] ?? "");
  const clarity = Math.max(2, Math.min(10, 12 - Math.floor(len / 3)));
  const memorability = Math.max(
    2,
    Math.min(10, 11 - Math.floor(len / 3) - (hasHyphenOrNumber ? 3 : 0)),
  );
  const spelling = hasHyphenOrNumber ? 4 : /(ph|kn|qu|xx|zz)/.test(name) ? 6 : 9;
  const local = loc && name.includes(loc) ? 9 : 5;
  const flexibility = /shop|store|cakes|plumb/.test(name) ? 5 : 8;
  const confusion = hasHyphenOrNumber ? 4 : len > 20 ? 5 : 9;
  return [
    {
      label: "Clarity",
      value: clarity,
      hint: "Can someone guess what your business does or is called?",
    },
    {
      label: "Memorability",
      value: memorability,
      hint: "Will a customer still remember it tomorrow?",
    },
    {
      label: "Ease of spelling",
      value: spelling,
      hint: "Can you say it once on the phone and be typed correctly?",
    },
    {
      label: "Local relevance",
      value: local,
      hint: "Does it signal the area you serve, when that helps?",
    },
    {
      label: "Brand flexibility",
      value: flexibility,
      hint: "Will it still fit if you add services later?",
    },
    {
      label: "Low confusion risk",
      value: confusion,
      hint: "Is it easy to mix up with another business or spelling?",
    },
  ];
}
