import { useTranslation } from 'react-i18next';
import type { ActivityEntry } from '../types';

const ACTION_COLOR: Record<string, { bg: string; color: string }> = {
  login: { bg: 'rgba(99,102,241,0.12)', color: '#818cf8' },
  logout: { bg: 'rgba(99,102,241,0.12)', color: '#818cf8' },
  create_course: { bg: 'rgba(52,211,153,0.12)', color: '#34d399' },
  update_course: { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa' },
  delete_course: { bg: 'rgba(239,68,68,0.12)', color: '#f87171' },
  approve_course: { bg: 'rgba(45,212,191,0.12)', color: '#2dd4bf' },
  reject_course: { bg: 'rgba(251,146,60,0.12)', color: '#fb923c' },
  create_exam: { bg: 'rgba(52,211,153,0.12)', color: '#34d399' },
  approve_exam: { bg: 'rgba(45,212,191,0.12)', color: '#2dd4bf' },
  reject_exam: { bg: 'rgba(251,146,60,0.12)', color: '#fb923c' },
  create_material: { bg: 'rgba(52,211,153,0.12)', color: '#34d399' },
  approve_material: { bg: 'rgba(45,212,191,0.12)', color: '#2dd4bf' },
  reject_material: { bg: 'rgba(251,146,60,0.12)', color: '#fb923c' },
  create_user: { bg: 'rgba(167,139,250,0.12)', color: '#a78bfa' },
  update_user: { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa' },
  delete_user: { bg: 'rgba(239,68,68,0.12)', color: '#f87171' },
  suspend_user: { bg: 'rgba(251,113,133,0.12)', color: '#fb7185' },
  update_settings: { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24' },
  enroll_student: { bg: 'rgba(52,211,153,0.12)', color: '#34d399' },
  unenroll_student: { bg: 'rgba(239,68,68,0.12)', color: '#f87171' },
};

const ACTIONS_MAP: Record<string, { ar: string; en: string }> = {
  login: { ar: 'دخول', en: 'Login' },
  logout: { ar: 'خروج', en: 'Logout' },
  create_course: { ar: 'أُنشئ', en: 'Created' },
  update_course: { ar: 'حُدِّث', en: 'Updated' },
  delete_course: { ar: 'حُذف', en: 'Deleted' },
  approve_course: { ar: 'اعتُمد', en: 'Approved' },
  reject_course: { ar: 'رُفض', en: 'Rejected' },
  create_exam: { ar: 'أُنشئ', en: 'Created' },
  approve_exam: { ar: 'اعتُمد', en: 'Approved' },
  reject_exam: { ar: 'رُفض', en: 'Rejected' },
  create_material: { ar: 'أُنشئ', en: 'Created' },
  approve_material: { ar: 'اعتُمد', en: 'Approved' },
  reject_material: { ar: 'رُفض', en: 'Rejected' },
  create_user: { ar: 'أُنشئ', en: 'Created' },
  update_user: { ar: 'حُدِّث', en: 'Updated' },
  delete_user: { ar: 'حُذف', en: 'Deleted' },
  suspend_user: { ar: 'مُوقَّف', en: 'Suspended' },
  update_settings: { ar: 'الإعدادات', en: 'Settings' },
  enroll_student: { ar: 'سُجِّل', en: 'Enrolled' },
  unenroll_student: { ar: 'أُلغي', en: 'Removed' },
};

const ENTITIES_MAP: Record<string, { ar: string; en: string }> = {
  profiles: { ar: 'الملفات الشخصية', en: 'Profiles' },
  courses: { ar: 'المقررات', en: 'Courses' },
  exams: { ar: 'الاختبارات', en: 'Exams' },
  auth: { ar: 'المصادقة', en: 'Auth' },
  users: { ar: 'المستخدمون', en: 'Users' },
  materials: { ar: 'المرفقات', en: 'Materials' },
  course_materials: { ar: 'مواد المقرر', en: 'Course Materials' },
  enrollments: { ar: 'التسجيلات', en: 'Enrollments' },
  submissions: { ar: 'التسليمات', en: 'Submissions' },
  settings: { ar: 'الإعدادات', en: 'Settings' },
  announcements: { ar: 'الإعلانات', en: 'Announcements' }
};

const DEFAULT_COLOR = { bg: 'rgba(255,255,255,0.06)', color: '#94a3b8' };

function timeAgo(iso: string, isRtl: boolean): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return isRtl ? 'الآن' : 'just now';
  if (m < 60) return isRtl ? `منذ ${m} د` : `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return isRtl ? `منذ ${h} س` : `${h}h ago`;
  const d = Math.floor(h / 24);
  return isRtl ? `منذ ${d} ي` : `${d}d ago`;
}

function entityLabel(e: string, isRtl: boolean): string {
  if (ENTITIES_MAP[e]) {
    return isRtl ? ENTITIES_MAP[e].ar : ENTITIES_MAP[e].en;
  }
  return e.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

interface Props {
  entries: ActivityEntry[];
  loading: boolean;
}

export default function RecentActivityFeed({ entries, loading }: Props) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  return (
    <div className="rounded-2xl p-5 flex flex-col gap-4 h-full"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>

      <div>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>{isRtl ? 'النشاط الأخير' : 'Recent Activity'}</h3>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{isRtl ? 'آخر 10 أحداث في النظام' : 'Last 10 system events'}</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-2 py-8">
          <span style={{ fontSize: '1.5rem' }}>📋</span>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{isRtl ? 'لم يتم تسجيل أي نشاط حتى الآن' : 'No activity recorded yet'}</p>
        </div>
      ) : (
        <div className="space-y-2 flex-1 overflow-y-auto">
          {entries.map(entry => {
            const colors = ACTION_COLOR[entry.action_type] ?? DEFAULT_COLOR;
            const mappedAction = ACTIONS_MAP[entry.action_type];
            const label = mappedAction ? (isRtl ? mappedAction.ar : mappedAction.en) : (isRtl ? 'إجراء' : 'Action');
            return (
              <div key={entry.id} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-white/5"
                style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: colors.bg, color: colors.color, minWidth: '58px', textAlign: 'center' }}>
                    {label}
                  </span>
                  <span className="text-xs truncate max-w-[120px] sm:max-w-[200px]" style={{ color: 'var(--text-main)' }}>
                    {entityLabel(entry.entity_affected, isRtl)}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {entry.admin_name && (
                    <span className="text-xs hidden sm:block truncate max-w-[100px]" style={{ color: 'var(--text-muted)' }}>
                      {entry.admin_name.split(' ').slice(0, 2).join(' ')}
                    </span>
                  )}
                  <span className="text-xs tabular-nums" style={{ color: 'var(--text-muted)', minWidth: '52px', textAlign: isRtl ? 'left' : 'right' }}>
                    {timeAgo(entry.created_at, isRtl)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
