import { useTranslation } from 'react-i18next';
import { AlertTriangle, CheckCircle, ChevronDown, Inbox, User, BookOpen } from 'lucide-react';
import type { ContentReport } from '../types';

interface Props {
  reports: ContentReport[];
  loading: boolean;
  filter: 'open' | 'resolved' | undefined;
  onFilterChange: (f: 'open' | 'resolved' | undefined) => void;
  onResolve: (id: string) => Promise<void>;
}

export default function ReportsInbox({ reports, loading, filter, onFilterChange, onResolve }: Props) {
  const { t } = useTranslation('content');
  const openCount     = reports.filter(r => r.status === 'open').length;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 max-w-sm">
        <div className="glass-card px-4 py-3 flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24' }}>
            <AlertTriangle size={16} />
          </div>
          <div>
            <div className="text-xl font-bold" style={{ color: '#fbbf24' }}>{openCount}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('status.open')}</div>
          </div>
        </div>
        <div className="glass-card px-4 py-3 flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399' }}>
            <CheckCircle size={16} />
          </div>
          <div>
            <div className="text-xl font-bold" style={{ color: '#34d399' }}>{resolvedCount}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('status.resolved')}</div>
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>
            {t('counts.reportsTitle', { count: reports.length })}
          </h3>
          <div className="relative">
            <select
              value={filter ?? ''}
              onChange={e => onFilterChange((e.target.value as 'open' | 'resolved') || undefined)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                color: 'var(--text-main)',
                padding: '6px 32px 6px 12px',
                fontSize: 13,
                appearance: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="" style={{ background: '#1e293b' }}>{t('filter.allReports')}</option>
              <option value="open"     style={{ background: '#1e293b' }}>{t('status.open')}</option>
              <option value="resolved" style={{ background: '#1e293b' }}>{t('status.resolved')}</option>
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', insetInlineEnd: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          </div>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse rounded-xl h-20 bg-white/5" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="py-14 text-center">
            <Inbox size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 10px' }} />
            <p style={{ color: 'var(--text-muted)' }}>{t('empty.reports')}</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            {reports.map(report => (
              <ReportRow key={report.id} report={report} onResolve={onResolve} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReportRow({ report, onResolve }: { report: ContentReport; onResolve: (id: string) => Promise<void> }) {
  const { t, i18n } = useTranslation('content');
  const dateLocale = i18n.language.startsWith('ar') ? 'ar-SA' : 'en-US';
  const isOpen = report.status === 'open';

  const handleResolve = async () => {
    if (!isOpen) return;
    await onResolve(report.id);
  };

  return (
    <div className="px-5 py-4 flex items-start gap-4">
      {/* Status indicator */}
      <div className="mt-0.5 flex-shrink-0">
        {isOpen
          ? <AlertTriangle size={16} style={{ color: '#fbbf24' }} />
          : <CheckCircle size={16} style={{ color: '#34d399' }} />
        }
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap mb-1">
          {/* Course */}
          <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            <BookOpen size={11} />
            {report.course ? `${report.course.title} (${report.course.code})` : `Course #${report.course_id}`}
          </span>
          {/* Reporter */}
          <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            <User size={11} />
            {report.reporter?.full_name ?? t('reports.unknownUser')}
          </span>
          {/* Date */}
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {new Date(report.created_at).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* Reason */}
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-main)' }}>{report.reason}</p>
      </div>

      {/* Action */}
      <div className="flex-shrink-0">
        {isOpen ? (
          <button
            onClick={handleResolve}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
            style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }}
          >
            <CheckCircle size={12} />
            {t('actions.resolve')}
          </button>
        ) : (
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399' }}
          >
            {t('status.resolved')}
          </span>
        )}
      </div>
    </div>
  );
}
