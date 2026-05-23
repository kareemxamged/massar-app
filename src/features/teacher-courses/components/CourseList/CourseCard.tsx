import { Eye, EyeOff, Trash2, Edit, BookOpen, Users, Calendar, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Course } from '../../types';
import { useTranslation } from 'react-i18next';

interface CourseCardProps {
    course: Course;
    onEdit: (course: Course) => void;
    onDelete: (id: number) => void;
    onToggleVisibility: (id: number, currentVisibility: Course['visibility']) => void;
    onManageStudents?: (course: Course) => void;
    onManageContent?: (course: Course) => void;
    onViewStats?: (course: Course) => void;
}

export function CourseCard({ course, onEdit, onDelete, onToggleVisibility, onManageStudents, onManageContent, onViewStats }: CourseCardProps) {
    const { t, i18n } = useTranslation('common');
    const isActive = course.visibility === 'active';
    const approvalStatus = course.approval_status ?? 'pending';
    const canToggleVisibility = approvalStatus === 'approved';

    const getApprovalBadge = (status: string) => {
        switch (status) {
            case 'approved': return { label: t('teacherCourses.status.approved', 'Approved'), icon: <CheckCircle className="w-3 h-3" />, bg: 'rgba(52,211,153,0.12)', color: '#34d399' };
            case 'rejected': return { label: t('teacherCourses.status.rejected', 'Rejected'), icon: <XCircle className="w-3 h-3" />, bg: 'rgba(251,113,133,0.12)', color: '#fb7185' };
            case 'pending':
            default: return { label: t('teacherCourses.status.pendingReview', 'Pending Review'), icon: <Clock className="w-3 h-3" />, bg: 'rgba(251,191,36,0.12)', color: '#fbbf24' };
        }
    };

    const approvalBadge = getApprovalBadge(approvalStatus);

    const createdDate = course.created_at
        ? new Date(course.created_at).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
        : '—';

    const visibilityTooltip = canToggleVisibility
        ? (isActive ? t('teacherCourses.hideCourse', 'Hide course') : t('teacherCourses.showCourse', 'Show course'))
        : approvalStatus === 'pending'
            ? t('teacherCourses.awaitingReviewDesc', 'Awaiting admin approval before publishing')
            : t('teacherCourses.rejectedDesc', 'Course rejected — contact admin');

    return (
        <div
            className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-2xl hover:border-slate-700 transition-colors flex flex-col gap-4 group"
            dir={i18n.dir()}
        >
            {/* Top Row: title + approval badge */}
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="font-semibold text-white text-base truncate leading-tight" title={course.title}>
                        {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-1 text-start">{course.code}</p>
                </div>

                <div className={`flex flex-col ${i18n.dir() === 'rtl' ? 'items-start' : 'items-end'} gap-1.5 flex-shrink-0`}>
                    {/* Approval status */}
                    <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: approvalBadge.bg, color: approvalBadge.color }}
                    >
                        {approvalBadge.icon}
                        {approvalBadge.label}
                    </span>
                    {/* Visibility (only meaningful once approved) */}
                    {approvalStatus === 'approved' && (
                        <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isActive
                                    ? 'bg-emerald-500/10 text-emerald-400'
                                    : course.visibility === 'disabled'
                                        ? 'bg-slate-500/10 text-slate-400'
                                        : 'bg-amber-500/10 text-amber-400'
                                }`}
                        >
                            {isActive ? t('teacherCourses.status.active', 'Active') : course.visibility === 'disabled' ? t('teacherCourses.status.disabled', 'Disabled') : t('teacherCourses.status.hidden', 'Hidden')}
                        </span>
                    )}
                </div>
            </div>

            {/* Rejection notes banner */}
            {approvalStatus === 'rejected' && course.review_notes && (
                <div
                    className="flex items-start gap-2 px-3 py-2 rounded-xl text-xs"
                    style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)', color: '#fb7185' }}
                >
                    <XCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span><strong>{t('teacherCourses.rejectionReason', 'Rejection reason:')}</strong> {course.review_notes}</span>
                </div>
            )}

            {/* Pending info banner */}
            {approvalStatus === 'pending' && (
                <div
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                    style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24' }}
                >
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                    {t('teacherCourses.awaitingReviewDesc', 'Awaiting admin review before this course can go live.')}
                </div>
            )}

            {/* Description */}
            <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed text-start">
                {course.description || t('teacherCourses.noDescription', 'No description provided.')}
            </p>

            {/* Stats Row */}
            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />{course.student_count ?? 0} {t('teacherCourses.students', 'Students')}
                </span>
                <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />{course.materials_count ?? 0} {t('teacherCourses.materials', 'Materials')}
                </span>
            </div>

            {/* Footer: date + actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 mt-auto">
                <span className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium tracking-wide" dir="ltr">
                    <Calendar className="w-3.5 h-3.5" />
                    {createdDate}
                </span>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onViewStats?.(course)}
                        title={t('teacherCourses.statsTooltip', 'Course Statistics')}
                        className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors flex-shrink-0"
                    >
                        <TrendingUp className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onManageContent?.(course)}
                        title={t('teacherCourses.contentTooltip', 'Course Content (Materials & Exams)')}
                        className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors flex-shrink-0"
                    >
                        <BookOpen className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onManageStudents?.(course)}
                        title={t('teacherCourses.studentsTooltip', 'Manage Students')}
                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors flex-shrink-0"
                    >
                        <Users className="w-4 h-4" />
                    </button>

                    <div className="w-px h-4 bg-slate-800 mx-1"></div>

                    <button
                        onClick={() => canToggleVisibility && onToggleVisibility(course.id, course.visibility)}
                        title={visibilityTooltip}
                        disabled={!canToggleVisibility}
                        className={`p-1.5 rounded-lg transition-colors ${!canToggleVisibility
                                ? 'opacity-30 cursor-not-allowed text-slate-600'
                                : isActive
                                    ? 'text-emerald-400 hover:bg-emerald-500/10'
                                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800'
                            }`}
                    >
                        {isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <button
                        onClick={() => onEdit(course)}
                        title={t('teacherCourses.editTooltip', 'Edit course settings')}
                        className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                    >
                        <Edit className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() => onDelete(course.id)}
                        title={t('teacherCourses.deleteTooltip', 'Delete course')}
                        className={`p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors ${i18n.dir() === 'rtl' ? 'mr-1' : 'ml-1'}`}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
