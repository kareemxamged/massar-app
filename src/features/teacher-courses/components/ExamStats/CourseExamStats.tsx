import { useEffect } from 'react';
import { Users, FileText, BookOpen, TrendingUp, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCourseStats } from '../../hooks/useCourseStats';
import { format } from 'date-fns';

interface CourseExamStatsProps {
    courseId: number;
    courseTitle: string;
    onClose: () => void;
}

export function CourseExamStats({ courseId, courseTitle, onClose }: CourseExamStatsProps) {
    const { t, i18n } = useTranslation('common');
    const { stats, performance, isLoading, error, fetchStats } = useCourseStats(courseId);

    useEffect(() => {
        void fetchStats();
    }, [fetchStats]);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-24 bg-slate-800/50 animate-pulse rounded-xl" />
                        ))}
                    </div>
                    <div className="h-64 bg-slate-800/50 animate-pulse rounded-xl" />
                </div>
            );
        }

        if (error) {
            return (
                <div className="p-6 text-center text-rose-400">
                    <p>{error}</p>
                    <button onClick={() => fetchStats()} className="mt-4 px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-sm">
                        Try Again
                    </button>
                </div>
            );
        }

        return (
            <div className="p-6 space-y-8 animate-in fade-in duration-300">
                {/* Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 text-start">
                        <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 shrink-0">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400 font-medium">{t('teacherCourses.modals.stats.students', 'Students')}</p>
                            <p className="text-2xl font-bold text-white">{stats?.totalStudents || 0}</p>
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 text-start">
                        <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400 shrink-0">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400 font-medium">{t('teacherCourses.modals.stats.materials', 'Materials')}</p>
                            <p className="text-2xl font-bold text-white">{stats?.totalMaterials || 0}</p>
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 text-start">
                        <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 shrink-0">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400 font-medium">{t('teacherCourses.modals.stats.exams', 'Exams')}</p>
                            <p className="text-2xl font-bold text-white">{stats?.totalExams || 0}</p>
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 text-start">
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 shrink-0">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400 font-medium">{t('teacherCourses.modals.stats.avgScore', 'Avg. Score')}</p>
                            <p className="text-2xl font-bold text-white">
                                {stats?.averageScore !== undefined ? `${stats.averageScore}%` : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Results Table */}
                <section>
                    <h3 className="text-lg font-bold text-white mb-4 text-start">{t('teacherCourses.modals.stats.latestResults', 'Latest Exam Results')}</h3>
                    {performance.length === 0 ? (
                        <div className="text-center py-12 border border-slate-800 border-dashed rounded-2xl">
                            <p className="text-slate-500">{t('teacherCourses.modals.stats.noSubmissions', 'No exam submissions found for this course.')}</p>
                        </div>
                    ) : (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-start border-collapse" style={{ textAlign: 'start' }}>
                                    <thead>
                                        <tr className="bg-slate-950/50 border-b border-slate-800 text-xs uppercase tracking-wider font-semibold text-slate-400">
                                            <th className="px-6 py-4 text-start">{t('teacherCourses.modals.stats.student', 'Student')}</th>
                                            <th className="px-6 py-4 text-start">{t('teacherCourses.modals.stats.exam', 'Exam')}</th>
                                            <th className="px-6 py-4 text-center">{t('teacherCourses.modals.stats.score', 'Score')}</th>
                                            <th className="px-6 py-4 text-center">{t('teacherCourses.modals.stats.performance', 'Performance')}</th>
                                            <th className={`px-6 py-4 ${i18n.dir() === 'rtl' ? 'text-left' : 'text-right'}`}>{t('teacherCourses.modals.stats.submitted', 'Submitted')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60">
                                        {performance.map((perf, index) => {
                                            const percentage = (perf.score / perf.maxScore) * 100;
                                            let perfBadge = <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-xs">{t('teacherCourses.modals.stats.perfAverage', 'Average')}</span>;

                                            if (percentage >= 85) {
                                                perfBadge = <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-medium">{t('teacherCourses.modals.stats.perfHigh', 'High')}</span>;
                                            } else if (percentage < 60) {
                                                perfBadge = <span className="px-2 py-1 rounded bg-rose-500/10 text-rose-400 text-xs font-medium">{t('teacherCourses.modals.stats.perfLow', 'Low')}</span>;
                                            }

                                            return (
                                                <tr key={`${perf.examId}-${perf.studentId}-${index}`} className="hover:bg-slate-800/20 transition-colors">
                                                    <td className="px-6 py-4 text-sm font-medium text-white text-start">{perf.studentName}</td>
                                                    <td className="px-6 py-4 text-sm text-slate-300 text-start">{perf.examTitle}</td>
                                                    <td className="px-6 py-4 text-sm text-center">
                                                        <span className="font-mono text-slate-200">{perf.score}</span>
                                                        <span className="text-slate-500 text-xs"> / {perf.maxScore}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">{perfBadge}</td>
                                                    <td className={`px-6 py-4 text-sm ${i18n.dir() === 'rtl' ? 'text-left' : 'text-right'} text-slate-500 font-mono`} dir="ltr">
                                                        {format(new Date(perf.submittedAt), 'MMM d, HH:mm')}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex justify-center items-center py-6 px-4" dir={i18n.dir()} onClick={onClose}>
            <div
                className="w-full max-w-4xl bg-slate-950 border border-slate-800 shadow-2xl rounded-2xl flex flex-col max-h-full animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900 rounded-t-2xl shrink-0">
                    <div className="text-start">
                        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-indigo-400" />
                            {t('teacherCourses.modals.stats.title', 'Course Statistics')}
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">{courseTitle}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto custom-scrollbar">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}
