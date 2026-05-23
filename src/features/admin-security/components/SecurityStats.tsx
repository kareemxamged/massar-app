import { Activity, ShieldAlert, Trash2, UserCog } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SecurityStats as Stats } from '../types';

interface Props {
  stats: Stats | null;
  loading: boolean;
}

export default function SecurityStats({ stats, loading }: Props) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const cards = [
    {
      key: 'totalToday',
      label: isRtl ? 'إجمالي اليوم' : 'Total Today',
      value: stats?.totalLogsToday ?? 0,
      icon: <Activity size={20} />,
      color: '#6366f1',
      bg: 'rgba(99,102,241,0.12)',
    },
    {
      key: 'sensitive24h',
      label: isRtl ? 'حساسة (24س)' : 'Sensitive (24h)',
      value: stats?.sensitiveActionsLast24h ?? 0,
      icon: <ShieldAlert size={20} />,
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.12)',
    },
    {
      key: 'deletions24h',
      label: isRtl ? 'حذوفات (24س)' : 'Deletions (24h)',
      value: stats?.deletionsLast24h ?? 0,
      icon: <Trash2 size={20} />,
      color: '#fb7185',
      bg: 'rgba(251,113,133,0.12)',
    },
    {
      key: 'roleChanges24h',
      label: isRtl ? 'تغييرات أدوار' : 'Role Changes',
      value: stats?.roleChangesLast24h ?? 0,
      icon: <UserCog size={20} />,
      color: '#a78bfa',
      bg: 'rgba(167,139,250,0.12)',
    },
  ] as const;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
      {cards.map(card => (
        <div key={card.key} className="glass-card px-5 py-4 flex items-center gap-4">
          <div className="p-3 rounded-xl flex-shrink-0" style={{ background: card.bg }}>
            <span style={{ color: card.color }}>{card.icon}</span>
          </div>
          <div>
            {loading ? (
              <div className="h-7 w-10 rounded animate-pulse mb-1" style={{ background: 'rgba(255,255,255,0.1)' }} />
            ) : (
              <div className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</div>
            )}
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{card.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
