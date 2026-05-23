import { Library, Plus } from 'lucide-react';
import { Course } from '../../types';
import { CourseCard } from './CourseCard';
import { useTranslation } from 'react-i18next';

interface CoursesGridProps {
    courses: Course[];
    isLoading: boolean;
    onEdit: (course: Course) => void;
    onDelete: (id: number) => void;
    onToggleVisibility: (id: number, currentVisibility: Course['visibility']) => void;
    onManageStudents?: (course: Course) => void;
    onManageContent?: (course: Course) => void;
    onViewStats?: (course: Course) => void;
    onCreateFirst?: () => void;
}

export function CoursesGrid({
    courses,
    isLoading,
    onEdit,
    onDelete,
    onToggleVisibility,
    onManageStudents,
    onManageContent,
    onViewStats,
    onCreateFirst,
}: CoursesGridProps) {
    const { t } = useTranslation('common');

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="animate-pulse bg-slate-900/40 border border-slate-800/60 rounded-2xl h-52"
                    />
                ))}
            </div>
        );
    }

    if (courses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-800 rounded-3xl mt-8">
                <Library className="w-14 h-14 text-slate-700 mb-4" strokeWidth={1.5} />
                <h3 className="text-lg font-semibold text-white mb-1">
                    {t('teacherCourses.noCoursesYet', 'No courses yet')}
                </h3>
                <p className="text-slate-500 text-sm mb-6 text-center max-w-xs block leading-relaxed">
                    {t('teacherCourses.noCoursesDesc', "You haven't created any courses. Get started by adding your first one.")}
                </p>
                {onCreateFirst && (
                    <button
                        onClick={onCreateFirst}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-700"
                    >
                        <Plus className="w-4 h-4" />
                        {t('teacherCourses.addFirstCourse', 'Add your first course')}
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {courses.map((course) => (
                <CourseCard
                    key={course.id}
                    course={course}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleVisibility={onToggleVisibility}
                    onManageStudents={onManageStudents}
                    onManageContent={onManageContent}
                    onViewStats={onViewStats}
                />
            ))}
        </div>
    );
}
