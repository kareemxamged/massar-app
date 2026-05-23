import { Users, GraduationCap, UserCircle, Loader2 } from 'lucide-react';
import UserStatusBadge from './UserStatusBadge';
import UserActions from './UserActions';
import type { UserProfile } from '../../../types';

interface Props {
  users: UserProfile[];
  loading: boolean;
  onEdit: (id: string) => void;
  onStats: (id: string) => void;
  onConfirmAction: (action: 'suspend' | 'activate' | 'delete', userId: string) => void;
}

const RoleIcon = ({ role }: { role: string }) => {
  if (role === 'student') return <GraduationCap size={16} style={{ color: '#38bdf8' }} />;
  if (role === 'teacher') return <UserCircle size={16} style={{ color: '#a78bfa' }} />;
  return <Users size={16} style={{ color: '#fb923c' }} />;
};

export default function UserTable({ users, loading, onEdit, onStats, onConfirmAction }: Props) {
  if (loading) return (
    <div className="glass-card p-8 text-center">
      <Loader2 size={32} className="animate-spin mx-auto mb-4" style={{ color: 'var(--primary)' }} />
      <p style={{ color: 'var(--text-muted)' }}>Loading users...</p>
    </div>
  );

  if (users.length === 0) return (
    <div className="glass-card p-12 text-center">
      <Users size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
      <p style={{ color: 'var(--text-muted)' }}>No users found</p>
      <p className="text-sm mt-2" style={{ color: 'rgba(148,163,184,0.6)' }}>
        Try adjusting your filters or add new users
      </p>
    </div>
  );

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead style={{ background: 'rgba(255,255,255,0.03)' }}>
            <tr>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>User</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Role</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Status</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Joined</th>
              <th className="text-right p-4 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ background: 'rgba(99,102,241,0.2)', color: 'var(--primary)' }}
                    >
                      {user.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-main)' }}>
                        {user.full_name || 'Unnamed User'}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <RoleIcon role={user.role} />
                    <span className="capitalize" style={{ color: 'var(--text-main)' }}>
                      {user.role}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <UserStatusBadge status={user.status || 'active'} />
                </td>
                <td className="p-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  <UserActions
                    userId={user.id}
                    status={user.status || 'active'}
                    onEdit={onEdit}
                    onStats={onStats}
                    onConfirmAction={onConfirmAction}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
