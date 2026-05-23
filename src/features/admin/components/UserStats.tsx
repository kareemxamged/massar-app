import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, BookOpen, GraduationCap, ClipboardList, Calendar } from 'lucide-react';
import Portal from '../../../components/Portal';
import { getSupabaseClient } from '../../../services/supabase';
import { adminApi } from '../api/adminApi';
import type { AdminUser } from '../types';

interface Props {
  user: AdminUser;
  onClose?: () => void;
}

interface Stats {
  coursesCount: number;
  examsCount: number;
  lastLogin: string | null;
  memberSince: string;
}

export default function UserStats({ user, onClose }: Props) {
  const { t, i18n } = useTranslation('users');
  const dateLocale = i18n.language.startsWith('ar') ? 'ar-SA' : 'en-US';
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();
    async function fetchStats() {
      setLoading(true);
      try {
        let coursesCount = 0;
        let examsCount = 0;

        if (user.role === 'student') {
          const { count: enroll } = await supabase
            .from('enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', user.id);
          coursesCount = enroll ?? 0;

          const { count: exams } = await supabase
            .from('submissions')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', user.id);
          examsCount = exams ?? 0;
        } else if (user.role === 'teacher') {
          const { count: courses } = await supabase
            .from('courses')
            .select('*', { count: 'exact', head: true })
            .eq('teacher_id', user.id);
          coursesCount = courses ?? 0;

          const { count: exams } = await supabase
            .from('exams')
            .select('*', { count: 'exact', head: true })
            .eq('teacher_id', user.id);
          examsCount = exams ?? 0;
        }

        const authInfo = await adminApi.getUserAuthInfo(user.id);

        setStats({
          coursesCount,
          examsCount,
          lastLogin: authInfo.last_sign_in_at ?? null,
          memberSince: user.created_at,
        });
      } catch {
        setStats({ coursesCount: 0, examsCount: 0, lastLogin: null, memberSince: user.created_at });
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [user]);

  if (!user) return null;

  const statusMap: Record<string, string> = {
    active: t('status.active'),
    suspended: t('status.suspended'),
    inactive: t('status.inactive'),
  };

  const fmt = (dateStr: string | null) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString(dateLocale, { year: 'numeric', month: 'long', day: 'numeric' })
      : t('statsModal.never');

  return (
    <Portal>
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.65)', zIndex: 400 }}>
        <div className="glass-card w-full max-w-md shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>{t('statsModal.title')}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* User Info */}
            <div className="flex items-center gap-4">
              <img
                src={
                  user.avatar_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=6366f1&color=fff&size=80`
                }
                alt={user.full_name}
                className="h-14 w-14 rounded-full object-cover ring-2 ring-white/10"
              />
              <div>
                <h3 className="font-semibold" style={{ color: 'var(--text-main)' }}>{user.full_name}</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                <span
                  className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full"
                  style={{
                    background: user.status === 'active' ? 'rgba(52,211,153,0.15)' : 'rgba(251,113,133,0.15)',
                    color: user.status === 'active' ? '#34d399' : '#fb7185',
                  }}
                >
                  {statusMap[user.status] ?? user.status}
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            {loading ? (
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="rounded-xl p-4 animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="h-8 bg-white/10 rounded mb-2" />
                    <div className="h-3 bg-white/10 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  icon={<BookOpen size={18} />}
                  value={String(stats?.coursesCount ?? 0)}
                  label={user.role === 'teacher' ? t('statsModal.coursesCreated') : t('statsModal.enrolledCourses')}
                  color="#6366f1"
                />
                <StatCard
                  icon={<ClipboardList size={18} />}
                  value={String(stats?.examsCount ?? 0)}
                  label={user.role === 'teacher' ? t('statsModal.examsCreated') : t('statsModal.examsTaken')}
                  color="#2dd4bf"
                />
                <StatCard
                  icon={<Calendar size={18} />}
                  value={fmt(stats?.memberSince ?? null)}
                  label={t('statsModal.memberSince')}
                  color="#a78bfa"
                  small
                />
                <StatCard
                  icon={<GraduationCap size={18} />}
                  value={fmt(stats?.lastLogin ?? null)}
                  label={t('statsModal.lastLogin')}
                  color="#f59e0b"
                  small
                />
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-white/10"
                style={{ color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {t('statsModal.close')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}

function StatCard({
  icon,
  value,
  label,
  color,
  small = false,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
  small?: boolean;
}) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center gap-2 mb-2" style={{ color }}>
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className={`font-bold ${small ? 'text-sm' : 'text-2xl'}`} style={{ color: 'var(--text-main)' }}>
        {value}
      </div>
    </div>
  );
}
