import { useState } from 'react';
import {
  History, Search, Filter, ChevronLeft, ChevronRight,
  GitCompare, RefreshCw, ChevronDown, X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DiffViewer from './DiffViewer';
import type { AuditLog, AuditFilters, AuditAction } from '../types';
import { ACTION_BADGE, ALL_ACTIONS } from '../types';
import { PAGE_SIZE } from '../api/auditApi';

interface Props {
  logs: AuditLog[];
  count: number;
  page: number;
  totalPages: number;
  loading: boolean;
  filters: AuditFilters;
  onPageChange: (p: number) => void;
  onFilterChange: (patch: Partial<AuditFilters>) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
}

function fmtDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(locale, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

export default function ActivityLogTable({
  logs, count, page, totalPages, loading,
  filters, onPageChange, onFilterChange, onClearFilters, onRefresh,
}: Props) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const dateLocale = isRtl ? 'ar-SA' : 'en-US';

  const [diffEntry, setDiffEntry] = useState<AuditLog | null>(null);
  const [localAdminName, setLocalAdminName] = useState(filters.adminName ?? '');
  const [localDateFrom, setLocalDateFrom] = useState(filters.dateFrom ?? '');
  const [localDateTo, setLocalDateTo] = useState(filters.dateTo ?? '');
  const hasFilters = !!(filters.adminName || filters.actionType || filters.dateFrom || filters.dateTo);

  const applyFilters = () => {
    onFilterChange({
      adminName: localAdminName || undefined,
      dateFrom: localDateFrom || undefined,
      dateTo: localDateTo || undefined,
    });
  };

  const handleClear = () => {
    setLocalAdminName('');
    setLocalDateFrom('');
    setLocalDateTo('');
    onClearFilters();
  };

  const TABLE_HEADERS = [
    isRtl ? 'التاريخ والوقت' : 'Timestamp',
    isRtl ? 'المسؤول' : 'Admin',
    isRtl ? 'الإجراء' : 'Action',
    isRtl ? 'الكيان' : 'Entity',
    isRtl ? 'معرف الكيان' : 'Entity ID',
    isRtl ? 'التغييرات' : 'Changes',
  ];

  const from = page * PAGE_SIZE + 1;
  const to = Math.min((page + 1) * PAGE_SIZE, count);

  return (
    <div className="space-y-3">
      {/* Filter bar */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 flex-wrap">
          {/* Admin name search */}
          <div className="relative flex-1 min-w-[160px]">
            <Search
              size={14}
              className="absolute top-1/2 -translate-y-1/2 start-3 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder={isRtl ? 'بحث باسم المسؤول...' : 'Search admin name...'}
              value={localAdminName}
              onChange={e => setLocalAdminName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyFilters()}
              className="w-full bg-white/5 border border-white/10 rounded-lg text-main text-sm outline-none ps-9 pe-3 py-2 text-start transition-colors focus:border-indigo-500/50"
            />
          </div>

          {/* Action type select */}
          <div className="relative w-full md:w-auto">
            <select
              value={filters.actionType ?? ''}
              onChange={e => onFilterChange({ actionType: (e.target.value as AuditAction) || undefined })}
              className="w-full md:w-auto bg-white/5 border border-white/10 rounded-lg text-main text-sm outline-none py-2 ps-3 pe-9 appearance-none cursor-pointer transition-colors focus:border-indigo-500/50"
            >
              <option value="" style={{ background: '#1e293b' }}>{isRtl ? 'جميع الإجراءات' : 'All Actions'}</option>
              {ALL_ACTIONS.map(a => (
                <option key={a} value={a} style={{ background: '#1e293b' }}>{a}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-400 pointer-events-none" />
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter size={13} className="text-gray-400 shrink-0 hidden md:block" />
            <input
              type="date"
              value={localDateFrom}
              onChange={e => setLocalDateFrom(e.target.value)}
              className="flex-1 min-w-0 md:w-auto bg-white/5 border border-white/10 rounded-lg text-main text-xs sm:text-sm outline-none py-2 px-2 transition-colors focus:border-indigo-500/50"
            />
            <span className="text-gray-400 text-xs shrink-0">{isRtl ? 'إلى' : 'to'}</span>
            <input
              type="date"
              value={localDateTo}
              onChange={e => setLocalDateTo(e.target.value)}
              className="flex-1 min-w-0 md:w-auto bg-white/5 border border-white/10 rounded-lg text-main text-xs sm:text-sm outline-none py-2 px-2 transition-colors focus:border-indigo-500/50"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 w-full md:w-auto mt-2 md:mt-0">
            <button
              onClick={applyFilters}
              className="flex-1 md:flex-none inline-flex justify-center items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:scale-105"
              style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.3)' }}
            >
              <Search size={12} />{isRtl ? 'تطبيق' : 'Apply'}
            </button>
            {hasFilters && (
              <button
                onClick={handleClear}
                className="flex-1 md:flex-none inline-flex justify-center items-center gap-1 px-3 py-2 rounded-lg text-xs transition-colors hover:bg-white/10"
                style={{ color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <X size={12} />{isRtl ? 'مسح' : 'Clear'}
              </button>
            )}
            <button
              onClick={onRefresh}
              className="flex-1 md:flex-none inline-flex justify-center items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:scale-105 md:ms-auto"
              style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)' }}
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />{isRtl ? 'تحديث' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Result summary */}
        <div className="flex items-center gap-2">
          <History size={13} style={{ color: 'var(--text-muted)' }} />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {isRtl ? `${count} حدث — الصفحة ${page + 1} من ${totalPages}` : `${count} events — Page ${page + 1} of ${totalPages}`}
            {hasFilters && <span style={{ color: '#fbbf24' }}> {isRtl ? '(مصفاة)' : '(filtered)'}</span>}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-4">
                <div className="h-4 bg-white/10 rounded w-36" />
                <div className="h-4 bg-white/10 rounded w-24" />
                <div className="h-6 bg-white/10 rounded-full w-28" />
                <div className="h-4 bg-white/10 rounded w-20" />
                <div className="h-4 bg-white/10 rounded flex-1" />
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center">
            <History size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 10px' }} />
            <p style={{ color: 'var(--text-muted)' }}>{isRtl ? 'لا توجد سجلات مطابقة.' : 'No events found.'}</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto border border-white/10 rounded-lg shadow-sm">
            <table className="min-w-[800px] w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {TABLE_HEADERS.map(h => (
                    <th key={h} className="px-4 py-3 text-start whitespace-nowrap text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => {
                  const badge = ACTION_BADGE[log.action_type];
                  const hasChanges = log.old_data !== null || log.new_data !== null;
                  return (
                    <tr key={log.id} style={{ borderBottom: idx < logs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                      {/* Timestamp */}
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                        <span dir="ltr" className="inline-block">{fmtDate(log.created_at, dateLocale)}</span>
                      </td>

                      {/* Admin */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {log.admin ? (
                          <div>
                            <div className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                              {log.admin.full_name ?? '—'}
                            </div>
                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              <span dir="ltr" className="inline-block font-mono">{log.admin.email}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{isRtl ? 'إجراء نظام تلقائي' : 'System Trigger'}</span>
                        )}
                      </td>

                      {/* Action badge */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                          style={{ background: badge?.bg ?? 'rgba(148,163,184,0.1)', color: badge?.color ?? '#94a3b8' }}
                        >
                          {log.action_type}
                        </span>
                      </td>

                      {/* Entity */}
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)', fontFamily: 'ui-monospace,SFMono-Regular,monospace' }}>
                        {log.entity_affected}
                      </td>

                      {/* Entity ID */}
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)', maxWidth: 120 }}>
                        <span dir="ltr" className="inline-block truncate max-w-full font-mono" title={log.entity_id ?? ''}>
                          {log.entity_id ?? '—'}
                        </span>
                      </td>

                      {/* View Changes */}
                      <td className="px-4 py-3 whitespace-nowrap text-end">
                        {hasChanges ? (
                          <button
                            onClick={() => setDiffEntry(log)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                            style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.25)' }}
                          >
                            <GitCompare size={12} />{isRtl ? 'التغييرات' : 'View Changes'}
                          </button>
                        ) : (
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <span className="text-xs text-center sm:text-start" style={{ color: 'var(--text-muted)' }}>
              {isRtl ? `عرض ${from} إلى ${to} من ${count}` : `Showing ${from} to ${to} of ${count}`}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 0}
                className="p-1.5 rounded-lg transition-colors hover:bg-white/10 disabled:opacity-30"
                style={{ color: 'var(--text-muted)' }}
              >
                {isRtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                const pg = totalPages <= 7 ? i : (page < 4 ? i : (page > totalPages - 4 ? totalPages - 7 + i : page - 3 + i));
                return (
                  <button
                    key={pg}
                    onClick={() => onPageChange(pg)}
                    className="w-7 h-7 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: pg === page ? 'rgba(99,102,241,0.2)' : 'transparent',
                      color: pg === page ? '#6366f1' : 'var(--text-muted)',
                      border: pg === page ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
                    }}
                  >
                    {pg + 1}
                  </button>
                );
              })}
              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded-lg transition-colors hover:bg-white/10 disabled:opacity-30"
                style={{ color: 'var(--text-muted)' }}
              >
                {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Diff Viewer modal */}
      {diffEntry && (
        <DiffViewer
          oldData={diffEntry.old_data}
          newData={diffEntry.new_data}
          actionType={diffEntry.action_type}
          entityInfo={`${diffEntry.entity_affected}#${diffEntry.entity_id ?? '?'}`}
          onClose={() => setDiffEntry(null)}
        />
      )}
    </div>
  );
}
