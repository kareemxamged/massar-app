import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserCircle, BarChart3, CheckCircle, XCircle } from 'lucide-react';
import { useAdminUsers } from '../../features/admin/api';
import type { AdminUser as UserProfile } from '../../features/admin/types';
import UserFilters from '../../features/admin/components/UserFilters';
import UserTable from '../../features/admin/components/UserTable';
import AddUserModal from '../../features/admin/components/AddUserModal';
import ConfirmModal from '../../features/admin/components/ConfirmModal';
import EditUserModal from '../../features/admin/components/EditUserModal';
import UserStats from '../../features/admin/components/UserStats';

export default function AdminTeachers() {
  const { t } = useTranslation('users');
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
    useAdminUsers({ role: 'teacher' });

  const activeCount = users.filter(u => u.status === 'active').length;
  const suspendedCount = users.filter(u => u.status === 'suspended').length;

  const handleEdit = (id: string) => {
    const user = users.find(u => u.id === id);
    if (user) setEditUser(user);
  };

  const handleStats = (id: string) => {
    const user = users.find(u => u.id === id);
    if (user) setStatsUser(user);
  };

  const handleConfirmAction = (type: 'suspend' | 'activate' | 'delete', userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const configs = {
      suspend:  { title: t('confirm.suspend.title'),  message: t('confirm.suspend.message',  { name: user.full_name }), confirmLabel: t('confirm.suspend.confirmLabel'),  actionType: 'warning' as const },
      activate: { title: t('confirm.activate.title'), message: t('confirm.activate.message', { name: user.full_name }), confirmLabel: t('confirm.activate.confirmLabel'), actionType: 'info'    as const },
      delete:   { title: t('confirm.delete.title'),   message: t('confirm.delete.message',   { name: user.full_name }), confirmLabel: t('confirm.delete.confirmLabel'),   actionType: 'danger'  as const },
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
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-12 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <div className="h-8 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <div className="h-96 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl" style={{ background: 'rgba(167,139,250,0.15)' }}>
            <UserCircle size={26} style={{ color: '#a78bfa' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>
              {t('teachers.title')}
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {t('teachers.subtitle')}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="glass-card px-4 py-2 flex items-center gap-2">
            <BarChart3 size={15} style={{ color: '#34d399' }} />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {t('stats.active')}: <strong style={{ color: '#34d399' }}>{activeCount}</strong>
            </span>
          </div>
          <div className="glass-card px-4 py-2 flex items-center gap-2">
            <BarChart3 size={15} style={{ color: '#fb7185' }} />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {t('stats.suspended')}: <strong style={{ color: '#fb7185' }}>{suspendedCount}</strong>
            </span>
          </div>
        </div>
      </div>

      <UserFilters
        search={filters.search || ''}
        role="teacher"
        status={filters.status || ''}
        onSearchChange={(v) => updateFilter('search', v || undefined)}
        onRoleChange={() => {}}
        onStatusChange={(v) => updateFilter('status', v || undefined)}
        onAddUser={() => setShowAddModal(true)}
      />

      <UserTable
        users={users}
        loading={loading}
        onEdit={handleEdit}
        onStats={handleStats}
        onConfirmAction={handleConfirmAction}
      />

      {confirmAction && (
        <ConfirmModal
          isOpen
          title={confirmAction.title}
          message={confirmAction.message}
          confirmText={confirmAction.confirmLabel}
          cancelText={t('confirm.cancel')}
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

      {statsUser && (
        <UserStats user={statsUser} onClose={() => setStatsUser(null)} />
      )}

      {showAddModal && (
        <AddUserModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          initialRole="teacher"
          onSuccess={() => { setShowAddModal(false); refresh(); }}
        />
      )}

      {/* Global Toast */}
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
