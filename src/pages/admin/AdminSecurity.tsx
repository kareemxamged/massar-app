import { useState } from 'react';
import { ShieldAlert, History, Fingerprint, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuditLogs } from '../../features/admin-security/api/useAuditLogs';
import SecurityStats from '../../features/admin-security/components/SecurityStats';
import ActivityLogTable from '../../features/admin-security/components/ActivityLogTable';
import AdminSessionManager from '../../features/admin-security/components/AdminSessionManager';

type Tab = 'logs' | 'sessions';

export default function AdminSecurity() {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [activeTab, setActiveTab] = useState<Tab>('logs');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const {
    logs, count, page, setPage, loading, filters,
    updateFilters, clearFilters, totalPages,
    stats, statsLoading,
    sessions, sessionsLoading,
    refresh, refreshStats, refreshSessions,
  } = useAuditLogs();

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'logs', label: isRtl ? 'سجلات النظام' : 'Audit Logs', icon: <History size={15} /> },
    { id: 'sessions', label: isRtl ? 'الجلسات' : 'Sessions', icon: <Fingerprint size={15} /> },
  ];

  const handleRefreshAll = async () => {
    try {
      await Promise.all([refresh(), refreshStats(), refreshSessions()]);
      showToast('success', isRtl ? 'تم تحديث البيانات' : 'Data refreshed successfully');
    } catch {
      showToast('error', isRtl ? 'فشل في تحديث البيانات' : 'Failed to refresh data');
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className={`p-6 max-w-7xl mx-auto space-y-6 ${isRtl ? 'font-tajawal' : ''}`}>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl shrink-0" style={{ background: 'rgba(251,113,133,0.12)' }}>
            <ShieldAlert size={26} style={{ color: '#fb7185' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>{isRtl ? 'سجلات الأمان' : 'Security Logs'}</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{isRtl ? 'مراقبة وتتبع جميع الأنشطة الأمنية في النظام' : 'Monitor and track system security activities'}</p>
          </div>
        </div>
        <button
          onClick={handleRefreshAll}
          className="md:ms-auto w-full md:w-auto inline-flex justify-center items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
          style={{ background: 'rgba(251,113,133,0.1)', color: '#fb7185', border: '1px solid rgba(251,113,133,0.25)' }}
        >
          {isRtl ? 'تحديث الكل' : 'Refresh All'}
        </button>
      </div>

      {/* Stats Row */}
      <SecurityStats stats={stats} loading={statsLoading} />

      {/* Tab Bar */}
      <div
        className="flex items-center gap-1 p-1 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', width: 'fit-content' }}
      >
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: isActive ? 'rgba(251,113,133,0.15)' : 'transparent',
                color: isActive ? '#fb7185' : 'var(--text-muted)',
                border: isActive ? '1px solid rgba(251,113,133,0.3)' : '1px solid transparent',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'logs' && (
        <ActivityLogTable
          logs={logs}
          count={count}
          page={page}
          totalPages={totalPages}
          loading={loading}
          filters={filters}
          onPageChange={setPage}
          onFilterChange={updateFilters}
          onClearFilters={clearFilters}
          onRefresh={refresh}
        />
      )}

      {activeTab === 'sessions' && (
        <AdminSessionManager
          sessions={sessions}
          loading={sessionsLoading}
          onRefresh={refreshSessions}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-4 end-4 z-[9999] px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-medium flex items-center gap-2"
          style={{
            background: toast.type === 'success' ? 'rgba(5,150,105,0.95)' : 'rgba(190,18,60,0.95)',
            border: `1px solid ${toast.type === 'success' ? '#059669' : '#be123c'}`,
          }}
        >
          {toast.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
