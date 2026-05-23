import { useTranslation } from 'react-i18next';
import { LayoutDashboard, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useAdminStats } from '../features/admin-stats/api/useAdminStats';
import StatsOverviewGrid from '../features/admin-stats/components/StatsOverviewGrid';
import GrowthCharts from '../features/admin-stats/components/GrowthCharts';
import RecentActivityFeed from '../features/admin-stats/components/RecentActivityFeed';
import QuickActions from '../features/admin-stats/components/QuickActions';

const EMPTY_USERS = { total_students: 0, total_teachers: 0, new_users_week: 0, new_users_month: 0 };
const EMPTY_CONTENT = {
  courses_approved: 0, courses_pending: 0, courses_total: 0,
  total_exams: 0, total_materials: 0, total_enrollments: 0,
  total_submissions: 0, completed_submissions: 0, audit_24h: 0,
};

function fmt(d: Date) {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function AdminDashboard() {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const { data, loading, error, lastRefreshed, refresh } = useAdminStats();

  const users = data?.users ?? EMPTY_USERS;
  const content = data?.content ?? EMPTY_CONTENT;
  const trend = data?.registrationTrend ?? [];
  const dist = data?.courseDistribution ?? [];
  const activity = data?.recentActivity ?? [];

  return (
    <div className={`p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 ${isRtl ? 'font-tajawal' : ''}`}>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl" style={{ background: 'rgba(99,102,241,0.12)' }}>
            <LayoutDashboard size={26} style={{ color: '#818cf8' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>
              {isRtl ? 'لوحة التحكم' : 'Dashboard'}
            </h1>
            <p className="text-sm flex flex-wrap items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
              <span>{isRtl ? 'نظرة عامة على المنصة · تُحدَّث تلقائيًا كل 5 دقائق' : 'Platform overview · auto-refreshes every 5 minutes'}</span>
              {lastRefreshed && (
                <span className="ms-0 sm:ms-2 text-xs opacity-80">
                  · {isRtl ? `آخر تحديث ${fmt(lastRefreshed)}` : `Last updated ${fmt(lastRefreshed)}`}
                </span>
              )}
            </p>
          </div>
        </div>
        <button
          onClick={() => { void refresh(); }}
          disabled={loading}
          className="inline-flex shrink-0 items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 disabled:opacity-50"
          style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {isRtl ? 'تحديث' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div className="flex items-center gap-3">
            <XCircle size={16} style={{ color: '#f87171', flexShrink: 0 }} />
            <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>
          </div>
          <button onClick={() => { void refresh(); }}
            className="sm:ms-auto text-xs underline text-start" style={{ color: '#f87171' }}>
            {isRtl ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      )}

      <StatsOverviewGrid users={users} content={content} loading={loading} />
      <GrowthCharts trend={trend} distribution={dist} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <RecentActivityFeed entries={activity} loading={loading} />
        </div>
        <div className="lg:col-span-2">
          <QuickActions content={content} />
        </div>
      </div>

      {!loading && data && (
        <p className="text-center text-xs flex items-center justify-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
          <CheckCircle size={11} style={{ color: '#34d399' }} />
          {isRtl ? 'جميع الأنظمة تعمل بشكل طبيعي' : 'All systems operational'}
        </p>
      )}
    </div>
  );
}
