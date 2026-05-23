import { Fingerprint, Activity, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AdminSession } from '../types';
import { ACTION_BADGE } from '../types';

interface Props {
  sessions: AdminSession[];
  loading: boolean;
  onRefresh: () => void;
}

export default function AdminSessionManager({ sessions, loading, onRefresh }: Props) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return isRtl ? 'الآن' : 'just now';
    if (m < 60) return isRtl ? `قبل ${m} دقيقة` : `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return isRtl ? `قبل ${h} ساعة` : `${h}h ago`;
    return isRtl ? `قبل ${Math.floor(h / 24)} يوم` : `${Math.floor(h / 24)}d ago`;
  }

  return (
    <div className="glass-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-2">
          <Fingerprint size={16} style={{ color: '#6366f1' }} className="shrink-0" />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>{isRtl ? 'جلسات الإدارة' : 'Active Sessions'}</h3>
          <span className="px-2 py-0.5 rounded-full text-xs shrink-0" style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1' }}>
            {isRtl ? `${sessions.length} حساب` : `${sessions.length} admins`}
          </span>
        </div>
        <button
          onClick={onRefresh}
          className="inline-flex shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
          style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />{isRtl ? 'تحديث' : 'Refresh'}
        </button>
      </div>

      {loading ? (
        <div className="p-5 space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-white/10" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/10 rounded w-1/3" />
                <div className="h-3 bg-white/10 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="py-12 text-center">
          <Fingerprint size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{isRtl ? 'لا يوجد مسؤولين نشطين' : 'No active admins'}</p>
        </div>
      ) : (
        <div className="divide-y w-full overflow-x-auto" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          {sessions.map(session => {
            const lastBadge = session.last_action_type
              ? ACTION_BADGE[session.last_action_type as keyof typeof ACTION_BADGE]
              : null;
            return (
              <div key={session.id} className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 min-w-[400px]">
                {/* Avatar placeholder */}
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: 'rgba(99,102,241,0.2)', color: '#6366f1' }}
                >
                  {(session.full_name ?? session.email ?? '?')[0].toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                      {session.full_name ?? (isRtl ? 'مسؤول مجهول' : 'Unknown Admin')}
                    </span>
                    <span dir="ltr" className="inline-block text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                      {session.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {session.last_action_at && (
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        <span dir="ltr" className="inline-block me-1">{timeAgo(session.last_action_at)}</span>
                        {isRtl ? 'نشط' : 'active'}
                      </span>
                    )}
                    {lastBadge && session.last_action_type && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0"
                        style={{ background: lastBadge.bg, color: lastBadge.color }}>
                        {session.last_action_type}
                      </span>
                    )}
                  </div>
                </div>

                {/* Today's actions */}
                <div className="sm:text-end sm:flex-shrink-0 mt-3 sm:mt-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-start">
                  <div className="flex items-center gap-1.5">
                    <Activity size={12} style={{ color: '#6366f1' }} />
                    <span className="text-sm font-semibold" style={{ color: session.actions_today > 0 ? '#6366f1' : 'var(--text-muted)' }}>
                      {session.actions_today}
                    </span>
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{isRtl ? 'إجراءات اليوم' : 'actions today'}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
