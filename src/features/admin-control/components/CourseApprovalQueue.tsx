import { useTranslation } from 'react-i18next';
import { FileSearch, CheckCircle, XCircle, Clock, BookOpen, GraduationCap, ChevronDown, UserCheck } from 'lucide-react';
import type { CourseForReview, CourseApprovalStatus } from '../types';

interface Props {
  courses: CourseForReview[];
  loading: boolean;
  filter: CourseApprovalStatus | undefined;
  onFilterChange: (f: CourseApprovalStatus | undefined) => void;
  onReview: (course: CourseForReview) => void;
}

export default function CourseApprovalQueue({ courses, loading, filter, onFilterChange, onReview }: Props) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const dateLocale = isRtl ? 'ar-SA' : 'en-US';

  const STATUS_BADGE: Record<CourseApprovalStatus, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
    pending: { label: isRtl ? 'بانتظار المراجعة' : 'Pending', bg: 'rgba(251,191,36,0.15)', color: '#fbbf24', icon: <Clock size={12} /> },
    approved: { label: isRtl ? 'مقبول' : 'Approved', bg: 'rgba(52,211,153,0.15)', color: '#34d399', icon: <CheckCircle size={12} /> },
    rejected: { label: isRtl ? 'مرفوض' : 'Rejected', bg: 'rgba(251,113,133,0.15)', color: '#fb7185', icon: <XCircle size={12} /> },
  };

  const pendingCount = courses.filter(c => c.approval_status === 'pending').length;
  const approvedCount = courses.filter(c => c.approval_status === 'approved').length;
  const rejectedCount = courses.filter(c => c.approval_status === 'rejected').length;

  const stats = [
    { label: isRtl ? 'بانتظار المراجعة' : 'Pending Review', value: pendingCount, color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', icon: <Clock size={16} /> },
    { label: isRtl ? 'موافقة' : 'Approved', value: approvedCount, color: '#34d399', bg: 'rgba(52,211,153,0.12)', icon: <CheckCircle size={16} /> },
    { label: isRtl ? 'مرفوض' : 'Rejected', value: rejectedCount, color: '#fb7185', bg: 'rgba(251,113,133,0.12)', icon: <XCircle size={16} /> },
  ];

  const headers = [
    isRtl ? 'الدورة' : 'Course',
    isRtl ? 'المعلم' : 'Teacher',
    isRtl ? 'المحتوى' : 'Content',
    isRtl ? 'تاريخ التقديم' : 'Submitted',
    isRtl ? 'الحالة' : 'Status',
    isRtl ? 'تمت المراجعة من' : 'Reviewed By',
    '',
  ];

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {stats.map(s => (
          <div key={s.label} className="glass-card px-4 py-3 flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div>
              <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter + Table */}
      <div className="glass-card overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>
            {isRtl ? `طلب المراجعة (${courses.length})` : `Course Queue (${courses.length})`}
          </h3>
          <div className="relative">
            <select
              value={filter ?? ''}
              onChange={e => onFilterChange((e.target.value as CourseApprovalStatus) || undefined)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                color: 'var(--text-main)',
                padding: '6px 32px 6px 12px',
                fontSize: 13,
                appearance: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="" style={{ background: '#1e293b' }}>{isRtl ? 'جميع الحالات' : 'All Statuses'}</option>
              <option value="pending" style={{ background: '#1e293b' }}>{isRtl ? 'بانتظار المراجعة' : 'Pending'}</option>
              <option value="approved" style={{ background: '#1e293b' }}>{isRtl ? 'موافقة' : 'Approved'}</option>
              <option value="rejected" style={{ background: '#1e293b' }}>{isRtl ? 'مرفوض' : 'Rejected'}</option>
            </select>
            <ChevronDown size={14} className="absolute top-1/2 -translate-y-1/2 end-3 pointer-events-none text-gray-400" />
          </div>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/10 rounded w-1/3" />
                  <div className="h-3 bg-white/10 rounded w-1/4" />
                </div>
                <div className="h-6 w-20 bg-white/10 rounded-full" />
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="py-14 text-center">
            <FileSearch size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 10px' }} />
            <p style={{ color: 'var(--text-muted)' }}>{isRtl ? 'لا توجد دورات لمراجعتها' : 'No courses to review'}</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto border border-white/10 rounded-lg m-4 w-[calc(100%-2rem)]">
            <table className="min-w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {headers.map((h, i) => (
                    <th key={i} className={`px-5 py-3 ${i === headers.length - 1 ? 'text-end' : 'text-start'} whitespace-nowrap text-xs font-semibold uppercase tracking-wider`} style={{ color: 'var(--text-muted)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {courses.map((course, idx) => {
                  const badge = STATUS_BADGE[course.approval_status];
                  return (
                    <tr
                      key={course.id}
                      style={{ borderBottom: idx < courses.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
                      className="hover:bg-white/5"
                    >
                      {/* Course */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg shrink-0" style={{ background: 'rgba(99,102,241,0.15)' }}>
                            <BookOpen size={16} style={{ color: '#6366f1' }} />
                          </div>
                          <div>
                            <div className="font-medium text-sm" style={{ color: 'var(--text-main)' }}>{course.title}</div>
                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{course.code}</div>
                          </div>
                        </div>
                      </td>

                      {/* Teacher */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <GraduationCap size={14} style={{ color: '#a78bfa' }} className="shrink-0" />
                          <div>
                            <div className="text-sm" style={{ color: 'var(--text-main)' }}>{course.teacher?.full_name ?? '—'}</div>
                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{course.teacher?.email ?? ''}</div>
                          </div>
                        </div>
                      </td>

                      {/* Content counts */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="text-xs space-y-1" style={{ color: 'var(--text-muted)' }}>
                          <div>{isRtl ? `${course.materials_count} مواد` : `${course.materials_count} materials`}</div>
                          <div>{isRtl ? `${course.exams_count} امتحانات` : `${course.exams_count} exams`}</div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-sm whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                        {new Date(course.created_at).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>

                      {/* Status badge */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{ background: badge.bg, color: badge.color }}
                        >
                          {badge.icon}
                          {badge.label}
                        </span>
                      </td>

                      {/* Reviewer */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {course.reviewer ? (
                          <div className="flex items-center gap-1.5">
                            <UserCheck size={12} style={{ color: course.approval_status === 'approved' ? '#34d399' : '#fb7185', flexShrink: 0 }} />
                            <div>
                              <div className="text-xs font-medium" style={{ color: 'var(--text-main)' }}>{course.reviewer.full_name ?? course.reviewer.email}</div>
                              {course.reviewed_at && <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(course.reviewed_at).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric' })}</div>}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-end whitespace-nowrap">
                        <button
                          onClick={() => onReview(course)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                          style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.3)' }}
                        >
                          <FileSearch size={13} />
                          {isRtl ? 'مراجعة' : 'Review'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
