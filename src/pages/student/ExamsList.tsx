import { useState, useMemo, useEffect } from 'react';
import { examService, Exam } from '../../services/examService';
import ExamFilterBar from '../../features/student-exams/components/ExamFilterBar';
import ExamsGrid from '../../features/student-exams/components/ExamsGrid';
import { ExamFilterState } from '../../features/student-exams/types';
import { useTranslation } from 'react-i18next';

const getExamStatus = (exam: Exam): 'ongoing' | 'upcoming' | 'finished' => {
    if ((exam as any)._status) return (exam as any)._status;

    // Convert to UTC-based logic as required
    const now = Date.now();
    const start = exam.start_time ? new Date(exam.start_time).getTime() : 0;
    const duration = (exam.duration_minutes || 30) * 60000;

    if (start > now) return 'upcoming';
    if (now >= start && now <= start + duration) return 'ongoing';
    return 'finished';
};

export default function ExamsList() {
    const { t } = useTranslation('common');
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState<ExamFilterState>({
        status: 'all',
        searchQuery: ''
    });

    useEffect(() => {
        const fetchExams = async () => {
            try {
                // In future: Use course_enrollments to fetch exams scoped to the active student
                const data = await examService.getExams();
                setExams(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchExams();
    }, []);

    const filteredExams = useMemo(() => {
        return exams.filter(exam => {
            const computedStatus = getExamStatus(exam);

            if (filters.status !== 'all' && computedStatus !== filters.status) return false;
            if (filters.searchQuery && !exam.title.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;

            return true;
        });
    }, [filters, exams]);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 lg:space-y-8 font-arabic">
            <div className="glass-card rounded-3xl p-8 relative overflow-hidden border border-white/5 shadow-2xl">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-500/20 rounded-full blur-[80px] pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-3xl lg:text-4xl font-extrabold text-white font-arabic tracking-tight mb-2">{t('examsLibrary.title')}</h1>
                    <p className="text-gray-400 font-arabic text-lg max-w-xl">
                        {t('examsLibrary.subtitle')}
                    </p>
                </div>
            </div>

            <ExamFilterBar filters={filters} onChange={setFilters} />

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-64 glass-card rounded-3xl relative overflow-hidden border border-white/5">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent w-[200%] animate-[shimmer_2s_infinite] -translate-x-full" style={{ animationDelay: `${i * 0.15}s` }} />
                        </div>
                    ))}
                </div>
            ) : (
                <ExamsGrid exams={filteredExams} getExamStatus={getExamStatus} />
            )}
        </div>
    );
}
