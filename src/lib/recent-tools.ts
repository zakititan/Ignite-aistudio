import { ROUTE_HIERARCHY } from "./navigation-data";

const STORAGE_KEY = "lmbo.recently_used_tools.v1";

export interface RecentTool {
  path: string;
  label: string;
  group: string;
  visitedAt: number;
}

const EXCLUDED_PATHS = new Set(["/", "/onboarding", "/dashboard"]);

export function getRecentTools(): RecentTool[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentTool[];
    if (Array.isArray(parsed)) {
      return parsed
        .filter((item) => item && item.path && !EXCLUDED_PATHS.has(item.path))
        .slice(0, 5);
    }
  } catch {
    // Ignore storage issues
  }
  return [];
}

export function recordVisitedTool(path: string): void {
  if (typeof window === "undefined") return;
  if (EXCLUDED_PATHS.has(path)) return;

  const info = ROUTE_HIERARCHY[path];
  if (!info) return;

  try {
    const existing = getRecentTools().filter((item) => item.path !== path);
    const updated: RecentTool[] = [
      {
        path,
        label: info.label,
        group: info.group,
        visitedAt: Date.now(),
      },
      ...existing,
    ].slice(0, 5);

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("cornerstone:recent-tools-updated"));
  } catch {
    // Ignore storage quota
  }
}
