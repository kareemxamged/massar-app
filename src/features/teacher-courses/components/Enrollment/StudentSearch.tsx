import { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StudentProfile } from '../../api/enrollmentsApi';

interface StudentSearchProps {
    courseId: number;
    onSearch: (query: string, courseId: number) => Promise<void>;
    onSelect: (student: StudentProfile) => void;
    results: StudentProfile[];
    isSearching: boolean;
    onClear: () => void;
}

export function StudentSearch({
    courseId,
    onSearch,
    onSelect,
    results,
    isSearching,
    onClear,
}: StudentSearchProps) {
    const { t, i18n } = useTranslation('common');
    const [query, setQuery] = useState('');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            void onSearch(query, courseId);
        }, 350);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query, courseId, onSearch]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                onClear();
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [onClear]);

    const handleSelect = (student: StudentProfile) => {
        onSelect(student);
        setQuery('');
        onClear();
    };

    return (
        <div className="relative text-start" ref={wrapperRef}>
            <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('teacherCourses.modals.search.searchLabel', 'Search by name or student ID')}
            </label>
            <div className="relative">
                <div className={`absolute inset-y-0 ${i18n.dir() === 'rtl' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                    {isSearching ? (
                        <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
                    ) : (
                        <Search className="w-4 h-4 text-slate-500" />
                    )}
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t('teacherCourses.modals.search.searchPlaceholder', 'Search students...')}
                    className={`w-full bg-slate-950/50 border border-slate-800 rounded-xl ${i18n.dir() === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 text-slate-200 placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-start`}
                />
            </div>

            {/* Dropdown results */}
            {results.length > 0 && (
                <div className="absolute z-10 top-full mt-1 w-full bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
                    {results.map((student) => (
                        <button
                            key={student.id}
                            type="button"
                            onClick={() => handleSelect(student)}
                            className="w-full text-left px-4 py-3 hover:bg-slate-800 transition-colors flex items-center gap-3"
                        >
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm font-bold shrink-0">
                                {(student.full_name ?? '?').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1 text-start">
                                <div className="text-sm font-medium text-white truncate">
                                    {student.full_name ?? t('teacherCourses.modals.search.unnamedStudent', 'Unnamed Student')}
                                </div>
                                <div className="text-xs text-slate-500 truncate">
                                    {student.student_id ? `ID: ${student.student_id}` : student.email}
                                    {student.level ? ` · ${t('teacherCourses.modals.group.level', 'Level')} ${student.level}` : ''}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {query.length > 1 && results.length === 0 && !isSearching && (
                <div className="absolute z-10 top-full mt-1 w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
                    <p className="text-sm text-slate-500 text-start">{t('teacherCourses.modals.search.noStudentsFound', 'No students found matching')} "{query}"</p>
                </div>
            )}
        </div>
    );
}
