import { Search } from 'lucide-react';
import { ExamFilterState, ExamStatus } from '../types';
import { useTranslation } from 'react-i18next';

interface Props {
    filters: ExamFilterState;
    onChange: (filters: ExamFilterState) => void;
}

export default function ExamFilterBar({ filters, onChange }: Props) {
    const { t, i18n } = useTranslation('common');
    const statuses: { id: ExamStatus; label: string }[] = [
        { id: 'all', label: t('examsLibrary.filterStatuses.all') },
        { id: 'ongoing', label: t('examsLibrary.filterStatuses.ongoing') },
        { id: 'upcoming', label: t('examsLibrary.filterStatuses.upcoming') },
        { id: 'finished', label: t('examsLibrary.filterStatuses.finished') },
    ];

    return (
        <div className="glass-card rounded-3xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 border border-white/5 font-arabic">
            {/* Search Input */}
            <div className="relative w-full md:w-96 group">
                <div className={`absolute inset-y-0 ${i18n.dir() === 'rtl' ? 'right-0 pe-4' : 'left-0 ps-4'} flex items-center pointer-events-none z-10`}>
                    <Search className="h-5 w-5 text-gray-500 group-focus-within:text-primary-400 transition-colors" />
                </div>
                <input
                    type="text"
                    placeholder={t('examsLibrary.searchPlaceholder')}
                    value={filters.searchQuery}
                    onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
                    className={`w-full bg-white/5 border border-white/10 rounded-2xl py-3 ${i18n.dir() === 'rtl' ? 'pe-12 ps-4' : 'ps-12 pe-4'} text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-medium relative z-0`}
                />
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 w-full md:w-auto overflow-x-auto no-scrollbar">
                {statuses.map((status) => (
                    <button
                        key={status.id}
                        onClick={() => onChange({ ...filters, status: status.id })}
                        className={`
                            shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 relative overflow-hidden
                            ${filters.status === status.id
                                ? 'text-white shadow-lg'
                                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}
                        `}
                    >
                        {filters.status === status.id && (
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-indigo-600 opacity-90" />
                        )}
                        <span className="relative z-10">{status.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
