import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

const STORAGE_KEY = "inbound.saved.v1";

type SavedContextValue = {
  saved: string[];
  isSaved: (id: string) => boolean;
  toggle: (id: string) => void;
  clear: () => void;
  compareOpen: boolean;
  setCompareOpen: (open: boolean) => void;
};

const SavedContext = createContext<SavedContextValue | null>(null);

export function SavedProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setSaved(JSON.parse(raw) as string[]);
    } catch {
      /* ignore */
    }
  }, []);

  const persist = useCallback((next: string[]) => {
    setSaved(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<SavedContextValue>(
    () => ({
      saved,
      isSaved: (id) => saved.includes(id),
      toggle: (id) =>
        persist(saved.includes(id) ? saved.filter((s) => s !== id) : [...saved, id]),
      clear: () => persist([]),
      compareOpen,
      setCompareOpen,
    }),
    [saved, persist, compareOpen],
  );

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSaved(): SavedContextValue {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error("useSaved must be used within SavedProvider");
  return ctx;
}
