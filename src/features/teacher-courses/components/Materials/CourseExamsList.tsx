import { FileText, Clock, PlayCircle, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CourseExam } from '../../api/materialsApi';


interface CourseExamsListProps {
    exams: CourseExam[];
    isLoading: boolean;
}

export function CourseExamsList({ exams, isLoading }: CourseExamsListProps) {
    const { t } = useTranslation('common');
    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2].map((i) => (
                    <div key={i} className="h-20 bg-slate-800/50 animate-pulse rounded-xl" />
                ))}
            </div>
        );
    }

    if (exams.length === 0) {
        return (
            <div className="text-center py-10 px-4 border-2 border-dashed border-slate-800 rounded-2xl">
                <FileText className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                <h3 className="text-slate-300 font-medium">{t('teacherCourses.modals.examsList.noExams', 'No exams created yet')}</h3>
                <p className="text-slate-500 text-sm mt-1">{t('teacherCourses.modals.examsList.noExamsDesc', 'Navigate to the Exams module to create a new exam for this course.')}</p>
            </div>
        );
    }

    const getStatusBadge = (status: string | null) => {
        switch (status) {
            case 'upcoming':
                return <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider bg-sky-500/10 text-sky-400">{t('teacherCourses.modals.examsList.upcoming', 'Upcoming')}</span>;
            case 'ongoing':
                return <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider bg-amber-500/10 text-amber-400 flex items-center gap-1"><PlayCircle className="w-3 h-3" /> {t('teacherCourses.modals.examsList.live', 'Live')}</span>;
            case 'finished':
                return <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider bg-emerald-500/10 text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {t('teacherCourses.modals.examsList.finished', 'Finished')}</span>;
            default:
                return <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider bg-slate-500/10 text-slate-400">{t('teacherCourses.modals.examsList.draft', 'Draft')}</span>;
        }
    };

    return (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {exams.map((exam) => (
                <div
                    key={exam.id}
                    className="flex flex-col p-4 bg-slate-950/30 border border-slate-800/60 rounded-xl hover:border-slate-700 transition-colors"
                >
                    <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className="text-sm font-semibold text-slate-200 truncate">{exam.title}</h4>
                        <div className="shrink-0">{getStatusBadge(exam.status)}</div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400 mt-auto pt-2 border-t border-slate-800/50">
                        <div className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                            <span className="truncate max-w-[120px]">{exam.subject}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>{exam.duration_minutes}m</span>
                        </div>
                        {exam.total_questions && (
                            <div className="flex items-center gap-1.5">
                                <span className="text-slate-500 font-medium">Q:</span>
                                <span>{exam.total_questions}</span>
                            </div>
                        )}
                        {exam.total_marks && (
                            <div className="flex items-center gap-1.5">
                                <span className="text-slate-500 font-medium">Pts:</span>
                                <span>{exam.total_marks}</span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
