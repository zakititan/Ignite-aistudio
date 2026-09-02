import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AppState,
  BusinessProfile,
  ContentDraft,
  CustomerJourneyTest,
  DnsPlanningState,
  DomainShortlistStatus,
  LaunchTask,
  MaintenanceTask,
  OwnershipRecord,
  SavedDomainIdea,
  TaskStatus,
} from "./types";
import { defaultDnsPlanning, demoState, emptyState, generateTasks } from "./plan";

function normaliseDomain(value: string) {
  return value.trim().toLowerCase().replace(/\.$/, "");
}

const STORAGE_KEY = "lmbo.state.v1";

interface StoreValue {
  state: AppState;
  hydrated: boolean;
  hasPlan: boolean;
  lastSavedAt: Date | null;
  saveStatus: "saved" | "saving";
  setBusiness: (patch: Partial<BusinessProfile>) => void;
  updateBusinessProfileField: <K extends keyof BusinessProfile>(
    field: K,
    value: BusinessProfile[K],
  ) => void;
  setOnboardingStep: (step: number) => void;
  generatePlan: () => void;
  loadDemo: () => void;
  resetAll: () => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  updateTask: (id: string, patch: Partial<LaunchTask>) => void;
  addTask: (task: Omit<LaunchTask, "id">) => void;
  updateMaintenance: (id: string, patch: Partial<MaintenanceTask>) => void;
  saveDraft: (pageType: string, fields: Record<string, string>) => void;
  setOwnership: (patch: Partial<OwnershipRecord>) => void;
  toggleArticle: (slug: string) => void;
  signIn: (fullName: string, email: string) => void;
  signOut: () => void;
  setCustomerJourneyTest: (test: CustomerJourneyTest | undefined) => void;
  updateCustomerJourneyStep: (
    id: string,
    patch: Partial<import("./types").CustomerJourneyStepResult>,
  ) => void;
  upsertSavedDomain: (
    domain: string,
    opts?: {
      score?: SavedDomainIdea["score"];
      availability?: SavedDomainIdea["availability"];
      note?: string;
      status?: DomainShortlistStatus;
    },
  ) => void;
  updateSavedDomain: (
    id: string,
    patch: Partial<Omit<SavedDomainIdea, "id" | "createdAt">>,
  ) => void;
  removeSavedDomain: (id: string) => void;
  setSavedDomainStatus: (id: string, status: DomainShortlistStatus) => void;
  restoreBackup: (backup: unknown) => boolean;
  setLocalInsightsConsent: (allowed: boolean) => void;
  setDnsPlanning: (patch: Partial<DnsPlanningState>) => void;
  updateDnsPlanningField: <K extends keyof DnsPlanningState>(
    field: K,
    value: DnsPlanningState[K],
  ) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => emptyState());
  const [hydrated, setHydrated] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AppState> & {
          domainShortlist?: SavedDomainIdea[];
        };
        const base = emptyState();
        const merged: AppState = {
          ...base,
          ...parsed,
          business: { ...base.business, ...(parsed.business ?? {}) },
          ownership: { ...base.ownership, ...(parsed.ownership ?? {}) },
          // support legacy key domainShortlist and ensure default
          savedDomainIdeas:
            parsed.savedDomainIdeas ?? parsed.domainShortlist ?? base.savedDomainIdeas ?? [],
          dnsPlanning: {
            ...defaultDnsPlanning,
            ...(parsed.dnsPlanning ?? {}),
          },
        } as AppState;
        // ensure array
        if (!Array.isArray(merged.savedDomainIdeas)) merged.savedDomainIdeas = [];
        // ensure business defaults for new fields
        merged.business = { ...base.business, ...(merged.business ?? {}) } as BusinessProfile;
        if (!merged.dnsPlanning) merged.dnsPlanning = { ...defaultDnsPlanning };
        setState(merged);
        setLastSavedAt(new Date());
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      setSaveStatus("saving");
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setLastSavedAt(new Date());
      setSaveStatus("saved");
      window.dispatchEvent(new CustomEvent("cornerstone:saved", { detail: { time: new Date() } }));
    } catch {
      /* storage may be unavailable */
    }
  }, [state, hydrated]);

  const patch = useCallback((fn: (prev: AppState) => AppState) => setState(fn), []);

  const value = useMemo<StoreValue>(
    () => ({
      state,
      hydrated,
      hasPlan: state.onboardingComplete && state.tasks.length > 0,
      lastSavedAt,
      saveStatus,
      setBusiness: (p) => patch((s) => ({ ...s, business: { ...s.business, ...p } })),
      updateBusinessProfileField: (field, value) =>
        patch((s) => ({ ...s, business: { ...s.business, [field]: value } })),
      setOnboardingStep: (step) => patch((s) => ({ ...s, onboardingStep: step })),
      generatePlan: () =>
        patch((s) => ({
          ...s,
          onboardingComplete: true,
          tasks: generateTasks(s.business),
        })),
      loadDemo: () => setState(demoState()),
      resetAll: () => setState(emptyState()),
      setTaskStatus: (id, status) =>
        patch((s) => ({
          ...s,
          tasks: s.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status,
                  completedAt: status === "complete" ? new Date().toISOString() : null,
                }
              : t,
          ),
        })),
      updateTask: (id, p) =>
        patch((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...p } : t)) })),
      addTask: (task) =>
        patch((s) => ({
          ...s,
          tasks: [...s.tasks, { ...task, id: `custom-${Date.now()}`, custom: true }],
        })),
      updateMaintenance: (id, p) =>
        patch((s) => ({
          ...s,
          maintenance: s.maintenance.map((m) => (m.id === id ? { ...m, ...p } : m)),
        })),
      saveDraft: (pageType, fields) =>
        patch((s) => {
          const draft: ContentDraft = { pageType, fields, updatedAt: new Date().toISOString() };
          return { ...s, drafts: { ...s.drafts, [pageType]: draft } };
        }),
      setOwnership: (p) => patch((s) => ({ ...s, ownership: { ...s.ownership, ...p } })),
      toggleArticle: (slug) =>
        patch((s) => ({
          ...s,
          completedArticles: s.completedArticles.includes(slug)
            ? s.completedArticles.filter((a) => a !== slug)
            : [...s.completedArticles, slug],
        })),
      signIn: (fullName, email) =>
        patch((s) => ({ ...s, account: { signedIn: true, fullName, email } })),
      signOut: () =>
        patch((s) => ({ ...s, account: { signedIn: false, fullName: "", email: "" } })),
      setCustomerJourneyTest: (test) => patch((s) => ({ ...s, customerJourneyTest: test })),
      updateCustomerJourneyStep: (id, p) =>
        patch((s) => {
          if (!s.customerJourneyTest) return s;
          return {
            ...s,
            customerJourneyTest: {
              ...s.customerJourneyTest,
              steps: s.customerJourneyTest.steps.map((st) => (st.id === id ? { ...st, ...p } : st)),
              lastUpdatedAt: new Date().toISOString(),
            },
          };
        }),
      upsertSavedDomain: (domain, opts) =>
        patch((s) => {
          const normalised = normaliseDomain(domain);
          const now = new Date().toISOString();
          const existingIndex = s.savedDomainIdeas.findIndex(
            (d) => normaliseDomain(d.domain) === normalised,
          );
          if (existingIndex >= 0) {
            const existing = s.savedDomainIdeas[existingIndex];
            if (!existing) return s;
            const updated: SavedDomainIdea = {
              ...existing,
              domain: normalised,
              score: opts?.score ?? existing.score,
              availability: opts?.availability ?? existing.availability,
              note: opts?.note ?? existing.note,
              status: opts?.status ?? existing.status,
              updatedAt: now,
            };
            const next = [...s.savedDomainIdeas];
            next[existingIndex] = updated;
            // if status is preferred, demote others
            if (updated.status === "preferred") {
              for (let i = 0; i < next.length; i++) {
                const item = next[i];
                if (item && item.id !== updated.id && item.status === "preferred") {
                  next[i] = { ...item, status: "considering", updatedAt: now };
                }
              }
            }
            return { ...s, savedDomainIdeas: next };
          }
          const newIdea: SavedDomainIdea = {
            id: `domain-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            domain: normalised,
            status: opts?.status ?? "considering",
            note: opts?.note,
            score: opts?.score,
            availability: opts?.availability,
            createdAt: now,
            updatedAt: now,
          };
          let next = [...s.savedDomainIdeas, newIdea];
          if (newIdea.status === "preferred") {
            next = next.map((item) =>
              item.id !== newIdea.id && item.status === "preferred"
                ? { ...item, status: "considering" as const, updatedAt: now }
                : item,
            );
          }
          return { ...s, savedDomainIdeas: next };
        }),
      updateSavedDomain: (id, p) =>
        patch((s) => ({
          ...s,
          savedDomainIdeas: s.savedDomainIdeas.map((d) =>
            d.id === id ? { ...d, ...p, updatedAt: new Date().toISOString() } : d,
          ),
        })),
      removeSavedDomain: (id) =>
        patch((s) => ({
          ...s,
          savedDomainIdeas: s.savedDomainIdeas.filter((d) => d.id !== id),
        })),
      setSavedDomainStatus: (id, status) =>
        patch((s) => {
          const now = new Date().toISOString();
          if (status === "preferred") {
            return {
              ...s,
              savedDomainIdeas: s.savedDomainIdeas.map((d) =>
                d.id === id
                  ? { ...d, status, updatedAt: now }
                  : d.status === "preferred"
                    ? { ...d, status: "considering" as const, updatedAt: now }
                    : d,
              ),
            };
          }
          return {
            ...s,
            savedDomainIdeas: s.savedDomainIdeas.map((d) =>
              d.id === id ? { ...d, status, updatedAt: now } : d,
            ),
          };
        }),
      restoreBackup: (backup) => {
        if (!backup || typeof backup !== "object") return false;
        const candidate = backup as Partial<AppState>;
        if (!candidate.business || !Array.isArray(candidate.tasks)) return false;
        const base = emptyState();
        setState({
          ...base,
          ...candidate,
          business: { ...base.business, ...candidate.business },
          ownership: { ...base.ownership, ...(candidate.ownership ?? {}) },
          tasks: candidate.tasks,
          maintenance: Array.isArray(candidate.maintenance)
            ? candidate.maintenance
            : base.maintenance,
          drafts: candidate.drafts ?? {},
          savedDomainIdeas: Array.isArray(candidate.savedDomainIdeas)
            ? candidate.savedDomainIdeas
            : [],
          dnsPlanning: {
            ...defaultDnsPlanning,
            ...((candidate as AppState).dnsPlanning ?? {}),
          },
        });
        return true;
      },
      setLocalInsightsConsent: (allowed) => patch((s) => ({ ...s, localInsightsConsent: allowed })),
      setDnsPlanning: (p) =>
        patch((s) => ({
          ...s,
          dnsPlanning: { ...(s.dnsPlanning ?? defaultDnsPlanning), ...p },
        })),
      updateDnsPlanningField: (field, val) =>
        patch((s) => ({
          ...s,
          dnsPlanning: { ...(s.dnsPlanning ?? defaultDnsPlanning), [field]: val },
        })),
    }),
    [state, hydrated, patch, lastSavedAt, saveStatus],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
