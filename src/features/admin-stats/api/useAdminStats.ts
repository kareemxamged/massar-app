import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchDashboardData } from './adminStatsApi';
import type { DashboardData } from '../types';

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

interface State {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  lastRefreshed: Date | null;
}

export function useAdminStats() {
  const [state, setState] = useState<State>({
    data: null,
    loading: true,
    error: null,
    lastRefreshed: null,
  });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const data = await fetchDashboardData();
      setState({ data, loading: false, error: null, lastRefreshed: new Date() });
    } catch (e: unknown) {
      setState(s => ({
        ...s,
        loading: false,
        error: e instanceof Error ? e.message : 'Failed to load statistics',
      }));
    }
  }, []);

  useEffect(() => {
    void load();
    timerRef.current = setInterval(() => { void load(); }, REFRESH_INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [load]);

  return { ...state, refresh: load };
}
