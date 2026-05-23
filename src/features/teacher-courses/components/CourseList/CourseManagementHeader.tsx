import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CourseManagementHeaderProps {
    onCreateNew: () => void;
}

export function CourseManagementHeader({ onCreateNew }: CourseManagementHeaderProps) {
    const { t, i18n } = useTranslation('common');

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8" dir={i18n.dir()}>
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                    {t('teacherCourses.title', 'Course Management')}
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                    {t('teacherCourses.subtitle', 'Create and manage your educational courses')}
                </p>
            </div>

            <button
                onClick={onCreateNew}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg shadow-indigo-500/20 w-full sm:w-auto justify-center"
            >
                <Plus className="w-4 h-4" />
                {t('teacherCourses.createCourse', 'Create New Course')}
            </button>
        </div>
    );
}
