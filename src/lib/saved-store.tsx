import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useSession } from "@/lib/auth/session";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

type ToggleResult = "saved" | "removed" | "auth-required";

type SavedContextValue = {
  saved: string[];
  isSaved: (id: string) => boolean;
  toggle: (id: string) => Promise<ToggleResult>;
  clear: () => Promise<void>;
  isLoading: boolean;
  compareOpen: boolean;
  setCompareOpen: (open: boolean) => void;
};

const SavedContext = createContext<SavedContextValue | null>(null);

/** Saved homes are account data; anonymous browser storage is intentionally not used. */
export function SavedProvider({ children }: { children: ReactNode }) {
  const { actor, isReady } = useSession();
  const [saved, setSaved] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);

  const refresh = useCallback(async () => {
    if (!actor || !isSupabaseConfigured()) {
      setSaved([]);
      return;
    }
    setIsLoading(true);
    const { data, error } = await getSupabaseBrowserClient()
      .from("saved_properties")
      .select("property_id")
      .eq("user_id", actor.id)
      .order("created_at", { ascending: false });
    if (!error)
      setSaved(((data ?? []) as Array<{ property_id: string }>).map((item) => item.property_id));
    setIsLoading(false);
  }, [actor]);

  useEffect(() => {
    if (isReady) void refresh();
  }, [isReady, refresh]);

  const toggle = useCallback(
    async (propertyId: string): Promise<ToggleResult> => {
      if (!actor) return "auth-required";
      const supabase = getSupabaseBrowserClient();
      if (saved.includes(propertyId)) {
        const { error } = await supabase
          .from("saved_properties")
          .delete()
          .eq("user_id", actor.id)
          .eq("property_id", propertyId);
        if (error) throw new Error("We couldn't remove this saved home.");
        setSaved((items) => items.filter((item) => item !== propertyId));
        return "removed";
      }
      const { error } = await supabase
        .from("saved_properties")
        .insert({ user_id: actor.id, property_id: propertyId });
      if (error) throw new Error("We couldn't save this home.");
      setSaved((items) => [...items, propertyId]);
      return "saved";
    },
    [actor, saved],
  );

  const clear = useCallback(async () => {
    if (!actor) return;
    const { error } = await getSupabaseBrowserClient()
      .from("saved_properties")
      .delete()
      .eq("user_id", actor.id);
    if (error) throw new Error("We couldn't clear saved homes.");
    setSaved([]);
  }, [actor]);

  const value = useMemo<SavedContextValue>(
    () => ({
      saved,
      isSaved: (id) => saved.includes(id),
      toggle,
      clear,
      isLoading,
      compareOpen,
      setCompareOpen,
    }),
    [saved, toggle, clear, isLoading, compareOpen],
  );

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSaved(): SavedContextValue {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error("useSaved must be used within SavedProvider");
  return ctx;
}
