import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type {
  AppState,
  BusinessProfile,
  ContentDraft,
  LaunchTask,
  MaintenanceTask,
  OwnershipRecord,
  TaskStatus,
} from "./types";
import { demoState, emptyState, generateTasks } from "./plan";

const STORAGE_KEY = "lmbo.state.v1";

interface StoreValue {
  state: AppState;
  hydrated: boolean;
  hasPlan: boolean;
  setBusiness: (patch: Partial<BusinessProfile>) => void;
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
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => emptyState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...emptyState(), ...(JSON.parse(raw) as AppState) });
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
      setBusiness: (p) => patch((s) => ({ ...s, business: { ...s.business, ...p } })),
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
              ? { ...t, status, completedAt: status === "complete" ? new Date().toISOString() : null }
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
      signOut: () => patch((s) => ({ ...s, account: { signedIn: false, fullName: "", email: "" } })),
    }),
    [state, hydrated, patch],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
