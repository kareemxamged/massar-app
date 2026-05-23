import { formatDistanceToNow } from 'date-fns';

interface RecentActivity {
  id: string;
  type: 'exam_created' | 'submission' | 'ai_generation' | 'material_added';
  title: string;
  subtitle: string;
  timestamp: string;
  icon: string;
}

interface ActivityFeedProps {
  activities: RecentActivity[];
}

const TYPE_STYLES: Record<string, { border: string; bg: string }> = {
  exam_created: { border: 'rgba(99,102,241,0.4)', bg: 'rgba(99,102,241,0.1)' },
  submission: { border: 'rgba(45,212,191,0.4)', bg: 'rgba(45,212,191,0.1)' },
  ai_generation: { border: 'rgba(139,92,246,0.4)', bg: 'rgba(139,92,246,0.1)' },
  material_added: { border: 'rgba(251,146,60,0.4)', bg: 'rgba(251,146,60,0.1)' },
};

import { useTranslation } from 'react-i18next';

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  const { t, i18n } = useTranslation('common');

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2" dir={i18n.dir()}>
        <p style={{ color: 'var(--text-muted)' }}>{t('teacherDashboard.noActivity', 'No recent activity')}</p>
        <p className="text-xs" style={{ color: 'rgba(148,163,184,0.6)' }}>
          {t('teacherDashboard.noActivitySub', 'Start by creating an exam or uploading materials')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2" dir={i18n.dir()}>
      {activities.map((activity) => {
        const style = TYPE_STYLES[activity.type] ?? TYPE_STYLES.exam_created;
        return (
          <div
            key={activity.id}
            className="flex items-center gap-3 p-3 rounded-lg transition-colors"
            style={{ background: style.bg, borderLeft: `3px solid ${style.border}` }}
          >
            <span className="text-lg shrink-0">{activity.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-main)' }}>
                {activity.title}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {activity.subtitle}
              </p>
            </div>
            <span className="text-xs shrink-0" style={{ color: 'rgba(148,163,184,0.6)' }}>
              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
            </span>
          </div>
        );
      })}
    </div>
  );
}
