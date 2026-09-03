import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Copy,
  Globe,
  Search,
  ShieldCheck,
  Download,
  Building2,
  Server,
  Route as RouteIcon,
  Lock,
  BookmarkPlus,
  Trash2,
  Star,
  Scale,
  Pencil,
  Check,
  Archive,
  XCircle,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Callout } from "@/components/Callouts";
import { GlossaryTooltip } from "@/components/GlossaryTooltip";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { checkDomainAvailability } from "@/lib/domain-availability.functions";
import type { DomainShortlistStatus, SavedDomainIdea } from "@/lib/types";
import {
  buildDomainSuggestions as buildSuggestions,
  scoreDomain,
} from "@/lib/domain";

export const Route = createFileRoute("/domains")({
  head: () => ({
    meta: [
      { title: "Domain finder and domain basics — Cornerstone" },
      {
        name: "description",
        content:
          "Generate web address ideas for your business, score them for clarity and memorability, and learn how domains, hosting and DNS fit together.",
      },
      { property: "og:title", content: "Find a web address your customers can remember" },
      {
        property: "og:description",
        content:
          "Domain name ideas, a plain-English scoring card, and a safety checklist so the address stays yours.",
      },
    ],
  }),
  component: DomainsPage,
});

interface Suggestion {
  domain: string;
  why: string;
  bestFor: string;
}

type Availability = Awaited<ReturnType<typeof checkDomainAvailability>>;

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 28);

function normaliseDomain(value: string) {
  return value.trim().toLowerCase().replace(/\.$/, "");
}

function buildScoreForSave(domain: string, city: string): SavedDomainIdea["score"] {
  const scores = scoreDomain(domain, city);
  const find = (label: string) => scores.find((s) => s.label === label)?.value ?? 5;
  return {
    clarity: find("Clarity"),
    memorability: find("Memorability"),
    spellingEase: find("Ease of spelling"),
    localRelevance: find("Local relevance"),
    brandFlexibility: find("Brand flexibility"),
  };
}

function formatCheckedAt(iso?: string) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function availabilityBadge(status?: string) {
  if (status === "available") return "Possibly available — confirm with a registrar";
  if (status === "registered") return "Registered";
  if (status === "unsupported") return "Unsupported — check with a registrar";
  if (status === "rate_limited") return "Rate-limited — try again shortly";
  return "Could not verify";
}

function statusLabel(status: DomainShortlistStatus) {
  switch (status) {
    case "considering":
      return "Considering";
    case "preferred":
      return "Preferred";
    case "backup":
      return "Backup";
    case "rejected":
      return "Rejected";
    case "purchased":
      return "Purchased";
    default:
      return status;
  }
}

const STATUS_OPTIONS: { value: DomainShortlistStatus; label: string }[] = [
  { value: "considering", label: "Considering" },
  { value: "preferred", label: "Preferred" },
  { value: "backup", label: "Backup" },
  { value: "rejected", label: "Rejected" },
  { value: "purchased", label: "Purchased" },
];

const BASICS = [
  { icon: Globe, term: "Domain", text: "Your web address, like yourbusiness.com." },
  { icon: Building2, term: "Website", text: "The pages visitors actually see and read." },
  { icon: Server, term: "Hosting", text: "The service that stores your site and delivers it." },
  {
    icon: RouteIcon,
    term: "DNS",
    text: "The settings that direct your address to the right services.",
  },
  {
    icon: ShieldCheck,
    term: "Registrar",
    text: "The company where you register and renew your address.",
  },
  { icon: Lock, term: "HTTPS", text: "The padlock that protects the connection to your site." },
];

const SAFETY = [
  "Register the domain in an account you personally or jointly control",
  "Use a business-controlled email address on the account",
  "Turn on two-step sign-in (2FA)",
  "Add a backup recovery method",
  "Turn on renewal reminders or auto-renewal",
  "Record the registrar, renewal date, login owner and recovery email",
  "Keep a second trusted owner or administrator with documented access",
  "Never share passwords through unsecured messages",
  "Review who has access before engaging a contractor",
];

