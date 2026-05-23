import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CourseManagementFilterBarProps {
    searchQuery: string;
    onSearchChange: (val: string) => void;
}

export function CourseManagementFilterBar({ searchQuery, onSearchChange }: CourseManagementFilterBarProps) {
    const { t, i18n } = useTranslation('common');
    const isRtl = i18n.dir() === 'rtl';

    return (
        <div className="relative w-full max-w-md mb-6 sm:mb-8" dir={i18n.dir()}>
            <div className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                <Search className="w-4 h-4 text-slate-500" />
            </div>
            <input
                type="text"
                placeholder={t('teacherCourses.searchPlaceholder', 'Search courses by title or code...')}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className={`bg-slate-900/50 border border-slate-800 rounded-xl py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-200 w-full transition-all placeholder-slate-600 
                ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
            />
        </div>
    );
}
