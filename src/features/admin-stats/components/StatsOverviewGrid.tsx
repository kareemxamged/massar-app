import { useTranslation } from 'react-i18next';
import { GraduationCap, Users, BookOpen, FileText, TrendingUp, ShieldAlert, Clock } from 'lucide-react';
import type { UserStats, ContentStats } from '../types';

interface CardProps {
  id: string;
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub?: React.ReactNode;
  accent: string;
  loading?: boolean;
}

function StatCard({ icon, label, value, sub, accent, loading }: CardProps) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div
        className="absolute top-0 end-0 w-24 h-24 rounded-full pointer-events-none"
        style={{ background: `${accent}0d`, transform: `translate(${isRtl ? '-30%' : '30%'},-30%)` }}
      />
      <div className="flex items-center justify-between gap-3">
        <div className="p-2.5 rounded-xl shrink-0" style={{ background: `${accent}18` }}>
          <span style={{ color: accent }}>{icon}</span>
        </div>
        <div className="text-end">{sub}</div>
      </div>
      {loading ? (
        <div className="h-8 w-24 rounded-lg animate-pulse mt-2" style={{ background: 'rgba(255,255,255,0.07)' }} />
      ) : (
        <div className="mt-2">
          <p className="text-2xl font-bold tabular-nums" style={{ color: 'var(--text-main)' }}>{value}</p>
          <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--text-muted)' }}>{label}</p>
        </div>
      )}
    </div>
  );
}

interface Props {
  users: UserStats;
  content: ContentStats;
  loading: boolean;
}

export default function StatsOverviewGrid({ users, content, loading }: Props) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const completionRate =
    content.total_submissions > 0
      ? Math.round((content.completed_submissions / content.total_submissions) * 100)
      : 0;

  const cards: CardProps[] = [
    {
      id: 'students',
      icon: <GraduationCap size={20} />,
      label: isRtl ? 'إجمالي الطلاب' : 'Total Students',
      value: users.total_students,
      sub: (
        <span
          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
          style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}
        >
          <TrendingUp size={10} className="shrink-0" />
          {isRtl ? `+${users.new_users_week} هذا الأسبوع` : `+${users.new_users_week} this week`}
        </span>
      ),
      accent: '#818cf8',
    },
    {
      id: 'teachers',
      icon: <Users size={20} />,
      label: isRtl ? 'إجمالي الأساتذة' : 'Total Teachers',
      value: users.total_teachers,
      sub: (
        <span className="inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
          <Clock size={11} className="shrink-0" />
          {isRtl ? `+${users.new_users_month} / شهر` : `+${users.new_users_month} / month`}
        </span>
      ),
      accent: '#2dd4bf',
    },
    {
      id: 'courses',
      icon: <BookOpen size={20} />,
      label: isRtl ? 'المقررات المعتمدة' : 'Approved Courses',
      value: content.courses_approved,
      sub: content.courses_pending > 0 ? (
        <span
          className="inline-flex items-center text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap"
          style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)' }}
        >
          {isRtl ? `${content.courses_pending} قيد الانتظار` : `${content.courses_pending} pending`}
        </span>
      ) : undefined,
      accent: '#a78bfa',
    },
    {
      id: 'exams',
      icon: <FileText size={20} />,
      label: isRtl ? 'إجمالي الاختبارات' : 'Total Exams',
      value: content.total_exams,
      sub: (
        <span className="inline-flex text-xs font-medium whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
          {isRtl ? `${completionRate}% إنجاز` : `${completionRate}% completion`}
        </span>
      ),
      accent: '#fbbf24',
    },
    {
      id: 'enrollments',
      icon: <TrendingUp size={20} />,
      label: isRtl ? 'التسجيلات' : 'Enrollments',
      value: content.total_enrollments,
      accent: '#34d399',
    },
    {
      id: 'audit',
      icon: <ShieldAlert size={20} />,
      label: isRtl ? 'أحداث المراجعة (24 س)' : 'Audit Events (24 h)',
      value: content.audit_24h,
      accent: '#fb7185',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map(card => (
        <StatCard key={card.id} {...card} loading={loading} />
      ))}
    </div>
  );
}
