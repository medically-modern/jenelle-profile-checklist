import { useCallback, useEffect, useRef, useState } from "react";
import type { Patient } from "@/lib/workflow";
import { fetchGroupItems, hasToken } from "@/lib/mondayApi";
import { mondayItemToPatient } from "@/lib/mondayMapping";

const POLL_MS = 15_000; // poll every 15s for near-real-time reads

export function useMondayPatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const refetch = useCallback(async () => {
    if (!hasToken()) {
      if (mountedRef.current) {
        setError("VITE_MONDAY_API_TOKEN is not set. Add it in your project env vars and rebuild.");
        setLoading(false);
      }
      return;
    }
    if (mountedRef.current) {
      setLoading(true);
      setError(null);
    }
    try {
      const items = await fetchGroupItems();
      if (!mountedRef.current) return;
      const safeItems = Array.isArray(items) ? items : [];
      const ps = safeItems.map(mondayItemToPatient);
      setPatients(ps);
    } catch (e) {
      if (mountedRef.current)
        setError(e instanceof Error ? e.message : "Failed to load patients from Monday");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    refetch();
    const id = setInterval(refetch, POLL_MS);
    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [refetch]);

  /**
   * Optimistic local update — applies a patch to local state immediately.
   * Used alongside a Monday API write call to keep the UI responsive
   * without waiting for the next poll cycle.
   */
  const updateLocal = useCallback((id: string, patch: Partial<Patient>) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    );
  }, []);

  return { patients, loading, error, refetch, updateLocal };
}