function DomainsPage() {
  const {
    state,
    setBusiness,
    setOwnership,
    upsertSavedDomain,
    updateSavedDomain,
    removeSavedDomain,
    setSavedDomainStatus,
  } = useStore();
  const b = state.business;
  const [query, setQuery] = useState(b.businessName);
  const [submitted, setSubmitted] = useState(b.businessName);
  const [loading, setLoading] = useState(false);
  const [checkingDomains, setCheckingDomains] = useState<string[]>([]);
  const [availability, setAvailability] = useState<Record<string, Availability>>({});
  const [checked, setChecked] = useState<string[]>([]);
  const [scoreInput, setScoreInput] = useState(b.businessName ? `${slug(b.businessName)}.com` : "");

  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteValue, setEditingNoteValue] = useState("");

  const suggestions = useMemo(
    () => buildSuggestions(submitted, b.category, b.location),
    [submitted, b.category, b.location],
  );
  const scores = useMemo(() => scoreDomain(scoreInput, b.location), [scoreInput, b.location]);

  const shortlist = state.savedDomainIdeas ?? [];
  const preferred = shortlist.find((d) => d.status === "preferred");

  const checkAvailability = async (domain: string) => {
    setCheckingDomains((current) => [...new Set([...current, domain])]);
    try {
      const result = await checkDomainAvailability({ data: { domain } });
      setAvailability((current) => ({ ...current, [domain]: result }));
      // also update shortlist availability if domain is saved
      const normalised = normaliseDomain(domain);
      const existing = shortlist.find((s) => normaliseDomain(s.domain) === normalised);
      if (existing) {
        updateSavedDomain(existing.id, {
          availability: {
            status: result.status,
            checkedAt: new Date().toISOString(),
            message: result.message,
          },
        });
      }
      return result;
    } finally {
      setCheckingDomains((current) => current.filter((item) => item !== domain));
    }
  };

  const runSearch = async () => {
    if (!query.trim()) {
      toast.error("Enter your business name or idea to see suggestions.");
      return;
    }
    setLoading(true);
    setSubmitted(query);
    setScoreInput(`${slug(query)}.com`);
    setAvailability({});
    const ideas = buildSuggestions(query, b.category, b.location);
    await Promise.all(ideas.map((idea) => checkAvailability(idea.domain)));
    setLoading(false);
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Copied ${text}`);
    } catch {
      toast.error("We could not copy that just now. You can select and copy it manually.");
    }
  };

  const handleSave = (domain: string) => {
    const normalised = normaliseDomain(domain);
    const existing = shortlist.find((s) => normaliseDomain(s.domain) === normalised);
    const av = availability[domain];
    const score = buildScoreForSave(domain, b.location);
    const avail = av
      ? {
          status: av.status,
          checkedAt: new Date().toISOString(),
          message: av.message,
        }
      : existing?.availability;

    if (existing) {
      upsertSavedDomain(normalised, {
        score,
        availability: avail,
      });
      toast.success(`Updated ${normalised} in your shortlist.`);
      return;
    }
    upsertSavedDomain(normalised, {
      score,
      availability: avail,
      status: "considering",
    });
    toast.success(`Saved ${normalised} to your shortlist.`);
  };

  const handleSetStatus = (id: string, status: DomainShortlistStatus) => {
    const target = shortlist.find((s) => s.id === id);
    if (!target) return;
    if (status === "preferred" && preferred && preferred.id !== id) {
      toast.success(`Preferred switched to ${target.domain}. Only one preferred at a time.`);
    } else if (status === "preferred") {
      toast.success(`Marked ${target.domain} as preferred.`);
    } else {
      toast.success(`Marked ${target.domain} as ${statusLabel(status).toLowerCase()}.`);
    }
    setSavedDomainStatus(id, status);
  };

  const handleRemove = (id: string) => {
    const target = shortlist.find((s) => s.id === id);
    removeSavedDomain(id);
    setCompareIds((c) => c.filter((x) => x !== id));
    if (target) toast.success(`Removed ${target.domain} from shortlist.`);
  };

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 5) {
        toast.error("You can compare up to 5 domains at a time.");
        return prev;
      }
      return [...prev, id];
    });
  };

  const startEditNote = (item: SavedDomainIdea) => {
    setEditingNoteId(item.id);
    setEditingNoteValue(item.note ?? "");
  };

  const saveNote = () => {
    if (!editingNoteId) return;
    updateSavedDomain(editingNoteId, { note: editingNoteValue });
    toast.success("Note saved.");
    setEditingNoteId(null);
  };

  const hasPurchased = shortlist.some((s) => s.status === "purchased");

  const compareItems = shortlist.filter((s) => compareIds.includes(s.id));

  return (
    <AppShell
      title="Your web address"
      description="Find a name customers can remember — and keep it in your own name."
    >
      <div className="mb-2 flex flex-wrap items-center gap-2 rounded-lg border border-primary/20 bg-primary-soft/30 px-3 py-2 text-sm">
        <Link
          to="/online-setup"
          className="inline-flex items-center gap-1.5 font-medium text-primary underline-offset-4 hover:underline"
        >
          View setup map <ArrowRight className="size-3.5" aria-hidden="true" /> — see how your
          domain connects to website & email
        </Link>
        <span className="text-xs text-muted-foreground">Context workflow · no guesswork</span>
      </div>
      <Tabs defaultValue="find" className="space-y-6">
        <TabsList>
          <TabsTrigger value="find">Find a domain</TabsTrigger>
          <TabsTrigger value="own">I already own a domain</TabsTrigger>
        </TabsList>

        <TabsContent value="find" className="space-y-8">
          <section className="surface-panel p-5 sm:p-6">
            <Label htmlFor="domain-query" className="text-base">
              What is your business name or idea?
            </Label>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Input
                id="domain-query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runSearch()}
                placeholder="Harbor & Hearth Bakery"
              />
              <Button onClick={runSearch}>
                <Search className="size-4" aria-hidden="true" />
                Show ideas
              </Button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              We check the registry&apos;s public RDAP service for each suggestion. A registrar
              confirms the final price and completes registration.
            </p>
          </section>

          <Callout tone="warning" title="Check you are entitled to the name">
            Before registering, make sure using this name does not conflict with another business or
            trademark in your country. We cannot check that for you.
          </Callout>

          <section aria-labelledby="ideas">
            <h2 id="ideas" className="font-display text-xl font-bold">
              Domain ideas
            </h2>
            {loading ? (
              <div className="mt-4 space-y-3">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 rounded-xl" />
                ))}
              </div>
            ) : suggestions.length ? (
              <div className="surface-panel mt-4 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Domain idea</TableHead>
                      <TableHead className="hidden md:table-cell">Why it works</TableHead>
                      <TableHead className="hidden lg:table-cell">Best for</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suggestions.map((s) => {
                      const normalised = normaliseDomain(s.domain);
                      const saved = shortlist.find((d) => normaliseDomain(d.domain) === normalised);
                      const av = availability[s.domain];
                      return (
                        <TableRow key={s.domain}>
                          <TableCell className="font-medium">{s.domain}</TableCell>
                          <TableCell className="hidden max-w-xs text-sm text-muted-foreground md:table-cell">
                            {s.why}
                          </TableCell>
                          <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                            {s.bestFor}
                          </TableCell>
                          <TableCell>
                            {checkingDomains.includes(s.domain) ? (
                              <Badge variant="outline">Checking…</Badge>
                            ) : av ? (
                              <Badge
                                className={
                                  av.status === "available"
                                    ? "bg-success-soft text-success border-success/30"
                                    : av.status === "registered"
                                      ? "bg-destructive-soft text-destructive border-destructive/30"
                                      : "bg-warning-soft text-warning-foreground border-warning/30"
                                }
                                title={av.message}
                              >
                                {av.status === "available"
                                  ? "Possibly available — confirm with a registrar"
                                  : av.status === "registered"
                                    ? "Registered"
                                    : "Could not confirm"}
                              </Badge>
                            ) : (
                              <Badge variant="outline">Not checked</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <div className="flex flex-wrap items-center justify-end gap-1">
                              <Button size="sm" variant="ghost" onClick={() => copy(s.domain)}>
                                <Copy className="size-4" aria-hidden="true" />
                                <span className="sr-only sm:not-sr-only">Copy</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setScoreInput(s.domain)}
                              >
                                Score it
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => checkAvailability(s.domain)}
                                disabled={checkingDomains.includes(s.domain)}
                              >
                                Check live
                              </Button>
                              {!saved ? (
                                <Button size="sm" onClick={() => handleSave(s.domain)}>
                                  <BookmarkPlus className="size-4" aria-hidden="true" />
                                  Save to shortlist
                                </Button>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <Badge variant="outline" className="hidden sm:inline-flex">
                                    {statusLabel(saved.status)}
                                  </Badge>
                                  <Select
                                    value={saved.status}
                                    onValueChange={(v) =>
                                      handleSetStatus(saved.id, v as DomainShortlistStatus)
                                    }
                                  >
                                    <SelectTrigger className="h-8 w-[130px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {STATUS_OPTIONS.map((o) => (
                                        <SelectItem key={o.value} value={o.value}>
                                          {o.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleRemove(saved.id)}
                                    aria-label={`Remove ${saved.domain}`}
                                  >
                                    <Trash2 className="size-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                            {saved && (
                              <div className="mt-1 flex flex-wrap justify-end gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-xs"
                                  onClick={() => handleSetStatus(saved.id, "preferred")}
                                >
                                  <Star className="size-3" /> Preferred
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-xs"
                                  onClick={() => handleSetStatus(saved.id, "backup")}
                                >
                                  <Archive className="size-3" /> Backup
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-xs"
                                  onClick={() => handleSetStatus(saved.id, "purchased")}
                                >
                                  <ShoppingBag className="size-3" /> Purchased
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="mt-4">
                <EmptyState
                  icon={Search}
                  title="No results yet"
                  description="Try a shorter business name or add your category in Settings so we can tailor the ideas."
                />
              </div>
            )}
          </section>

          {/* Shortlist Section */}
          <section aria-labelledby="shortlist" className="surface-panel p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 id="shortlist" className="font-display text-xl font-bold">
                  Your domain shortlist
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Save ideas you like. Mark one as preferred, keep backups, and compare side by
                  side. Only one preferred at a time.
                </p>
              </div>
              {shortlist.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {compareIds.length} selected
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={compareIds.length < 2}
                    onClick={() => setShowCompare(true)}
                  >
                    <Scale className="size-4" aria-hidden="true" />
                    Compare ({compareIds.length})
                  </Button>
                  {compareIds.length > 0 && (
                    <Button size="sm" variant="ghost" onClick={() => setCompareIds([])}>
                      Clear
                    </Button>
                  )}
                </div>
              )}
            </div>

            {shortlist.length === 0 ? (
              <div className="mt-6">
                <EmptyState
                  icon={BookmarkPlus}
                  title="No saved domains yet"
                  description="Use 'Save to shortlist' on any idea above. Your shortlist stays on this device and works in light, dark, or system theme."
                />
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Tip: RDAP checks show “Possibly available — confirm with a registrar” — not a
                  guarantee. A registrar confirms the final price.
                </p>
              </div>
            ) : (
              <>
                <div className="mt-4 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">Compare</TableHead>
                        <TableHead>Domain</TableHead>
                        <TableHead>Current status</TableHead>
                        <TableHead>RDAP result + checkedAt</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Note preview</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {shortlist.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Checkbox
                              checked={compareIds.includes(item.id)}
                              onCheckedChange={() => toggleCompare(item.id)}
                              aria-label={`Select ${item.domain} for comparison`}
                            />
                          </TableCell>
                          <TableCell className="font-medium whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {item.domain}
                              {item.status === "preferred" && (
                                <Star
                                  className="size-4 shrink-0 text-amber-500"
                                  aria-hidden="true"
                                />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={item.status}
                              onValueChange={(v) =>
                                handleSetStatus(item.id, v as DomainShortlistStatus)
                              }
                            >
                              <SelectTrigger className="h-8 w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {STATUS_OPTIONS.map((o) => (
                                  <SelectItem key={o.value} value={o.value}>
                                    {o.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-sm">
                            <div className="flex flex-col gap-1">
                              <Badge
                                variant="outline"
                                className={
                                  item.availability?.status === "available"
                                    ? "bg-success-soft text-success border-success/30 w-fit"
                                    : item.availability?.status === "registered"
                                      ? "bg-destructive-soft text-destructive border-destructive/30 w-fit"
                                      : "w-fit"
                                }
                              >
                                {availabilityBadge(item.availability?.status)}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {item.availability?.checkedAt
                                  ? formatCheckedAt(item.availability.checkedAt)
                                  : "Not checked yet"}
                              </span>
                              {item.availability?.message && (
                                <span
                                  className="max-w-[200px] text-xs text-muted-foreground line-clamp-2"
                                  title={item.availability.message}
                                >
                                  {item.availability.message}
                                </span>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-fit px-2 text-xs"
                                onClick={() => checkAvailability(item.domain)}
                                disabled={checkingDomains.includes(item.domain)}
                              >
                                {checkingDomains.includes(item.domain) ? "Checking…" : "Check live"}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm whitespace-nowrap">
                            {item.score ? (
                              <div className="space-y-1 text-xs">
                                <div>Clarity {item.score.clarity}/10</div>
                                <div>Memorability {item.score.memorability}/10</div>
                                <div>Spelling {item.score.spellingEase}/10</div>
                                <div>Local {item.score.localRelevance}/10</div>
                                <div>Flexibility {item.score.brandFlexibility}/10</div>
                                <div className="font-semibold">
                                  Avg{" "}
                                  {(
                                    (item.score.clarity +
                                      item.score.memorability +
                                      item.score.spellingEase +
                                      item.score.localRelevance +
                                      item.score.brandFlexibility) /
                                    5
                                  ).toFixed(1)}
                                  /10
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="max-w-[180px]">
                            {editingNoteId === item.id ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={editingNoteValue}
                                  onChange={(e) => setEditingNoteValue(e.target.value)}
                                  placeholder="Why you like it, who it's for, concerns…"
                                  rows={3}
                                  className="text-sm"
                                />
                                <div className="flex gap-1">
                                  <Button size="sm" onClick={saveNote}>
                                    <Check className="size-3" /> Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingNoteId(null)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <p className="line-clamp-2 text-sm text-muted-foreground">
                                  {item.note ? (
                                    item.note
                                  ) : (
                                    <span className="italic">No note yet</span>
                                  )}
                                </p>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-xs"
                                  onClick={() => startEditNote(item)}
                                >
                                  <Pencil className="size-3" aria-hidden="true" />
                                  {item.note ? "Edit note" : "Add note"}
                                </Button>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <div className="flex flex-wrap justify-end gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleCompare(item.id)}
                                aria-label={`Compare ${item.domain}`}
                              >
                                <Scale className="size-4" />
                                <span className="hidden sm:inline">
                                  {compareIds.includes(item.id) ? "Selected" : "Compare"}
                                </span>
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemove(item.id)}
                              >
                                <Trash2 className="size-4" />
                                Remove
                              </Button>
                            </div>
                            <div className="mt-1 flex flex-wrap justify-end gap-1">
                              <Button
                                size="sm"
                                variant={item.status === "preferred" ? "default" : "outline"}
                                className="h-7 px-2 text-xs"
                                onClick={() => handleSetStatus(item.id, "preferred")}
                              >
                                Preferred
                              </Button>
                              <Button
                                size="sm"
                                variant={item.status === "backup" ? "default" : "outline"}
                                className="h-7 px-2 text-xs"
                                onClick={() => handleSetStatus(item.id, "backup")}
                              >
                                Backup
                              </Button>
                              <Button
                                size="sm"
                                variant={item.status === "purchased" ? "default" : "outline"}
                                className="h-7 px-2 text-xs"
                                onClick={() => handleSetStatus(item.id, "purchased")}
                              >
                                Purchased
                              </Button>
                              <Button
                                size="sm"
                                variant={item.status === "rejected" ? "default" : "outline"}
                                className="h-7 px-2 text-xs"
                                onClick={() => handleSetStatus(item.id, "rejected")}
                              >
                                <XCircle className="size-3" /> Rejected
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile cards fallback */}
                <div className="mt-4 grid gap-3 sm:hidden">
                  {shortlist.map((item) => (
                    <div key={`${item.id}-card`} className="rounded-xl border p-4">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium break-all">{item.domain}</span>
                        <Badge variant="outline">{statusLabel(item.status)}</Badge>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {availabilityBadge(item.availability?.status)} •{" "}
                        {item.availability?.checkedAt
                          ? formatCheckedAt(item.availability.checkedAt)
                          : "Not checked"}
                      </p>
                      {item.score && (
                        <p className="mt-1 text-xs">
                          Score avg{" "}
                          {(
                            (item.score.clarity +
                              item.score.memorability +
                              item.score.spellingEase +
                              item.score.localRelevance +
                              item.score.brandFlexibility) /
                            5
                          ).toFixed(1)}
                          /10
                        </p>
                      )}
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {item.note ?? "No note"}
                      </p>
                    </div>
                  ))}
                </div>

                {hasPurchased && (
                  <Callout
                    tone="success"
                    title="Great—record where you bought it and connect it"
                    className="mt-4"
                  >
                    <p className="text-sm leading-relaxed">
                      Great—record where you bought it and keep your ownership details up to date.
                      Then connect the domain to your website.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button asChild size="sm">
                        <Link to="/ownership-record">Go to ownership record</Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link to="/connect-domain">Go to connect domain</Link>
                      </Button>
                    </div>
                  </Callout>
                )}

                <p className="mt-3 text-xs text-muted-foreground">
                  “Possibly available — confirm with a registrar” means the registry returned no
                  registration, but only a registrar can guarantee price and complete the purchase.
                  We do not provide purchase links.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to="/business-profile">Use in Business profile →</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/dashboard">Check readiness</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/ownership-record">Update ownership record</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/hire-help">Prepare handoff brief →</Link>
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Shortlist feeds your preferred domain in Business profile, readiness checks,
                  ownership record and hire-help brief.
                </p>
              </>
            )}
          </section>

          {/* Comparison Dialog */}
          <Dialog open={showCompare} onOpenChange={setShowCompare}>
            <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Compare domains</DialogTitle>
                <DialogDescription>
                  Side-by-side comparison of up to 5 saved domains. Plain-English helpers explain
                  each criterion.
                </DialogDescription>
              </DialogHeader>
              {compareItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Select at least 2 domains to compare.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[160px]">Criteria</TableHead>
                        {compareItems.map((item) => (
                          <TableHead key={item.id} className="min-w-[180px] whitespace-nowrap">
                            {item.domain}
                            <div className="text-xs font-normal text-muted-foreground">
                              {statusLabel(item.status)}
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">
                          Domain
                          <div className="text-xs font-normal text-muted-foreground">
                            The exact web address you would register.
                          </div>
                        </TableCell>
                        {compareItems.map((item) => (
                          <TableCell key={item.id} className="font-mono text-sm">
                            {item.domain}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Status
                          <div className="text-xs font-normal text-muted-foreground">
                            Your decision: considering, preferred (only one), backup, rejected,
                            purchased.
                          </div>
                        </TableCell>
                        {compareItems.map((item) => (
                          <TableCell key={item.id}>
                            <Badge variant="outline">{statusLabel(item.status)}</Badge>
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          RDAP outcome
                          <div className="text-xs font-normal text-muted-foreground">
                            What the registry’s RDAP service returned. “Possibly available — confirm
                            with a registrar” is not a guarantee.
                          </div>
                        </TableCell>
                        {compareItems.map((item) => (
                          <TableCell key={item.id} className="text-sm">
                            <div>{availabilityBadge(item.availability?.status)}</div>
                            {item.availability?.message && (
                              <div className="text-xs text-muted-foreground">
                                {item.availability.message}
                              </div>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Last checked
                          <div className="text-xs font-normal text-muted-foreground">
                            When we last asked the registry. Re-check before buying.
                          </div>
                        </TableCell>
                        {compareItems.map((item) => (
                          <TableCell key={item.id} className="text-sm">
                            {item.availability?.checkedAt
                              ? formatCheckedAt(item.availability.checkedAt)
                              : "—"}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Score breakdown
                          <div className="text-xs font-normal text-muted-foreground">
                            Guide only: clarity, memorability, spelling ease, local relevance, brand
                            flexibility. Hover in Domain name score for helpers.
                          </div>
                        </TableCell>
                        {compareItems.map((item) => (
                          <TableCell key={item.id} className="text-xs">
                            {item.score ? (
                              <ul className="space-y-1">
                                <li>
                                  Clarity: {item.score.clarity}/10 — can someone guess your
                                  business?
                                </li>
                                <li>
                                  Memorability: {item.score.memorability}/10 — will they remember
                                  tomorrow?
                                </li>
                                <li>
                                  Spelling ease: {item.score.spellingEase}/10 — can it be typed
                                  after hearing once?
                                </li>
                                <li>
                                  Local relevance: {item.score.localRelevance}/10 — does it signal
                                  your area?
                                </li>
                                <li>
                                  Brand flexibility: {item.score.brandFlexibility}/10 — will it fit
                                  if you add services?
                                </li>
                              </ul>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Notes
                          <div className="text-xs font-normal text-muted-foreground">
                            Your private notes about fit, concerns, or next steps.
                          </div>
                        </TableCell>
                        {compareItems.map((item) => (
                          <TableCell key={item.id} className="text-sm">
                            {item.note ? (
                              item.note
                            ) : (
                              <span className="italic text-muted-foreground">No note</span>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <section aria-labelledby="score" className="surface-panel p-5 sm:p-6">
            <h2 id="score" className="font-display text-xl font-bold">
              Domain name score
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              A guide, not a verdict. Hover any label for a plain-English explanation.
            </p>
            <div className="mt-4 max-w-sm">
              <Label htmlFor="score-input">Domain to score</Label>
              <Input
                id="score-input"
                className="mt-1.5"
                value={scoreInput}
                onChange={(e) => setScoreInput(e.target.value)}
                placeholder="yourbusiness.com"
              />
            </div>
            <TooltipProvider delayDuration={150}>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {scores.map((s) => (
                  <li key={s.label}>
                    <div className="flex items-center justify-between text-sm">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="cursor-help font-medium underline decoration-dotted underline-offset-4"
                          >
                            {s.label}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">{s.hint}</TooltipContent>
                      </Tooltip>
                      <span className="font-semibold">{s.value}/10</span>
                    </div>
                    <Progress
                      value={s.value * 10}
                      className="mt-1.5"
                      aria-label={`${s.label} ${s.value} out of 10`}
                    />
                  </li>
                ))}
              </ul>
            </TooltipProvider>
          </section>

          <section aria-labelledby="basics">
            <h2 id="basics" className="font-display text-xl font-bold">
              The six words worth knowing
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {BASICS.map((c) => (
                <div key={c.term} className="surface-panel p-5">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <c.icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-3 font-display text-base font-semibold">{c.term}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{c.text}</p>
                </div>
              ))}
            </div>
            <Callout tone="info" title="A simple way to picture it" className="mt-4">
              Your domain is your street address. Hosting is the building. DNS is the directory that
              tells visitors where to go.
            </Callout>
          </section>

          <section aria-labelledby="safety" className="surface-panel p-5 sm:p-6">
            <h2 id="safety" className="font-display text-xl font-bold">
              Domain safety checklist
            </h2>
            <ul className="mt-4 space-y-2.5">
              {SAFETY.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Checkbox
                    id={`safety-${item}`}
                    checked={checked.includes(item)}
                    onCheckedChange={() =>
                      setChecked((c) =>
                        c.includes(item) ? c.filter((x) => x !== item) : [...c, item],
                      )
                    }
                    className="mt-0.5"
                  />
                  <Label htmlFor={`safety-${item}`} className="text-sm font-normal">
                    {item}
                  </Label>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              {checked.length} of {SAFETY.length} complete. Keep this account in your control — it
              is part of your business infrastructure.
            </p>
          </section>

          <OwnershipRecordCard />
        </TabsContent>

        <TabsContent value="own" className="space-y-6">
          <Callout tone="info" title="Good news — the hardest purchase decision is behind you">
            The focus now is confirming you control the account, protecting it, and pointing it at
            your new website without breaking email.
          </Callout>
          <section className="surface-panel space-y-5 p-5 sm:p-6">
            <div className="space-y-2">
              <Label htmlFor="owned">Your web address</Label>
              <Input
                id="owned"
                value={b.ownedDomain}
                onChange={(e) => setBusiness({ ownedDomain: e.target.value })}
                placeholder="yourbusiness.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg">Where did you buy it?</Label>
              <Input
                id="reg"
                value={b.registrarName}
                onChange={(e) => {
                  setBusiness({ registrarName: e.target.value });
                  setOwnership({ domainRegistrar: e.target.value });
                }}
                placeholder="The company you pay each year"
              />
            </div>
            <Button
              onClick={() => toast.success("Saved to your plan.")}
              disabled={!b.ownedDomain.trim()}
            >
              Save domain details
            </Button>
          </section>
          <OwnershipRecordCard />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function OwnershipRecordCard() {
  const { state, setOwnership } = useStore();
  const o = state.ownership;
  const fields: [keyof typeof o, string][] = [
    ["domainRegistrar", "Domain registrar"],
    ["renewalDate", "Domain renewal date"],
    ["dnsProvider", "DNS provider"],
    ["websitePlatform", "Website platform / hosting"],
    ["emailProvider", "Email provider"],
    ["analyticsAccount", "Analytics account"],
    ["paymentProcessor", "Payment processor"],
    ["socialOwners", "Social-media account owners"],
    ["recoveryOwner", "Login / recovery owner"],
  ];

  return (
    <section aria-labelledby="record" className="surface-panel p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="record" className="font-display text-xl font-bold">
            Business digital ownership record
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Never store passwords or recovery codes here. Record who owns what, not how to get in.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            window.print();
            toast.success("Opening a print-friendly copy.");
          }}
        >
          <Download className="size-4" aria-hidden="true" />
          Print / save as PDF
        </Button>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {fields.map(([key, label]) => (
          <div key={key} className="space-y-1.5">
            <Label htmlFor={`own-${key}`}>{label}</Label>
            <Input
              id={`own-${key}`}
              value={o[key]}
              onChange={(e) => setOwnership({ [key]: e.target.value } as never)}
              placeholder="—"
            />
          </div>
        ))}
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="own-notes">Notes</Label>
          <Textarea
            id="own-notes"
            rows={3}
            value={o.notes}
            onChange={(e) => setOwnership({ notes: e.target.value })}
            placeholder="Who to contact, where the record is stored, and when it was last reviewed."
          />
        </div>
      </div>
      <Button className="mt-4" onClick={() => toast.success("Ownership record saved.")}>
        Save record
      </Button>
    </section>
  );
}
