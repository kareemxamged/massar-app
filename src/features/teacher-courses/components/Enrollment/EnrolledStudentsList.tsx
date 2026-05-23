import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EnrolledStudent } from '../../api/enrollmentsApi';
import { format } from 'date-fns';
import { DeleteConfirmModal } from '../CourseList/DeleteConfirmModal';

interface EnrolledStudentsListProps {
    students: EnrolledStudent[];
    isLoading: boolean;
    onRemove: (enrollmentId: string) => Promise<void>;
}

export function EnrolledStudentsList({ students, isLoading, onRemove }: EnrolledStudentsListProps) {
    const { t } = useTranslation('common');
    const [enrollmentToDelete, setEnrollmentToDelete] = useState<EnrolledStudent | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirmDelete = async () => {
        if (!enrollmentToDelete) return;
        setIsDeleting(true);
        try {
            await onRemove(enrollmentToDelete.id);
        } finally {
            setIsDeleting(false);
            setEnrollmentToDelete(null);
        }
    };
    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-slate-800/50 animate-pulse rounded-xl" />
                ))}
            </div>
        );
    }

    if (students.length === 0) {
        return (
            <div className="text-center py-10 px-4 border-2 border-dashed border-slate-800 rounded-2xl">
                <UsersIcon className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                <h3 className="text-slate-300 font-medium">{t('teacherCourses.modals.enrolled.noStudents', 'No students enrolled')}</h3>
                <p className="text-slate-500 text-sm mt-1">
                    {t('teacherCourses.modals.enrolled.noStudentsDesc', 'Search for students above or enroll a group to get started.')}
                </p>
            </div>
        );
    }

    return (
        <>
            {enrollmentToDelete && (
                <DeleteConfirmModal
                    title={t('teacherCourses.modals.enrolled.removeStudent', 'Remove Student')}
                    itemName={enrollmentToDelete.profiles?.full_name ?? t('teacherCourses.modals.enrolled.unknownStudent', 'Unknown Student')}
                    isDeleting={isDeleting}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setEnrollmentToDelete(null)}
                />
            )}
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {students.map((enrollment) => {
                    const student = enrollment.profiles;
                    return (
                        <div
                            key={enrollment.id}
                            className="flex items-center justify-between p-3 bg-slate-950/30 border border-slate-800/60 rounded-xl hover:border-slate-700 transition-colors group"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-indigo-400 font-bold shrink-0">
                                    {student?.full_name?.charAt(0).toUpperCase() ?? '?'}
                                </div>
                                <div className="min-w-0 text-start flex-1">
                                    <div className="text-sm font-semibold text-slate-200 truncate">
                                        {student?.full_name ?? t('teacherCourses.modals.enrolled.unknownStudent', 'Unknown Student')}
                                        {enrollment.enrollment_type === 'group' && (
                                            <span className="mx-2 inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-400">
                                                {t('teacherCourses.modals.enrolled.groupBadge', 'Group')}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-slate-500 truncate flex items-center gap-2">
                                        <span>{student?.student_profiles?.student_code ?? student?.email}</span>
                                        {student?.student_profiles?.academic_levels?.name && <span>• Lvl {student.student_profiles.academic_levels.name}</span>}
                                        {enrollment.enrolled_at && (
                                            <span>• {format(new Date(enrollment.enrolled_at), 'MMM d, yyyy')}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setEnrollmentToDelete(enrollment)}
                                className="p-2 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                title="Remove student"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </>
    );
}

// Inline UsersIcon for empty state
function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}
