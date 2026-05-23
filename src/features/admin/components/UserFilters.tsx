import { useTranslation } from 'react-i18next';
import { Search, UserPlus } from 'lucide-react';

interface Props {
  search: string;
  role: string;
  status: string;
  onSearchChange: (v: string) => void;
  onRoleChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onAddUser: () => void;
}

export default function UserFilters({ search, role: _role, status, onSearchChange, onRoleChange: _onRoleChange, onStatusChange, onAddUser }: Props) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-6">
      <div className="relative flex-1 min-w-[200px]">
        <Search size={18} className="absolute start-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder={isRtl ? 'البحث عن مستخدمين...' : 'Search users...'}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full ps-10 pe-4 py-2 rounded-lg"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'var(--text-main)'
          }}
        />
      </div>

      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="pe-8"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          color: 'white',
          padding: '8px 14px',
          outline: 'none',
          cursor: 'pointer',
          fontSize: '0.875rem',
        }}
      >
        <option value="" style={{ background: '#1e293b', color: 'white' }}>{isRtl ? 'جميع الحالات' : 'All Statuses'}</option>
        <option value="active" style={{ background: '#1e293b', color: 'white' }}>{isRtl ? 'نشط' : 'Active'}</option>
        <option value="suspended" style={{ background: '#1e293b', color: 'white' }}>{isRtl ? 'موقوف' : 'Suspended'}</option>
      </select>

      <button onClick={onAddUser} className="btn-primary flex items-center justify-center gap-2">
        <UserPlus size={18} /> {isRtl ? 'إضافة مستخدم' : 'Add User'}
      </button>
    </div>
  );
}
