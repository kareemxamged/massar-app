import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, UserPlus, GraduationCap, ShieldAlert, Settings, BookOpen } from 'lucide-react';
import type { ContentStats } from '../types';

interface Action {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  accent: string;
  to: string;
  badge?: number;
}

interface Props {
  content: ContentStats;
}

export default function QuickActions({ content }: Props) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const navigate = useNavigate();

  const actions: Action[] = [
    {
      id: 'review',
      icon: <CheckCircle size={18} />,
      label: isRtl ? 'مراجعة المحتوى' : 'Review Content',
      description: isRtl ? 'اعتماد المقررات والاختبارات المعلَّقة' : 'Approve pending courses & exams',
      accent: '#fbbf24',
      to: '/admin/content',
      badge: content.courses_pending,
    },
    {
      id: 'students',
      icon: <GraduationCap size={18} />,
      label: isRtl ? 'إدارة الطلاب' : 'Manage Students',
      description: isRtl ? 'عرض وتعديل حسابات الطلاب' : 'View & edit student accounts',
      accent: '#818cf8',
      to: '/admin/students',
    },
    {
      id: 'teachers',
      icon: <UserPlus size={18} />,
      label: isRtl ? 'إدارة الأساتذة' : 'Manage Teachers',
      description: isRtl ? 'عرض وتعديل حسابات الأساتذة' : 'View & edit teacher accounts',
      accent: '#2dd4bf',
      to: '/admin/teachers',
    },
    {
      id: 'announce',
      icon: <BookOpen size={18} />,
      label: isRtl ? 'إضافة إعلان' : 'Add Announcement',
      description: isRtl ? 'بث رسالة عبر الموقع بالكامل' : 'Broadcast a site-wide message',
      accent: '#a78bfa',
      to: '/admin/settings',
    },
    {
      id: 'security',
      icon: <ShieldAlert size={18} />,
      label: isRtl ? 'سجلات الأمان' : 'Security Logs',
      description: isRtl ? 'مراجعة نشاط المسؤولين' : 'Audit admin activity',
      accent: '#fb7185',
      to: '/admin/security',
    },
    {
      id: 'settings',
      icon: <Settings size={18} />,
      label: isRtl ? 'إعدادات النظام' : 'System Settings',
      description: isRtl ? 'العلامة التجارية والصيانة والميزات' : 'Branding, maintenance & features',
      accent: '#34d399',
      to: '/admin/settings',
    },
  ];

  return (
    <div className="rounded-2xl p-5 flex flex-col gap-4"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>

      <div>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>{isRtl ? 'إجراءات سريعة' : 'Quick Actions'}</h3>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{isRtl ? 'المهام الإدارية الشائعة' : 'Common administrative tasks'}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3">
        {actions.map(action => (
          <button
            key={action.id}
            onClick={() => navigate(action.to)}
            className={`relative p-3.5 rounded-xl transition-all hover:scale-[1.03] active:scale-[0.98] group flex flex-col gap-2 ${isRtl ? 'text-right' : 'text-left'}`}
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {action.badge != null && action.badge > 0 && (
              <span
                className="absolute top-2 flex items-center justify-center text-xs font-bold w-5 h-5 rounded-full"
                style={{
                  background: '#fbbf24',
                  color: '#0f172a',
                  fontSize: '0.65rem',
                  [isRtl ? 'left' : 'right']: '0.5rem'
                }}
              >
                {action.badge > 9 ? '9+' : action.badge}
              </span>
            )}

            <div className="w-8 h-8 rounded-lg flex shrink-0 items-center justify-center transition-colors"
              style={{ background: `${action.accent}18`, color: action.accent }}>
              {action.icon}
            </div>

            <div>
              <p className="text-xs font-semibold leading-tight" style={{ color: 'var(--text-main)' }}>
                {action.label}
              </p>
              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {action.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
