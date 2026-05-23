import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GraduationCap, BarChart3, CheckCircle, XCircle } from 'lucide-react';
import { useAdminUsers } from '../../features/admin/api';
import type { AdminUser as UserProfile } from '../../features/admin/types';
import UserFilters from '../../features/admin/components/UserFilters';
import UserTable from '../../features/admin/components/UserTable';
import AddUserModal from '../../features/admin/components/AddUserModal';
import ConfirmModal from '../../features/admin/components/ConfirmModal';
import EditUserModal from '../../features/admin/components/EditUserModal';
import UserStats from '../../features/admin/components/UserStats';

export default function AdminStudents() {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'suspend' | 'activate' | 'delete';
    userId: string;
    title: string;
    message: string;
    confirmLabel: string;
    actionType: 'danger' | 'warning' | 'info';
  } | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [statsUser, setStatsUser] = useState<UserProfile | null>(null);
  const [editUser, setEditUser] = useState<UserProfile | null>(null);

  const { users, loading, filters, updateFilter, suspendUser, activateUser, deleteUser, refresh, toast } =
    useAdminUsers({ role: 'student' });

  const activeCount = users.filter(u => u.status === 'active').length;
  const suspendedCount = users.filter(u => u.status === 'suspended').length;

  const handleEdit = (id: string) => { const u = users.find(u => u.id === id); if (u) setEditUser(u); };
  const handleStats = (id: string) => { const u = users.find(u => u.id === id); if (u) setStatsUser(u); };

  const handleConfirmAction = (type: 'suspend' | 'activate' | 'delete', userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const configs = {
      suspend: {
        title: isRtl ? 'إيقاف الحساب' : 'Suspend Account',
        message: isRtl ? `هل أنت متأكد من رغبتك في إيقاف حساب ${user.full_name}؟` : `Are you sure you want to suspend ${user.full_name}'s account?`,
        confirmLabel: isRtl ? 'إيقاف' : 'Suspend',
        actionType: 'warning' as const
      },
      activate: {
        title: isRtl ? 'تفعيل الحساب' : 'Activate Account',
        message: isRtl ? `هل أنت متأكد من رغبتك في تفعيل حساب ${user.full_name}؟` : `Are you sure you want to activate ${user.full_name}'s account?`,
        confirmLabel: isRtl ? 'تفعيل' : 'Activate',
        actionType: 'info' as const
      },
      delete: {
        title: isRtl ? 'حذف الحساب' : 'Delete Account',
        message: isRtl ? `هل أنت متأكد من حذف حساب ${user.full_name} نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.` : `Are you sure you want to permanently delete ${user.full_name}? This cannot be undone.`,
        confirmLabel: isRtl ? 'حذف' : 'Delete',
        actionType: 'danger' as const
      },
    };
    setConfirmAction({ type, userId, ...configs[type] });
  };

  const executeConfirmAction = async () => {
    if (!confirmAction) return;
    setConfirmLoading(true);
    try {
      if (confirmAction.type === 'suspend') await suspendUser(confirmAction.userId);
      else if (confirmAction.type === 'activate') await activateUser(confirmAction.userId);
      else await deleteUser(confirmAction.userId);
      setConfirmAction(null);
    } catch {
      // toast handled in hook
    } finally {
      setConfirmLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto ${isRtl ? 'font-tajawal' : ''}`}>
        <div className="animate-pulse space-y-6">
          <div className="h-12 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <div className="h-8 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <div className="h-96 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }} />
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 flex flex-col min-h-screen ${isRtl ? 'font-tajawal' : ''}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl shrink-0" style={{ background: 'rgba(56,189,248,0.15)' }}>
            <GraduationCap size={26} style={{ color: '#38bdf8' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>
              {isRtl ? 'إدارة الطلاب' : 'Students Management'}
            </h1>
            <p className="text-sm line-clamp-1" style={{ color: 'var(--text-muted)' }}>
              {isRtl ? 'مسارات التعليم، الحسابات والإحصائيات الخاصة بالطلاب' : 'View, edit, and analyze student accounts'}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="glass-card px-4 py-2 flex items-center gap-2">
            <BarChart3 size={15} style={{ color: '#34d399' }} />
            <span className="text-sm whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
              {isRtl ? 'نشط' : 'Active'}: <strong style={{ color: '#34d399' }}>{activeCount}</strong>
            </span>
          </div>
          <div className="glass-card px-4 py-2 flex items-center gap-2">
            <BarChart3 size={15} style={{ color: '#fb7185' }} />
            <span className="text-sm whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
              {isRtl ? 'موقوف' : 'Suspended'}: <strong style={{ color: '#fb7185' }}>{suspendedCount}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="shrink-0">
        <UserFilters
          search={filters.search || ''}
          role="student"
          status={filters.status || ''}
          onSearchChange={(v) => updateFilter('search', v || undefined)}
          onRoleChange={() => { }}
          onStatusChange={(v) => updateFilter('status', v || undefined)}
          onAddUser={() => setShowAddModal(true)}
        />
      </div>

      <div className="flex-1 min-h-0">
        <UserTable
          users={users}
          loading={loading}
          onEdit={handleEdit}
          onStats={handleStats}
          onConfirmAction={handleConfirmAction}
        />
      </div>

      {confirmAction && (
        <ConfirmModal
          isOpen
          title={confirmAction.title}
          message={confirmAction.message}
          confirmText={confirmAction.confirmLabel}
          cancelText={isRtl ? 'إلغاء' : 'Cancel'}
          variant={confirmAction.actionType}
          onConfirm={executeConfirmAction}
          onClose={() => setConfirmAction(null)}
          isConfirming={confirmLoading}
        />
      )}

      {editUser && (
        <EditUserModal
          isOpen
          user={editUser}
          onClose={() => setEditUser(null)}
          onSave={() => { setEditUser(null); refresh(); }}
        />
      )}

      {statsUser && <UserStats user={statsUser} onClose={() => setStatsUser(null)} />}

      {showAddModal && (
        <AddUserModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          initialRole="student"
          onSuccess={() => { setShowAddModal(false); refresh(); }}
        />
      )}

      {toast && (
        <div
          className="fixed bottom-4 end-4 z-[9999] px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-medium flex items-center gap-2"
          style={{
            background: toast.type === 'success' ? 'rgba(5,150,105,0.95)' : 'rgba(190,18,60,0.95)',
            border: `1px solid ${toast.type === 'success' ? '#059669' : '#be123c'}`,
          }}
        >
          {toast.type === 'success' ? <CheckCircle size={16} className="shrink-0" /> : <XCircle size={16} className="shrink-0" />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
