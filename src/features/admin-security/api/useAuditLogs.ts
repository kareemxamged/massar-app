import { useState, useCallback, useEffect } from 'react';
import { auditApi, PAGE_SIZE } from './auditApi';
import type { AuditLog, AuditFilters, SecurityStats, AdminSession } from '../types';

export function useAuditLogs() {
  const [logs,         setLogs        ] = useState<AuditLog[]>([]);
  const [count,        setCount       ] = useState(0);
  const [page,         setPage        ] = useState(0);
  const [loading,      setLoading     ] = useState(true);
  const [filters,      setFilters     ] = useState<AuditFilters>({});

  const [stats,        setStats       ] = useState<SecurityStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [sessions,        setSessions       ] = useState<AdminSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const result = await auditApi.getAuditLogs(filters, page);
      setLogs(result.data);
      setCount(result.count);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try { setStats(await auditApi.getSecurityStats()); }
    finally { setStatsLoading(false); }
  }, []);

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    try { setSessions(await auditApi.getAdminSessions()); }
    finally { setSessionsLoading(false); }
  }, []);

  useEffect(() => { void loadLogs();     }, [loadLogs]);
  useEffect(() => { void loadStats();    }, [loadStats]);
  useEffect(() => { void loadSessions(); }, [loadSessions]);

  const updateFilters = (patch: Partial<AuditFilters>) => {
    setFilters(prev => ({ ...prev, ...patch }));
    setPage(0);
  };

  const clearFilters = () => { setFilters({}); setPage(0); };

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  return {
    logs, count, page, setPage, loading,
    filters, updateFilters, clearFilters,
    totalPages,
    stats, statsLoading,
    sessions, sessionsLoading,
    refresh:         loadLogs,
    refreshStats:    loadStats,
    refreshSessions: loadSessions,
  };
}
